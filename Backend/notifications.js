// DANS notifications.js

// On importe l'objet admin déjà initialisé depuis firebase.js
const admin = require('./firebase.js');
const { getDb } = require('./database');

// --- 1. Enregistrer le token dans MongoDB ---
async function registerToken(token, bookingNumber, busId) {
    try {
        const db = getDb();
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
    // Sécurité : si admin n'a pas pu s'initialiser
    if (!admin || !admin.apps.length) {
        console.warn("⚠️ L'admin Firebase n'est pas prêt, impossible d'envoyer la notification.");
        return 0;
    }
    
    const uniqueTokens = [...new Set(tokens.filter(t => t))];
    if (uniqueTokens.length === 0) return 0;

    const message = {
        notification: { title, body },
        data: data,
        tokens: uniqueTokens,
        android: {
            priority: 'high',
            notification: {
                sound: 'default',
                channel_id: 'reminders'
            }
        },
        apns: {
            payload: {
                aps: { sound: 'default' }
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`🚀 ${response.successCount} notifs envoyées / ${response.failureCount} échecs.`);
        
        // ... (votre logique de nettoyage des tokens est correcte) ...
        
        return response.successCount;
    } catch (error) {
        console.error("❌ Erreur envoi Firebase:", error);
        return 0;
    }
}

// ========================================================
// ✅ L'export se fait À LA FIN, après la définition des fonctions
// ========================================================
module.exports = { registerToken, sendPush };