const CACHE_NAME = 'extratvlive-ui-ios26fix-v1';
const UI_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './ios-install-hint.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180x180.png'
];
self.addEventListener('install',(e)=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(UI_ASSETS)))});
self.addEventListener('activate',(e)=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))) });
self.addEventListener('fetch',(event)=>{
  const req = event.request;
  const url = new URL(req.url);
  if (req.destination === 'video' || url.pathname.endsWith('.m3u8') || /\.(ts|m4s)$/i.test(url.pathname)) return;
  event.respondWith(caches.match(req).then(c=>c||fetch(req).then(r=>{const rc=r.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(req, rc)); return r;})).catch(()=>caches.match('./index.html')));
});