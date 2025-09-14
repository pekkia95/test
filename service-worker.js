const CACHE_NAME = 'extratvlive-ui-ghp-v1';
const UI_ASSETS = [
  './',
  './index.html',
  './404.html',
  './manifest.json',
  './ios-install-hint.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180x180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(UI_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.destination === 'video' || url.pathname.endsWith('.m3u8') || /\.(ts|m4s)$/i.test(url.pathname)) {
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return resp;
      }).catch(() => cached);
    })
  );
});
