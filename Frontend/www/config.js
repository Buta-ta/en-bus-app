// Fichier : Frontend/config.js

// Détecte si on est en local ou en production
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Configuration globale de l'application
const APP_CONFIG = {
    API_URL: isLocal
        ? 'http://localhost:3000'
        : 'https://en-bus-app.onrender.com' // ✅ L'URL DE VOTRE BACKEND RENDER
};

console.log('🔧 Configuration chargée. API URL:', APP_CONFIG.API_URL);