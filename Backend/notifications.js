// Backend/notifications.js
const admin = require('firebase-admin');

// Initialiser Firebase Admin avec variables d'environnement
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CERT_URL
};

// Vérifier que les credentials sont présents
if (serviceAccount.project_id && serviceAccount.private_key) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin initialisé");
} else {
    console.warn("⚠️ Firebase credentials manquants - Push notifications désactivées");
}

// Stockage des tokens
const tokenStore = new Map();

function registerToken(token, bookingNumber, busId) {
    tokenStore.set(bookingNumber, { token, busId, createdAt: new Date() });
    console.log(`✅ Token enregistré pour ${bookingNumber}`);
}

async function sendToBooking(bookingNumber, title, body, data = {}) {
    if (!admin.apps.length) {
        console.log("⚠️ Firebase non initialisé");
        return false;
    }

    const record = tokenStore.get(bookingNumber);
    if (!record) {
        console.log(`⚠️ Pas de token pour ${bookingNumber}`);
        return false;
    }

    try {
        const message = {
            token: record.token,
            notification: { 
                title, 
                body 
            },
            data: { 
                bookingNumber, 
                ...data 
            },
            android: {
                priority: 'high',
                notification: {
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    visibility: 'PUBLIC',
                    priority: 'high'
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log(`📩 Notification envoyée: ${response}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur envoi:`, error.message);
        return false;
    }
}

async function sendToBus(busId, title, body) {
    let count = 0;
    for (const [bookingNumber, record] of tokenStore) {
        if (record.busId === busId) {
            await sendToBooking(bookingNumber, title, body, { busId });
            count++;
        }
    }
    console.log(`📩 ${count} notifications envoyées au bus ${busId}`);
    return count;
}

module.exports = { registerToken, sendToBooking, sendToBus };