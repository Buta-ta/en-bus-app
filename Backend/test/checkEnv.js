// Backend/test/checkEnv.js

require('dotenv').config();

console.log('🔍 Vérification des variables d\'environnement :\n');

console.log('MTN_COLLECTION_PRIMARY_KEY:', process.env.MTN_COLLECTION_PRIMARY_KEY || '❌ MANQUANT');
console.log('MTN_COLLECTION_USER_ID:', process.env.MTN_COLLECTION_USER_ID || '❌ MANQUANT');
console.log('MTN_COLLECTION_API_KEY:', process.env.MTN_COLLECTION_API_KEY || '❌ MANQUANT');
console.log('MTN_ENVIRONMENT:', process.env.MTN_ENVIRONMENT || '❌ MANQUANT');

console.log('\n📁 Chemin du fichier .env recherché :');
console.log(require('path').resolve(process.cwd(), '.env'));