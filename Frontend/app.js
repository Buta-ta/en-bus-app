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
    SEAT_TOTAL: 61, // ✅ 14 rangées × 4 + 5 arrière
    OCCUPANCY_RATE: { min: 0.3, max: 0.5 },
    STORAGE_KEY: 'enbus_reservations',
    AGENCY_PAYMENT_MIN_HOURS: 1,
    AGENCY_PAYMENT_DEADLINE_HOURS: 10,
    
    // ✅ Configuration Scanner
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

const cities = [
    { name: "Brazzaville", country: "Congo" },
    { name: "Pointe-Noire", country: "Congo" },
    { name: "Dolisie", country: "Congo" },
    { name: "Nkayi", country: "Congo" },
    { name: "Ouesso", country: "Congo" },
    { name: "Owando", country: "Congo" },
    { name: "Impfondo", country: "Congo" },
    { name: "Madingou", country: "Congo" },
    { name: "Loudima", country: "Congo" },
    { name: "Mindouli", country: "Congo" },
    { name: "Djambala", country: "Congo" },
    { name: "Gamboma", country: "Congo" },
    { name: "Makoua", country: "Congo" },
    { name: "Oyo", country: "Congo" },
    { name: "Pokola", country: "Congo" },
    { name: "Bétou", country: "Congo" },
    { name: "Yaoundé", country: "Cameroun" },
    { name: "Douala", country: "Cameroun" },
    { name: "Bafoussam", country: "Cameroun" },
    { name: "Bamenda", country: "Cameroun" },
    { name: "Garoua", country: "Cameroun" },
    { name: "Libreville", country: "Gabon" },
    { name: "Port-Gentil", country: "Gabon" },
    { name: "Franceville", country: "Gabon" },
    { name: "Lagos", country: "Nigeria" },
    { name: "Abuja", country: "Nigeria" },
    { name: "Port Harcourt", country: "Nigeria" },
    { name: "Cotonou", country: "Bénin" },
    { name: "Porto-Novo", country: "Bénin" },
    { name: "Parakou", country: "Bénin" },
    { name: "Lomé", country: "Togo" },
    { name: "Accra", country: "Ghana" },
    { name: "Kumasi", country: "Ghana" },
    { name: "Abidjan", country: "Côte d'Ivoire" },
    { name: "Yamoussoukro", country: "Côte d'Ivoire" },
    { name: "Ouagadougou", country: "Burkina Faso" },
    { name: "Bobo-Dioulasso", country: "Burkina Faso" },
    { name: "Kinshasa", country: "RDC" }
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

const routes = [
    { 
        id: 1, 
        from: "Brazzaville", 
        to: "Pointe-Noire", 
        company: "Océan du Nord", 
        price: 15000, 
        duration: "8h 30m", 
        departure: "06:00", 
        arrival: "14:30", 
        amenities: ["clim", "prise"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "B1" 
    },
    { 
        id: 2, 
        from: "Brazzaville", 
        to: "Pointe-Noire", 
        company: "Trans Bony", 
        price: 13500, 
        duration: "9h 00m", 
        departure: "07:00", 
        arrival: "16:00", 
        amenities: ["clim"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "B2" 
    },
    { 
        id: 3, 
        from: "Brazzaville", 
        to: "Pointe-Noire", 
        company: "Stellimac", 
        price: 14000, 
        duration: "8h 45m", 
        departure: "05:30", 
        arrival: "14:15", 
        amenities: ["clim", "prise"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "B3" 
    },
    { 
        id: 4, 
        from: "Pointe-Noire", 
        to: "Brazzaville", 
        company: "Océan du Nord", 
        price: 15000, 
        duration: "8h 30m", 
        departure: "06:30", 
        arrival: "15:00", 
        amenities: ["clim", "prise"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "P1" 
    },
    { 
        id: 5, 
        from: "Pointe-Noire", 
        to: "Brazzaville", 
        company: "Trans Bony", 
        price: 13500, 
        duration: "9h 00m", 
        departure: "07:30", 
        arrival: "16:30", 
        amenities: ["clim"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "P2" 
    },
    { 
        id: 6, 
        from: "Brazzaville", 
        to: "Dolisie", 
        company: "Stellimac", 
        price: 10000, 
        duration: "6h 00m", 
        departure: "08:00", 
        arrival: "14:00", 
        amenities: ["clim"], 
        tripType: "stops", 
        stops: [
            { city: "Mindouli", arrivalTime: "09:30", departureTime: "09:45", duration: "15min" },
            { city: "Nkayi", arrivalTime: "11:30", departureTime: "11:50", duration: "20min" }
        ], 
        connections: [],
        breaks: 2, 
        trackerId: "D1" 
    },
    { 
        id: 7, 
        from: "Brazzaville", 
        to: "Nkayi", 
        company: "Océan du Nord", 
        price: 7000, 
        duration: "4h 00m", 
        departure: "09:00", 
        arrival: "13:00", 
        amenities: ["clim"], 
        tripType: "stops", 
        stops: [
            { city: "Mindouli", arrivalTime: "10:15", departureTime: "10:30", duration: "15min" }
        ], 
        connections: [],
        breaks: 1, 
        trackerId: "N1" 
    },
    { 
        id: 8, 
        from: "Brazzaville", 
        to: "Ouesso", 
        company: "Océan du Nord", 
        price: 25000, 
        duration: "16h 00m", 
        departure: "05:00", 
        arrival: "21:00", 
        amenities: ["clim", "wc"], 
        tripType: "stops", 
        stops: [
            { city: "Owando", arrivalTime: "11:00", departureTime: "12:00", duration: "1h" },
            { city: "Makoua", arrivalTime: "16:30", departureTime: "17:00", duration: "30min" }
        ], 
        connections: [],
        breaks: 3, 
        trackerId: "O1" 
    },
    { 
        id: 27, 
        from: "Douala", 
        to: "Yaoundé", 
        company: "Touristique Express", 
        price: 3500, 
        duration: "3h 00m", 
        departure: "06:00", 
        arrival: "09:00", 
        amenities: ["clim", "wifi"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "Y1" 
    },
    { 
        id: 28, 
        from: "Yaoundé", 
        to: "Douala", 
        company: "Garantie Express", 
        price: 3500, 
        duration: "3h 00m", 
        departure: "14:00", 
        arrival: "17:00", 
        amenities: ["clim", "prise"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "Y2" 
    },
    { 
        id: 31, 
        from: "Lagos", 
        to: "Abuja", 
        company: "ABC Transport", 
        price: 8000, 
        duration: "8h 00m", 
        departure: "06:00", 
        arrival: "14:00", 
        amenities: ["clim", "wifi", "wc"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "L1" 
    },
    {
        id: 32,
        from: "Brazzaville",
        to: "Libreville",
        company: "United Express",
        price: 35000,
        duration: "18h 30m",
        departure: "06:00",
        arrival: "00:30",
        amenities: ["clim", "wc", "wifi"],
        tripType: "connections",
        stops: [
            { city: "Dolisie", arrivalTime: "12:00", departureTime: "12:30", duration: "30min" }
        ],
        connections: [
            { 
                at: "Pointe-Noire", 
                arrivalTime: "14:30", 
                waitTime: "2h 30min",
                nextDeparture: "17:00",
                nextCompany: "Océan du Nord",
                reason: "Correspondance maritime + route"
            }
        ],
        breaks: 2,
        trackerId: "BL1"
    },
    { 
        id: 35, 
        from: "Accra", 
        to: "Kumasi", 
        company: "STC", 
        price: 4500, 
        duration: "4h 30m", 
        departure: "06:00", 
        arrival: "10:30", 
        amenities: ["clim", "wifi", "wc"], 
        tripType: "direct", 
        stops: [], 
        connections: [],
        trackerId: "A1" 
    },
];

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
    allReservations: [],
    departurePicker: null,
    passengerCounts: { adults: 1, children: 0 },
    baggageCounts: {},
    currentResults: [],
    filters: {
        company: 'all',
        amenities: [],
        tripType: 'all',
        priceRange: { min: 0, max: 100000 },
        departureTime: 'all'
    },
    sortBy: 'departure',
    currentReservation: null
};

// ============================================
// ÉTAT DES FILTRES
// ============================================
let activeFilters = {
    company: 'all',
    tripType: 'all',
    priceRange: { min: 0, max: 100000 },
    departureTime: 'all',
    amenities: [],
    sortBy: 'departure'
};

// ============================================
// UTILITAIRES
// ============================================
const Utils = {
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
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

    // ✅ QR Code simplifié : BOOKING_NUMBER|PASSENGER_NAME
     generateQRCodeData(reservation) {
        // Format ultra-compact
        const qrData = {
            v: "2.0",                           // Version
            b: reservation.bookingNumber,        // Booking number
            p: reservation.passengers.length,    // Nombre de passagers
            d: reservation.date,                 // Date du voyage
            s: reservation.status === 'Confirmé' ? 'C' : 'P', // C = Confirmé, P = Pending
            c: reservation.createdAt            // Date de création
        };

        return JSON.stringify(qrData);
    },

        // ✅ DECODER le QR Code (pour tests et vérification)
    // ============================================
// ✅ DÉCODAGE QR CODE SIMPLIFIÉ
// ============================================
// ✅ DÉCODAGE QR CODE (pour tests)
    decodeQRCodeData(qrString) {
        try {
            const data = JSON.parse(qrString);
            
            if (data.v === "2.0") {
                // Format simplifié
                return {
                    valid: true,
                    version: "2.0",
                    bookingNumber: data.b,
                    passengersCount: data.p,
                    date: data.d,
                    status: data.s === 'C' ? 'Confirmé' : 'En attente de paiement',
                    createdAt: data.c
                };
            } else if (data.v === "1.0") {
                // Format complet (rétrocompatibilité)
                return {
                    valid: true,
                    version: "1.0",
                    data: data
                };
            } else {
                throw new Error('Version QR Code non supportée');
            }
            
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    },

  

    async generateQRCodeBase64(text, size = 200) {
        return new Promise((resolve, reject) => {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.display = 'none';
                document.body.appendChild(tempDiv);
                
                const qrcode = new QRCode(tempDiv, {
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
                        reject(new Error('Canvas not found'));
                    }
                }, 100);
                
            } catch (error) {
                reject(error);
            }
        });
    }
};

// ============================================
// FONCTIONS PAIEMENT AGENCE
// ============================================

// Dans app.js
// Dans app.js
// Dans app.js
// Dans app.js
function canPayAtAgency() {
    if (!appState.currentSearch?.date || !appState.selectedBus?.departure) {
        console.warn("⚠️ Données manquantes pour canPayAtAgency.");
        return false;
    }
    
    // Construit une chaîne de date ISO 8601, la méthode la plus fiable
    const departureDateTimeString = `${appState.currentSearch.date}T${appState.selectedBus.departure}:00`;
    const departureDateTime = new Date(departureDateTimeString);

    if (isNaN(departureDateTime.getTime())) {
        console.error("❌ Date de départ invalide construite:", departureDateTimeString);
        return false;
    }
    
    const now = new Date();
    const hoursUntilDeparture = (departureDateTime - now) / (1000 * 60 * 60);
    
    console.log(`⏰ Heures avant le départ: ${hoursUntilDeparture.toFixed(2)}h`);
    
    return hoursUntilDeparture >= CONFIG.AGENCY_PAYMENT_MIN_HOURS;
}
function getNearestAgency(cityName) {
    let agency = agencies.find(a => a.city === cityName);
    
    if (!agency) {
        agency = agencies[0];
        console.log(`⚠️ Pas d'agence à ${cityName}, utilisation de ${agency.city}`);
    }
    
    return agency;
}

function calculatePaymentDeadline() {
    const now = new Date();
    const deadline = new Date(now.getTime() + (CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000));
    return deadline;
}

// ============================================
// GESTION DES RÉSERVATIONS AVEC BACKEND
// ============================================

    // Dans Frontend/app.js

async function saveReservationToBackend(reservation) {
    const API_URL = API_CONFIG.baseUrl; // Utilise la config centrale
    
    console.log(`📤 Tentative d'envoi vers : ${API_URL}/api/reservations`);
    
    try {
        const response = await fetch(`${API_URL}/api/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });

        const responseBody = await response.text(); // Lire la réponse comme texte d'abord

        if (!response.ok) {
            console.error(`❌ Réponse non-OK reçue. Status: ${response.status}`);
            console.error('Corps de la réponse :', responseBody);
            
            // Essayer de parser le JSON, mais se préparer à un échec
            let errorData;
            try {
                errorData = JSON.parse(responseBody);
            } catch (e) {
                // Si la réponse n'est pas du JSON (ex: une page d'erreur HTML de Render)
                throw new Error(`Erreur ${response.status}: Le serveur a répondu de manière inattendue.`);
            }
            
            // Construire un message d'erreur clair
            const errorMessage = errorData.error || (errorData.errors ? errorData.errors[0].msg : 'Erreur inconnue du serveur.');
            throw new Error(errorMessage);
        }
        
        // Si la réponse est OK, parser le JSON
        console.log('✅ Réponse OK du serveur.');
        return JSON.parse(responseBody);

    } catch (error) {
        console.error('❌ Erreur FONDAMENTALE dans la requête fetch :', error);
        
        if (error.name === 'TypeError') { // 'Failed to fetch' est un TypeError
            throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion et l\'état du backend.');
        }
        
        // Propage l'erreur avec un message plus clair
        throw error;
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
window.downloadTicket = async function(reservation) {
    if (!reservation && appState.currentReservation) {
        reservation = appState.currentReservation;
    }
    
    if (!reservation) {
        Utils.showToast('Réservation introuvable', 'error');
        return;
    }
    
    Utils.showToast('Génération du billet en cours...', 'info');
    
    try {
        await generateTicketPDF(reservation);
    } catch (error) {
        console.error('Erreur génération billet:', error);
        Utils.showToast('Erreur lors de la génération du billet', 'error');
    }
}

// Dans app.js
async function generateTicketPDF(reservation) {
    try {
        // Génération du QR Code
        const qrData = Utils.generateQRCodeData(reservation);
        const qrCodeBase64 = await Utils.generateQRCodeBase64(qrData, 200);
        
        // Construction des sections dynamiques (arrêts, correspondances, agence)
        let stopsHTML = '';
        if (reservation.route.stops && reservation.route.stops.length > 0) {
            stopsHTML = `
                <div class="stops-section" style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                    <strong style="display: block; margin-bottom: 10px; color: #333;">🛑 Arrêts prévus :</strong>
                    ${reservation.route.stops.map(stop => `
                        <div style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                            <strong>${stop.city}</strong><br>
                            <span style="font-size: 13px; color: #666;">
                                Arrivée : ${stop.arrivalTime} | Départ : ${stop.departureTime} (Arrêt : ${stop.duration})
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        let connectionsHTML = '';
        if (reservation.route.connections && reservation.route.connections.length > 0) {
            connectionsHTML = `
                <div class="connections-section" style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px;">
                    <strong style="display: block; margin-bottom: 10px; color: #856404;">⚠️ Correspondances :</strong>
                    ${reservation.route.connections.map(conn => `
                        <div style="padding: 8px 0; border-bottom: 1px solid rgba(133, 100, 4, 0.2);">
                            <strong style="color: #856404;">À ${conn.at}</strong><br>
                            <span style="font-size: 13px; color: #856404;">
                                Arrivée : ${conn.arrivalTime} | Attente : ${conn.waitTime}<br>
                                Prochain départ : ${conn.nextDeparture} (${conn.nextCompany})<br>
                                Raison : ${conn.reason || ''}
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        let agencyInfoHTML = '';
        if (reservation.paymentMethod === 'agency' && reservation.agency) {
            agencyInfoHTML = `
                <div class="agency-payment-notice" style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #856404; margin-top: 0;">⚠️ PAIEMENT REQUIS À L'AGENCE</h3>
                    <p style="color: #856404; margin-bottom: 10px;">
                        <strong>Vous devez payer avant le ${new Date(reservation.paymentDeadline).toLocaleString('fr-FR')}</strong>
                    </p>
                    <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 15px;">
                        <strong style="color: #333;">📍 ${reservation.agency.name}</strong><br>
                        <span style="color: #666;">${reservation.agency.address}</span><br>
                        <span style="color: #666;">📞 ${reservation.agency.phone}</span><br>
                        <span style="color: #666;">🕐 ${reservation.agency.hours}</span>
                    </div>
                </div>
            `;
        }
        
        // Construction du template HTML complet du billet
        const ticketHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* ... (tout le CSS du billet reste le même) ... */
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <!-- ... (logo, titre, numéro de réservation) ... -->
                    </div>

                    <div class="ticket-body">
                        ${agencyInfoHTML}

                        <div class="route-info">
                            <!-- ... (détails départ/arrivée) ... -->
                        </div>

                        ${stopsHTML}
                        ${connectionsHTML}

                        <div class="details-grid">
                            <div class="detail-item">
                                <div class="detail-label">Date du voyage</div>
                                <div class="detail-value">${Utils.formatDate(reservation.date)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Compagnie</div>
                                <div class="detail-value">${reservation.route.company}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Durée estimée</div>
                                <!-- ✅ CORRECTION POUR LA DURÉE -->
                                <div class="detail-value">${reservation.route.duration && reservation.route.duration !== "N/A" ? reservation.route.duration : 'Non spécifiée'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Numéros de siège</div>
                                <div class="detail-value">${reservation.seats.join(', ')}</div>
                            </div>
                        </div>

                        <div class="passengers-section">
                            <!-- ... (liste des passagers) ... -->
                        </div>

                        <div class="qr-section">
                            <div class="qr-code">
                                <img src="${qrCodeBase64}" alt="QR Code">
                            </div>
                            <div class="qr-label">✅ Scannez ce code à l'embarquement</div>
                        </div>

                        <div class="price-box">
                            <div class="price-label">PRIX TOTAL</div>
                            <!-- ✅ CORRECTION POUR LE PRIX -->
                            <div class="price-value">${Utils.formatPrice(reservation.totalPriceNumeric)} FCFA</div>
                        </div>
                    </div>

                    <div class="ticket-footer">
                        <!-- ... (informations importantes) ... -->
                    </div>
                </div>
                <script>
                    window.onload = function() { setTimeout(() => { window.print(); }, 500); }
                </script>
            </body>
            </html>
        `;

        // Logique de téléchargement et d'impression (reste inchangée)
        try {
            const blob = new Blob([ticketHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `Billet_EnBus_${reservation.bookingNumber}.html`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            Utils.showToast('Billet téléchargé ! Ouvrez-le pour imprimer.', 'success');
            if (window.innerWidth > 768) {
                setTimeout(() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(ticketHTML);
                        printWindow.document.close();
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Erreur de téléchargement du billet:', error);
            try {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(ticketHTML);
                    printWindow.document.close();
                    Utils.showToast('Billet ouvert dans un nouvel onglet', 'success');
                } else {
                    throw new Error('Popup bloquée');
                }
            } catch (fallbackError) {
                Utils.showToast('Veuillez autoriser les popups pour télécharger le billet', 'error');
            }
        }
        
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        throw error;
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
        setupAmenitiesFilters(); // ✅ AJOUTER CETTE LIGNE
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
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
}

function populateCitySelects() {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");
    
    if (!originSelect || !destinationSelect) return;
    
    cities.sort((a, b) => a.name.localeCompare(b.name));
    
    cities.forEach(city => {
        const originOption = document.createElement("option");
        originOption.value = city.name;
        originOption.textContent = `${city.name}, ${city.country}`;
        originSelect.appendChild(originOption);
        
        const destOption = document.createElement("option");
        destOption.value = city.name;
        destOption.textContent = `${city.name}, ${city.country}`;
        destinationSelect.appendChild(destOption);
    });
}

function populatePopularDestinations() {
    const grid = document.getElementById("popular-destinations-grid");
    if (!grid) return;
    
    const shuffled = [...routes].sort(() => 0.5 - Math.random());
    let destinations = [];
    let seen = new Set();
    
    for (const route of shuffled) {
        const key = `${route.from}-${route.to}`;
        if (!seen.has(key)) {
            destinations.push(route);
            seen.add(key);
            if (destinations.length === 3) break;
        }
    }
    
    grid.innerHTML = destinations.map(route => `
        <div class="destination-card" onclick="searchFromPopular('${route.from}', '${route.to}')">
            <div class="destination-name">${route.from} → ${route.to}</div>
            <div class="destination-price">À partir de ${Utils.formatPrice(route.price)} FCFA</div>
        </div>
    `).join("");
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
    const tripMode = document.querySelector(".trip-type-toggle")?.getAttribute("data-mode") || "one-way";
    
    if (appState.departurePicker) {
        appState.departurePicker.destroy();
    }
    
    const config = {
        altInput: true,
        altFormat: "d F Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        locale: "fr",
        mode: tripMode === "round-trip" ? "range" : "single"
    };
    
    appState.departurePicker = flatpickr("#travel-date", config);
}

function setupPassengerSelector() {
    const input = document.getElementById("passenger-input");
    const dropdown = document.getElementById("passenger-dropdown");
    const adultsCount = document.getElementById("adults-count");
    const childrenCount = document.getElementById("children-count");
    const summary = document.getElementById("passenger-summary");
    
    if (!input || !dropdown) return;
    
    function updateDisplay() {
        appState.passengerCounts.adults = Math.max(1, appState.passengerCounts.adults);
        appState.passengerCounts.children = Math.max(0, appState.passengerCounts.children);
        
        adultsCount.textContent = appState.passengerCounts.adults;
        childrenCount.textContent = appState.passengerCounts.children;
        
        dropdown.querySelector('[data-type="adults"][data-action="decrement"]').disabled = 
            appState.passengerCounts.adults <= 1;
        dropdown.querySelector('[data-type="children"][data-action="decrement"]').disabled = 
            appState.passengerCounts.children <= 0;
        
        let summaryText = `${appState.passengerCounts.adults} Adulte(s)`;
        if (appState.passengerCounts.children > 0) {
            summaryText += `, ${appState.passengerCounts.children} Enfant(s)`;
        }
        summary.textContent = summaryText;
    }
    
    input.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
    });
    
    dropdown.addEventListener("click", (e) => {
        if (e.target.classList.contains("counter-btn")) {
            const type = e.target.dataset.type;
            const action = e.target.dataset.action;
            
            if (action === "increment") {
                appState.passengerCounts[type]++;
            } else if (action === "decrement") {
                appState.passengerCounts[type]--;
            }
            
            updateDisplay();
        }
    });
    
    document.addEventListener("click", () => {
        if (dropdown.classList.contains("open")) {
            dropdown.classList.remove("open");
        }
    });
    
    updateDisplay();
}

function setupPaymentMethodToggle() {
    const radios = document.querySelectorAll('input[name="payment"]');
    const mtnDetails = document.getElementById("mtn-details");
    const airtelDetails = document.getElementById("airtel-details");
    const agencyDetails = document.getElementById("agency-details");
    
    if (!radios.length) return;
    
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (mtnDetails) mtnDetails.style.display = "none";
            if (airtelDetails) airtelDetails.style.display = "none";
            if (agencyDetails) agencyDetails.style.display = "none";
            
            if (radio.value === "mtn" && radio.checked && mtnDetails) {
                mtnDetails.style.display = "flex";
            } else if (radio.value === "airtel" && radio.checked && airtelDetails) {
                airtelDetails.style.display = "flex";
            } else if (radio.value === "agency" && radio.checked && agencyDetails) {
                agencyDetails.style.display = "flex";
            }
        });
    });
}

// ============================================
// ✅ INITIALISATION DES FILTRES ÉQUIPEMENTS
// ============================================
function setupAmenitiesFilters() {
    const container = document.getElementById('amenities-filter-container');
    if (!container) return;
    
    const amenities = [
        { value: 'wifi', label: 'Wi-Fi' },
        { value: 'wc', label: 'WC' },
        { value: 'prise', label: 'Prises' },
        { value: 'clim', label: 'Clim' }
    ];
    
    container.innerHTML = amenities.map(amenity => `
        <label class="amenity-checkbox-label">
            <input 
                type="checkbox" 
                class="amenity-checkbox" 
                value="${amenity.value}" 
                onchange="updateFilter('amenity', '${amenity.value}')"
            >
            <span>
                ${Utils.getAmenityIcon(amenity.value)}
                ${amenity.label}
            </span>
        </label>
    `).join('');
}

window.searchBuses = async function() {
    appState.isSelectingReturn = false;
    
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const travelDates = document.getElementById("travel-date").value;
    
    let departureDate, returnDate;
    if (travelDates.includes(" au ")) {
        [departureDate, returnDate] = travelDates.split(" au ");
    } else {
        departureDate = travelDates;
        returnDate = null;
    }
    
    const totalPassengers = appState.passengerCounts.adults + appState.passengerCounts.children;
    const tripType = document.querySelector(".trip-type-toggle").getAttribute("data-mode") || "one-way";
    
    // ✅ Validation
    if (!origin || !destination) {
        Utils.showToast("Veuillez sélectionner la ville de départ et d'arrivée", 'error');
        return;
    }
    
    if (origin === destination) {
        Utils.showToast("La ville de départ et d'arrivée doivent être différentes", 'error');
        return;
    }
    
    if (!departureDate) {
        Utils.showToast("Veuillez sélectionner une date de départ", 'error');
        return;
    }
    
    if (tripType === "round-trip" && !returnDate) {
        Utils.showToast("Veuillez sélectionner une date de départ ET de retour", 'error');
        return;
    }
    
    // ✅ Sauvegarder la recherche
    appState.currentSearch = {
        origin,
        destination,
        date: departureDate,
        returnDate,
        passengers: totalPassengers,
        tripType
    };
    
    try {
        // ✅ APPEL API BACKEND
        Utils.showToast('Recherche en cours...', 'info');
        
        const response = await fetch(
            `${API_CONFIG.baseUrl}/api/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${departureDate}`
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la recherche');
        }
        
        const data = await response.json();
        
        console.log(`✅ ${data.count} voyage(s) trouvé(s)`);
        
        if (data.count === 0) {
            Utils.showToast("Aucun trajet disponible pour cet itinéraire à cette date", 'info');
            appState.currentResults = [];
            displayResults([]);
            showPage("results");
        } else {
            appState.currentResults = data.results;
            displayResults(data.results);
            showPage("results");
            Utils.showToast(`${data.count} trajet(s) trouvé(s)`, 'success');
        }
        
    } catch (error) {
        console.error('❌ Erreur recherche:', error);
        Utils.showToast(error.message || 'Erreur lors de la recherche', 'error');
    }
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

window.updateFilter = function(filterType, value) {
    switch (filterType) {
        case 'company':
        case 'tripType':
        case 'departureTime':
        case 'sortBy':
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
    
    // Réappliquer les filtres
    const filtered = applyFiltersAndSort();
    displayResults(filtered, appState.isSelectingReturn);
    
    // Message si aucun résultat
    if (filtered.length === 0) {
        Utils.showToast('Aucun trajet ne correspond à vos critères', 'info');
    }
};

window.resetFilters = function() {
    activeFilters = {
        company: 'all',
        tripType: 'all',
        priceRange: { min: 0, max: 100000 },
        departureTime: 'all',
        amenities: [],
        sortBy: 'departure'
    };
    
    // Réinitialiser l'UI
    document.getElementById('filter-company').value = 'all';
    document.getElementById('filter-trip-type').value = 'all';
    document.getElementById('filter-time').value = 'all';
    document.getElementById('sort-by').value = 'departure';
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 100000;
    document.getElementById('price-min-display').textContent = '0';
    document.getElementById('price-max-display').textContent = '100 000';
    
    // Décocher toutes les cases équipements
    document.querySelectorAll('.amenity-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    displayResults(appState.currentResults, appState.isSelectingReturn);
    Utils.showToast('Filtres réinitialisés', 'success');
};

function displayResults(results, isReturn = false) {
    const summary = document.getElementById("search-summary");
    const resultsList = document.getElementById("results-list");
    const legendContainer = document.getElementById("amenities-legend");
    
    // ✅ Appliquer les filtres si ce n'est pas un retour de filtre
    const displayedResults = results === appState.currentResults ? applyFiltersAndSort() : results;
    
    const summaryHTML = isReturn
        ? `Sélectionnez votre <strong>RETOUR</strong> : <strong>${appState.currentSearch.destination}</strong> → <strong>${appState.currentSearch.origin}</strong> (${displayedResults.length} résultat(s))`
        : `Sélectionnez votre <strong>ALLER</strong> : <strong>${appState.currentSearch.origin}</strong> → <strong>${appState.currentSearch.destination}</strong> (${displayedResults.length} résultat(s))`;
    
    summary.innerHTML = summaryHTML;
    
    // ✅ Légende avec icônes normales
    const amenityLabels = {
        wifi: "Wi-Fi",
        wc: "Toilettes",
        prise: "Prises",
        clim: "Climatisation",
        pause: "Pause",
        direct: "Direct"
    };
    
    let legendHTML = "";
    for (const [key, label] of Object.entries(amenityLabels)) {
        legendHTML += `
            <div class="legend-amenity">
                ${Utils.getAmenityIcon(key)}
                <span>${label}</span>
            </div>
        `;
    }
    legendContainer.innerHTML = legendHTML;
    
    // ✅ Affichage des résultats
    if (displayedResults.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 48px; color: var(--color-text-secondary);">
                <h3>Aucun trajet disponible</h3>
                <p>Essayez de modifier vos critères de recherche ou vos filtres.</p>
                <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 16px;">
                    Réinitialiser les filtres
                </button>
                <button class="btn btn-primary" onclick="showPage('home')" style="margin-top: 16px;">
                    Nouvelle recherche
                </button>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = displayedResults.map(route => {
        const availableSeats = Math.floor(Math.random() * 35) + 5;
        const amenitiesHTML = route.amenities.map(amenity => 
            `<div class="amenity-item" title="${amenityLabels[amenity]}">${Utils.getAmenityIcon(amenity)}</div>`
        ).join("");
        
        let tripDetailsHTML = "";
        if (route.tripType === "direct") {
            tripDetailsHTML = `<div class="bus-card-trip-details">${Utils.getAmenityIcon("direct")}<span>Trajet direct</span></div>`;
        } else if (route.stops && route.stops.length > 0) {
            const stopsPreview = route.stops.map(s => s.city).join(', ');
            tripDetailsHTML = `
                <div class="bus-card-trip-details">
                    <span class="bus-card-stops" title="Arrêts : ${stopsPreview}">
                        🛑 ${route.stops.length} arrêt(s)
                    </span>
                </div>
                <details style="font-size: 13px; color: var(--color-text-secondary); margin-top: 8px;">
                    <summary style="cursor: pointer; font-weight: 600;">Voir détails arrêts</summary>
                    <div style="margin-top: 8px; padding-left: 12px; border-left: 2px solid var(--color-border);">
                        ${route.stops.map(stop => `
                            <div style="padding: 6px 0;">
                                <strong>${stop.city}</strong><br>
                                <span style="font-size: 12px;">
                                    Arrivée: ${stop.arrivalTime} | Départ: ${stop.departureTime} 
                                    (${stop.duration})
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </details>
            `;
        }
        
        if (route.connections && route.connections.length > 0) {
            tripDetailsHTML += `
                <details style="font-size: 13px; color: #ffc107; margin-top: 8px;">
                    <summary style="cursor: pointer; font-weight: 600;">⚠️ Correspondances requises</summary>
                    <div style="margin-top: 8px; padding-left: 12px; border-left: 2px solid #ffc107;">
                        ${route.connections.map(conn => `
                            <div style="padding: 6px 0; background: rgba(255, 193, 7, 0.1); padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                                <strong>À ${conn.at}</strong><br>
                                <span style="font-size: 12px;">
                                    Attente: ${conn.waitTime}<br>
                                    Prochain départ: ${conn.nextDeparture} (${conn.nextCompany})
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </details>
            `;
        }
        
        if (!route.amenities.includes("wc") && route.breaks > 0) {
            tripDetailsHTML += `<div class="bus-card-trip-details">${Utils.getAmenityIcon("pause")}<span>${route.breaks} pause(s) prévue(s)</span></div>`;
        }
        
        return `

        <div class="bus-card">
        <div class="bus-card-main">
            <div class="bus-card-time">
                <span>${route.departure}</span>
                <div class="bus-card-duration">
                    <span>→</span><br>
                    ${route.duration && route.duration !== "N/A" ? route.duration : 'durée du trajet'}
                </div>
                <span>${route.arrival}</span>
            </div>
            <div class="bus-card-company">${route.company}</div>
            ${tripDetailsHTML}
            <div class="bus-card-details">
                <div class="bus-amenities">${amenitiesHTML}</div>
                <div class="bus-seats">
                    <strong>${route.availableSeats}</strong> sièges dispo.
                </div>
            </div>
        </div>
        <div class="bus-card-pricing">
            <div class="bus-price">${Utils.formatPrice(route.price)} FCFA</div>
            <button class="btn btn-primary" onclick="selectBus('${route.id}')">Sélectionner</button>
        </div>
    </div>

            
        `;
    }).join("");
}

window.selectBus = async function(busId) {  // ✅ Ajout de "async"
    console.log('🚌 Sélection du bus:', busId);
    
    // ✅ Recherche par ID (string MongoDB)
    const selectedRoute = appState.currentResults.find(r => r.id === busId.toString());
    
    if (!selectedRoute) {
        Utils.showToast('Erreur : voyage introuvable', 'error');
        console.error('Bus non trouvé dans les résultats:', busId);
        return;
    }
    
    if (appState.currentSearch.tripType === "round-trip" && !appState.isSelectingReturn) {
        // Aller simple d'un aller-retour
        appState.selectedBus = selectedRoute;
        appState.isSelectingReturn = true;
        
        // Chercher les trajets retour
        await searchReturnTrips();  // ✅ Ajout de "await"
    } else {
        // Enregistrer le bus sélectionné
        if (appState.isSelectingReturn) {
            appState.selectedReturnBus = selectedRoute;
        } else {
            appState.selectedBus = selectedRoute;
        }
        
        // Réinitialiser les sièges sélectionnés
        appState.selectedSeats = [];
        
        // ✅ CHARGER LES VRAIS SIÈGES DEPUIS LE BACKEND
        await loadRealSeats();
        
        // Afficher la page de sélection des sièges
        displaySeats();
        showPage("seats");
    }
}
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
    
    if (index > -1) {
        currentSeats.splice(index, 1);
    } else {
        if (currentSeats.length >= maxSeats) {
            Utils.showToast(`Vous pouvez sélectionner au maximum ${maxSeats} siège(s)`, 'error');
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
    
    displaySeats();
}

// ============================================
// ✅ AFFICHAGE DES SIÈGES - DESIGN IMMERSIF FLIXBUS
// ============================================

// Dans app.js
// Dans app.js
function displaySeats() {
    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    const currentOccupied = appState.isSelectingReturn ? appState.occupiedReturnSeats : appState.occupiedSeats;
    
    const busInfo = document.getElementById("bus-info");
    const seatGrid = document.getElementById("pro-seat-grid");
    
    const tripLabel = appState.isSelectingReturn ? "🔙 RETOUR" : "🚌 ALLER";
    
    busInfo.innerHTML = `
        <div class="bus-info-header">
            <div class="trip-badge ${appState.isSelectingReturn ? 'return' : 'outbound'}">${tripLabel}</div>
            <h3>${currentBus.company} - ${currentBus.from} → ${currentBus.to}</h3>
            <div class="price-info">
                <span class="price-item"><strong>Adulte:</strong> ${Utils.formatPrice(currentBus.price)} FCFA</span>
                <span class="price-divider">|</span>
                <span class="price-item"><strong>Enfant:</strong> ${Utils.formatPrice(CONFIG.CHILD_TICKET_PRICE)} FCFA</span>
            </div>
        </div>
    `;
    
    // ✅ UTILISER LE NOMBRE TOTAL DE SIÈGES DU BACKEND
    const totalSeats = currentBus.totalSeats || CONFIG.SEAT_TOTAL;
    const hasWC = currentBus.amenities.includes("wc");
    const seatsPerRow = 4;
    const backRowSeatsCount = 5;
    
    // Calculer le nombre de rangées standard
    let mainRows = Math.floor((totalSeats - backRowSeatsCount) / seatsPerRow);
    if ((totalSeats - backRowSeatsCount) % seatsPerRow !== 0) {
        mainRows++; // Ajouter une rangée si le compte n'est pas rond
    }

    let seatHTML = `
        <div class="modern-bus-container">
            
            <!-- ✅ ZONE CHAUFFEUR RÉINTÉGRÉE -->
            <div class="bus-front-zone">
                <div class="driver-section">
                    <div class="driver-icon">🧑‍✈️</div>
                    <span class="driver-label">Chauffeur</span>
                </div>
                <div class="front-door-section">
                    <div class="bus-steps">
                        <div class="step"></div>
                        <div class="step"></div>
                        <div class="step"></div>
                    </div>
                    <div class="door-icon">🚪</div>
                    <span class="door-label">Entrée</span>
                </div>
            </div>
            
            <div class="modern-seat-grid">
    `;
    
    let seatNumber = 1;
    const seatsInMainRows = totalSeats - backRowSeatsCount;
    
    for (let row = 1; row <= mainRows; row++) {
        seatHTML += `<div class="seat-row" data-row="${row}">`;
        
        // Colonnes A & B
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `A${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `B${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        
        seatHTML += `<div class="aisle-space"><div class="aisle-line"></div></div>`;
        
        // Colonnes C & D
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `C${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `D${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        
        seatHTML += `<div class="row-indicator">${row}</div></div>`;
    }
    
    seatHTML += `</div>`; // Fin modern-seat-grid
    
    if (hasWC) {
        seatHTML += `
            <div class="toilet-section">
                <div class="toilet-icon">🚻</div>
                <span class="toilet-label">Toilettes</span>
            </div>
        `;
    }
    
    // Rangée arrière
    seatHTML += `<div class="back-row-container">
        <div class="back-row-label">Rangée arrière</div>
        <div class="back-row-seats">`;
    
    for (let i = 0; i < backRowSeatsCount; i++) {
        if (seatNumber <= totalSeats) {
            seatHTML += generateModernSeat(seatNumber++, `R${i + 1}`, currentSeats, currentOccupied);
        }
    }
    
    seatHTML += `</div></div></div>`;
    
    seatGrid.innerHTML = seatHTML;
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
    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    
    const seatsDisplay = document.getElementById("selected-seats-display");
    const priceDisplay = document.getElementById("total-price-display");
    if (currentSeats.length === 0) {
        seatsDisplay.textContent = "Aucun";
        priceDisplay.textContent = "0 FCFA";
    } else {
        seatsDisplay.textContent = currentSeats.join(", ");
        const numSeats = currentSeats.length;
        const numAdults = appState.passengerCounts.adults;
        let adultsSelected = 0;
        let childrenSelected = 0;
        if (numSeats <= numAdults) {
            adultsSelected = numSeats;
            childrenSelected = 0;
        } else {
            adultsSelected = numAdults;
            childrenSelected = numSeats - numAdults;
        }
        const adultPrice = adultsSelected * currentBus.price;
        const childPrice = childrenSelected * CONFIG.CHILD_TICKET_PRICE;
        const totalPrice = adultPrice + childPrice;
        priceDisplay.textContent = Utils.formatPrice(totalPrice) + " FCFA";
    }
}

window.proceedToPassengerInfo = function() {
    const expectedSeats = appState.passengerCounts.adults + appState.passengerCounts.children;
    
    if (appState.currentSearch.tripType === "round-trip") {
        if (!appState.isSelectingReturn) {
            if (appState.selectedSeats.length !== expectedSeats) {
                Utils.showToast(`Veuillez sélectionner ${expectedSeats} siège(s) pour l'ALLER`, 'error');
                return;
            }
            
            appState.isSelectingReturn = true;
            const returnRoutes = routes.filter(r => 
                r.from === appState.currentSearch.destination && 
                r.to === appState.currentSearch.origin
            );
            
            displayResults(returnRoutes, true);
            showPage("results");
            Utils.showToast('Sélectionnez maintenant votre bus de RETOUR', 'info');
            return;
        } else {
            if (appState.selectedReturnSeats.length !== expectedSeats) {
                Utils.showToast(`Veuillez sélectionner ${expectedSeats} siège(s) pour le RETOUR`, 'error');
                return;
            }
        }
    } else {
        if (appState.selectedSeats.length !== expectedSeats) {
            Utils.showToast(`Veuillez sélectionner ${expectedSeats} siège(s)`, 'error');
            return;
        }
    }
    
    displayPassengerForms();
    showPage("passengers");
}

// Dans app.js
function displayPassengerForms() {
    const formsContainer = document.getElementById("passengers-forms");
    const baggageContainer = document.getElementById("baggage-options");
    const baggageInfo = document.getElementById("baggage-section-info"); // Assurez-vous d'avoir un élément avec cet ID

    let formsHTML = "";
    let baggageHTML = "";
    appState.baggageCounts = {};
    
    // ✅ ÉTAPE 1 : Récupérer les options de bagages du trajet sélectionné (avec des valeurs par défaut)
    const baggageOptions = appState.selectedBus.baggageOptions || {
        standard: { included: 1, max: 5, price: 2000 },
        oversized: { max: 2, price: 5000 }
    };

    // ✅ ÉTAPE 2 : Mettre à jour l'information sur les bagages inclus
    if (baggageInfo) {
        baggageInfo.innerHTML = `
            Chaque passager a droit à <strong>${baggageOptions.standard.included} bagage(s) en soute</strong> inclus.
        `;
    }

    // ✅ ÉTAPE 3 : Créer les formulaires pour chaque passager
    for (let i = 0; i < appState.currentSearch.passengers; i++) {
        const passengerType = i < appState.passengerCounts.adults ? "Adulte" : "Enfant";
        const seatNumber = appState.selectedSeats[i];
        
        // Le HTML pour le formulaire passager ne change pas
        formsHTML += `
            <div class="passenger-form">
                <h3>Passager ${i + 1} (${passengerType}) - Siège ${seatNumber}</h3>
                <div class="form-group">
                    <label for="name-${i}">Nom complet *</label>
                    <input type="text" id="name-${i}" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="phone-${i}">Numéro de téléphone (international accepté) *</label>
                    <input type="tel" id="phone-${i}" class="form-control" placeholder="Ex: +242 06 123 4567 ou 06 123 4567" required>
                    <small style="color: var(--color-text-secondary); font-size: 13px; margin-top: 4px; display: block;">
                        Formats acceptés : +XXX..., 00XXX..., ou national
                    </small>
                </div>
                <div class="form-group">
                    <label for="email-${i}">Email (optionnel)</label>
                    <input type="email" id="email-${i}" class="form-control" placeholder="exemple@email.com">
                </div>
            </div>`;
        
        // ✅ ÉTAPE 4 : Initialiser le compteur de bagages pour chaque passager (avec les 2 types)
        appState.baggageCounts[i] = { standard: 0, oversized: 0 };
        
        // ✅ ÉTAPE 5 : Afficher les options de bagages avec les prix DYNAMIQUES
        baggageHTML += `
            <div class="baggage-passenger-section">
                <h4>Options pour Passager ${i + 1} (Siège ${seatNumber})</h4>
                <div class="baggage-row">
                    <span class="baggage-label">
                        Bagage standard suppl. (+${Utils.formatPrice(baggageOptions.standard.price)} FCFA/pce)
                    </span>
                    <div class="passenger-counter">
                        <button type="button" class="counter-btn" data-passenger-index="${i}" data-type="standard" data-action="decrement">-</button>
                        <span id="baggage-count-${i}-standard">0</span>
                        <button type="button" class="counter-btn" data-passenger-index="${i}" data-type="standard" data-action="increment">+</button>
                    </div>
                </div>
                <div class="baggage-row">
                    <span class="baggage-label">
                        Bagage hors format (+${Utils.formatPrice(baggageOptions.oversized.price)} FCFA/pce)
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

    // Appliquer les changements au DOM
    formsContainer.innerHTML = formsHTML;
    baggageContainer.innerHTML = baggageHTML;
    
    // Attacher les événements aux nouveaux boutons
    document.querySelectorAll("#baggage-options .counter-btn").forEach(btn => {
        btn.addEventListener("click", handleBaggageChange);
    });
    
    // Mettre à jour le récapitulatif des prix
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

// Dans app.js
window.proceedToPayment = function() {
    appState.passengerInfo = [];
    let allFieldsValid = true;

    for (let i = 0; i < appState.currentSearch.passengers; i++) {
        const name = document.getElementById(`name-${i}`).value.trim();
        const phone = document.getElementById(`phone-${i}`).value.trim();
        const email = document.getElementById(`email-${i}`).value.trim();
        
        if (!name || !phone) {
            Utils.showToast(`Veuillez remplir tous les champs obligatoires pour le passager ${i + 1}`, 'error');
            allFieldsValid = false;
            break; // Arrêter à la première erreur
        }
        
        if (!Utils.validatePhone(phone)) {
            Utils.showToast(`Numéro de téléphone invalide pour le passager ${i + 1}`, 'error');
            allFieldsValid = false;
            break;
        }
        
        if (email && !Utils.validateEmail(email)) {
            Utils.showToast(`Email invalide pour le passager ${i + 1}`, 'error');
            allFieldsValid = false;
            break;
        }
        
        // Ajouter les infos du passager et ses bagages
        appState.passengerInfo.push({
            seat: appState.selectedSeats[i],
            name: name,
            phone: phone,
            email: email,
            baggage: appState.baggageCounts[i] || { standard: 0, oversized: 0 }
        });
    }

    // Si tout est valide, continuer
    if (allFieldsValid) {
        // ✅ APPEL DE LA NOUVELLE FONCTION
        updateBookingSummary();
        showPage("payment");
    }
}

// Dans app.js
// Dans app.js
function displayBookingSummary() {
    const summaryContainer = document.getElementById("booking-summary");
    if (!summaryContainer) return;

    // ... (tout le calcul des prix reste le même) ...

    const totalPrice = ticketsPrice + totalBaggagePrice;
    
    // Mise à jour du récapitulatif
    summaryContainer.innerHTML = `...`; // Cette partie est bonne

    // --- MISE À JOUR DES CHAMPS DE PAIEMENT ---
    
    const bookingRef = document.getElementById("mtn-booking-ref")?.value || Utils.generateBookingNumber();
    const amountStr = `${Utils.formatPrice(totalPrice)} FCFA`;
    
    ['mtn', 'airtel', 'agency'].forEach(method => {
        const amountInput = document.getElementById(`${method}-amount`);
        const refInput = document.getElementById(`${method}-booking-ref`);
        if (amountInput) amountInput.value = amountStr;
        if (refInput) refInput.value = bookingRef;
    });

    // --- CORRECTIONS POUR LE PAIEMENT À L'AGENCE ---

    const agencyOption = document.getElementById('agency-payment-option');
    const agencySubtitle = document.getElementById('agency-payment-subtitle');
    const agencyInfoDiv = document.getElementById('selected-agency-info');
    const deadlineInput = document.getElementById('agency-deadline');
    
    // ✅ ÉTAPE 1 : VÉRIFIER SI LE PAIEMENT EN AGENCE EST POSSIBLE
    if (canPayAtAgency()) {
        agencyOption.style.opacity = '1';
        agencyOption.querySelector('input').disabled = false;
        
        // ✅ ÉTAPE 2 : CALCULER LA DEADLINE ET L'AGENCE
        const deadline = calculatePaymentDeadline();
        const agency = getNearestAgency(appState.selectedBus.from);
        
        // ✅ ÉTAPE 3 : METTRE À JOUR TOUS LES ÉLÉMENTS HTML
        agencySubtitle.textContent = `Payez avant le ${deadline.toLocaleDateString('fr-FR')} à ${deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        
        if (agencyInfoDiv) {
            agencyInfoDiv.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>${agency.name}</strong><br>
                    📍 ${agency.address}<br>
                    📞 ${agency.phone}<br>
                    🕐 ${agency.hours}
                </div>
            `;
        }
        
        if (deadlineInput) {
            deadlineInput.value = deadline.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
        }

    } else {
        // Logique pour désactiver l'option
        agencyOption.style.opacity = '0.5';
        agencyOption.querySelector('input').disabled = true;
        agencySubtitle.innerHTML = `<span style="color: #f44336;">⚠️ Non disponible (moins de ${CONFIG.AGENCY_PAYMENT_MIN_HOURS}h avant départ)</span>`;
        if (agencyInfoDiv) agencyInfoDiv.innerHTML = '';
        if (deadlineInput) deadlineInput.value = 'Non applicable';
    }
}
// Dans Frontend/app.js

// Dans app.js
window.confirmBooking = async function(buttonElement) {
    // --- Validation ---
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    if (paymentMethod === "agency" && !canPayAtAgency()) {
        Utils.showToast("Le paiement en agence n'est plus disponible pour ce trajet.", 'error');
        return;
    }
    // ... (autres validations) ...

    buttonElement.disabled = true;
    buttonElement.innerHTML = `<span>Chargement...</span>`;
    
    try {
        // --- PRÉPARATION DES DONNÉES FIABLES ---
        const baggageOptions = appState.selectedBus.baggageOptions || { standard: { price: 2000 }, oversized: { price: 5000 } };
        
        const numAdultsSeats = Math.min(appState.selectedSeats.length, appState.passengerCounts.adults);
        const numChildrenSeats = appState.selectedSeats.length - numAdultsSeats;
        const ticketsPrice = (numAdultsSeats * appState.selectedBus.price) + (numChildrenSeats * CONFIG.CHILD_TICKET_PRICE);
        
        let totalStandardBaggage = 0, totalOversizedBaggage = 0;
        Object.values(appState.baggageCounts).forEach(paxBaggage => {
            totalStandardBaggage += paxBaggage.standard || 0;
            totalOversizedBaggage += paxBaggage.oversized || 0;
        });
        const baggagePrice = (totalStandardBaggage * baggageOptions.standard.price) + (totalOversizedBaggage * baggageOptions.oversized.price);

        const finalTotalPriceNumeric = ticketsPrice + baggagePrice;

        let reservationStatus = "Confirmé", paymentDeadline = null, agencyInfo = null;
        if (paymentMethod === "agency") {
            reservationStatus = "En attente de paiement";
            paymentDeadline = calculatePaymentDeadline().toISOString();
            agencyInfo = getNearestAgency(appState.selectedBus.from);
        }
        
        // ✅ L'OBJET RÉSERVATION COMPLET ET CORRECT
        const reservation = {
            bookingNumber: Utils.generateBookingNumber(),
            route: appState.selectedBus, // Contient la 'duration' et toutes les infos du trajet
            returnRoute: appState.selectedReturnBus || null,
            date: appState.currentSearch.date,
            returnDate: appState.currentSearch.returnDate || null,
            passengers: appState.passengerInfo,
            seats: appState.selectedSeats,
            returnSeats: appState.selectedReturnSeats || [],
            totalPrice: `${Utils.formatPrice(finalTotalPriceNumeric)} FCFA`,
            totalPriceNumeric: finalTotalPriceNumeric, // La valeur numérique est cruciale
            paymentMethod: paymentMethod,
            status: reservationStatus,
            paymentDeadline: paymentDeadline,
            agency: agencyInfo,
            createdAt: new Date().toISOString()
        };
        
        console.log("📦 OBJET FINAL ENVOYÉ :", reservation);

        await saveReservationToBackend(reservation);
        
        appState.currentReservation = reservation; // Stocker l'objet complet
        displayConfirmation(reservation);
        showPage("confirmation");
        
        // ... (messages de succès)

    } catch (error) {
        Utils.showToast(error.message, 'error');
    } finally {
        buttonElement.disabled = false;
        buttonElement.innerHTML = "Confirmer la Réservation";
    }
}
function displayConfirmation(reservation) {
    // Lien de suivi GPS
    // ✅ NOUVEAU CODE (compatible PWA mobile)
const trackLink = document.getElementById("track-bus-link");
if (trackLink) {
    if (reservation.route && reservation.route.trackerId) {
        const trackerId = reservation.route.trackerId;
        
        // Construire l'URL complète
        const currentOrigin = window.location.origin;
        const trackingUrl = `${currentOrigin}/suivi/suivi.html?bus=${trackerId}`; 
        
        trackLink.href = trackingUrl;
        
        // Sur PWA/mobile, ouvrir dans la même fenêtre
        if (window.matchMedia('(display-mode: standalone)').matches || window.innerWidth <= 768) {
            trackLink.target = "_self";
        } else {
            trackLink.target = "_blank";
        }
        
        trackLink.style.display = "inline-flex";
        
        // Ajouter un event listener pour le suivi
        trackLink.onclick = (e) => {
            console.log('🛰️ Ouverture du suivi pour le bus:', trackerId);
            // Laisser le comportement par défaut du lien
        };
        
        console.log('✅ Lien de suivi configuré:', trackingUrl);
    } else {
        trackLink.style.display = "none";
        console.log('⚠️ Pas de trackerId pour cette réservation');
    }
}

    // Numéro de réservation
    const bookingDisplay = document.getElementById("booking-number-display");
    if (bookingDisplay) {
        bookingDisplay.textContent = reservation.bookingNumber;
    }

    // Informations de trajet
    const confOrigin = document.getElementById("conf-origin");
    const confDestination = document.getElementById("conf-destination");
    const confDate = document.getElementById("conf-date");
    const confTime = document.getElementById("conf-time");
    const confArrivalTime = document.getElementById("conf-arrival-time");
    const confDuration = document.getElementById("conf-duration");

    // ✅ NOUVEAU BLOC CORRIGÉ
if (confOrigin) confOrigin.textContent = reservation.route.from;
if (confDestination) confDestination.textContent = reservation.route.to;
if (confDate) confDate.textContent = Utils.formatDate(reservation.date);
if (confTime) confTime.textContent = reservation.route.departure;
if (confArrivalTime) confArrivalTime.textContent = reservation.route.arrival;

// On ajoute une vérification pour la durée
    // Dans displayConfirmation()
if (confDuration) {
    const durationText = reservation.route.duration || 'Non spécifiée';
    confDuration.textContent = durationText;
}

    // ✅ NOUVELLE - Grille de détails avec types de passagers
    // ✅ NOUVELLE - Grille de détails avec types de passagers
const detailsContainer = document.getElementById("confirmation-details");
if (detailsContainer) {
    const adultsCount = reservation.passengers.filter((p, index) => 
        index < appState.passengerCounts.adults
    ).length;
    const childrenCount = reservation.passengers.length - adultsCount;

    let passengersText = `${adultsCount} Adulte(s)`;
    if (childrenCount > 0) {
        passengersText += `, ${childrenCount} Enfant(s)`;
    }

    detailsContainer.innerHTML = `
        <div class="detail-item-modern">
            <span class="detail-label">🚌 Compagnie</span>
            <span class="detail-value">${reservation.route.company}</span>
        </div>
        <div class="detail-item-modern">
            <span class="detail-label">👥 Passagers</span>
            <span class="detail-value">${passengersText}</span>
        </div>
        <div class="detail-item-modern">
            <span class="detail-label">💺 Sièges</span>
            <span class="detail-value">${reservation.seats.join(', ')}</span>
        </div>
        <div class="detail-item-modern">
            <span class="detail-label">💰 Prix total</span>
            <!-- ✅ LIGNE CORRIGÉE -->
            <span class="detail-value">${Utils.formatPrice(reservation.totalPriceNumeric || 0)} FCFA</span>
        </div>
    `;
}

    // ✅ QR Code simplifié v2.0
    const qrContainer = document.getElementById("qr-placeholder");
    if (qrContainer) {
        qrContainer.innerHTML = '';
        
        // ✅ GÉNÉRER DONNÉES SIMPLIFIÉES
        const qrData = Utils.generateQRCodeData(reservation);
        
        console.log("📱 Génération QR Code simplifié v2.0");
        console.log("Raw JSON:", qrData);
        
        try {
            new QRCode(qrContainer, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
            
            console.log("✅ QR Code généré avec succès !");
            
            // ✅ AFFICHER APERÇU SIMPLIFIÉ
            const qrInfo = document.querySelector('.qr-info');
            if (qrInfo) {
                const parsedData = JSON.parse(qrData);
                
                qrInfo.innerHTML = `
                    <p class="qr-title">🎫 Votre billet électronique</p>
                    <p class="qr-instruction">Présentez ce QR code à l'embarquement</p>
                    <details style="margin-top: 16px; text-align: left; font-size: 12px; color: var(--color-text-secondary);">
                        <summary style="cursor: pointer; font-weight: 600; text-align: center;">📋 Contenu du QR Code</summary>
                        <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; font-family: monospace;">
                            <div><strong>Version:</strong> ${parsedData.v}</div>
                            <div><strong>Réservation:</strong> ${parsedData.b}</div>
                            <div><strong>Passagers:</strong> ${parsedData.p}</div>
                            <div><strong>Date:</strong> ${parsedData.d}</div>
                            <div><strong>Statut:</strong> ${parsedData.s === 'C' ? 'Confirmé ✅' : 'En attente ⏳'}</div>
                        </div>
                    </details>
                `;
            }
            
        } catch (error) {
            console.error("❌ Erreur génération QR Code:", error);
            qrContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #f44336;">
                    ❌ Erreur génération QR Code<br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

}


async function displayReservations() {
    const reservationsList = document.getElementById("reservations-list");
    if (!reservationsList) return;
    const userPhone = prompt("Entrez votre numéro de téléphone pour voir vos réservations:");
    if (!userPhone) {
        reservationsList.innerHTML = `<div class="no-reservations"><p>Numéro de téléphone requis pour afficher vos réservations.</p></div>`;
        return;
    }
    reservationsList.innerHTML = `<div style="text-align: center; padding: 48px;"><p>Chargement de vos réservations...</p></div>`;
    try {
        const reservations = await loadReservationsFromBackend(userPhone);
        if (reservations.length === 0) {
            reservationsList.innerHTML = `<div class="no-reservations"><p>Vous n'avez pas encore de réservations.</p><button class="btn btn-primary" onclick="showPage('home')" style="margin-top: 16px;">Réserver un billet</button></div>`;
        } else {
            reservationsList.innerHTML = reservations.map(reservation => {
                
                let alertHTML = '';
                let actionButtons = '';
                
                if (reservation.status === 'En attente de paiement') {
                    const deadline = new Date(reservation.paymentDeadline);
                    const now = new Date();
                    const timeLeft = deadline - now;
                    
                    if (timeLeft > 0) {
                        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                        
                        alertHTML = `
                            <div class="payment-alert" style="
                                background: linear-gradient(135deg, #fff3cd, #ffe7a1); 
                                border-left: 4px solid #ffc107; 
                                padding: 15px; 
                                margin-bottom: 15px;
                                border-radius: 8px;
                            ">
                                <strong style="color: #856404;">⏰ Paiement requis à l'agence !</strong><br>
                                <span style="color: #856404;">
                                    Vous devez payer avant le <strong>${deadline.toLocaleString('fr-FR')}</strong><br>
                                    ⏱️ Temps restant : <strong style="font-size: 18px;">${hoursLeft}h ${minutesLeft}min</strong>
                                </span>
                                ${reservation.agency ? `
                                    <hr style="border-color: rgba(133, 100, 4, 0.2); margin: 10px 0;">
                                    <div style="color: #856404; font-size: 14px;">
                                        <strong>📍 ${reservation.agency.name}</strong><br>
                                        ${reservation.agency.address}<br>
                                        📞 ${reservation.agency.phone}<br>
                                        🕐 ${reservation.agency.hours}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                        
                        actionButtons = `
                            <button class="btn btn-primary" onclick='downloadTicket(${JSON.stringify(reservation).replace(/'/g, "&apos;")})'>
                                📥 Télécharger le reçu
                            </button>
                            <button class="btn btn-secondary" onclick="cancelReservation('${reservation.bookingNumber}')">
                                Annuler
                            </button>
                        `;
                    } else {
                        alertHTML = `
                            <div class="payment-alert" style="background: #f44336; color: white; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                                <strong>❌ Paiement expiré</strong><br>
                                Cette réservation sera automatiquement annulée.
                            </div>
                        `;
                        actionButtons = `<button class="btn btn-primary" disabled>Expiré</button>`;
                    }
                    
                } else if (reservation.status === 'Confirmé') {
                    actionButtons = `
                        <button class="btn btn-primary" onclick='downloadTicket(${JSON.stringify(reservation).replace(/'/g, "&apos;")})'>
                            📥 Télécharger le billet
                        </button>
                        ${reservation.route.trackerId ? `
                            <a href="suivi.html?bus=${reservation.route.trackerId}" target="_blank" class="btn btn-secondary">
                                🛰️ Suivre le bus
                            </a>
                        ` : ''}
                    `;
                    
                } else if (reservation.status === 'Annulé' || reservation.status === 'Expiré') {
                    actionButtons = `
                        <button class="btn btn-primary" disabled style="opacity: 0.5;">
                            ${reservation.status}
                        </button>
                    `;
                }
                
                return `
                    <div class="reservation-card">
                        ${alertHTML}
                        
                        <div class="reservation-header" style="display:flex; justify-content:space-between; margin-bottom:12px;">
                            <div class="reservation-number">${reservation.bookingNumber}</div>
                            <div class="reservation-status status-${reservation.status.toLowerCase().replace(/ /g, '-')}">${reservation.status}</div>
                        </div>
                        
                        <div class="reservation-details">
                            <div><strong>Itinéraire:</strong> ${reservation.route.from} → ${reservation.route.to}</div>
                            <div><strong>Date:</strong> ${Utils.formatDate(reservation.date)}</div>
                            <div><strong>Heure:</strong> ${reservation.route.departure}</div>
                            <div><strong>Compagnie:</strong> ${reservation.route.company}</div>
                            <div><strong>Sièges:</strong> ${reservation.seats.join(", ")}</div>
                            <div><strong>Prix total:</strong> ${reservation.totalPrice}</div>
                        </div>
                        
                        <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
                            ${actionButtons}
                        </div>
                    </div>
                `;
            }).join("");
        }
    } catch (error) {
        console.error('Erreur chargement réservations:', error);
        reservationsList.innerHTML = `<div class="no-reservations"><p>❌ Erreur lors du chargement de vos réservations.</p><button class="btn btn-secondary" onclick="displayReservations()" style="margin-top: 16px;">Réessayer</button></div>`;
    }
}

window.addEventListener("DOMContentLoaded", initApp);