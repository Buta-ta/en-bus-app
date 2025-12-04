// Fichier : Frontend/config.js

// Détecte si on est sur Capacitor natif (Android/iOS)
const isNative = window.Capacitor?.isNativePlatform?.() || window.Capacitor?.isNative;

// Détecte si on est en local sur navigateur (dev)
const isLocalBrowser = !isNative && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Configuration globale de l'application
const APP_CONFIG = {
    API_URL: isLocalBrowser
        ? 'http://localhost:3000'      // Dev sur navigateur
        : 'https://en-bus-app.onrender.com'  // ✅ Natif (Android/iOS) + PWA production
};

console.log('🔧 Configuration chargée');
console.log('   📱 Plateforme native:', isNative);
console.log('   🌐 API URL:', APP_CONFIG.API_URL);