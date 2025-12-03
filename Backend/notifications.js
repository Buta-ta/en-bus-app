// Backend/notifications.js
const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Stockage des tokens (en production, utilisez une base de données)
const tokenStore = new Map();

// Enregistrer un token
function registerToken(token, bookingNumber, busId) {
    tokenStore.set(bookingNumber, { token, busId, createdAt: new Date() });
    console.log(`✅ Token enregistré pour ${bookingNumber}`);
}

// Envoyer une notification à une réservation
async function sendToBooking(bookingNumber, title, body, data = {}) {
    const record = tokenStore.get(bookingNumber);
    if (!record) {
        console.log(`⚠️ Pas de token pour ${bookingNumber}`);
        return false;
    }

    try {
        const message = {
            token: record.token,
            notification: { title, body },
            data: { bookingNumber, ...data },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'reminders'
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log(`📩 Notification envoyée: ${response}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur envoi:`, error);
        return false;
    }
}

// Envoyer à tous les passagers d'un bus
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