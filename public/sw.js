/**
 * Service Worker - Workbox injectManifest Strategy
 * 
 * Bu fayl vite-plugin-pwa tomonidan build vaqtida qayta ishlanadi.
 * self.__WB_MANIFEST avtomatik ravishda inject qilinadi.
 */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { registerRoute, setCatchHandler } = workbox.routing;
const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;
const { BackgroundSyncPlugin } = workbox.backgroundSync;

// Skip waiting and claim clients immediately
self.skipWaiting();
self.clients.claim();

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache strategies for different types of requests
// Navigation requests (HTML pages) - NetworkFirst with fallback to offline page
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'pages',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// API requests - NetworkFirst with background sync
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new BackgroundSyncPlugin('api-queue', {
                maxRetentionTime: 24 * 60, // 24 hours
            }),
        ],
    })
);

// Images - StaleWhileRevalidate with expiration
registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Fonts - CacheFirst with long expiration
registerRoute(
    ({ request }) => request.destination === 'font',
    new CacheFirst({
        cacheName: 'fonts',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
        ],
    })
);

// Static assets (JS, CSS) - CacheFirst
registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.url.includes('/assets/'),
    new CacheFirst({
        cacheName: 'static-resources',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
        ],
    })
);

// External CDN resources - StaleWhileRevalidate
registerRoute(
    ({ url }) =>
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdnjs.cloudflare.com'),
    new StaleWhileRevalidate({
        cacheName: 'external-resources',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    })
);

// Catch handler for offline fallback
setCatchHandler(async ({ request }) => {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
        return caches.match('/offline.html');
    }

    // Return placeholder image for failed image requests
    if (request.destination === 'image') {
        return new Response(
            '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Image unavailable</text></svg>',
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                },
            }
        );
    }

    // Return empty response for other requests
    return new Response('', {
        status: 503,
        statusText: 'Service Unavailable',
    });
});

// Background sync for failed API requests
self.addEventListener('sync', (event) => {
    if (event.tag === 'api-queue') {
        event.waitUntil(processBackgroundSync());
    }
});

async function processBackgroundSync() {
    const cache = await caches.open('api-queue');
    const requests = await cache.keys();

    for (const request of requests) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                await cache.delete(request);
                console.log('Background sync successful:', request.url);
            }
        } catch (error) {
            console.log('Background sync failed:', request.url, error);
        }
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: true,
        tag: data.tag || 'default',
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'IsoCom CRM', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Open new window if app is not open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: '1.0.0' });
    }
});

// Install event
self.addEventListener('install', (event) => {
    console.log('Service worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service worker activating...');
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Remove caches that don't match our current cache names
                            const validCaches = ['pages', 'api-cache', 'images', 'fonts', 'static-resources', 'external-resources'];
                            return !validCaches.includes(cacheName);
                        })
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
        ])
    );
});
