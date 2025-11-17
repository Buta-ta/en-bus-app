// Backend/test/testMTN.js

// ✅ Charger .env depuis le dossier parent
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mtnPayment = require('../services/mtnPayment');

async function testMTN() {
    console.log('🧪 Test de connexion MTN...\n');
    
    // ✅ AFFICHER LES VARIABLES POUR DEBUG
    console.log('📋 Configuration chargée :');
    console.log('Primary Key:', process.env.MTN_COLLECTION_PRIMARY_KEY ? '✅ Présente' : '❌ MANQUANTE');
    console.log('User ID:', process.env.MTN_COLLECTION_USER_ID ? '✅ Présent' : '❌ MANQUANT');
    console.log('API Key:', process.env.MTN_COLLECTION_API_KEY ? '✅ Présente' : '❌ MANQUANTE');
    console.log('Environment:', process.env.MTN_ENVIRONMENT || '❌ MANQUANT');
    console.log();

    try {
        // 1. Tester l'obtention du token
        console.log('1️⃣ Test : Obtention du token d\'accès...');
        const token = await mtnPayment.getAccessToken();
        console.log('✅ Token obtenu:', token.substring(0, 30) + '...\n');

        // 2. Tester une demande de paiement
        console.log('2️⃣ Test : Initiation d\'une demande de paiement...');
        const paymentResult = await mtnPayment.requestToPay(
            '46733123453',
            100,
            'EUR',
            'TEST-' + Date.now(),
            'Test de paiement En-Bus'
        );
        console.log('✅ Résultat:', paymentResult, '\n');

        if (paymentResult.success) {
            console.log('3️⃣ Attente de 5 secondes...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            console.log('4️⃣ Test : Vérification du statut de la transaction...');
            const status = await mtnPayment.getTransactionStatus(paymentResult.transactionId);
            console.log('✅ Statut:', status, '\n');
        }

        console.log('🎉 Tous les tests sont passés avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        process.exit(1);
    }
}

testMTN();