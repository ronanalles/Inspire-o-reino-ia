const CACHE_NAME = 'inspire-o-reino-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cache app shell
        cache.addAll(urlsToCache);
        // Cache fonts
        return cache.addAll([
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap'
        ]);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle font requests from fonts.gstatic.com
  if (event.request.url.startsWith('https://fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          networkResponse => {
            // If we get a 404 for a navigation request, serve the app shell instead.
            if (networkResponse.status === 404 && event.request.mode === 'navigate') {
              console.log('Fetch resulted in 404 for navigation, serving index.html from cache.');
              return caches.match('/index.html');
            }
            
            // Check if we received a valid response to cache
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Do not cache API requests for bible text or Gemini
            if (event.request.url.includes('bible-api.com') || event.request.url.includes('generativelanguage.googleapis.com')) {
                return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          // Network request failed completely. 
          // If it's a navigation request, serve the index.html from cache.
          console.log('Fetch failed completely; returning offline page instead.', error);
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});