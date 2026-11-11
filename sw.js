/* Service Worker — Сборка мотора PRO */
const CACHE = 'engine-pro-v3';
const ASSETS = [
  './',
  './engine-game.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './engine_low_22k.wav',
  './engine_loop_22k.wav',
  './engine_high_22k.wav',
  './samples/engine_low_22k.wav',
  './samples/engine_loop_22k.wav',
  './samples/engine_high_22k.wav',
  './samples/engine_loop_low.wav',
  './samples/engine_loop_mid.wav',
  './samples/engine_loop_high.wav'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok && (req.url.startsWith(self.location.origin))) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
        }
        return res;
      }).catch(() => cached);

      // HTML — network first (чтобы обновления доходили), остальное — cache first
      if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
        return network.then((r) => r || cached);
      }
      return cached || network;
    })
  );
});
