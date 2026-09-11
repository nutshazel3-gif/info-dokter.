const CACHE_NAME = 'poliklinik-shell-v1';
const PRECACHE_URLS = [
  './index.html',
  './perawat.html',
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@200..700,0..1'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(PRECACHE_URLS.map(url =>
        fetch(url, { mode: 'no-cors' }).then(resp => cache.put(url, resp)).catch(() => {})
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Data API (Google Apps Script) TIDAK ikut di-cache/diintersep — biarkan
  // langsung ke jaringan supaya logika antrian offline di halaman yang menangani.
  if (req.url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req)
        .then(resp => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone())).catch(() => {});
          return resp;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
