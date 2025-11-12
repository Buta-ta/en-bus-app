require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Test de configuration email Nodemailer...\n');

// Vérifier les variables d'environnement
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configuré' : '❌ Manquant');
console.log('🔑 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configuré' : '❌ Manquant');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Variables d\'environnement manquantes dans .env');
    console.log('Ajoutez EMAIL_USER et EMAIL_PASS dans votre fichier .env');
    process.exit(1);
}

// Créer le transporteur
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Vérifier la connexion
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('\n💡 Vérifiez :');
        console.log('   1. Validation en 2 étapes activée sur Gmail');
        console.log('   2. Mot de passe d\'application créé (16 caractères)');
        console.log('   3. Variables EMAIL_USER et EMAIL_PASS correctes dans .env');
        process.exit(1);
    } else {
        console.log('✅ Connexion Gmail réussie !');
        console.log('\n📧 Envoi d\'un email de test...\n');
        
        // Envoyer un email de test
        const testEmail = {
            from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Envoyer à soi-même
            subject: '✅ Test email En-Bus - Nodemailer',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #73d700, #5fb800); color: white; padding: 30px; border-radius: 8px; text-align: center;">
                        <h1 style="margin: 0;">✅ Test Email Réussi !</h1>
                        <p style="margin: 10px 0 0 0;">Configuration Nodemailer fonctionnelle</p>
                    </div>
                    <div style="padding: 30px; background: white; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2>Félicitations ! 🎉</h2>
                        <p>Si vous recevez cet email, cela signifie que votre configuration Nodemailer est <strong>correcte</strong>.</p>
                        <p>Vous pouvez maintenant envoyer des emails de confirmation de réservation !</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #666;">
                            <strong>Configuration :</strong><br>
                            Service : Gmail<br>
                            Email : ${process.env.EMAIL_USER}<br>
                            Date : ${new Date().toLocaleString('fr-FR')}
                        </p>
                    </div>
                </div>
            `,
            text: `
✅ Test Email Réussi !

Félicitations ! Si vous recevez cet email, votre configuration Nodemailer est correcte.

Service : Gmail
Email : ${process.env.EMAIL_USER}
Date : ${new Date().toLocaleString('fr-FR')}
            `
        };
        
        transporter.sendMail(testEmail, (error, info) => {
            if (error) {
                console.error('❌ Erreur lors de l\'envoi:', error.message);
                process.exit(1);
            } else {
                console.log('✅ Email de test envoyé avec succès !');
                console.log('📧 MessageID:', info.messageId);
                console.log(`📬 Vérifiez votre boîte mail : ${process.env.EMAIL_USER}`);
                console.log('\n🎉 Votre configuration Nodemailer est PARFAITE !');
                process.exit(0);
            }
        });
    }
});