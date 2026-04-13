// sw.js - cache-first (stale-while-revalidate) for all resources
// App opens instantly from cache; background fetch keeps content fresh.

const CACHE_PREFIX = 'fr-offline-cache-';
const CACHE_NAME = CACHE_PREFIX + 'v15';
const LOG_KEY = '__sw-log';
const MAX_LOG = 100;
const GREEK_PATH_PREFIX = '/greek';

// ── Tiny persistent logger ─────────────────────────────────────────────────
const swLog = (() => {
  let buf = [];
  let timer = null;

  const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 23);

  function add(msg) {
    buf.push(`${ts()}  ${msg}`);
    console.log('[SW]', msg);
    if (!timer) timer = setTimeout(flush, 200);
  }

  async function flush() {
    timer = null;
    if (!buf.length) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const prev = await cache.match(LOG_KEY)
        .then(r => r ? r.json() : []).catch(() => []);
      const next = prev.concat(buf).slice(-MAX_LOG);
      buf = [];
      await cache.put(LOG_KEY, new Response(JSON.stringify(next), {
        headers: { 'Content-Type': 'application/json' }
      }));
    } catch (_) {}
  }

  return { add };
})();

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  swLog.add(`install ${CACHE_NAME}`);
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of ['/manifest.json', '/favicon_big.png']) {
        try { await cache.add(url); swLog.add(`pre-cached ${url}`); }
        catch (e) { swLog.add(`pre-cache failed ${url}: ${e.message}`); }
      }
    })
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  swLog.add('activate');
  event.waitUntil(
    caches.keys().then(async keys => {
      // Only prune older French shell caches. Never delete unrelated app caches
      // (Greek app caches, packaged TTS caches, etc.) on the same origin.
      const old = keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME);
      const isUpgrade = old.length > 0;
      swLog.add(`old caches: [${old.join(', ')}] isUpgrade=${isUpgrade}`);
      await Promise.all(old.map(k => caches.delete(k)));
      await self.clients.claim();
      swLog.add('claimed clients');
      if (isUpgrade) {
        // Delay so we don't interrupt the page that just opened
        await new Promise(r => setTimeout(r, 2000));
        const clients = await self.clients.matchAll({ type: 'window' });
        swLog.add(`SW_UPDATED → ${clients.length} client(s)`);
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
      }
    })
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Serve debug log
  if (url.pathname === '/__sw-log') {
    event.respondWith(
      caches.open(CACHE_NAME).then(c => c.match(LOG_KEY))
        .then(r => r || new Response('[]', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // Only intercept same-origin
  if (url.origin !== self.location.origin) return;

  // Keep the French root SW out of the Greek sub-app namespace.
  if (url.pathname === GREEK_PATH_PREFIX || url.pathname.startsWith(GREEK_PATH_PREFIX + "/")) {
    return;
  }

  event.respondWith(serveWithSWR(event.request, url));
});

// Stale-While-Revalidate for everything
async function serveWithSWR(request, url) {
  const isNav = request.mode === 'navigate'
    || url.pathname === '/'
    || url.pathname.endsWith('.html');

  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request)
    || (isNav ? (await cache.match('/index.html') || await cache.match('/')) : null);

  // Kick off background refresh regardless
  const refresh = fetch(request, isNav ? { cache: 'no-store' } : {})
    .then(async response => {
      if (!response.ok) return;
      await cache.put(request, response.clone());
      if (isNav) {
        if (url.pathname === '/') await cache.put(new Request('/index.html'), response.clone());
        if (url.pathname.endsWith('/index.html')) await cache.put(new Request('/'), response.clone());
        swLog.add(`bg-refresh ok ${url.pathname} status=${response.status}`);
      }
    })
    .catch(e => {
      if (isNav) swLog.add(`bg-refresh failed ${url.pathname}: ${e.message}`);
    });

  if (cached) {
    // Cache hit — return immediately, refresh happens in background
    if (isNav) swLog.add(`nav CACHE-HIT ${url.pathname} (refreshing in bg)`);
    return cached;
  }

  // No cache — must wait for network (only happens on very first open)
  if (isNav) swLog.add(`nav NO-CACHE ${url.pathname} — waiting for network`);
  try {
    await refresh; // wait for the fetch we already kicked off
    const fresh = await cache.match(request)
      || await cache.match('/index.html')
      || await cache.match('/');
    if (fresh) return fresh;
  } catch (_) {}

  return new Response('Offline — open once with internet to cache the app', { status: 503 });
}
