

// ============================================
// CONFIGURATION ET CONSTANTES
// ============================================

// ✅ Configuration API Backend
// ============================================
// CONFIGURATION ET CONSTANTES
// ============================================


// app.js
const API_CONFIG = {
    baseUrl: 'https://en-bus-app.onrender.com'
};
// Fichier : Frontend/app.js


console.log('API URL:', API_CONFIG.baseUrl);

// DANS app.js, remplacez l'objet CONFIG par ceci

const CONFIG = {
    // --- Valeurs qui restent fixes pour l'instant ---
    MAX_BAGGAGE_PER_PERSON: 5,
    SEAT_TOTAL: 61,
    OCCUPANCY_RATE: { min: 0.3, max: 0.5 },
    STORAGE_KEY: 'enbus_reservations',

    MOBILE_MONEY_PAYMENT_DEADLINE_MINUTES: 30,
    AGENCY_PAYMENT_DEADLINE_HOURS: 10,
    AGENCY_PAYMENT_MIN_HOURS: 12,

    MTN_MERCHANT_NUMBER: '+242 06 150 79 47',
    AIRTEL_MERCHANT_NUMBER: '+242 05 150 79 47',

    SCANNER_FPS: 10,
    SCANNER_QRBOX: 250,

    // --- Valeurs par défaut pour les règles dynamiques ---
    // Celles-ci seront utilisées si l'appel à l'API échoue.
    DEFAULT_CHILD_MAX_AGE: 6,
    DEFAULT_CHILD_PRICING_MODE: 'percentage',
    DEFAULT_CHILD_FIXED_PRICE: 5000,
    DEFAULT_CHILD_DISCOUNT_PERCENTAGE: 50,
};



// ============================================
// 🔥 INITIALISATION DE FIREBASE
// ============================================

// Collez l'objet firebaseConfig que vous avez récupéré à l'étape 1
const firebaseConfig = {
    apiKey: "AIzaSyD-JrXsi5pMyb2qsR2XVxZ7gagmsdyawSk",
    authDomain: "en-bus-app.firebaseapp.com",
    projectId: "en-bus-app",
    storageBucket: "en-bus-app.firebasestorage.app",
    messagingSenderId: "518160239652",
    appId: "1:518160239652:web:e00017bec1bb8034af5cb1",
};

// On initialise Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Variable globale pour stocker l'état de l'utilisateur connecté
let currentUser = null;
// ========================================================
// ✅ NOUVEL OBJET POUR LES RÈGLES DYNAMIQUES
// ========================================================
// Cet objet sera rempli par les données venant du serveur.
let appRules = {
    ticketing: {
        childMaxAge: CONFIG.DEFAULT_CHILD_MAX_AGE,
        childPricingMode: CONFIG.DEFAULT_CHILD_PRICING_MODE,
        childFixedPrice: CONFIG.DEFAULT_CHILD_FIXED_PRICE,
        childDiscountPercentage: CONFIG.DEFAULT_CHILD_DISCOUNT_PERCENTAGE
    }
    // Plus tard, on pourra y ajouter d'autres règles :
    // report: { ... },
    // fees: { ... }
};
// ============================================
// DONNÉES DE L'APPLICATION
// ============================================


const ALL_PERMISSIONS = {
    // ... vos autres permissions
    manage_agencies: "Gérer les agences"
};
// =============================================
// GOOGLE AUTH NATIF
// =============================================

let isNativePlatform = false;
let googleAuthReady = false;

// Vérifie si on est sur mobile natif
if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    isNativePlatform = true;
}

// Initialisation Google Auth pour mobile
async function initGoogleAuth() {
    if (isNativePlatform && window.Capacitor.Plugins.SocialLogin) {
        try {
            await window.Capacitor.Plugins.SocialLogin.initialize({
                google: {
                    webClientId: '518160239652-r8nir369fnkur0id4a51dj4rju1ug754.apps.googleusercontent.com', // ⬅️ Utilise celui-ci (client_type: 3)
                },
            });
            googleAuthReady = true;
            console.log('✅ Google Auth initialisé');
        } catch (error) {
            console.error('❌ Erreur init Google Auth:', error);
        }
    }
}

// Appelle l'initialisation
initGoogleAuth();
// DANS app.js, REMPLACEZ votre fonction signInWithGoogle

// DANS app.js, REMPLACEZ ENTIÈREMENT votre fonction signInWithGoogle
// DANS app.js, REMPLACEZ ENTIÈREMENT votre fonction signInWithGoogle

async function signInWithGoogle() {
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    try {
        let idToken;
        let userInfo;

        if (isNativePlatform && window.Capacitor.Plugins.SocialLogin) {
            // --- Partie NATIVE ---
            console.log('📱 Connexion native Google...');
            if (!googleAuthReady) {
                await initGoogleAuth();
                if (!googleAuthReady) throw new Error("Init Google Auth a échoué.");
            }

            const result = await window.Capacitor.Plugins.SocialLogin.login({ provider: 'google' });

            // =======================================================================
            // ✅ EXTRACTION FINALE BASÉE SUR LES LOGS DE DÉBOGAGE
            // =======================================================================
            const loginData = result.result;
            if (!loginData) {
                throw new Error("La réponse du plugin ne contient pas de sous-objet 'result'.");
            }

            // Extraction de l'idToken
            idToken = loginData.idToken;

            // Extraction des informations de profil
            const profileData = loginData.profile;

            if (typeof idToken !== 'string' || !idToken) {
                throw new Error("L'idToken est manquant ou invalide dans la réponse.");
            }
            if (!profileData || typeof profileData.email !== 'string' || !profileData.email) {
                throw new Error("Les données de profil (surtout l'email) sont manquantes.");
            }

            console.log("🔑 idToken et 👤 Profil extraits avec succès !");

            // On construit notre objet userInfo directement
            userInfo = {
                displayName: profileData.name,
                email: profileData.email,
                uid: profileData.id
            };
            // =======================================================================

        } else {
            // --- Partie WEB (inchangée) ---
            console.log('🌐 Connexion web Google...');
            const webResult = await auth.signInWithPopup(googleProvider);
            const user = webResult.user;
            idToken = await user.getIdToken();
            userInfo = user;
        }

        // --- Le reste du flux vers votre backend est inchangé et fonctionnera ---
        if (!userInfo || !userInfo.email) {
            throw new Error("Impossible de récupérer l'adresse email de l'utilisateur.");
        }

        console.log(`🚀 Infos utilisateur prêtes: ${userInfo.email}. Envoi au backend...`);

        const response = await fetch(`${API_CONFIG.baseUrl}/api/auth/google-signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });

        const responseBody = await response.text();
        if (!response.ok) {
            console.error(`❌ Le backend a rejeté la requête:`, responseBody);
            throw new Error("Échec de la validation du compte sur le serveur.");
        }

        const appData = JSON.parse(responseBody);
        if (appData.success && appData.token) {
            localStorage.setItem('enbus_usertoken', appData.token);
            handleAuthStateChanged(userInfo);
            Utils.showToast(translation.toast_login_success, "success");
        } else {
            throw new Error(appData.error || "Le serveur a refusé la connexion.");
        }

    } catch (error) {
        console.error("❌ Erreur globale de connexion Google:", error.message);
        Utils.showToast(translation.toast_login_failed, "error");
    }
}



async function signOut() {
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    try {
        // Déconnexion Firebase (web)
        await auth.signOut();

        // Déconnexion native (mobile)
        if (isNativePlatform && window.Capacitor.Plugins.SocialLogin) {
            await window.Capacitor.Plugins.SocialLogin.logout({ provider: 'google' });
        }

        localStorage.removeItem('enbus_usertoken');
        currentUser = null;
        updateAuthUI(null);
        Utils.showToast(translation.toast_logout_success, "info");

    } catch (error) {
        console.error("❌ Erreur déconnexion:", error);
    }
}
// DANS app.js (remplacez votre fonction updateAuthUI)

function updateAuthUI(user) {
    const desktopBtn = document.getElementById('auth-button-desktop');
    const mobileLink = document.getElementById('auth-button-mobile');

    // On récupère les traductions au début
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    if (user) {
        // Utilisateur connecté
        // On utilise la clé de traduction pour le message d'accueil
        const welcomeMessage = translation.auth_welcome_message(user.displayName.split(' ')[0]);

        if (desktopBtn) {
            // On utilise la clé de traduction pour le bouton
            desktopBtn.textContent = translation.auth_logout_button;
            desktopBtn.onclick = signOut;
        }
        if (mobileLink) {
            mobileLink.innerHTML = `<span>${welcomeMessage}</span>`;
            // On peut aussi changer l'action pour déconnecter
            mobileLink.onclick = signOut;
        }
    } else {
        // Utilisateur déconnecté
        if (desktopBtn) {
            // On utilise la clé de traduction pour le bouton
            desktopBtn.textContent = translation.auth_login_button;
            desktopBtn.onclick = signInWithGoogle;
        }
        if (mobileLink) {
            // On utilise la clé de traduction pour le lien mobile
            mobileLink.innerHTML = `<span>${translation.auth_login_google}</span>`;
            mobileLink.onclick = signInWithGoogle;
        }
    }
}





/**
 * Écoute les changements d'état d'authentification de Firebase
 */
function handleAuthStateChanged(user) {
    if (user) {
        console.log("✅ Utilisateur Firebase connecté:", user.displayName);
        currentUser = {
            name: user.displayName,
            email: user.email,
            uid: user.uid
        };
    } else {
        console.log("ℹ️ Aucun utilisateur Firebase connecté.");
        currentUser = null;
    }
    updateAuthUI(user);
    // On pourrait rafraîchir la page des réservations ici
    if (document.getElementById('reservations-page').classList.contains('active')) {
        displayReservations();
    }
}

// Lancer l'écouteur au démarrage de l'application
auth.onAuthStateChanged(handleAuthStateChanged);















// ============================================
// 🔔 PUSH + LOCAL NOTIFICATIONS
// ============================================
async function initNotifications() {
    if (!window.Capacitor?.isNativePlatform()) {
        console.log("🌐 Mode Web - Notifications désactivées");
        return;
    }

    const { PushNotifications, LocalNotifications } = Capacitor.Plugins;

    try {
        // LOCAL NOTIFICATIONS
        await LocalNotifications.requestPermissions();
        await LocalNotifications.createChannel({
            id: 'reminders',
            name: 'Rappels de voyage',
            importance: 5,
            sound: 'notification_sound.mp3'
        }).catch(() => { });

        // PUSH NOTIFICATIONS
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive !== 'granted') {
            perm = await PushNotifications.requestPermissions();
        }

        if (perm.receive === 'granted') {
            await PushNotifications.register();
            console.log("✅ Push Notifications activées");
        }

        // Token FCM
        PushNotifications.addListener('registration', (token) => {
            console.log("🔑 Token FCM:", token.value);
            localStorage.setItem('fcm_token', token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error("❌ Erreur Push:", error);
        });

        // ✅ Réception push - Afficher dans status bar même si app ouverte
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log("📩 Push reçue:", notification);

            // Créer une local notification pour afficher dans la status bar
            try {
                await LocalNotifications.schedule({
                    notifications: [{
                        id: Math.floor(Math.random() * 100000),
                        title: notification.title || 'EN-BUS',
                        body: notification.body || '',
                        schedule: { at: new Date(Date.now() + 1000) },
                        channelId: 'reminders',
                        extra: notification.data,
                        smallIcon: 'ic_notification',

                        // ===============================================
                        // ✅ CORRECTION AJOUTÉE ICI
                        // ===============================================
                        // On spécifie explicitement le son à jouer, en plus du canal.
                        // Cela garantit que la notification sera sonore.
                        sound: 'notification_sound.mp3'
                    }]
                });
                console.log("🔔 Notification affichée dans status bar");
            } catch (e) {
                console.warn("⚠️ Erreur affichage notif:", e);
            }
        });

        // Clic sur notification
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log("👆 Push cliquée:", action);
        });

    } catch (error) {
        console.error("❌ Erreur notifications:", error);
    }
}

// Programmer rappels automatiques
async function scheduleReminderNotifications(reservation) {
    if (!window.Capacitor?.isNativePlatform()) return;

    const { LocalNotifications } = Capacitor.Plugins;
    const travelDate = new Date(reservation.date);
    const [hours, minutes] = reservation.route.departure.split(':').map(Number);
    travelDate.setHours(hours, minutes, 0, 0);

    const notifications = [];

    // Rappel J-1 à 20h
    const j1 = new Date(travelDate);
    j1.setDate(j1.getDate() - 1);
    j1.setHours(20, 0, 0, 0);
    if (j1 > new Date()) {
        notifications.push({
            id: Math.floor(Math.random() * 100000),
            title: "Rappel voyage demain",
            body: `${reservation.route.from} vers ${reservation.route.to} a ${reservation.route.departure}`,
            schedule: { at: j1 },
            channelId: 'reminders',
            smallIcon: 'ic_notification',

            // ===============================================
            // ✅ CORRECTION AJOUTÉE ICI
            // ===============================================
            sound: 'notification_sound.mp3'
        });
    }

    // Rappel 2h avant
    const h2 = new Date(travelDate);
    h2.setHours(h2.getHours() - 2);
    if (h2 > new Date()) {
        notifications.push({
            id: Math.floor(Math.random() * 100000),
            title: "Depart dans 2 heures",
            body: `Presentez-vous a la gare`,
            schedule: { at: h2 },
            channelId: 'reminders',
            smallIcon: 'ic_notification',

            // ===============================================
            // ✅ CORRECTION AJOUTÉE ICI
            // ===============================================
            sound: 'notification_sound.mp3'
        });
    }

    if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`📅 ${notifications.length} rappels programmés`);
    }
}

// app.js

async function registerTokenWithBooking(bookingNumber, busId) {
    console.log(`--- [PUSH] Tentative d'enregistrement du token pour la réservation ${bookingNumber} ---`);

    const token = localStorage.getItem('fcm_token');

    if (!token) {
        console.warn(`   -> ⚠️ Token non trouvé dans localStorage. Enregistrement annulé.`);
        return;
    }

    // Assure-toi que APP_CONFIG est bien défini par ton fichier config.js
    const apiUrl = `${APP_CONFIG.API_URL}/api/notifications/register`;
    console.log(`   -> Token trouvé. Envoi vers l'URL : ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, bookingNumber, busId })
        });

        // On vérifie la réponse du serveur
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log(`   -> ✅ Succès ! Le serveur a bien enregistré le token.`);
            } else {
                console.error(`   -> ❌ Erreur côté serveur :`, result.error || "Réponse non détaillée.");
            }
        } else {
            // Si la réponse n'est pas "ok" (ex: erreur 404, 500)
            console.error(`   -> ❌ Échec de l'appel API. Statut: ${response.status}`);
            const errorText = await response.text();
            console.error(`   -> Réponse du serveur : ${errorText}`);
        }

    } catch (error) {
        // Erreur réseau (pas de connexion, etc.)
        console.error("   -> ❌ ERREUR RÉSEAU lors de l'enregistrement du token:", error);
    }
    console.log(`--- [PUSH] Fin du processus d'enregistrement. ---`);
}
// Initialiser au démarrage
document.addEventListener('DOMContentLoaded', initNotifications);

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


let placeholderAnimationStarted = false;
// ============================================
// 📦 ÉTAT GLOBAL DE L'APPLICATION
// ============================================

// --- Variables pour les timers ---
let frontendCountdownInterval = null;
// --- Données dynamiques ---
let allRouteTemplates = []; // Pour les suggestions de la barre de recherche
let allReservations = []; // Pour la page "Mes réservations"
let fuse = null;
let allDestinations = [];
let fuseDestinations = null;



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
    displayedResults: [],

    currentReservation: null,
    // ✅ NOUVELLE PROPRIÉTÉ

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
let refreshPassengerSelectorUI = () => { }; // Variable globale initialisée avec une fonction vide


// ============================================
// UTILITAIRES
// ============================================
const Utils = {
    // DANS app.js, objet Utils

    formatPrice(price) {
        // Sécurité : Si price est null, undefined ou pas un nombre, on met 0
        if (price === undefined || price === null || isNaN(price)) {
            console.warn("⚠️ formatPrice a reçu une valeur invalide:", price);
            return "0";
        }
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


    // ========================================================
    // ✅ AJOUTEZ OU REMPLACEZ LA FONCTION CI-DESSOUS
    // ========================================================
    calculateTotalPrice(state) {
        let totalPrice = 0;
        let ticketsPrice = 0;
        let returnTicketsPrice = 0;
        let baggagePrice = 0;

        // --- 1. Calcul du prix des billets pour le trajet ALLER ---
        if (state.selectedBus && state.selectedSeats?.length > 0) {
            const adultPrice = state.selectedBus.price || 0;
            const childPrice = getChildPrice(adultPrice); // Utilise notre fonction helper

            const numAdults = state.passengerCounts.adults || 0;
            const numSeats = state.selectedSeats.length;

            const adultsSeats = Math.min(numSeats, numAdults);
            const childrenSeats = numSeats - adultsSeats;

            ticketsPrice = (adultsSeats * adultPrice) + (childrenSeats * childPrice);
        }

        // --- 2. Calcul du prix des billets pour le trajet RETOUR ---
        if (state.currentSearch.tripType === "round-trip" && state.selectedReturnBus && state.selectedReturnSeats?.length > 0) {
            const returnAdultPrice = state.selectedReturnBus.price || 0;
            const returnChildPrice = getChildPrice(returnAdultPrice); // Utilise notre fonction helper

            const numAdults = state.passengerCounts.adults || 0;
            const numSeats = state.selectedReturnSeats.length;

            const adultsSeats = Math.min(numSeats, numAdults);
            const childrenSeats = numSeats - adultsSeats;

            returnTicketsPrice = (adultsSeats * returnAdultPrice) + (childrenSeats * returnChildPrice);
        }

        // --- 3. Calcul du prix des BAGAGES ---
        if (state.baggageCounts && Object.keys(state.baggageCounts).length > 0 && state.selectedBus?.baggageOptions) {
            Object.values(state.baggageCounts).forEach(paxBaggage => {
                baggagePrice += (paxBaggage.standard || 0) * (state.selectedBus.baggageOptions.standard.price || 0);
                baggagePrice += (paxBaggage.oversized || 0) * (state.selectedBus.baggageOptions.oversized.price || 0);
            });
        }

        totalPrice = ticketsPrice + returnTicketsPrice + baggagePrice;

        // On retourne un objet détaillé avec les prix arrondis
        return {
            total: Math.round(totalPrice),
            tickets: Math.round(ticketsPrice),
            returnTickets: Math.round(returnTicketsPrice),
            baggage: Math.round(baggagePrice)
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

            if (parts.length === 6) {
                return {
                    valid: true,
                    version: "4.0",
                    bookingNumber: parts[0],
                    travelDate: parts[1],
                    mainPassengerName: parts[2],
                    totalPassengers: parseInt(parts[3]),
                    travelType: parts[4] === 'A' ? 'Aller' : 'Retour',
                    busIdentifier: parts[5]
                };
            }

            const data = JSON.parse(qrString);
            if (data.v === "2.0") {
                // logique pour l'ancien format
            }

            throw new Error('Format de QR Code inconnu ou invalide.');

        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    },

    // ✅ 3. FONCTION DE GÉNÉRATION DE L'IMAGE (CORRIGÉE)
    async generateQRCodeBase64(text, size = 300) {
        return new Promise((resolve, reject) => {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.cssText = 'position:fixed; left:-9999px; top:-9999px; background:#FFFFFF; padding:10px;';
                document.body.appendChild(tempDiv);

                if (typeof QRCode === 'undefined') {
                    document.body.removeChild(tempDiv);
                    reject(new Error('QRCode not loaded'));
                    return;
                }

                new QRCode(tempDiv, {
                    text: text,
                    width: size,
                    height: size,
                    colorDark: "#000000",
                    colorLight: "#FFFFFF",
                    correctLevel: QRCode.CorrectLevel.H
                });

                setTimeout(() => {
                    try {
                        const canvas = tempDiv.querySelector('canvas');
                        const img = tempDiv.querySelector('img');

                        let base64 = null;

                        if (canvas) {
                            base64 = canvas.toDataURL('image/png');
                        } else if (img && img.src) {
                            base64 = img.src;
                        }

                        document.body.removeChild(tempDiv);

                        if (base64) {
                            resolve(base64);
                        } else {
                            reject(new Error('QR Code non genere'));
                        }
                    } catch (err) {
                        document.body.removeChild(tempDiv);
                        reject(err);
                    }
                }, 300);

            } catch (error) {
                reject(error);
            }
        });
    }

};  // ← ✅ ACCOLADE FERMANTE DE Utils ICI

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

// app.js
// app.js

// Assure-toi que ces variables sont bien déclarées au début de ton fichier app.js
let hasInitialSetupRun = false;


function applyLanguage(lang = getLanguage()) {
    if (typeof translations === 'undefined') {
        console.warn("Traductions non prêtes, l'affichage sera mis à jour plus tard.");
        return;
    }

    localStorage.setItem('enbus_language', lang);
    document.documentElement.lang = lang;
    const translation = translations[lang] || translations.fr;

    // --- 1. Traduction de tous les éléments statiques ---
    if (translation.page_title) document.title = translation.page_title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        // On vérifie que la clé existe ET que ce n'est PAS une fonction
        if (translation[key] && typeof translation[key] !== 'function') {
            el.innerHTML = translation[key];
        }
    });

    const smartSearchInput = document.getElementById('smart-search-input');
    if (smartSearchInput && translation.smart_search_placeholder) {
        smartSearchInput.placeholder = translation.smart_search_placeholder;
    }

    // --- 2. Lancement des fonctions de configuration (UNE SEULE FOIS) ---
    // Ces fonctions créent des éléments ou attachent des écouteurs. On ne veut pas les dupliquer.
    if (!hasInitialSetupRun) {
        console.log("🚀 Exécution de la configuration initiale de l'interface...");


        setupTripTypeToggle();
        setupPassengerSelector();
        setupAmenitiesFilters();
        animateCountersOnScroll();

        hasInitialSetupRun = true; // On met le drapeau à vrai pour ne pas ré-exécuter
    }

    // --- 3. Fonctions de mise à jour (appelées à chaque changement de langue) ---
    // Celles-ci rafraîchissent le texte des éléments dynamiques.
    updateDynamicTexts(lang);
    populatePopularDestinations(); // Met à jour le texte "À partir de..."
    setupDatePickers(); // Met à jour le placeholder et la langue du calendrier

    // --- 4. Lancement de l'animation du placeholder (UNE SEULE FOIS) ---
    if (!placeholderAnimationStarted && typeof animateSearchPlaceholder === 'function') {
        animateSearchPlaceholder();
        placeholderAnimationStarted = true;
    }
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
        // Remplacer l'ancienne version par celle-ci
        const maxAge = appRules.ticketing.childMaxAge;
        childrenLabel.innerHTML = `Enfants <small>(0-${maxAge} ans)</small>`;
    }

    // --- 3. (Futur) Traduction d'autres textes dynamiques ---
    // ...
}
// Fonction globale pour changer la langue
window.changeLanguage = function (lang) {
    setLanguage(lang); // setLanguage contient applyLanguage

    // ✅ On force la reconstruction du calendrier avec la nouvelle langue
    if (typeof setupDatePickers === 'function') {
        setupDatePickers();
    }
};




// DANS app.js


// DANS app.js (collez ce bloc complet)

// Fonction qui traduit les coordonnées GPS en nom de ville
async function reverseGeocode(lat, lon) {
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=${lang}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Le service de géocodage a échoué.");
        const data = await response.json();
        const cityName = data.address.city || data.address.town || data.address.village;
        console.log("🏙️ Ville retournée par l'API :", cityName);
        return cityName;
    } catch (error) {
        console.error("❌ Erreur de reverse geocoding:", error);
        Utils.showToast(translation.geolocation_reverse_geocode_error, "error");
        return null;
    }
}

// Fonction principale de géolocalisation
async function geolocateUser() {
    const geolocateBtn = document.getElementById('geolocate-btn');
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    if (geolocateBtn) {
        geolocateBtn.classList.add('loading');
        geolocateBtn.disabled = true;
    }
    Utils.showToast(translation.geolocation_searching, "info");

    try {
        let position;
        const geolocationOptions = { enableHighAccuracy: true, timeout: 30000, maximumAge: 15000 };

        // CAS 1 : Natif
        if (window.Capacitor?.isNativePlatform() && Capacitor.Plugins.Geolocation) {
            const { Geolocation } = Capacitor.Plugins;
            const permStatus = await Geolocation.requestPermissions();
            if (permStatus.location !== 'granted') {
                throw new Error(translation.geolocation_permission_denied);
            }
            position = await Geolocation.getCurrentPosition(geolocationOptions);
        }
        // CAS 2 : Web
        else if (navigator.geolocation) {
            position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, geolocationOptions);
            });
        }
        // CAS 3 : Non supporté
        else {
            throw new Error(translation.geolocation_not_supported);
        }

        // --- Traitement de la position obtenue ---
        const { latitude, longitude } = position.coords;
        console.log(`📍 Coordonnées trouvées : ${latitude}, ${longitude}`);

        const rawCityName = await reverseGeocode(latitude, longitude);

        if (rawCityName) {
            const cleanedCityName = rawCityName.replace(/\s*\(.*\)\s*/g, '').trim();
            console.log(`🧼 Nom de ville nettoyé : "${cleanedCityName}"`);

            // On cible le bon input de texte
            const originInput = document.getElementById('origin-input');
            if (!originInput) {
                console.error("Erreur critique : L'input #origin-input est introuvable.");
                return;
            }

            // On cherche dans le tableau de données 'allDestinations'
            const matchingDestination = allDestinations.find(dest => dest.name.toLowerCase() === cleanedCityName.toLowerCase());

            if (matchingDestination) {
                originInput.value = matchingDestination.name;
                Utils.showToast(translation.geolocation_city_found(matchingDestination.name), "success");
            } else {
                Utils.showToast(translation.geolocation_city_not_served(cleanedCityName), "warning");
            }
        }

    } catch (error) {
        let errorMessage = error.message || translation.geolocation_generic_error;
        if (error.code) {
            if (error.code === 1) errorMessage = translation.geolocation_permission_denied;
            else if (error.code === 2) errorMessage = translation.geolocation_position_unavailable;
            else if (error.code === 3) errorMessage = translation.geolocation_timeout;
        }
        console.error("❌ Erreur de géolocalisation:", error);
        Utils.showToast(errorMessage, "error");
    } finally {
        if (geolocateBtn) {
            geolocateBtn.classList.remove('loading');
            geolocateBtn.disabled = false;
        }
    }
}


// DANS app.js (remplacez votre fonction processPosition)

async function processPosition(positionPromise) {
    const geolocateBtn = document.getElementById('geolocate-btn');
    const lang = getLanguage(); // On récupère la langue pour les traductions
    const translation = translations[lang] || translations.fr;

    if (geolocateBtn) {
        geolocateBtn.classList.add('loading');
        geolocateBtn.disabled = true;
    }
    // On utilise la clé de traduction
    Utils.showToast(translation.geolocation_searching, "info");

    try {
        const position = await positionPromise;
        const { latitude, longitude } = position.coords;
        console.log(`📍 Coordonnées trouvées : ${latitude}, ${longitude}`);

        const rawCityName = await reverseGeocode(latitude, longitude);

        if (rawCityName) {
            const cleanedCityName = rawCityName.replace(/\s*\(.*\)\s*/g, '').trim();
            console.log(`🧼 Nom de ville nettoyé : "${cleanedCityName}"`);

            // ========================================================
            // ✅ DÉBUT DE LA CORRECTION : Logique de recherche et de remplissage
            // ========================================================

            // 1. On cible le bon input de texte
            const originInput = document.getElementById('origin-input');
            if (!originInput) {
                console.error("Erreur critique : L'input #origin-input est introuvable.");
                return;
            }

            // 2. On cherche dans notre tableau de données 'allDestinations'
            // qui a été chargé au démarrage de l'application.
            const matchingDestination = allDestinations.find(dest => dest.name.toLowerCase() === cleanedCityName.toLowerCase());

            if (matchingDestination) {
                // Si on trouve une correspondance, on remplit la valeur de l'input
                originInput.value = matchingDestination.name;
                // On utilise la clé de traduction pour le message de succès
                Utils.showToast(translation.geolocation_city_found(matchingDestination.name), "success");
            } else {
                // Si aucune correspondance, on affiche l'alerte
                Utils.showToast(translation.geolocation_city_not_served(cleanedCityName), "warning");
            }

            // ========================================================
            // ✅ FIN DE LA CORRECTION
            // ========================================================
        }
    } catch (error) {
        // La gestion d'erreur reste la même, mais on s'assure qu'elle est traduite
        let errorMessage = error.message || translation.geolocation_generic_error;
        if (error.code) {
            if (error.code === 1) errorMessage = translation.geolocation_permission_denied;
            else if (error.code === 2) errorMessage = translation.geolocation_position_unavailable;
            else if (error.code === 3) errorMessage = translation.geolocation_timeout;
        }
        console.error("❌ Erreur de géolocalisation:", error);
        Utils.showToast(errorMessage, "error");
    } finally {
        if (geolocateBtn) {
            geolocateBtn.classList.remove('loading');
            geolocateBtn.disabled = false;
        }
    }
}
// Fonction qui utilise le plugin Capacitor
function getPositionWithPlugin(Geolocation) {
    const positionPromise = Geolocation.getCurrentPosition();
    processPosition(positionPromise);
}

// Fonction qui utilise l'API Web
function getPositionWithWebAPI() {
    const positionPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
        });
    });
    processPosition(positionPromise);
}
// DANS app.js
// DANS app.js

function updatePassengerSelectorUI() {
    const dropdown = document.getElementById("passenger-dropdown");
    if (!dropdown) return;

    // --- Cibles DOM ---
    const adultsCount = document.getElementById("adults-count");
    const childrenCount = document.getElementById("children-count");
    const summary = document.getElementById("passenger-summary");
    const adultsLabel = dropdown.querySelector('label[data-i18n="search_form_adults"]');
    const childrenLabel = dropdown.querySelector('label[data-i18n="search_form_children_dynamic"]');

    // Si un des éléments manque, on arrête.
    if (!adultsCount || !childrenCount || !summary || !adultsLabel || !childrenLabel) {
        console.warn("[updatePassengerSelectorUI] Un ou plusieurs éléments du DOM sont manquants.");
        return;
    }

    // --- Logique de mise à jour des compteurs (inchangée) ---
    adultsCount.textContent = appState.passengerCounts.adults;
    childrenCount.textContent = appState.passengerCounts.children;
    dropdown.querySelector('[data-type="adults"][data-action="decrement"]').disabled = appState.passengerCounts.adults <= 1;
    dropdown.querySelector('[data-type="children"][data-action="decrement"]').disabled = appState.passengerCounts.children <= 0;

    // --- Logique de traduction ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const rules = appRules.ticketing;

    // 1. Résumé principal
    if (typeof translation.passenger_summary === 'function') {
        summary.textContent = translation.passenger_summary(appState.passengerCounts.adults, appState.passengerCounts.children);
    }

    // 2. Label Adultes (statique)
    if (translation.search_form_adults) {
        adultsLabel.innerHTML = translation.search_form_adults;
    }

    // 3. Label Enfants (dynamique)
    if (typeof translation.search_form_children_dynamic === 'function') {
        childrenLabel.innerHTML = translation.search_form_children_dynamic(rules.childMaxAge);
    } else {
        // Fallback
        const baseText = (lang === 'en') ? 'Children' : 'Enfants';
        childrenLabel.innerHTML = `${baseText} <small>(0-${rules.childMaxAge} yrs)</small>`;
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

// DANS app.js

// DANS app.js

// ✅ On ajoute 'onOpen' à la liste des paramètres déstructurés
// DANS app.js

// DANS app.js

// DANS app.js (remplacez cette fonction)

function showCustomConfirm({ title, message, icon = '⚠️', onOpen = null, confirmText = 'Confirmer', cancelText = 'Annuler', confirmClass = 'btn-primary' }) {
    return new Promise((resolve) => {
        const modalId = `modal-${Date.now()}`;
        const wrapper = document.createElement('div');
        wrapper.id = modalId;
        wrapper.className = 'custom-modal-overlay';

        // ========================================================
        // ✅ LE HTML COMPLET EST MAINTENANT ICI
        // ========================================================
        wrapper.innerHTML = `
            <div class="custom-modal-card">
                <div class="custom-modal-header">
                    <div class="custom-modal-icon">${icon}</div>
                    <h3>${title}</h3>
                </div>
                <div class="custom-modal-body">
                    ${message}
                </div>
                <div class="custom-modal-footer">
                    ${cancelText ? `<button id="btn-cancel-${modalId}" class="btn btn-secondary">${cancelText}</button>` : ''}
                    <button id="btn-confirm-${modalId}" class="btn ${confirmClass}">${confirmText}</button>
                </div>
            </div>
        `;
        // ========================================================

        document.body.appendChild(wrapper);

        // Cette partie va maintenant trouver les boutons car ils existent dans le HTML
        const btnConfirm = document.getElementById(`btn-confirm-${modalId}`);
        const btnCancel = document.getElementById(`btn-cancel-${modalId}`);

        requestAnimationFrame(() => {
            setTimeout(() => {
                wrapper.classList.add('visible');
            }, 10);
        });

        const cleanup = (result) => {
            wrapper.classList.remove('visible');
            setTimeout(() => {
                wrapper.remove();
                resolve(result);
            }, 300);
        };

        // Sécurité : si le bouton n'est pas trouvé, on ne plante pas
        if (btnConfirm) {
            btnConfirm.onclick = () => cleanup(true);
        } else {
            console.error("Bouton de confirmation introuvable !");
            cleanup(false); // On ferme et on annule
        }

        if (btnCancel) {
            btnCancel.onclick = () => cleanup(false);
        }

        if (onOpen && typeof onOpen === 'function') {
            try {
                onOpen();
            } catch (e) {
                console.error("Erreur dans la fonction onOpen de la modale:", e);
            }
        }
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

window.cancelReservation = async function (bookingNumber) {
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

// Dans app.js

window.downloadTicket = async function (isReturn = false) {
    // ✅ On récupère l'objet de traduction au tout début
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const reservation = appState.currentReservation;

    if (!reservation) {
        // ✅ On utilise la traduction pour le message d'erreur
        Utils.showToast(translation.error_no_booking_to_download || "Aucune réservation à télécharger.", "error");
        return;
    }

    if (isReturn && !reservation.returnRoute) {
        // ✅ On utilise la traduction pour le message d'avertissement
        Utils.showToast(translation.error_no_return_ticket || "Il n'y a pas de billet retour pour cette réservation.", "warning");
        return;
    }

    // Le reste de ta fonction est déjà correct
    Utils.showToast(translation.toast_generating_ticket || 'Génération du billet en cours...', 'info');

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

window.checkPaymentStatus = async function (bookingNumber) {
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
        }


        // ========================================================
        // ✅ DÉBUT DE LA CORRECTION
        // ========================================================
        else if (data.status === 'Annulé' || data.status === 'Expiré') {
            let translatedStatus = data.status.toLowerCase();

            // On traduit manuellement le statut si la langue est l'anglais
            if (lang === 'en') {
                if (data.status === 'Annulé') {
                    translatedStatus = 'cancelled';
                } else if (data.status === 'Expiré') {
                    translatedStatus = 'expired';
                }
            }

            // On appelle la fonction de traduction avec le statut déjà traduit
            Utils.showToast(translation.toast_booking_cancelled_status(translatedStatus), 'error');
        }
        // ========================================================
        // ✅ FIN DE LA CORRECTION
        // ========================================================



        else {
            Utils.showToast(`${translation.toast_current_status || 'Statut actuel :'} ${data.status}`, 'info');
        }

    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        Utils.showToast(translation.error_check_status || 'Erreur lors de la vérification.', 'error');
    }
};






// DANS app.js (ajoutez cette nouvelle fonction)
// DANS app.js (remplacez votre fonction shareTicket)

async function shareTicket() {
    const reservation = appState.currentReservation;
    if (!reservation) {
        console.warn("Aucune réservation à partager.");
        return;
    }

    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // --- 1. Préparation des données à partager (votre code est correct) ---
    const from = reservation.route.from;
    const to = reservation.route.to;
    const date = Utils.formatDate(reservation.date, lang);
    const time = reservation.route.departure;
    const seat = reservation.seats.join(', ');
    const bookingNum = reservation.bookingNumber;
    const url = `https://incomparable-llama-84897e.netlify.app/?booking=${bookingNum}`;

    const shareData = {
        title: translation.share_message_subject(bookingNum),
        text: translation.share_message_body(from, to, date, time, seat, bookingNum, url),
        url: url
    };

    // ========================================================
    // ✅ DÉBUT DE LA NOUVELLE LOGIQUE DE PARTAGE UNIVERSELLE
    // ========================================================

    // CAS 1 : On est sur une application NATIVE (Android/iOS)
    if (window.Capacitor?.isNativePlatform()) {
        const { Share } = Capacitor.Plugins;
        console.log("🚀 Tentative de partage natif...");
        try {
            await Share.share({
                ...shareData,
                dialogTitle: translation.button_share_ticket,
            });
            console.log("Partage natif réussi.");
        } catch (error) {
            console.error("❌ Erreur de partage natif:", error);
            // Si le partage natif échoue, on copie dans le presse-papiers
            navigator.clipboard.writeText(shareData.text)
                .then(() => Utils.showToast("Détails copiés dans le presse-papiers !", 'success'))
                .catch(err => console.error("Échec de la copie de secours:", err));
        }
    }
    // CAS 2 : On est sur un navigateur web qui supporte l'API de Partage (la plupart des mobiles)
    else if (navigator.share) {
        console.log("🌐 Tentative de partage avec l'API Web Share...");
        try {
            await navigator.share(shareData);
            console.log("Partage web API réussi.");
        } catch (error) {
            // L'utilisateur a probablement annulé le partage, ce n'est pas une erreur critique.
            console.log("Partage web annulé par l'utilisateur.", error);
        }
    }
    // CAS 3 : Fallback pour les navigateurs de bureau ou anciens navigateurs
    else {
        console.log("📋 Fallback : Copie dans le presse-papiers...");
        try {
            await navigator.clipboard.writeText(shareData.text);
            Utils.showToast("Les détails du voyage ont été copiés dans le presse-papiers !", 'success');
        } catch (err) {
            console.error("❌ Échec de la copie dans le presse-papiers:", err);
            // Fallback ultime si tout échoue : on affiche le texte dans une alerte.
            alert(shareData.text);
        }
    }
    // ========================================================
    // ✅ FIN DE LA NOUVELLE LOGIQUE
    // ========================================================
}







// Dans app.js
// Dans app.js
// DANS app.js, REMPLACEZ la fonction generateTicketPDF par celle-ci
async function generateTicketPDF(reservation, isReturn = false) {
    try {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;

        const qrDataString = Utils.generateQRCodeData(reservation, isReturn);
        const qrCodeBase64 = await Utils.generateQRCodeBase64(qrDataString, 300);

        const route = isReturn ? reservation.returnRoute : reservation.route;
        const date = isReturn ? reservation.returnDate : reservation.date;

        let displayDuration = route.duration;
        if (!displayDuration || displayDuration === 'N/A') {
            const [h1, m1] = route.departure.split(':').map(Number);
            const [h2, m2] = route.arrival.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff < 0) diff += 1440;
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            displayDuration = `${h}h ${m > 0 ? String(m).padStart(2, '0') : ''}`;
        }

        const seats = isReturn ? reservation.returnSeats : reservation.seats;
        const busIdentifier = (isReturn ? reservation.returnBusIdentifier : reservation.busIdentifier) || 'N/A';
        const ticketType = isReturn ? translation.confirmation_ticket_return : translation.confirmation_ticket_outbound;

        const fileName = isReturn
            ? `Billet_Retour_${reservation.bookingNumber}.pdf`
            : `Billet_Aller_${reservation.bookingNumber}.pdf`;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = 210;
        const margin = 15;
        let y = margin;

        // ========================================
        // HEADER
        // ========================================
        pdf.setFillColor(115, 215, 0);
        pdf.rect(0, 0, pageWidth, 30, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('EN-BUS', margin, 20);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(ticketType.toUpperCase(), pageWidth - margin, 20, { align: 'right' });

        y = 40;

        // ========================================
        // SECTION ROUTE
        // ========================================
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin, y, 120, 40, 3, 3, 'F');

        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(route.from, margin + 5, y + 15);

        pdf.setFillColor(30, 30, 30);
        pdf.roundedRect(margin + 5, y + 20, 28, 10, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text(route.departure, margin + 19, y + 27, { align: 'center' });

        pdf.setTextColor(115, 215, 0);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('>>>>', margin + 60, y + 22, { align: 'center' });

        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(route.to, margin + 115, y + 15, { align: 'right' });

        pdf.setFillColor(30, 30, 30);
        pdf.roundedRect(margin + 87, y + 20, 28, 10, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text(route.arrival, margin + 101, y + 27, { align: 'center' });

        // ========================================
        // QR CODE
        // ========================================
        const qrX = 145;
        const qrY = y;

        pdf.setFillColor(30, 30, 50);
        pdf.roundedRect(qrX, qrY, 50, 105, 3, 3, 'F');

        if (qrCodeBase64) {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(qrX + 2, qrY + 2, 46, 46, 'F');
            pdf.addImage(qrCodeBase64, 'PNG', qrX + 3, qrY + 3, 44, 44, undefined, 'NONE');
        }

        pdf.setTextColor(140, 140, 140);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RESERVATION', qrX + 25, qrY + 52, { align: 'center' });

        pdf.setTextColor(115, 215, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(reservation.bookingNumber, qrX + 25, qrY + 60, { align: 'center' });

        pdf.setTextColor(140, 140, 140);
        pdf.setFontSize(7);
        pdf.text('PASSAGER', qrX + 25, qrY + 70, { align: 'center' });

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        let pName = reservation.passengers[0].name;
        if (pName.length > 16) pName = pName.substring(0, 15) + '...';
        pdf.text(pName, qrX + 25, qrY + 78, { align: 'center' });

        pdf.setTextColor(140, 140, 140);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text((translation.pdf_total_paid || 'TOTAL PAYÉ').toUpperCase(), qrX + 25, qrY + 88, { align: 'center' });

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(Utils.formatPrice(reservation.totalPriceNumeric || 0) + ' FCFA', qrX + 25, qrY + 96, { align: 'center' });

        y += 50;

        // ========================================
        // DETAILS - Ligne 1 (Date + Duree)
        // ========================================
        const boxWidth = 58;
        const boxHeight = 22;
        const gap = 4;

        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text((translation.details_label_date || 'DATE').toUpperCase(), margin + boxWidth / 2, y + 8, { align: 'center' });
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(Utils.formatDate(date, lang), margin + boxWidth / 2, y + 17, { align: 'center' });

        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin + boxWidth + gap, y, boxWidth, boxHeight, 2, 2, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text((translation.details_label_duration || 'DUREE').toUpperCase(), margin + boxWidth + gap + boxWidth / 2, y + 8, { align: 'center' });
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(displayDuration, margin + boxWidth + gap + boxWidth / 2, y + 17, { align: 'center' });

        y += boxHeight + gap;

        // ========================================
        // DETAILS - Ligne 2 (Compagnie + Bus)
        // ========================================
        const largeBoxWidth = 70;
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin, y, largeBoxWidth, boxHeight, 2, 2, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text((translation.details_label_company || 'COMPAGNIE').toUpperCase(), margin + largeBoxWidth / 2, y + 8, { align: 'center' });
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(route.company || 'N/A', margin + largeBoxWidth / 2, y + 17, { align: 'center' });

        const smallBoxWidth = 46;
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(margin + largeBoxWidth + gap, y, smallBoxWidth, boxHeight, 2, 2, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text((translation.details_label_bus_no || 'BUS').toUpperCase(), margin + largeBoxWidth + gap + smallBoxWidth / 2, y + 8, { align: 'center' });
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(busIdentifier, margin + largeBoxWidth + gap + smallBoxWidth / 2, y + 17, { align: 'center' });

        y += boxHeight + 10;

        // ========================================
        // PASSAGERS
        // ========================================
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text((translation.details_label_passengers || 'PASSAGERS').toUpperCase(), margin, y);
        pdf.setFillColor(115, 215, 0);
        pdf.rect(margin, y + 2, 35, 1.5, 'F');
        y += 10;

        const paxHeight = reservation.passengers.length * 8 + 10;
        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(margin, y, 180, paxHeight, 2, 2, 'F');
        y += 6;

        reservation.passengers.forEach((p, i) => {
            pdf.setTextColor(30, 30, 30);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(p.name, margin + 5, y);
            pdf.setTextColor(80, 80, 80);
            pdf.setFontSize(9);
            pdf.text((translation.details_label_seat || 'Siege') + ' ' + seats[i], pageWidth - margin - 5, y, { align: 'right' });
            y += 8;
        });
        y += 8;

        // ========================================
        // ARRETS
        // ========================================
        if (route.stops && route.stops.length > 0) {
            pdf.setTextColor(30, 30, 30);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text((translation.details_stops_planned || 'ARRETS PREVUS').toUpperCase(), margin, y);
            pdf.setFillColor(115, 215, 0);
            pdf.rect(margin, y + 2, 30, 1.5, 'F');
            y += 10;

            route.stops.forEach(stop => {
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.text(stop.city, margin + 5, y);
                if (translation.details_stop_info) {
                    pdf.setTextColor(100, 100, 100);
                    pdf.setFontSize(8);
                    pdf.text(translation.details_stop_info(stop.duration, stop.arrivalTime), margin + 115, y, { align: 'right' });
                }
                y += 8;
            });
            y += 5;
        }

        // ========================================
        // CORRESPONDANCES
        // ========================================
        if (route.connections && route.connections.length > 0) {
            pdf.setTextColor(200, 60, 60);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text((translation.details_connections_title || 'CORRESPONDANCES').toUpperCase(), margin, y);
            pdf.setFillColor(200, 60, 60);
            pdf.rect(margin, y + 2, 35, 1.5, 'F');
            y += 10;

            route.connections.forEach(conn => {
                pdf.setTextColor(30, 30, 30);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                if (translation.details_connection_info) {
                    pdf.text(translation.details_connection_info(conn.at, conn.waitTime), margin + 5, y);
                }
                y += 6;
                if (translation.details_next_bus_info) {
                    pdf.setTextColor(100, 100, 100);
                    pdf.setFontSize(8);
                    pdf.text(translation.details_next_bus_info(conn.nextCompany, conn.nextBusNumber, conn.nextDeparture), margin + 8, y);
                }
                y += 10;
            });
        }

        // ========================================
        // FOOTER (POSITIONNEMENT DYNAMIQUE)
        // ========================================
        let footerY = 297 - 30; // 30mm du bas de la page A4 (297mm)

        // Si le contenu est déjà plus bas que la position par défaut du footer, on le décale
        if (y > footerY - 10) {
            footerY = y + 10;
        }

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(margin, footerY, pageWidth - margin, footerY);
        footerY += 7;

        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const footerMsg = translation.ticket_footer_instruction || 'Presentez-vous 30 min avant le depart avec une piece d identite';
        const splitText = pdf.splitTextToSize('IMPORTANT : ' + footerMsg, pageWidth - (margin * 2));
        pdf.text(splitText, pageWidth / 2, footerY, { align: 'center' });

        footerY += (splitText.length * 5) + 3; // Augmente la position en fonction du nombre de lignes

        pdf.setTextColor(140, 140, 140);
        pdf.setFontSize(8);
        pdf.text(`EN-BUS - ${translation.pdf_footer_tagline || 'Votre partenaire de voyage'}`, pageWidth / 2, footerY, { align: 'center' });

        // ========================================
        // SAUVEGARDE
        // ========================================
        if (window.Capacitor?.isNativePlatform()) {
            const { Filesystem, LocalNotifications } = Capacitor.Plugins;
            const pdfBase64 = pdf.output('datauristring').split(',')[1];

            const result = await Filesystem.writeFile({
                path: fileName,
                data: pdfBase64,
                directory: 'DOCUMENTS',
                recursive: true
            });

            console.log('PDF sauvegardé sur l\'appareil :', result.uri);

            if (LocalNotifications) {
                try {
                    const permResult = await LocalNotifications.requestPermissions();
                    if (permResult.display === 'granted') {
                        await LocalNotifications.schedule({
                            notifications: [{
                                title: translation.local_notif_ticket_download_title || 'Billet téléchargé',
                                body: translation.local_notif_ticket_download_body ? translation.local_notif_ticket_download_body(fileName) : `${fileName} enregistré`,
                                id: Math.floor(Math.random() * 100000),
                                schedule: { at: new Date(Date.now() + 1000) },
                                sound: 'default',
                                smallIcon: 'ic_notification'
                            }]
                        });
                    }
                } catch (e) {
                    console.warn('Échec de la notification locale:', e);
                }
            }

            Utils.showToast(translation.toast_ticket_downloaded_native || 'Billet PDF enregistré !', 'success');
        } else {
            pdf.save(fileName);
            Utils.showToast(translation.toast_ticket_downloaded || 'Billet PDF telecharge !', 'success');
        }

    } catch (error) {
        console.error('Erreur generation billet:', error);
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        Utils.showToast(translation?.error_generating_ticket || 'Erreur generation billet', 'error');
    }
}

// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================
// app.js
// DANS app.js

// ✅ On ajoute le mot-clé "async" ici pour autoriser l'utilisation de "await" à l'intérieur.
// DANS app.js

async function initApp() {
    try {
        // --- Fonctions qui n'ont pas besoin des traductions pour se lancer ---
        setupMobileMenu();
        addToastStyles();
        addSwapButtonStyles();
        setupSwapButton();
        addAboutPageStyles();
        addContactPageStyles();
        setupContactPage();
        addRoutingMachineStyles();
        initInteractiveMap();
        setupSmartSearch();
        setupMobileFilterToggle();
        setupSocialLinks();
        loadAllDestinations();
        setupNotificationListeners();
        // ✅ AJOUTER CES DEUX LIGNES
        setupAutocomplete('origin-input', 'origin-suggestions');
        setupAutocomplete('destination-input', 'destination-suggestions');


        const geolocateBtn = document.getElementById('geolocate-btn');
        if (geolocateBtn) {
            geolocateBtn.addEventListener('click', geolocateUser);
        }

        // ========================================================
        // ✅ DÉBUT DE LA CORRECTION : Ajout de l'écouteur d'événement
        // ========================================================
        const proceedButton = document.getElementById('btn-proceed-to-payment');
        if (proceedButton) {
            proceedButton.addEventListener('click', () => {
                // On appelle la fonction globale qui est déjà 'async'
                window.proceedToPayment();
            });
            console.log("✅ Écouteur d'événement ajouté au bouton 'Continuer vers Paiement'.");
        }
        // ========================================================
        // ✅ FIN DE LA CORRECTION
        // ========================================================

        // --- Configuration native ---
        if (window.Capacitor?.isNativePlatform()) {
            const { StatusBar, Style } = Capacitor.Plugins;
            if (StatusBar) {
                try {
                    StatusBar.setStyle({ style: Style.Dark });
                    console.log("✅ Style de la barre de statut appliqué (Dark).");
                } catch (e) {
                    console.warn("⚠️ Erreur lors de l'application du style de la barre de statut:", e);
                }
            } else {
                console.warn("⚠️ Plugin @capacitor/status-bar non trouvé. Le style de la barre de statut ne sera pas modifié.");
            }
        }

        // --- Correction pour la superposition de la recherche ---
        const resultsContainer = document.getElementById('smart-search-results');
        if (resultsContainer) {
            document.body.appendChild(resultsContainer);
        }

        // --- On attend que les données essentielles soient chargées ---
        await Promise.all([
            loadAllRouteTemplates(),
            loadTicketingRules()
        ]);

        console.log("✅ Données de fond (modèles et règles) chargées.");

        // --- Maintenant que les données sont là, on met à jour l'UI ---
        applyLanguage();

        // --- Gestion de la redirection ---
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page');
        if (page === 'reservations') {
            showPage('reservations');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (window.location.hash === '#reservations') {
            showPage('reservations');
        }

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}



// DANS app.js
// DANS app.js
function setupAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);
    if (!input || !suggestionsContainer) return;

    // Affiche les destinations populaires quand on clique dans un champ vide
    input.addEventListener('focus', () => {
        if (input.value.trim() === '') {
            const popularDests = allDestinations.filter(d => d.isPopular);
            displaySuggestions(popularDests, '', suggestionsContainer, input);
        }
    });

    // Logique de recherche floue (inchangée mais importante)
    input.addEventListener('input', () => {
        const query = input.value.trim();
        if (query.length < 1 || !fuseDestinations) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        const results = fuseDestinations.search(query);
        const filteredDests = results.map(res => res.item);
        displaySuggestions(filteredDests.slice(0, 5), query, suggestionsContainer, input);
    });

    // Fermeture au clic extérieur
    document.addEventListener('click', (e) => {
        if (e.target !== input) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// NOUVELLE FONCTION HELPER pour afficher les suggestions
function displaySuggestions(destinations, query, container, inputElement) {
    container.innerHTML = '';
    if (destinations.length > 0) {
        destinations.forEach(dest => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';

            // On met en gras la partie qui correspond à la recherche (si recherche il y a)
            const boldedName = query ? dest.name.replace(new RegExp(query, 'gi'), '<strong>$&</strong>') : dest.name;

            item.innerHTML = `${boldedName}, ${dest.country} ${dest.isPopular ? '<small>★ Populaire</small>' : ''}`;

            item.addEventListener('click', () => {
                inputElement.value = dest.name;
                container.style.display = 'none';
            });
            container.appendChild(item);
        });
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
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
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');


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
// ============================================
// 🗺️ CARTE INTERACTIVE (VERSION ROBUSTE)
// ============================================
async function initInteractiveMap() {
    const mapContainer = document.getElementById('interactive-map');
    if (!mapContainer || mapContainer._leaflet_id) return;

    console.log("🗺️ Initialisation carte...");
    const map = L.map('interactive-map').setView([0, 15], 5); // Vue large par défaut
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'CARTO & OpenStreetMap',
    }).addTo(map);

    try {
        // 1. Récupérer les données
        const [popularRes, allDestinationsRes] = await Promise.all([
            fetch(`${API_CONFIG.baseUrl}/api/popular-destinations`),
            fetch(`${API_CONFIG.baseUrl}/api/destinations`)
        ]);

        const popularData = await popularRes.json();
        const allDestinationsData = await allDestinationsRes.json();

        if (!popularData.success || !allDestinationsData.success) throw new Error("Données API invalides.");

        const popularRoutes = popularData.destinations;
        const allCities = allDestinationsData.destinations;

        console.log(`   - ${popularRoutes.length} trajets populaires trouvés.`);
        console.log(`   - ${allCities.length} villes avec coordonnées trouvées.`);

        // 2. Créer un dictionnaire de coordonnées (Normalisé)
        // On stocke : "brazzaville" -> [-4.26, 15.24]
        const cityCoordsMap = new Map();
        allCities.forEach(city => {
            if (city.coords && (Array.isArray(city.coords) || typeof city.coords === 'string')) {
                let latlng = city.coords;
                // Si c'est une chaîne "lat,lon", on convertit
                if (typeof latlng === 'string' && latlng.includes(',')) {
                    latlng = latlng.split(',').map(Number);
                }
                // Si valide, on ajoute
                if (Array.isArray(latlng) && latlng.length === 2 && !isNaN(latlng[0])) {
                    cityCoordsMap.set(city.name.toLowerCase().trim(), latlng);
                }
            }
        });

        // 3. Tracer les routes
        const busIcon = L.icon({
            iconUrl: './icons/bus-marker.png', // Assurez-vous que cette image existe
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        let addedMarkers = new Set();
        let hasRoutes = false;

        popularRoutes.forEach(route => {
            // Recherche insensible à la casse
            const fromKey = route.from.toLowerCase().trim();
            const toKey = route.to.toLowerCase().trim();

            const fromCoords = cityCoordsMap.get(fromKey);
            const toCoords = cityCoordsMap.get(toKey);

            if (fromCoords && toCoords) {
                hasRoutes = true;
                console.log(`   ✅ Tracé: ${route.from} -> ${route.to}`);

                // Marqueurs (si pas déjà ajoutés)
                if (!addedMarkers.has(fromKey)) {
                    L.marker(fromCoords, { icon: busIcon }).addTo(map).bindPopup(`<b>${route.from}</b>`);
                    addedMarkers.add(fromKey);
                }
                if (!addedMarkers.has(toKey)) {
                    L.marker(toCoords, { icon: busIcon }).addTo(map).bindPopup(`<b>${route.to}</b>`);
                    addedMarkers.add(toKey);
                }

                // Ligne de route (Routing Machine ou Polyline simple si erreur)
                try {
                    L.Routing.control({
                        waypoints: [L.latLng(fromCoords), L.latLng(toCoords)],
                        routeWhileDragging: false,
                        addWaypoints: false,
                        draggableWaypoints: false,
                        fitSelectedRoutes: false, // On gère le zoom nous-mêmes
                        show: false, // Cache le panneau d'instructions
                        lineOptions: {
                            styles: [{ color: '#73d700', opacity: 0.7, weight: 4 }]
                        },
                        createMarker: function () { return null; } // Pas de marqueurs par défaut
                    }).addTo(map);
                } catch (e) {
                    // Fallback : Ligne simple si Routing Machine plante
                    L.polyline([fromCoords, toCoords], { color: '#73d700', weight: 3, dashArray: '10, 10' }).addTo(map);
                }
            } else {
                console.warn(`   ⚠️ Ignoré: ${route.from} -> ${route.to} (Coordonnées manquantes pour l'un des deux)`);
            }
        });

        // 4. Centrer la carte
        if (hasRoutes && allCities.length > 0) {
            // On centre sur la première ville trouvée, ou une vue globale
            // Idéalement, on utilise un L.latLngBounds pour englober tous les points
            const group = new L.featureGroup([...addedMarkers].map(key => L.marker(cityCoordsMap.get(key))));
            if (addedMarkers.size > 0) {
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
        }

    } catch (error) {
        console.error("❌ Erreur Carte:", error);
        mapContainer.innerHTML = `<p style="text-align:center; color: #ff5555; padding-top: 200px;">Carte indisponible.</p>`;
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
                throw new Error(translation.error_generic || 'An error occurred.');
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

// DANS app.js

async function loadAllRouteTemplates() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/route-templates`);
        const data = await response.json();
        if (data.success && data.templates) {
            allRouteTemplates = data.templates;
            console.log(`✅ ${allRouteTemplates.length} modèles de trajets chargés.`);

            // ============================================
            // ✅ LOG DE DIAGNOSTIC
            // ============================================
            if (allRouteTemplates.length > 0) {
                console.log("[DIAG] Structure du premier modèle de trajet :", allRouteTemplates[0]);
            }
            // ============================================

            const options = {
                keys: ['from', 'to'],
                includeScore: true,
                threshold: 0.4
            };
            fuse = new Fuse(allRouteTemplates, options);

            // ... (logique pour activer la barre de recherche) ...
        }
    } catch (error) {
        console.error("Erreur chargement des modèles de trajets:", error);
    }
}
// DANS Frontend/app.js




// DANS app.js
async function loadAllDestinations() {
    try {
        const [destRes, popularRes] = await Promise.all([
            fetch(`${API_CONFIG.baseUrl}/api/destinations`),
            fetch(`${API_CONFIG.baseUrl}/api/popular-destinations`)
        ]);
        const destData = await destRes.json();
        const popularData = await popularRes.json();

        if (destData.success) {
            const popularCities = new Set([
                ...popularData.destinations.map(d => d.from),
                ...popularData.destinations.map(d => d.to)
            ]);

            allDestinations = destData.destinations.map(dest => ({
                ...dest,
                isPopular: popularCities.has(dest.name)
            }));

            // Initialisation de Fuse.js pour les destinations
            fuseDestinations = new Fuse(allDestinations, {
                keys: ['name', 'country'],
                includeScore: true,
                threshold: 0.4
            });
            console.log("🚀 Fuse.js pour les VILLES est initialisé.");
        }
    } catch (error) {
        console.error("Erreur chargement des destinations pour l'auto-complétion:", error);
    }
}

// Remplacez votre ancienne fonction par celle-ci

// DANS app.js

async function populatePopularDestinations() {
    const grid = document.getElementById("popular-destinations-grid");
    if (!grid) return;

    // --- 1. AFFICHER LES SQUELETTES DE CHARGEMENT ---
    // On génère le HTML pour 4 cartes squelettes.
    let skeletonHTML = '';
    for (let i = 0; i < 4; i++) {
        skeletonHTML += `
            <div class="destination-card-skeleton">
                <div class="skeleton-line" style="width: 70%;"></div>
                <div class="skeleton-line short"></div>
            </div>
        `;
    }
    // On insère les squelettes dans la grille. L'animation CSS se déclenche automatiquement.
    grid.innerHTML = skeletonHTML;

    try {
        // --- 2. FAIRE L'APPEL API ---
        const response = await fetch(`${API_CONFIG.baseUrl}/api/popular-destinations`);

        // On vérifie si la réponse réseau est OK avant de continuer
        if (!response.ok) {
            throw new Error(`Le serveur a répondu avec le statut : ${response.status}`);
        }

        const data = await response.json();

        // --- 3. GÉRER LA RÉPONSE ---
        // Si la réponse du backend indique un échec, ou si la liste est vide, on nettoie la grille.
        if (!data.success || !data.destinations || data.destinations.length === 0) {
            grid.innerHTML = ''; // Ne rien afficher est mieux qu'un message d'erreur ici.
            console.log("ℹ️ Aucune destination populaire à afficher.");
            return;
        }

        const destinations = data.destinations;
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;

        // On génère le HTML des vraies cartes, qui va remplacer les squelettes.
        grid.innerHTML = destinations.map(route => {
            const formattedPrice = Utils.formatPrice(route.price);
            const priceText = (translation.destination_price_from || (p => `À partir de ${p} FCFA`))(formattedPrice);

            return `
                <div class="destination-card" onclick="showDetailedSearch({ from: '${route.from}', to: '${route.to}' })">
                    <div class="destination-name">${route.from} → ${route.to}</div>
                    <div class="destination-price">${priceText}</div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("❌ Erreur lors du chargement des destinations populaires:", error);

        // --- 4. AFFICHER LE MESSAGE D'ERREUR ANIMÉ ---
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;

        // On remplace les squelettes par un message d'erreur visuel.
        grid.innerHTML = `
            <div class="destinations-error-state">
                <span class="error-icon">🔌</span>
                <h4>${translation.error_loading_title || "Erreur de connexion"}</h4>
                <p>${translation.error_loading_desc || "Impossible de récupérer les destinations pour le moment."}</p>
            </div>
        `;
    }
}
window.searchFromPopular = function (from, to) {
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
// ============================================
// 📅 CALENDRIER (CORRIGÉ AVEC VOTRE ID)
// ============================================
// DANS app.js
function setupDatePickers() {
    // Détruit l'ancienne instance du calendrier pour éviter les bugs
    if (appState.departurePicker) {
        appState.departurePicker.destroy();
    }

    // Récupère la langue pour la traduction du calendrier et du placeholder
    const lang = getLanguage();
    const placeholderText = translations[lang]?.search_form_dates_placeholder || "Sélectionnez vos dates";

    // Cible les éléments HTML nécessaires
    const displayInput = document.getElementById('travel-date');
    const departureValueInput = document.getElementById('departure-date-value');
    const returnValueInput = document.getElementById('return-date-value');

    // Sécurité : si un élément est manquant, on arrête pour éviter une erreur
    if (!displayInput || !departureValueInput || !returnValueInput) {
        console.error("❌ ERREUR FATALE : Un des inputs de date est manquant.");
        return;
    }

    // Configure le champ visible par l'utilisateur
    displayInput.placeholder = placeholderText;
    displayInput.readOnly = true; // Empêche le clavier mobile de s'ouvrir

    // Détermine si on est en mode "Aller-retour" ou "Aller simple"
    const isRoundTrip = document.querySelector(".trip-type-toggle")?.getAttribute("data-mode") === "round-trip";

    // Initialise le calendrier Flatpickr
    appState.departurePicker = flatpickr(displayInput, {
        dateFormat: "Y-m-d",        // Format interne
        minDate: "today",           // N'autorise pas les dates passées
        locale: lang,               // Utilise la langue FR ou EN
        mode: isRoundTrip ? "range" : "single", // Mode simple ou plage
        altInput: true,             // Affiche la date dans un format lisible
        altFormat: "d F",           // Format lisible (ex: 04 Décembre)

        // C'est ici que la magie opère. Cette fonction s'exécute quand l'utilisateur ferme le calendrier.
        onClose: function (selectedDates) {

            // Si l'utilisateur n'a rien sélectionné, on vide les champs et on arrête
            if (selectedDates.length === 0) {
                departureValueInput.value = "";
                returnValueInput.value = "";
                return;
            }

            // S'assure que les dates sont dans le bon ordre (départ avant retour)
            selectedDates.sort((a, b) => a - b);

            // ================================================
            // ✅ DÉBUT DE LA CORRECTION : FORMATAGE SANS FUSEAU HORAIRE
            // ================================================

            // Petite fonction pour convertir un objet Date en chaîne "YYYY-MM-DD"
            // Elle utilise getFullYear, getMonth, getDate qui ignorent le fuseau horaire.
            const formatDateToString = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() est 0-indexé (0=Janvier)
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // On prend la première date sélectionnée comme date de départ
            const departureDate = selectedDates[0];
            const departureDateString = formatDateToString(departureDate);

            // On met la chaîne correcte dans le champ de valeur caché
            departureValueInput.value = departureDateString;

            // Si on est en mode aller-retour
            if (isRoundTrip) {
                // On prend la deuxième date comme date de retour (s'il y en a une)
                const returnDate = selectedDates.length > 1 ? selectedDates[1] : null;
                if (returnDate) {
                    returnValueInput.value = formatDateToString(returnDate);
                } else {
                    // Si une seule date est cliquée, on considère que le retour est le même jour
                    returnValueInput.value = departureDateString;
                }
            } else {
                // Si on est en aller-simple, on s'assure que le champ de retour est vide
                returnValueInput.value = "";
            }
            // ================================================
            // ✅ FIN DE LA CORRECTION
            // ================================================
        }
    });

    console.log(`✅ Calendrier initialisé sur #travel-date en mode "${isRoundTrip ? 'range' : 'single'}"`);
}


// DANS app.js

function setupPassengerSelector() {
    const input = document.getElementById("passenger-input");
    const dropdown = document.getElementById("passenger-dropdown");

    // Si les éléments de base n'existent pas, on ne fait rien.
    if (!input || !dropdown) {
        return;
    }

    // --- Gestion des clics sur les boutons +/- ---
    dropdown.addEventListener("click", (e) => {
        const target = e.target.closest('.counter-btn');
        if (target) {
            const type = target.dataset.type;
            const action = target.dataset.action;

            // Mise à jour de l'état de l'application
            if (action === "increment") {
                appState.passengerCounts[type]++;
            } else if (action === "decrement") {
                appState.passengerCounts[type]--;
            }

            // On s'assure que les adultes sont au moins 1 et les enfants au moins 0
            appState.passengerCounts.adults = Math.max(1, appState.passengerCounts.adults);
            appState.passengerCounts.children = Math.max(0, appState.passengerCounts.children);

            // On rafraîchit l'interface après chaque changement
            updatePassengerSelectorUI();
        }
    });

    // --- Gestion de l'ouverture/fermeture du dropdown ---
    input.addEventListener("click", (e) => {
        e.stopPropagation(); // Empêche le clic de se propager et de fermer le menu
        dropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        // Si on clique en dehors de l'input ET en dehors du dropdown, on le ferme.
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("open");
        }
    });

    // --- Appel initial pour que l'UI soit correcte au chargement de la page ---
    updatePassengerSelectorUI();
}
// DANS app.js (remplacez votre fonction setupPaymentMethodToggle)
// DANS app.js (remplacez votre fonction setupPaymentMethodToggle)

function setupPaymentMethodToggle() {
    const radios = document.querySelectorAll('input[name="payment"]');
    const mtnDetails = document.getElementById("mtn-details");
    const airtelDetails = document.getElementById("airtel-details");
    const agencyDetails = document.getElementById("agency-details");

    if (!radios.length) return;

    // --- Traduire le texte initial pour l'option agence ---
    const lang = getLanguage();
    const translation = (translations && translations[lang]) ? translations[lang] : {};
    const agencySubtitle = document.getElementById('agency-payment-subtitle');
    if (agencySubtitle && typeof translation.payment_agency_desc === 'function') {
        agencySubtitle.textContent = translation.payment_agency_desc(CONFIG.AGENCY_PAYMENT_DEADLINE_HOURS);
    }

    // ========================================================
    // ✅ DÉBUT DE LA CORRECTION : Refactorisation de la logique
    // ========================================================

    // Fonction interne pour gérer la logique d'affichage
    const updateDisplay = () => {
        const selectedRadio = document.querySelector('input[name="payment"]:checked');
        if (!selectedRadio) return; // Sécurité si rien n'est coché

        const selectedValue = selectedRadio.value;

        // Cacher tous les détails
        if (mtnDetails) mtnDetails.style.display = "none";
        if (airtelDetails) airtelDetails.style.display = "none";
        if (agencyDetails) agencyDetails.style.display = "none";

        // Afficher le bon détail
        if (selectedValue === "mtn" && mtnDetails) mtnDetails.style.display = "flex";
        else if (selectedValue === "airtel" && airtelDetails) airtelDetails.style.display = "flex";
        else if (selectedValue === "agency" && agencyDetails) agencyDetails.style.display = "flex";

        // Gérer le décompteur de l'agence
        if (selectedValue === 'agency') {
            startAgencyCountdown();
        } else {
            stopAgencyCountdown();
        }
    };

    // --- Attacher les écouteurs d'événements ---
    radios.forEach(radio => {
        radio.addEventListener("change", updateDisplay);
    });

    // --- Appel initial pour afficher le bon état au chargement ---
    // C'est cette ligne qui résout le bug.
    updateDisplay();

    // ========================================================
    // ✅ FIN DE LA CORRECTION
    // ========================================================
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
// ============================================
// 🚌 RECHERCHE (AVEC DÉBOGAGE)
// ============================================
// Dans app.js

// DANS app.js

// DANS app.js (remplacez votre fonction searchBuses)

// DANS app.js, REMPLACEZ votre fonction searchBuses par celle-ci

window.searchBuses = async function () {
    console.log("1️⃣ Lancement de searchBuses...");
    resetBookingState();

    if (typeof resetFilters === 'function') {
        resetFilters(true); // Réinitialise les filtres en mode silencieux
    }

    try {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;

        const origin = document.getElementById("origin-input").value.trim();
        const destination = document.getElementById("destination-input").value.trim();
        const departureDate = document.getElementById("departure-date-value").value;
        let returnDate = document.getElementById("return-date-value").value;

        const tripType = document.querySelector(".trip-type-toggle").getAttribute("data-mode");
        if (tripType === "round-trip" && departureDate && !returnDate) {
            returnDate = departureDate;
        }

        // --- Validations des entrées ---
        if (!origin) {
            Utils.showToast(translation.error_search_missing_origin, 'error');
            return;
        }
        if (!destination) {
            Utils.showToast(translation.error_search_missing_destination, 'error');
            return;
        }
        if (!departureDate) {
            Utils.showToast(translation.error_search_missing_date, 'error');
            return;
        }
        if (origin.toLowerCase() === destination.toLowerCase()) {
            Utils.showToast(translation.error_same_origin_destination, 'error');
            return;
        }

        appState.currentSearch = {
            origin, destination, date: departureDate, returnDate,
            passengers: appState.passengerCounts.adults + appState.passengerCounts.children,
            tripType
        };

        // ========================================================
        // ✅ AMÉLIORATION : AFFICHAGE DES SQUELETTES DE CHARGEMENT
        // ========================================================

        // On affiche la page de résultats immédiatement
        showPage("results");

        const resultsList = document.getElementById("results-list");
        const summary = document.getElementById("search-summary");

        // On affiche un résumé temporaire et les squelettes
        if (summary) summary.innerHTML = `<div class="skeleton-line" style="height: 20px; width: 70%; margin: 0 auto;"></div>`;
        if (resultsList) {
            let skeletonHTML = '';
            for (let i = 0; i < 4; i++) { // On affiche 4 squelettes pour un effet plus réaliste
                skeletonHTML += `
                    <div class="bus-card-skeleton">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="skeleton-line title" style="width: 200px;"></div>
                                <div class="skeleton-line text" style="width: 250px;"></div>
                                <div class="skeleton-line text-short" style="width: 150px;"></div>
                            </div>
                            <div class="skeleton-line button" style="height: 48px; width: 120px;"></div>
                        </div>
                    </div>
                `;
            }
            resultsList.innerHTML = skeletonHTML;
        }
        // ========================================================

        console.log("3️⃣ Envoi de la requête API...");

        const response = await fetch(`${API_CONFIG.baseUrl}/api/search?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${departureDate}`);
        console.log("4️⃣ Réponse reçue du serveur :", response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Réponse non JSON" }));
            throw new Error(errorData.error || translation.error_search_failed);
        }

        const data = await response.json();
        console.log("5️⃣ Données JSON parsées:", data);

        if (data.success) {
            appState.currentResults = data.results;

            if (data.results && data.results.length > 0) {
                // `displayResults` va maintenant remplacer les squelettes par les vrais résultats
                displayResults(data.results);
            } else if (data.alternativeTrips && data.alternativeTrips.length > 0) {
                displayAlternativeTrips(data.alternativeTrips);
            } else {
                displayResults([]); // Affiche le message "Aucun trajet"
            }
        } else {
            appState.currentResults = [];
            displayResults([]);
            throw new Error(data.error || "Données invalides.");
        }

    } catch (error) {
        // En cas d'erreur, on s'assure de nettoyer la page de résultats
        const resultsList = document.getElementById("results-list");
        if (resultsList) {
            resultsList.innerHTML = `<div class="no-results error"><h3>${error.message || translation.error_generic}</h3><p>Veuillez réessayer.</p></div>`;
        }
        console.error('❌ Erreur critique dans searchBuses:', error);
        Utils.showToast(error.message || (translation.error_generic || "Une erreur est survenue."), 'error');
    }
}

// DANS app.js (ajoutez cette nouvelle fonction)

// DANS app.js (remplacez cette fonction)

function displayAlternativeTrips(alternatives) {
    const resultsList = document.getElementById("results-list");
    const summary = document.getElementById("search-summary");
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // ========================================================
    // ✅ AJOUTEZ CE BLOC DE DIAGNOSTIC
    // ========================================================
    console.log(`[DIAG] Langue active : ${lang}`);
    console.log("[DIAG] Objet de traduction complet pour cette langue :", translation);
    console.log("[DIAG] Tentative de lecture de 'alternative_trips_title' :", translation.alternative_trips_title);

    // ========================================================
    // ✅ DÉBUT DE LA CORRECTION
    // ========================================================
    if (summary) {
        // 1. On récupère la chaîne de traduction
        let summaryText = translation.no_trips_found_for_date || "Aucun trajet trouvé pour le {date}";

        // 2. On formate la date que l'on veut insérer
        const formattedDate = Utils.formatDate(appState.currentSearch.date, lang);

        // 3. On remplace le placeholder {date} par la date formatée
        summary.innerHTML = summaryText.replace('{date}', `<strong>${formattedDate}</strong>`);
    }
    // ========================================================
    // ✅ FIN DE LA CORRECTION
    // ========================================================

    let alternativesHTML = `
        <div class="no-results alternative-suggestions">
            <h3>${translation.alternative_trips_title}</h3>
            <p>${translation.alternative_trips_desc}</p>
            <div class="alternative-trips-list">
    `;

    alternatives.forEach(alt => {
        // Cette partie est déjà correcte car elle utilise une fonction
        const tripCountText = (typeof translation.trips_available === 'function')
            ? translation.trips_available(alt.tripCount)
            : `${alt.tripCount} trajet(s) disponible(s)`;

        alternativesHTML += `
            <div class="alternative-trip-card" onclick="searchForAlternativeDate('${alt.date}')">
                <div class="alt-date">${Utils.formatDate(alt.date, lang)}</div>
                <div class="alt-info">
                    <span class="alt-count">${tripCountText}</span>
                    <span class="alt-action">${translation.view_trips_button} →</span>
                </div>
            </div>
        `;
    });

    alternativesHTML += `</div></div>`;
    resultsList.innerHTML = alternativesHTML;
}

// Fonction helper pour relancer la recherche

function searchForAlternativeDate(newDate) {
    console.log(`🔄 Relance de la recherche pour la date alternative : ${newDate}`);

    // Mettre à jour la valeur cachée utilisée pour la recherche
    const departureValueInput = document.getElementById('departure-date-value');
    if (departureValueInput) {
        departureValueInput.value = newDate;
    }

    // Mettre à jour la valeur visible dans le calendrier Flatpickr
    const displayInput = document.getElementById('travel-date');
    if (displayInput && displayInput._flatpickr) {
        displayInput._flatpickr.setDate(newDate, true); // 'true' déclenche l'événement onChange pour mettre à jour l'affichage
    }

    // Relancer la recherche
    searchBuses();
}











// DANS app.js (remplacez votre fonction setupSmartSearch)

// DANS app.js (remplacez votre fonction setupSmartSearch)

function setupSmartSearch() {
    const searchInput = document.getElementById('smart-search-input');
    const submitBtn = document.getElementById('smart-search-submit-btn');
    const resultsContainer = document.getElementById('smart-search-results');

    if (!searchInput || !submitBtn || !resultsContainer) {
        console.error("[setupSmartSearch] Un des éléments HTML de la recherche est introuvable.");
        return;
    }

    // Fonction interne pour afficher le formulaire détaillé
    const triggerDetailedSearch = (prefillData = {}) => {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        showDetailedSearch(prefillData);
    };

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
        const query = searchInput.value.trim();

        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            return;
        }

        // ========================================================
        // ✅ DÉBUT DU BLOC DE DIAGNOSTIC
        // ========================================================

        // LOG 1 : On vérifie si l'instance de Fuse est prête
        if (!fuse) {
            console.warn("[DIAG] L'instance de Fuse.js est 'null'. La recherche ne peut pas se faire. Le chargement des données n'est probablement pas terminé.");
            return;
        }
        console.log("[DIAG] L'instance de Fuse.js est prête, on lance la recherche.");

        // On lance la recherche floue
        const fuseResults = fuse.search(query);

        // LOG 2 : On affiche le résultat brut de la recherche
        console.log(`[DIAG] Fuse.js a cherché "${query}". ${fuseResults.length} résultat(s) brut(s) trouvé(s) :`, fuseResults);

        const filteredRoutes = fuseResults.map(result => result.item);

        // LOG 3 : On vérifie si on a bien des trajets à afficher
        if (filteredRoutes.length === 0) {
            console.log("[DIAG] Aucun trajet à afficher après mapping. La fonction displaySmartSearchResults ne sera pas appelée avec des données.");
        }

        // ========================================================
        // ✅ FIN DU BLOC DE DIAGNOSTIC
        // ========================================================

        // On affiche les 5 meilleurs résultats
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


// DANS app.js (remplacez votre fonction showDetailedSearch)

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

    // ========================================================
    // ✅ DÉBUT DE LA MISE À JOUR
    // ========================================================

    // --- On cible les nouveaux <input> de texte ---
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const travelDateInput = document.getElementById('travel-date');

    // --- On ne peuple plus les <select>, donc on supprime cette partie ---
    // if (typeof populateCitySelects === 'function') {
    //     await populateCitySelects();
    // }

    // --- On traduit les placeholders des nouveaux inputs ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    if (originInput && translation.search_city_placeholder) {
        originInput.placeholder = translation.search_city_placeholder;
    }
    if (destinationInput && translation.search_city_placeholder) {
        destinationInput.placeholder = translation.search_city_placeholder;
    }

    // --- On pré-remplit les valeurs avec les bons ID ---
    if (prefillData) {
        if (prefillData.from && originInput) {
            originInput.value = prefillData.from;
        }
        if (prefillData.to && destinationInput) {
            destinationInput.value = prefillData.to;
        }
    }

    // --- Initialisation du calendrier (inchangé) ---
    if (typeof setupDatePickers === 'function') {
        setupDatePickers();
    }

    // --- Logique de focus plus robuste qui vérifie l'existence des éléments ---
    if (prefillData.from && prefillData.to && travelDateInput) {
        travelDateInput.focus();
    } else if (prefillData.to && originInput) {
        originInput.focus();
    } else if (destinationInput && !destinationInput.value) {
        // Met le focus sur la destination si elle est vide
        destinationInput.focus();
    } else if (originInput) {
        // Sinon, met le focus sur l'origine par défaut
        originInput.focus();
    }

    // ========================================================
    // ✅ FIN DE LA MISE À JOUR
    // ========================================================
}


// ============================================
// 🔍 FILTRAGE ET TRI DES RÉSULTATS
// ============================================

function applyFiltersAndSort(results) { // ✅ Paramètre ajouté
    // ✅ Utilise les résultats passés en paramètre (ou ceux de l'état global par défaut)
    let filteredResults = [...results];

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

    // ✅ Filtre par lieu de départ
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

// DANS app.js (remplacez votre fonction updateFilter)

window.updateFilter = function (filterType, value) {
    // La première partie de la fonction qui met à jour l'objet 'activeFilters' est correcte et reste inchangée.
    switch (filterType) {
        case 'company':
        case 'tripType':
        case 'departureTime':
        case 'sortBy':
        case 'departureLocation':
            activeFilters[filterType] = value;
            break;

        case 'priceMin':
            activeFilters.priceRange.min = parseInt(value) || 0;
            // On s'assure que l'élément existe avant de le modifier
            const priceMinDisplay = document.getElementById('price-min-display');
            if (priceMinDisplay) {
                priceMinDisplay.textContent = Utils.formatPrice(activeFilters.priceRange.min);
            }
            break;

        case 'priceMax':
            activeFilters.priceRange.max = parseInt(value) || 100000;
            // On s'assure que l'élément existe avant de le modifier
            const priceMaxDisplay = document.getElementById('price-max-display');
            if (priceMaxDisplay) {
                priceMaxDisplay.textContent = Utils.formatPrice(activeFilters.priceRange.max);
            }
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

    // ========================================================
    // ✅ DÉBUT DE LA MISE À JOUR DE LA LOGIQUE
    // ========================================================

    // On rafraîchit l'affichage en appelant displayResults.
    // On lui passe TOUJOURS la liste complète et non filtrée des résultats de la recherche initiale.
    displayResults(appState.currentResults, appState.isSelectingReturn);

    // On vérifie le nombre de résultats APRÈS que displayResults ait fait son travail de filtrage.
    // 'appState.displayedResults' contient maintenant la liste réellement affichée.
    if (appState.displayedResults.length === 0) {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        Utils.showToast(translation.info_no_trips_match_filters, 'info');
    }

    // ========================================================
    // ✅ FIN DE LA MISE À JOUR
    // ========================================================
};




// ============================================
// 🌪️ GESTION MENU FILTRES MOBILE
// ============================================
function setupMobileFilterToggle() {
    const filterContainer = document.querySelector('.filters-bar-enhanced');

    // Sécurité : si pas de filtres, on arrête
    if (!filterContainer) return;

    // Vérifier si le bouton existe déjà pour ne pas le dupliquer

    if (document.getElementById('mobile-filter-toggle')) return;

    // ✅ ON RÉCUPÈRE LA TRADUCTION
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const btnText = translation.filter_toggle_button || "Filtrer & Trier";

    // 1. Création du bouton
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'mobile-filter-toggle';
    toggleBtn.type = 'button';
    toggleBtn.innerHTML = `
        <span style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2em;">🌪️</span> 
            ${btnText}
        </span>
        <span class="toggle-icon">▼</span>
    `;

    // 2. Insertion avant les filtres
    filterContainer.parentNode.insertBefore(toggleBtn, filterContainer);

    // 3. Gestion du clic
    toggleBtn.addEventListener('click', () => {
        const isOpen = filterContainer.classList.contains('open');

        if (isOpen) {
            filterContainer.classList.remove('open');
            toggleBtn.classList.remove('active');
        } else {
            filterContainer.classList.add('open');
            toggleBtn.classList.add('active');
        }
    });
}







// DANS app.js (remplacez votre fonction resetFilters)
// DANS app.js (remplacez votre fonction resetFilters)

window.resetFilters = function (isSilent = false) { // ✅ Paramètre ajouté
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

    const companySelect = document.getElementById('filter-company');
    if (companySelect) companySelect.value = 'all';

    const tripTypeSelect = document.getElementById('filter-trip-type');
    if (tripTypeSelect) tripTypeSelect.value = 'all';

    const timeSelect = document.getElementById('filter-time');
    if (timeSelect) timeSelect.value = 'all';

    const sortBySelect = document.getElementById('sort-by');
    if (sortBySelect) sortBySelect.value = 'departure';

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

    // 3. Rafraîchir l'affichage en utilisant la liste BRUTE originale
    displayResults(appState.currentResults, appState.isSelectingReturn);

    // ========================================================
    // ✅ CORRECTION ICI : Affichage conditionnel du toast
    // ========================================================
    // 4. On n'affiche le toast que si ce n'est pas un reset "silencieux"
    if (!isSilent) {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;
        Utils.showToast(translation.success_filters_reset, 'success');
    }
    // ========================================================
};
// DANS app.js, REMPLACEZ la fonction displayResults

// DANS app.js (remplacez votre fonction displayResults)
// DANS app.js (remplacez votre fonction displayResults par celle-ci)
// DANS app.js (remplacez votre fonction displayResults par celle-ci)

// DANS app.js (remplacez votre fonction displayResults)
// DANS app.js (remplacez votre fonction displayResults par celle-ci)

function displayResults(results, isReturn = false) {
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    const summary = document.getElementById("search-summary");
    const resultsList = document.getElementById("results-list");
    const legendContainer = document.getElementById("amenities-legend");
    const locationFilterSection = document.getElementById('departure-location-filter-section');
    const locationSelect = document.getElementById('filter-departure-location');

    const filteredAndSortedResults = applyFiltersAndSort(results);
    appState.displayedResults = filteredAndSortedResults;

    let summaryText = isReturn
        ? translation.results_summary_return(filteredAndSortedResults.length, appState.currentSearch.destination, appState.currentSearch.origin)
        : translation.results_summary_outbound(filteredAndSortedResults.length, appState.currentSearch.origin, appState.currentSearch.destination);
    if (summary) summary.innerHTML = summaryText;

    if (locationFilterSection && locationSelect) {
        const uniqueLocations = [...new Set(results.map(t => t.departureLocation).filter(Boolean))];
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

    let cheapestId = null, fastestId = null;
    if (filteredAndSortedResults.length > 1) {
        const minPrice = Math.min(...filteredAndSortedResults.map(r => r.price));
        const cheapestRoute = filteredAndSortedResults.find(r => r.price === minPrice);
        if (cheapestRoute) cheapestId = cheapestRoute.id;

        const directTrips = filteredAndSortedResults.filter(r => r.tripType === 'direct');
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

    if (filteredAndSortedResults.length === 0) {
        const totalBeforeFilters = results?.length || 0;
        if (totalBeforeFilters > 0) {
            resultsList.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 48px;">
                    <h3>${translation.results_no_results_title}</h3>
                    <p style="color: var(--color-text-secondary); margin: 16px 0;">
                        ${translation.info_trips_available_before_filter(totalBeforeFilters)}
                    </p>
                    <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 16px;">
                        ${translation.filter_reset_button}
                    </button>
                </div>`;
        } else {
            resultsList.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 48px;">
                    <h3>${translation.info_no_trips_found}</h3>
                    <p>${translation.results_no_results_desc}</p>
                </div>`;
        }
        return;
    }

    resultsList.innerHTML = filteredAndSortedResults.map(route => {
        let badgeHTML = '';
        if (route.isNightTrip) {
            badgeHTML = `<div class="highlight-badge" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">${translation.badge_night_trip}</div>`;
        } else if (route.highlightBadge) {
            badgeHTML = `<div class="highlight-badge">${route.highlightBadge}</div>`;
        } else if (route.id === cheapestId) {
            badgeHTML = `<div class="highlight-badge cheapest">${translation.badge_cheapest}</div>`;
        } else if (route.id === fastestId) {
            badgeHTML = `<div class="highlight-badge fastest">${translation.badge_fastest}</div>`;
        }

        const amenitiesHTML = route.amenities.map(amenity =>
            `<div class="amenity-item" title="${(translation.amenity_labels || {})[amenity] || amenity}">${Utils.getAmenityIcon(amenity)}</div>`
        ).join("");

        const departureLocationHTML = route.departureLocation
            ? `<div class="bus-card-location">${translation.departure_location_label(route.departureLocation)}</div>`
            : '';

        let tripDetailsHTML = '';
        if (route.stops && route.stops.length > 0) {
            tripDetailsHTML += `<div class="trip-details-accordion"><div class="accordion-header" onclick="toggleTripDetails(this)"><span class="bus-card-trip-details"><span class="accordion-icon">▶</span><span>${translation.details_stops_planned} </span><strong class="bus-card-stops">${translation.details_stops_count(route.stops.length)}</strong></span></div><div class="accordion-content">${route.stops.map(stop => `<div class="accordion-content-item">🛑 <strong>${stop.city}</strong> (${stop.duration})</div>`).join('')}</div></div>`;
        }
        if (route.connections && route.connections.length > 0) {
            tripDetailsHTML += `<div class="trip-details-accordion" style="margin-top: 4px;"><div class="accordion-header" onclick="toggleTripDetails(this)"><span class="bus-card-trip-details" style="color: #00d9ff;"><span class="accordion-icon">▶</span><span>${translation.details_connections} </span><strong class="bus-card-stops">${translation.details_connections_count(route.connections.length)}</strong></span></div><div class="accordion-content">${route.connections.map(conn => `<div class="accordion-content-item">⇄ ${translation.details_connection_info(conn.at, conn.waitTime)}<br><small>${translation.details_next_bus_info(conn.nextCompany, conn.nextBusNumber, conn.nextDeparture)}</small></div>`).join('')}</div></div>`;
        }
        if (tripDetailsHTML === '') {
            tripDetailsHTML = `<div class="bus-card-trip-details" style="color: #73d700;">${Utils.getAmenityIcon('direct')}<span>${translation.details_direct_trip}</span></div>`;
        }

        const arrivalDisplay = route.isNightTrip && route.arrivalDaysOffset > 0
            ? `<div class="arrival-time-wrapper"><span>${route.arrival}</span><small>+${route.arrivalDaysOffset}j</small></div>`
            : `<div class="arrival-time-wrapper"><span>${route.arrival}</span></div>`;

        let tripTitleHTML;
        if (route.isSegment) {
            tripTitleHTML = `<div class="bus-card-trip-title" style="font-size: 0.9em; color: var(--color-text-secondary);">${translation.segment_on_line(route.from, route.to)}</div><div class="bus-card-segment-info" style="font-size: 1.2em; font-weight: 700; margin-top: 4px;">${translation.segment_your_trip} <strong>${route.segmentFrom} → ${route.segmentTo}</strong></div>`;
        } else {
            tripTitleHTML = `<div class="bus-card-trip-title" style="font-size: 1.2em; font-weight: 700;">${route.from} → ${route.to}</div>`;
        }

        let alertsHTML = '';
        if (route.route.alerts && route.route.alerts.length > 0) {
            const alertIcons = { info: 'ℹ️', warning: '⚠️', danger: '🛑' };
            alertsHTML = `<div class="bus-card-alerts">${route.route.alerts.map(alert => `<div class="alert-item ${alert.type}">${alertIcons[alert.type] || 'ℹ️'} ${alert.message}</div>`).join('')}</div>`;
        }

        // ============================================
        // ✅ CORRECTION LOGIQUE BUS COMPLET
        // ============================================
        let buttonHTML = '';
        let seatsInfoHTML = '';

        if (route.availableSeats > 0) {
            // Si sièges dispo: bouton normal
            buttonHTML = `<button class="btn btn-primary" onclick="selectBus('${route.id}')">${translation.button_select}</button>`;
            seatsInfoHTML = `<strong>${route.availableSeats}</strong> ${translation.seats_available}`;
        } else {
            // Si bus plein: bouton désactivé avec texte "COMPLET" traduit
            buttonHTML = `<button class="btn btn-disabled" disabled>${translation.button_full || 'COMPLET'}</button>`;
            seatsInfoHTML = `<strong style="color: #ef5350;">${translation.button_full || 'COMPLET'}</strong>`;
        }
        // ============================================

        return `
            <div class="bus-card">
                ${badgeHTML}
                <div class="bus-card-wrapper">
                    <div class="bus-card-main">
                        ${tripTitleHTML}
                        <div class="bus-card-time">
                            <span>${route.departure}</span>
                            <div class="bus-card-duration">
                                <span>→</span><br>
                                ${route.duration || 'N/A'}
                            </div>
                            ${arrivalDisplay}
                        </div>
                        ${departureLocationHTML}
                        <div class="bus-card-company">${route.company}</div>
                        ${tripDetailsHTML}
                        <div class="bus-card-details">
                            <div class="bus-amenities">${amenitiesHTML}</div>
                            <div class="bus-seats">${seatsInfoHTML}</div>
                        </div>
                        ${alertsHTML} 
                    </div>
                    <div class="bus-card-pricing">
                        <div class="bus-price">${Utils.formatPrice(route.price)} FCFA</div>
                        ${buttonHTML}
                    </div>
                </div>
            </div>
        `;
    }).join("");

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
window.toggleTripDetails = function (element) {
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
window.selectBus = async function (busId) {
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
// DANS app.js (remplacez l'ancienne fonction par celle-ci)

async function searchReturnTrips() {
    try {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;

        Utils.showToast(translation.toast_select_return_bus, 'info');

        const response = await fetch(
            `${API_CONFIG.baseUrl}/api/search?from=${encodeURIComponent(appState.currentSearch.destination)}&to=${encodeURIComponent(appState.currentSearch.origin)}&date=${appState.currentSearch.returnDate}`
        );

        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des trajets retour');
        }

        const data = await response.json();

        if (data.count === 0) {
            // ===============================================
            // ✅ DÉBUT DE LA CORRECTION
            // ===============================================

            // Affiche un toast traduit
            Utils.showToast(translation.info_no_return_trips_found, 'warning');

            // Utilise la modale personnalisée et stylisée
            const confirmed = await showCustomConfirm({
                title: translation.confirm_no_return_title,
                message: translation.confirm_no_return_desc,
                icon: '😢',
                confirmText: translation.button_modify_search,
                cancelText: translation.button_cancel, // Clé déjà existante
                confirmClass: 'btn-primary' // Pour avoir un bouton vert/bleu
            });

            if (confirmed) {
                showPage("home");
            }
            // Si l'utilisateur clique sur "Annuler", la modale se ferme et rien ne se passe.

            // ===============================================
            // ✅ FIN DE LA CORRECTION
            // ===============================================
        } else {
            appState.currentResults = data.results;
            displayResults(data.results, true); // true = mode retour
            showPage("results");
            // Utilisons une clé de traduction pour ce toast aussi
            Utils.showToast(translation.success_trips_found(data.count), 'success');
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

window.toggleSeat = function (seatNumber) {
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
// DANS app.js, remplacez la fonction displaySeats par celle-ci

async function displaySeats() { // ✅ On ajoute "async" ici
    // 1. Récupération des traductions avec une sécurité
    const lang = getLanguage();
    const translation = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};

    // 2. Récupération des données et des éléments DOM
    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;
    const currentOccupied = appState.isSelectingReturn ? appState.occupiedReturnSeats : appState.occupiedSeats;

    const busInfo = document.getElementById("bus-info");
    const seatGrid = document.getElementById("pro-seat-grid");
    const occupancyInfo = document.getElementById("trip-occupancy-info");

    if (!busInfo || !seatGrid || !occupancyInfo) return;

    // ========================================================
    // ✅ DÉBUT DE LA CORRECTION
    // ========================================================

    // 3. Calcul dynamique des prix et traduction de l'en-tête du bus
    const tripLabel = appState.isSelectingReturn ? (translation.trip_badge_return || "RETOUR") : (translation.trip_badge_outbound || "ALLER");

    const adultPrice = currentBus.price || 0;

    // On ATTEND que la fonction asynchrone getChildPrice nous retourne le bon prix
    const childPrice = await getChildPrice(adultPrice);

    busInfo.innerHTML = `
        <div class="bus-info-header">
            <div class="trip-badge ${appState.isSelectingReturn ? 'return' : 'outbound'}">${tripLabel}</div>
            <h3>${currentBus.company} - ${currentBus.from} → ${currentBus.to}</h3>
            <div class="price-info">
                <span class="price-item"><strong>${translation.seats_price_info_adult || 'Adulte'}:</strong> ${Utils.formatPrice(adultPrice)} FCFA</span>
                <span class="price-divider">|</span>
                <span class="price-item"><strong>${translation.seats_price_info_child || 'Enfant'}:</strong> ${Utils.formatPrice(Math.round(childPrice))} FCFA</span>
            </div>
        </div>
    `;

    // ========================================================
    // ✅ FIN DE LA CORRECTION
    // ========================================================


    // 4. Traduction des informations d'occupation du bus (inchangé)
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

    // 5. Génération de la grille des sièges (inchangé)
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

    seatHTML += `</div>`;

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

    // 6. Appel final pour mettre à jour le résumé (inchangé)
    updateSeatSummary();
}

// ========================================================
// ✅ AJOUTEZ CETTE FONCTION DANS VOTRE FICHIER
// ========================================================
/**
 * Calcule le prix d'un billet enfant en fonction des règles globales.
 * @param {number} adultPrice - Le prix du billet adulte pour le trajet.
 * @returns {number} Le prix calculé pour un enfant.
 */
// DANS app.js
// Pas besoin qu'elle soit 'async' car 'appRules' est déjà chargé.
// DANS app.js
function getChildPrice(adultPrice) {
    const rules = appRules.ticketing;
    console.log(`5️⃣ [DIAG] Calcul du prix enfant. Mode actif : '${rules.childPricingMode}'`);

    if (rules.childPricingMode === 'fixed') {
        console.log(`   -> [DIAG] Utilisation du prix fixe : ${rules.childFixedPrice}`);
        return rules.childFixedPrice || 0;
    } else {
        const discount = (rules.childDiscountPercentage || 0) / 100;
        const calculatedPrice = adultPrice * (1 - discount);
        console.log(`   -> [DIAG] Utilisation du pourcentage (${rules.childDiscountPercentage}%). Prix calculé : ${calculatedPrice}`);
        return calculatedPrice;
    }
}
// ========================================================





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
// DANS app.js (remplacez votre fonction updateSeatSummary)

// DANS app.js (remplacez votre fonction updateSeatSummary)

// DANS app.js (remplacez votre fonction updateSeatSummary)

async function updateSeatSummary() {
    const lang = getLanguage();
    const translation = (translations && translations[lang]) ? translations[lang] : {};

    const currentBus = appState.isSelectingReturn ? appState.selectedReturnBus : appState.selectedBus;
    const currentSeats = appState.isSelectingReturn ? appState.selectedReturnSeats : appState.selectedSeats;

    const seatsDisplay = document.getElementById("selected-seats-display");
    const priceDisplay = document.getElementById("total-price-display");

    if (!seatsDisplay || !priceDisplay) {
        console.error("ERREUR FATALE: Les éléments seatsDisplay ou priceDisplay sont introuvables.");
        return;
    }

    if (!currentBus) {
        seatsDisplay.textContent = translation.seats_summary_none || "Aucun";
        priceDisplay.textContent = "0 FCFA";
        return;
    }

    if (currentSeats.length === 0) {
        seatsDisplay.textContent = translation.seats_summary_none || "Aucun";
        priceDisplay.textContent = "0 FCFA";
    } else {
        seatsDisplay.textContent = currentSeats.join(", ");

        // ========================================================
        // ✅ DÉBUT DE LA CORRECTION
        // ========================================================

        const adultPrice = currentBus.price;

        // On utilise la fonction helper qui contient la logique 'if/else'
        // pour déterminer si on doit utiliser le prix fixe ou le pourcentage.
        const childPrice = await getChildPrice(adultPrice);

        const numSeats = currentSeats.length;
        const numAdults = appState.passengerCounts.adults;

        const adultsSelected = Math.min(numSeats, numAdults);
        const childrenSelected = numSeats - adultsSelected;

        const totalPrice = (adultsSelected * adultPrice) + (childrenSelected * childPrice);

        priceDisplay.textContent = Utils.formatPrice(Math.round(totalPrice)) + " FCFA";

        // ========================================================
        // ✅ FIN DE LA CORRECTION
        // ========================================================
    }
}
// Dans app.js
window.proceedToPassengerInfo = async function () {
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
// DANS app.js (remplacez votre fonction updateBookingSummary)

function updateBookingSummary() {
    const summaryContainer = document.getElementById("booking-summary");
    if (!summaryContainer) {
        // Si le conteneur n'est pas sur la page actuelle, on ne fait rien.
        return;
    }

    // --- Sécurisation des données en entrée ---
    const bus = appState.selectedBus;
    const passengers = appState.passengerCounts;
    const seats = appState.selectedSeats;
    const baggage = appState.baggageCounts;

    // Si le bus ou son prix est manquant, on ne peut pas calculer.
    // On affiche un total de 0 pour éviter un crash.
    if (!bus || typeof bus.price !== 'number') {
        console.warn("[DIAG] updateBookingSummary: Données de bus ou prix manquantes. Calcul impossible.");
        summaryContainer.innerHTML = `<div class="detail-row total-row"><span>PRIX TOTAL:</span><strong>0 FCFA</strong></div>`;
        return;
    }

    // ========================================================
    // ✅ NOUVELLE LOGIQUE DE CALCUL
    // ========================================================

    // --- Calcul du prix des billets ---
    const adultPrice = bus.price;
    const childPrice = getChildPrice(adultPrice); // Utilise la fonction helper (fixe ou %)

    const numAdultsSeats = Math.min(seats.length, passengers.adults);
    const numChildrenSeats = seats.length - numAdultsSeats;

    const ticketsPrice = (numAdultsSeats * adultPrice) + (numChildrenSeats * childPrice);

    // --- Calcul du prix des bagages ---
    const baggageOptions = bus.baggageOptions || { standard: { price: 0 }, oversized: { price: 0 } };
    let totalStandardBaggage = 0;
    let totalOversizedBaggage = 0;

    if (baggage && Object.keys(baggage).length > 0) {
        Object.values(baggage).forEach(paxBaggage => {
            totalStandardBaggage += paxBaggage.standard || 0;
            totalOversizedBaggage += paxBaggage.oversized || 0;
        });
    }

    const standardBaggagePrice = totalStandardBaggage * baggageOptions.standard.price;
    const oversizedBaggagePrice = totalOversizedBaggage * baggageOptions.oversized.price;
    const totalBaggagePrice = standardBaggagePrice + oversizedBaggagePrice;

    // --- Calcul du prix total ---
    const totalPrice = ticketsPrice + totalBaggagePrice;

    // ========================================================
    // ✅ FIN DE LA NOUVELLE LOGIQUE
    // ========================================================

    // --- Mise à jour de l'affichage ---
    summaryContainer.innerHTML = `
        <div class="detail-row"><span>Itinéraire:</span><strong>${bus.from} → ${bus.to}</strong></div>
        <div class="detail-row"><span>Date:</span><strong>${Utils.formatDate(appState.currentSearch.date)}</strong></div>
        <div class="detail-row"><span>Passagers:</span><strong>${appState.currentSearch.passengers} (${passengers.adults} Adulte(s), ${passengers.children} Enfant(s))</strong></div>
        <div class="detail-row"><span>Sièges:</span><strong>${seats.join(", ")}</strong></div>
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row"><span>Prix des billets:</span><strong>${Utils.formatPrice(Math.round(ticketsPrice))} FCFA</strong></div>
        <div class="detail-row"><span>Bagages standard (${totalStandardBaggage}):</span><strong>+ ${Utils.formatPrice(Math.round(standardBaggagePrice))} FCFA</strong></div>
        <div class="detail-row"><span>Bagages hors format (${totalOversizedBaggage}):</span><strong>+ ${Utils.formatPrice(Math.round(oversizedBaggagePrice))} FCFA</strong></div>
        <hr style="border-color: var(--color-border); margin: 8px 0;">
        <div class="detail-row total-row"><span>PRIX TOTAL:</span><strong>${Utils.formatPrice(Math.round(totalPrice))} FCFA</strong></div>
    `;

    // --- Mise à jour des champs de paiement (inchangé) ---
    const bookingRef = document.getElementById("mtn-booking-ref")?.value || Utils.generateBookingNumber();
    const amountStr = `${Utils.formatPrice(Math.round(totalPrice))} FCFA`;

    ['mtn', 'airtel', 'agency'].forEach(method => {
        const amountInput = document.getElementById(`${method}-amount`);
        const refInput = document.getElementById(`${method}-booking-ref`);
        if (amountInput) amountInput.value = amountStr;
        if (refInput) refInput.value = bookingRef;
    });
}
// DANS app.js, REMPLACEZ la fonction proceedToPayment par celle-ci
// DANS app.js

// DANS app.js (remplacez TEMPORAIREMENT votre fonction)

// DANS app.js (restaurez la version finale)
// DANS app.js (remplacez cette fonction)

window.proceedToPayment = async function () {
    console.log('🟢 proceedToPayment() appelée. Étape 1: Validation des passagers...');

    // --- 1. Validation et remplissage de appState.passengerInfo ---
    appState.passengerInfo = []; // On réinitialise la liste
    let allFieldsValid = true;

    if (!appState.baggageCounts) {
        appState.baggageCounts = {};
    }

    for (let i = 0; i < appState.currentSearch.passengers; i++) {
        const nameInput = document.getElementById(`name-${i}`);
        const phoneInput = document.getElementById(`phone-${i}`);
        const emailInput = document.getElementById(`email-${i}`);

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

        const passengerBaggage = appState.baggageCounts[i] || { standard: 0, oversized: 0 };

        // On remplit le tableau 'passengerInfo'
        appState.passengerInfo.push({
            seat: appState.selectedSeats[i],
            name: name,
            phone: phone,
            email: email,
            baggage: passengerBaggage
        });
    }

    if (!allFieldsValid) {
        console.log("❌ Validation des passagers échouée. Arrêt.");
        return;
    }
    console.log("✅ Validation des passagers réussie. 'appState.passengerInfo' est rempli :", appState.passengerInfo);

    // --- 2. Affichage de la modale de confirmation des documents ---
    console.log("   Étape 2: Affichage de la checklist des documents...");
    const documentsConfirmed = await showDocumentChecklist();

    // --- 3. Navigation vers le paiement si confirmé ---
    if (documentsConfirmed) {
        console.log("   Étape 3: Documents confirmés. Navigation vers la page de paiement.");
        displayBookingSummary();
        showPage("payment");
    } else {
        console.log("❌ L'utilisateur a annulé la confirmation des documents.");
    }
}

// DANS app.js, ajoutez cette nouvelle fonction
// DANS app.js
// DANS app.js (remplacez votre fonction showDocumentChecklist)

async function showDocumentChecklist() {
    console.log("2️⃣ [DIAG] Entrée dans showDocumentChecklist. Préparation de la modale...");
    try {
        const lang = getLanguage();
        const translation = translations[lang] || translations.fr;

        // ========================================================
        // ✅ DÉBUT DE LA CORRECTION : Logique de juridiction améliorée
        // ========================================================

        let isInternational = false;

        // 1. On vérifie si le trajet aller est international
        if (appState.selectedBus?.route?.jurisdiction === 'international') {
            isInternational = true;
        }

        // 2. S'il y a un trajet retour, on le vérifie aussi. Si L'UN des deux est international, le voyage entier l'est.
        if (appState.selectedReturnBus?.route?.jurisdiction === 'international') {
            isInternational = true;
        }

        console.log(`   -> [DIAG] Juridiction finale calculée : ${isInternational ? 'international' : 'national'}`);

        // ========================================================
        // ✅ FIN DE LA CORRECTION
        // ========================================================

        let checklistItemsHTML = '';

        // On utilise la nouvelle variable 'isInternational' pour décider quelle checklist afficher
        if (isInternational) {
            checklistItemsHTML = `
                <p>${translation.docs_international_intro}</p>
                <ul class="docs-list">
                    <li>${translation.docs_international_item_1}</li>
                    <li>${translation.docs_international_item_2}</li>
                    <li>${translation.docs_international_item_3}</li>
                </ul>
            `;
        } else {
            checklistItemsHTML = `
                <p>${translation.docs_national_intro}</p>
                <ul class="docs-list">
                    <li>${translation.docs_national_item_1}</li>
                </ul>
            `;
        }

        const modalContent = `
            <p>${translation.docs_checklist_intro}</p>
            ${checklistItemsHTML}
            <label class="docs-confirmation-label">
                <input type="checkbox" id="docs-confirm-checkbox">
                <span>${translation.docs_confirmation_checkbox}</span>
            </label>
        `;

        console.log("   -> [DIAG] Contenu de la modale généré. Appel de showCustomConfirm...");

        const confirmed = await showCustomConfirm({
            title: translation.docs_checklist_title,
            message: modalContent,
            icon: '🛂',
            confirmText: translation.docs_continue_button,
            cancelText: translation.button_cancel,
            onOpen: () => {
                try {
                    console.log("3️⃣ [DIAG] La fonction 'onOpen' s'exécute...");
                    const checkbox = document.getElementById('docs-confirm-checkbox');
                    const confirmBtn = document.querySelector('.custom-modal-card button[id^="btn-confirm-"]');

                    if (!checkbox || !confirmBtn) {
                        console.error("  -> [DIAG] ERREUR FATALE dans onOpen : la checkbox ou le bouton de confirmation est INTROUVABLE !");
                        return;
                    }

                    console.log("  -> [DIAG] Éléments checkbox et bouton trouvés.");
                    confirmBtn.disabled = true;
                    checkbox.onchange = () => {
                        confirmBtn.disabled = !checkbox.checked;
                    };
                    console.log("  -> [DIAG] 'onOpen' a terminé avec succès.");
                } catch (e) {
                    console.error("  -> [DIAG] ERREUR CRITIQUE DANS onOpen :", e);
                }
            }
        });

        console.log("   -> [DIAG] 'showCustomConfirm' a retourné une valeur.");
        return confirmed;

    } catch (error) {
        console.error("❌ ERREUR FATALE dans showDocumentChecklist :", error);
        return false; // On retourne 'false' pour ne pas bloquer l'application
    }
}
/**
 * The function `displayBookingSummary` displays a booking summary with details such as routes, dates,
 * prices, available seats, and payment options for a bus reservation.
 * @returns The `displayBookingSummary` function does not explicitly return any value. It is a function
 * that performs a series of tasks related to displaying a booking summary on a webpage, updating
 * payment fields, handling urgency information, and managing payment options. The function interacts
 * with the DOM elements and updates their content based on the current state of the application
 * (`appState`).
 */
// DANS app.js (remplacez votre fonction displayBookingSummary par celle-ci)

function displayBookingSummary() {
    console.log("📊 Affichage du récapitulatif de réservation...");

    // --- 1. Récupération des traductions et des règles ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const rules = appRules.ticketing; // On récupère les règles de tarification

    // --- 2. Cibles DOM et vérifications de sécurité ---
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

    // --- 3. Calcul du prix via la fonction utilitaire ---
    const priceDetails = Utils.calculateTotalPrice(appState);
    const finalTotalPrice = priceDetails.total;
    const totalTicketsPrice = priceDetails.tickets + priceDetails.returnTickets;

    // --- 4. Construction du récapitulatif HTML (avec traductions dynamiques) ---
    const passengersSummary = translation.summary_passengers_details(
        appState.passengerCounts.adults,
        appState.passengerCounts.children,
        rules.childMaxAge
    );

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

    summaryHTML += `<div class="detail-row"><span>Passagers :</span><strong>${passengersSummary}</strong></div>`;

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
                        ${seatsLeftHTML}
                    </div>
                    <div class="urgency-item" id="payment-countdown-container" data-deadline="${deadline.toISOString()}">
                        <span class="urgency-label">${translation.urgency_deadline}</span>
                        <span id="payment-countdown-timer" class="urgency-value">--:--</span>
                    </div>
                `;
                urgencyBox.style.display = 'grid';

                startFrontendCountdown();
            } else {
                urgencyBox.style.display = 'none';
            }
        } catch (e) {
            console.error("Erreur affichage urgence:", e);
            if (urgencyBox) urgencyBox.style.display = 'none';
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
            agencyOption.title = translation.payment_agency_unavailable_tooltip || "Agency payment not available (too close to departure)";
        }
    }

    setupPaymentMethodToggle();
    console.log("✅ Récapitulatif affiché et mis à jour.");
}
// DANS app.js, REMPLACEZ la fonction confirmBooking

window.confirmBooking = async function (buttonElement) {
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
            lang: getLanguage()

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



function calculateDuration(start, end) {
    if (!start || !end) return "N/A";
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 1440; // Gestion nuit
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m > 0 ? String(m).padStart(2, '0') : ''}`;
}
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
                        <div class="connector-duration">
    ${route.duration && route.duration !== 'N/A' ? route.duration : calculateDuration(route.departure, route.arrival)}
</div>
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
        actionsHTML += `<button class="btn-modern btn-invoice" onclick="downloadInvoice('${reservation.bookingNumber}')"><span class="btn-icon">📄</span><span class="btn-text">${translation.button_download_invoice}</span></button>`;
        // ========================================================
        // ✅ AJOUT DU BOUTON "PARTAGER"
        // ========================================================
        actionsHTML += `<button class="btn-modern btn-share" onclick="shareTicket()"><span class="btn-icon">↗️</span><span class="btn-text">${translation.button_share_ticket}</span></button>`;
        // ========================================================


        if (reservation.busIdentifier) {
            actionsHTML += `<a class="btn-modern btn-track" href="suivi/suivi.html?bus=${reservation.busIdentifier}&booking=${reservation.bookingNumber}" target="_blank"><span class="btn-icon">🛰️</span><span class="btn-text">${translation.button_track_outbound}</span></a>`;
        }
        if (reservation.returnRoute) {
            actionsHTML += `<button class="btn-modern btn-download" onclick="downloadTicket(true)"><span class="btn-icon">📥</span><span class="btn-text">${translation.button_download_return}</span></button>`;
            if (reservation.returnBusIdentifier) {
                actionsHTML += `<a class="btn-modern btn-track" href="suivi/suivi.html?bus=${reservation.returnBusIdentifier}&booking=${reservation.bookingNumber}" target="_blank"><span class="btn-icon">🛰️</span><span class="btn-text">${translation.button_track_return}</span></a>`;
            }
        }
        actionsHTML += `<button class="btn-modern btn-home" onclick="resetAndGoHome()"><span class="btn-icon">🏠</span><span class="btn-text">${translation.button_new_booking_alt}</span></button>`;

        actionsContainer.innerHTML = actionsHTML;
        // ✅ NOTIFICATIONS - Programmer après confirmation réussie
        if (reservation.status !== 'En attente de paiement') {
            try {
                // Rappels locaux
                await scheduleReminderNotifications(reservation);

                // Enregistrer pour push
                const busId = reservation.busIdentifier || 'N/A';
                await registerTokenWithBooking(reservation.bookingNumber, busId);

                console.log("✅ Notifications programmées pour", reservation.bookingNumber);
            } catch (notifError) {
                console.warn("⚠️ Erreur notifications:", notifError);
            }
        }

    } catch (err) {
        console.error("❌ Erreur affichage confirmation:", err);
        Utils.showToast("Erreur d'affichage.", 'error');
    }
}
// DANS app.js, REMPLACEZ votre fonction displayReservations par celle-ci

async function displayReservations() {
    const listContainer = document.getElementById("reservations-list");
    if (!listContainer) return;

    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // Étape 1 : Afficher un état de chargement
    listContainer.innerHTML = `<div class="loading-spinner">${translation.loading_bookings || 'Chargement...'}</div>`;

    const pageTitle = document.querySelector("#reservations-page .page-header h2");
    if (pageTitle) {
        pageTitle.textContent = translation.my_bookings_title;
    }

    try {
        const allBookingNumbers = new Set();
        let allReservations = [];

        // Étape 2 : Récupérer les réservations depuis l'historique LOCAL (localStorage)
        const localHistory = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || [];
        localHistory.forEach(bn => allBookingNumbers.add(bn));

        // Étape 3 : Si l'utilisateur est connecté, récupérer les réservations depuis son COMPTE
        const token = localStorage.getItem('enbus_usertoken');
        if (currentUser && token) {
            console.log("👤 Utilisateur connecté. Récupération des réservations du compte via /api/user/reservations...");
            const response = await fetch(`${API_CONFIG.baseUrl}/api/user/reservations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.reservations) {
                console.log(`☁️ ${data.reservations.length} réservation(s) récupérée(s) depuis le backend.`);
                data.reservations.forEach(res => {
                    allBookingNumbers.add(res.bookingNumber); // Ajoute les numéros de réservation du compte au Set
                });
            } else {
                console.warn("⚠️ Impossible de récupérer les réservations du compte, affichage des réservations locales uniquement.");
            }
        }

        const uniqueBookingNumbers = Array.from(allBookingNumbers);

        // Étape 4 : Si AUCUNE réservation n'a été trouvée (ni en local, ni sur le compte)
        if (uniqueBookingNumbers.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state-container">
                    <div class="bus-animation">
                        <div class="bus-body"><div class="bus-window"></div><div class="bus-light"></div></div>
                        <div class="road"></div>
                    </div>
                    <h3 class="empty-title">${translation.my_bookings_none_title}</h3>
                    <p class="empty-desc">${translation.my_bookings_none_desc}</p>
                    <button class="btn btn-primary btn-pulse" onclick="showPage('home')">${translation.button_new_booking} ➜</button>
                </div>`;
            return;
        }

        // Étape 5 : Récupérer les détails complets pour TOUS les numéros de réservation uniques
        console.log(`🔍 Récupération des détails pour ${uniqueBookingNumbers.length} réservation(s) unique(s).`);
        const response = await fetch(`${API_CONFIG.baseUrl}/api/reservations/details?ids=${uniqueBookingNumbers.join(',')}`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.reservations)) {
            throw new Error("Réponse API invalide pour les détails des réservations.");
        }

        allReservations = data.reservations;

        // Étape 6 : Gérer les cas où les réservations locales n'existent plus sur le serveur
        if (allReservations.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state-container">
                    <div class="not-found-animation"><div class="magnifying-glass"></div><div class="ticket-icon">🎟️</div><div class="question-mark">?</div></div>
                    <h3 class="empty-title">${translation.not_found_title}</h3>
                    <p class="empty-desc">${translation.not_found_desc}</p>
                    <button class="btn btn-primary" onclick="showPage('home')">${translation.button_plan_new_trip}</button>
                </div>`;
            return;
        }

        // Étape 7 : Synchroniser l'historique local avec les données du serveur (pour les cas de report)
        let historyChanged = false;
        const currentHistorySet = new Set(JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || []);
        allReservations.forEach(r => {
            if (r.replacementBookingNumber && !currentHistorySet.has(r.replacementBookingNumber)) {
                currentHistorySet.add(r.replacementBookingNumber);
                historyChanged = true;
            }
        });
        if (historyChanged) {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(Array.from(currentHistorySet)));
            // On relance la fonction pour s'assurer que le nouveau billet de report est bien affiché
            return displayReservations();
        }

        // Étape 8 : Afficher les cartes de réservation (VOTRE CODE DE RENDU, INCHANGÉ)
        listContainer.innerHTML = allReservations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(res => {
                const isConfirmed = res.status === 'Confirmé';
                const isPending = res.status === 'En attente de paiement';
                const isReportPending = res.status === 'En attente de report';
                const isReported = res.status === 'Reporté';
                const isCancelled = res.status === 'Annulé' || res.status === 'Expiré';

                let statusHTML = '';
                if (isConfirmed) {
                    statusHTML = `<span style="color: #73d700;">${translation.status_confirmed}</span>`;
                } else if (isPending) {
                    statusHTML = `<span style="color: #ff9800;">${translation.status_pending}</span>`;
                } else if (isReportPending) {
                    statusHTML = `<span style="color: #2196f3;">${translation.status_report_pending}</span>`;
                } else if (isReported) {
                    statusHTML = `<span style="color: #9e9e9e; text-decoration: line-through;">${translation.status_reported}</span>`;
                } else if (isCancelled) {
                    const lang = getLanguage();
                    let statusText = res.status;
                    if (lang === 'en') {
                        if (res.status === 'Annulé') statusText = 'Cancelled';
                        if (res.status === 'Expiré') statusText = 'Expired';
                    }
                    statusHTML = `<span style="color: #f44336;">${(translation.status_cancelled || (() => statusText))(statusText)}</span>`;
                } else {
                    statusHTML = `<span style="color: #9e9e9e;">${res.status}</span>`;
                }

                let actionsButtons = '';
                const trackerIdentifier = res.busIdentifier || res.route?.trackerId;
                if (isConfirmed) {
                    actionsButtons = `<button class="btn btn-primary" onclick="viewTicket('${res.bookingNumber}')">${translation.button_view_ticket}</button>`;
                    if (trackerIdentifier) {
                        actionsButtons += ` <button class="btn btn-secondary" onclick="openTrackerPage('${trackerIdentifier}', '${res.bookingNumber}')">${translation.button_track}</button>`;
                    }
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
                    deleteButton = `<button class="btn-delete-local" onclick="removeBookingFromLocalHistory('${res.bookingNumber}')" title="${translation.button_delete_title}">🗑️</button>`;
                }

                const formattedDate = Utils.formatDate(res.date, lang);
                const dateTimeString = (translation.date_at_time || ((d, t) => `${d} à ${t}`))(formattedDate, res.route.departure);

                let liveStatusHTML = '';
                if (res.liveStatus && res.status === 'Confirmé') {
                    const statusClass = res.liveStatus.status.toLowerCase().replace(/_/g, '-');
                    const icon = getLiveStatusIcon(res.liveStatus.status);
                    const text = getLiveStatusText(res.liveStatus, translation);
                    liveStatusHTML = `<div class="trip-status-line ${statusClass}">${icon}<span>${text}</span></div>`;
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
                            <p style="margin-top: ${liveStatusHTML ? '12px' : '0'};">${(translation.passenger_count || (c => `${c} passager(s)`))(res.passengers.length)} - Total: ${res.totalPrice}</p>
                        </div>
                        <div class="res-pwa-actions">${actionsButtons}</div>
                    </div>
                `;
            }).join('');

    } catch (error) {
        console.error("Erreur affichage réservations:", error);
        listContainer.innerHTML = `<div class="no-results error"><h3>${translation.error_loading_bookings || 'Erreur de chargement.'}</h3></div>`;
    }
}


// ============================================
// 🛰️ OUVERTURE PAGE SUIVI (Natif + Web)
// ============================================
function openTrackerPage(busId, bookingNumber) {
    const url = `/suivi/suivi.html?bus=${busId}&booking=${bookingNumber}`;

    console.log(`🚌 Navigation vers : ${url}`);

    // Natif : Navigation interne
    if (window.Capacitor?.isNativePlatform()) {
        window.location.href = url;
    }
    // Web : Ouvrir dans nouvel onglet
    else {
        window.open(url, '_blank');
    }
}


// Action pour télécharger la facture
// Action pour télécharger la facture (version avec animation)
// ============================================
// 📄 TÉLÉCHARGER FACTURE (AVEC ANIMATION)
// ============================================
function downloadInvoice(bookingNumber) {
    const loadingModal = document.getElementById('pdf-loading-modal');

    // 1. Afficher la modale d'animation
    if (loadingModal) {
        loadingModal.classList.add('active');
    } else {
        // Fallback si la modale HTML n'existe pas
        console.warn("Modale 'pdf-loading-modal' non trouvée.");
    }

    // 2. Préparer l'URL
    const lang = (typeof getLanguage === 'function') ? getLanguage() : 'fr';
    const baseUrl = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.baseUrl : '';
    const url = `${baseUrl}/api/reservations/${bookingNumber}/invoice?lang=${lang}`;

    // 3. Ouvrir l'URL dans un nouvel onglet
    const newWindow = window.open(url, '_blank');

    // 4. Cacher la modale après un délai pour laisser le temps à l'onglet de s'ouvrir
    setTimeout(() => {
        if (loadingModal) {
            loadingModal.classList.remove('active');
        }

        // Vérifier si le pop-up a été bloqué par le navigateur
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            alert("Veuillez autoriser les pop-ups pour afficher la facture.");
        }
    }, 1800); // Délai de 1.8 secondes
}

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
    } catch (err) {
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
    } catch (err) {
        Utils.showToast(err.message, "error");
    }
}





// ============================================
// 🔄 FONCTIONNALITÉ DE REPORT DE VOYAGE
// ============================================

window.initiateReport = async function (bookingNumber) {
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
window.selectReportTrip = async function (tripId, bookingNumber, currentReportCount) {
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




// DANS app.js, à ajouter avec vos autres fonctions de setup

/**
 * Met en place tous les écouteurs d'événements pour les notifications Push.
 * Cette fonction ne doit être appelée qu'une seule fois au démarrage de l'application,
 * de préférence dans initApp() ou une fonction similaire.
 */
function setupNotificationListeners() {
    // On ne fait rien si on n'est pas sur une plateforme native (Android/iOS)
    if (!window.Capacitor?.isNativePlatform()) {
        console.log("Mode Web, les écouteurs de notifications Push ne sont pas activés.");
        return;
    }

    // On s'assure que le plugin PushNotifications est disponible
    const { PushNotifications, LocalNotifications } = Capacitor.Plugins;
    if (!PushNotifications) {
        console.warn("⚠️ Le plugin PushNotifications n'est pas disponible.");
        return;
    }

    console.log("🔔 Initialisation des écouteurs de notifications Push...");

    // --- 1. Écouteur pour la réception du token FCM ---
    // Se déclenche lorsque l'appareil obtient (ou rafraîchit) son token de Firebase.
    PushNotifications.addListener('registration', (token) => {
        console.log("🔑 Token FCM reçu de l'appareil:", token.value);
        // On le sauvegarde dans le localStorage pour pouvoir l'utiliser plus tard
        localStorage.setItem('fcm_token', token.value);
    });

    // --- 2. Écouteur pour les erreurs d'enregistrement ---
    PushNotifications.addListener('registrationError', (error) => {
        console.error("❌ Erreur lors de l'enregistrement pour les Push Notifications:", error);
    });

    // --- 3. Écouteur pour la réception d'une notification PENDANT que l'app est ouverte ---
    // Par défaut, quand l'app est au premier plan, la notification n'apparaît pas dans la barre de statut.
    // On utilise ce listener pour la forcer à s'afficher en créant une notification locale.
    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
        console.log("📩 Notification Push reçue pendant que l'app est ouverte:", notification);

        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: Math.floor(Math.random() * 100000), // ID unique
                    title: notification.title || 'En-Bus',
                    body: notification.body || 'Vous avez un nouveau message.',
                    schedule: { at: new Date(Date.now() + 500) }, // Afficher dans 0.5s
                    sound: 'default', // Son par défaut de l'appareil
                    channelId: 'reminders', // Canal créé lors de l'initialisation
                    extra: notification.data, // On passe les données (page, tripId, etc.)
                    smallIcon: 'ic_notification', // Nom de votre icône de notification (sans extension)
                }]
            });
            console.log("-> Notification locale créée pour un affichage immédiat.");
        } catch (e) {
            console.warn("⚠️ Erreur lors de la création de la notification locale:", e);
        }
    });

    // --- 4. Écouteur pour l'ACTION de l'utilisateur (CLIC sur la notification) ---
    // C'est le listener le plus important pour la navigation.
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log("👆 Action sur une notification Push:", action);

        // Les données personnalisées que nous avons envoyées depuis le backend se trouvent ici :
        const data = action.notification.data;

        if (!data) {
            console.warn("La notification ne contient pas de données 'data' pour la navigation.");
            return;
        }

        // --- Logique de redirection en fonction des données reçues ---

        // Cas n°1 : C'est une demande de notation
        if (data.page === 'rate-trip' && data.tripId) {
            console.log(`-> Redirection vers la page de notation pour le voyage: ${data.tripId}`);
            // On s'assure que la fonction existe avant de l'appeler
            if (typeof showRatingPage === 'function') {
                showRatingPage(data.tripId, data.bookingNumber);
            } else {
                console.error("La fonction showRatingPage() n'est pas définie.");
            }
        }
        // Cas n°2 : C'est une alerte générale ou un billet à consulter
        else if (data.page === 'reservations' || data.bookingNumber) {
            console.log(`-> Redirection vers la page "Mes réservations".`);
            // On affiche la page des réservations, qui va se rafraîchir d'elle-même.
            showPage('reservations');
        }
        // (Futur) Cas n°3 : C'est une promo
        else if (data.page === 'promo') {
            console.log(`-> Redirection vers la page des promotions.`);
            // showPage('promotions'); // Exemple
        }
        // Cas par défaut : On ne fait rien de spécial
        else {
            console.log("-> Aucune action de navigation spécifique définie pour cette notification.");
        }
    });
}






// 3. Rendre les étoiles interactives
function setupStarRating() {
    const ratings = document.querySelectorAll('.star-rating');
    ratings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        rating.addEventListener('click', e => {
            if (e.target.classList.contains('star')) {
                const value = parseInt(e.target.dataset.value);
                // Mettre à jour l'état visuel
                stars.forEach(star => {
                    star.classList.toggle('selected', parseInt(star.dataset.value) <= value);
                });
                // Stocker la valeur (par exemple dans un data-attribute sur le parent)
                rating.dataset.ratingValue = value;
            }
        });
    });
}

// 4. Gérer la soumission du formulaire
// DANS app.js, remplacez entièrement handleRatingSubmit

// DANS app.js

/**
 * Affiche la page de notation et la pré-remplit avec les informations nécessaires.
 * @param {string} tripId - L'ID du voyage à noter.
 * @param {string} bookingNumber - Le numéro de la réservation correspondante.
 */
function showRatingPage(tripId, bookingNumber) {
    // Remplir les champs cachés qui seront envoyés avec le formulaire
    document.getElementById('rating-trip-id').value = tripId;
    document.getElementById('rating-booking-number').value = bookingNumber;

    // --- Traduction des éléments de la page ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const commentTextarea = document.getElementById('rating-comment');

    // On met à jour le placeholder du champ de commentaire avec la bonne langue
    if (commentTextarea) {
        commentTextarea.placeholder = translation.rating_comment_placeholder || "Décrivez votre expérience...";
    }

    // On réinitialise le formulaire (effacer les anciens commentaires et étoiles)
    const form = document.getElementById('rating-form');
    if (form) form.reset();
    document.querySelectorAll('.star-rating').forEach(rating => {
        rating.dataset.ratingValue = '';
        rating.querySelectorAll('.star').forEach(star => star.classList.remove('selected'));
    });


    // TODO: Vous pourriez faire un appel API ici pour récupérer les détails du trajet (from, to)
    // et les afficher dans #rating-trip-info pour un meilleur contexte pour l'utilisateur.


    // Afficher la page et initialiser l'interactivité des étoiles
    showPage('rating');
    if (typeof setupStarRating === 'function') {
        setupStarRating();
    } else {
        console.error("La fonction setupStarRating() est manquante.");
    }

    // On s'assure qu'il n'y a qu'un seul écouteur d'événement sur le formulaire
    // pour éviter les soumissions multiples.
    if (form) {
        form.removeEventListener('submit', handleRatingSubmit);
        form.addEventListener('submit', handleRatingSubmit);
    }
}


/**
 * Gère la soumission du formulaire de notation.
 * @param {Event} event - L'événement de soumission du formulaire.
 */
async function handleRatingSubmit(event) {
    event.preventDefault(); // Empêche la page de se recharger

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Désactive le bouton pour éviter les double-clics

    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;

    // Récupération de la note globale (qui est obligatoire)
    const overallRatingValue = document.querySelector('.star-rating[data-category="overall"]').dataset.ratingValue;
    if (!overallRatingValue) {
        Utils.showToast(translation.rating_toast_must_rate, "warning");
        submitButton.disabled = false; // On réactive le bouton si la validation échoue
        return;
    }

    // --- Construction dynamique de l'objet 'rating' ---
    const rating = {
        overall: parseInt(overallRatingValue)
    };

    // Fonction interne pour ajouter les notes optionnelles si elles ont été données
    const addOptionalRating = (category) => {
        const value = document.querySelector(`.star-rating[data-category="${category}"]`)?.dataset.ratingValue;
        if (value) { // La clé n'est ajoutée que si une note a été cliquée
            rating[category] = parseInt(value);
        }
    };

    // On récupère les notes pour chaque catégorie
    addOptionalRating('punctuality');
    addOptionalRating('driver');
    addOptionalRating('controller'); // ✅ NOTE DU CONTRÔLEUR INCLUSE ICI
    addOptionalRating('comfort');

    // --- Préparation des données complètes à envoyer ---
    const reviewData = {
        tripId: document.getElementById('rating-trip-id').value,
        bookingNumber: document.getElementById('rating-booking-number').value,
        rating: rating,
        comment: document.getElementById('rating-comment').value.trim()
    };

    console.log("📤 Envoi des données de l'avis au backend :", JSON.stringify(reviewData, null, 2));

    try {
        const token = localStorage.getItem('enbus_usertoken');
        if (!token) {
            // Ce cas ne devrait pas arriver si on teste en étant connecté, mais c'est une bonne sécurité
            throw new Error("Utilisateur non connecté. Impossible d'envoyer l'avis.");
        }

        const response = await fetch(`${API_CONFIG.baseUrl}/api/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });

        const result = await response.json();
        if (!response.ok) {
            // Affiche l'erreur spécifique renvoyée par le serveur (ex: "Vous avez déjà noté ce voyage.")
            throw new Error(result.error || "Une erreur est survenue lors de l'envoi.");
        }

        Utils.showToast(result.message, 'success');
        showPage('reservations'); // Redirige l'utilisateur vers la liste de ses réservations après succès

    } catch (error) {
        Utils.showToast(error.message, 'error');
    } finally {
        submitButton.disabled = false; // On réactive le bouton à la fin, que la requête ait réussi ou échoué
    }
}


// ============================================
// 📊 AFFICHAGE DU RÉCAPITULATIF DU REPORT
// ============================================

// ============================================
// 📊 AFFICHAGE DU RÉCAPITULATIF DU REPORT (AVEC PAIEMENT)
// ============================================
// ============================================
// 📊 AFFICHAGE DU RÉCAPITULATIF REPORT (CORRIGÉ)
// ============================================
function displayReportSummary(bookingNumber, tripId, calculation, reportCount) {
    console.log("📊 Données reçues pour affichage:", calculation);

    // --- 1. Récupération des traductions ---
    const lang = getLanguage();
    const translation = translations[lang] || translations.fr;
    const modalBody = document.getElementById('report-modal-body');

    if (!modalBody) {
        console.error("❌ Erreur: Élément #report-modal-body introuvable.");
        return;
    }

    // --- 2. Vérification du Paiement Requis ---
    // On s'assure que c'est bien un booléen ou que le coût > 0
    const isPaymentNeeded = calculation.isPaymentRequired === true || calculation.totalCost > 0;
    console.log("   -> Paiement requis ?", isPaymentNeeded);

    // --- 3. Construction de la section de paiement ---
    let paymentSectionHTML = '';

    if (isPaymentNeeded) {
        console.log("   -> Génération du formulaire de paiement...");
        paymentSectionHTML = `
            <div class="report-payment-section" style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed var(--color-border);">
                <h4 style="color: var(--color-text-primary); margin-bottom: 10px;">${translation.report_summary_payment_title || "Paiement requis"}</h4>
                <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 15px;">
                    ${translation.report_summary_amount_to_pay ? translation.report_summary_amount_to_pay(Utils.formatPrice(calculation.totalCost)) : `Montant à payer : ${Utils.formatPrice(calculation.totalCost)} FCFA`}
                </p>
                
                <div class="payment-methods" style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--color-text-primary);">
                        <input type="radio" name="report-payment-method" value="MTN" checked onclick="toggleReportAgencyInfo(false)"> 
                        <span>📱 MTN Mobile Money</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--color-text-primary);">
                        <input type="radio" name="report-payment-method" value="AIRTEL" onclick="toggleReportAgencyInfo(false)"> 
                        <span>📱 Airtel Money</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; color: var(--color-text-primary);">
                        <input type="radio" name="report-payment-method" value="AGENCY" onclick="toggleReportAgencyInfo(true)"> 
                        <span>🏢 ${translation.payment_agency_name || "Agence"}</span>
                    </label>
                </div>

                <div id="report-transaction-input">
                    <div class="form-group">
                        <label for="report-transaction-id" style="display:block; margin-bottom: 5px; font-weight: 600; color: var(--color-text-secondary);">${translation.transaction_id_label || "ID Transaction"}</label>
                        <input type="text" id="report-transaction-id" class="form-control" placeholder="${translation.transaction_id_placeholder || "Entrez l'ID reçu par SMS"}" style="width: 100%; padding: 10px; border-radius: 8px;">
                        <small style="color: var(--color-text-secondary); font-size: 0.8rem;">${translation.report_summary_payment_info ? translation.report_summary_payment_info(CONFIG.MTN_MERCHANT_NUMBER) : "Envoyez au numéro marchand"}</small>
                    </div>
                </div>

                <div id="report-agency-info" style="display: none; background: rgba(255, 152, 0, 0.1); padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <p style="color: #ff9800; font-size: 0.9rem; margin: 0;">
                        <strong>${translation.payment_agency_important_title || "Important"}</strong><br>
                        ${translation.payment_agency_info_report || "Payez en agence avant le départ."}
                    </p>
                </div>
            </div>
        `;
    } else {
        console.log("   -> Pas de paiement requis.");
    }

    // --- 4. Construction du récapitulatif HTML ---
    const diffColor = calculation.priceDifference >= 0 ? '#ff9800' : '#73d700';
    const diffSign = calculation.priceDifference >= 0 ? '+' : '';

    let summaryHTML = `
        <div class="report-summary">
            <h3 style="margin-bottom: 16px; color: var(--color-accent-glow);">${translation.report_summary_title || "Récapitulatif"}</h3>
            
            <div class="report-summary-line" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--color-text-secondary);">${translation.report_summary_current_price || "Prix actuel"}</span>
                <strong style="color: var(--color-text-primary);">${Utils.formatPrice(calculation.currentPrice)} FCFA</strong>
            </div>
            
            <div class="report-summary-line" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--color-text-secondary);">${translation.report_summary_new_price || "Nouveau prix"}</span>
                <strong style="color: var(--color-text-primary);">${Utils.formatPrice(calculation.newPrice)} FCFA</strong>
            </div>
            
            <div class="report-summary-line" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--color-text-secondary);">${translation.report_summary_price_diff || "Différence"}</span>
                <strong style="color: ${diffColor}">${diffSign}${Utils.formatPrice(calculation.priceDifference)} FCFA</strong>
            </div>
            
            <div class="report-summary-line" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: var(--color-text-secondary);">${typeof translation.report_summary_fee === 'function' ? translation.report_summary_fee(reportCount + 1) : "Frais"}</span>
                <strong style="color: var(--color-text-primary);">${calculation.reportFee === 0 ? (translation.report_summary_fee_free || "Gratuit") : Utils.formatPrice(calculation.reportFee) + ' FCFA'}</strong>
            </div>
            
            <div class="report-summary-line total" style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border); font-size: 1.1em;">
                <span style="color: var(--color-text-primary); font-weight: 700;">${isPaymentNeeded ? (translation.report_summary_total_to_pay || "Total à payer") : (translation.report_summary_credit_generated || "Crédit généré")}</span>
                <strong style="color: var(--color-accent-glow); font-size: 1.2em;">${Utils.formatPrice(Math.abs(calculation.totalCost))} FCFA</strong>
            </div>
            
            ${paymentSectionHTML}
            
            ${calculation.isCreditGenerated ? `<div class="report-warning" style="margin-top: 1rem; background: rgba(115, 215, 0, 0.1); border: 1px solid #73d700; border-radius: 4px; padding: 10px; color: #73d700; font-size: 0.9rem;">${typeof translation.info_credit_generated === 'function' ? translation.info_credit_generated(Utils.formatPrice(calculation.creditAmount)) : "Crédit généré"}</div>` : ''}
        </div>
        
        <div class="report-actions" style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn btn-secondary" onclick="closeReportModal()" style="flex: 1;">${translation.button_cancel || "Annuler"}</button>
            <button class="btn btn-primary" onclick="confirmReport('${bookingNumber}', '${tripId}', ${isPaymentNeeded}, ${calculation.totalCost})" style="flex: 1;">
                ${isPaymentNeeded ? (translation.report_summary_submit_button || "Payer et valider") : (translation.button_confirm_report || "Confirmer")}
            </button>
        </div>
    `;

    // --- 5. Nettoyage et Injection ---
    const existingSummary = modalBody.querySelector('.report-summary');
    if (existingSummary) existingSummary.remove();
    const existingActions = modalBody.querySelector('.report-actions');
    if (existingActions) existingActions.remove();

    modalBody.insertAdjacentHTML('beforeend', summaryHTML);
}


// Helper pour afficher/masquer les infos selon le mode de paiement
window.toggleReportAgencyInfo = function (showAgency) {
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

window.confirmReport = async function (bookingNumber, tripId, isPaymentRequired, totalCost) {
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





// DANS app.js

// DANS app.js

// DANS app.js, remplacez votre fonction loadTicketingRules



// ============================================
// 🚪 FERMETURE DE LA MODALE
// ============================================

window.closeReportModal = function () {
    document.getElementById('report-modal').classList.remove('active');
};

// DANS app.js, tout en haut

// Supprimez l'ancien 'let appRules = { ... }'

// ✅ NOUVELLE APPROCHE : On crée une promesse qui se résoudra avec les règles
let rulesPromise = null;

// DANS app.js
// DANS app.js
async function loadTicketingRules() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/settings/ticketing-rules`);
        const data = await response.json();

        if (data.success && data.rules) {
            appRules.ticketing = { ...appRules.ticketing, ...data.rules };
            console.log("✅ Règles de tarification mises à jour :", appRules.ticketing);

            // ========================================================
            // ✅ CORRECTION : On appelle directement la fonction ici
            // ========================================================
            updatePassengerSelectorUI();
            // ========================================================
        }
    } catch (error) {
        console.error("❌ Erreur chargement des règles:", error);
        // Même en cas d'erreur, on met à jour l'UI avec les valeurs par défaut
        updatePassengerSelectorUI();
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

window.resetAndGoHome = function () {
    resetBookingState();
    showPage('home');
}



// ============================================
// ↩️ GESTION DU BOUTON RETOUR ANDROID
// ============================================
if (window.Capacitor?.isNativePlatform()) {
    const { App } = Capacitor.Plugins;

    App.addListener('backButton', ({ canGoBack }) => {
        // Si on peut revenir en arrière dans l'historique de l'app
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Sinon (si on est sur la page d'accueil), on quitte l'app
            App.exitApp();
        }
    });
}




/**
 * Fonction de DÉBOGAGE pour tester manuellement l'ouverture de la page de notation.
 * À appeler depuis la console du navigateur.
 * Exemple d'appel : testRatingPage('ID_DU_VOYAGE', 'NUMERO_DE_RESERVATION')
 */
window.testRatingPage = function (tripId, bookingNumber) {
    if (!tripId || !bookingNumber) {
        console.error("Veuillez fournir un tripId et un bookingNumber valides.");
        alert("Veuillez fournir un tripId et un bookingNumber valides.");
        return;
    }

    console.log(`🚀 DÉBOGAGE : Forçage de l'ouverture de la page de notation...`);
    console.log(`   -> Trip ID: ${tripId}`);
    console.log(`   -> Booking Number: ${bookingNumber}`);

    // On s'assure que l'utilisateur est connecté, car la soumission d'un avis le requiert.
    if (!currentUser) {
        alert("Veuillez vous connecter avec un compte Google avant de tester la notation.");
        // Optionnel : on pourrait même déclencher la connexion ici
        // signInWithGoogle(); 
        return;
    }

    // On appelle directement la fonction qui affiche la page
    if (typeof showRatingPage === 'function') {
        showRatingPage(tripId, bookingNumber);
        console.log("✅ Page de notation affichée.");
    } else {
        console.error("La fonction showRatingPage() n'est pas définie. Assurez-vous qu'elle est bien dans app.js.");
    }
}




// DANS app.js

// DANS app.js

function setupSocialLinks() {
    const socialContainer = document.getElementById('footer-social-links');
    if (!socialContainer) return;

    // ============================================
    // ✅ DÉBUT DE LA MISE À JOUR
    // ============================================

    // Remplacez les URLs par les vôtres.
    // Pour WhatsApp, utilisez le format https://wa.me/<votre_numero_avec_indicatif_sans_le_+>
    const socialLinks = {
        whatsapp: "https://wa.me/242061234567", // EXEMPLE: pour le +242 06 123 4567
        facebook: "https://facebook.com/votrepage",
        twitter: "https://twitter.com/votrecompte",
        instagram: "https://instagram.com/votrecompte"
    };

    const icons = {
        whatsapp: `<svg viewBox="0 0 24 24"><path d="M12.04 2.02c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.45 1.29 4.93L2 22.02l5.13-1.34c1.43.78 3.05 1.21 4.75 1.21 5.52 0 9.99-4.47 9.99-9.99S17.56 2.02 12.04 2.02zM12.04 20.21c-1.55 0-3.03-.4-4.32-1.11L7.2 18.8l-3.14.82.84-3.06-0.34-.52c-.8-1.35-1.25-2.92-1.25-4.58 0-4.54 3.69-8.23 8.23-8.23 4.54 0 8.23 3.69 8.23 8.23s-3.69 8.23-8.23 8.23zm4.49-5.49c-.25-.12-1.46-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.48-1.38-1.73-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42h-.5c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.76 2.67 4.27 3.77 2.51 1.1 2.51.74 2.96.68.45-.06 1.46-.6 1.66-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29z"/></svg>`,
        facebook: `<svg viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zM16.5 12.06h-2.25v6h-3v-6H9.5v-2.25h1.75V8.31c0-1.73 1.05-2.67 2.59-2.67.74 0 1.38.05 1.56.08v2.16h-1.28c-.84 0-1 .4-1 1v1.29h2.28l-.36 2.25z"/></svg>`,
        twitter: `<svg viewBox="0 0 24 24"><path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm5.2 7.74c.01.17.01.34.01.51 0 5.23-3.99 11.26-11.26 11.26-2.24 0-4.32-.66-6.08-1.78.31.04.62.06.94.06 1.85 0 3.56-.63 4.91-1.7-1.73-.03-3.19-1.18-3.69-2.76.24.04.49.07.74.07.36 0 .71-.05 1.05-.14-1.81-.36-3.18-1.96-3.18-3.8v-.05c.53.3 1.14.47 1.78.49-1.06-.71-1.75-1.92-1.75-3.26 0-.72.19-1.39.54-1.96 1.95 2.39 4.86 3.96 8.13 4.12-.07-.3-.1-.6-.1-.91 0-2.21 1.79-4 4-4 .58 0 1.15.25 1.54.64.46-.09.9-.26 1.29-.49-.15.47-.47.86-.88 1.11.41-.05.8-.16 1.17-.32-.28.4-.63.75-1.03 1.03z"/></svg>`,
        instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.16c-2.7 0-3.04.01-4.1.06-1.06.05-1.79.22-2.42.47-.64.25-1.17.59-1.71 1.14-.54.54-.88 1.07-1.13 1.71-.25.63-.42 1.36-.47 2.42-.05 1.06-.06 1.4-.06 4.1s.01 3.04.06 4.1c.05 1.06.22 1.79.47 2.42.25.64.59 1.17 1.13 1.71.54.54 1.07.88 1.71 1.13.63.25 1.36.42 2.42.47 1.06.05 1.4.06 4.1.06s3.04-.01 4.1-.06c1.06-.05 1.79-.22 2.42-.47.64-.25 1.17-.59 1.71-1.13.54-.54.88-1.07 1.13-1.71.25-.63.42-1.36-.47-2.42.05-1.06.06-1.4.06-4.1s-.01-3.04-.06-4.1c-.05-1.06-.22-1.79-.47-2.42-.25-.64-.59-1.17-1.13-1.71-.54-.54-1.07-.88-1.71-1.13-.63-.25-1.36-.42-2.42-.47-1.06-.05-1.4-.06-4.1-.06zm0 1.8c2.61 0 2.94.01 3.98.06.96.04 1.5.21 1.9.38.48.2.8.45 1.17.82.37.37.62.7.82 1.17.17.4.34.94.38 1.9.05 1.04.06 1.37.06 3.98s-.01 2.94-.06 3.98c-.04.96-.21 1.5-.38 1.9-.2.48-.45.8-.82 1.17-.37.37-.7.62-1.17.82-.4.17-.94.34-1.9.38-1.04.05-1.37.06-3.98.06s-2.94-.01-3.98-.06c-.96-.04-1.5-.21-1.9-.38-.48-.2-.8-.45-1.17-.82-.37-.37-.62-.7-.82-1.17-.17-.4-.34-.94-.38-1.9-.05-1.04-.06-1.37-.06-3.98s.01-2.94.06-3.98c.04-.96.21-1.5.38-1.9.2-.48.45-.8.82-1.17.37-.37.7-.62-1.17-.82.4-.17.94-.34-1.9-.38 1.04-.05 1.37-.06 3.98-.06zM12 6.8c-2.87 0-5.2 2.33-5.2 5.2s2.33 5.2 5.2 5.2 5.2-2.33 5.2-5.2-2.33-5.2-5.2-5.2zm0 8.6c-1.88 0-3.4-1.52-3.4-3.4s1.52-3.4 3.4-3.4 3.4 1.52 3.4 3.4-1.52 3.4-3.4 3.4zM16.95 6.26c-.78 0-1.41.63-1.41 1.41s.63 1.41 1.41 1.41 1.41-.63 1.41-1.41-.63-1.41-1.41-1.41z"/></svg>`
    };

    // ============================================
    // ✅ FIN DE LA MISE À JOUR
    // ============================================

    let html = '';
    // On parcourt la liste et on génère les liens
    for (const [network, url] of Object.entries(socialLinks)) {
        html += `
            <a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Suivez-nous sur ${network}">
                ${icons[network]}
            </a>
        `;
    }
    socialContainer.innerHTML = html;
}

// ============================================
// ⌨️ GESTION DU CLAVIER
// ============================================
if (window.Capacitor?.isNativePlatform()) {
    const { Keyboard } = Capacitor.Plugins;

    // Quand le clavier s'ouvre, on remonte la vue
    Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.style.paddingBottom = `${info.keyboardHeight}px`;
        document.body.scrollTop = document.body.scrollHeight;
    });

    // Quand le clavier se ferme, on remet la vue à sa place
    Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.paddingBottom = '0px';
    });
}

// Dans app.js - Version améliorée avec numéro de réservation
