const CACHE_NAME = 'sermate-ai-v3';

// Install Event - Clean, resilient caching without blocking startup
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event - Clean old cached entries
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first for assets, graceful fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET and skip API/websocket/dev requests
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') ||
    event.request.url.includes('@vite') ||
    event.request.url.includes('node_modules')
  ) {
    return;
  }

  // Network first strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./') || caches.match('/index.html');
          }
          return new Response('', { status: 408, statusText: 'Request timed out' });
        });
      })
  );
});
