// sw.js - network-first for HTML, cache-first for assets, auto-reload on update

const CACHE_NAME = 'offline-cache-v10';

// ── Install: skip waiting so new SW activates immediately ──────────────────
self.addEventListener('install', event => {
  console.log('[SW] Install', CACHE_NAME);
  self.skipWaiting(); // take over without waiting for old SW to die
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Pre-cache the shell and static assets
      const assets = ['/manifest.json', '/favicon_big.png'];
      for (const url of assets) {
        try { await cache.add(url); } catch (_) {}
      }
    })
  );
});

// ── Activate: purge old caches, claim all clients ──────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activate', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const oldKeys = keys.filter(k => k !== CACHE_NAME);
        const isUpgrade = oldKeys.length > 0; // only true when replacing an existing SW
        return Promise.all(oldKeys.map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })).then(() => isUpgrade);
      })
      .then(isUpgrade => self.clients.claim().then(() => isUpgrade))
      .then(isUpgrade => {
        // Only reload open tabs when upgrading — not on a fresh first install
        if (!isUpgrade) return;
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
        });
      })
  );
});

// ── Fetch: network-first for HTML navigation, cache-first for assets ───────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isNav = event.request.mode === 'navigate'
    || url.pathname === '/'
    || url.pathname.endsWith('.html');

  if (isNav) {
    // Network-first: always try to get fresh HTML, fall back to cache offline
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(async response => {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
          if (url.pathname === '/') await cache.put(new Request('/index.html'), response.clone());
          if (url.pathname.endsWith('/index.html')) await cache.put(new Request('/'), response.clone());
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match(event.request)
            || await caches.match('/index.html')
            || await caches.match('/');
          return cached || new Response('Offline — no cached version available', { status: 503 });
        })
    );
  } else {
    // Cache-first for static assets (images, manifest, etc.)
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(async response => {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
          return response;
        });
      })
    );
  }
});
