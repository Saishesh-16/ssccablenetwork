/**
 * Progressive Web App (PWA) Setup
 * FIXED: Reliable service worker updates on mobile
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration.scope);

      // 🔴 Force update check every page load
      registration.update();

      // If a new SW is already waiting, activate it
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Listen for new SW installation
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // 🔴 Auto reload when new version is ready
            window.location.reload();
          }
        });
      });

      // Reload when new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

/* ================= INSTALL PROMPT ================= */

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📲 App can be installed');
});

window.installApp = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
};

/* ================= INSTALL STATUS ================= */

window.isAppInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  );
};

if (window.isAppInstalled()) {
  console.log('📱 App is running as installed PWA');
}
