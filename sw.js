/* WordWisp service worker — NETWORK-FIRST so you always get the latest build
   (falls back to cache only when offline). This fixes "changes don't show". */
const CACHE = 'wordwisp-v8';
const ASSETS = [
  './', './index.html', './styles.css',
  './data/courses.js', './js/app.js',
  './manifest.webmanifest', './icon.svg',
  './lottie/lottie.min.js', './lottie/crow.json',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res; })
      .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
