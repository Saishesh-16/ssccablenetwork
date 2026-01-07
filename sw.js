/**
 * Service Worker for SSC Bethigal Cable Network
 * FINAL FIX: No HTML caching (Tailwind CDN safe)
 */

const CACHE_VERSION = 'v4'; // 🔴 bump when assets change
const ASSET_CACHE = `ssc-assets-${CACHE_VERSION}`;

/* ================= ASSETS ONLY (NO HTML) ================= */

const ASSETS = [
  // CSS
  '/css/mobile.css',
  '/css/style.css',

  // JS
  '/js/api.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/login.js',
  '/js/mobile.js',
  '/js/reports.js',
  '/js/search.js',
  '/js/add-customer.js',

  // Images
  '/assets/logo.svg'
];

/* ================= INSTALL ================= */

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(ASSET_CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

/* ================= ACTIVATE ================= */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== ASSET_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* ================= MESSAGE ================= */

self.addEventListener('message', (event) => {
  if (event && event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ================= FETCH ================= */

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only GET
  if (request.method !== 'GET') return;

  // ❌ Never cache HTML
  if (request.mode === 'navigate') {
    return;
  }

  // ❌ Never cache API
  if (request.url.includes('/api/')) {
    return;
  }

  // ❌ Never cache external CDN (Tailwind, Fonts, FA)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // ✅ Network-first for same-origin assets
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

/* ================= SKIP WAITING ================= */

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
