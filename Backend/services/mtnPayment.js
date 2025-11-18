// Backend/services/mtnPayment.js

const axios = require('axios');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const MTN_CONFIG = {
    environment: process.env.MTN_ENVIRONMENT || 'sandbox',
    baseURL: process.env.MTN_ENVIRONMENT === 'production'
        ? 'https://proxy.momoapi.mtn.com'
        : 'https://sandbox.momodeveloper.mtn.com',
    primaryKey: process.env.MTN_COLLECTION_PRIMARY_KEY,
    userId: process.env.MTN_COLLECTION_USER_ID,
    apiKey: process.env.MTN_COLLECTION_API_KEY
};

let cachedToken = null;
let tokenExpiry = null;

console.log('🔐 MTN Service chargé:', {
    environment: MTN_CONFIG.environment,
    baseURL: MTN_CONFIG.baseURL,
    hasPrimaryKey: !!MTN_CONFIG.primaryKey,
    hasUserId: !!MTN_CONFIG.userId,
    hasApiKey: !!MTN_CONFIG.apiKey
});

async function getAccessToken() {
    // Réutiliser le token si valide
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        console.log('♻️ Token existant réutilisé');
        return cachedToken;
    }

    try {
        console.log('🔑 Demande nouveau token MTN');
        
        const credentials = Buffer.from(`${MTN_CONFIG.userId}:${MTN_CONFIG.apiKey}`).toString('base64');
        
        const response = await axios.post(
            `${MTN_CONFIG.baseURL}/collection/token/`,
            {},
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.primaryKey
                },
                timeout: 10000
            }
        );

        cachedToken = response.data.access_token;
        tokenExpiry = new Date(Date.now() + 55 * 60 * 1000); // 55 min

        console.log('✅ Token obtenu (expire dans 55min)');
        return cachedToken;

    } catch (error) {
        console.error('❌ Erreur token MTN:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        throw new Error(`Impossible d'obtenir le token: ${error.response?.data?.error || error.message}`);
    }
}

async function requestToPay(phone, amount, currency, reference, payerMessage) {
    try {
        console.log('💳 MTN RequestToPay:', { phone, amount, currency, reference });

        const token = await getAccessToken();
        const transactionId = generateUUID();
        const formattedPhone = phone.replace(/\D/g, '');
        
        const payload = {
            amount: amount.toString(),
            currency: currency,
            externalId: reference,
            payer: {
                partyIdType: 'MSISDN',
                partyId: formattedPhone
            },
            payerMessage: payerMessage || 'Paiement En-Bus',
            payeeNote: `Réservation ${reference}`
        };

        console.log('📤 Payload:', payload);
        console.log('TransactionId:', transactionId);

        const response = await axios.post(
            `${MTN_CONFIG.baseURL}/collection/v1_0/requesttopay`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': transactionId,
                    'X-Target-Environment': MTN_CONFIG.environment,
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.primaryKey,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log('✅ MTN accepté, status:', response.status);

        return {
            success: true,
            transactionId: transactionId,
            status: 'PENDING',
            message: 'Demande envoyée. Confirmez sur votre téléphone.'
        };

    } catch (error) {
        console.error('❌ RequestToPay error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        return {
            success: false,
            error: error.response?.data?.message || 'Erreur lors de l\'initiation du paiement MTN',
            details: error.response?.data
        };
    }
}

async function getTransactionStatus(transactionId) {
    try {
        console.log(`🔍 Vérif statut MTN: ${transactionId}`);

        const token = await getAccessToken();

        const response = await axios.get(
            `${MTN_CONFIG.baseURL}/collection/v1_0/requesttopay/${transactionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': MTN_CONFIG.environment,
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.primaryKey
                },
                timeout: 10000
            }
        );

        console.log('📊 Statut:', response.data.status);

        return {
            success: true,
            status: response.data.status,
            amount: response.data.amount,
            currency: response.data.currency,
            externalId: response.data.externalId,
            reason: response.data.reason
        };

    } catch (error) {
        console.error('❌ GetStatus error:', error.response?.data || error.message);
        
        return {
            success: false,
            error: 'Impossible de vérifier le statut'
        };
    }
}

async function getAccountBalance() {
    try {
        const token = await getAccessToken();

        const response = await axios.get(
            `${MTN_CONFIG.baseURL}/collection/v1_0/account/balance`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': MTN_CONFIG.environment,
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.primaryKey
                }
            }
        );

        console.log('💰 Solde:', response.data);
        return response.data;

    } catch (error) {
        console.error('❌ Erreur solde:', error.response?.data || error.message);
        return null;
    }
}

module.exports = {
    getAccessToken,
    requestToPay,
    getTransactionStatus,
    getAccountBalance
};