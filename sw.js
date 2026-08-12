/* Service worker simples: guarda o app para abrir offline.
   Troque a VERSAO sempre que atualizar o index.html. */
const VERSAO = 'imagem-v5';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icone-192.png', './icone-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // chamadas de IA nunca vêm do cache
  if (url.hostname.indexOf('googleapis.com') >= 0 || url.hostname.indexOf('anthropic.com') >= 0) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp.ok && url.origin === location.origin) {
        const copia = resp.clone();
        caches.open(VERSAO).then(c => c.put(e.request, copia));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
