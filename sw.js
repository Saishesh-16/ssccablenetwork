/**
 * Service Worker for SSC Bethigal Cable Network
 * FIXED: No stale cache, mobile updates work correctly
 */

const CACHE_VERSION = 'v3'; // 🔴 change this when UI changes
const STATIC_CACHE = `ssc-bethigal-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ssc-bethigal-runtime-${CACHE_VERSION}`;

/* ================= STATIC ASSETS (LOCAL ONLY) ================= */

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/search.html',
  '/add-customer.html',
  '/reports.html',

  // CSS (LOCAL)
  '/css/mobile.css',
  '/css/style.css',

  // JS (LOCAL)
  '/js/api.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/login.js',
  '/js/mobile.js',
  '/js/reports.js',
  '/js/search.js',
  '/js/add-customer.js',

  // Images / assets
  '/assets/logo.svg'
];

/* ================= INSTALL ================= */

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

/* ================= ACTIVATE ================= */

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

/* ================= FETCH ================= */

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only GET requests
  if (request.method !== 'GET') return;

  // 🚫 NEVER cache API calls
  if (request.url.includes('/api/')) return;

  // 🚫 NEVER cache external CDN (Tailwind, FontAwesome, Google Fonts)
  if (!request.url.startsWith(self.location.origin)) return;

  // 🔴 HTML pages → Network First (prevents stale UI)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // CSS / JS / Images → Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;

        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, copy);
        });

        return response;
      });
    })
  );
});

/* ================= SKIP WAITING SUPPORT ================= */

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting received');
    self.skipWaiting();
  }
});
