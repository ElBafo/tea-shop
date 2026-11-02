// Build replaces these with the exact assets and a content-derived version.
const VERSION = "__BUILD_VERSION__";
const FILES = /* __PRECACHE__ */ [];
const SCOPE = new URL(self.registration.scope);
const ASSET_BASE = new URL('./', self.location.href);
const PREFIX = `tea-shop-shell-v3:${SCOPE.pathname}:`;
const CACHE = PREFIX + VERSION;
const SHELL = new URL('index.html', SCOPE).href;
const ASSETS = FILES.map(path => new URL(path, ASSET_BASE).href);

self.addEventListener('install', event => {
  // Installation succeeds only after this version's HTML AND assets are available.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll([...new Set([...ASSETS, SHELL])].map(url=>new Request(url,{cache:'reload'})));
    } catch (error) {
      // A failed download must not displace a usable previous cache later.
      await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const own = (await caches.keys()).filter(key=>key.startsWith(PREFIX) && key!==CACHE);
    // Retain one previous shell for tabs still using old hashed assets.
    await Promise.all(own.slice(0,-1).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== SCOPE.origin) return;
  // Release must never intercept the review preview or other applications.
  if (SCOPE.pathname === '/tea-shop/' && url.pathname.startsWith('/tea-shop/preview/')) return;
  if (request.mode === 'navigate') {
    if (!url.pathname.startsWith(SCOPE.pathname)) return;
    event.respondWith((async () => {
      const cached = await (await caches.open(CACHE)).match(SHELL);
      return cached || fetch(request);
    })());
    return;
  }
  if (!url.pathname.startsWith(ASSET_BASE.pathname)) return;
  // Only this app's built assets are cacheable; never cache arbitrary responses.
  const known = ASSETS.includes(url.href);
  const hashed = url.pathname.startsWith(ASSET_BASE.pathname+'assets/');
  if (!known && !hashed) return;
  event.respondWith((async () => {
    const current = await (await caches.open(CACHE)).match(request);
    if (current) return current;
    for (const key of (await caches.keys()).filter(key=>key.startsWith(PREFIX))) {
      const old = await (await caches.open(key)).match(request);
      if (old) return old;
    }
    return fetch(request);
  })());
});
