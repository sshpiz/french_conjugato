const CACHE_PREFIX = 'landing-cache-';
const CACHE_NAME = CACHE_PREFIX + 'v1';
const LOG_PATH = '/__sw-log';
const EXCLUDED_PREFIXES = ['/french', '/greek', '/portugese', '/greek-verbs'];
const ROOT_PATHS = new Set(['/', '/index.html', '/manifest.json', '/favicon_big.png']);

function isExcluded(pathname) {
  return EXCLUDED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(Array.from(ROOT_PATHS)))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname === LOG_PATH) {
    event.respondWith(new Response('[]', { headers: { 'Content-Type': 'application/json' } }));
    return;
  }
  if (isExcluded(url.pathname)) return;
  if (!ROOT_PATHS.has(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request) || await cache.match('/index.html');
    try {
      const response = await fetch(event.request, { cache: 'no-store' });
      if (response.ok) {
        await cache.put(event.request, response.clone());
        if (url.pathname === '/') {
          await cache.put('/index.html', response.clone());
        }
      }
      return response;
    } catch (_) {
      return cached || new Response('Offline', { status: 503 });
    }
  })());
});
