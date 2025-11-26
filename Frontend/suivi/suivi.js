// Fichier : Suivi/suivi.js

// --- Fonctions de traduction ---
function getLanguage() {
    return localStorage.getItem('enbus_language') || 'fr';
}

function applyTranslations() {
    const lang = getLanguage();
    document.documentElement.lang = lang;
    const translation = translations[lang] || translations.fr;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translation[key]) {
            el.innerHTML = translation[key];
        }
    });
}

// --- Logique principale de la page ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Appliquer les traductions au chargement
    applyTranslations();

    // 2. Récupérer les paramètres de l'URL
    const params = new URLSearchParams(window.location.search);
    const busId = params.get('bus');
    const bookingNumber = params.get('booking');
    
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // 3. Mettre à jour l'affichage initial
    const busIdDisplay = document.getElementById('bus-id-display');
    if (busId) {
        busIdDisplay.textContent = busId;
    } else {
        busIdDisplay.textContent = translation.error_no_bus_id || "ID Manquant";
        // Gérer l'erreur, peut-être cacher la carte
    }

    // Le reste de votre code pour initialiser la carte et le WebSocket...
    // ...
});

// Exemple de mise à jour de l'heure
function updateLastUpdateTime(timestamp) {
    const lastUpdateElement = document.getElementById('last-update');
    // ... votre logique pour calculer le temps écoulé ...
    // Utilisez les traductions 'now' et 'minutes_ago' ici
}