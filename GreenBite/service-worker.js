const CACHE = 'greenbite-v1';
const FILES = [
  '/',
  '/index.html',
  '/recipes.html',
  '/calculator.html',
  '/css/styles.css',
  '/js/main.js',
  '/data/recipes.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
