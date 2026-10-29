const CACHE_NAME = 'entrenamiento-pro-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './manifest-icon-192.maskable.png',
  './manifest-icon-512.maskable.png'
];

// Instala y toma el control inmediatamente sin esperar a cerrar la app
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Limpia cachés antiguos automáticamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Estrategia Network-First: si hay internet baja siempre lo último de GitHub; si no hay, usa caché
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
