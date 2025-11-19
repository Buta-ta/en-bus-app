// ============================================
// SERVICE WORKER EN-BUS - VERSION AMÉLIORÉE
// ============================================

// ✅ Changez cette version à chaque mise à jour (ex: 'en-bus-v1.0.1')
const CACHE_VERSION = 'en-bus-v1.0.0'; 

// Fichiers essentiels à mettre en cache immédiatement
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    // Assurez-vous que le chemin est correct depuis la racine de votre site
    '/Suivi/suivi.html' 
];

// --- INSTALLATION ---
self.addEventListener('install', (event) => {
    console.log(`🔧 [SW] Installation de la version ${CACHE_VERSION}...`);
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            console.log('✅ [SW] Mise en cache des ressources de base.');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            // Force le nouveau Service Worker à s'activer dès qu'il est installé
            return self.skipWaiting();
        })
    );
});

// --- ACTIVATION ---
self.addEventListener('activate', (event) => {
    console.log(`🚀 [SW] Activation de la version ${CACHE_VERSION}...`);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Supprime tous les anciens caches qui ne correspondent pas à la version actuelle
                    if (cacheName !== CACHE_VERSION) {
                        console.log('🗑️ [SW] Suppression de l\'ancien cache :', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Prend le contrôle de toutes les pages ouvertes immédiatement
            return self.clients.claim();
        })
    );
});

// --- FETCH (INTERCEPTION DES REQUÊTES) ---
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignorer les requêtes qui ne sont pas des GET
    if (request.method !== 'GET') return;

    // Ignorer les requêtes vers l'API pour toujours utiliser le réseau
    if (request.url.includes('/api/')) return;
    
    // Ignorer les requêtes des extensions Chrome, etc.
    if (!request.url.startsWith('http')) return;

    // Stratégie "Network falling back to cache" pour les ressources importantes (HTML, JS, CSS)
    // On veut toujours la version la plus fraîche si possible.
    if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style') {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    // Si la réponse réseau est bonne, on la met en cache
                    if(networkResponse.ok) {
                         const responseClone = networkResponse.clone();
                         caches.open(CACHE_VERSION).then(cache => cache.put(request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Si le réseau échoue, on se rabat sur le cache
                    return caches.match(request);
                })
        );
        return;
    }

    // Stratégie "Cache first" pour les autres ressources (images, polices)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            return cachedResponse || fetch(request).then(networkResponse => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_VERSION).then(cache => cache.put(request, responseClone));
                return networkResponse;
            });
        })
    );
});

// --- GESTION DES MESSAGES ---
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});