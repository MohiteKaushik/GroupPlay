/* PlayAnywhere service worker: cache-first, everything precached on first visit.
 * VERSION is bumped by `node tools/release.js` before every deploy. A changed sw.js makes the browser
 * install the new version, which fetches fresh copies of every file below and drops the old cache.
 * While VERSION is unchanged nothing is ever re-downloaded, which is the point on a 2G connection.
 */
const VERSION = '2026.11.22-2';
const CACHE = 'groupplay-' + VERSION;
const ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/version.js',
  './js/config.js',
  './js/native.js',
  './js/games.js',
  './js/decks.js',
  './js/engine.js',
  './js/store.js',
  './js/audio.js',
  './js/ui.js',
  './js/explain.js',
  './js/explainers.js',
  './js/qr.js',
  './js/net.js',
  './js/tools.js',
  './js/play.js',
  './js/online.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // cache: 'reload' bypasses the HTTP cache so a new version never precaches stale files.
      .then(cache => Promise.all(ASSETS.map(url => cache.add(new Request(url, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('groupplay-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Navigations always get the app shell (hash routing means every page is index.html).
  const target = req.mode === 'navigate' ? new Request('./index.html') : req;
  event.respondWith(
    caches.match(target, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(target, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
