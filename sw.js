const PREFIXO_CACHE = 'caixinha-wm-';
const CACHE_NAME = PREFIXO_CACHE + 'v35';

const ARQUIVOS_FIXOS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './senha.js',
  './LOGOTIPO.jpg',
  './controladoria.jpg',
  './Captura%20de%20tela%202026-02-13%20132630.jpg',
  './OLHOABERTO.png',
  './OLHOFECHADO_V2.png',
  './icone_principal_v14.png',
  './icone_principal_v14.png?v=35',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          ARQUIVOS_FIXOS.map(arquivo => cache.add(arquivo))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(nomesCaches => {
      return Promise.all(
        nomesCaches.map(nomeCache => {
          if (nomeCache.startsWith(PREFIXO_CACHE) && nomeCache !== CACHE_NAME) {
            return caches.delete(nomeCache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

async function responderNavegacao(evento) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const respostaRede = await fetch(evento.request);
    if (respostaRede && respostaRede.status === 200) {
      cache.put('./index.html', respostaRede.clone());
      cache.put(evento.request, respostaRede.clone());
    }
    return respostaRede;
  } catch (erro) {
    return (
      await caches.match('./index.html', { ignoreSearch: true }) ||
      await caches.match('./', { ignoreSearch: true })
    );
  }
}

async function responderArquivo(evento) {
  const cache = await caches.open(CACHE_NAME);
  const respostaCache = await caches.match(evento.request, { ignoreSearch: true });

  // Para arquivos do próprio app, usa primeiro o cache para garantir funcionamento offline.
  if (respostaCache) {
    // Atualiza em segundo plano quando houver internet, sem impedir abrir offline.
    fetch(evento.request)
      .then(respostaRede => {
        if (respostaRede && respostaRede.status === 200 && evento.request.method === 'GET') {
          cache.put(evento.request, respostaRede.clone());
        }
      })
      .catch(() => {});
    return respostaCache;
  }

  try {
    const respostaRede = await fetch(evento.request);
    if (respostaRede && respostaRede.status === 200 && evento.request.method === 'GET') {
      cache.put(evento.request, respostaRede.clone());
    }
    return respostaRede;
  } catch (erro) {
    if (evento.request.destination === 'document') {
      return caches.match('./index.html', { ignoreSearch: true });
    }
    return new Response('', { status: 504, statusText: 'Offline e arquivo não disponível no cache' });
  }
}

self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;

  if (evento.request.mode === 'navigate') {
    evento.respondWith(responderNavegacao(evento));
    return;
  }

  evento.respondWith(responderArquivo(evento));
});
