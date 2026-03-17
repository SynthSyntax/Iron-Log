const CACHE_NAME = 'ironlog-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/style.css',
  '/src/main.js',
  '/src/db.js',
  '/src/exercises-seed.js',
  '/src/utils.js',
  '/src/router.js',
  '/src/timer.js',
  '/src/views/home.js',
  '/src/views/workout.js',
  '/src/views/exercise-picker.js',
  '/src/views/history.js',
  '/src/views/workout-detail.js',
  '/src/views/exercises.js',
  '/src/views/settings.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install — cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // For Google Fonts and external resources, use network-first
  if (event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For app assets, use cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
