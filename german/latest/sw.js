// sw.js - scoped stale-while-revalidate for the German app.

const CACHE_PREFIX = 'german-latest-app-cache-';
const CACHE_NAME = CACHE_PREFIX + 'v19';
const LOG_KEY = '__sw-log';
const MAX_LOG = 100;
const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');

function appPath(relative = '') {
  const clean = String(relative || '').replace(/^\/+/, '');
  const prefix = SCOPE_PATH || '';
  return clean ? `${prefix}/${clean}` : `${prefix || '/'}`;
}

const INDEX_PATH = appPath('index.html');
const MANIFEST_PATH = appPath('manifest.json');
const FAVICON_PATH = appPath('favicon_big.png');
const VERSION_PATH = appPath('version.json');
const LOG_PATH = appPath(LOG_KEY);
const TTS_PREFIX = appPath('../tts/');

function inScopePath(pathname) {
  if (!SCOPE_PATH) return true;
  return pathname === SCOPE_PATH || pathname.startsWith(SCOPE_PATH + '/');
}

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
      const prev = await cache.match(LOG_PATH)
        .then(r => r ? r.json() : []).catch(() => []);
      const next = prev.concat(buf).slice(-MAX_LOG);
      buf = [];
      await cache.put(LOG_PATH, new Response(JSON.stringify(next), {
        headers: { 'Content-Type': 'application/json' }
      }));
    } catch (_) {}
  }

  return { add };
})();

self.addEventListener('install', event => {
  swLog.add(`install ${CACHE_NAME}`);
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Keep install light: cache only the small essentials here.
      // The large app shell HTML is warmed after first usable render instead.
      for (const url of [MANIFEST_PATH, FAVICON_PATH, VERSION_PATH]) {
        try { await cache.add(url); swLog.add(`pre-cached ${url}`); }
        catch (e) { swLog.add(`pre-cache failed ${url}: ${e.message}`); }
      }
    })
  );
});

self.addEventListener('activate', event => {
  swLog.add('activate');
  event.waitUntil(
    caches.keys().then(async keys => {
      const old = keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME);
      const isUpgrade = old.length > 0;
      swLog.add(`old caches: [${old.join(', ')}] isUpgrade=${isUpgrade}`);
      await Promise.all(old.map(k => caches.delete(k)));
      await self.clients.claim();
      swLog.add('claimed clients');
      if (isUpgrade) {
        await new Promise(r => setTimeout(r, 2000));
        const clients = await self.clients.matchAll({ type: 'window' });
        swLog.add(`SW_UPDATED -> ${clients.length} client(s)`);
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
      }
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname === LOG_PATH) {
    event.respondWith(
      caches.open(CACHE_NAME).then(c => c.match(LOG_PATH))
        .then(r => r || new Response('[]', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (!inScopePath(url.pathname)) return;

  event.respondWith(serveWithSWR(event.request, url));
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'WARM_INDEX') {
    event.waitUntil(warmIndexCache(data.reason || 'message'));
  }
});

async function warmIndexCache(reason = 'unknown') {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(new Request(INDEX_PATH, { cache: 'no-store' }));
    if (!response.ok) {
      swLog.add(`warm-index bad-status reason=${reason} status=${response.status}`);
      return;
    }
    await cache.put(INDEX_PATH, response.clone());
    swLog.add(`warm-index ok reason=${reason} status=${response.status}`);
  } catch (e) {
    swLog.add(`warm-index failed reason=${reason}: ${e.message}`);
  }
}

async function serveWithSWR(request, url) {
  const isNav = request.mode === 'navigate'
    || url.pathname === SCOPE_PATH
    || url.pathname === `${SCOPE_PATH}/`
    || url.pathname.endsWith('.html');
  const isTtsAsset = url.pathname.startsWith(TTS_PREFIX);
  const isVersionRequest = url.pathname === VERSION_PATH;
  const forceRefresh = isNav && url.searchParams.has('__refresh');

  const cache = await caches.open(CACHE_NAME);

  if (isVersionRequest) {
    try {
      const response = await fetch(new Request(VERSION_PATH, { cache: 'no-store' }));
      if (response.ok) {
        await cache.put(VERSION_PATH, response.clone());
        swLog.add(`version-fetch ok ${url.pathname} status=${response.status}`);
      } else {
        swLog.add(`version-fetch bad-status ${url.pathname} status=${response.status}`);
      }
      return response;
    } catch (e) {
      swLog.add(`version-fetch failed ${url.pathname}: ${e.message}`);
      const cachedVersion = await cache.match(VERSION_PATH);
      if (cachedVersion) {
        swLog.add(`version-cache-hit ${url.pathname}`);
        return cachedVersion;
      }
      return new Response(JSON.stringify({ error: 'Version unavailable offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (isTtsAsset) {
    const cachedAsset = await cache.match(request);
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) {
        await cache.put(request, response.clone());
        swLog.add(`tts-fetch ok ${url.pathname} status=${response.status}`);
      } else {
        swLog.add(`tts-fetch bad-status ${url.pathname} status=${response.status}`);
      }
      return response;
    } catch (e) {
      swLog.add(`tts-fetch failed ${url.pathname}: ${e.message}`);
      if (cachedAsset) {
        swLog.add(`tts-cache-hit ${url.pathname}`);
        return cachedAsset;
      }
      return new Response('TTS asset unavailable offline', { status: 503 });
    }
  }

  const cached = forceRefresh
    ? null
    : (await cache.match(request)
      || (isNav ? await cache.match(INDEX_PATH) : null));

  const refresh = fetch(request, (isNav || forceRefresh) ? { cache: 'no-store' } : {})
    .then(async response => {
      if (!response.ok) return;
      await cache.put(request, response.clone());
      if (isNav) {
        await cache.put(INDEX_PATH, response.clone());
        swLog.add(`bg-refresh ok ${url.pathname} status=${response.status}`);
      }
    })
    .catch(e => {
      if (isNav) swLog.add(`bg-refresh failed ${url.pathname}: ${e.message}`);
    });

  if (cached) {
    if (isNav) swLog.add(`nav CACHE-HIT ${url.pathname} (refreshing in bg)`);
    return cached;
  }

  if (forceRefresh) swLog.add(`nav FORCE-REFRESH ${url.pathname} - bypassing cache`);
  if (isNav) swLog.add(`nav NO-CACHE ${url.pathname} - waiting for network`);
  try {
    await refresh;
    const fresh = await cache.match(request) || await cache.match(INDEX_PATH);
    if (fresh) return fresh;
  } catch (_) {}

  return new Response('Offline - open once with internet to cache the app', { status: 503 });
}
