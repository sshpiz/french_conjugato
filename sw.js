// sw.js - network-first for HTML (with timeout), cache-first for assets

const CACHE_NAME = 'offline-cache-v13';
const NAV_TIMEOUT_MS = 3000;
const LOG_KEY = 'sw-debug-log';
const MAX_LOG = 80;

// ── Tiny persistent logger (writes to cache as JSON) ──────────────────────
const swLog = (() => {
  let buf = [];
  let flushTimer = null;

  function ts() {
    return new Date().toISOString().replace('T', ' ').slice(0, 23);
  }

  function add(msg) {
    const entry = `${ts()}  ${msg}`;
    buf.push(entry);
    console.log('[SW]', msg);
    scheduleFlush();
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(flush, 300);
  }

  async function flush() {
    flushTimer = null;
    try {
      const cache = await caches.open(CACHE_NAME);
      // Read existing log
      const existing = await cache.match('/__sw-log');
      let prev = [];
      if (existing) {
        try { prev = await existing.json(); } catch (_) {}
      }
      const combined = prev.concat(buf).slice(-MAX_LOG);
      buf = [];
      await cache.put('/__sw-log', new Response(JSON.stringify(combined), {
        headers: { 'Content-Type': 'application/json' }
      }));
    } catch (e) {
      console.error('[SW] log flush failed', e);
    }
  }

  return { add, flush };
})();

// ── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  swLog.add(`install CACHE=${CACHE_NAME}`);
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      const assets = ['/manifest.json', '/favicon_big.png'];
      for (const url of assets) {
        try { await cache.add(url); swLog.add(`pre-cached ${url}`); }
        catch (e) { swLog.add(`pre-cache FAILED ${url}: ${e.message}`); }
      }
    })
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  swLog.add('activate');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const oldKeys = keys.filter(k => k !== CACHE_NAME);
        const isUpgrade = oldKeys.length > 0;
        swLog.add(`old caches: [${oldKeys.join(', ')}] isUpgrade=${isUpgrade}`);
        return Promise.all(oldKeys.map(k => caches.delete(k))).then(() => isUpgrade);
      })
      .then(isUpgrade => self.clients.claim().then(() => isUpgrade))
      .then(isUpgrade => {
        swLog.add('claimed clients');
        if (!isUpgrade) return;
        return new Promise(resolve => setTimeout(resolve, 1500)).then(() =>
          self.clients.matchAll({ type: 'window' }).then(clients => {
            swLog.add(`sending SW_UPDATED to ${clients.length} client(s)`);
            clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
          })
        );
      })
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Serve the debug log
  if (url.pathname === '/__sw-log') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const r = await cache.match('/__sw-log');
        return r || new Response('[]', { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isNav = event.request.mode === 'navigate'
    || url.pathname === '/'
    || url.pathname.endsWith('.html');

  if (isNav) {
    const t0 = Date.now();
    swLog.add(`nav-fetch START ${url.pathname}`);

    event.respondWith(
      Promise.race([
        fetch(event.request, { cache: 'no-store' })
          .then(r => { swLog.add(`nav-fetch NETWORK ok ${url.pathname} ${Date.now()-t0}ms status=${r.status}`); return r; }),
        new Promise((_, reject) =>
          setTimeout(() => {
            swLog.add(`nav-fetch TIMEOUT ${url.pathname} after ${NAV_TIMEOUT_MS}ms`);
            reject(new Error('SW nav timeout'));
          }, NAV_TIMEOUT_MS)
        )
      ])
        .then(async response => {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone()).catch(() => {});
          if (url.pathname === '/') cache.put(new Request('/index.html'), response.clone()).catch(() => {});
          if (url.pathname.endsWith('/index.html')) cache.put(new Request('/'), response.clone()).catch(() => {});
          return response;
        })
        .catch(async err => {
          swLog.add(`nav-fetch FALLBACK ${url.pathname} reason="${err.message}" elapsed=${Date.now()-t0}ms`);
          const cached = await caches.match(event.request)
            || await caches.match('/index.html')
            || await caches.match('/');
          swLog.add(`nav-fetch cache-hit=${!!cached}`);
          return cached || new Response('Offline', { status: 503 });
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(async response => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone()).catch(() => {});
          }
          return response;
        });
      })
    );
  }
});
