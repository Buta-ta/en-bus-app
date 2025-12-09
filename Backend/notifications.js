// notifications.js
const admin = require('./firebase.js')
const { getDb } = require('./database'); // On importe notre nouveau module


// ========================================================
// ✅ DÉBUT DE LA CORRECTION : On exporte l'objet 'admin'
// ========================================================
module.exports = { 
    registerToken, 
    sendPush,
    admin // On ajoute 'admin' à l'export
};
// ==================
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