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


let frontendCountdownInterval = null; 

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
    sortBy: 'departure',
    // ✅ AJOUTER CETTE LIGNE
    departureLocation: 'all'
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
generateQRCodeData(reservation, isReturn = false) {
    // Récupérer les informations de base
    const bookingNumber = reservation.bookingNumber;
    const mainPassengerName = reservation.passengers[0]?.name || 'N/A';
    const totalPassengers = reservation.passengers.length;

    // Déterminer la date et le type de trajet (Aller ou Retour)
    let travelDate, travelType;
    if (isReturn && reservation.returnDate) {
        travelDate = reservation.returnDate;
        travelType = 'R'; // R pour Retour
    } else {
        travelDate = reservation.date;
        travelType = 'A'; // A pour Aller
    }

    // Assembler la chaîne de caractères finale avec le séparateur '|'
    const qrString = [
        bookingNumber,
        travelDate,
        mainPassengerName,
        totalPassengers,
        travelType
    ].join('|');

    console.log(`✅ Chaîne de caractères pour le QR Code (${travelType}) générée :`, qrString);
    
    return qrString;
},

// ✅ 2. FONCTION DE DÉCODAGE (MISE À JOUR POUR LE NOUVEAU FORMAT)
decodeQRCodeData(qrString) {
    try {
        const parts = qrString.split('|');
        
        // Vérifier si le format est correct (5 parties)
        if (parts.length === 5) {
            return {
                valid: true,
                version: "3.0", // Nouvelle version personnalisée
                bookingNumber: parts[0],
                travelDate: parts[1],
                mainPassengerName: parts[2],
                totalPassengers: parseInt(parts[3]),
                travelType: parts[4] === 'A' ? 'Aller' : 'Retour'
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


// DANS app.js, à ajouter avec les autres fonctions utilitaires

function startFrontendCountdown() {
    // S'assurer qu'aucun autre minuteur ne tourne
    if (frontendCountdownInterval) {
        clearInterval(frontendCountdownInterval);
    }

    const timerElement = document.getElementById('payment-countdown-timer');
    const containerElement = document.getElementById('payment-countdown-container');

    if (!timerElement || !containerElement?.dataset.deadline) return;

    const deadline = new Date(containerElement.dataset.deadline);

    frontendCountdownInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = deadline - now;

        if (timeLeft <= 0) {
            clearInterval(frontendCountdownInterval);
            timerElement.textContent = "EXPIRÉ";
            containerElement.style.color = "#f44336"; // Rouge
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
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

// DANS app.js, REMPLACEZ la fonction removeBookingFromLocalHistory

async function removeBookingFromLocalHistory(bookingNumber) {
    // Appel à la nouvelle modale personnalisée
    const confirmed = await showCustomConfirm({
        title: "Retirer la réservation ?",
        message: `Voulez-vous vraiment retirer la réservation ${bookingNumber} de l'historique de cet appareil ?\n`,
        icon: '🗑️',
        iconClass: 'danger',
        confirmText: 'Oui, retirer',
        confirmClass: 'btn-danger'
    });

    // Si l'utilisateur clique sur "Annuler"
    if (!confirmed) {
        return;
    }
    
    // ✅ CORRECTION : L'accolade en trop a été supprimée ici.
    // Le bloc try...catch est maintenant correctement placé dans la fonction.

    try {
        let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        
        // Filtre la liste pour enlever le numéro de réservation spécifié
        const newHistory = history.filter(bn => bn !== bookingNumber);
        
        // Sauvegarde la nouvelle liste
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(newHistory));
        
        console.log(`🗑️ Réservation ${bookingNumber} retirée de l'historique local.`);
        Utils.showToast("Réservation retirée de l'historique.", "success");
        
        // Rafraîchit l'affichage pour que la carte disparaisse
        displayReservations();

    } catch (e) {
        console.error("Erreur lors de la suppression de l'historique local:", e);
        Utils.showToast("Une erreur est survenue.", "error");
    }
}



// DANS app.js

// Variable pour garder une référence au décompteur
let agencyCountdownInterval = null;

/**
 * Démarre le décompteur dynamique pour l'option de paiement à l'agence.
 */
function startAgencyCountdown() {
    // On nettoie un éventuel ancien décompteur pour éviter les bugs
    if (agencyCountdownInterval) {
        clearInterval(agencyCountdownInterval);
    }

    // On cible les deux éléments HTML à mettre à jour
    const subtitleElement = document.getElementById('agency-payment-subtitle');
    const deadlineInputElement = document.getElementById('agency-deadline');

    // Si les éléments n'existent pas ou s'il n'y a pas de délai, on ne fait rien
    if (!subtitleElement || !deadlineInputElement || !appState.currentReservation?.paymentDeadline) {
        return;
    }

    // ✅ CORRECTION MAJEURE : On calcule la date limite ICI, sans dépendre de appState
    const deadline = new Date(Date.now() + CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000);
    console.log(`⏱️ Décompteur AGENCE démarré. Cible : ${deadline.toISOString()}`);
    

    // On lance la boucle qui se met à jour toutes les secondes
    agencyCountdownInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = deadline - now;

        // Si le temps est écoulé
        if (timeLeft <= 0) {
            clearInterval(agencyCountdownInterval);
            const expiredText = "Délai expiré";
            subtitleElement.textContent = expiredText;
            deadlineInputElement.value = expiredText;
            return;
        }

        // Calcul des heures, minutes et secondes
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        // Formatage des textes pour l'affichage
        const countdownText = `Payez dans les ${hours}h ${minutes.toString().padStart(2, '0')}m`;
        const fullDeadlineText = `Le ${deadline.toLocaleDateString('fr-FR')} à ${deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

        // Mise à jour de l'interface
        subtitleElement.textContent = countdownText;
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
// Dans app.js
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



// DANS app.js, à ajouter avec vos autres fonctions utilitaires

function showCustomConfirm({ title, message, icon = '⚠️', iconClass = 'warning', confirmText = 'Confirmer', cancelText = 'Annuler', confirmClass = 'btn-danger' }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const titleEl = document.getElementById('custom-confirm-title');
        const messageEl = document.getElementById('custom-confirm-message');
        const iconEl = document.getElementById('custom-confirm-icon');
        const okBtn = document.getElementById('custom-confirm-ok-btn');
        const cancelBtn = document.getElementById('custom-confirm-cancel-btn');

        titleEl.textContent = title;
        messageEl.textContent = message;
        iconEl.textContent = icon;
        iconEl.className = `custom-modal-icon ${iconClass}`;
        okBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;
        
        // Appliquer la classe de style au bouton de confirmation
        okBtn.className = `btn ${confirmClass}`;

        modal.style.display = 'flex';

        const close = (result) => {
            modal.style.display = 'none';
            // Nettoyer les écouteurs d'événements pour éviter les fuites de mémoire
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(result);
        };

        okBtn.onclick = () => close(true);
        cancelBtn.onclick = () => close(false);
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
    
    const paymentMethod = reservation.paymentMethod;
    const isAgencyPayment = paymentMethod === 'AGENCY';

    const merchantNumber = paymentMethod === 'MTN' 
        ? CONFIG.MTN_MERCHANT_NUMBER 
        : CONFIG.AIRTEL_MERCHANT_NUMBER;
    
    const ussdCode = paymentMethod === 'MTN' ? '*555#' : '*130#';
    const deadline = new Date(reservation.paymentDeadline);
    const amount = reservation.totalPriceNumeric;

    // --- Contenus conditionnels ---
    let paymentDetailsContent = '';
    let paymentStepsContent = '';

    if (isAgencyPayment) {
        paymentDetailsContent = `
            <div class="detail-row">
                <span class="detail-label">🏢 Agence de paiement</span>
                <div style="font-weight: 700; color: var(--color-text-primary);">
                    ${reservation.agency.name}<br>
                    <small style="font-weight: 400; color: var(--color-text-secondary);">${reservation.agency.address}</small>
                </div>
            </div>
        `;
    } else { // Mobile Money
        paymentDetailsContent = `
            <div class="detail-row">
                <span class="detail-label">📞 Votre numéro ${paymentMethod}</span>
                <span class="detail-value highlight">${reservation.customerPhone}</span>
                <div class="detail-warning">⚠️ Utilisez CE numéro pour effectuer le paiement</div>
            </div>
            <div class="detail-row">
                <span class="detail-label">📞 Numéro marchand ${paymentMethod}</span>
                <span class="detail-value highlight">${merchantNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">🔖 Référence (IMPORTANT)</span>
                <span class="detail-value highlight">${reservation.bookingNumber}</span>
                <div class="detail-warning">⚠️ Inscrivez cette référence dans le message du transfert</div>
            </div>
        `;
        paymentStepsContent = `
            <div class="instruction-steps">
                <h3>📱 Étapes de paiement ${paymentMethod}</h3>
                <ol>
                    <li>Composez <strong>${ussdCode}</strong> sur votre téléphone.</li>
                    <li>Sélectionnez <strong>"Transfert d'argent"</strong>.</li>
                    <li>Entrez le numéro marchand : <strong>${merchantNumber}</strong></li>
                    <li>Montant : <strong>${Utils.formatPrice(amount)} FCFA</strong></li>
                    <li>Message/Référence : <strong>${reservation.bookingNumber}</strong></li>
                    <li>Validez avec votre code PIN.</li>
                </ol>
            </div>
        `;
    }

    // --- Nouvelle section pour la soumission de l'ID de transaction ---
    const transactionSubmissionHTML = `
        <div class="transaction-submission-box">
            <h3>🚀 Étape Finale : Confirmez votre paiement</h3>
            <p>Après avoir reçu le SMS de confirmation de ${paymentMethod}, copiez l'ID de la transaction (souvent appelé "Transaction ID" ou "Ref") et collez-le ici pour accélérer la validation.</p>
            <div class="form-group" style="margin-top: 1rem;">
                <label for="transaction-id-input" style="font-weight: 600;">ID de Transaction</label>
                <input type="text" id="transaction-id-input" class="form-control" placeholder="Collez la référence de la transaction ici">
            </div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="submitTransactionId('${reservation.bookingNumber}')">
                <span style="font-size: 1.2em;">✔</span> J'ai payé, soumettre la référence
            </button>
        </div>
    `;

    // --- Template HTML final ---
    const instructionsHTML = `
        <div class="payment-instructions-card">
            <div class="instruction-header">
                <div class="instruction-icon">${isAgencyPayment ? '🏢' : '📱'}</div>
                <div>
                    <h2 class="instruction-title">Paiement ${isAgencyPayment ? 'à l\'agence' : `${paymentMethod} Mobile Money`}</h2>
                    <p class="instruction-subtitle">Finalisez votre réservation en effectuant le paiement</p>
                </div>
            </div>
            
            <div class="booking-reference">
                <div class="reference-label">Numéro de réservation</div>
                <div class="reference-number">${reservation.bookingNumber}</div>
            </div>
            
            <div class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">💰 Montant à payer</span>
                    <span class="detail-value primary">${Utils.formatPrice(amount)} FCFA</span>
                </div>
                ${paymentDetailsContent}
                <div class="detail-row">
                    <span class="detail-label">⏰ Date limite de paiement</span>
                    <span class="detail-value">${deadline.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                    <div id="payment-countdown-container" class="detail-warning" data-deadline="${deadline.toISOString()}">
                        Temps restant : <span id="payment-countdown-timer" style="font-weight: bold; font-family: monospace; font-size: 1.1em;">Calcul...</span>
                    </div>
                </div>
            </div>
            
            ${paymentStepsContent}
            
            ${!isAgencyPayment ? transactionSubmissionHTML : ''}
            
            <div class="deadline-warning">
                <div class="warning-icon">⚠️</div>
                <div>
                    <strong>Important : Délai de paiement</strong>
                    <p>Cette réservation sera <strong>automatiquement annulée</strong> si le paiement n'est pas effectué avant le <strong>${deadline.toLocaleDateString('fr-FR')} à ${deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
                </div>
            </div>
            
            <div class="action-buttons">
                ${!isAgencyPayment ? `<button class="btn btn-primary" onclick="checkPaymentStatus('${reservation.bookingNumber}')"><span>🔄</span> Vérifier le statut du paiement</button>` : ''}
                <button class="btn btn-secondary" onclick="showPage('home')"><span>🏠</span> Retour à l'accueil</button>
            </div>
        </div>
    `;
    
    const instructionsPage = document.getElementById('payment-instructions-page');
    if (!instructionsPage) {
        console.error('❌ Élément #payment-instructions-page introuvable dans le HTML');
        return;
    }
    
    instructionsPage.innerHTML = instructionsHTML;
    showPage('payment-instructions');
    
    startFrontendCountdown();
    
    appState.currentReservation = reservation;
}




// DANS app.js, à ajouter avec vos autres fonctions

async function submitTransactionId(bookingNumber) {
    const transactionIdInput = document.getElementById('transaction-id-input');
    const transactionId = transactionIdInput.value.trim();

    if (!transactionId) {
        Utils.showToast("Veuillez saisir l'ID de la transaction.", "warning");
        return;
    }

    Utils.showToast("Envoi de votre référence...", "info");

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}/transaction-id`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: transactionId })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erreur lors de la soumission.');
        }

        Utils.showToast("Référence reçue ! Notre équipe va vérifier votre paiement.", 'success');
        // On peut désactiver le champ et le bouton pour éviter une double soumission
        transactionIdInput.disabled = true;
        document.querySelector('.transaction-submission-box button').disabled = true;

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
    console.log(`🔍 Vérification du statut pour : ${bookingNumber}`);
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/check/${bookingNumber}`);
        const data = await response.json();
        
        if (!data.success) {
            Utils.showToast('Réservation introuvable', 'error');
            return;
        }
        
        console.log('📊 Statut actuel :', data.status);
        
        if (data.status === 'Confirmé') {
            // ✅ PAIEMENT VALIDÉ PAR L'ADMIN
            Utils.showToast('✅ Paiement confirmé ! Redirection vers votre billet...', 'success');
            
            // Récupérer la réservation complète depuis le backend
            const reservationResponse = await fetch(`${API_CONFIG.baseUrl}/api/reservations/${bookingNumber}`);
            const reservationData = await reservationResponse.json();
            
            if (reservationData.success) {
                appState.currentReservation = reservationData.reservation;
                appState.currentReservation.status = 'Confirmé';
                
                // ✅ AFFICHER LA PAGE DE CONFIRMATION (avec QR code + téléchargement)
                displayConfirmation(appState.currentReservation);
                showPage('confirmation');
            }
            
        } else if (data.status === 'En attente de paiement') {
            Utils.showToast('⏳ Paiement en cours de vérification. Veuillez patienter...', 'info');
        } else if (data.status === 'Annulé' || data.status === 'Expiré') {
            Utils.showToast(`❌ Cette réservation a été ${data.status.toLowerCase()}.`, 'error');
        } else {
            Utils.showToast(`Statut actuel : ${data.status}`, 'info');
        }
        
    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        Utils.showToast('Erreur lors de la vérification. Réessayez dans quelques instants.', 'error');
    }
};


// Dans app.js
// Dans app.js
// DANS app.js, REMPLACEZ la fonction generateTicketPDF par celle-ci

async function generateTicketPDF(reservation, isReturn = false) {
    try {
        const qrDataString = Utils.generateQRCodeData(reservation, isReturn);
        const qrCodeBase64 = await Utils.generateQRCodeBase64(qrDataString, 150);
        
        // --- 1. SÉLECTION DES BONNES DONNÉES (ALLER OU RETOUR) ---
        const route = isReturn ? reservation.returnRoute : reservation.route;
        const date = isReturn ? reservation.returnDate : reservation.date;
        const seats = isReturn ? reservation.returnSeats : reservation.seats;
        
        const busIdentifier = route.busIdentifier || route.trackerId || 'N/A';
        const ticketType = isReturn ? 'BILLET RETOUR' : 'BILLET ALLER';

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
        
        let stopsHTML = '';
        if (route.stops && route.stops.length > 0) {
            stopsHTML = `
                <div class="passengers-section">
                    <div class="passengers-title" style="border-color: #ffc107;">🛑 Arrêts Prévus</div>
                    <div class="passenger-list">
                        ${route.stops.map(stop => `
                            <div class="item">
                                <span class="passenger-name">${stop.city}</span>
                                <span style="color: var(--text-light); font-size: 12px;">Arrêt de ${stop.duration} (Arrivée: ${stop.arrivalTime})</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        let connectionsHTML = '';
        if (route.connections && route.connections.length > 0) {
            connectionsHTML = `
                <div class="passengers-section">
                    <div class="passengers-title" style="border-color: #ef5350;">🔄 Correspondances</div>
                    <div class="passenger-list">
                        ${route.connections.map(conn => `
                            <div class="item">
                                <span class="passenger-name">À ${conn.at} (attente ${conn.waitTime})</span>
                                <span style="color: var(--text-light); font-size: 12px;">Prochain bus: ${conn.nextCompany} N°${conn.nextBusNumber || '?'} à ${conn.nextDeparture}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // --- 3. TEMPLATE HTML COMPLET ---
        const ticketHTML = `
            <!DOCTYPE html>
            <html lang="fr">
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
                    .payment-warning { display: flex; gap: 15px; background-color: #fff3e0; border: 1px solid #ffe0b2; padding: 15px; border-radius: 8px; margin-bottom: 20px; align-items: center; }
                    .warning-icon { font-size: 24px; }
                    .warning-text strong { display: block; font-size: 14px; color: #e65100; margin-bottom: 4px; }
                    .warning-text span { font-size: 12px; color: #ef6c00; }
                    .route-info { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 25px; }
                    .route-point { flex: 1; }
                    .route-point .city { font-size: 24px; font-weight: 700; }
                    .route-point .location-detail { font-size: 13px; font-weight: 600; color: var(--text-light); margin-top: 4px; }
                    .route-point .time { font-size: 20px; font-weight: 500; color: var(--text-light); margin-top: 8px; }
                    .route-arrow { font-size: 24px; color: var(--primary-color); padding: 0 20px; margin-top: 20px; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-bottom: 25px; }
                    .detail-item .detail-label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
                    .detail-item .detail-value { font-size: 15px; font-weight: 600; }
                    .passengers-section { margin-bottom: 25px; }
                    .passengers-title { font-size: 14px; font-weight: 700; border-bottom: 2px solid var(--primary-color); padding-bottom: 5px; margin-bottom: 10px; display: inline-block; }
                    .passenger-list .item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee; }
                    .passenger-list .item:last-child { border-bottom: none; }
                    .passenger-name { font-weight: 600; }
                    .seat-number { background-color: var(--bg-light); padding: 2px 8px; border-radius: 4px; font-weight: 700; }
                    .ticket-footer { text-align: center; font-size: 11px; color: #999; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px; }
                    .stub-qr-code { background: white; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
                    .stub-qr-code img { display: block; }
                    .stub-label { font-size: 10px; text-transform: uppercase; color: #aaa; margin-bottom: 5px; }
                    .stub-value { font-size: 14px; font-weight: 700; margin-bottom: 15px; word-break: break-all; }
                    .stub-value.booking-no { font-family: 'JetBrains Mono', monospace; font-size: 18px; color: var(--primary-color); }
                    @media print { body { padding: 0; background: white; } .ticket-container { width: 100%; box-shadow: none; border-radius: 0; } }
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
                            <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${Utils.formatDate(date)}</div></div>
                            <div class="detail-item"><div class="detail-label">Durée</div><div class="detail-value">${route.duration || 'N/A'}</div></div>
                            <div class="detail-item"><div class="detail-label">Compagnie</div><div class="detail-value">${route.company}</div></div>
                            <div class="detail-item"><div class="detail-label">Bus N°</div><div class="detail-value">${busIdentifier}</div></div>
                        </div>
                        <div class="passengers-section">
                            <div class="passengers-title">Passager(s)</div>
                            <div class="passenger-list">
                                ${reservation.passengers.map((p, i) => `
                                    <div class="item">
                                        <span class="passenger-name">${p.name}</span>
                                        <span class="seat-number">Siège ${seats[i]}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${stopsHTML}
                        ${connectionsHTML}
                        <div class="ticket-footer">
                            Présentez-vous 30 minutes avant le départ.
                        </div>
                    </div>
                    <div class="ticket-stub">
                        <div class="stub-qr-code"><img src="${qrCodeBase64}"></div>
                        <div class="stub-label">Réservation</div>
                        <div class="stub-value booking-no">${reservation.bookingNumber}</div>
                        <div class="stub-label">Passager</div>
                        <div class="stub-value">${reservation.passengers[0].name}</div>
                        <div class="stub-label">Total Payé</div>
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

                 // --- ✅ CORRECTION : AJOUT DE LA LOGIQUE DU DÉCOMPTEUR ---
            
            // Si l'utilisateur sélectionne "Paiement à l'agence", on démarre le décompteur.
            if (radio.value === 'agency' && radio.checked) {
                startAgencyCountdown();
            } 
            // Sinon (s'il choisit MTN ou Airtel), on arrête le décompteur.
            else {
                stopAgencyCountdown();
            }
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

    resetBookingState();
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
    activeFilters = {
        company: 'all',
        tripType: 'all',
        priceRange: { min: 0, max: 100000 },
        departureTime: 'all',
        amenities: [],
        sortBy: 'departure',
                // ✅ AJOUTER CETTE LIGNE
        departureLocation: 'all'
    
    

    };

     // ✅ AJOUTER CETTE LIGNE
    const locationSelect = document.getElementById('filter-departure-location');
    if (locationSelect) locationSelect.value = 'all';

    
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
// DANS app.js, REMPLACEZ la fonction displayResults

function displayResults(results, isReturn = false) {
    const summary = document.getElementById("search-summary");
    const resultsList = document.getElementById("results-list");
    const legendContainer = document.getElementById("amenities-legend");
    const locationFilterSection = document.getElementById('departure-location-filter-section');
    const locationSelect = document.getElementById('filter-departure-location');

    // 1. Appliquer les filtres pour obtenir la liste à afficher
    // Si 'results' est déjà une liste filtrée, applyFiltersAndSort ne la modifiera pas.
    // Si c'est la liste de base, elle sera filtrée.
    const displayedResults = applyFiltersAndSort();
    
    // 2. Mettre à jour le résumé de la recherche
    const summaryText = isReturn
        ? `Sélectionnez votre <strong>RETOUR</strong> : <strong>${appState.currentSearch.destination}</strong> → <strong>${appState.currentSearch.origin}</strong> (${displayedResults.length} résultat(s))`
        : `Sélectionnez votre <strong>ALLER</strong> : <strong>${appState.currentSearch.origin}</strong> → <strong>${appState.currentSearch.destination}</strong> (${displayedResults.length} résultat(s))`;
    if(summary) summary.innerHTML = summaryText;

    // 3. Peuplage dynamique du filtre par lieu de départ
    if (locationFilterSection && locationSelect) {
        const uniqueLocations = [...new Set(appState.currentResults.map(r => r.departureLocation).filter(Boolean))];
        
        if (uniqueLocations.length > 1) {
            locationSelect.innerHTML = '<option value="all">Tous les lieux de départ</option>';
            uniqueLocations.forEach(location => {
                const isSelected = activeFilters.departureLocation === location ? 'selected' : '';
                locationSelect.innerHTML += `<option value="${location}" ${isSelected}>${location}</option>`;
            });
            locationFilterSection.style.display = 'block';
        } else {
            locationFilterSection.style.display = 'none';
        }
    }

    // 4. Logique d'attribution des badges "Moins Cher" et "Plus Rapide"
    let cheapestId = null;
    let fastestId = null;

    if (displayedResults.length > 1) {
        // Trouver le moins cher parmi les résultats affichés
        const minPrice = Math.min(...displayedResults.map(r => r.price));
        const cheapestRoute = displayedResults.find(r => r.price === minPrice);
        if (cheapestRoute) cheapestId = cheapestRoute.id;

        // Trouver le plus rapide (parmi les trajets directs affichés)
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

    // 5. Affichage final des résultats
    if (displayedResults.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 48px;">
                <h3>Aucun trajet ne correspond à vos filtres</h3>
                <p>Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.</p>
                <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 16px;">Réinitialiser les filtres</button>
            </div>
        `;
        return;
    }

    resultsList.innerHTML = displayedResults.map(route => {
        let badgeHTML = '';

        // Priorité 1: Le badge personnalisé de l'admin
        if (route.highlightBadge) {
            badgeHTML = `<div class="highlight-badge">${route.highlightBadge}</div>`;
        } 
        // Priorité 2: Les badges automatiques (un seul par carte max)
        else if (route.id === cheapestId) {
            badgeHTML = `<div class="highlight-badge cheapest">💰 Le Moins Cher</div>`;
        } else if (route.id === fastestId) {
            badgeHTML = `<div class="highlight-badge fastest">🚀 Le Plus Rapide</div>`;
        }

        const amenitiesHTML = route.amenities.map(amenity => `<div class="amenity-item" title="${amenity}">${Utils.getAmenityIcon(amenity)}</div>`).join("");
        const departureLocationHTML = route.departureLocation ? `<div class="bus-card-location">📍 Départ : ${route.departureLocation}</div>` : '';
        
        let tripDetailsHTML = '';
        if(route.tripType === "direct") { /* ... */ }
        else if (route.stops && route.stops.length > 0) { /* ... */ }

        return `
            <div class="bus-card" style="position: relative;"> <!-- Important: position: relative -->
                ${badgeHTML}
                <div class="bus-card-main">
                    <div class="bus-card-time">
                        <span>${route.departure}</span>
                        <div class="bus-card-duration">
                            <span>→</span><br>
                            ${route.duration || 'N/A'}
                        </div>
                        <span>${route.arrival}</span>
                    </div>
                    ${departureLocationHTML}
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

    // La légende des équipements
    if (legendContainer) {
        const amenityLabels = { wifi: "Wi-Fi", wc: "Toilettes", prise: "Prises", clim: "Climatisation", pause: "Pause", direct: "Direct" };
        let legendHTML = "";
        for (const [key, label] of Object.entries(amenityLabels)) {
            legendHTML += `<div class="legend-amenity">${Utils.getAmenityIcon(key)}<span>${label}</span></div>`;
        }
        legendContainer.innerHTML = legendHTML;
    }
}
// Dans app.js
window.selectBus = async function(busId) {
    console.log('🚌 Sélection du bus ID :', busId);
    
    const selectedRoute = appState.currentResults.find(r => r.id === busId.toString());
    if (!selectedRoute) {
        Utils.showToast('Erreur : voyage introuvable.', 'error');
        return;
    }

    if (appState.isSelectingReturn) {
        // --- ÉTAPE 2 : SÉLECTION DU BUS RETOUR ---
        appState.selectedReturnBus = selectedRoute;
        appState.selectedReturnSeats = []; // Réinitialiser les sièges retour
        
        Utils.showToast("Sélectionnez vos sièges pour le retour", "info");
        await loadRealSeats();
        displaySeats();
        showPage("seats");
        
    } else {
        // --- ÉTAPE 1 : SÉLECTION DU BUS ALLER ---
        appState.selectedBus = selectedRoute;
        appState.selectedSeats = [];
        
        Utils.showToast("Sélectionnez vos sièges pour l'aller", "info");
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
// DANS app.js, REMPLACEZ la fonction displaySeats par celle-ci

function displaySeats() {
    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    const currentOccupied = appState.isSelectingReturn ? appState.occupiedReturnSeats : appState.occupiedSeats;
    
    const busInfo = document.getElementById("bus-info");
    const seatGrid = document.getElementById("pro-seat-grid");
    const occupancyInfo = document.getElementById("trip-occupancy-info");
    
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
    
    // ✅ LOGIQUE D'AFFICHAGE DE L'OCCUPATION CORRIGÉE
    (async () => {
        try {
            if (occupancyInfo) {
                const totalSeats = currentBus.totalSeats;
                // On utilise 'currentSeats' qui pointe vers la bonne variable (aller ou retour)
                const availableSeats = currentBus.availableSeats - currentSeats.length;

                if (totalSeats && availableSeats >= 0) {
                    const occupiedSeats = totalSeats - availableSeats;
                    let message = `👨‍👩‍👧‍👦 <strong>${occupiedSeats}</strong> voyageurs à bord`;
                    let seatsLeftMessage = `💺 <strong>${availableSeats}</strong> sièges restants`;

                    if (availableSeats < 10) {
                        seatsLeftMessage = `<span class="danger">🔥 <strong>${availableSeats}</strong> sièges restants !</span>`;
                    }

                    occupancyInfo.innerHTML = `<span>${message}</span> | <span>${seatsLeftMessage}</span>`;
                    occupancyInfo.style.display = 'flex';
                } else {
                    occupancyInfo.style.display = 'none';
                }
            }
        } catch (e) {
            console.error("Erreur affichage occupation:", e);
            if (occupancyInfo) occupancyInfo.style.display = 'none';
        }
    })();


    // --- Le reste de la fonction pour générer la grille de sièges est inchangé ---
    const totalSeats = currentBus.totalSeats || CONFIG.SEAT_TOTAL;
    const hasWC = currentBus.amenities.includes("wc");
    const seatsPerRow = 4;
    const backRowSeatsCount = 5;
    
    let mainRows = Math.floor((totalSeats - backRowSeatsCount) / seatsPerRow);
    if ((totalSeats - backRowSeatsCount) % seatsPerRow !== 0) {
        mainRows++;
    }

    let seatHTML = `
        <div class="modern-bus-container">
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
        
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `A${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `B${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        
        seatHTML += `<div class="aisle-space"><div class="aisle-line"></div></div>`;
        
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `C${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        if (seatNumber <= seatsInMainRows) seatHTML += generateModernSeat(seatNumber++, `D${row}`, currentSeats, currentOccupied); else seatHTML += '<div class="modern-seat empty"></div>';
        
        seatHTML += `<div class="row-indicator">${row}</div></div>`;
    }
    
    seatHTML += `</div>`;
    
    if (hasWC) {
        seatHTML += `
            <div class="toilet-section">
                <div class="toilet-icon">🚻</div>
                <span class="toilet-label">Toilettes</span>
            </div>
        `;
    }
    
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

// Dans app.js
window.proceedToPassengerInfo = async function() {
    const expectedSeats = appState.passengerCounts.adults + appState.passengerCounts.children;
    
    // CAS 1 : On vient de finir la sélection des sièges ALLER d'un aller-retour
    if (appState.currentSearch.tripType === "round-trip" && !appState.isSelectingReturn) {
        if (appState.selectedSeats.length !== expectedSeats) {
            Utils.showToast(`Veuillez sélectionner ${expectedSeats} siège(s) pour l'ALLER`, 'error');
            return;
        }
        
        appState.isSelectingReturn = true; // On passe en mode sélection RETOUR
        
        Utils.showToast('Sélectionnez maintenant votre bus de RETOUR', 'info');
        await searchReturnTrips(); // Affiche la liste des bus pour le retour
        return; // On s'arrête ici, l'utilisateur doit choisir son bus retour
    }
    
    // CAS 2 : On vient de finir la sélection des sièges RETOUR (ou c'est un aller simple)
    if (appState.isSelectingReturn) { // S'applique au retour d'un A/R
        if (appState.selectedReturnSeats.length !== expectedSeats) {
            Utils.showToast(`Veuillez sélectionner ${expectedSeats} siège(s) pour le RETOUR`, 'error');
            return;
        }
    } else { // S'applique à l'aller simple
        if (appState.selectedSeats.length !== expectedSeats) {
            Utils.showToast(`Veuillez sélectionner ${expectedSeats} siège(s)`, 'error');
            return;
        }
    }
    
    // Si toutes les sélections sont faites, on passe au formulaire passagers
    displayPassengerForms();
    showPage("passengers");
};
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

    const summaryContainer = document.getElementById("booking-summary");
    if (!summaryContainer) {
        console.error("❌ Élément #booking-summary introuvable.");
        return;
    }

    if (!appState.selectedBus || !appState.currentSearch || !appState.passengerInfo) {
        Utils.showToast("Une erreur critique est survenue. Veuillez recommencer.", "error");
        showPage('home');
        return;
    }

    // --- Calcul du prix (centralisé) ---
    const priceDetails = Utils.calculateTotalPrice(appState);
    const finalTotalPrice = priceDetails.total;
    const totalTicketsPrice = priceDetails.tickets + priceDetails.returnTickets;

    // --- Construction du récapitulatif HTML (amélioré) ---
    let summaryHTML = `
        <div class="detail-row"><span>Itinéraire Aller:</span><strong>${appState.selectedBus.from || 'N/A'} → ${appState.selectedBus.to || 'N/A'}</strong></div>
        <div class="detail-row"><span>Date Aller:</span><strong>${Utils.formatDate(appState.currentSearch.date)}</strong></div>
    `;
    if (appState.currentSearch.tripType === "round-trip" && appState.selectedReturnBus) {
        summaryHTML += `
            <div class="detail-row"><span>Itinéraire Retour:</span><strong>${appState.selectedReturnBus.from || 'N/A'} → ${appState.selectedReturnBus.to || 'N/A'}</strong></div>
            <div class="detail-row"><span>Date Retour:</span><strong>${Utils.formatDate(appState.currentSearch.returnDate)}</strong></div>
        `;
    }
    summaryHTML += `
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row"><span>Prix des billets:</span><strong>${Utils.formatPrice(totalTicketsPrice)} FCFA</strong></div>
        <div class="detail-row"><span>Frais de bagages:</span><strong>+ ${Utils.formatPrice(priceDetails.baggage)} FCFA</strong></div>
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row total-row"><span>PRIX TOTAL:</span><strong>${Utils.formatPrice(finalTotalPrice)} FCFA</strong></div>
    `;
    summaryContainer.innerHTML = summaryHTML;

    // --- Mise à jour des champs de paiement ---
    const amountStr = `${Utils.formatPrice(finalTotalPrice)} FCFA`;
    ['mtn', 'airtel', 'agency'].forEach(method => {
        const amountInput = document.getElementById(`${method}-amount`);
        if (amountInput) amountInput.value = amountStr;
    });

    // ✅ NOUVELLE LOGIQUE : Afficher l'indicateur d'urgence
    const urgencyBox = document.getElementById('urgency-box');
    (async () => {
        if (!urgencyBox) return;
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/api/trips/${appState.selectedBus.id}/seats`);
            const seatData = await response.json();

            if (seatData.success) {
                const availableSeats = seatData.availableSeats;
                let seatsLeftHTML = `<span class="urgency-value">${availableSeats}</span>`;
                if (availableSeats < 10) {
                    seatsLeftHTML = `<span class="urgency-value danger">🔥 ${availableSeats}</span>`;
                }
                
                urgencyBox.innerHTML = `
                    <div class="urgency-item">
                        <span class="urgency-label">Places restantes</span>
                        ${seatsLeftHTML}
                    </div>
                    <div class="urgency-item">
                        <span class="urgency-label">Votre réservation expire dans</span>
                        <span id="payment-countdown-timer-box" class="urgency-value">--:--</span>
                    </div>
                `;
                urgencyBox.style.display = 'grid';
                startUrgencyCountdown(); // Lance le minuteur
            } else {
                 urgencyBox.style.display = 'none';
            }
        } catch (e) {
            console.error("Erreur affichage urgence:", e);
            urgencyBox.style.display = 'none';
        }
    })();
    
    // --- GESTION DYNAMIQUE DU PAIEMENT À L'AGENCE (inchangée) ---
    const agencyOption = document.getElementById('agency-payment-option');
    if (agencyOption) {
        if (canPayAtAgency()) {
            agencyOption.style.opacity = '1';
            // ... (logique existante correcte)
        } else {
            agencyOption.style.opacity = '0.5';
            // ... (logique existante correcte)
        }
    }
    
    console.log("✅ Récapitulatif affiché et mis à jour avec succès.");

    startAgencyCountdown();
}
// DANS app.js, REMPLACEZ la fonction confirmBooking

window.confirmBooking = async function(buttonElement) {
    console.group('💳 DÉBUT PROCESSUS DE RÉSERVATION');
    
    // ... (le début de la fonction : showLoading, etc. reste inchangé) ...
    const originalButtonText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    const showLoading = (message) => { buttonElement.innerHTML = `
            <span style="display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;"></span>
            <span style="margin-left: 10px;">${message}</span>
        `; };
    showLoading('Création de la réservation...');

    try {
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!paymentMethod) throw new Error('Veuillez sélectionner un mode de paiement.');

        let customerPhone;
        // ... (logique pour récupérer customerPhone inchangée) ...
        const phoneInputId = `${paymentMethod}-phone`;
        const phoneInput = document.getElementById(phoneInputId);
        if (paymentMethod === 'agency') {
            customerPhone = appState.passengerInfo[0]?.phone || '';
        } else {
            customerPhone = phoneInput ? phoneInput.value.trim() : '';
        }
        if (!customerPhone || !Utils.validatePhone(customerPhone)) {
            throw new Error(`Numéro de téléphone ${paymentMethod.toUpperCase()} invalide ou manquant.`);
        }

        // ✅ CORRECTION : Utilisation de la nouvelle fonction de calcul
        const priceDetails = Utils.calculateTotalPrice(appState);
        const finalTotalPriceNumeric = priceDetails.total;
        
        if (finalTotalPriceNumeric <= 0) {
            throw new Error("Erreur de calcul du prix. Le total ne peut pas être zéro.");
        }

        const bookingNumber = Utils.generateBookingNumber();
        let paymentDeadline;
        // ... (logique du délai de paiement inchangée) ...
        if (paymentMethod === 'agency') {
            if (!canPayAtAgency()) throw new Error("Paiement en agence non disponible (délai insuffisant).");
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
            // ✅ CORRECTION : Utilisation du prix total calculé
            totalPrice: `${Utils.formatPrice(finalTotalPriceNumeric)} FCFA`,
            totalPriceNumeric: finalTotalPriceNumeric,
            paymentMethod: paymentMethod.toUpperCase(),
            busIdentifier: appState.selectedBus.busIdentifier || appState.selectedBus.trackerId,
            createdAt: new Date().toISOString(),
            status: 'En attente de paiement',
            customerPhone: customerPhone,
            paymentDeadline: paymentDeadline
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

        const savedReservation = await saveReservationToBackend(reservation);
        
        if (savedReservation && savedReservation.success) {
            appState.currentReservation = reservation;
            displayPaymentInstructions(reservation);
            Utils.showToast('✅ Réservation enregistrée !', 'success');
        } else {
            throw new Error(savedReservation?.error || "La sauvegarde a échoué.");
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

// DANS app.js, REMPLACEZ l'ancienne fonction displayConfirmation par celle-ci

async function displayConfirmation(reservation) {
    console.log("🎟️ Affichage de la confirmation pour:", reservation.bookingNumber);

    // --- Cible les conteneurs principaux ---
    const outboundSection = document.getElementById('outbound-ticket-section');
    const returnSection = document.getElementById('return-ticket-section');
    const actionsContainer = document.getElementById('confirmation-actions-container');

    // --- Nettoyage initial pour éviter les duplications ---
    outboundSection.innerHTML = '';
    returnSection.innerHTML = '';
    returnSection.style.display = 'none';
    actionsContainer.innerHTML = '';
    
    // Nettoie les anciens messages d'avertissement de paiement
    const oldWarnings = document.querySelectorAll('.info-card-warning.payment-notice');
    oldWarnings.forEach(el => el.remove());

    // --- Mise à jour des titres et du numéro de réservation commun ---
    const confirmationTitle = document.querySelector('#confirmation-page .confirmation-title');
    const confirmationSubtitle = document.querySelector('#confirmation-page .confirmation-subtitle');
    const bookingNumberDisplay = document.getElementById('booking-number-display');
    const statusBadge = document.querySelector('#confirmation-page .status-badge');

    bookingNumberDisplay.textContent = reservation.bookingNumber;

    // --- Fonction helper pour générer le HTML d'un billet (Aller ou Retour) ---
    const createTicketHTML = async (tripData, isReturn = false) => {
        const qrDataString = Utils.generateQRCodeData(reservation, isReturn);
        // On attend que la promesse du QR code soit résolue
        const qrCodeBase64 = await Utils.generateQRCodeBase64(qrDataString, 150).catch(err => {
            console.error("Erreur génération QR Code:", err);
            return ''; // Retourne une chaîne vide en cas d'erreur
        });

        const tripTypeLabel = isReturn ? "RETOUR" : "ALLER";
        const route = tripData.route;
        const date = tripData.date;
        const seats = tripData.seats;

        // Sécurité : si une donnée est manquante, on affiche N/A
        const from = route.from || 'N/A';
        const to = route.to || 'N/A';
        const departure = route.departure || '--:--';
        const arrival = route.arrival || '--:--';
        const duration = route.duration || 'N/A';
        const company = route.company || 'N/A';

        return `
            <h2 style="font-family: var(--font-logo); color: var(--color-accent-glow); margin-bottom: 20px; text-align: center; font-size: 1.5rem;">
                Billet ${tripTypeLabel}
            </h2>
            <div class="journey-card">
                <div class="journey-route">
                    <div class="route-point route-origin">
                        <div class="point-icon">📍</div>
                        <div class="point-info">
                            <span class="point-label">Départ</span>
                            <span class="point-city">${from}</span>
                            <span class="point-date">${Utils.formatDate(date)}</span>
                            <span class="point-time">${departure}</span>
                        </div>
                    </div>
                    <div class="route-connector">
                        <div class="connector-line"></div>
                        <div class="connector-icon">🚌</div>
                        <div class="connector-duration">${duration}</div>
                    </div>
                    <div class="route-point route-destination">
                        <div class="point-icon">🏁</div>
                        <div class="point-info">
                            <span class="point-label">Arrivée</span>
                            <span class="point-city">${to}</span>
                            <span class="point-time">${arrival}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div id="confirmation-details" class="details-grid-modern">
                <div class="detail-item-modern"><div class="detail-label">Passagers</div><div class="detail-value">${reservation.passengers.map(p => p.name).join(', ')}</div></div>
                <div class="detail-item-modern"><div class="detail-label">Sièges</div><div class="detail-value">${seats.join(', ')}</div></div>
                <div class="detail-item-modern"><div class="detail-label">Compagnie</div><div class="detail-value">${company}</div></div>
                <div class="detail-item-modern"><div class="detail-label">Montant Total</div><div class="detail-value" style="color: var(--color-accent-glow);">${reservation.totalPrice}</div></div>
            </div>
            <div class="qr-section-modern">
                <div class="qr-container">
                    <div class="qr-code-box" style="padding:15px;"><img src="${qrCodeBase64}" alt="QR Code Billet ${tripTypeLabel}"></div>
                    <div class="qr-info">
                        <p class="qr-title">🎫 Votre billet électronique ${tripTypeLabel}</p>
                        <p class="qr-instruction">Présentez ce QR code à l'embarquement</p>
                    </div>
                </div>
            </div>
        `;
    };

    // --- Logique d'affichage en fonction du statut de la réservation ---
    if (reservation.status === 'En attente de paiement') {
        confirmationTitle.textContent = "Finalisez votre paiement";
        confirmationSubtitle.textContent = "Votre réservation est enregistrée mais en attente";
        statusBadge.className = 'status-badge';
        statusBadge.style.background = '#ff9800';
        statusBadge.innerHTML = `<span class="status-icon">⏳</span><span>En attente</span>`;
        
        // Cacher les sections de billets valides
        outboundSection.style.display = 'none';
        returnSection.style.display = 'none';

        // Afficher des instructions claires
        const cardModern = document.querySelector('.confirmation-card-modern');
        const deadline = new Date(reservation.paymentDeadline).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
        let instructionsHTML = `
            <div class="info-card info-card-warning payment-notice" style="grid-column: 1 / -1; background: rgba(255, 152, 0, 0.1); border-color: #ff9800; margin-bottom: 24px;">
                <div class="info-icon" style="font-size: 40px;">🏢</div>
                <div class="info-content">
                    <h4>Paiement requis</h4>
                    <p>Votre réservation <strong>${reservation.bookingNumber}</strong> est en attente. Veuillez finaliser le paiement avant le <strong>${deadline}</strong> pour la valider.</p>
                    <button class="btn btn-secondary" style="margin-top: 15px; width: auto;" onclick="viewPaymentInstructions('${reservation.bookingNumber}')">
                        Voir les instructions de paiement
                    </button>
                </div>
            </div>`;
        cardModern.insertAdjacentHTML('afterbegin', instructionsHTML);

    } else { // Statut "Confirmé"
        confirmationTitle.textContent = "Réservation confirmée !";
        confirmationSubtitle.textContent = "Votre voyage est prêt. Bon voyage !";
        statusBadge.className = 'status-badge status-confirmed';
        statusBadge.style.background = '';
        statusBadge.innerHTML = `<span class="status-icon">✓</span><span>Confirmé</span>`;

        // Afficher les sections de billets
        outboundSection.style.display = 'block';
        if (reservation.returnRoute) {
            returnSection.style.display = 'block';
        }

        // --- Génération et affichage asynchrone des billets ---
        (async () => {
            // Billet ALLER
            const outboundTicketData = { route: reservation.route, date: reservation.date, seats: reservation.seats };
            outboundSection.innerHTML = await createTicketHTML(outboundTicketData, false);

            // Billet RETOUR (si applicable)
            if (reservation.returnRoute) {
                const returnTicketData = { route: reservation.returnRoute, date: reservation.returnDate, seats: reservation.returnSeats };
                returnSection.innerHTML = await createTicketHTML(returnTicketData, true);
            }

            // --- Génération des boutons d'action ---
            let actionsHTML = `
                <button class="btn-modern btn-download" onclick="downloadTicket(false)">
                    <span class="btn-icon">📥</span>
                    <span class="btn-text">Télécharger Billet Aller</span>
                </button>
            `;
            if (reservation.returnRoute) {
                actionsHTML += `
                    <button class="btn-modern btn-download" onclick="downloadTicket(true)">
                        <span class="btn-icon">📥</span>
                        <span class="btn-text">Télécharger Billet Retour</span>
                    </button>
                `;
            }
             // ✅ ON VÉRIFIE QUE CE BLOC EST BIEN PRÉSENT
        const trackerIdentifier = reservation.route.busIdentifier || reservation.route.trackerId;
        if (trackerIdentifier) {
            actionsHTML += `
                <a class="btn-modern btn-track" href="Suivi/suivi.html?bus=${trackerIdentifier}&booking=${reservation.bookingNumber}">
                    <span class="btn-icon">🛰️</span>
                    <span class="btn-text">Suivre mon bus</span>
                </a>
            `;
            }
            actionsHTML += `
                <button class="btn-modern btn-home" onclick="resetAndGoHome()">
                    <span class="btn-icon">🏠</span>
                    <span class="btn-text">Nouvelle Réservation</span>
                </button>
            `;
            actionsContainer.innerHTML = actionsHTML;
        })();
    }
}
// DANS app.js, AJOUTEZ CETTE FONCTION

// DANS app.js, REMPLACEZ la fonction displayReservations

async function displayReservations() {
    const listContainer = document.getElementById("reservations-list");
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="loading-spinner">Chargement de vos réservations...</div>';

    let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];

    if (history.length === 0) {
        listContainer.innerHTML = `
            <div class="no-results" style="padding: 48px; text-align: center;">
                <h3>Aucune réservation sur cet appareil</h3>
                <p>Vos nouvelles réservations apparaîtront ici automatiquement.</p>
                <button class="btn btn-primary" onclick="showPage('home')" style="margin-top: 16px;">Réserver un voyage</button>
            </div>`;
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/details?ids=${history.join(',')}`);
        if (!response.ok) throw new Error('Erreur réseau lors de la récupération des réservations.');
        
        const data = await response.json();
        if (!data.success || data.reservations.length === 0) {
            listContainer.innerHTML = `<div class="no-results"><h3>Aucune réservation trouvée.</h3></div>`;
            return;
        }
        
        listContainer.innerHTML = data.reservations.map(res => {
            const isConfirmed = res.status === 'Confirmé';
            const isPending = res.status === 'En attente de paiement';
            const isCancelled = res.status === 'Annulé' || res.status === 'Expiré';
            
            let statusHTML = '';
            if (isConfirmed) statusHTML = `<span style="color: var(--color-accent-glow);">✓ Confirmé</span>`;
            else if (isPending) statusHTML = `<span style="color: #ff9800;">⏳ En attente de paiement</span>`;
            else if (isCancelled) statusHTML = `<span style="color: #f44336;">❌ ${res.status}</span>`;
            
            // ✅ On identifie l'ID de suivi du bus
            const trackerIdentifier = res.route.busIdentifier || res.route.trackerId;

            return `
                <div class="reservation-card-pwa">
                    <div class="res-pwa-header">
                        <span class="res-pwa-booking-number">${res.bookingNumber}</span>
                        ${!isPending ? `<button class="btn-delete-local" onclick="removeBookingFromLocalHistory('${res.bookingNumber}')" title="Supprimer de cet appareil">🗑️</button>` : ''}
                        <span class="res-pwa-status">${statusHTML}</span>
                    </div>
                    <div class="res-pwa-body">
                        <h4>${res.route.from} → ${res.route.to}</h4>
                        <p>Le ${Utils.formatDate(res.date)} à ${res.route.departure}</p>
                        <p>${res.passengers.length} passager(s) - Total: ${res.totalPrice}</p>
                    </div>
                    <div class="res-pwa-actions">
                        ${isConfirmed ? `
                            <button class="btn btn-primary" onclick="viewTicket('${res.bookingNumber}')">Voir le Billet</button>
                            
                            <!-- ✅ BOUTON DE SUIVI RÉINTÉGRÉ ICI -->
                            ${trackerIdentifier ? `<a href="Suivi/suivi.html?bus=${trackerIdentifier}&booking=${res.bookingNumber}" class="btn btn-secondary">Suivre le bus</a>` : ''}

                        ` : ''}
                        ${isPending ? `<button class="btn btn-secondary" onclick="viewPaymentInstructions('${res.bookingNumber}')">Voir Instructions</button>` : ''}
                        ${isCancelled ? `<button class="btn btn-primary" onclick="showPage('home')">Faire une nouvelle réservation</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Erreur affichage réservations:", error);
        listContainer.innerHTML = `<div class="no-results error"><h3>Impossible de charger vos réservations.</h3><p>${error.message}</p></div>`;
    }
}



// DANS app.js, AJOUTEZ CES DEUX FONCTIONS

async function viewTicket(bookingNumber) {
    Utils.showToast("Chargement du billet...", "info");
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

if (reservation.route.trackerId) {
    actionsContainer.innerHTML += `
        <a href="Suivi/suivi.html?bus=${reservation.route.trackerId}&booking=${reservation.bookingNumber}" 
           target="_blank" 
           class="btn-modern btn-track">
            <span class="btn-icon">🛰️</span>
            <span class="btn-text">Suivre mon bus en temps réel</span>
        </a>
    `;
}