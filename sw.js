// Service worker do site: abre rapido e mostra um aviso sem internet.
// Dados da conta (Supabase) nunca passam por aqui: sao de outro endereco.
const CACHE = 'ff-site-v1';
const BASICOS = ['offline.html', 'app.html', 'app.css', 'app.js', 'vendor/react.js', 'vendor/react-dom.js', 'vendor/chart.js', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('.apk')) return;
  e.respondWith(fetch(req).then(r => {
    if (r.ok) {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
    }
    return r;
  }).catch(() => caches.match(req).then(c => c || (req.mode === 'navigate' ? caches.match('offline.html') : undefined))));
});
