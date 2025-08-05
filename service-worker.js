// Zwiększ wersję przy każdej zmianie - iOS FALLBACK FIX
const CACHE_NAME = 'krzesla-v12-ios-buttons-fix';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'pwa-install.js',
  'icons/FK_logo.png',
  'icons/favicon.png',
  'icons/favicon.jpg'
];

self.addEventListener('install', e => {
  console.log('SW: Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching files');
        // Cache files one by one to see which ones fail
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn('SW: Failed to cache:', url, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('SW: Cache complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('SW: Install failed:', err);
      })
  );
});

self.addEventListener('activate', e => {
  console.log('SW: Activating...');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(e.request);
      }
    )
  );
});
