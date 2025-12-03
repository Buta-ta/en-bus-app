// notifications.js
const admin = require('firebase-admin');
const { getDb } = require('./database'); // On importe notre nouveau module

// --- Config Firebase (Ta config existante) ---
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

if (serviceAccount.project_id && serviceAccount.private_key) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("✅ Firebase Admin initialisé");
} else {
    console.warn("⚠️ Firebase credentials manquants");
}

// --- 1. Enregistrer le token dans MongoDB ---
async function registerToken(token, bookingNumber, busId) {
    try {
        const db = getDb();
        // On ajoute le token directement dans la réservation du client
        await db.collection('reservations').updateOne(
            { bookingNumber: bookingNumber },
            { 
                $set: { 
                    fcmToken: token, 
                    busId: busId || null,
                    lastTokenUpdate: new Date()
                } 
            }
        );
        console.log(`💾 Token sauvegardé en DB pour ${bookingNumber}`);
    } catch (error) {
        console.error("Erreur sauvegarde token:", error);
    }
}

// --- 2. Fonction d'envoi générique ---
async function sendPush(tokens, title, body, data = {}) {
    if (!admin.apps.length) return 0;
    
    // Nettoyage des tokens (uniques et non nuls)
    const uniqueTokens = [...new Set(tokens.filter(t => t))];
    if (uniqueTokens.length === 0) return 0;

    const message = {
        notification: { title, body },
        data: data,
        tokens: uniqueTokens,
        android: { priority: 'high', notification: { sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`🚀 ${response.successCount} notifs envoyées / ${response.failureCount} échecs.`);
        return response.successCount;
    } catch (error) {
        console.error("❌ Erreur envoi Firebase:", error);
        return 0;
    }
}

module.exports = { registerToken, sendPush };