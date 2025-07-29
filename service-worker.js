const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon.png',
  '/icons/FK_Logo.jpg',
  '/chairs/Ava.glb',
  '/hdr/hamburg_hbf_1k.hdr',
  // dodaj wszystkie inne modele, pliki .glb, tekstury itd.
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('krzesla-v1').then(cache => {
      return cache.addAll(assetsToCache); // używamy listy tutaj!
    }).catch(err => {
      console.error('Błąd cache.addAll:', err);
    })
  );
});
