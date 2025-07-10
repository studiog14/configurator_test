self.addEventListener('install', function(event) {
  console.log('Service worker installed');
});

self.addEventListener('fetch', function(event) {
  // domyślnie nic nie cachujemy, można dodać
});
