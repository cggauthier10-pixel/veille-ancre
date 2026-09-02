const CACHE = 'veille-ancre-v3';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Réseau en priorité (pour toujours avoir la dernière version en ligne),
// repli sur le cache uniquement hors-ligne — important pour une appli de sécurité.
// Les requêtes vers d'autres origines (tuiles de carte OpenStreetMap/OpenSeaMap)
// ne sont pas interceptées : elles suivent le comportement réseau normal du navigateur.
self.addEventListener('fetch', (event) => {
  if(new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
