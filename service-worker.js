// SW pass-through: nessun precache e mai cache per index/manifest/poster
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Non interferire con i media HLS
  if (url.pathname.endsWith('.m3u8') || url.pathname.endsWith('.ts') || url.pathname.endsWith('.mp4')) return;
  // Evita cache per index/manifest/poster
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('manifest.webmanifest') || url.pathname.endsWith('poster.png')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
  }
  // altrimenti passa default (rete)
});
