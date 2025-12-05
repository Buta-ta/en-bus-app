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
// DANS notifications.js

async function sendPush(tokens, title, body, data = {}) {
    if (!admin.apps.length) return 0;
    
    const uniqueTokens = [...new Set(tokens.filter(t => t))];
    if (uniqueTokens.length === 0) return 0;

    // ========================================================
    // ✅ DÉBUT DE LA CORRECTION
    // ========================================================
    const message = {
        notification: {
            title,
            body
        },
        data: data,
        tokens: uniqueTokens,
        android: {
            priority: 'high',
            notification: {
                sound: 'default', // Spécifie le son par défaut pour Android
                channel_id: 'reminders' // Spécifie le canal à utiliser pour Android 8.0+
            }
        },
        apns: {
            payload: {
                aps: {
                    sound: 'default' // Spécifie le son par défaut pour iOS
                }
            }
        }
    };
    // ========================================================
    // ✅ FIN DE LA CORRECTION
    // ========================================================

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`🚀 ${response.successCount} notifs envoyées / ${response.failureCount} échecs.`);
        
        // Gérer les tokens invalides
        if (response.failureCount > 0) {
            const tokensToDelete = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(resp.error.code)) {
                    tokensToDelete.push(uniqueTokens[idx]);
                }
            });
            if (tokensToDelete.length > 0) {
                console.log(`🗑️ Nettoyage de ${tokensToDelete.length} tokens invalides...`);
                // Idéalement, vous devriez avoir une fonction pour supprimer ces tokens de votre base de données.
            }
        }
        
        return response.successCount;
    } catch (error) {
        console.error("❌ Erreur envoi Firebase:", error);
        return 0;
    }
}
module.exports = { registerToken, sendPush };