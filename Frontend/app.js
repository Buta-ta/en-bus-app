// ============================================
// CONFIGURATION ET CONSTANTES
// ============================================

// ✅ Configuration API Backend
// ============================================
// CONFIGURATION ET CONSTANTES
// ============================================

// app.js

// Fichier : Frontend/app.js

// Détecte si on est en local (sur votre PC) ou en production (sur Vercel)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_CONFIG = {
    baseUrl: isLocal
        ? 'http://localhost:3000'
        : 'https://en-bus-app.onrender.com' // ✅ METTEZ L'URL DE VOTRE BACKEND RENDER
};

console.log('API URL configurée :', API_CONFIG.baseUrl);

console.log('API URL:', API_CONFIG.baseUrl);

const CONFIG = {
    CHILD_TICKET_PRICE: 5000,
    MAX_BAGGAGE_PER_PERSON: 5,
    SEAT_TOTAL: 61,
    OCCUPANCY_RATE: { min: 0.3, max: 0.5 },
    STORAGE_KEY: 'enbus_reservations',
    
    // ✅ NOUVEAUX DÉLAIS DE PAIEMENT
    MOBILE_MONEY_PAYMENT_DEADLINE_MINUTES: 30, // 30 minutes pour MTN/Airtel
    AGENCY_PAYMENT_DEADLINE_HOURS: 10, 
    // ✅ CORRECTION : AJOUTER CETTE LIGNE
    AGENCY_PAYMENT_MIN_HOURS: 12,               // Délai minimum avant départ pour autoriser le paiement en agence (ex: 12h)         // 10 heures pour agence
    
    // ✅ NUMÉROS MARCHANDS
    MTN_MERCHANT_NUMBER: '+242 06 150 79 47',
    AIRTEL_MERCHANT_NUMBER: '+242 05 150 79 47',
    
    SCANNER_FPS: 10,
    SCANNER_QRBOX: 250
};
// ============================================
// DONNÉES DE L'APPLICATION
// ============================================


// ============================================
// DONNÉES DE L'APPLICATION
// ============================================
const companies = [
    { id: 1, name: "Océan du Nord", rating: 4.2, country: "Congo" },
    { id: 2, name: "Trans Bony", rating: 4.0, country: "Congo" },
    { id: 3, name: "Stellimac", rating: 4.1, country: "Congo" },
    { id: 4, name: "United Express", rating: 4.0, country: "Multi" },
    { id: 5, name: "Buca Voyages", rating: 3.9, country: "Multi" },
    { id: 6, name: "Saint Denis Voyage", rating: 4.1, country: "Multi" },
    { id: 7, name: "Touristique Express", rating: 4.3, country: "Cameroun" },
    { id: 8, name: "Garantie Express", rating: 4.4, country: "Cameroun" },
    { id: 9, name: "Finexs Voyage", rating: 4.2, country: "Cameroun" },
    { id: 10, name: "Vatican Express", rating: 4.0, country: "Cameroun" },
    { id: 11, name: "OT-CI", rating: 4.3, country: "Côte d'Ivoire" },
    { id: 12, name: "STM Voyageurs", rating: 4.1, country: "Multi" },
    { id: 13, name: "STC", rating: 4.4, country: "Ghana" },
    { id: 14, name: "ABC Transport", rating: 4.2, country: "Nigeria" },
    { id: 15, name: "God is Good Motors", rating: 4.0, country: "Nigeria" }
];


const agencies = [
    { 
        city: 'Brazzaville', 
        name: 'Agence En-Bus Brazzaville Centre',
        address: 'Avenue de l\'Indépendance, en face du marché Total',
        phone: '+242 06 123 4567',
        hours: 'Lun-Sam : 7h - 19h / Dim : 8h - 14h',
        coords: [-4.2634, 15.2429]
    },
    { 
        city: 'Pointe-Noire', 
        name: 'Agence En-Bus Pointe-Noire',
        address: 'Rue Loango, près de la Poste Centrale',
        phone: '+242 06 765 4321',
        hours: 'Lun-Sam : 7h - 18h',
        coords: [-4.7947, 11.8634]
    },
    { 
        city: 'Dolisie', 
        name: 'Agence En-Bus Dolisie',
        address: 'Avenue Patrice Lumumba, gare routière',
        phone: '+242 06 555 1234',
        hours: 'Lun-Sam : 7h - 17h',
        coords: [-4.2064, 12.6686]
    },
    { 
        city: 'Yaoundé', 
        name: 'Agence En-Bus Yaoundé',
        address: 'Boulevard du 20 Mai, quartier du Lac',
        phone: '+237 6 77 88 99 00',
        hours: 'Lun-Sam : 7h - 18h',
        coords: [3.8480, 11.5021]
    },
    { 
        city: 'Douala', 
        name: 'Agence En-Bus Douala',
        address: 'Avenue de la Liberté, Akwa',
        phone: '+237 6 99 88 77 66',
        hours: 'Lun-Sam : 7h - 19h',
        coords: [4.0511, 9.7679]
    }
];

// ============================================
// 📦 ÉTAT GLOBAL DE L'APPLICATION
// ============================================

// --- Variables pour les timers ---
let frontendCountdownInterval = null; 
// --- Données dynamiques ---
let allRouteTemplates = []; // Pour les suggestions de la barre de recherche
let allReservations = []; // Pour la page "Mes réservations"

// --- État principal de l'application ---
let appState = {
    currentSearch: {},
    selectedBus: null,
    selectedReturnBus: null,
    isSelectingReturn: false,
    selectedSeats: [],
    selectedReturnSeats: [],
    occupiedSeats: [],
    occupiedReturnSeats: [],
    passengerInfo: [],
    departurePicker: null,
    passengerCounts: { adults: 1, children: 0 },
    baggageCounts: {},
    currentResults: [],
    currentReservation: null
};

// --- État des filtres de la page de résultats ---
let activeFilters = {
    company: 'all',
    tripType: 'all',
    priceRange: { min: 0, max: 100000 },
    departureTime: 'all',
    amenities: [],
    sortBy: 'departure',
    departureLocation: 'all'
};
// ✅ AJOUTEZ CETTE LIGNE
let refreshPassengerSelectorUI = () => {}; // Variable globale initialisée avec une fonction vide


// ============================================
// UTILITAIRES
// ============================================
const Utils = {
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    formatDate(date, lang = 'fr') { // On ajoute 'lang' comme paramètre
    const locale = (lang === 'en') ? 'en-US' : 'fr-FR'; // On choisit la locale
    return new Date(date).toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
},


    formatDateTime(date) {
        return new Date(date).toLocaleString("fr-FR", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    },




    generateBookingNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EB-${timestamp.slice(-6)}${random}`;
},
    

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const patterns = [
            /^\+\d{1,3}\s?\d{1,4}\s?\d{3,4}\s?\d{3,4}$/,
            /^00\d{1,3}\s?\d{1,4}\s?\d{3,4}\s?\d{3,4}$/,
            /^\d{2,4}\s?\d{3,4}\s?\d{3,4}$/,
            /^\d{10,15}$/
        ];
        
        return patterns.some(pattern => pattern.test(phone.trim()));
    },

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getAmenityIcon(type) {
        const icons = {
            wifi: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1,9l2,2c4.97-4.97,13.03-4.97,18,0l2-2C18.9,4.93,7.1,4.93,1,9z M5,13l2,2c2.76-2.76,7.24-2.76,10,0l2-2 C16.93,10.93,9.07,10.93,5,13z M9,17l3,3l3-3C13.93,15.93,11.07,15.93,9,17z"></path></svg>',
            wc: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 8.89C21.99 7.8 21.1 7 20 7H4c-1.1 0-2 .8-2 1.89l-1.89 11.22C-.11 21.65.15 22 1.21 22h21.57c1.06 0 1.32-.35 1.11-1.89L21.99 8.89zM9 18H7v-6h2v6zm5 0h-2v-6h2v6zm5 0h-2v-6h2v6zm-1-9.56c0-1.35-1.15-2.44-2.5-2.44s-2.5 1.09-2.5 2.44V11h5V8.44z"></path></svg>',
            prise: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"></path></svg>',
            clim: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S14.21,8,12,8z M12,14c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S13.1,14,12,14z M19.78,10.66L17.3,8.18l1.41-1.41l2.47,2.47L19.78,10.66z M4.72,10.66l-2.47-2.47l1.41-1.41l2.47,2.47 L4.72,10.66z M10,3h4v3h-4V3z M10.66,19.78l-2.47,2.47l1.41,1.41l2.47-2.47L10.66,19.78z M17.3,15.82l-1.41,1.41l2.47,2.47 l1.41-1.41L17.3,15.82z M3,14H0v-4h3V14z M21,14h3v-4h-3V14z M14,21h-4v3h4V21z"></path></svg>',
            pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8 s8,3.59,8,8S16.41,20,12,20z M12.5,7H11v6l5.25,3.15l0.75-1.23l-4.5-2.67V7z"></path></svg>',
            direct: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"></path></svg>'
        };
        return icons[type] || '';
    },

    getDurationInMinutes(duration) {
        const parts = duration.match(/(\d+)h?\s*(\d+)?m?/);
        if (!parts) return 0;
        const hours = parseInt(parts[1]) || 0;
        const minutes = parseInt(parts[2]) || 0;
        if (duration.includes('h')) {
            return hours * 60 + minutes;
        }
        return hours;
    },

    getTimeCategory(time) {
        const hour = parseInt(time.split(':')[0]);
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    },


    // ✅ NOUVELLE FONCTION UTILITAIRE
    calculateTotalPrice(state) {
        let totalPrice = 0;
        let ticketsPrice = 0;
        let returnTicketsPrice = 0;
        let baggagePrice = 0;
        
        // 1. Calcul du trajet ALLER
        if (state.selectedBus && state.selectedSeats?.length > 0) {
            const numAdults = state.passengerCounts.adults || 0;
            const numSeats = state.selectedSeats.length;
            
            const adultsSeats = Math.min(numSeats, numAdults);
            const childrenSeats = numSeats - adultsSeats;
            
            ticketsPrice = (adultsSeats * (state.selectedBus.price || 0)) + (childrenSeats * CONFIG.CHILD_TICKET_PRICE);
        }
        
        // 2. Calcul du trajet RETOUR
        if (state.currentSearch.tripType === "round-trip" && state.selectedReturnBus && state.selectedReturnSeats?.length > 0) {
            const numAdults = state.passengerCounts.adults || 0;
            const numSeats = state.selectedReturnSeats.length;

            const adultsSeats = Math.min(numSeats, numAdults);
            const childrenSeats = numSeats - adultsSeats;
            
            returnTicketsPrice = (adultsSeats * (state.selectedReturnBus.price || 0)) + (childrenSeats * CONFIG.CHILD_TICKET_PRICE);
        }
        
        // 3. Calcul des BAGAGES (Aller uniquement pour l'instant)
        if (state.baggageCounts && Object.keys(state.baggageCounts).length > 0 && state.selectedBus?.baggageOptions) {
             Object.values(state.baggageCounts).forEach(paxBaggage => {
                baggagePrice += (paxBaggage.standard || 0) * (state.selectedBus.baggageOptions.standard.price || 0);
                baggagePrice += (paxBaggage.oversized || 0) * (state.selectedBus.baggageOptions.oversized.price || 0);
            });
        }
        
        totalPrice = ticketsPrice + returnTicketsPrice + baggagePrice;
        
        return {
            total: totalPrice,
            tickets: ticketsPrice,
            returnTickets: returnTicketsPrice,
            baggage: baggagePrice
        };
    },






// Dans app.js, à l'intérieur de const Utils = { ... }

// ✅ 1. FONCTION DE GÉNÉRATION DE LA CHAÎNE POUR LE QR CODE
// Dans app.js, à l'intérieur de const Utils = { ... }

generateQRCodeData(reservation, isReturn = false) {
    // 1. Récupérer les informations de base
    const bookingNumber = reservation.bookingNumber;
    const mainPassengerName = reservation.passengers[0]?.name || 'N/A';
    const totalPassengers = reservation.passengers.length;

    let travelDate, travelType, busIdentifier; // ✅ Déclaration ici

    // 2. Déterminer les données pour l'aller ou le retour
    if (isReturn && reservation.returnDate) {
        travelDate = reservation.returnDate;
        travelType = 'R'; // Retour
        busIdentifier = reservation.returnBusIdentifier || 'N/A'; // On lit le bon champ
    } else {
        travelDate = reservation.date;
        travelType = 'A'; // Aller
        busIdentifier = reservation.busIdentifier || 'N/A'; // On lit le bon champ
    }

    // 3. Assembler la chaîne de caractères
    const qrString = [
        bookingNumber,
        travelDate,
        mainPassengerName,
        totalPassengers,
        travelType,
        busIdentifier // Maintenant, cette variable existe
    ].join('|');

    console.log(`✅ Chaîne QR Code générée (v4.0 avec Bus ID):`, qrString);
    
    return qrString;
},
// ✅ 2. FONCTION DE DÉCODAGE (MISE À JOUR POUR LE NOUVEAU FORMAT)
decodeQRCodeData(qrString) {
    try {
        const parts = qrString.split('|');
        
        // Vérifier si le format est correct (5 parties)
        if (parts.length === 6) {
            return {
                valid: true,
                version: "4.0", // Nouvelle version
                bookingNumber: parts[0],
                travelDate: parts[1],
                mainPassengerName: parts[2],
                totalPassengers: parseInt(parts[3]),
                travelType: parts[4] === 'A' ? 'Aller' : 'Retour',
                busIdentifier: parts[5] // ✅ Numéro de bus
            };
        }
        
        // Tentative de décoder l'ancien format JSON par sécurité
        const data = JSON.parse(qrString);
        if (data.v === "2.0") {
            // ... (logique pour l'ancien format)
        }
        
        throw new Error('Format de QR Code inconnu ou invalide.');

    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
},

// ✅ 3. FONCTION DE GÉNÉRATION DE L'IMAGE (INCHANGÉE MAIS GARDÉE POUR LA COHÉRENCE)
async generateQRCodeBase64(text, size = 200) {
    return new Promise((resolve, reject) => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            document.body.appendChild(tempDiv);
            
            new QRCode(tempDiv, {
                text: text,
                width: size,
                height: size,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
            
            setTimeout(() => {
                const canvas = tempDiv.querySelector('canvas');
                if (canvas) {
                    const base64 = canvas.toDataURL('image/png');
                    document.body.removeChild(tempDiv);
                    resolve(base64);
                } else {
                    document.body.removeChild(tempDiv);
                    reject(new Error('Le canvas du QR Code n\'a pas pu être généré.'));
                }
            }, 100);
            
        } catch (error) {
            reject(error);
        }
    });
}
}



// Fichier: app.js

function getLiveStatusIcon(status) {
    switch (status) {
        case 'ON_TIME': return '🟢';
        case 'DELAYED': return '🟠';
        case 'CANCELLED': return '🔴';
        case 'ARRIVED': return '✅';
        default: return 'ℹ️';
    }
}

function getLiveStatusText(liveStatus, translation) {
    if (!liveStatus || !liveStatus.status) return '';
    
    switch (liveStatus.status) {
        case 'ON_TIME':
            return translation.live_status_on_time || "À l'heure";
        case 'DELAYED':
            return translation.live_status_delayed(liveStatus.delayMinutes, liveStatus.reason);
        case 'CANCELLED':
            return translation.live_status_cancelled(liveStatus.reason);
        case 'ARRIVED':
            return translation.live_status_arrived;
        default:
            return liveStatus.status; // Affiche le statut brut si non traduit
    }
}


// ============================================
// 🌍 INTERNATIONALISATION (i18n)
// ============================================

function setLanguage(lang) {
    localStorage.setItem('enbus_language', lang);
    applyLanguage(lang);
}




function getLanguage() {
    return localStorage.getItem('enbus_language') || navigator.language.split('-')[0] || 'fr';
}

function applyLanguage(lang = getLanguage()) {
    if (typeof translations === 'undefined') return;

    localStorage.setItem('enbus_language', lang);
    document.documentElement.lang = lang;
    const translation = translations[lang] || translations.fr;

    // ===================================
    // ✅ TRADUCTION DU TITRE DE LA PAGE
    // ===================================
    if (translation.page_title) {
        document.title = translation.page_title;
    }

    // Cette boucle va trouver et traduire "Sièges :" et "Prix :"
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translation[key]) {
            el.innerHTML = translation[key];
        }
    });

    // ===========================================
    // ✅ TRADUCTION DES PLACEHOLDERS SPÉCIFIQUES
    // ===========================================
    const smartSearchInput = document.getElementById('smart-search-input');
    if (smartSearchInput && translation.smart_search_placeholder) {
        smartSearchInput.placeholder = translation.smart_search_placeholder;
    }
    // On rafraîchit les composants dynamiques
    updateDynamicTexts(lang); // Met à jour le "1 Adulte..."
    populatePopularDestinations(); // Met à jour "À partir de..."
    setupDatePickers(); // Met à jour le placeholder du calendrier
}
    
    // ====================================================
    // ✅ LA MODIFICATION EST ICI
    // ====================================================
    // Met à jour tous les composants dont l'affichage dépend de la langue

    // 1. Met à jour le sélecteur de passagers
    if (typeof refreshPassengerSelectorUI === 'function') {
        refreshPassengerSelectorUI();
    }
    
    // 2. Met à jour les destinations populaires
    if (typeof populatePopularDestinations === 'function') {
        populatePopularDestinations();
    }
    
    // 3. Met à jour le calendrier
    if (typeof setupDatePickers === 'function') {
        setupDatePickers();
    }

// Mettez cette fonction avec vos autres fonctions globales

function updateDynamicTexts(lang) {
    // Sécurité : ne rien faire si les traductions ne sont pas prêtes
    if (typeof translations === 'undefined') return;
    
    const translation = translations[lang] || translations.fr;
    
    // --- 1. Traduction du résumé des passagers ---
    const summaryEl = document.getElementById('passenger-summary');
    if (summaryEl && typeof translation.passenger_summary === 'function') {
        summaryEl.textContent = translation.passenger_summary(
            appState.passengerCounts.adults,
            appState.passengerCounts.children
        );
    }
    
    // --- 2. Traduction des labels DANS le dropdown ---
    const adultsLabel = document.querySelector('#passenger-dropdown label[data-i18n="search_form_adults"]');
    if (adultsLabel && translation.search_form_adults) {
        adultsLabel.innerHTML = translation.search_form_adults;
    }
    
    const childrenLabel = document.querySelector('#passenger-dropdown label[data-i18n="search_form_children"]');
    if (childrenLabel && translation.search_form_children) {
        childrenLabel.innerHTML = translation.search_form_children;
    }

    // --- 3. (Futur) Traduction d'autres textes dynamiques ---
    // ...
}
// Fonction globale pour changer la langue
window.changeLanguage = function(lang) {
    setLanguage(lang); // setLanguage contient applyLanguage
    
    // ✅ On force la reconstruction du calendrier avec la nouvelle langue
    if (typeof setupDatePickers === 'function') {
        setupDatePickers();
    }
};



/**
 * Met à jour l'interface du sélecteur de passagers (chiffres et textes traduits).
 */
function updatePassengerSelectorUI() {
    const adultsCount = document.getElementById("adults-count");
    const childrenCount = document.getElementById("children-count");
    const summary = document.getElementById("passenger-summary");
    const dropdown = document.getElementById("passenger-dropdown");
    
    // Sécurité pour éviter les erreurs si les éléments n'existent pas
    if (!adultsCount || !childrenCount || !summary || !dropdown) {
        return;
    }

    const adultsLabel = dropdown.querySelector('label[data-i18n="search_form_adults"]');
    const childrenLabel = dropdown.querySelector('label[data-i18n="search_form_children"]');
    
    // Mettre à jour les compteurs numériques
    adultsCount.textContent = appState.passengerCounts.adults;
    childrenCount.textContent = appState.passengerCounts.children;
    
    // Gérer l'état des boutons de décrémentation
    dropdown.querySelector('[data-type="adults"][data-action="decrement"]').disabled = appState.passengerCounts.adults <= 1;
    dropdown.querySelector('[data-type="children"][data-action="decrement"]').disabled = appState.passengerCounts.children <= 0;
    
    // --- Traduction des textes ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    // 1. Traduire le résumé principal (ex: "1 Adulte, 2 Enfants")
    if (typeof translation.passenger_summary === 'function') {
        summary.textContent = translation.passenger_summary(appState.passengerCounts.adults, appState.passengerCounts.children);
    }
    
    // 2. Traduire les labels dans le dropdown
    if (adultsLabel && translation.search_form_adults) {
        adultsLabel.innerHTML = translation.search_form_adults;
    }
    if (childrenLabel && translation.search_form_children) {
        childrenLabel.innerHTML = translation.search_form_children;
    }
}


// DANS app.js, à ajouter avec les autres fonctions utilitaires
function startFrontendCountdown() {
    // On nettoie l'ancien minuteur
    if (frontendCountdownInterval) {
        clearInterval(frontendCountdownInterval);
    }

    // On récupère TOUS les conteneurs de décompteur
    const countdownContainers = document.querySelectorAll('#payment-countdown-container');

    // S'il n'y en a aucun, on s'arrête
    if (countdownContainers.length === 0) {
        return;
    }

    // On lance UN SEUL intervalle qui va mettre à jour TOUS les décompteurs trouvés
    frontendCountdownInterval = setInterval(() => {
        
        countdownContainers.forEach(container => {
            const timerElement = container.querySelector('#payment-countdown-timer');

            // Sécurité : si un des décompteurs est mal formé, on l'ignore
            if (!timerElement || !container.dataset.deadline) {
                return;
            }

            const deadline = new Date(container.dataset.deadline);
            const now = new Date();
            const timeLeft = deadline - now;
            
            // On récupère la traduction à chaque cycle (au cas où la langue change)
            const lang = getLanguage();
            const translation = translations[lang] || translations.fr;

            if (timeLeft <= 0) {
                timerElement.textContent = translation.countdown_expired || "EXPIRÉ";
                container.style.color = "#f44336";
            } else {
                const hours = Math.floor(timeLeft / 36e5);
                const minutes = Math.floor((timeLeft % 36e5) / 6e4);
                const seconds = Math.floor((timeLeft % 6e4) / 1000);
                timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        });
        
        // Si tous les décompteurs sont expirés, on arrête l'intervalle
        const allExpired = Array.from(countdownContainers).every(
            c => new Date(c.dataset.deadline) - new Date() <= 0
        );
        if (allExpired) {
            clearInterval(frontendCountdownInterval);
        }

    }, 1000);
}
function stopFrontendCountdown() {
    if (frontendCountdownInterval) {
        clearInterval(frontendCountdownInterval);
        frontendCountdownInterval = null;
        console.log("⏱️ Décompteur client arrêté.");
    }
}




// DANS app.js

function addBookingToLocalHistory(bookingNumber) {
    try {
        // Utilise la clé de stockage définie dans CONFIG pour la cohérence
        let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        if (!history.includes(bookingNumber)) {
            history.unshift(bookingNumber); // Ajoute au début pour voir les plus récents en premier
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(history));
            console.log(`💾 Réservation ${bookingNumber} ajoutée à l'historique local.`);
        }
    } catch (e) {
        console.error("Erreur lors de la sauvegarde de l'historique local:", e);
    }
}


// DANS app.js, à ajouter avec les autres fonctions utilitaires

// ============================================
// 🛠️ VERSION DE DIAGNOSTIC
// ============================================
async function removeBookingFromLocalHistory(bookingNumber) {
    // 1. Traductions
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    // 2. Appel de la modale (C'est ici que ça bloquait avant)
    const confirmed = await showCustomConfirm({
        title: translation.confirm_remove_booking_title || "Confirmation",
        message: (typeof translation.confirm_remove_booking_desc === 'function') 
            ? translation.confirm_remove_booking_desc(bookingNumber) 
            : `Voulez-vous supprimer la réservation ${bookingNumber} ?`,
        icon: '🗑️',
        iconClass: 'danger',
        confirmText: translation.button_remove || "Supprimer",
        cancelText: translation.button_cancel_alt || "Annuler",
        confirmClass: 'btn-danger'
    });

    // 3. Si l'utilisateur annule, on arrête tout
    if (!confirmed) return;
    
    // 4. Suppression
    try {
        let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        const newHistory = history.filter(bn => bn !== bookingNumber);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(newHistory));
        
        Utils.showToast(translation.toast_booking_removed || "Réservation supprimée", "success");
        displayReservations(); // Rafraîchir l'écran

    } catch (e) {
        console.error("Erreur suppression:", e);
    }
}
// DANS app.js

// Variable pour garder une référence au décompteur
let agencyCountdownInterval = null;

/**
 * Démarre le décompteur dynamique pour l'option de paiement à l'agence.
 */
function startAgencyCountdown() {
    if (agencyCountdownInterval) {
        clearInterval(agencyCountdownInterval);
    }

    // --- 1. Récupération des éléments et des traductions ---
    const subtitleElement = document.getElementById('agency-payment-subtitle');
    const deadlineInputElement = document.getElementById('agency-deadline');
    const rule1Element = document.getElementById('agency-rule1-placeholder'); // La règle d'annulation

    if (!subtitleElement || !deadlineInputElement || !rule1Element) {
        return;
    }
    
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    // --- 2. Calcul du délai (votre logique est conservée) ---
    const deadline = new Date(Date.now() + CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000);
    console.log(`⏱️ Décompteur AGENCE démarré. Cible : ${deadline.toISOString()}`);
    
    // --- 3. Traduire la règle d'annulation immédiatement ---
    if (typeof translation.payment_agency_rule1 === 'function') {
        rule1Element.innerHTML = translation.payment_agency_rule1(CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS);
    }

    // --- 4. Boucle du décompteur avec traduction ---
    agencyCountdownInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = deadline - now;

        if (timeLeft <= 0) {
            clearInterval(agencyCountdownInterval);
            const expiredText = translation.payment_agency_deadline_expired || "Délai expiré";
            subtitleElement.textContent = expiredText;
            deadlineInputElement.value = expiredText;
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        // On utilise la fonction de traduction pour le décompte
        if (typeof translation.payment_agency_desc_countdown === 'function') {
            subtitleElement.textContent = translation.payment_agency_desc_countdown(hours, minutes);
        }
        
        // On formate la date de fin en fonction de la langue
        const fullDeadlineText = deadline.toLocaleString(`${lang}-${lang.toUpperCase()}`, {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
        deadlineInputElement.value = fullDeadlineText;

    }, 1000);
}
/**
 * Arrête le décompteur lorsque l'on quitte la page de paiement.
 */
function stopAgencyCountdown() {
    if (agencyCountdownInterval) {
        clearInterval(agencyCountdownInterval);
        agencyCountdownInterval = null; // Important pour la propreté du code
    }
}
// ============================================
// FONCTIONS PAIEMENT AGENCE
// ============================================

// Dans app.js
// Dans app.js

function canPayAtAgency() {
    console.group("🔍 DEBUG : canPayAtAgency - NOUVELLE VERSION");

    // 1. Vérification des données de base
    if (!appState.currentSearch?.date || !appState.selectedBus?.departure) {
        console.warn("⚠️ Données manquantes (date de recherche ou heure de départ).");
        console.groupEnd();
        return false;
    }
    console.log("Date de recherche (string):", appState.currentSearch.date);
    console.log("Heure de départ (string):", appState.selectedBus.departure);

    // 2. Séparation des composants de la date et de l'heure
    const [year, month, day] = appState.currentSearch.date.split('-').map(Number);
    const [hours, minutes] = appState.selectedBus.departure.split(':').map(Number);

    // 3. Création de la date de départ en UTC pour éviter les problèmes de fuseau horaire
    // Le mois est 0-indexé en JavaScript, donc on fait 'month - 1'
    const departureDateTimeUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    console.log("Date de départ (objet Date en UTC) :", departureDateTimeUTC.toISOString());

    // Sécurité : si la date est invalide, on refuse
    if (isNaN(departureDateTimeUTC.getTime())) {
        console.error("❌ La date de départ construite est INVALIDE.");
        console.groupEnd();
        return false;
    }

    // 4. Création de la date actuelle en UTC
    const nowUTC = new Date();
    console.log("Date actuelle (objet Date) :", nowUTC.toISOString());

    // 5. Calcul de la différence en heures
    const hoursUntilDeparture = (departureDateTimeUTC - nowUTC) / (1000 * 60 * 60);
    console.log(`⏰ Heures restantes avant le départ : ${hoursUntilDeparture.toFixed(2)}h`);
    console.log(`(Minimum requis : ${CONFIG.AGENCY_PAYMENT_MIN_HOURS}h)`);

    // 6. Comparaison finale
    const isAllowed = hoursUntilDeparture >= CONFIG.AGENCY_PAYMENT_MIN_HOURS;
    console.log("Résultat (peut payer ?) :", isAllowed);
    console.groupEnd();

    return isAllowed;
}
function getNearestAgency(cityName) {
    let agency = agencies.find(a => a.city === cityName);
    
    if (!agency) {
        agency = agencies[0];
        console.log(`⚠️ Pas d'agence à ${cityName}, utilisation de ${agency.city}`);
    }
    
    return agency;
}




// DANS app.js (AJOUTEZ ce bloc, ne remplacez rien pour l'instant)

// ===================================================================
// == DÉCOMPTEUR SPÉCIFIQUE AU PAIEMENT EN AGENCE (ISOLÉ ET SÛR)
// ===================================================================

// Variable dédiée uniquement au décompteur de l'agence
let agencySpecificCountdown = null;

/**
 * Démarre le décompteur de 10h pour l'option agence.
 */
function startAgencySpecificCountdown() {
    // Nettoyage de sécurité
    if (agencySpecificCountdown) {
        clearInterval(agencySpecificCountdown);
    }

    // Cibles HTML
    const subtitleElement = document.getElementById('agency-payment-subtitle');
    const deadlineInputElement = document.getElementById('agency-deadline');

    if (!subtitleElement || !deadlineInputElement) return;

    // Calcul du délai de 10 heures
    const deadline = new Date(Date.now() + CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000);
    
    // Démarrage de la boucle de mise à jour
    agencySpecificCountdown = setInterval(() => {
        const now = new Date();
        const timeLeft = deadline - now;

        if (timeLeft <= 0) {
            clearInterval(agencySpecificCountdown);
            const expiredText = "Délai expiré";
            subtitleElement.textContent = expiredText;
            deadlineInputElement.value = expiredText;
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const countdownText = `Payez dans les ${hours}h ${minutes.toString().padStart(2, '0')}m`;
        const fullDeadlineText = `Le ${deadline.toLocaleDateString('fr-FR')} à ${deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

        subtitleElement.textContent = countdownText;
        deadlineInputElement.value = fullDeadlineText;

    }, 1000);
}

/**
 * Arrête le décompteur de l'agence et réinitialise le texte.
 */
function stopAgencySpecificCountdown() {
    if (agencySpecificCountdown) {
        clearInterval(agencySpecificCountdown);
        agencySpecificCountdown = null;
    }
    // On réinitialise le texte par défaut
    const subtitleElement = document.getElementById('agency-payment-subtitle');
    if (subtitleElement) {
        subtitleElement.textContent = `⏰ Payez dans les ${CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS}h à l'agence`;
    }
    const deadlineInputElement = document.getElementById('agency-deadline');
    if (deadlineInputElement) {
        deadlineInputElement.value = "";
    }
}



// DANS app.js, à ajouter avec vos autres fonctions utilitaires
// DANS app.js

// ============================================
// 🪟 MODALE DE CONFIRMATION (AUTO-GÉNÉRÉE)
// ============================================
// DANS app.js

function showCustomConfirm({ title, message, icon = '⚠️', iconClass = 'warning', confirmText = 'Confirmer', cancelText = 'Annuler', confirmClass = 'btn-danger' }) {
    return new Promise((resolve) => {
        let modal = document.getElementById('custom-confirm-modal');

        // --- A. Injection HTML si manquant ---
        if (!modal) {
            console.log("🔧 Injection de la modale de secours...");
            const modalHTML = `
                <div id="custom-confirm-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div style="background: #1C1C27; border: 1px solid rgba(115, 215, 0, 0.3); border-radius: 16px; width: 90%; max-width: 400px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                            <div id="custom-confirm-icon" style="font-size: 32px;"></div>
                            <h3 id="custom-confirm-title" style="margin: 0; color: white; font-family: 'Audiowide', cursive;"></h3>
                        </div>
                        <p id="custom-confirm-message" style="color: #A9A9B8; margin-bottom: 24px; line-height: 1.5;"></p>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button id="custom-confirm-cancel-btn" style="background: transparent; border: 1px solid #A9A9B8; color: #A9A9B8; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">Annuler</button>
                            <button id="custom-confirm-ok-btn" style="background: #d32f2f; border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">Confirmer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById('custom-confirm-modal');
        }

        // --- B. Mise à jour du contenu ---
        const titleEl = document.getElementById('custom-confirm-title');
        const messageEl = document.getElementById('custom-confirm-message');
        const iconEl = document.getElementById('custom-confirm-icon');
        const okBtn = document.getElementById('custom-confirm-ok-btn');
        const cancelBtn = document.getElementById('custom-confirm-cancel-btn');

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.innerHTML = message;
        if (iconEl) iconEl.textContent = icon;

        // --- C. Gestion des clics (Résolution de la Promesse) ---
        const cleanup = () => {
            modal.style.display = 'none';
            okBtn.replaceWith(okBtn.cloneNode(true)); // Retire les anciens event listeners
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        };

        // Bouton Confirmer
        okBtn.textContent = confirmText;
        // Si c'est pas une suppression (pas rouge), on met vert par défaut
        if (confirmClass !== 'btn-danger') {
            okBtn.style.backgroundColor = '#73d700'; 
            okBtn.style.color = '#000';
        } else {
            okBtn.style.backgroundColor = '#d32f2f';
            okBtn.style.color = '#fff';
        }

        okBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(true); // ✅ DÉBLOQUE L'AWAIT
        };

        // Bouton Annuler
        cancelBtn.textContent = cancelText;
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            resolve(false); // ✅ DÉBLOQUE L'AWAIT
        };

        // --- D. Affichage forcé ---
        modal.style.display = 'flex';
    });
}
// ============================================
// ⏰ CALCUL DU DÉLAI PAIEMENT MOBILE MONEY
// ============================================
function calculateMobileMoneyDeadline() {
    const now = new Date();
    const deadline = new Date(now.getTime() + (CONFIG.MOBILE_MONEY_PAYMENT_DEADLINE_MINUTES * 60 * 1000));
    return deadline;
}

// ============================================
// GESTION DES RÉSERVATIONS AVEC BACKEND
// ============================================

    // Dans Frontend/app.js



    // DANS app.js, ASSUREZ-VOUS d'avoir cette version de saveReservationToBackend

async function saveReservationToBackend(reservation) {
    const API_URL = API_CONFIG.baseUrl;
    console.log(`📤 Tentative d'envoi vers : ${API_URL}/api/reservations`);
    
    try {
        const response = await fetch(`${API_URL}/api/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });

        const responseBody = await response.text();

        if (!response.ok) {
            console.error(`❌ Réponse non-OK reçue. Status: ${response.status}`, responseBody);
            let errorData;
            try {
                errorData = JSON.parse(responseBody);
            } catch (e) {
                throw new Error(`Erreur ${response.status}: Le serveur a répondu de manière inattendue.`);
            }
            // On retourne un objet d'erreur clair, au lieu de planter
            return { success: false, error: errorData.error || `Erreur serveur ${response.status}` };
        }
        
        console.log('✅ Réponse OK du serveur.');
        const savedData = JSON.parse(responseBody);

        // ✅ IMPORTANT : La sauvegarde locale se fait ICI, après confirmation du serveur
        if (savedData.success && reservation.bookingNumber) {
            addBookingToLocalHistory(reservation.bookingNumber);
        } else {
            // Si le serveur dit success:false, on propage l'erreur
            return { success: false, error: savedData.error || "Le serveur a refusé la réservation." };
        }
        
        return savedData; // Retourne { success: true, ... }

    } catch (error) {
        console.error('❌ Erreur FONDAMENTALE dans la requête fetch :', error);
        
        if (error.name === 'TypeError') {
            return { success: false, error: 'Impossible de joindre le serveur. Vérifiez votre connexion.' };
        }
        
        return { success: false, error: error.message };
    }
}

async function loadReservationsFromBackend(userPhone) {
    try {
        const response = await fetch(
            `${API_CONFIG.baseUrl}/api/reservations/user/${encodeURIComponent(userPhone)}`
        );
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erreur lors du chargement');
        }
        
        console.log(`✅ ${result.reservations.length} réservations chargées`);
        return result.reservations;
        
    } catch (error) {
        console.error('❌ Erreur chargement backend:', error);
        return [];
    }
}

window.cancelReservation = async function(bookingNumber) {
    const confirm = window.confirm(
        `Voulez-vous vraiment annuler la réservation ${bookingNumber} ?`
    );
    
    if (!confirm) return;
    
    try {
        const response = await fetch(
            `${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/cancel`,
            { 
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erreur lors de l\'annulation');
        }
        
        Utils.showToast('Réservation annulée avec succès', 'success');
        displayReservations();
        
    } catch (error) {
        console.error('Erreur annulation:', error);
        Utils.showToast('Erreur lors de l\'annulation', 'error');
    }
}

// ============================================
// TÉLÉCHARGEMENT DE BILLET PDF
// ============================================
// Dans app.js
window.downloadTicket = async function(isReturn = false) {
    const reservation = appState.currentReservation;
    
    if (!reservation) {
        Utils.showToast("Aucune réservation à télécharger.", "error");
        return;
    }

    if (isReturn && !reservation.returnRoute) {
        Utils.showToast("Il n'y a pas de billet retour pour cette réservation.", "warning");
        return;
    }
    
    Utils.showToast(`Génération du billet ${isReturn ? 'RETOUR' : 'ALLER'} en cours...`, 'info');

    
    // Appelle la fonction qui génère le HTML et lance le téléchargement
    await generateTicketPDF(reservation, isReturn);
};

// 💳 AFFICHAGE DES INSTRUCTIONS DE PAIEMENT
// ============================================

// DANS app.js, REMPLACEZ la fonction displayPaymentInstructions par celle-ci
function displayPaymentInstructions(reservation) {
    console.log('📄 Affichage des instructions de paiement pour:', reservation.bookingNumber);
    
    // --- 1. Récupération des traductions et des données ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const paymentMethod = reservation.paymentMethod;
    const isAgencyPayment = paymentMethod === 'AGENCY';
    const merchantNumber = paymentMethod === 'MTN' ? CONFIG.MTN_MERCHANT_NUMBER : CONFIG.AIRTEL_MERCHANT_NUMBER;
    const ussdCode = paymentMethod === 'MTN' ? '*555#' : '*130#';
    const deadline = new Date(reservation.paymentDeadline);
    const amount = reservation.totalPriceNumeric;

    // --- 2. Construction des blocs HTML traduits ---
    let paymentDetailsContent = '', paymentStepsContent = '';

    if (isAgencyPayment) {
        paymentDetailsContent = `
            <div class="detail-row">
                <span class="detail-label">${translation.agency_to_pay_label}</span>
                <div style="font-weight: 700; color: var(--color-text-primary); text-align: right;">
                    ${reservation.agency.name}<br>
                    <small style="font-weight: 400;">${reservation.agency.address}</small>
                </div>
            </div>
            <div class="detail-row">
                <span class="detail-label">${translation.payment_ref_label_important}</span>
                <span class="detail-value highlight">${reservation.agencyPaymentCode}</span>
                <div class="detail-warning">${translation.payment_ref_warning_agency}</div>
            </div>
        `;
    } else { // Mobile Money
        paymentDetailsContent = `
            <div class="detail-row">
                <span class="detail-label">${translation.your_phone_label(paymentMethod)}</span>
                <span class="detail-value highlight">${reservation.customerPhone}</span>
                <div class="detail-warning">${translation.your_phone_warning}</div>
            </div>
            <div class="detail-row">
                <span class="detail-label">${translation.merchant_phone_label(paymentMethod)}</span>
                <span class="detail-value highlight">${merchantNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">${translation.payment_ref_label_important}</span>
                <span class="detail-value highlight">${reservation.bookingNumber}</span>
                <div class="detail-warning">${translation.payment_ref_warning}</div>
            </div>
        `;
        paymentStepsContent = `
            <div class="instruction-steps">
                <h3>${translation.payment_steps_title(paymentMethod)}</h3>
                <ol>
                    <li>${translation.payment_steps_1(ussdCode)}</li>
                    <li>${translation.payment_steps_2}</li>
                    <li>${translation.payment_steps_3(merchantNumber)}</li>
                    <li>${translation.payment_steps_4(Utils.formatPrice(amount) + ' FCFA')}</li>
                    <li>${translation.payment_steps_5(reservation.bookingNumber)}</li>
                    <li>${translation.payment_steps_6}</li>
                </ol>
            </div>
        `;
    }

    const transactionSubmissionHTML = !isAgencyPayment ? `
        <div class="transaction-submission-box">
            <h3>${translation.final_step_title}</h3>
            <p>${translation.final_step_desc(paymentMethod)}</p>
            <div class="form-group" style="margin-top: 1rem;">
                <label for="transaction-id-input" style="font-weight: 600;">${translation.transaction_id_label}</label>
                <input type="text" id="transaction-id-input" class="form-control" placeholder="${translation.transaction_id_placeholder}">
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="submitTransactionId('${reservation.bookingNumber}')">
                <span style="font-size: 1.2em;">✔</span> ${translation.submit_proof_button}
            </button>
        </div>
    ` : '';

    // --- 3. Template HTML final avec le décompteur ---
    const instructionsHTML = `
        <div class="payment-instructions-card">
            <div class="instruction-header">
                <div class="instruction-icon">${isAgencyPayment ? '🏢' : '📱'}</div>
                <div>
                    <h2 class="instruction-title">${isAgencyPayment ? translation.payment_instructions_title_agency : translation.payment_instructions_title_mm(paymentMethod)}</h2>
                    <p class="instruction-subtitle">${translation.payment_instructions_subtitle}</p>
                </div>
            </div>
            <div class="booking-reference">
                <div class="reference-label">${translation.booking_ref_label}</div>
                <div class="reference-number">${reservation.bookingNumber}</div>
            </div>
            <div class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">${translation.amount_to_pay_label}</span>
                    <span class="detail-value primary">${Utils.formatPrice(amount)} FCFA</span>
                </div>
                ${paymentDetailsContent}
                <div class="detail-row">
                    <span class="detail-label">${translation.payment_deadline_label}</span>
                    <span class="detail-value">${deadline.toLocaleString(`${lang}-${lang.toUpperCase()}`, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <!-- ✅ BLOC POUR LE DÉCOMPTEUR DYNAMIQUE (TRADUIT) -->
<div id="payment-countdown-container" class="detail-warning" data-deadline="${deadline.toISOString()}" style="text-align: center; margin-top: 10px;">
    
    <!-- Ce span sera traduit par la fonction applyLanguage -->
    <span data-i18n="countdown_time_left">Temps restant :</span> 
    
    <!-- Ce span sera mis à jour par la fonction startFrontendCountdown -->
    <span id="payment-countdown-timer" style="font-weight: bold; font-family: monospace; font-size: 1.1em;">
        ${translation.countdown_calculating || 'Calcul...'}
    </span>
</div>
            </div>
            ${paymentStepsContent}
            ${transactionSubmissionHTML}
            <div class="deadline-warning">
                <div class="warning-icon">⚠️</div>
                <div>
                    <strong>${translation.deadline_warning_title}</strong>
                    <p>${translation.deadline_warning_desc(deadline.toLocaleDateString(lang), deadline.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }))}</p>
                </div>
            </div>
            <div class="action-buttons">
                ${!isAgencyPayment ? `<button class="btn btn-primary" onclick="checkPaymentStatus('${reservation.bookingNumber}')">${translation.check_status_button}</button>` : ''}
                <button class="btn btn-secondary" onclick="showPage('home')">${translation.back_home_button}</button>
            </div>
        </div>
    `;
    
    // --- 4. Affichage et démarrage du décompteur ---
    const instructionsPage = document.getElementById('payment-instructions-page');
    if (!instructionsPage) {
        console.error('❌ Élément #payment-instructions-page introuvable.');
        return;
    }
    
    instructionsPage.innerHTML = instructionsHTML;

    // ✅ On force la traduction des nouveaux éléments injectés
    applyLanguage();
    showPage('payment-instructions');
    
    // On appelle la fonction qui va trouver les éléments du décompteur et le lancer
    startFrontendCountdown();
    
    appState.currentReservation = reservation;
}



// DANS app.js, à ajouter avec vos autres fonctions

async function submitTransactionId(bookingNumber) {
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const transactionIdInput = document.getElementById('transaction-id-input');
    const transactionId = transactionIdInput.value.trim();

    // Utilisation de la traduction pour le message d'erreur
    if (!transactionId) {
        Utils.showToast(translation.toast_enter_transaction_id, "warning");
        return;
    }

    // Utilisation de la traduction pour le message d'envoi
    Utils.showToast(translation.toast_sending_proof, "info");

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/transaction-id`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: transactionId })
        });

        const result = await response.json();

        if (!response.ok) {
            // Utilisation de la traduction pour l'erreur de soumission
            throw new Error(result.error || translation.toast_proof_submit_error);
        }

        // Utilisation de la traduction pour le message de succès
        Utils.showToast(translation.toast_proof_received, 'success');
        
        // La logique pour désactiver les champs reste la même
        transactionIdInput.disabled = true;
        const submitButton = document.querySelector('.transaction-submission-box button');
        if (submitButton) {
            submitButton.disabled = true;
        }

    } catch (error) {
        console.error('Erreur soumission ID transaction:', error);
        Utils.showToast(error.message, 'error');
    }
}

// ============================================
// 🔍 VÉRIFICATION DU STATUT DE PAIEMENT
// ============================================
// Dans app.js - REMPLACER la fonction checkPaymentStatus()

window.checkPaymentStatus = async function(bookingNumber) {
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    console.log(`🔍 Vérification du statut pour : ${bookingNumber}`);
    Utils.showToast(translation.toast_checking_status, 'info'); // Message de début
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/check/${bookingNumber}`);
        const data = await response.json();
        
        if (!data.success) {
            Utils.showToast(translation.error_booking_not_found || 'Réservation introuvable', 'error');
            return;
        }
        
        console.log('📊 Statut actuel :', data.status);
        
        if (data.status === 'Confirmé') {
            Utils.showToast(translation.toast_payment_confirmed_redirect, 'success');
            
            // La logique pour récupérer et afficher la confirmation est correcte
            const reservationResponse = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}`);
            const reservationData = await reservationResponse.json();
            
            if (reservationData.success) {
                appState.currentReservation = reservationData.reservation;
                displayConfirmation(appState.currentReservation);
                showPage('confirmation');
            }
            
        } else if (data.status === 'En attente de paiement') {
            Utils.showToast(translation.toast_payment_pending_check, 'info');
        } else if (data.status === 'Annulé' || data.status === 'Expiré') {
            Utils.showToast(translation.toast_booking_cancelled_status(data.status.toLowerCase()), 'error');
        } else {
            Utils.showToast(`${translation.toast_current_status || 'Statut actuel :'} ${data.status}`, 'info');
        }
        
    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        Utils.showToast(translation.error_check_status || 'Erreur lors de la vérification.', 'error');
    }
};

// Dans app.js
// Dans app.js
// DANS app.js, REMPLACEZ la fonction generateTicketPDF par celle-ci

async function generateTicketPDF(reservation, isReturn = false) {
    try {
        // ===================================
        // ✅ CORRECTION : ON DÉCLARE 'lang' ET 'translation'
        // ===================================
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        // ===================================
        const qrDataString = Utils.generateQRCodeData(reservation, isReturn);
        const qrCodeBase64 = await Utils.generateQRCodeBase64(qrDataString, 150);
        
        // --- 1. SÉLECTION DES BONNES DONNÉES (ALLER OU RETOUR) ---
        const route = isReturn ? reservation.returnRoute : reservation.route;
        const date = isReturn ? reservation.returnDate : reservation.date;
        const seats = isReturn ? reservation.returnSeats : reservation.seats;
        
            const busIdentifier = (isReturn ? reservation.returnBusIdentifier : reservation.busIdentifier) || 'N/A';

        const ticketType = isReturn 
    ? translation.confirmation_ticket_return 
    : translation.confirmation_ticket_outbound;

        // --- 2. CONSTRUCTION DES SECTIONS DYNAMIQUES ---
        let agencyInfoHTML = '';
        if (reservation.status === 'En attente de paiement' && reservation.agency) {
            agencyInfoHTML = `
                <div class="payment-warning">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-text">
                        <strong>PAIEMENT REQUIS À L'AGENCE</strong>
                        <span>Ce billet ne sera valide qu'après paiement avant le :<br><strong>${new Date(reservation.paymentDeadline).toLocaleString('fr-FR')}</strong></span>
                    </div>
                </div>
            `;
        }
            // --- Génération dynamique des arrêts (TRADUIT) ---
    let stopsHTML = '';
    if (route.stops && route.stops.length > 0) {
        stopsHTML = `
            <div class="passengers-section">
                <div class="passengers-title">${translation.details_stops_planned}</div>
                <div class="passenger-list">
                    ${route.stops.map(stop => `
                        <div class="item">
                            <span class="passenger-name">${stop.city}</span>
                            <span style="color: #555; font-size: 12px;">
                                ${translation.details_stop_info(stop.duration, stop.arrivalTime)}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // --- Génération dynamique des correspondances (TRADUIT) ---
    let connectionsHTML = '';
    if (route.connections && route.connections.length > 0) {
        connectionsHTML = `
            <div class="passengers-section">
                <div class="passengers-title" style="border-color: #ef5350;">${translation.details_connections_title}</div>
                <div class="passenger-list">
                    ${route.connections.map(conn => `
                        <div class="item">
                            <div>
                                <span class="passenger-name">${translation.details_connection_info(conn.at, conn.waitTime)}</span>
                                <small style="display: block; color: #555; font-size: 12px;">
                                    ${translation.details_next_bus_info(conn.nextCompany, conn.nextBusNumber, conn.nextDeparture)}
                                </small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }


        // --- 3. TEMPLATE HTML COMPLET ---
        // DANS la fonction generateTicketPDF, après avoir défini les variables

const ticketHTML = `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
        <style>
            :root { --primary-color: #73d700; --dark-color: #10101A; --text-color: #1a1a1a; --text-light: #555; --bg-light: #f4f7f9; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background-color: var(--bg-light); color: var(--text-color); display: flex; justify-content: center; padding: 20px; }
            .ticket-container { width: 850px; background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; }
            .ticket-main { flex: 3; padding: 30px; }
            .ticket-stub { flex: 1; background-color: var(--dark-color); color: white; padding: 30px; border-radius: 0 16px 16px 0; border-left: 2px dashed #ccc; display: flex; flex-direction: column; align-items: center; text-align: center; }
            .ticket-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-family: 'Audiowide', sans-serif; font-size: 28px; font-weight: 900; color: var(--primary-color); }
            .booking-status { font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #2e7d32; }
            .route-info { display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px; } /* Correction: align-items: center */
            .route-point { flex: 1; }
            .route-point .city { font-size: 24px; font-weight: 700; }
            .route-point .location-detail { font-size: 13px; font-weight: 600; color: var(--text-light); margin-top: 4px; }
            .route-point .time { font-size: 20px; font-weight: 500; color: var(--text-light); margin-top: 8px; }
            .route-arrow { font-size: 24px; color: var(--primary-color); padding: 0 20px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-bottom: 25px; }
            .detail-item .detail-label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
            .detail-item .detail-value { font-size: 15px; font-weight: 600; }
            .passengers-section { margin-bottom: 25px; }
            .passengers-title { font-size: 14px; font-weight: 700; border-bottom: 2px solid var(--primary-color); padding-bottom: 5px; margin-bottom: 10px; display: inline-block; }
            .passenger-list .item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee; }
            .ticket-footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px; }
            .stub-qr-code { background: white; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
            .stub-qr-code img { display: block; }
            .stub-label { font-size: 10px; text-transform: uppercase; color: #aaa; margin-bottom: 5px; }
            .stub-value { font-size: 14px; font-weight: 700; margin-bottom: 15px; word-break: break-all; }
            .stub-value.booking-no { font-family: 'JetBrains Mono', monospace; font-size: 18px; color: var(--primary-color); }
        </style>
    </head>
    <body>
        <div class="ticket-container">
            <div class="ticket-main">
                <div class="ticket-header">
                    <div class="logo">EN-BUS</div>
                    <div class="booking-status">${ticketType}</div>
                </div>
                ${agencyInfoHTML}
                <div class="route-info">
                    <div class="route-point">
                        <div class="city">${route.from}</div>
                        <div class="location-detail">${route.departureLocation || ''}</div>
                        <div class="time">${route.departure}</div>
                    </div>
                    <div class="route-arrow">➔</div>
                    <div class="route-point" style="text-align: right;">
                        <div class="city">${route.to}</div>
                        <div class="location-detail">${route.arrivalLocation || ''}</div>
                        <div class="time">${route.arrival}</div>
                    </div>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><div class="detail-label">${translation.details_label_date}</div><div class="detail-value">${Utils.formatDate(date, lang)}</div></div>
                    <div class="detail-item"><div class="detail-label">${translation.details_label_duration}</div><div class="detail-value">${route.duration || 'N/A'}</div></div>
                    <div class="detail-item"><div class="detail-label">${translation.details_label_company}</div><div class="detail-value">${route.company}</div></div>
                    <div class="detail-item"><div class="detail-label">${translation.details_label_bus_no}</div><div class="detail-value">${busIdentifier}</div></div>
                </div>
                <div class="passengers-section">
                    <div class="passengers-title">${translation.details_label_passengers}</div>
                    <div class="passenger-list">
                        ${reservation.passengers.map((p, i) => `
                            <div class="item">
                                <span class="passenger-name">${p.name}</span>
                                <span class="seat-number">${translation.details_label_seat} ${seats[i]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ${stopsHTML}
                ${connectionsHTML}
                <div class="ticket-footer">
                    ${translation.ticket_footer_instruction}
                </div>
            </div>
            <div class="ticket-stub">
                <div class="stub-qr-code"><img src="${qrCodeBase64}" alt="QR Code"></div>
                <div class="stub-label">${translation.stub_label_booking}</div>
                <div class="stub-value booking-no">${reservation.bookingNumber}</div>
                <div class="stub-label">${translation.stub_label_passenger}</div>
                <div class="stub-value">${reservation.passengers[0].name}</div>
                <div class="stub-label">${translation.stub_label_total_paid}</div>
                <div class="stub-value">${Utils.formatPrice(reservation.totalPriceNumeric || 0)} FCFA</div>
            </div>
        </div>
    </body>
    </html>
`;

        // --- 4. LOGIQUE DE TÉLÉCHARGEMENT ET D'IMPRESSION ---
        try {
            const blob = new Blob([ticketHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            const fileName = isReturn ? `Billet_Retour_${reservation.bookingNumber}.html` : `Billet_Aller_${reservation.bookingNumber}.html`;
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            Utils.showToast('Billet téléchargé !', 'success');

            if (window.innerWidth > 768) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(ticketHTML);
                    printWindow.document.close();
                    // printWindow.print(); // Décommenter pour lancer l'impression automatiquement
                }
            }


        } catch (downloadError) {
            console.error("Erreur de téléchargement du billet:", downloadError);
            Utils.showToast('Le téléchargement a échoué. Veuillez autoriser les popups.', 'error');
        }

    } catch (error) {
        console.error('Erreur lors de la génération du billet:', error);
        Utils.showToast('Erreur critique lors de la génération du billet.', 'error');
    }
}
// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================
 function initApp() {
    try {
        setupMobileMenu();
        populateCitySelects();
        setupDatePickers();
        setupTripTypeToggle();
        setupPassengerSelector();
        populatePopularDestinations();
        setupPaymentMethodToggle();
        addToastStyles();
        addSwapButtonStyles();
        setupSwapButton();
        setupAmenitiesFilters(); 
        addAboutPageStyles();
         animateCountersOnScroll();
         addContactPageStyles(); 
         setupContactPage();
         addRoutingMachineStyles();
         // ✅ AJOUTER CET APPEL
        initInteractiveMap();
        applyLanguage();// ✅ AJOUTER CETTE LIGNE
        loadAllRouteTemplates(); 

         // ===========================================
    // ✅ CORRECTION POUR LA SUPERPOSITION
    // ===========================================
    // On déplace le conteneur des résultats à la fin du body
    // pour qu'il ne soit plus "emprisonné" par un parent.
    const resultsContainer = document.getElementById('smart-search-results');
    if (resultsContainer) {
        document.body.appendChild(resultsContainer);
    }
        setupSmartSearch();

        // ✅ AJOUTER CET APPEL
    animateSearchPlaceholder();

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}


function animateCountersOnScroll() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // Vitesse de l'animation

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                
                const updateCount = () => {
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target.toLocaleString('fr-FR');
                    }
                };

                updateCount();
                observer.unobserve(counter); // Animer une seule fois
            }
        });
    }, {
        threshold: 0.5 // Se déclenche quand 50% de l'élément est visible
    });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// ============================================
// 🔄 ÉCHANGE DES DESTINATIONS
// ============================================

function setupSwapButton() {
    const swapBtn = document.getElementById('swap-destinations-btn');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapDestinations);
    }
}

function swapDestinations() {
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');

    if (!originSelect || !destinationSelect) return;

    const originValue = originSelect.value;
    const destinationValue = destinationSelect.value;

    // Inverser les valeurs
    originSelect.value = destinationValue;
    destinationSelect.value = originValue;
    
    // Animer le bouton pour donner un retour visuel
    const btn = document.getElementById('swap-destinations-btn');
    if (btn) {
        btn.style.transform += ' rotate(180deg)';
    }
}




// DANS app.js
async function initInteractiveMap() {
    const mapContainer = document.getElementById('interactive-map');
    if (!mapContainer || mapContainer._leaflet_id) return;

    console.log("🗺️ Initialisation de la carte interactive avec routage...");
    const map = L.map('interactive-map').setView([2.8, 17.3], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'CARTO & OpenStreetMap',
    }).addTo(map);

    try {
        const [popularRes, allDestinationsRes] = await Promise.all([
            fetch(`${API_CONFIG.baseUrl}/api/popular-destinations`),
            fetch(`${API_CONFIG.baseUrl}/api/destinations`)
        ]);
        
        const popularData = await popularRes.json();
        const allDestinationsData = await allDestinationsRes.json();

        if (!popularData.success || !allDestinationsData.success) throw new Error("Données de carte invalides.");
        
        const popularRoutes = popularData.destinations;
        const allCities = allDestinationsData.destinations;
        
        const cityCoordsMap = new Map(allCities.map(city => [city.name, city.coords]));
        
        const busIcon = L.icon({
            iconUrl: './icons/bus-marker.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -42]
        });
        
        let addedMarkers = new Set();

        popularRoutes.forEach(route => {
            const fromCoords = cityCoordsMap.get(route.from);
            const toCoords = cityCoordsMap.get(route.to);

            if (fromCoords && fromCoords.length === 2 && toCoords && toCoords.length === 2) {
                
                // On ajoute les marqueurs de bus comme avant
                if (!addedMarkers.has(route.from)) {
                    L.marker(fromCoords, { icon: busIcon }).addTo(map)
                        .bindPopup(`<div class="popup-city-name">${route.from}</div>`);
                    addedMarkers.add(route.from);
                }
                
                if (!addedMarkers.has(route.to)) {
                    L.marker(toCoords, { icon: busIcon }).addTo(map)
                        .bindPopup(`<div class="popup-city-name">${route.to}</div>`);
                    addedMarkers.add(route.to);
                }

                // ========================================================
                // ✅ REMPLACEMENT DE L.polyline PAR LE ROUTAGE
                // ========================================================
                L.Routing.control({
                    waypoints: [
                        L.latLng(fromCoords[0], fromCoords[1]),
                        L.latLng(toCoords[0], toCoords[1])
                    ],
                    routeWhileDragging: false,
                    addWaypoints: false, // Empêche l'utilisateur d'ajouter des points
                    draggableWaypoints: false, // Empêche de bouger les points
                    createMarker: function() { return null; } // N'ajoute pas de marqueurs A et B
                }).addTo(map);

            } else {
                console.warn(`⚠️ Trajet populaire ignoré car coordonnées manquantes pour : ${route.from} ou ${route.to}`);
            }
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de la carte:", error);
        mapContainer.innerHTML = `<p style="text-align:center; color: #ff5555;">Erreur de chargement de la carte.</p>`;
    }
}


// ============================================
// 📞 LOGIQUE PAGE CONTACT
// ============================================
function setupContactPage() {
    // Logique pour la FAQ (accordéon)
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const isActive = button.classList.contains('active');

            // Fermer tous les autres
            document.querySelectorAll('.faq-question.active').forEach(activeButton => {
                if (activeButton !== button) {
                    activeButton.classList.remove('active');
                    activeButton.nextElementSibling.style.maxHeight = null;
                }
            });

            // Ouvrir ou fermer l'élément cliqué
            if (isActive) {
                button.classList.remove('active');
                answer.style.maxHeight = null;
            } else {
                button.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

       // Logique pour le formulaire de contact avec Formspree
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormspreeSubmit);
    }
}
async function handleFormspreeSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Récupérer les traductions au début
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // 1. Désactiver le bouton
    submitButton.disabled = true;
    submitButton.textContent = translation.toast_sending_message || 'Envoi en cours...';

    // 2. Construire l'objet de données
    const data = {
        name: document.getElementById('contact-name').value,
        _replyto: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
    };

    console.log("📤 Données envoyées à Formspree :", data);

    // 3. Envoyer les données
    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            Utils.showToast(translation.toast_message_sent_success || "Message envoyé avec succès !", 'success');
            form.reset();
        } else {
            const responseData = await response.json();
            if (responseData.errors) {
                const errorMessage = responseData.errors.map(error => error.message).join(', ');
                throw new Error(errorMessage);
            } else {
                throw new Error('Une erreur est survenue lors de l\'envoi.');
            }
        }
    } catch (error) {
        Utils.showToast(`Erreur : ${error.message}`, 'error');
        console.error("❌ Erreur Formspree:", error);
    } finally {
        // 4. Réactiver le bouton
        submitButton.disabled = false;
        submitButton.textContent = translation.contact_form_button || 'Envoyer le message';
    }
}

function addToastStyles() {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--color-surface);
                border: 1px solid var(--color-accent-glow);
                border-radius: var(--radius-lg);
                padding: var(--space-16);
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 10000;
                max-width: 350px;
            }
            .toast.show {
                transform: translateX(0);
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: var(--space-12);
            }
            .toast-icon {
                font-size: 20px;
            }
            .toast-success {
                border-color: #4caf50;
                box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
            }
            .toast-error {
                border-color: #f44336;
                box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}


function addRoutingMachineStyles() {
    if (document.getElementById('routing-machine-styles')) return;
    const style = document.createElement('style');
    style.id = 'routing-machine-styles';
    style.textContent = `
        /* Cache le panneau d'instructions de navigation */
        .leaflet-routing-container {
            display: none;
        }

        /* Personnalise la ligne de la route */
        .leaflet-routing-line {
            stroke: var(--color-accent, #00d9ff); /* Utilise la couleur accent de ton site */
            stroke-width: 5px;
            stroke-opacity: 0.8;
            stroke-dasharray: 10, 5;
            animation: move-dash 1s linear infinite;
        }

        @keyframes move-dash {
            to {
                stroke-dashoffset: -15;
            }
        }
    `;
    document.head.appendChild(style);
}


function addAboutPageStyles() {
    if (document.getElementById('about-page-styles')) return;
    const style = document.createElement('style');
    style.id = 'about-page-styles';
    style.textContent = `
        /* Section Héros */
        .about-hero {
            background: linear-gradient(rgba(10, 14, 39, 0.8), rgba(10, 14, 39, 0.95)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800') center/cover no-repeat;
            padding: 6rem 0;
            text-align: center;
            color: #fff;
        }
        .about-hero h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--color-accent);
        }
        .about-hero p {
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
            color: var(--color-text-secondary);
        }

        /* Section Features (Mission, Vision, Valeurs) */
        .about-features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
        }
        .feature-card {
            background: var(--color-surface);
            padding: 2rem;
            border-radius: var(--radius-lg);
            text-align: center;
            border: 1px solid var(--color-border);
        }
        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }
        .feature-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--color-text-primary);
        }
        .feature-card p {
            color: var(--color-text-secondary);
        }

        /* Section Chiffres Clés */
        .stats-section {
            background: var(--color-surface-dark);
            padding: 4rem 2rem;
            border-radius: var(--radius-xl);
            text-align: center;
            margin: 4rem 0;
        }
        .stats-section h2 {
            font-size: 2rem;
            margin-bottom: 3rem;
            color: var(--color-text-primary);
        }
        .stats-section .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
        }
        .stat-item .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: var(--color-accent);
            display: block;
        }
        .stat-item .stat-label {
            color: var(--color-text-secondary);
        }

        /* Section Partenaires */
        .partners-section {
            text-align: center;
            margin: 4rem 0;
        }
        .partners-section h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
        }
        .logos-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 2rem;
        }
        .logos-container img {
            max-height: 50px;
            filter: grayscale(1) brightness(1.5);
            opacity: 0.7;
            transition: all 0.3s;
        }
        .logos-container img:hover {
            filter: none;
            opacity: 1;
        }

        /* Section CTA */
        .cta-section {
            text-align: center;
            padding: 4rem 2rem;
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            margin: 4rem 0;
        }
        .cta-section h2 { font-size: 2rem; color: var(--color-text-primary); }
        .cta-section p { color: var(--color-text-secondary); margin-bottom: 1.5rem; }
    `;
    document.head.appendChild(style);
}


function addContactPageStyles() {
    if (document.getElementById('contact-page-styles')) return;
    const style = document.createElement('style');
    style.id = 'contact-page-styles';
    style.textContent = `
        .contact-main-title { font-size: 2.5rem; color: var(--color-text-primary); }
        .contact-main-subtitle { font-size: 1.1rem; color: var(--color-text-secondary); max-width: 500px; margin: 0 auto; }
        
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .contact-info-cards .info-card {
            background: var(--color-surface);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            margin-bottom: 1.5rem;
            border-left: 4px solid var(--color-accent);
        }
        .info-card-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .info-card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
        .info-card p { color: var(--color-text-secondary); margin-bottom: 1rem; }
        .info-card-link { color: var(--color-accent); font-weight: 600; text-decoration: none; }
        
        .contact-form-card {
            background: var(--color-surface);
            padding: 2rem;
            border-radius: var(--radius-lg);
        }
        .contact-form-card h3 { font-size: 1.5rem; margin-bottom: 1.5rem; }
        .contact-form-card .form-group { margin-bottom: 1rem; }
        .contact-form-card button { width: 100%; margin-top: 1rem; }
        
        .faq-section { margin: 4rem 0; text-align: center; }
        .faq-section h2 { font-size: 2rem; margin-bottom: 2rem; }
        .faq-container { max-width: 800px; margin: 0 auto; text-align: left; }
        .faq-item { border-bottom: 1px solid var(--color-border); }
        .faq-question {
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            padding: 1.5rem 1rem;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--color-text-primary);
            cursor: pointer;
            position: relative;
        }
        .faq-question::after {
            content: '+';
            position: absolute;
            right: 1rem;
            font-size: 1.5rem;
            transition: transform 0.3s;
        }
        .faq-question.active::after {
            transform: rotate(45deg);
        }
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        .faq-answer p { padding: 0 1rem 1.5rem 1rem; color: var(--color-text-secondary); }

        @media (max-width: 992px) {
            .contact-grid { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
}

function addSwapButtonStyles() {
    if (document.getElementById('swap-button-styles')) return;
    const style = document.createElement('style');
    style.id = 'swap-button-styles';
    style.textContent = `
        .destination-swap-container {
            display: grid;
            grid-template-columns: 1fr auto 1fr; /* Colonnes pour départ, bouton, arrivée */
            gap: 1rem;
            align-items: end; /* Aligne les champs et le bouton en bas */
        }
        .swap-btn {
            background: var(--color-surface-dark);
            border: 1px solid var(--color-border);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            padding: 0;
            margin-bottom: 0.5rem; /* Pour l'aligner avec les champs de texte */
        }
        .swap-btn:hover {
            background: var(--color-accent);
            border-color: var(--color-accent);
            transform: rotate(180deg) scale(1.1);
        }
        .swap-btn svg {
            width: 24px;
            height: 24px;
            fill: var(--color-text-secondary);
        }
        .swap-btn:hover svg {
            fill: var(--color-background);
        }

        /* Adaptation pour les petits écrans */
        @media (max-width: 768px) {
            .destination-swap-container {
                grid-template-columns: 1fr; /* Une seule colonne */
                gap: 0.5rem;
            }
            .swap-btn {
                grid-row: 2; /* Place le bouton entre les deux champs */
                margin: 0.5rem auto; /* Centre le bouton */
                transform: rotate(90deg); /* L'icône pointe vers le bas */
            }
            .swap-btn:hover {
                transform: rotate(270deg) scale(1.1);
            }
        }
    `;
    document.head.appendChild(style);
}






function setupMobileMenu() {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileNavMenu = document.getElementById("mobile-nav-menu");
    
    if (hamburgerBtn && mobileNavMenu) {
        hamburgerBtn.addEventListener("click", () => {
            const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
            hamburgerBtn.setAttribute("aria-expanded", !isExpanded);
            hamburgerBtn.classList.toggle("active");
            mobileNavMenu.classList.toggle("open");
        });
    }
}

function closeMenuAndShowPage(pageName) {

    showPage(pageName);
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileNavMenu = document.getElementById("mobile-nav-menu");
    if (hamburgerBtn && mobileNavMenu) {
        hamburgerBtn.setAttribute("aria-expanded", "false");
        hamburgerBtn.classList.remove("active");
        mobileNavMenu.classList.remove("open");
    }
}

function showPage(pageName) {
      if (pageName !== "payment-instructions") {
        // ✅ À AJOUTER AU TOUT DÉBUT DE LA FONCTION :
       stopAgencyCountdown();

    }
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add("active");
        window.scrollTo(0, 0);
    }
    
    if (pageName === "reservations") {
        displayReservations();
    }

    // ✅ AJOUTEZ CETTE LIGNE - elle arrête le décompteur de l'agence
    // si l'on quitte la page de paiement.
    if (pageName !== "payment") {
        stopAgencySpecificCountdown();
    }

}


// DANS app.js, avec vos autres fonctions

async function loadAllRouteTemplates() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/route-templates`);
        const data = await response.json();
        if (data.success && data.templates) {
            allRouteTemplates = data.templates;
            console.log(`✅ ${allRouteTemplates.length} modèles de trajets chargés pour les suggestions.`);
        }
    } catch (error) {
        console.error("Erreur chargement des modèles de trajets:", error);
    }
}
// DANS Frontend/app.js

async function populateCitySelects() {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");
    
    if (!originSelect || !destinationSelect) {
        console.error("Erreur: Sélecteurs de destination introuvables.");
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/destinations`);
        const data = await response.json();

        if (data.success && data.destinations) {
            const cities = data.destinations;
            
            originSelect.innerHTML = '';
            destinationSelect.innerHTML = '';
            
            // ===================================
            // ✅ CORRECTION DE LA TRADUCTION
            // ===================================
            const lang = getLanguage();
            const translation = translations[lang] || translations.fr;
            const defaultOptionText = translation.select_a_city || "Choisissez une ville";
            
            originSelect.innerHTML = `<option value="">${defaultOptionText}</option>`;
            destinationSelect.innerHTML = `<option value="">${defaultOptionText}</option>`;
            // ===================================

            cities.forEach(city => {
                const optionHTML = `<option value="${city.name}">${city.name}, ${city.country}</option>`;
                originSelect.innerHTML += optionHTML;
                destinationSelect.innerHTML += optionHTML;
            });
            console.log(`✅ ${cities.length} destinations chargées dans les formulaires.`);
        } else {
            console.error("Impossible de charger les destinations depuis l'API.");
        }
    } catch (error) {
        console.error("Erreur critique lors du chargement des destinations:", error);
    }
}
// Remplacez votre ancienne fonction par celle-ci

async function populatePopularDestinations() {
    const grid = document.getElementById("popular-destinations-grid");
    if (!grid) return;

    // On met un état de chargement
    grid.innerHTML = `<div class="loading-spinner">${(translations[getLanguage()] || translations.fr).info_loading_popular || 'Chargement...'}</div>`;

    try {
        // 1. On appelle la nouvelle route API publique
        const response = await fetch(`${API_CONFIG.baseUrl}/api/popular-destinations`);
        const data = await response.json();

        if (!data.success || !data.destinations || data.destinations.length === 0) {
            grid.innerHTML = ''; // On n'affiche rien si aucun trajet n'est populaire
            return;
        }
        
        const destinations = data.destinations;

        // 2. On récupère les traductions (comme avant)
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        
        // 3. On génère le HTML avec les données de l'API
        grid.innerHTML = destinations.map(route => {
            const formattedPrice = Utils.formatPrice(route.price);
            const priceText = (typeof translation.destination_price_from === 'function')
                ? translation.destination_price_from(formattedPrice)
                : `À partir de ${formattedPrice} FCFA`;

            return `
                <div class="destination-card" onclick="showDetailedSearch({ from: '${route.from}', to: '${route.to}' })">
                    <div class="destination-name">${route.from} → ${route.to}</div>
                    <div class="destination-price">${priceText}</div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("❌ Erreur chargement destinations populaires:", error);
        grid.innerHTML = `<p style="text-align: center; color: var(--color-text-secondary);">Erreur de chargement.</p>`;
    }
}
window.searchFromPopular = function(from, to) {
    document.getElementById("origin").value = from;
    document.getElementById("destination").value = to;
    const oneWayOption = document.querySelector('.trip-type-toggle [data-value="one-way"]');
    if (oneWayOption) oneWayOption.click();
    searchBuses();
}

function setupTripTypeToggle() {
    const toggle = document.querySelector(".trip-type-toggle");
    if (!toggle) return;
    
    const options = toggle.querySelectorAll(".toggle-option");
    
    options.forEach(option => {
        option.addEventListener("click", () => {
            toggle.setAttribute("data-mode", option.dataset.value);
            options.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");
            setupDatePickers();
        });
    });
}
function setupDatePickers() {
    if (appState.departurePicker) {
        appState.departurePicker.destroy();
    }

    // On récupère la langue actuelle et la traduction
    const lang = getLanguage();
    const placeholderText = translations[lang]?.search_form_dates_placeholder || "Sélectionnez vos dates";

    const config = {
        altInput: true,
        altFormat: "d F Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        locale: lang,
        mode: document.querySelector(".trip-type-toggle")?.getAttribute("data-mode") === "round-trip" ? "range" : "single",
        
        // ===========================================
        // ✅ LE HACK QUI FORCE LE PLACEHOLDER
        // ===========================================
        // onReady se déclenche juste après que Flatpickr a créé ses éléments
        onReady: function(selectedDates, dateStr, instance) {
            // 'instance.altInput' est le champ de texte visible par l'utilisateur
            if (instance.altInput) {
                instance.altInput.placeholder = placeholderText;
                console.log(`Placeholder forcé en '${lang}': "${placeholderText}"`);
            }
        }
    };
    
    appState.departurePicker = flatpickr("#travel-date", config);
}

function setupPassengerSelector() {
    const input = document.getElementById("passenger-input");
    const dropdown = document.getElementById("passenger-dropdown");
    const adultsCount = document.getElementById("adults-count");
    const childrenCount = document.getElementById("children-count");
    const summary = document.getElementById("passenger-summary");
    
    if (!input || !dropdown || !adultsCount || !childrenCount || !summary) {
        return;
    }
    
    function updateDisplay() {
        // Logique pour s'assurer que les valeurs sont correctes
        appState.passengerCounts.adults = Math.max(1, appState.passengerCounts.adults);
        appState.passengerCounts.children = Math.max(0, appState.passengerCounts.children);
        
        // Mettre à jour les chiffres dans le dropdown
        adultsCount.textContent = appState.passengerCounts.adults;
        childrenCount.textContent = appState.passengerCounts.children;
        
        // Gérer l'état des boutons
        dropdown.querySelector('[data-type="adults"][data-action="decrement"]').disabled = appState.passengerCounts.adults <= 1;
        dropdown.querySelector('[data-type="children"][data-action="decrement"]').disabled = appState.passengerCounts.children <= 0;
        
        // Traduire le résumé principal (ex: "1 Adulte")
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        if (typeof translation.passenger_summary === 'function') {
            summary.textContent = translation.passenger_summary(
                appState.passengerCounts.adults, 
                appState.passengerCounts.children
            );
        }
    }
    
    // Gérer les clics (inchangé)
    input.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });
    
    dropdown.addEventListener("click", (e) => {
        const target = e.target.closest('.counter-btn');
        if (target) {
            const type = target.dataset.type;
            const action = target.dataset.action;
            if (action === "increment") appState.passengerCounts[type]++;
            else if (action === "decrement") appState.passengerCounts[type]--;
            updateDisplay();
        }
    });
    
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !input.contains(e.target)) {
            dropdown.classList.remove("open");
        }
    });

    // ===========================================
    // ✅ LA MODIFICATION EST ICI
    // ===========================================
    // On rend la fonction 'updateDisplay' accessible depuis l'extérieur
    // en l'assignant à notre variable globale.
    refreshPassengerSelectorUI = updateDisplay;
    // ===========================================
    
    // Appel initial pour que tout soit correct au chargement
    updateDisplay();
}
// DANS app.js (remplacez votre fonction setupPaymentMethodToggle)
function setupPaymentMethodToggle() {
    const radios = document.querySelectorAll('input[name="payment"]');
    const mtnDetails = document.getElementById("mtn-details");
    const airtelDetails = document.getElementById("airtel-details");
    const agencyDetails = document.getElementById("agency-details");
    
    if (!radios.length) return;
    
    // --- 1. Traduire le texte initial pour l'option agence ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const agencySubtitle = document.getElementById('agency-payment-subtitle');
    if (agencySubtitle && typeof translation.payment_agency_desc === 'function') {
        agencySubtitle.textContent = translation.payment_agency_desc(CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS);
    }
    
    // --- 2. Gérer les changements de sélection ---
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            // Cacher tous les détails
            if (mtnDetails) mtnDetails.style.display = "none";
            if (airtelDetails) airtelDetails.style.display = "none";
            if (agencyDetails) agencyDetails.style.display = "none";
            
            // Afficher le bon détail
            if (radio.checked) {
                if (radio.value === "mtn" && mtnDetails) mtnDetails.style.display = "flex";
                else if (radio.value === "airtel" && airtelDetails) airtelDetails.style.display = "flex";
                else if (radio.value === "agency" && agencyDetails) agencyDetails.style.display = "flex";
            }

            // ===================================
            // ✅ LOGIQUE DU DÉCOMPTEUR CORRIGÉE
            // ===================================
            // Si on sélectionne "Agence", on démarre le décompteur.
            if (radio.value === 'agency' && radio.checked) {
                startAgencyCountdown();
            } 
            // Si on sélectionne une autre option, on arrête le décompteur.
            else {
                stopAgencyCountdown();
            }
            // ===================================
        });
    });
}

// ============================================
// ✅ INITIALISATION DES FILTRES ÉQUIPEMENTS
// ============================================
function setupAmenitiesFilters() {
    const container = document.getElementById('amenities-filter-container');
    if (!container) return;

    // --- Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const amenities = [
        { value: 'wifi', labelKey: 'amenity_wifi' },
        { value: 'wc', labelKey: 'amenity_wc' },
        { value: 'prise', labelKey: 'amenity_plugs' },
        { value: 'clim', labelKey: 'amenity_ac' }
    ];
    
    container.innerHTML = amenities.map(amenity => {
        // On va chercher la traduction correspondante
        const labelText = translation[amenity.labelKey] || amenity.value;

        return `
            <label class="amenity-checkbox-label">
                <input 
                    type="checkbox" 
                    class="amenity-checkbox" 
                    value="${amenity.value}" 
                    onchange="updateFilter('amenity', '${amenity.value}')"
                >
                <span>
                    ${Utils.getAmenityIcon(amenity.value)}
                    ${labelText}
                </span>
            </label>
        `;
    }).join('');
}
window.searchBuses = async function() {
    resetBookingState();
    appState.isSelectingReturn = false;
    
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const travelDates = document.getElementById("travel-date").value;
    
    let departureDate, returnDate;

    // ==========================================================
    // ✅ CORRECTION DE LA DÉTECTION DE LA PLAGE DE DATES
    // ==========================================================
    // Flatpickr utilise " to " en anglais et " au " en français.
    const separator = (lang === 'en') ? " to " : " au ";
    
    if (travelDates.includes(separator)) {
        [departureDate, returnDate] = travelDates.split(separator).map(date => date.trim());
    } else {
        // Sécurité : si le séparateur est incorrect, on considère une date unique
        departureDate = travelDates;
        returnDate = null;
    }
    // ==========================================================
    
    const totalPassengers = appState.passengerCounts.adults + appState.passengerCounts.children;
    const tripType = document.querySelector(".trip-type-toggle").getAttribute("data-mode") || "one-way";
    
    // --- Validation (votre code est conservé) ---
    if (!origin || !destination) {
        Utils.showToast(translation.error_missing_origin_destination, 'error');
        return;
    }
    if (origin === destination) {
        Utils.showToast(translation.error_same_origin_destination, 'error');
        return;
    }
    if (!departureDate) {
        Utils.showToast(translation.error_missing_departure_date, 'error');
        return;
    }
    if (tripType === "round-trip" && !returnDate) {
        Utils.showToast(translation.error_missing_return_date, 'error');
        return;
    }
    
    appState.currentSearch = { origin, destination, date: departureDate, returnDate, passengers: totalPassengers, tripType };
    
    try {
        Utils.showToast(translation.info_searching, 'info');
        
        const response = await fetch(`${API_CONFIG.baseUrl}/api/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${departureDate}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || translation.error_search_failed);
        }
        
        const data = await response.json();
        
        if (data.count === 0) {
            Utils.showToast(translation.info_no_trips_found, 'info');
            appState.currentResults = [];
            displayResults([]);
            showPage("results");
        } else {
            appState.currentResults = data.results;
            displayResults(data.results);
            showPage("results");
            Utils.showToast(translation.success_trips_found(data.count), 'success');
        }
        
    } catch (error) {
        console.error('❌ Erreur recherche:', error);
        Utils.showToast(error.message || translation.error_search_failed, 'error');
    }
}
function setupSmartSearch() {
    const searchInput = document.getElementById('smart-search-input');
    const submitBtn = document.getElementById('smart-search-submit-btn');
    const resultsContainer = document.getElementById('smart-search-results');

    if (!searchInput || !submitBtn || !resultsContainer) return;

    // --- Fonction interne pour afficher le formulaire détaillé ---
    const triggerDetailedSearch = (prefillData = {}) => {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        showDetailedSearch(prefillData);
    };

    // ===================================
    // ❌ PARTIE SUPPRIMÉE (plus nécessaire)
    // ===================================
    // searchInput.addEventListener('focus', ...);
    // searchInput.addEventListener('blur', ...);
    // ===================================

    // --- Écouteurs d'événements (votre code est correct et conservé) ---
    
    // Clic sur le bouton loupe 🔍
    submitBtn.addEventListener('click', () => {
        triggerDetailedSearch({ to: searchInput.value.trim() });
    });
    
    // Touche "Entrée"
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = resultsContainer.querySelector('.smart-result-item');
            if (firstResult) {
                firstResult.click();
            } else {
                triggerDetailedSearch({ to: searchInput.value.trim() });
            }
        }
    });
        
    // Auto-complétion pendant la frappe
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();


        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        
         // ✅ ON UTILISE LA NOUVELLE VARIABLE DYNAMIQUE
    const filteredRoutes = allRouteTemplates.filter(route => 
        `${route.from} ${route.to}`.toLowerCase().includes(query) ||
        `${route.to} ${route.from}`.toLowerCase().includes(query)
    );
    
        
        displaySmartSearchResults(filteredRoutes.slice(0, 5));
    });

    // Fermeture des résultats au clic extérieur
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.smart-search-wrapper')) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
    });
}

// Fichier : app.js

/**
 * Anime le placeholder de la barre de recherche avec un effet machine à écrire.
 */
// Fichier: app.js

function animateSearchPlaceholder() {
    const searchInput = document.getElementById('smart-search-input');
    if (!searchInput) return;

    let suggestionIndex = 0;

    // Fonction pour l'effet "machine à écrire"
    function type(text, callback) {
        let i = 0;
        searchInput.placeholder = ''; // On vide le placeholder
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                searchInput.placeholder += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                if (callback) setTimeout(callback, 2000); // Pause de 2 secondes après avoir écrit
            }
        }, 100); // Vitesse d'écriture
    }

    // Fonction pour l'effet "suppression"
    function erase(callback) {
        const text = searchInput.placeholder;
        let i = text.length;
        const erasingInterval = setInterval(() => {
            if (i > 0) {
                searchInput.placeholder = text.substring(0, i - 1);
                i--;
            } else {
                clearInterval(erasingInterval);
                if (callback) callback();
            }
        }, 50); // Vitesse de suppression
    }

    // Boucle d'animation principale
    function loop() {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        const suggestions = translation.smart_search_suggestions;
        const initialPlaceholder = translation.smart_search_placeholder;

        // On alterne entre le placeholder de base et les suggestions
        const currentText = (suggestionIndex % (suggestions.length + 1) === 0)
            ? initialPlaceholder
            : suggestions[(suggestionIndex - 1) % suggestions.length];

        type(currentText, () => { // On écrit le texte
            erase(() => {         // Puis on l'efface
                suggestionIndex++;
                loop();            // Et on recommence
            });
        });
    }

    // On lance la première animation
    loop();
}



function displaySmartSearchResults(results) {
    const resultsContainer = document.getElementById('smart-search-results');
    const searchInput = document.getElementById('smart-search-input');
    if (!resultsContainer || !searchInput) return;

    if (results.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // --- Calcul de la position ---
    const inputRect = searchInput.getBoundingClientRect();
    resultsContainer.style.left = `${inputRect.left}px`;
    resultsContainer.style.top = `${inputRect.bottom + window.scrollY}px`; // On ajoute le scroll
    resultsContainer.style.width = `${inputRect.width}px`;

    resultsContainer.innerHTML = results.map(route => `
        <div class="smart-result-item" onclick="selectSmartSearchResult('${route.from}', '${route.to}')">
            <span>${route.from} → <strong>${route.to}</strong></span>
        </div>
    `).join('');

    resultsContainer.style.display = 'block';
}


function selectSmartSearchResult(from, to) {
    // On appelle la fonction principale d'affichage avec les données complètes
    showDetailedSearch({ from: from, to: to });
}


async function showDetailedSearch(prefillData = {}) {
    const smartSearchContainer = document.getElementById('smart-search-container');
    const detailedSearchBox = document.getElementById('detailed-search-box');

    if (!smartSearchContainer || !detailedSearchBox) {
        console.error("Erreur: Conteneurs de recherche introuvables.");
        return;
    }
    
    // Cacher la barre intelligente et afficher le formulaire
    smartSearchContainer.style.display = 'none';
    detailedSearchBox.style.display = 'block';
    setTimeout(() => { detailedSearchBox.classList.add('visible'); }, 10);

    // ============================================
    // ✅ CORRECTION DE L'ORDRE D'EXÉCUTION
    // ============================================

    // 1. On attend que la liste des villes soit chargée et affichée
    if (typeof populateCitySelects === 'function') {
        await populateCitySelects();
    }

    // 2. SEULEMENT APRÈS, on pré-remplit les valeurs
    if (prefillData) {
        if (prefillData.from) document.getElementById('origin').value = prefillData.from;
        if (prefillData.to) document.getElementById('destination').value = prefillData.to;
    }

    // 3. On initialise le calendrier
    if (typeof setupDatePickers === 'function') {
        setupDatePickers();
    }
    
    // 4. On met le focus sur le bon champ
    if (prefillData.from && prefillData.to) {
        document.getElementById('travel-date').focus();
    } else if (prefillData.to) {
        document.getElementById('origin').focus();
    } else {
        document.getElementById('origin').focus();
    }
    // ============================================
}



// ============================================
// 🔍 FILTRAGE ET TRI DES RÉSULTATS
// ============================================

function applyFiltersAndSort() {
    let filteredResults = [...appState.currentResults];
    
    // ✅ Filtre par compagnie
    if (activeFilters.company !== 'all') {
        filteredResults = filteredResults.filter(route => 
            route.company === activeFilters.company
        );
    }
    
    // ✅ Filtre par type de trajet
    if (activeFilters.tripType !== 'all') {
        filteredResults = filteredResults.filter(route => 
            route.tripType === activeFilters.tripType
        );
    }
    
    // ✅ Filtre par plage de prix
    filteredResults = filteredResults.filter(route => 
        route.price >= activeFilters.priceRange.min && 
        route.price <= activeFilters.priceRange.max
    );
    
    // ✅ Filtre par heure de départ
    if (activeFilters.departureTime !== 'all') {
        filteredResults = filteredResults.filter(route => {
            const hour = parseInt(route.departure.split(':')[0]);
            switch (activeFilters.departureTime) {
                case 'morning': return hour >= 5 && hour < 12;
                case 'afternoon': return hour >= 12 && hour < 17;
                case 'evening': return hour >= 17 && hour < 21;
                case 'night': return hour >= 21 || hour < 5;
                default: return true;
            }
        });
    }
    
    // ✅ Filtre par équipements
    if (activeFilters.amenities.length > 0) {
        filteredResults = filteredResults.filter(route =>
            activeFilters.amenities.every(amenity => 
                route.amenities.includes(amenity)
            )
        );
    }


    // ✅ AJOUTER CE BLOC DE FILTRAGE
    // Filtre par lieu de départ
    if (activeFilters.departureLocation !== 'all') {
        filteredResults = filteredResults.filter(route => 
            route.departureLocation === activeFilters.departureLocation
        );
    }
    
    // ✅ Tri
    filteredResults.sort((a, b) => {
        switch (activeFilters.sortBy) {
            case 'price':
                return a.price - b.price;
            case 'duration':
                return Utils.getDurationInMinutes(a.duration) - Utils.getDurationInMinutes(b.duration);
            case 'company':
                return a.company.localeCompare(b.company);
            case 'departure':
            default:
                return a.departure.localeCompare(b.departure);
        }
    });
    
    return filteredResults;
}

// ============================================
// 🎛️ GESTION DES FILTRES UI
// ============================================

// DANS app.js, REMPLACEZ la fonction updateFilter

window.updateFilter = function(filterType, value) {
    switch (filterType) {
        // ✅ CORRECTION : Ajout de 'departureLocation' à la liste
        case 'company':
        case 'tripType':
        case 'departureTime':
        case 'sortBy':
        case 'departureLocation':
            activeFilters[filterType] = value;
            break;
        
        case 'priceMin':
            activeFilters.priceRange.min = parseInt(value) || 0;
            document.getElementById('price-min-display').textContent = 
                Utils.formatPrice(activeFilters.priceRange.min);
            break;
        
        case 'priceMax':
            activeFilters.priceRange.max = parseInt(value) || 100000;
            document.getElementById('price-max-display').textContent = 
                Utils.formatPrice(activeFilters.priceRange.max);
            break;
        
        case 'amenity':
            const index = activeFilters.amenities.indexOf(value);
            if (index > -1) {
                activeFilters.amenities.splice(index, 1);
            } else {
                activeFilters.amenities.push(value);
            }
            break;
    }
    
    // Réappliquer les filtres et rafraîchir l'affichage
    const filtered = applyFiltersAndSort();
    displayResults(filtered, appState.isSelectingReturn);
    
    // Message si aucun résultat
    if (filtered.length === 0) {
        Utils.showToast('Aucun trajet ne correspond à vos critères', 'info');
    }
};
window.resetFilters = function() {
    // 1. Réinitialiser l'objet des filtres actifs
    activeFilters = {
        company: 'all',
        tripType: 'all',
        priceRange: { min: 0, max: 100000 },
        departureTime: 'all',
        amenities: [],
        sortBy: 'departure',
        departureLocation: 'all'
    };

    // 2. Réinitialiser les champs de formulaire dans l'interface utilisateur
    const locationSelect = document.getElementById('filter-departure-location');
    if (locationSelect) locationSelect.value = 'all';
    
    document.getElementById('filter-company').value = 'all';
    document.getElementById('filter-trip-type').value = 'all';
    document.getElementById('filter-time').value = 'all';
    document.getElementById('sort-by').value = 'departure';
    
    const priceMinInput = document.getElementById('price-min');
    if (priceMinInput) priceMinInput.value = 0;
    
    const priceMaxInput = document.getElementById('price-max');
    if (priceMaxInput) priceMaxInput.value = 100000;
    
    const priceMinDisplay = document.getElementById('price-min-display');
    if (priceMinDisplay) priceMinDisplay.textContent = '0';
    
    const priceMaxDisplay = document.getElementById('price-max-display');
    if (priceMaxDisplay) priceMaxDisplay.textContent = '100 000';
    
    document.querySelectorAll('.amenity-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    // 3. Rafraîchir l'affichage des résultats
    displayResults(appState.currentResults, appState.isSelectingReturn);
    
    // ===================================
    // ✅ TRADUCTION DU MESSAGE DE SUCCÈS
    // ===================================
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    Utils.showToast(translation.success_filters_reset, 'success');
    // ===================================
};
// DANS app.js, REMPLACEZ la fonction displayResults

// DANS app.js (remplacez votre fonction displayResults)
// DANS app.js (remplacez votre fonction displayResults par celle-ci)
// DANS app.js (remplacez votre fonction displayResults par celle-ci)

// DANS app.js (remplacez votre fonction displayResults)
function displayResults(results, isReturn = false) {

     // On récupère les traductions AU TOUT DÉBUT pour qu'elles soient disponibles pour toute la fonction
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    // --- 1. Récupération des éléments DOM et des traductions ---
    const summary = document.getElementById("search-summary");
    const resultsList = document.getElementById("results-list");
    const legendContainer = document.getElementById("amenities-legend");
    const locationFilterSection = document.getElementById('departure-location-filter-section');
    const locationSelect = document.getElementById('filter-departure-location');
    
   
    
    // --- 2. Application des filtres et du tri ---
    const displayedResults = applyFiltersAndSort();
    
    // --- 3. Mise à jour du résumé de la recherche ---
    let summaryText = isReturn
        ? translation.results_summary_return(displayedResults.length, appState.currentSearch.destination, appState.currentSearch.origin)
        : translation.results_summary_outbound(displayedResults.length, appState.currentSearch.origin, appState.currentSearch.destination);
    if (summary) summary.innerHTML = summaryText;

    // --- 4. Mise à jour du filtre par lieu de départ ---
    if (locationFilterSection && locationSelect) {
        const uniqueLocations = [...new Set(allRouteTemplates.map(t => t.departureLocation).filter(Boolean))];
        
        if (uniqueLocations.length > 1) {
            const currentFilterValue = activeFilters.departureLocation;
            locationSelect.innerHTML = `<option value="all">${translation.filter_all_locations || 'Tous les lieux'}</option>`;
            uniqueLocations.forEach(location => {
                const isSelected = currentFilterValue === location ? 'selected' : '';
                locationSelect.innerHTML += `<option value="${location}" ${isSelected}>${location}</option>`;
            });
            locationFilterSection.style.display = 'block';
        } else {
            locationFilterSection.style.display = 'none';
        }
    }

    // --- 5. Logique pour les badges "Moins cher" et "Plus rapide" ---
    let cheapestId = null, fastestId = null;
    if (displayedResults.length > 1) {
        const minPrice = Math.min(...displayedResults.map(r => r.price));
        const cheapestRoute = displayedResults.find(r => r.price === minPrice);
        if (cheapestRoute) cheapestId = cheapestRoute.id;

        const directTrips = displayedResults.filter(r => r.tripType === 'direct');
        if (directTrips.length > 0) {
            let minDuration = Infinity;
            directTrips.forEach(route => {
                const durationInMinutes = Utils.getDurationInMinutes(route.duration);
                if (durationInMinutes < minDuration) {
                    minDuration = durationInMinutes;
                    fastestId = route.id;
                }
            });
        }
    }

    // --- 6. Affichage du message si aucun résultat ---
    if (displayedResults.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 48px;">
                <h3>${translation.results_no_results_title}</h3>
                <p>${translation.results_no_results_desc}</p>
                <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 16px;">
                    ${translation.filter_reset_button}
                </button>
            </div>`;
        return;
    }

    // --- 7. Génération des cartes de résultats ---
    resultsList.innerHTML = displayedResults.map(route => {
        let badgeHTML = '';
        if (route.highlightBadge) badgeHTML = `<div class="highlight-badge">${route.highlightBadge}</div>`;
        else if (route.id === cheapestId) badgeHTML = `<div class="highlight-badge cheapest">${translation.badge_cheapest}</div>`;
        else if (route.id === fastestId) badgeHTML = `<div class="highlight-badge fastest">${translation.badge_fastest}</div>`;

        const amenitiesHTML = route.amenities.map(amenity => `<div class="amenity-item" title="${(translation.amenity_labels || {})[amenity] || amenity}">${Utils.getAmenityIcon(amenity)}</div>`).join("");
        const departureLocationHTML = route.departureLocation ? `<div class="bus-card-location">${translation.departure_location_label(route.departureLocation)}</div>` : '';
        
        let tripDetailsHTML = '';
        if (route.stops && route.stops.length > 0) {
            tripDetailsHTML = `
                <div class="trip-details-accordion">
                    <div class="accordion-header" onclick="toggleTripDetails(this)">
                        <span class="bus-card-trip-details"><span class="accordion-icon">▶</span>
                            <span>${translation.details_stops_planned} </span>
                            <strong class="bus-card-stops">${translation.details_stops_count(route.stops.length)}</strong>
                        </span>
                    </div>
                    <div class="accordion-content">
                        ${route.stops.map(stop => `<div class="accordion-content-item"><strong>${stop.city}</strong> - ${translation.details_arrival}: ${stop.arrivalTime}, ${translation.details_departure}: ${stop.departureTime} (${stop.duration})</div>`).join('')}
                    </div>
                </div>`;
        } else if (route.connections && route.connections.length > 0) {
             tripDetailsHTML = `
                <div class="trip-details-accordion">
                    <div class="accordion-header" onclick="toggleTripDetails(this)">
                         <span class="bus-card-trip-details"><span class="accordion-icon">▶</span>
                            <span>${translation.details_connections} </span>
                            <strong class="bus-card-stops">${translation.details_connections_count(route.connections.length)}</strong>
                        </span>
                    </div>
                    <div class="accordion-content">
                         ${route.connections.map(conn => `<div class="accordion-content-item">${translation.details_connection_info(conn.at, conn.waitTime)}<br><small>${translation.details_next_bus_info(conn.nextCompany, conn.nextBusNumber, conn.nextDeparture)}</small></div>`).join('')}
                    </div>
                </div>`;
        } else {
            tripDetailsHTML = `<div class="bus-card-trip-details">${Utils.getAmenityIcon('direct')}<span>${translation.details_direct_trip}</span></div>`;
        }

        return `
            <div class="bus-card">
                ${badgeHTML}
                <div class="bus-card-wrapper">
                    <div class="bus-card-main">
                        <div class="bus-card-time"><span>${route.departure}</span><div class="bus-card-duration"><span>→</span><br>${route.duration || 'N/A'}</div><span>${route.arrival}</span></div>
                        ${departureLocationHTML}
                        <div class="bus-card-company">${route.company}</div>
                        ${tripDetailsHTML}
                        <div class="bus-card-details">
                            <div class="bus-amenities">${amenitiesHTML}</div>
                            <div class="bus-seats"><strong>${route.availableSeats}</strong> ${translation.seats_available}</div>
                        </div>
                    </div>
                    <div class="bus-card-pricing">
                        <div class="bus-price">${Utils.formatPrice(route.price)} FCFA</div>
                        <button class="btn btn-primary" onclick="selectBus('${route.id}')">${translation.button_select}</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // --- 8. Mise à jour de la légende (traduite) ---
    if (legendContainer) {
        const amenityLabels = translation.amenity_labels || {};
        legendContainer.innerHTML = Object.entries(amenityLabels).map(([key, label]) => 
            `<div class="legend-amenity">${Utils.getAmenityIcon(key)}<span>${label}</span></div>`
        ).join('');
    }
}

// DANS app.js (à ajouter avec vos autres fonctions)

/**
 * Gère l'ouverture et la fermeture d'un accordéon pour les détails de trajet.
 * @param {HTMLElement} element - L'élément sur lequel on a cliqué.
 */
window.toggleTripDetails = function(element) {
    // On trouve le panneau de contenu qui est juste après l'en-tête cliqué
    const content = element.nextElementSibling;
    
    // On ajoute ou on enlève la classe 'open' sur l'en-tête
    element.classList.toggle('open');
    
    if (content.style.maxHeight) {
        // Si le panneau est ouvert (a un maxHeight), on le ferme
        content.style.maxHeight = null;
        content.style.paddingTop = null;
    } else {
        // Si le panneau est fermé, on l'ouvre en lui donnant la hauteur de son contenu
        content.style.paddingTop = "10px";
        content.style.maxHeight = content.scrollHeight + "px";
    }
}
    
// Dans app.js
window.selectBus = async function(busId) {
    console.log('🚌 Sélection du bus ID :', busId);
    
    // ===================================
    // ✅ CORRECTION : On récupère les traductions
    // ===================================
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const selectedRoute = appState.currentResults.find(r => r.id === busId.toString());
    if (!selectedRoute) {
        Utils.showToast('Erreur : voyage introuvable.', 'error');
        return;
    }

    if (appState.isSelectingReturn) {
        appState.selectedReturnBus = selectedRoute;
        appState.selectedReturnSeats = [];
        
        Utils.showToast(translation.toast_select_return_seats, "info");
        
        await loadRealSeats();
        displaySeats();
        showPage("seats");
        
    } else {
        appState.selectedBus = selectedRoute;
        appState.selectedSeats = [];
        
        Utils.showToast(translation.toast_select_outbound_seats, "info");
        
        await loadRealSeats();
        displaySeats();
        showPage("seats");
    }
};
// ✅ NOUVELLE FONCTION : Recherche des trajets retour
async function searchReturnTrips() {
    try {
        Utils.showToast('Recherche des trajets retour...', 'info');
        
        const response = await fetch(
            `${API_CONFIG.baseUrl}/api/search?from=${encodeURIComponent(appState.currentSearch.destination)}&to=${encodeURIComponent(appState.currentSearch.origin)}&date=${appState.currentSearch.returnDate}`
        );
        
        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des trajets retour');
        }
        
        const data = await response.json();
        
        if (data.count === 0) {
            Utils.showToast("Aucun trajet retour disponible pour cette date", 'warning');
            // Proposer de revenir à la recherche
            if (confirm("Aucun trajet retour trouvé. Voulez-vous modifier votre recherche ?")) {
                showPage("home");
            }
        } else {
            appState.currentResults = data.results;
            displayResults(data.results, true); // true = mode retour
            showPage("results");
            Utils.showToast(`${data.count} trajet(s) retour trouvé(s)`, 'success');
        }
        
    } catch (error) {
        console.error('❌ Erreur recherche retour:', error);
        Utils.showToast(error.message, 'error');
    }
}

async function loadRealSeats() {
    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    
    if (!currentBus || !currentBus.id) {
        console.error('❌ Aucun bus sélectionné');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/trips/${currentBus.id}/seats`);
        
        if (!response.ok) {
            throw new Error('Erreur récupération des sièges');
        }
        
        const data = await response.json();
        
        // ✅ RÉCUPÉRER LES VRAIS SIÈGES OCCUPÉS
        const occupiedSeatNumbers = data.seats
            .filter(s => s.status === 'occupied' || s.status === 'blocked')
            .map(s => s.number);
        
        if (appState.isSelectingReturn) {
            appState.occupiedReturnSeats = occupiedSeatNumbers;
        } else {
            appState.occupiedSeats = occupiedSeatNumbers;
        }
        
        console.log(`💺 ${occupiedSeatNumbers.length} sièges occupés chargés depuis le serveur`);
        
    } catch (error) {
        console.error('❌ Erreur chargement sièges:', error);
        Utils.showToast('Erreur de chargement des sièges', 'error');
    }
}

window.toggleSeat = function(seatNumber) {
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    const index = currentSeats.indexOf(seatNumber);
    const maxSeats = appState.passengerCounts.adults + appState.passengerCounts.children;
    
    // Logique pour ajouter/retirer le siège (votre code est correct)
    if (index > -1) {
        currentSeats.splice(index, 1);
    } else {
        if (currentSeats.length >= maxSeats) {
            // ===================================
            // ✅ CORRECTION 1 : TRADUCTION DU MESSAGE
            // ===================================
            const lang = getLanguage();
            const translation = translations[lang] || translations.fr;
            Utils.showToast(translation.error_max_seats(maxSeats), 'error');
            return;
        }
        currentSeats.push(seatNumber);
    }
    
    currentSeats.sort((a, b) => a - b);
    
    if (appState.isSelectingReturn) {
        appState.selectedReturnSeats = currentSeats;
    } else {
        appState.selectedSeats = currentSeats;
    }
    
    // ===================================
    // ✅ CORRECTION 2 : OPTIMISATION DE L'AFFICHAGE
    // ===================================
    // Au lieu de redessiner toute la grille avec displaySeats(),
    // on met à jour uniquement le siège cliqué et le résumé.

    // 1. Mettre à jour le style du siège
    const seatElement = document.querySelector(`.modern-seat[data-seat="${seatNumber}"]`);
    if (seatElement) {
        seatElement.classList.toggle('selected');
    }

    // 2. Mettre à jour le résumé (prix et numéros)
    updateSeatSummary();
};
// ============================================
// ✅ AFFICHAGE DES SIÈGES - DESIGN IMMERSIF FLIXBUS
// ============================================

// Dans app.js
// Dans app.js
// DANS app.js, REMPLACEZ la fonction displaySeats par celle-ci
function displaySeats() {
    // 1. Récupération des traductions avec une sécurité
    const lang = getLanguage();
    // Si 'translations' ou la langue spécifique n'existe pas, on utilise un objet vide pour éviter les erreurs
    const translation = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};

    // 2. Récupération des données et des éléments DOM
    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    const currentOccupied = appState.isSelectingReturn ? appState.occupiedReturnSeats : appState.occupiedSeats;
    
    const busInfo = document.getElementById("bus-info");
    const seatGrid = document.getElementById("pro-seat-grid");
    const occupancyInfo = document.getElementById("trip-occupancy-info");

    if (!busInfo || !seatGrid || !occupancyInfo) return;
    
    // 3. Traduction de l'en-tête du bus (avec fallback)
    const tripLabel = appState.isSelectingReturn ? (translation.trip_badge_return || "RETOUR") : (translation.trip_badge_outbound || "ALLER");
    busInfo.innerHTML = `
        <div class="bus-info-header">
            <div class="trip-badge ${appState.isSelectingReturn ? 'return' : 'outbound'}">${tripLabel}</div>
            <h3>${currentBus.company} - ${currentBus.from} → ${currentBus.to}</h3>
            <div class="price-info">
                <span class="price-item"><strong>${translation.seats_price_info_adult || 'Adulte'}:</strong> ${Utils.formatPrice(currentBus.price)} FCFA</span>
                <span class="price-divider">|</span>
                <span class="price-item"><strong>${translation.seats_price_info_child || 'Enfant'}:</strong> ${Utils.formatPrice(CONFIG.CHILD_TICKET_PRICE)} FCFA</span>
            </div>
        </div>
    `;
    
    // 4. Traduction des informations d'occupation du bus (avec fallback)
    const totalSeats = currentBus.totalSeats || CONFIG.SEAT_TOTAL;
    const availableSeats = currentBus.availableSeats - currentSeats.length;
    if (totalSeats && availableSeats >= 0) {
        const occupiedSeats = totalSeats - availableSeats;
        let message = (typeof translation.seats_occupancy_info_travelers === 'function') ? translation.seats_occupancy_info_travelers(occupiedSeats) : `<strong>${occupiedSeats}</strong> voyageurs à bord`;
        let seatsLeftMessage = (typeof translation.seats_occupancy_info_seats_left === 'function') ? translation.seats_occupancy_info_seats_left(availableSeats) : `<strong>${availableSeats}</strong> sièges restants`;
        if (availableSeats < 10) {
            seatsLeftMessage = (typeof translation.seats_occupancy_info_few_left === 'function') ? translation.seats_occupancy_info_few_left(availableSeats) : `<span class="danger">🔥 <strong>${availableSeats}</strong> sièges restants !</span>`;
        }
        occupancyInfo.innerHTML = `<span>${message}</span> | <span>${seatsLeftMessage}</span>`;
        occupancyInfo.style.display = 'flex';
    } else {
        occupancyInfo.style.display = 'none';
    }
    

    // 5. Génération de la grille des sièges (avec labels traduits et fallback)
    const hasWC = currentBus.amenities.includes("wc");
    const seatsPerRow = 4;
    const backRowSeatsCount = 5;
    
    let mainRows = Math.floor((totalSeats - backRowSeatsCount) / seatsPerRow);
    if ((totalSeats - backRowSeatsCount) % seatsPerRow !== 0) mainRows++;

    let seatHTML = `
        <div class="modern-bus-container">
            <div class="bus-front-zone">
                <div class="driver-section"><div class="driver-icon">🧑‍✈️</div><span class="driver-label">${translation.seats_driver || 'Chauffeur'}</span></div>
                <div class="front-door-section"><div class="bus-steps"><div class="step"></div><div class="step"></div><div class="step"></div></div><div class="door-icon">🚪</div><span class="door-label">${translation.seats_entrance || 'Entrée'}</span></div>
            </div>
            <div class="modern-seat-grid">
    `;
    
    let seatNumber = 1;
    const seatsInMainRows = totalSeats - backRowSeatsCount;
    
    for (let row = 1; row <= mainRows; row++) {
        seatHTML += `<div class="seat-row" data-row="${row}">`;
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `A${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `B${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        seatHTML += `<div class="aisle-space"><div class="aisle-line"></div></div>`;
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `C${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `D${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        seatHTML += `<div class="row-indicator">${row}</div></div>`;
    }
    
    seatHTML += `</div>`; // Fin de modern-seat-grid
    
    if (hasWC) {
        seatHTML += `<div class="toilet-section"><div class="toilet-icon">🚻</div><span class="toilet-label">${translation.seats_restroom || 'Toilettes'}</span></div>`;
    }
    
    seatHTML += `<div class="back-row-container"><div class="back-row-label">${translation.seats_back_row || 'Rangée arrière'}</div><div class="back-row-seats">`;
    
    for (let i = 0; i < backRowSeatsCount; i++) {
        if (seatNumber <= totalSeats) {
            seatHTML += generateModernSeat(seatNumber++, `R${i + 1}`, currentSeats, currentOccupied);
        }
    }
    
    seatHTML += `</div></div></div>`;
    
    seatGrid.innerHTML = seatHTML;

    // 6. Appel final pour mettre à jour le résumé
    updateSeatSummary();
}

// ✅ Fonction auxiliaire pour générer un siège moderne
function generateModernSeat(seatNumber, seatLabel, selectedSeats, occupiedSeats) {
    const isOccupied = occupiedSeats.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);
    
    let seatClass = 'modern-seat ';
    if (isOccupied) {
        seatClass += 'occupied';
    } else if (isSelected) {
        seatClass += 'selected seat-pulse';
    } else {
        seatClass += 'available';
    }
    
    const clickHandler = isOccupied ? '' : `onclick="toggleSeat(${seatNumber})"`;
    const ariaLabel = `Siège ${seatLabel}, ${isOccupied ? 'occupé' : isSelected ? 'sélectionné' : 'disponible'}`;
    
    return `
        <div class="${seatClass}" 
             ${clickHandler}
             data-seat="${seatNumber}"
             aria-label="${ariaLabel}"
             role="checkbox"
             aria-checked="${isSelected}"
             tabindex="${isOccupied ? '-1' : '0'}">
            <div class="seat-content">
                ${isOccupied ? '<span class="seat-cross">✕</span>' : `<span class="seat-label">${seatLabel}</span>`}
            </div>
        </div>
    `;
}
// ✅ Fonction auxiliaire pour générer un siège
function generateSeatHTML(seatNumber, seatLabel, selectedSeats, occupiedSeats) {
    const isOccupied = occupiedSeats.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);
    
    let seatClass = 'bus-seat ';
    if (isOccupied) {
        seatClass += 'occupied';
    } else if (isSelected) {
        seatClass += 'selected';
    } else {
        seatClass += 'available';
    }
    
    const clickHandler = isOccupied ? '' : `onclick="toggleSeat(${seatNumber})"`;
    const ariaLabel = `Siège ${seatLabel}, ${isOccupied ? 'occupé' : isSelected ? 'sélectionné' : 'disponible'}`;
    
    return `
        <div class="${seatClass}" 
             ${clickHandler}
             data-seat="${seatNumber}"
             aria-label="${ariaLabel}"
             role="checkbox"
             aria-checked="${isSelected}"
             tabindex="${isOccupied ? '-1' : '0'}">
            ${isOccupied ? '' : seatLabel}
        </div>
    `;
}
function updateSeatSummary() {
    console.log("--- Début de updateSeatSummary ---");

    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    console.log("Langue utilisée:", lang);

    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    console.log("Sièges sélectionnés:", currentSeats);

    const seatsDisplay = document.getElementById("selected-seats-display");
    const priceDisplay = document.getElementById("total-price-display");
    
    if (!seatsDisplay || !priceDisplay) {
        console.error("ERREUR FATALE: Les éléments seatsDisplay ou priceDisplay sont introuvables.");
        return;
    }
    console.log("Éléments d'affichage trouvés.");

    if (!currentBus) {
        console.warn("ATTENTION: currentBus est indéfini. Impossible de calculer le prix.");
        seatsDisplay.textContent = translation.seats_summary_none || "Aucun";
        priceDisplay.textContent = "0 FCFA";
        return;
    }
    console.log("Bus actuel trouvé. Prix de base:", currentBus.price);

    if (currentSeats.length === 0) {
        console.log("Aucun siège sélectionné. Affichage du texte par défaut.");
        seatsDisplay.textContent = translation.seats_summary_none || "Aucun";
        priceDisplay.textContent = "0 FCFA";
    } else {
        console.log("Calcul du prix pour les sièges:", currentSeats.join(", "));
        seatsDisplay.textContent = currentSeats.join(", ");
        
        const numSeats = currentSeats.length;
        const numAdults = appState.passengerCounts.adults;
        const adultsSelected = Math.min(numSeats, numAdults);
        const childrenSelected = numSeats - adultsSelected;
        
        const totalPrice = (adultsSelected * currentBus.price) + (childrenSelected * CONFIG.CHILD_TICKET_PRICE);
        
        console.log(`Prix calculé: ${totalPrice} FCFA`);
        priceDisplay.textContent = Utils.formatPrice(totalPrice) + " FCFA";
    }
    console.log("--- Fin de updateSeatSummary ---");
}
// Dans app.js
window.proceedToPassengerInfo = async function() {
    // ===================================
    // ✅ CORRECTION : On récupère les traductions
    // ===================================
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const expectedSeats = appState.passengerCounts.adults + appState.passengerCounts.children;
    
    if (appState.currentSearch.tripType === "round-trip" && !appState.isSelectingReturn) {
        if (appState.selectedSeats.length !== expectedSeats) {
            Utils.showToast(translation.error_max_seats(expectedSeats), 'error');
            return;
        }
        
        appState.isSelectingReturn = true;
        
        Utils.showToast(translation.toast_select_return_bus, 'info');
        await searchReturnTrips();
        return;
    }
    
    const seatsToCheck = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    if (seatsToCheck.length !== expectedSeats) {
        Utils.showToast(translation.error_max_seats(expectedSeats), 'error');
        return;
    }
    
    displayPassengerForms();
    showPage("passengers");
};
// Dans app.js
function displayPassengerForms() {
    const formsContainer = document.getElementById("passengers-forms");
    const baggageContainer = document.getElementById("baggage-options");
    const baggageInfo = document.getElementById("baggage-section-info");
    const baggageTitle = document.querySelector("#baggage-section h3");

    // ===========================================
    // ✅ TRADUCTION
    // ===========================================
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    // ===========================================

    let formsHTML = "";
    let baggageHTML = "";
    appState.baggageCounts = {};
    
    const baggageOptions = appState.selectedBus.baggageOptions || {
        standard: { included: 1, max: 5, price: 2000 },
        oversized: { max: 2, price: 5000 }
    };

    if (baggageInfo && translation.baggage_info) {
        // La traduction peut contenir du HTML comme <strong>
        baggageInfo.innerHTML = translation.baggage_info(baggageOptions.standard.included);
    }
    if (baggageTitle && translation.baggage_title) {
        baggageTitle.innerHTML = translation.baggage_title;
    }

    for (let i = 0; i < appState.currentSearch.passengers; i++) {
        const passengerType = i < appState.passengerCounts.adults 
            ? (translation.passenger_type_adult || "Adulte") 
            : (translation.passenger_type_child || "Enfant");
        const seatNumber = appState.selectedSeats[i];
        
        formsHTML += `
            <div class="passenger-form">
                <h3>${translation.passenger_form_title(i + 1, passengerType, seatNumber)}</h3>
                <div class="form-group">
                    <label for="name-${i}">${translation.passengers_name_label}</label>
                    <input type="text" id="name-${i}" class="form-control" placeholder="${translation.passengers_name_placeholder}" required>
                </div>
                <div class="form-group">
                    <label for="phone-${i}">${translation.passengers_phone_label}</label>
                    <input type="tel" id="phone-${i}" class="form-control" placeholder="${translation.passengers_phone_placeholder}" required>
                    <small style="color: var(--color-text-secondary);">${translation.passengers_phone_info}</small>
                </div>
                <div class="form-group">
                    <label for="email-${i}">${translation.passengers_email_label}</label>
                    <input type="email" id="email-${i}" class="form-control" placeholder="${translation.passengers_email_placeholder}">
                </div>
            </div>`;
        
        appState.baggageCounts[i] = { standard: 0, oversized: 0 };
        
        baggageHTML += `
            <div class="baggage-passenger-section">
                <h4>${translation.baggage_options_for(i + 1, seatNumber)}</h4>
                <div class="baggage-row">
                    <span class="baggage-label">
                        ${translation.baggage_standard_label(Utils.formatPrice(baggageOptions.standard.price))}
                    </span>
                    <div class="passenger-counter">
                        <button type="button" class="counter-btn" data-passenger-index="${i}" data-type="standard" data-action="decrement">-</button>
                        <span id="baggage-count-${i}-standard">0</span>
                        <button type="button" class="counter-btn" data-passenger-index="${i}" data-type="standard" data-action="increment">+</button>
                    </div>
                </div>
                <div class="baggage-row">
                    <span class="baggage-label">
                        ${translation.baggage_oversized_label(Utils.formatPrice(baggageOptions.oversized.price))}
                    </span>
                    <div class="passenger-counter">
                        <button type="button" class="counter-btn" data-passenger-index="${i}" data-type="oversized" data-action="decrement">-</button>
                        <span id="baggage-count-${i}-oversized">0</span>
                        <button type="button" class="counter-btn" data-passenger-index="${i}" data-type="oversized" data-action="increment">+</button>
                    </div>
                </div>
            </div>
        `;
    }

    formsContainer.innerHTML = formsHTML;
    baggageContainer.innerHTML = baggageHTML;
    
    document.querySelectorAll("#baggage-options .counter-btn").forEach(btn => {
        btn.addEventListener("click", handleBaggageChange);
    });
    
    updateBookingSummary();
}
// Dans app.js
function handleBaggageChange(event) {
    const passengerIndex = parseInt(event.target.dataset.passengerIndex);
    const baggageType = event.target.dataset.type; // 'standard' ou 'oversized'
    const action = event.target.dataset.action;

    const baggageOptions = appState.selectedBus.baggageOptions || {
        standard: { max: 5 },
        oversized: { max: 2 }
    };
    const max = baggageOptions[baggageType].max;

    if (action === "increment" && appState.baggageCounts[passengerIndex][baggageType] < max) {
        appState.baggageCounts[passengerIndex][baggageType]++;
    } else if (action === "decrement" && appState.baggageCounts[passengerIndex][baggageType] > 0) {
        appState.baggageCounts[passengerIndex][baggageType]--;
    }

    document.getElementById(`baggage-count-${passengerIndex}-${baggageType}`).textContent = appState.baggageCounts[passengerIndex][baggageType];
    
    // Mettre à jour l'état des boutons
    document.querySelector(`button[data-passenger-index="${passengerIndex}"][data-type="${baggageType}"][data-action="decrement"]`).disabled = appState.baggageCounts[passengerIndex][baggageType] <= 0;
    document.querySelector(`button[data-passenger-index="${passengerIndex}"][data-type="${baggageType}"][data-action="increment"]`).disabled = appState.baggageCounts[passengerIndex][baggageType] >= max;

    updateBookingSummary(); // Mettre à jour le récapitulatif à chaque changement
}


// Dans app.js

// ============================================
// 💰 MISE À JOUR DU RÉCAPITULATIF DE PRIX
// ============================================
function updateBookingSummary() {
    const summaryContainer = document.getElementById("booking-summary");
    if (!summaryContainer) {
        // Si on n'est pas sur la page de paiement, on ne fait rien
        return; 
    }

    // Récupérer les options de bagages du trajet (avec valeurs par défaut)
    const baggageOptions = appState.selectedBus.baggageOptions || {
        standard: { price: 2000 },
        oversized: { price: 5000 }
    };
    
    // Calcul du prix des billets
    const numAdultsSeats = Math.min(appState.selectedSeats.length, appState.passengerCounts.adults);
    const numChildrenSeats = appState.selectedSeats.length - numAdultsSeats;
    const ticketsPrice = (numAdultsSeats * appState.selectedBus.price) + (numChildrenSeats * CONFIG.CHILD_TICKET_PRICE);
    
    // Calcul du prix des bagages
    let totalStandardBaggage = 0;
    let totalOversizedBaggage = 0;
    if (appState.baggageCounts && Object.keys(appState.baggageCounts).length > 0) {
        Object.values(appState.baggageCounts).forEach(paxBaggage => {
            totalStandardBaggage += paxBaggage.standard || 0;
            totalOversizedBaggage += paxBaggage.oversized || 0;
        });
    }

    const standardBaggagePrice = totalStandardBaggage * baggageOptions.standard.price;
    const oversizedBaggagePrice = totalOversizedBaggage * baggageOptions.oversized.price;
    const totalBaggagePrice = standardBaggagePrice + oversizedBaggagePrice;

    // Calcul du prix total
    const totalPrice = ticketsPrice + totalBaggagePrice;
    
    // Mise à jour de l'affichage du récapitulatif
    summaryContainer.innerHTML = `
        <div class="detail-row"><span>Itinéraire:</span><strong>${appState.selectedBus.from} → ${appState.selectedBus.to}</strong></div>
        <div class="detail-row"><span>Date:</span><strong>${Utils.formatDate(appState.currentSearch.date)}</strong></div>
        <div class="detail-row"><span>Passagers:</span><strong>${appState.currentSearch.passengers} (${appState.passengerCounts.adults} Adulte(s), ${appState.passengerCounts.children} Enfant(s))</strong></div>
        <div class="detail-row"><span>Sièges:</span><strong>${appState.selectedSeats.join(", ")}</strong></div>
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row"><span>Prix des billets:</span><strong>${Utils.formatPrice(ticketsPrice)} FCFA</strong></div>
        <div class="detail-row"><span>Bagages standard (${totalStandardBaggage}):</span><strong>+ ${Utils.formatPrice(standardBaggagePrice)} FCFA</strong></div>
        <div class="detail-row"><span>Bagages hors format (${totalOversizedBaggage}):</span><strong>+ ${Utils.formatPrice(oversizedBaggagePrice)} FCFA</strong></div>
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row total-row"><span>PRIX TOTAL:</span><strong>${Utils.formatPrice(totalPrice)} FCFA</strong></div>
    `;

    // Mettre à jour les champs de paiement
    const bookingRef = document.getElementById("mtn-booking-ref")?.value || Utils.generateBookingNumber();
    const amountStr = `${Utils.formatPrice(totalPrice)} FCFA`;
    
    ['mtn', 'airtel', 'agency'].forEach(method => {
        const amountInput = document.getElementById(`${method}-amount`);
        const refInput = document.getElementById(`${method}-booking-ref`);
        if (amountInput) amountInput.value = amountStr;
        if (refInput) refInput.value = bookingRef;
    });
}
// DANS app.js, REMPLACEZ la fonction proceedToPayment par celle-ci

window.proceedToPayment = function() {
    console.log('🟢 proceedToPayment() appelée. Vérification des données...');
    
    if (!appState.selectedBus) {
        Utils.showToast("Erreur critique : Aucun voyage sélectionné.", "error");
        console.error("❌ Tentative de continuer sans 'appState.selectedBus'.");
        showPage('home'); 
        return;
    }

    appState.passengerInfo = [];
    let allFieldsValid = true;

    // ✅ CORRECTION : S'assurer que baggageCounts est bien un objet avant la boucle
    if (!appState.baggageCounts) {
        appState.baggageCounts = {};
        console.warn("⚠️ appState.baggageCounts était manquant, réinitialisé à {}.");
    }

    for (let i = 0; i < appState.currentSearch.passengers; i++) {
        const nameInput = document.getElementById(`name-${i}`);
        const phoneInput = document.getElementById(`phone-${i}`);
        const emailInput = document.getElementById(`email-${i}`);

        // Sécurité : vérifier que les champs existent dans le DOM
        if (!nameInput || !phoneInput || !emailInput) {
            Utils.showToast(`Erreur interne : champs manquants pour le passager ${i + 1}.`, 'error');
            allFieldsValid = false;
            break;
        }

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        
        if (!name || !phone) {
            Utils.showToast(`Veuillez remplir le nom et le téléphone pour le passager ${i + 1}.`, 'error');
            allFieldsValid = false;
            break;
        }
        
        if (!Utils.validatePhone(phone)) {
            Utils.showToast(`Numéro de téléphone invalide pour le passager ${i + 1}.`, 'error');
            allFieldsValid = false;
            break;
        }
        
        if (email && !Utils.validateEmail(email)) {
            Utils.showToast(`Email invalide pour le passager ${i + 1}.`, 'error');
            allFieldsValid = false;
            break;
        }
        
        // ✅ CORRECTION : Récupération plus sûre des données de bagages
        const passengerBaggage = appState.baggageCounts[i] || { standard: 0, oversized: 0 };
        
        appState.passengerInfo.push({
            seat: appState.selectedSeats[i],
            name: name,
            phone: phone,
            email: email,
            baggage: passengerBaggage
        });
    }

    // Si la boucle s'est terminée prématurément, on s'arrête ici.
    if (!allFieldsValid) {
        console.log("❌ Validation échouée. Navigation annulée.");
        return;
    }

    // Si tout est valide, on continue vers la page de paiement
    console.log("✅ Validation réussie. Affichage de la page de paiement.");
    displayBookingSummary(); 
    showPage("payment");
}
// Dans app.js

// Dans Frontend/app.js

// Dans app.js
// DANS app.js, REMPLACEZ la fonction displayBookingSummary par celle-ci

// DANS app.js, REMPLACEZ la fonction displayBookingSummary

// DANS app.js, REMPLACEZ la fonction displayBookingSummary
function displayBookingSummary() {
    console.log("📊 Affichage du récapitulatif de réservation...");
    
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // --- 2. Cibles DOM et vérifications ---
    const summaryContainer = document.getElementById("booking-summary");
    if (!summaryContainer) {
        console.error("❌ Élément #booking-summary introuvable.");
        return;
    }

    if (!appState.selectedBus || !appState.currentSearch || !appState.passengerInfo) {
        Utils.showToast(translation.error_critical || "Une erreur critique est survenue. Veuillez recommencer.", "error");
        showPage('home');
        return;
    }

    // --- 3. Calcul du prix ---
    const priceDetails = Utils.calculateTotalPrice(appState);
    const finalTotalPrice = priceDetails.total;
    const totalTicketsPrice = priceDetails.tickets + priceDetails.returnTickets;

    // --- 4. Construction du récapitulatif HTML ---
    let summaryHTML = `
        <div class="detail-row"><span>${translation.summary_outbound_route}:</span><strong>${appState.selectedBus.from} → ${appState.selectedBus.to}</strong></div>
        <div class="detail-row"><span>${translation.summary_outbound_date}:</span><strong>${Utils.formatDate(appState.currentSearch.date, lang)}</strong></div>
    `;
    if (appState.currentSearch.tripType === "round-trip" && appState.selectedReturnBus) {
        summaryHTML += `
            <div class="detail-row"><span>${translation.summary_return_route}:</span><strong>${appState.selectedReturnBus.from} → ${appState.selectedReturnBus.to}</strong></div>
            <div class="detail-row"><span>${translation.summary_return_date}:</span><strong>${Utils.formatDate(appState.currentSearch.returnDate, lang)}</strong></div>
        `;
    }
    summaryHTML += `
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row"><span>${translation.summary_tickets_price}:</span><strong>${Utils.formatPrice(totalTicketsPrice)} FCFA</strong></div>
        <div class="detail-row"><span>${translation.summary_baggage_fees}:</span><strong>+ ${Utils.formatPrice(priceDetails.baggage)} FCFA</strong></div>
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row total-row"><span>${translation.summary_total_price}:</span><strong>${Utils.formatPrice(finalTotalPrice)} FCFA</strong></div>
    `;
    summaryContainer.innerHTML = summaryHTML;

    // --- 5. Mise à jour des champs de paiement ---
    const amountStr = `${Utils.formatPrice(finalTotalPrice)} FCFA`;
    ['mtn', 'airtel', 'agency'].forEach(method => {
        const amountInput = document.getElementById(`${method}-amount`);
        if (amountInput) amountInput.value = amountStr;
    });

    // --- 6. Boîte d'urgence et décompteur ---
    const urgencyBox = document.getElementById('urgency-box');
   (async () => {
    if (!urgencyBox) return;
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/trips/${appState.selectedBus.id}/seats`);
        const seatData = await response.json();

        // ===================================
        // ✅ CORRECTION ICI
        // ===================================
        // On vérifie que la réponse est un succès ET que 'availableSeats' est bien un nombre.
        if (seatData.success && typeof seatData.availableSeats === 'number') {
            const availableSeats = seatData.availableSeats;
            let seatsLeftHTML = `<span class="urgency-value">${availableSeats}</span>`;
            if (availableSeats < 10) {
                seatsLeftHTML = `<span class="urgency-value danger">🔥 ${availableSeats}</span>`;
            }
            
            const deadline = new Date(Date.now() + CONFIG.MOBILE_MONEY_PAYMENT_DEADLINE_MINUTES * 60 * 1000);
            
            urgencyBox.innerHTML = `
                <div class="urgency-item">
                    <span class="urgency-label">${translation.urgency_seats_left}</span>
                    ${seatsLeftHTML} <!-- Maintenant, on est sûr que cette variable est définie -->
                </div>
                <div class="urgency-item" id="payment-countdown-container" data-deadline="${deadline.toISOString()}">
                    <span class="urgency-label">${translation.urgency_deadline}</span>
                    <span id="payment-countdown-timer" class="urgency-value">--:--</span>
                </div>
            `;
            urgencyBox.style.display = 'grid';
            
            // On peut démarrer le décompteur ici en toute sécurité
            startFrontendCountdown();
        } else {
             urgencyBox.style.display = 'none';
        }
    } catch (e) {
        console.error("Erreur affichage urgence:", e);
        if(urgencyBox) urgencyBox.style.display = 'none';
    }
})();
    
    // --- 7. Gestion du paiement à l'agence ---
    const agencyOption = document.getElementById('agency-payment-option');
    if (agencyOption) {
        if (canPayAtAgency()) {
            agencyOption.style.opacity = '1';
            agencyOption.querySelector('input').disabled = false;
        } else {
            agencyOption.style.opacity = '0.5';
            agencyOption.querySelector('input').disabled = true;
            agencyOption.title = "Paiement en agence non disponible (trop proche du départ)";
        }
    }
    
    console.log("✅ Récapitulatif affiché et mis à jour.");
}
// DANS app.js, REMPLACEZ la fonction confirmBooking

window.confirmBooking = async function(buttonElement) {
    console.group('💳 DÉBUT PROCESSUS DE RÉSERVATION');
    
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const originalButtonText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    const showLoading = (message) => { buttonElement.innerHTML = `<span style="animation: spin 1s linear infinite; ..."></span>${message}`; };
    
    // Utilisation de la traduction pour le message de chargement
    showLoading(translation.toast_booking_creation);

    try {
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!paymentMethod) throw new Error(translation.toast_select_payment_method);

        let customerPhone;
        const phoneInputId = `${paymentMethod}-phone`;
        const phoneInput = document.getElementById(phoneInputId);
        if (paymentMethod === 'agency') {
            customerPhone = appState.passengerInfo[0]?.phone || '';
        } else {
            customerPhone = phoneInput ? phoneInput.value.trim() : '';
        }
        if (!customerPhone || !Utils.validatePhone(customerPhone)) {
            throw new Error(translation.toast_invalid_phone(paymentMethod.toUpperCase()));
        }

        const priceDetails = Utils.calculateTotalPrice(appState);
        const finalTotalPriceNumeric = priceDetails.total;
        if (finalTotalPriceNumeric <= 0) throw new Error(translation.toast_price_error);

        const bookingNumber = Utils.generateBookingNumber();
        let paymentDeadline;
        if (paymentMethod === 'agency') {
            if (!canPayAtAgency()) throw new Error(translation.toast_agency_unavailable);
            paymentDeadline = new Date(Date.now() + CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000).toISOString();
        } else {
            paymentDeadline = new Date(Date.now() + CONFIG.MOBILE_MONEY_PAYMENT_DEADLINE_MINUTES * 60 * 1000).toISOString();
        }

        const reservation = {
            bookingNumber,
            route: appState.selectedBus,
            date: appState.currentSearch.date,
            passengers: appState.passengerInfo,
            seats: appState.selectedSeats,
            totalPrice: `${Utils.formatPrice(finalTotalPriceNumeric)} FCFA`,
            totalPriceNumeric: finalTotalPriceNumeric,
            paymentMethod: paymentMethod.toUpperCase(),
            busIdentifier: appState.selectedBus.busIdentifier || appState.selectedBus.trackerId,
            createdAt: new Date().toISOString(),
            status: 'En attente de paiement',
            customerPhone: customerPhone,
            paymentDeadline: paymentDeadline,
            lang:getLanguage()

        };

        if (appState.currentSearch.tripType === "round-trip" && appState.selectedReturnBus) {
            reservation.returnRoute = appState.selectedReturnBus;
            reservation.returnDate = appState.currentSearch.returnDate;
            reservation.returnSeats = appState.selectedReturnSeats;
            reservation.returnBusIdentifier = appState.selectedReturnBus.busIdentifier || appState.selectedReturnBus.trackerId;
        }
        
        if (paymentMethod === 'agency') {
            reservation.agency = getNearestAgency(appState.selectedBus.from);
        }

        const savedReservationResponse = await saveReservationToBackend(reservation);
        
        if (savedReservationResponse && savedReservationResponse.success) {
            if (savedReservationResponse.agencyPaymentCode) {
                reservation.agencyPaymentCode = savedReservationResponse.agencyPaymentCode;
            }
            
            appState.currentReservation = reservation;
            addBookingToLocalHistory(reservation.bookingNumber);
            
            displayPaymentInstructions(reservation);
            
            Utils.showToast(translation.toast_booking_saved_success, 'success');

        } else {
            throw new Error(savedReservationResponse?.error || translation.toast_booking_saved_fail);
        }

    } catch (error) {
        console.error('❌ ERREUR GLOBALE:', error);
        Utils.showToast(error.message, 'error');
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerHTML = originalButtonText;
        console.groupEnd();
    }
};
// ============================================
// 📄 AFFICHAGE DE LA PAGE DE CONFIRMATION
// ============================================
// DANS app.js, REMPLACEZ LA FONCTION displayConfirmation
// ============================================
// 📄 AFFICHAGE DE LA PAGE DE CONFIRMATION (CORRIGÉE)
// ============================================
async function displayConfirmation(reservation) {
    console.log("🎟️ Affichage de la confirmation pour:", reservation);

    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // --- 2. Cibles DOM ---
    const outboundSection = document.getElementById('outbound-ticket-section');
    const returnSection = document.getElementById('return-ticket-section');
    const actionsContainer = document.getElementById('confirmation-actions-container');
    const confirmationTitle = document.querySelector('#confirmation-page .confirmation-title');
    const confirmationSubtitle = document.querySelector('#confirmation-page .confirmation-subtitle');
    const bookingNumberDisplay = document.getElementById('booking-number-display');
    const statusBadge = document.querySelector('#confirmation-page .status-badge span:last-child'); // Cible le texte
    const bookingBadgeLabel = document.querySelector('#confirmation-page .booking-badge .badge-label');
    const infoArriveEarlyTitle = document.querySelector('[data-i18n-key="info_arrive_early_title"] h4'); // Cible précise
    const infoArriveEarlyDesc = document.querySelector('[data-i18n-key="info_arrive_early_desc"] p');
    const infoBaggageTitle = document.querySelector('[data-i18n-key="info_baggage_title"] h4');
    const infoBaggageDesc = document.querySelector('[data-i18n-key="info_baggage_desc"] p');
    const helpText = document.querySelector('.confirmation-footer p');

    // --- 3. Nettoyage initial ---
    outboundSection.innerHTML = `<div class="loading-spinner">${translation.loading_ticket || 'Chargement...'}</div>`;
    returnSection.innerHTML = '';
    returnSection.style.display = 'none';
    actionsContainer.innerHTML = '';
    document.querySelectorAll('.info-card-warning.payment-notice').forEach(el => el.remove());

    // --- 4. Traduction des éléments statiques ---
    bookingNumberDisplay.textContent = reservation.bookingNumber;
    if (bookingBadgeLabel) bookingBadgeLabel.textContent = translation.confirmation_booking_number_label;
    if (infoArriveEarlyTitle) infoArriveEarlyTitle.textContent = translation.info_arrive_early_title;
    if (infoArriveEarlyDesc) infoArriveEarlyDesc.innerHTML = translation.info_arrive_early_desc;
    if (infoBaggageTitle) infoBaggageTitle.textContent = translation.info_baggage_title;
    if (infoBaggageDesc) infoBaggageDesc.innerHTML = translation.info_baggage_desc;
    if (helpText) helpText.textContent = translation.confirmation_help;

    // --- 5. Logique par statut ---
    if (reservation.status === 'En attente de paiement') {
        confirmationTitle.textContent = translation.confirmation_title_pending || "Finalisez votre paiement";
        confirmationSubtitle.textContent = translation.confirmation_subtitle_pending || "Réservation en attente";
        if (statusBadge) statusBadge.textContent = translation.status_pending;
        outboundSection.innerHTML = ''; 
        // ... (votre logique pour afficher les instructions de paiement est correcte)
        return;
    }

    confirmationTitle.textContent = translation.confirmation_page_title;
    confirmationSubtitle.textContent = translation.confirmation_page_subtitle;
    if (statusBadge) statusBadge.textContent = translation.confirmation_status_confirmed;

    const createTicketHTML = async (tripData, isReturn = false) => {
        const qrDataString = Utils.generateQRCodeData(reservation, isReturn);
        const qrCodeBase64 = await Utils.generateQRCodeBase64(qrDataString, 150).catch(err => '');
        const tripTypeLabel = isReturn ? translation.confirmation_ticket_return : translation.confirmation_ticket_outbound;
        const busId = isReturn ? reservation.returnBusIdentifier : reservation.busIdentifier;
        const route = tripData.route;
        const lang = getLanguage();

   
        // ===================================
        // ✅ HTML COMPLET RÉINTÉGRÉ
        // ===================================
        return `
            <h2 style="font-family: var(--font-logo); color: var(--color-accent-glow); margin-bottom: 20px; text-align: center; font-size: 1.5rem;">
                ${tripTypeLabel}
            </h2>
            <div class="journey-card">

                    <div class="journey-card" style="position: relative;">
                <!-- ✅ DATE DÉPLACÉE ICI -->
                <div class="journey-date-top" data-i18n="details_label_date">
                    ${Utils.formatDate(tripData.date, lang)}
                </div>
                <div class="journey-route">
                    <div class="route-point route-origin">
                        <div class="point-icon">📍</div>
                        <div class="point-info">
                            <span class="point-label">${translation.details_label_departure}</span>
                            <span class="point-city">${route.from}</span>
                            <span class="point-time">${route.departure}</span>
                        </div>
                    </div>
                    <div class="route-connector">
                        <div class="connector-line"></div>
                        <div class="connector-icon">🚌</div>
                        <div class="connector-duration">${route.duration || 'N/A'}</div>
                    </div>
                    <div class="route-point route-destination">
                        <div class="point-icon">🏁</div>
                        <div class="point-info">
                            <span class="point-label">${translation.details_label_arrival}</span>

                            <span class="point-city">${route.to}</span>
                            <span class="point-time">${route.arrival}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="details-grid-modern">
                <div class="detail-item-modern"><div class="detail-label">${translation.details_label_passengers}</div><div class="detail-value">${reservation.passengers.map(p => p.name).join(', ')}</div></div>
                <div class="detail-item-modern"><div class="detail-label">${translation.details_label_seats}</div><div class="detail-value">${tripData.seats.join(', ')}</div></div>
                <div class="detail-item-modern"><div class="detail-label">${translation.details_label_company}</div><div class="detail-value">${route.company}</div></div>
                <div class="detail-item-modern"><div class="detail-label">${translation.details_label_bus_no}</div><div class="detail-value">${busId || 'N/A'}</div></div>
            </div>
            <div class="qr-section-modern">
                <div class="qr-container">
                    <div class="qr-code-box">
                        <img src="${qrCodeBase64}" alt="QR Code">
                    </div>
                    <div class="qr-info">
                        <p class="qr-title">${translation.qr_code_title}</p>
                        <p class="qr-instruction">${translation.qr_code_instruction}</p>
                    </div>
                </div>
            </div>
        `;
    };


    try {
        outboundSection.innerHTML = await createTicketHTML({ route: reservation.route, date: reservation.date, seats: reservation.seats }, false);
        if (reservation.returnRoute) {
            returnSection.style.display = 'block';
            returnSection.innerHTML = await createTicketHTML({ route: reservation.returnRoute, date: reservation.returnDate, seats: reservation.returnSeats }, true);
        }

        let actionsHTML = `<button class="btn-modern btn-download" onclick="downloadTicket(false)"><span class="btn-icon">📥</span><span class="btn-text">${translation.button_download_outbound}</span></button>`;

         // ✅ AJOUTER LE BOUTON FACTURE ICI
        actionsHTML += `<button class="btn-modern btn-invoice" onclick="downloadInvoice('${reservation.bookingNumber}')"><span class="btn-icon">📄</span><span class="btn-text">Télécharger la Facture</span></button>`;
        if (reservation.busIdentifier) {
            actionsHTML += `<a class="btn-modern btn-track" href="Suivi/suivi.html?bus=${reservation.busIdentifier}&booking=${reservation.bookingNumber}" target="_blank"><span class="btn-icon">🛰️</span><span class="btn-text">${translation.button_track_outbound}</span></a>`;
        }
        if (reservation.returnRoute) {
            actionsHTML += `<button class="btn-modern btn-download" onclick="downloadTicket(true)"><span class="btn-icon">📥</span><span class="btn-text">${translation.button_download_return}</span></button>`;
            if (reservation.returnBusIdentifier) {
                actionsHTML += `<a class="btn-modern btn-track" href="Suivi/suivi.html?bus=${reservation.returnBusIdentifier}&booking=${reservation.bookingNumber}" target="_blank"><span class="btn-icon">🛰️</span><span class="btn-text">${translation.button_track_return}</span></a>`;
            }
        }
        actionsHTML += `<button class="btn-modern btn-home" onclick="resetAndGoHome()"><span class="btn-icon">🏠</span><span class="btn-text">${translation.button_new_booking_alt}</span></button>`;
        
        actionsContainer.innerHTML = actionsHTML;
    } catch (err) {
        console.error("❌ Erreur affichage confirmation:", err);
        Utils.showToast("Erreur d'affichage.", 'error');
    }
}
async function displayReservations() {
    const listContainer = document.getElementById("reservations-list");
    if (!listContainer) return;

    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    listContainer.innerHTML = `<div class="loading-spinner">${translation.loading_bookings || 'Chargement...'}</div>`;

    const pageTitle = document.querySelector("#reservations-page .page-header h2");
    if (pageTitle) {
        pageTitle.textContent = translation.my_bookings_title;
    }

    let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
    if (history.length === 0) {
        listContainer.innerHTML = `
            <div class="no-results" style="padding: 48px; text-align: center;">
                <h3>${translation.my_bookings_none_title}</h3>
                <p>${translation.my_bookings_none_desc}</p>
                <button class="btn btn-primary" onclick="showPage('home')">${translation.button_new_booking}</button>
            </div>`;
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/details?ids=${history.join(',')}`);
        const data = await response.json();
        if (!data.success || !data.reservations) throw new Error("Données invalides");

        let historyChanged = false;
        const currentHistory = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        data.reservations.forEach(r => {
            if (r.replacementBookingNumber && !currentHistory.includes(r.replacementBookingNumber)) {
                currentHistory.push(r.replacementBookingNumber);
                historyChanged = true;
            }
        });
        if (historyChanged) {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(currentHistory));
            return displayReservations();
        }

        listContainer.innerHTML = data.reservations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(res => {
                const isConfirmed = res.status === 'Confirmé';
                const isPending = res.status === 'En attente de paiement';
                const isReportPending = res.status === 'En attente de report';
                const isReported = res.status === 'Reporté';
                const isCancelled = res.status === 'Annulé' || res.status === 'Expiré';
                
                let statusHTML = '';
                if (isConfirmed) statusHTML = `<span style="color: #73d700;">${translation.status_confirmed}</span>`;
                else if (isPending) statusHTML = `<span style="color: #ff9800;">${translation.status_pending}</span>`;
                else if (isReportPending) statusHTML = `<span style="color: #2196f3;">${translation.status_report_pending}</span>`;
                else if (isReported) statusHTML = `<span style="color: #9e9e9e; text-decoration: line-through;">${translation.status_reported}</span>`;
                else if (isCancelled) statusHTML = `<span style="color: #f44336;">${translation.status_cancelled(res.status)}</span>`;

                let actionsButtons = '';
                const trackerIdentifier = res.busIdentifier || res.route?.trackerId;
                if (isConfirmed) {
                    actionsButtons = `<button class="btn btn-primary" onclick="viewTicket('${res.bookingNumber}')">${translation.button_view_ticket}</button>`;
                    if (trackerIdentifier) actionsButtons += ` <a href="Suivi/suivi.html?bus=${trackerIdentifier}&booking=${res.bookingNumber}" class="btn btn-secondary">${translation.button_track || 'Suivre'}</a>`;
                    const reportCount = res.reportCount || 0;
                    if (!res.returnRoute && reportCount < 2) {
                        actionsButtons += ` <button class="btn btn-secondary" onclick="initiateReport('${res.bookingNumber}')" style="background-color: #ff9800;">${translation.button_report}</button>`;
                    }
                } else if (isPending) {
                    actionsButtons = `<button class="btn btn-secondary" onclick="viewPaymentInstructions('${res.bookingNumber}')">${translation.button_pay}</button>`;
                } else if (isReportPending) {
                    actionsButtons = `<div style="text-align: center; color: #2196f3;">${translation.info_report_pending}</div>`;
                } else if (isReported) {
                    const newBookingNum = res.replacementBookingNumber;
                    actionsButtons = `<div style="text-align: center; color: #9e9e9e;">${translation.info_replaced_by} <strong style="color: white; cursor: pointer;" onclick="viewTicket('${newBookingNum}')">${newBookingNum || '...'}</strong></div>`;
                } else {
                    actionsButtons = `<button class="btn btn-primary" onclick="showPage('home')">${translation.button_new_booking}</button>`;
                }

                let deleteButton = '';
                if (!isPending && !isReportPending) {
                     deleteButton = `<button class="btn-delete-local" onclick="removeBookingFromLocalHistory('${res.bookingNumber}')" title="${translation.button_delete_title || 'Masquer'}">🗑️</button>`;
                }
                
                const formattedDate = Utils.formatDate(res.date, lang);
                const dateTimeString = (typeof translation.date_at_time === 'function')
                    ? translation.date_at_time(formattedDate, res.route.departure)
                    : `${formattedDate} à ${res.route.departure}`;

                // --- Génération de la ligne de statut ---
                let liveStatusHTML = '';
                if (res.liveStatus && res.status === 'Confirmé') {
                    const statusClass = res.liveStatus.status.toLowerCase().replace(/_/g, '-');
                    const icon = getLiveStatusIcon(res.liveStatus.status);
                    const text = getLiveStatusText(res.liveStatus, translation);
                    liveStatusHTML = `
                        <div class="trip-status-line ${statusClass}">
                            ${icon}
                            <span>${text}</span>
                        </div>
                    `;
                }

                return `
                    <div class="reservation-card-pwa" style="${isReported ? 'opacity: 0.6;' : ''}">
                        <div class="res-pwa-header">
                            <span class="res-pwa-booking-number">${res.bookingNumber}</span>
                            ${deleteButton}
                            <span class="res-pwa-status">${statusHTML}</span>
                        </div>
                        <div class="res-pwa-body">
                            <h4>${res.route.from} → ${res.route.to}</h4>
                            <p>${dateTimeString}</p>
                            ${liveStatusHTML}
                            <p style="margin-top: ${liveStatusHTML ? '12px' : '0'};">${translation.passenger_count(res.passengers.length)} - Total: ${res.totalPrice}</p>
                        </div>
                        <div class="res-pwa-actions">${actionsButtons}</div>
                    </div>
                `;
            }).join('');

    } catch (error) {
        console.error("Erreur affichage réservations:", error);
        listContainer.innerHTML = `<div class="no-results error"><h3>Erreur de chargement.</h3></div>`;
    }
}




// Action pour télécharger la facture
function downloadInvoice(bookingNumber) {
    const lang = getLanguage();
    const url = `${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/invoice?lang=${lang}`;
    window.open(url, '_blank');
}

// Ajoute un écouteur pour fermer les menus en cliquant n'importe où
window.addEventListener('click', () => {

});
// DANS app.js, AJOUTEZ CES DEUX FONCTIONS

async function viewTicket(bookingNumber) {


    // ✅ TRADUCTION
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    Utils.showToast(translation.loading_ticket || "Chargement du billet...", "info");
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}`);
        const data = await response.json();
        if (data.success && data.reservation) {
            appState.currentReservation = data.reservation;
            displayConfirmation(data.reservation);
            showPage('confirmation');
        } else {
            throw new Error(data.error || "Impossible de récupérer les détails du billet.");
        }
    } catch(err) {
        Utils.showToast(err.message, "error");
    }
}

async function viewPaymentInstructions(bookingNumber) {
    Utils.showToast("Chargement des instructions...", "info");
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}`);
        const data = await response.json();
        if (data.success && data.reservation) {
            appState.currentReservation = data.reservation;
            displayPaymentInstructions(data.reservation); // Affiche la page des instructions
        } else {
            throw new Error(data.error || "Impossible de récupérer les instructions.");
        }
    } catch(err) {
        Utils.showToast(err.message, "error");
    }
}





// ============================================
// 🔄 FONCTIONNALITÉ DE REPORT DE VOYAGE
// ============================================

window.initiateReport = async function(bookingNumber) {
    console.log('🔄 Initiation du report pour:', bookingNumber);
    
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    try {
        // --- 2. Vérifier si le report est autorisé ---
        Utils.showToast(translation.toast_checking_conditions, 'info');
        
        const canReportResponse = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/can-report`);
        const canReportData = await canReportResponse.json();
        
        if (!canReportData.success || !canReportData.canReport) {
            const reasons = canReportData.reasons?.join('\n') || translation.error_report_not_allowed;
            Utils.showToast(reasons, 'error');
            return;
        }
        
        console.log('✅ Report autorisé. Nombre de reports:', canReportData.currentReportCount);
        
        // --- 3. Récupérer les voyages disponibles ---
        Utils.showToast(translation.toast_searching_available_trips, 'info');
        
        const tripsResponse = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/available-trips`);
        const tripsData = await tripsResponse.json();
        
        if (!tripsData.success || tripsData.count === 0) {
            Utils.showToast(translation.info_no_trips_found_report, 'warning');
            return;
        }
        
        console.log(`✅ ${tripsData.count} voyage(s) disponible(s)`);
        
        // --- 4. Afficher la modale ---
        displayReportModal(bookingNumber, tripsData.currentTrip, tripsData.availableTrips, canReportData.currentReportCount);
        
    } catch (error) {
        console.error('❌ Erreur initiation report:', error);
        Utils.showToast(error.message || translation.error_generic, 'error');
    }
};

// ============================================
// 📋 AFFICHAGE DE LA MODALE DE REPORT
// ============================================

function displayReportModal(bookingNumber, currentTrip, availableTrips, reportCount) {
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    const modalTitle = document.getElementById('report-modal-title');
    const modalBody = document.getElementById('report-modal-body');
    if (modalTitle) modalTitle.textContent = translation.report_modal_title;

    // --- 2. Construction du HTML avec les traductions ---
    let html = `
        <div class="report-current-trip">
            <h3>${translation.report_current_trip_title}</h3>
            <div class="report-trip-info">
                <div class="info-row">
                    <span class="info-label">${translation.report_label_date}</span>
                    <span class="info-value">${Utils.formatDate(currentTrip.date, lang)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">${translation.report_label_price_paid}</span>
                    <span class="info-value">${Utils.formatPrice(currentTrip.price)} FCFA</span>
                </div>
            </div>
        </div>
        
        <div class="report-warning">
            ${reportCount === 0 
                ? translation.report_first_free 
                : (typeof translation.report_fee_applies === 'function' ? translation.report_fee_applies(reportCount + 1) : '')
            }
        </div>
        
        <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--color-accent-glow);">
            ${translation.report_select_new_date}
        </h3>
        
        <div class="report-trips-list">
    `;
    
    availableTrips.forEach(trip => {
        const availabilityClass = trip.availableSeats < 10 ? 'low' : '';
        const priceDiff = trip.route.price - currentTrip.price;
        let priceDiffHTML = '', priceDiffClass = 'neutral';
        
        if (priceDiff > 0) {
            priceDiffHTML = translation.report_price_diff_positive(Utils.formatPrice(priceDiff));
            priceDiffClass = 'positive';
        } else if (priceDiff < 0) {
            priceDiffHTML = translation.report_price_diff_negative(Utils.formatPrice(Math.abs(priceDiff)));
            priceDiffClass = 'negative';
        } else {
            priceDiffHTML = translation.report_price_diff_neutral;
        }
        
        html += `
            <div class="report-trip-card" onclick="selectReportTrip('${trip.id}', '${bookingNumber}', ${reportCount})">
                <div class="report-trip-header">
                    <div class="report-trip-date">📅 ${Utils.formatDate(trip.date, lang)}</div>
                    <div class="report-trip-availability ${availabilityClass}">${translation.report_seats_left(trip.availableSeats)}</div>
                </div>
                <div class="report-trip-details">
                    <div>🚌 ${trip.route.company}</div>
                    <div>🕐 ${trip.route.departure} → ${trip.route.arrival}</div>
                    <div>💰 ${Utils.formatPrice(trip.route.price)} FCFA</div>
                </div>
                <div class="report-price-difference ${priceDiffClass}">${priceDiffHTML}</div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="report-actions">
            <button class="btn btn-secondary" onclick="closeReportModal()">${translation.button_cancel}</button>
        </div>
    `;
    
    modalBody.innerHTML = html;
    document.getElementById('report-modal').classList.add('active');
}
// ============================================
// ✅ SÉLECTION D'UN VOYAGE POUR LE REPORT
// ============================================
window.selectReportTrip = async function(tripId, bookingNumber, currentReportCount) {
    console.log('🎯 Voyage sélectionné:', tripId);
    
    // --- Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    document.querySelectorAll('.report-trip-card').forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    try {
        // ✅ TOAST TRADUIT
        Utils.showToast(translation.toast_report_calculating_cost, 'info');
        
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/calculate-report-cost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newTripId: tripId })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || translation.error_generic);
        
        displayReportSummary(bookingNumber, tripId, data.calculation, currentReportCount);
        
    } catch (error) {
        console.error('❌ Erreur calcul coût:', error);
        Utils.showToast(error.message, 'error');
    }
};

// ============================================
// 📊 AFFICHAGE DU RÉCAPITULATIF DU REPORT
// ============================================

// ============================================
// 📊 AFFICHAGE DU RÉCAPITULATIF DU REPORT (AVEC PAIEMENT)
// ============================================
function displayReportSummary(bookingNumber, tripId, calculation, reportCount) {
    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const modalBody = document.getElementById('report-modal-body');

    // --- 2. Construction de la section de paiement (si nécessaire) ---
    let paymentSectionHTML = '';
    if (calculation.isPaymentRequired) {
        paymentSectionHTML = `
            <div class="report-payment-section" style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--color-border);">
                <h4 style="color: var(--color-text-primary); margin-bottom: 10px;">${translation.report_summary_payment_title}</h4>
                <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 15px;">
                    ${translation.report_summary_amount_to_pay(Utils.formatPrice(calculation.totalCost))}
                </p>
                <div class="payment-methods" style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="report-payment-method" value="MTN" checked onclick="toggleReportAgencyInfo(false)"> 
                        <span>📱 MTN Mobile Money</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="report-payment-method" value="AIRTEL" onclick="toggleReportAgencyInfo(false)"> 
                        <span>📱 Airtel Money</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="radio" name="report-payment-method" value="AGENCY" onclick="toggleReportAgencyInfo(true)"> 
                        <span>🏢 ${translation.payment_agency_name}</span>
                    </label>
                </div>
                <div id="report-transaction-input">
                    <div class="form-group">
                        <label for="report-transaction-id" style="display:block; margin-bottom: 5px; font-weight: 600;">${translation.transaction_id_label}</label>
                        <input type="text" id="report-transaction-id" class="form-control" placeholder="${translation.transaction_id_placeholder}" style="width: 100%; padding: 10px; border-radius: 8px;">
                        <small style="color: var(--color-text-secondary); font-size: 0.8rem;">${translation.report_summary_payment_info(CONFIG.MTN_MERCHANT_NUMBER)}</small>
                    </div>
                </div>
                <div id="report-agency-info" style="display: none; background: rgba(255, 152, 0, 0.1); padding: 15px; border-radius: 8px;">
                    <p style="color: #ff9800; font-size: 0.9rem; margin: 0;">
                        <strong>${translation.payment_agency_important_title}</strong><br>
                        ${translation.payment_agency_info_report}
                    </p>
                </div>
            </div>
        `;
    }

    // --- 3. Construction du récapitulatif ---
    let summaryHTML = `
        <div class="report-summary">
            <h3>${translation.report_summary_title}</h3>
            <div class="report-summary-line">
                <span>${translation.report_summary_current_price}</span>
                <strong>${Utils.formatPrice(calculation.currentPrice)} FCFA</strong>
            </div>
            <div class="report-summary-line">
                <span>${translation.report_summary_new_price}</span>
                <strong>${Utils.formatPrice(calculation.newPrice)} FCFA</strong>
            </div>
            <div class="report-summary-line">
                <span>${translation.report_summary_price_diff}</span>
                <strong style="color: ${calculation.priceDifference >= 0 ? '#ff9800' : '#73d700'}">${calculation.priceDifference >= 0 ? '+' : ''}${Utils.formatPrice(calculation.priceDifference)} FCFA</strong>
            </div>
            <div class="report-summary-line">
                <span>${translation.report_summary_fee(reportCount + 1)}</span>
                <strong>${calculation.reportFee === 0 ? translation.report_summary_fee_free : Utils.formatPrice(calculation.reportFee) + ' FCFA'}</strong>
            </div>
            <div class="report-summary-line total">
                <span>${calculation.isPaymentRequired ? translation.report_summary_total_to_pay : translation.report_summary_credit_generated}</span>
                <strong>${Utils.formatPrice(Math.abs(calculation.totalCost))} FCFA</strong>
            </div>
            ${paymentSectionHTML}
            ${calculation.isCreditGenerated ? `<div class="report-warning" style="margin-top: 1rem; background: rgba(115, 215, 0, 0.1); border-color: #73d700; color: #73d700;">${translation.info_credit_generated(Utils.formatPrice(calculation.creditAmount))}</div>` : ''}
        </div>
        <div class="report-actions">
            <button class="btn btn-secondary" onclick="closeReportModal()">${translation.button_cancel}</button>
            <button class="btn btn-primary" onclick="confirmReport('${bookingNumber}', '${tripId}', ${calculation.isPaymentRequired}, ${calculation.totalCost})">
                ${calculation.isPaymentRequired ? translation.report_summary_submit_button : translation.button_confirm_report}
            </button>
        </div>
    `;
    
    // --- 4. Injection du HTML ---
    const existingSummary = modalBody.querySelector('.report-summary');
    if (existingSummary) existingSummary.remove();
    const existingActions = modalBody.querySelector('.report-actions');
    if (existingActions) existingActions.remove();
    modalBody.insertAdjacentHTML('beforeend', summaryHTML);
}


// Helper pour afficher/masquer les infos selon le mode de paiement
window.toggleReportAgencyInfo = function(showAgency) {
    const txInput = document.getElementById('report-transaction-input');
    const agencyInfo = document.getElementById('report-agency-info');
    
    if (txInput && agencyInfo) {
        txInput.style.display = showAgency ? 'none' : 'block';
        agencyInfo.style.display = showAgency ? 'block' : 'none';
    }
};
// ============================================
// ✅ CONFIRMATION DU REPORT (VERSION FINALE)
// ============================================

window.confirmReport = async function(bookingNumber, tripId, isPaymentRequired, totalCost) {
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    
    let transactionId = null;
    let paymentMethod = 'MTN';

    if (isPaymentRequired) {
        const methodInput = document.querySelector('input[name="report-payment-method"]:checked');
        paymentMethod = methodInput ? methodInput.value : 'MTN';

        if (paymentMethod === 'AGENCY') {
            transactionId = null; // Pas d'ID pour l'agence
        } else {
            const txInput = document.getElementById('report-transaction-id');
            if (!txInput || txInput.value.trim() === "") {
                Utils.showToast(translation.toast_enter_transaction_id, "warning");
                return;
            }
            transactionId = txInput.value.trim();
        }
    }
    
    Utils.showToast(translation.toast_report_confirming, 'info');
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/confirm-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newTripId: tripId, paymentMethod: paymentMethod, transactionId: transactionId })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || translation.error_generic);
        
        closeReportModal();

        if (data.requiresPayment) {
            let message = '';
            if (paymentMethod === 'AGENCY') {
                message = translation.confirm_request_sent_agency_desc(Utils.formatPrice(data.paymentAmount));
            } else {
                message = translation.confirm_request_sent_mm_desc(transactionId);
            }
            
            await showCustomConfirm({
                title: translation.confirm_request_sent_title,
                message: message,
                icon: '✅',
                confirmText: translation.confirm_request_ok_button,
                cancelText: ''
            });
        } else {
            Utils.showToast(translation.toast_report_confirmed, 'success');
            if (data.newBookingNumber) addBookingToLocalHistory(data.newBookingNumber);
        }
        
        displayReservations();
        
    } catch (error) {
        console.error('❌ Erreur confirmation report:', error);
        Utils.showToast(error.message, 'error');
    }
};

// ============================================
// 🚪 FERMETURE DE LA MODALE
// ============================================

window.closeReportModal = function() {
    document.getElementById('report-modal').classList.remove('active');
};



// DANS app.js, AJOUTEZ CETTE FONCTION

function addBookingToLocalHistory(bookingNumber) {
    try {
        let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        if (!history.includes(bookingNumber)) {
            history.unshift(bookingNumber); 
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(history));
            console.log(`💾 Réservation ${bookingNumber} ajoutée à l'historique local.`);
        }
    } catch (e) {
        console.error("Erreur lors de la sauvegarde de l'historique local:", e);
    }
}


window.addEventListener("DOMContentLoaded", initApp);





// ============================================
// 🧹 RÉINITIALISATION DE L'ÉTAT DE RÉSERVATION
// ============================================
function resetBookingState() {
    appState.selectedBus = null;
    appState.selectedReturnBus = null;
    appState.isSelectingReturn = false;
    appState.selectedSeats = [];
    appState.selectedReturnSeats = [];
    appState.occupiedSeats = [];
    appState.occupiedReturnSeats = [];
    appState.passengerInfo = [];
    appState.baggageCounts = {};
    appState.currentReservation = null;
    
    console.log('✅ État de réservation réinitialisé');
}

window.resetAndGoHome = function() {
    resetBookingState();
    showPage('home');
}



// Dans app.js - Version améliorée avec numéro de réservation

