const CACHE_NAME = 'olharbnv-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './config_ocorrencias_benavente.json',
  './manifest.json'
];

// Instalação da Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Resposta com Cache / Rede
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
