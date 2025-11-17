// Backend/services/mtnPayment.js

const axios = require('axios');
const crypto = require('crypto');

// Fonction pour générer un UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class MTNPaymentService {
    constructor() {
        this.environment = process.env.MTN_ENVIRONMENT || 'sandbox';
        
        // URLs de l'API selon l'environnement
        this.baseURL = this.environment === 'production'
            ? 'https://proxy.momoapi.mtn.com'
            : 'https://sandbox.momodeveloper.mtn.com';
        
        this.collectionPath = '/collection/v1_0';
        
        // Identifiants
        this.primaryKey = process.env.MTN_COLLECTION_PRIMARY_KEY;
        this.userId = process.env.MTN_COLLECTION_USER_ID;
        this.apiKey = process.env.MTN_COLLECTION_API_KEY;
        
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Obtenir un token d'accès
     */
    async getAccessToken() {
        // Vérifier si on a déjà un token valide
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const credentials = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');
            
            const response = await axios.post(
                `${this.baseURL}${this.collectionPath}/token`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );

            this.accessToken = response.data.access_token;
            // Le token expire après 1 heure, on le renouvelle 5 minutes avant
            this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

            console.log('✅ Token MTN obtenu avec succès');
            return this.accessToken;

        } catch (error) {
            console.error('❌ Erreur obtention token MTN:', error.response?.data || error.message);
            throw new Error('Impossible d\'obtenir le token MTN');
        }
    }

    /**
     * Initier une demande de paiement (Request to Pay)
     */
    async requestToPay(phone, amount, currency, reference, payerMessage) {
    try {
        console.log('\n🔵 DÉBUT requestToPay');
        console.log('─────────────────────────────────');
        console.log('Environnement:', this.environment);
        console.log('Base URL:', this.baseURL);
        console.log('Primary Key présente:', !!this.primaryKey);
        console.log('User ID:', this.userId);
        console.log('API Key présente:', !!this.apiKey);
        
        const token = await this.getAccessToken();
        console.log('✅ Token obtenu:', token ? 'OUI' : 'NON');
        
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

        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        console.log('🔑 Transaction ID:', transactionId);
        
        const url = `${this.baseURL}${this.collectionPath}/requesttopay`;
        console.log('🌐 URL complète:', url);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': transactionId,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.primaryKey,
            'Content-Type': 'application/json'
        };
        console.log('📋 Headers:', JSON.stringify(headers, null, 2));

        const response = await axios.post(url, payload, { headers });
        
        console.log('✅ Réponse MTN status:', response.status);
        console.log('✅ Réponse MTN data:', response.data);

        return {
            success: true,
            transactionId: transactionId,
            status: 'PENDING',
            message: 'Paiement initié. Veuillez confirmer sur votre téléphone.'
        };

    } catch (error) {
        console.error('\n❌ ERREUR DÉTAILLÉE requestToPay:');
        console.error('─────────────────────────────────');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        
        if (error.response) {
            console.error('Status HTTP:', error.response.status);
            console.error('Headers réponse:', JSON.stringify(error.response.headers, null, 2));
            console.error('Data réponse:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('Requête envoyée mais pas de réponse');
            console.error('Request:', error.request);
        } else {
            console.error('Erreur configuration:', error.message);
        }
        console.error('Stack:', error.stack);
        console.error('─────────────────────────────────\n');
        
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Erreur lors de l\'initiation du paiement MTN',
            details: error.response?.data
        };
    }
}
    /**
     * Vérifier le statut d'un paiement
     */
    async getTransactionStatus(transactionId) {
        try {
            const token = await this.getAccessToken();

            const response = await axios.get(
                `${this.baseURL}${this.collectionPath}/requesttopay/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );

            console.log('📊 Statut transaction MTN:', response.data);

            return {
                success: true,
                status: response.data.status,
                amount: response.data.amount,
                currency: response.data.currency,
                externalId: response.data.externalId,
                reason: response.data.reason
            };

        } catch (error) {
            console.error('❌ Erreur vérification statut MTN:', error.response?.data || error.message);
            
            return {
                success: false,
                error: 'Impossible de vérifier le statut du paiement'
            };
        }
    }

    /**
     * Vérifier le solde du compte
     */
    async getAccountBalance() {
        try {
            const token = await this.getAccessToken();

            const response = await axios.get(
                `${this.baseURL}${this.collectionPath}/account/balance`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );

            console.log('💰 Solde compte MTN:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Erreur récupération solde:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new MTNPaymentService();