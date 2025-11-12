// Fichier : Backend/config/email.js
require('dotenv').config();

const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
};

// ✅ CORRECTION : Vérification correcte des variables
if (!emailConfig.host || !emailConfig.port || !emailConfig.user || !emailConfig.pass) {
    console.error('❌ ERREUR CRITIQUE: Variables d\'environnement pour l\'email manquantes !');
    console.error('Vérifiez EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS dans votre .env ou sur Render.');
    
    // Fait planter le serveur exprès pour signaler le problème
    process.exit(1); 
} else {
    console.log('📧 Configuration email chargée avec succès.');
}

module.exports = emailConfig;