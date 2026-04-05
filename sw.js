const CACHE_NAME = 'caixinha-wm-v1';

// Aqui nós dizemos ao celular exatamente quais arquivos ele deve guardar para usar offline
const arquivosParaGuardar = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './LOGOTIPO.jpg',
  './Captura de tela 2026-02-13 132630.jpg',
  './icone.v2.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(arquivosParaGuardar))
  );
});

self.addEventListener('fetch', evento => {
  evento.respondWith(
    caches.match(evento.request)
      .then(resposta => resposta || fetch(evento.request))
  );
});
