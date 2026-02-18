const CACHE_NAME = 'lift-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/apple-touch-icon.png',
    '/icon-192.png',
    '/icon-512.png',
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Let Firebase requests go through network
    if (event.request.url.includes('firestore') || 
        event.request.url.includes('googleapis.com/google') ||
        event.request.url.includes('gstatic.com/firebasejs')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
            )
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});
