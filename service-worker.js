self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('krzesla-v1').then(cache => {
      return cache.addAll([
        'index.html',
        'favicon.jpg',
        'favicon.jpg',
        // dodaj pliki .glb, .jpg, .png itp. które muszą działać offline
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
