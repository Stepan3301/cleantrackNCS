// CleanTrack Control Center Service Worker
const CACHE_NAME = 'cleantrack-cache-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/favicon.ico'
];

// Assets that should never be cached
const NEVER_CACHE_PATHS = [
  '/api/',
  'supabase.co'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper function to determine if a request should be cached
const shouldCache = (url) => {
  // Don't cache API or Supabase requests
  if (NEVER_CACHE_PATHS.some(path => url.includes(path))) {
    return false;
  }
  
  // Cache static assets (JS, CSS, images, fonts)
  const fileExtension = url.split('.').pop();
  if (['js', 'css', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'woff', 'woff2', 'ttf', 'eot'].includes(fileExtension)) {
    return true;
  }
  
  return false;
};

// Fetch event - network first for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('supabase')) {
    return;
  }
  
  // Handle API and Supabase requests - always go to network
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('/api/') ||
      event.request.url.includes('/rest/') ||
      event.request.url.includes('/auth/')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('[Service Worker] Network error fetching', event.request.url, error);
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // For navigation requests (HTML documents), use network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the fresh response for future offline access
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, try to serve the offline page
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // For static assets, use cache first with network fallback
  if (shouldCache(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response immediately
            
            // Update cache in the background (cache-then-network)
            const fetchPromise = fetch(event.request).then(networkResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
              return networkResponse;
            }).catch(() => {
              // Failed to update cache, continue with cached version
            });
            
            return cachedResponse;
          }
          
          // Not in cache, get from network and cache for next time
          return fetch(event.request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
              return response;
            });
        })
    );
    return;
  }
  
  // Default strategy - network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Clearing cache by request');
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return caches.open(CACHE_NAME);
      }).then(() => {
        // Notify the client that cache was cleared
        if (event.source) {
          event.source.postMessage({
            type: 'CACHE_CLEARED'
          });
        }
      })
    );
  }
}); 