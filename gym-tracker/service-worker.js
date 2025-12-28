/**
 * GymTracker Service Worker
 * מאפשר עבודה אופליין וביצועים מהירים
 */

const CACHE_NAME = 'gymtracker-v1';
const STATIC_CACHE = 'gymtracker-static-v1';
const DYNAMIC_CACHE = 'gymtracker-dynamic-v1';

// קבצים שיש לשמור ב-Cache תמיד
const STATIC_ASSETS = [
    '/gym-tracker/',
    '/gym-tracker/index.html',
    '/gym-tracker/workout.html',
    '/gym-tracker/exercises.html',
    '/gym-tracker/stats.html',
    '/gym-tracker/settings.html',
    '/gym-tracker/css/main.css',
    '/gym-tracker/js/app.js',
    '/gym-tracker/js/supabase-client.js',
    '/gym-tracker/js/storage-manager.js',
    '/gym-tracker/manifest.json',
    // External libraries
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// ====================================
// Install Event - Cache Static Assets
// ====================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((err) => {
                console.error('[SW] Failed to cache static assets:', err);
            })
    );
});

// ====================================
// Activate Event - Clean Old Caches
// ====================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            // Delete old cache versions
                            return name.startsWith('gymtracker-') && 
                                   name !== STATIC_CACHE && 
                                   name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// ====================================
// Fetch Event - Serve from Cache / Network
// ====================================

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests except for CDN assets
    if (url.origin !== location.origin && !url.href.includes('cdn.jsdelivr.net')) {
        return;
    }
    
    // API requests - Network First
    if (url.pathname.includes('/rest/v1/') || url.hostname.includes('supabase')) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // Static assets - Cache First
    event.respondWith(cacheFirst(request));
});

// ====================================
// Caching Strategies
// ====================================

/**
 * Cache First Strategy
 * נסה לקחת מהCache, אם אין - לך לרשת
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        fetchAndCache(request);
        return cachedResponse;
    }
    
    return fetchAndCache(request);
}

/**
 * Network First Strategy
 * נסה לקחת מהרשת, אם נכשל - חזור לCache
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If all fails, return offline page or error
        return new Response(
            JSON.stringify({ error: 'אין חיבור לאינטרנט', offline: true }),
            { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Fetch and Cache
 * מביא מהרשת ושומר בCache
 */
async function fetchAndCache(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        
        // Try to return from cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        if (request.destination === 'document') {
            return caches.match('/gym-tracker/offline.html');
        }
        
        throw error;
    }
}

// ====================================
// Background Sync (for offline saves)
// ====================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-workouts') {
        event.waitUntil(syncWorkouts());
    }
});

async function syncWorkouts() {
    // This will be called when we come back online
    // The actual sync logic is in storage-manager.js
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_COMPLETE',
            timestamp: Date.now()
        });
    });
}

// ====================================
// Push Notifications (future feature)
// ====================================

self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body || 'הודעה חדשה',
        icon: '/gym-tracker/assets/icons/icon-192.png',
        badge: '/gym-tracker/assets/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/gym-tracker/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'GymTracker', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const url = event.notification.data?.url || '/gym-tracker/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // If a window is already open, focus it
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new window
                return clients.openWindow(url);
            })
    );
});

// ====================================
// Message Handler (communication with app)
// ====================================

self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            caches.keys().then((names) => {
                names.forEach((name) => caches.delete(name));
            });
            break;
            
        case 'CACHE_URLS':
            if (data && data.urls) {
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.addAll(data.urls);
                });
            }
            break;
    }
});

console.log('[SW] Service Worker loaded');
