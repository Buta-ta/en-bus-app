// Backend/setup/generateMTNCredentials.js

const axios = require('axios');
const crypto = require('crypto');
const readline = require('readline');

// Fonction pour générer un UUID v4 sans dépendance externe
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function generateMTNCredentials() {
    console.log('\n🔐 GÉNÉRATEUR D\'IDENTIFIANTS MTN MOBILE MONEY\n');
    console.log('📋 Ce script va créer automatiquement vos identifiants API MTN.\n');

    try {
        // 1. Demander la Primary Key
        const primaryKey = await question('Entrez votre MTN Primary Key (Ocp-Apim-Subscription-Key) : ');
        
        if (!primaryKey || primaryKey.trim().length < 20) {
            console.error('❌ La Primary Key semble invalide. Vérifiez et réessayez.');
            rl.close();
            return;
        }

        console.log('\n✅ Primary Key reçue.\n');

        // 2. Générer un UUID pour l'API User
        const userId = generateUUID();
        console.log(`🔑 Génération d'un User ID : ${userId}\n`);

        // 3. Créer l'API User
        console.log('📡 Étape 1/2 : Création de l\'API User...');
        
        try {
            await axios.post(
                'https://sandbox.momodeveloper.mtn.com/v1_0/apiuser',
                {
                    providerCallbackHost: 'webhook.site'
                },
                {
                    headers: {
                        'X-Reference-Id': userId,
                        'Ocp-Apim-Subscription-Key': primaryKey.trim(),
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ API User créé avec succès !\n');
            
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('⚠️  L\'API User existe déjà, on continue...\n');
            } else {
                throw error;
            }
        }

        // 4. Générer l'API Key
        console.log('📡 Étape 2/2 : Génération de l\'API Key...');
        
        const apiKeyResponse = await axios.post(
            `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${userId}/apikey`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': primaryKey.trim()
                }
            }
        );

        const apiKey = apiKeyResponse.data.apiKey;
        console.log('✅ API Key générée avec succès !\n');

        // 5. Afficher les résultats
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 IDENTIFIANTS GÉNÉRÉS AVEC SUCCÈS !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        console.log('📋 Copiez ces lignes dans votre fichier Backend/.env :\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`MTN_COLLECTION_PRIMARY_KEY=${primaryKey.trim()}`);
        console.log(`MTN_COLLECTION_USER_ID=${userId}`);
        console.log(`MTN_COLLECTION_API_KEY=${apiKey}`);
        console.log(`MTN_ENVIRONMENT=sandbox`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 6. Tester la connexion
        console.log('🧪 Test de connexion à l\'API MTN...\n');

        const credentials = Buffer.from(`${userId}:${apiKey}`).toString('base64');
        
        const tokenResponse = await axios.post(
            'https://sandbox.momodeveloper.mtn.com/collection/v1_0/token/',
            {},
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Ocp-Apim-Subscription-Key': primaryKey.trim()
                }
            }
        );

        console.log('✅ Test de connexion réussi !');
        console.log(`📊 Token d'accès obtenu : ${tokenResponse.data.access_token.substring(0, 30)}...\n`);

        // 7. Tester le solde
        try {
            const balanceResponse = await axios.get(
                'https://sandbox.momodeveloper.mtn.com/collection/v1_0/account/balance',
                {
                    headers: {
                        'Authorization': `Bearer ${tokenResponse.data.access_token}`,
                        'X-Target-Environment': 'sandbox',
                        'Ocp-Apim-Subscription-Key': primaryKey.trim()
                    }
                }
            );

            console.log('💰 Solde du compte Sandbox :');
            console.log(balanceResponse.data);
            console.log();

        } catch (balanceError) {
            console.log('⚠️  Impossible de récupérer le solde (normal en sandbox).\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ CONFIGURATION TERMINÉE !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📝 Prochaines étapes :');
        console.log('   1. Copiez les variables dans Backend/.env');
        console.log('   2. Créez le fichier Backend/services/mtnPayment.js');
        console.log('   3. Testez avec : node Backend/test/testMTN.js\n');

    } catch (error) {
        console.error('\n❌ ERREUR :');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Message:', error.response.data);
            
            if (error.response.status === 401) {
                console.error('\n💡 Votre Primary Key est incorrecte ou invalide.');
                console.error('   Vérifiez-la sur : https://momodeveloper.mtn.com/products');
            }
        } else {
            console.error(error.message);
        }
        
        console.error('\n📚 Besoin d\'aide ? Vérifiez la documentation :');
        console.error('   https://momodeveloper.mtn.com/api-documentation\n');
    }

    rl.close();
}

generateMTNCredentials();