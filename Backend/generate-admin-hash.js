// generate-admin-hash.js
// ============================================
// Script pour générer le hash du mot de passe admin
// ============================================

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('╔════════════════════════════════════════╗');
console.log('║  🔐 GÉNÉRATEUR HASH MOT DE PASSE      ║');
console.log('╚════════════════════════════════════════╝\n');

rl.question('Entrez le mot de passe admin : ', async (password) => {
    if (password.length < 8) {
        console.error('\n❌ Le mot de passe doit faire au moins 8 caractères');
        process.exit(1);
    }
    
    console.log('\n⏳ Génération du hash...\n');
    
    const hash = await bcrypt.hash(password, 10);
    
    console.log('✅ Hash généré avec succès !');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Copiez cette ligne dans votre .env :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Ne partagez JAMAIS ce hash !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    rl.close();
});