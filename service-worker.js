// Basic service worker for PWA installability.
// Streaming non disponibile offline; qui cache solo shell minima.
const CACHE = 'extratv-shell-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './poster.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never cache HLS media segments/playlist
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.ts') || url.pathname.endsWith('.mp4')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
