const CACHE_NAME = 'lift-v3';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(['./', './index.html', './manifest.json', './apple-touch-icon.png', './icon-192.png', './icon-512.png'])
                .catch(err => console.log('Cache addAll skipped:', err))
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.hostname.includes('firestore') || url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com') || url.hostname.includes('google.com')) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then(r => { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); return r; })
                .catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(c => c || fetch(event.request).then(r => { if (r.ok) { const cl = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, cl)); } return r; }))
                .catch(() => new Response('', { status: 404 }))
        );
    }
});
