// Fichier : Backend/config/email.js
require('dotenv').config();

const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
};

// Vérification au chargement pour s'assurer que les variables sont bien là
if (!emailConfig.host || !emailConfig.port || !email.Config.user || !emailConfig.pass) {
    console.error('❌ ERREUR: Variables d\'environnement pour l\'email manquantes !');
    console.error('Vérifiez EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS dans votre .env ou sur Render.');
} else {
    console.log('📧 Configuration email chargée.');
}

module.exports = emailConfig;