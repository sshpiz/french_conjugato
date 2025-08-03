// sw.js - smart cache with freshness check (24h) + flexible path support + manifest caching

const CACHE_NAME = 'offline-cache-v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        const htmlResponse = await fetch('/index.html');
        const cloned = htmlResponse.clone();
        const headers = new Headers(cloned.headers);
        headers.append('sw-cached-at', Date.now().toString());
        const freshResponse = new Response(await cloned.blob(), {
          status: 200,
          statusText: 'OK',
          headers
        });

        // Cache both '/' and '/index.html'
        await cache.put(new Request('/'), freshResponse.clone());
        await cache.put(new Request('/index.html'), freshResponse.clone());
        console.log('[SW] Cached fresh /index.html and /');

        // Cache additional static assets
        const additionalFiles = [
          '/manifest.json',
          '/favicon_big.png',
          '/favicon.ico',
          '/apple-touch-icon.png'
          // add more here as needed
        ];

        for (const file of additionalFiles) {
          try {
            const response = await fetch(file);
            await cache.put(new Request(file), response.clone());
            console.log(`[SW] Cached ${file}`);
          } catch (err) {
            console.warn(`[SW] Failed to cache ${file}:`, err);
          }
        }

      } catch (err) {
        console.warn('[SW] Failed to fetch /index.html during install:', err);
      }
    })
  );
});


self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isIndexRequest = event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html');

  if (isIndexRequest) {
    console.log(`[SW] Intercepting request: ${url.pathname}`);
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const now = Date.now();

        if (cached) {
          const cachedAt = Number(cached.headers.get('sw-cached-at') || 0);
          const age = now - cachedAt;
          const isFresh = age < MAX_AGE_MS;

          console.log(`[SW] Found cached version of ${url.pathname} — age: ${Math.round(age / 1000)}s`);

          if (isFresh) {
            console.log('[SW] Serving fresh-enough cached version');
            return cached;
          }

          console.log('[SW] Cached version is stale — attempting to fetch new');
          try {
            const response = await fetch(event.request, { cache: 'no-store' });
            const cloned = response.clone();
            const headers = new Headers(cloned.headers);
            headers.append('sw-cached-at', now.toString());
            const updated = new Response(await cloned.blob(), {
              status: 200,
              statusText: 'OK',
              headers
            });
            await cache.put(event.request, updated.clone());

            if (url.pathname === '/') {
              await cache.put(new Request('/index.html'), updated.clone());
            } else if (url.pathname.endsWith('/index.html')) {
              await cache.put(new Request('/'), updated.clone());
            }

            console.log('[SW] Updated cache with new version');
            return updated;
          } catch (err) {
            console.warn('[SW] Fetch failed, using stale cached version');
            return cached;
          }

        } else {
          console.log('[SW] No cached version found — trying to fetch');
          try {
            const response = await fetch(event.request);
            await cache.put(event.request, response.clone());

            if (url.pathname === '/') {
              await cache.put(new Request('/index.html'), response.clone());
            } else if (url.pathname.endsWith('/index.html')) {
              await cache.put(new Request('/'), response.clone());
            }

            console.log('[SW] Cached for the first time:', url.pathname);
            return response;
          } catch (err) {
            console.error('[SW] Offline and no cached version available');
            return new Response('Offline and no cached version available', { status: 503 });
          }
        }
      })
    );
  } else {
    // Handle all other requests
    event.respondWith(
      caches.match(event.request).then(resp => {
        if (resp) {
          console.log(`[SW] Serving cached: ${event.request.url}`);
          return resp;
        } else {
          console.log(`[SW] Fetching from network: ${event.request.url}`);
          return fetch(event.request);
        }
      })
    );
  }
});
