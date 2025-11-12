// ============================================
// SERVICE WORKER EN-BUS
// ============================================

const CACHE_NAME = 'en-bus-v1.0.0';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/suivi.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',

    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdn.socket.io/4.7.5/socket.io.min.js',
    

    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://npmcdn.com/flatpickr/dist/themes/dark.css',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/flatpickr',
    'https://cdn.jsdelivr.net/npm/qrcodejs2@0.0.2/qrcode.min.js',
    'https://fonts.googleapis.com/css2?family=Audiowide&family=Exo+2:wght@300;400;600;700&display=swap'

];

// ============================================
// INSTALLATION DU SERVICE WORKER
// ============================================
self.addEventListener('install', (event) => {
    console.log('🔧 [SW] Installation...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ [SW] Cache ouvert');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('✅ [SW] Fichiers mis en cache');
                return self.skipWaiting(); // Active immédiatement
            })
            .catch((error) => {
                console.error('❌ [SW] Erreur installation:', error);
            })
    );
});

// ============================================
// ACTIVATION DU SERVICE WORKER
// ============================================
self.addEventListener('activate', (event) => {
    console.log('🚀 [SW] Activation...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ [SW] Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ [SW] Service Worker activé');
                return self.clients.claim(); // Prend le contrôle immédiatement
            })
    );
});

// ============================================
// STRATÉGIE DE CACHE : Network First
// ============================================
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }

     // ✅ NOUVEAU : Ignorer les WebSocket et Socket.IO
    if (event.request.url.includes('socket.io') || 
        event.request.url.includes('ws://') || 
        event.request.url.includes('wss://')) {
        return; // Ne pas intercepter les connexions temps réel
    }
    
    // Ignorer les requêtes vers l'API
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        // Essayer d'abord le réseau
        fetch(event.request)
            .then((response) => {
                // Si succès, mettre en cache et retourner
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si échec réseau, utiliser le cache
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            console.log('📦 [SW] Depuis cache:', event.request.url);
                            return response;
                        }
                        
                        // Si pas en cache, page offline
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// ============================================
// GESTION DES MESSAGES
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// ============================================
// NOTIFICATIONS PUSH (optionnel)
// ============================================
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Nouvelle notification En-Bus',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'En-Bus', options)
    );
});

// ============================================
// CLICK SUR NOTIFICATION
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// ============================================
// SYNC EN ARRIÈRE-PLAN (optionnel)
// ============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reservations') {
        event.waitUntil(syncReservations());
    }
});

async function syncReservations() {
    try {
        console.log('🔄 [SW] Synchronisation des réservations...');
        // Code de synchronisation ici
    } catch (error) {
        console.error('❌ [SW] Erreur sync:', error);
    }
}

console.log('✅ Service Worker En-Bus chargé');