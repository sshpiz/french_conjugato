// sw.js - scoped stale-while-revalidate for the French app.

const CACHE_PREFIX = 'fr-app-cache-';
const CACHE_NAME = CACHE_PREFIX + 'v31';
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
const TTS_PREFIX = appPath('tts/');
const PRECACHE_URLS = [INDEX_PATH, MANIFEST_PATH, FAVICON_PATH, VERSION_PATH];
const FALLBACK_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VerbsFirst</title>
  <link rel="icon" href="${FAVICON_PATH}">
  <style>
    html,body{height:100%;margin:0}
    body{display:grid;place-items:center;background:#f8faf7;color:#243328;font:16px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:28rem;padding:2rem;text-align:center}
    h1{margin:0 0 .5rem;font-size:1.75rem;font-weight:750}
    p{margin:.35rem 0;color:#4d5c50}
  </style>
</head>
<body>
  <main>
    <h1>VerbsFirst</h1>
    <p>Loading the app...</p>
    <p>Reconnect and refresh if this stays on screen.</p>
  </main>
</body>
</html>`;

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
      await preCacheIndexAndBuildAssets(cache, 'install', { requireBuildAssets: true });
      for (const url of PRECACHE_URLS.filter(url => url !== INDEX_PATH)) {
        await preCacheUrl(cache, url);
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

  event.respondWith(
    serveWithSWR(event.request, url)
      .catch(error => serveAfterUnhandledError(event.request, url, error))
  );
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'WARM_INDEX') {
    event.waitUntil(warmIndexCache(data.reason || 'message'));
  }
  if (data.type === 'WARM_APP_ASSETS') {
    event.waitUntil(warmAppAssets(Array.isArray(data.urls) ? data.urls : [], data.reason || 'message'));
  }
});

async function preCacheUrl(cache, url) {
  try {
    const request = new Request(url, {
      cache: url === INDEX_PATH ? 'no-store' : 'default'
    });
    const response = await fetch(request);
    if (!response.ok) throw new Error(`status ${response.status}`);
    await cache.put(url, response.clone());
    swLog.add(`pre-cached ${url}`);
  } catch (e) {
    swLog.add(`pre-cache failed ${url}: ${e.message}`);
  }
}

async function preCacheIndexAndBuildAssets(cache, reason = 'unknown', options = {}) {
  try {
    const response = await fetch(new Request(INDEX_PATH, { cache: 'no-store' }));
    if (!response.ok) throw new Error(`status ${response.status}`);
    const cached = await cacheIndexResponseAndBuildAssets(cache, response, reason, options);
    if (!cached) throw new Error('index assets were not cached');
    swLog.add(`pre-cached ${INDEX_PATH}`);
  } catch (e) {
    swLog.add(`pre-cache failed ${INDEX_PATH}: ${e.message}`);
    if (options.requireBuildAssets) throw e;
  }
}

async function warmIndexCache(reason = 'unknown') {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(new Request(INDEX_PATH, { cache: 'no-store' }));
    if (!response.ok) {
      swLog.add(`warm-index bad-status reason=${reason} status=${response.status}`);
      return;
    }
    const cached = await cacheIndexResponseAndBuildAssets(cache, response, `warm-index:${reason}`);
    if (cached) {
      swLog.add(`warm-index ok reason=${reason} status=${response.status}`);
    } else {
      swLog.add(`warm-index kept-previous reason=${reason} status=${response.status}`);
    }
  } catch (e) {
    swLog.add(`warm-index failed reason=${reason}: ${e.message}`);
  }
}

async function cacheIndexResponseAndBuildAssets(cache, response, reason = 'unknown', options = {}) {
  let indexText = '';
  try {
    indexText = await response.clone().text();
  } catch (e) {
    swLog.add(`index-parse failed reason=${reason}: ${e.message}`);
    if (options.requireBuildAssets) throw e;
    return false;
  }
  const stats = await warmBuildAssetsFromIndex(cache, indexText, reason, options);
  if (!stats.count || stats.failed > 0) {
    swLog.add(`index-cache skipped reason=${reason} asset-count=${stats.count} failed=${stats.failed}`);
    return false;
  }
  await cache.put(INDEX_PATH, response.clone());
  if (options.cacheRequest) {
    await cache.put(options.cacheRequest, response.clone());
  }
  return true;
}

async function warmBuildAssetsFromIndex(cache, indexText, reason = 'unknown', options = {}) {
  const urls = collectBuildAssetUrls(indexText);
  if (!urls.length) {
    swLog.add(`warm-build-assets skipped reason=${reason} count=0`);
    if (options.requireBuildAssets) {
      throw new Error('no build assets found in index');
    }
    return { count: 0, ok: 0, failed: 0 };
  }

  let ok = 0;
  let failed = 0;
  for (const url of urls) {
    try {
      const request = new Request(url.href, { cache: 'default' });
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        ok += 1;
        if (isStarterVerbDataUrl(url)) {
          ok += await warmExtraVerbDataFromStarter(cache, response, reason);
        }
      } else {
        failed += 1;
        swLog.add(`warm-build-assets bad-status ${url.pathname} status=${response.status}`);
      }
    } catch (e) {
      failed += 1;
      swLog.add(`warm-build-assets failed ${url.pathname}: ${e.message}`);
    }
  }
  swLog.add(`warm-build-assets done reason=${reason} ok=${ok} failed=${failed}`);
  if (options.requireBuildAssets && failed > 0) {
    throw new Error(`failed to cache ${failed} build asset(s)`);
  }
  return { count: urls.length, ok, failed };
}

async function warmExtraVerbDataFromStarter(cache, response, reason = 'unknown') {
  let starterText = '';
  try {
    starterText = await response.clone().text();
  } catch (e) {
    swLog.add(`warm-extra-data parse failed reason=${reason}: ${e.message}`);
    return 0;
  }

  const match = starterText.match(/"extraUrl"\s*:\s*"([^"]+)"/);
  if (!match) return 0;

  const extraUrl = buildScopedUrl(match[1]);
  if (!extraUrl) return 0;

  try {
    const request = new Request(extraUrl.href, { cache: 'default' });
    const extraResponse = await fetch(request);
    if (!extraResponse.ok) {
      swLog.add(`warm-extra-data bad-status ${extraUrl.pathname} status=${extraResponse.status}`);
      return 0;
    }
    await cache.put(request, extraResponse.clone());
    swLog.add(`warm-extra-data ok reason=${reason} ${extraUrl.pathname}`);
    return 1;
  } catch (e) {
    swLog.add(`warm-extra-data failed ${extraUrl.pathname}: ${e.message}`);
    return 0;
  }
}

function collectBuildAssetUrls(indexText) {
  const urls = [];
  const add = value => {
    const url = buildScopedUrl(value);
    if (url) urls.push(url);
  };

  for (const match of indexText.matchAll(/<script\b[^>]*\bsrc=(["'])(.*?)\1/gi)) {
    add(match[2]);
  }
  for (const match of indexText.matchAll(/<link\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)) {
    const tag = match[0];
    if (/\brel=(["'])(?:manifest|icon|apple-touch-icon|stylesheet|modulepreload|preload)\1/i.test(tag)) {
      add(match[2]);
    }
  }
  for (const match of indexText.matchAll(/__FRENCH_HOMOPHONE_GROUP_URL\s*=\s*(["'])(.*?)\1/g)) {
    add(match[2]);
  }

  const seen = new Set();
  return urls.filter(url => {
    if (seen.has(url.href)) return false;
    seen.add(url.href);
    return true;
  });
}

function buildScopedUrl(value) {
  try {
    const url = new URL(String(value || ''), self.registration.scope);
    if (url.origin !== self.location.origin) return null;
    if (!inScopePath(url.pathname)) return null;
    if (url.pathname === LOG_PATH || url.pathname.startsWith(TTS_PREFIX)) return null;
    return url;
  } catch (_) {
    return null;
  }
}

function isStarterVerbDataUrl(url) {
  return /\/js\/verbs\.starter\.generated\.js$/.test(url.pathname);
}

async function warmAppAssets(urls = [], reason = 'unknown') {
  const uniqueUrls = [...new Set(urls)]
    .map(value => {
      try { return new URL(String(value || ''), self.registration.scope); }
      catch (_) { return null; }
    })
    .filter(url => url && url.origin === self.location.origin && inScopePath(url.pathname) && !url.pathname.startsWith(TTS_PREFIX));

  if (!uniqueUrls.length) {
    swLog.add(`warm-assets skipped reason=${reason} count=0`);
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  let ok = 0;
  let failed = 0;
  for (const url of uniqueUrls) {
    try {
      const request = new Request(url.href, { cache: 'default' });
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        ok += 1;
      } else {
        failed += 1;
        swLog.add(`warm-assets bad-status ${url.pathname} status=${response.status}`);
      }
    } catch (e) {
      failed += 1;
      swLog.add(`warm-assets failed ${url.pathname}: ${e.message}`);
    }
  }
  swLog.add(`warm-assets done reason=${reason} ok=${ok} failed=${failed}`);
}

function isNavigationRequest(request, url) {
  return request.mode === 'navigate'
    || url.pathname === SCOPE_PATH
    || url.pathname === `${SCOPE_PATH}/`
    || url.pathname.endsWith('.html');
}

function fallbackShellResponse() {
  return new Response(FALLBACK_HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function serveAfterUnhandledError(request, url, error) {
  const message = error && error.message ? error.message : String(error || 'unknown');
  const isNav = isNavigationRequest(request, url);
  swLog.add(`serve-error ${url.pathname}: ${message}`);
  if (isNav) {
    swLog.add(`nav FALLBACK-SHELL ${url.pathname} after serve-error`);
    return fallbackShellResponse();
  }
  return new Response('Offline - open once with internet to cache the app', { status: 503 });
}

async function serveWithSWR(request, url) {
  const isNav = isNavigationRequest(request, url);
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
      if (!response.ok) return response;
      if (isNav) {
        const cachedIndex = await cacheIndexResponseAndBuildAssets(cache, response, `nav-refresh:${url.pathname}`, {
          cacheRequest: request
        });
        if (cachedIndex) {
          swLog.add(`bg-refresh ok ${url.pathname} status=${response.status}`);
        } else {
          swLog.add(`bg-refresh kept-cache ${url.pathname} status=${response.status}`);
        }
      } else {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(e => {
      if (isNav) swLog.add(`bg-refresh failed ${url.pathname}: ${e.message}`);
      return undefined;
    });

  if (cached) {
    if (isNav) swLog.add(`nav CACHE-HIT ${url.pathname} (refreshing in bg)`);
    return cached;
  }

  if (forceRefresh) swLog.add(`nav FORCE-REFRESH ${url.pathname} - bypassing cache`);
  if (isNav) swLog.add(`nav NO-CACHE ${url.pathname} - waiting for network`);
  try {
    const networkResponse = await refresh;
    const fresh = await cache.match(request) || await cache.match(INDEX_PATH);
    if (fresh) return fresh;
    if (networkResponse) return networkResponse;
  } catch (_) {}

  if (isNav) {
    swLog.add(`nav FALLBACK-SHELL ${url.pathname}`);
    return fallbackShellResponse();
  }

  return new Response('Offline - open once with internet to cache the app', { status: 503 });
}
