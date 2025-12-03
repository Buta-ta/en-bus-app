// ============================================
// SUIVI DE BUS EN TEMPS RÉEL - EN-BUS
// ============================================

// --- Fonctions de Traduction ---
function getLanguage() {
    return localStorage.getItem('enbus_language') || navigator.language.split('-')[0] || 'fr';
}

function applyTranslations() {
    if (typeof translations === 'undefined') {
        console.error("ERREUR: suivi-translations.js introuvable.");
        return;
    }
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

// --- Logique Principale ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Traduire les textes statiques
    applyTranslations();

    // 2. Initialiser la carte Leaflet
    const map = L.map('map').setView([2.8, 17.3], 4); // Vue centrée sur l'Afrique
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    }).addTo(map);

    // 3. Récupérer les informations de l'URL
    const params = new URLSearchParams(window.location.search);
    const busId = params.get('bus');
    const bookingNumber = params.get('booking');
    
    const lang = getLanguage();
    const translation = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};

    // 4. Mettre à jour l'interface avec les informations
    const busIdDisplay = document.getElementById('bus-id-display');
    const statusText = document.getElementById('status-text');

    if (!busId) {
        busIdDisplay.textContent = translation.error_no_bus_id || "ID Manquant";
        statusText.textContent = "Erreur";
        return;
    }
    busIdDisplay.textContent = busId;

    // 5. Initialiser le marqueur du bus
   const busIcon = L.divIcon({
    className: 'bus-marker',
    html: '🚌',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});
    const busMarker = L.marker([0, 0], { icon: busIcon }).addTo(map);
    let firstUpdate = true;

    // 6. Connexion au WebSocket
    const socket = io("https://en-bus-app.onrender.com"); // L'URL de votre backend

    socket.on("connect", () => {
        console.log("✅ Connecté au serveur WebSocket !");
        socket.emit("subscribeToBus", busId);
    });

    // 7. Gérer la mise à jour de la position
    socket.on("updatePosition", (data) => {
        console.log("🛰️ Nouvelle position reçue:", data);
        const { lat, lon } = data;
        const newLatLng = [lat, lon];
        
        busMarker.setLatLng(newLatLng);

        if (firstUpdate) {
            map.setView(newLatLng, 13); // Zoomer sur la position du bus à la première mise à jour
            firstUpdate = false;
        } else {
            map.panTo(newLatLng); // Centrer la carte sur le bus en douceur
        }
        
        // Mettre à jour les informations de statut
        if (statusText) statusText.textContent = translation.status_on_time || "En mouvement";
        updateLastUpdateTime(data.timestamp);
    });

    socket.on("disconnect", () => {
        console.warn("🔌 Déconnecté du serveur WebSocket.");
        if (statusText) statusText.textContent = "Reconnexion...";
    });
});

// --- Fonctions auxiliaires ---
let lastUpdateInterval;
function updateLastUpdateTime(timestamp) {
    const lastUpdateElement = document.getElementById('last-update');
    if (!lastUpdateElement) return;

    if (lastUpdateInterval) clearInterval(lastUpdateInterval);

    const update = () => {
        const lang = getLanguage();
        const translation = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
        const now = new Date();
        const lastUpdateDate = new Date(timestamp);
        const diffSeconds = Math.round((now - lastUpdateDate) / 1000);

        if (diffSeconds < 60) {
            lastUpdateElement.textContent = translation.now || "à l'instant";
        } else {
            const diffMinutes = Math.round(diffSeconds / 60);
            lastUpdateElement.textContent = (typeof translation.minutes_ago === 'function') 
                ? translation.minutes_ago(diffMinutes)
                : `il y a ${diffMinutes} min`;
        }
    };
    
    update();
    lastUpdateInterval = setInterval(update, 30000); // Mettre à jour toutes les 30 secondes
}