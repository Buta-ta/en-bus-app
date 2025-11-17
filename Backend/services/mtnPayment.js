// Backend/services/mtnPayment.js

const axios = require('axios');
const crypto = require('crypto');

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
        
        this.baseURL = this.environment === 'production'
            ? 'https://proxy.momoapi.mtn.com'
            : 'https://sandbox.momodeveloper.mtn.com';
        
        // ✅ CORRECTION : Pas de path global
        this.primaryKey = process.env.MTN_COLLECTION_PRIMARY_KEY;
        this.userId = process.env.MTN_COLLECTION_USER_ID;
        this.apiKey = process.env.MTN_COLLECTION_API_KEY;
        
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            console.log('♻️ Réutilisation token existant');
            return this.accessToken;
        }

        try {
            console.log('\n🔑 Obtention token MTN');
            console.log('URL:', `${this.baseURL}/collection/token/`);
            
            const credentials = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');
            
            // ✅ CORRECTION : URL correcte pour le token
            const response = await axios.post(
                `${this.baseURL}/collection/token/`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

            console.log('✅ Token MTN obtenu');
            return this.accessToken;

        } catch (error) {
            console.error('❌ Erreur token MTN:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw new Error('Impossible d\'obtenir le token MTN');
        }
    }

    async requestToPay(phone, amount, currency, reference, payerMessage) {
        try {
            const token = await this.getAccessToken();
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

            console.log('📤 Request to Pay MTN');
            console.log('URL:', `${this.baseURL}/collection/v1_0/requesttopay`);

            // ✅ CORRECTION : URL correcte pour requesttopay
            await axios.post(
                `${this.baseURL}/collection/v1_0/requesttopay`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Reference-Id': transactionId,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Paiement MTN initié:', transactionId);

            return {
                success: true,
                transactionId: transactionId,
                status: 'PENDING',
                message: 'Paiement initié. Veuillez confirmer sur votre téléphone.'
            };

        } catch (error) {
            console.error('❌ Erreur requestToPay:', {
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

    async getTransactionStatus(transactionId) {
        try {
            const token = await this.getAccessToken();

            // ✅ CORRECTION : URL correcte pour le statut
            const response = await axios.get(
                `${this.baseURL}/collection/v1_0/requesttopay/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );

            console.log('📊 Statut MTN:', response.data);

            return {
                success: true,
                status: response.data.status,
                amount: response.data.amount,
                currency: response.data.currency,
                externalId: response.data.externalId,
                reason: response.data.reason
            };

        } catch (error) {
            console.error('❌ Erreur statut MTN:', error.response?.data || error.message);
            
            return {
                success: false,
                error: 'Impossible de vérifier le statut du paiement'
            };
        }
    }

    async getAccountBalance() {
        try {
            const token = await this.getAccessToken();

            // ✅ CORRECTION : URL correcte pour le solde
            const response = await axios.get(
                `${this.baseURL}/collection/v1_0/account/balance`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Target-Environment': this.environment,
                        'Ocp-Apim-Subscription-Key': this.primaryKey
                    }
                }
            );

            console.log('💰 Solde MTN:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Erreur solde:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new MTNPaymentService();