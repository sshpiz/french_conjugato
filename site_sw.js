const CACHE_PREFIX = 'landing-cache-';
const CACHE_NAME = CACHE_PREFIX + 'v2';
const LOG_PATH = '/__sw-log';
const ROOT_PATHS = new Set(['/', '/index.html', '/manifest.json', '/favicon_big.png']);
const APP_ROUTE_PREFIXES = [
  'french',
  'french_latest',
  'spanish',
  'spanish_latest',
  'german',
  'german_latest',
  'portugese',
  'portugese_latest',
  'portuguese',
  'portuguese_latest',
  'italian',
  'italian_latest',
  'greek',
  'greek_latest',
  'catalan',
  'catalan_latest',
  'latvian',
  'latvian_latest',
  'russian',
  'russian_latest',
  'ukrainian',
  'ukrainian_latest',
];

function matchesRoute(pathname, route) {
  const prefix = `/${route}`;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function appRouteFor(pathname) {
  return APP_ROUTE_PREFIXES.find(route => matchesRoute(pathname, route)) || '';
}

function isNavigationRequest(request, url) {
  return request.mode === 'navigate' || url.pathname.endsWith('.html');
}

function appFallbackShell(pathname) {
  const retryUrl = pathname || '/';
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VerbsFirst</title>
  <style>
    html,body{height:100%;margin:0}
    body{display:grid;place-items:center;background:#202124;color:#bdc1c6;font:16px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:28rem;padding:2rem}
    h1{margin:0 0 .75rem;color:#e8eaed;font-size:1.75rem}
    p{margin:.35rem 0}
  </style>
</head>
<body>
  <main>
    <h1>VerbsFirst</h1>
    <p>Opening the app...</p>
    <p>Retrying the connection now.</p>
  </main>
  <script>
    setTimeout(function () { window.location.replace(${JSON.stringify(retryUrl)}); }, 1600);
  </script>
</body>
</html>`, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const path of ROOT_PATHS) {
        try {
          await cache.add(path);
        } catch (_) {}
      }
    })
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

  if (isNavigationRequest(event.request, url) && appRouteFor(url.pathname)) {
    event.respondWith(serveAppNavigation(event.request, url));
    return;
  }

  if (ROOT_PATHS.has(url.pathname)) {
    event.respondWith(serveRootRequest(event.request, url));
  }
});

async function serveRootRequest(request, url) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request) || await cache.match('/index.html');
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(request, response.clone());
      if (url.pathname === '/') {
        await cache.put('/index.html', response.clone());
      }
    }
    return response;
  } catch (_) {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function serveAppNavigation(request, url) {
  const route = appRouteFor(url.pathname);
  const indexPath = route ? `/${route}/index.html` : '';
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request) || (indexPath ? await cache.match(indexPath) : null);

  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(request, response.clone());
      if (indexPath) {
        await cache.put(indexPath, response.clone());
      }
    }
    return response;
  } catch (_) {
    return cached || appFallbackShell(url.pathname);
  }
}
