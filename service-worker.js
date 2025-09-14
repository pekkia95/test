const CACHE_NAME = 'extratvlive-ui-ios26-v3';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([
    './','./index.html','./manifest.json','./ios-install-hint.js',
    './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon-180x180.png'
  ])));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Bypass totale per richieste cross-origin (HLS, CDN, ecc.)
  if (url.origin !== self.location.origin) return;

  // Bypass per richieste con Range (media) o esplicite video/HLS
  if (req.headers.has('range') || req.destination === 'video' || /\.m3u8($|\?)/i.test(url.pathname) || /\.(ts|m4s)($|\?)/i.test(url.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});