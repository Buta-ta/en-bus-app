// ============================================
// SERVICE WORKER EN-BUS - CORRIGÉ
// ============================================

const CACHE_VERSION = 'en-bus-v1.0.2'; // ⬅️ Changez la version !

// ✅ Seulement les fichiers qui EXISTENT (minuscules)
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './style.css',
    './suivi/suivi.html',       // ✅ minuscule
    './suivi/suivi.js',
    './suivi/translation.js'
];

// --- INSTALLATION (tolérante aux erreurs) ---
self.addEventListener('install', (event) => {
    console.log(`🔧 [SW] Installation de la version ${CACHE_VERSION}...`);
    event.waitUntil(
        caches.open(CACHE_VERSION).then(async (cache) => {
            for (const url of STATIC_ASSETS) {
                try {
                    await cache.add(url);
                    console.log(`✅ Cached: ${url}`);
                } catch (err) {
                    console.warn(`⚠️ Échec cache: ${url}`);
                }
            }
        }).then(() => self.skipWaiting())
    );
});

// --- ACTIVATION ---
self.addEventListener('activate', (event) => {
    console.log(`🚀 [SW] Activation de la version ${CACHE_VERSION}...`);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_VERSION) {
                        console.log('🗑️ [SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// --- FETCH (corrigé pour Socket.IO) ---
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = request.url;
    
    // ✅ Ignorer ces requêtes (ne pas intercepter)
    if (request.method !== 'GET') return;
    if (url.includes('/api/')) return;
    if (url.includes('socket.io')) return;
    if (url.includes('onrender.com')) return;
    if (url.includes('unpkg.com')) return;
    if (url.includes('cdn.')) return;
    if (url.includes('tile.openstreetmap')) return;
    if (!url.startsWith('http')) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                if (response && response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});