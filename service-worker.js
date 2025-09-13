// Service Worker minimale per PWA (disabilitato in iOS standalone via JS)
const CACHE = 'extratv-shell-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './poster.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.ts') || url.pathname.endsWith('.mp4')) return;
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request).catch(() => caches.match('./index.html'))));
});
