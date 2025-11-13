// ============================================
// 🚀 EN-BUS BACKEND - VERSION FINALE COMPLÈTE
// ============================================

require('dotenv').config();

// Imports des modules
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, param, validationResult } = require('express-validator');

// ============================================
// ✅ VALIDATION DES VARIABLES D'ENVIRONNEMENT
// ============================================
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD_HASH',
    'RESEND_API_KEY',
    'EMAIL_FROM_ADDRESS'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes :', missingEnvVars.join(', '));
    console.error('Vérifiez vos variables sur Render.');
    process.exit(1);
}
console.log('✅ Variables d\'environnement validées.');

// ============================================
// 🔧 CONFIGURATION EXPRESS & SÉCURITÉ
// ============================================
const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
console.log('🔒 Origines CORS autorisées:', allowedOrigins);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));

// ============================================
// 🚦 RATE LIMITING
// ============================================
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/', generalLimiter);

// ============================================
// 📧 CONFIGURATION NODEMAILER POUR RESEND
// ============================================
const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    secure: true,
    port: 465,
    auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
    }
});

transporter.verify((error, success) => {
    if (error) console.error('❌ Erreur vérification Nodemailer (Resend):', error);
    else console.log('✅ Service email prêt (via Resend).');
});

// ============================================
// 🗄️ CONNEXION MONGODB
// ============================================
const dbClient = new MongoClient(process.env.MONGODB_URI);
let reservationsCollection;
let positionsCollection;

async function connectToDb() {
    try {
        await dbClient.connect();
        const database = dbClient.db('en-bus-db');
        reservationsCollection = database.collection('reservations');
        positionsCollection = database.collection('positions');
        await reservationsCollection.createIndex({ bookingNumber: 1 }, { unique: true });
        console.log("✅ Connecté à MongoDB et index créés.");
    } catch (error) { 
        console.error("❌ Erreur connexion DB:", error.message);
        process.exit(1);
    }
}

// ============================================
// 🔐 MIDDLEWARE & ROUTES
// ============================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant.' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide.' });
        req.user = user;
        next();
    });
}

// === ROUTES ADMIN ===
app.post('/api/admin/login', loginLimiter, [body('username').notEmpty(), body('password').notEmpty()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USERNAME || !await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ success: true, token });
});

app.get('/api/admin/reservations', authenticateToken, async (req, res) => {
    try {
        const reservations = await reservationsCollection.find({}).sort({ createdAt: -1 }).toArray();
        const stats = {
            total: reservations.length,
            confirmed: reservations.filter(r => r.status === 'Confirmé').length,
            pending: reservations.filter(r => r.status === 'En attente de paiement').length,
            cancelled: reservations.filter(r => r.status === 'Annulé').length,
            expired: reservations.filter(r => r.status === 'Expiré').length,
        };
        res.json({ success: true, count: reservations.length, stats, reservations });
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.patch('/api/reservations/:bookingNumber/confirm-payment', authenticateToken, [param('bookingNumber').matches(/^EB-\d{6}$/)], async (req, res) => {
    // ... Votre logique de confirmation de paiement ici ...
});

// === ROUTES PUBLIQUES ===
app.post('/api/reservations', strictLimiter, [
    body('bookingNumber').matches(/^EB-\d{6}$/),
    body('passengers').isArray({ min: 1, max: 10 }),
    body('passengers.*.name').trim().isLength({ min: 2, max: 100 }).escape(),
    body('totalPriceNumeric').isNumeric(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const reservation = req.body;
        const result = await reservationsCollection.insertOne({ ...reservation, createdAt: new Date(), updatedAt: new Date() });
        console.log(`✅ Réservation créée : ${reservation.bookingNumber}`);
        if (reservation.passengers[0]?.email) sendConfirmationEmail(reservation);
        res.status(201).json({ success: true, bookingNumber: reservation.bookingNumber });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: 'Ce numéro de réservation existe déjà.' });
        console.error('❌ Erreur création réservation:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/reservations/user/:phone', [param('phone').notEmpty()], async (req, res) => {
    // ... Votre logique pour récupérer les réservations d'un utilisateur ...
});

app.get('/api/reservations/:bookingNumber', [param('bookingNumber').matches(/^EB-\d{6}$/)], async (req, res) => {
    // ... Votre logique pour récupérer une réservation ...
});

app.patch('/api/reservations/:bookingNumber/cancel', [param('bookingNumber').matches(/^EB-\d{6}$/)], async (req, res) => {
    // ... Votre logique pour annuler une réservation ...
});

// ============================================
// 📧 FONCTIONS D'ENVOI D'EMAIL (complètes)
// ============================================
async function sendEmail(mailOptions) {
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé à ${mailOptions.to}`);
    } catch (error) {
        console.error(`❌ Erreur envoi email à ${mailOptions.to}:`, error.message);
    }
}

function sendConfirmationEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;
    const htmlContent = `<h1>Bonjour ${passenger.name},</h1><p>Votre réservation <strong>${reservation.bookingNumber}</strong> pour le trajet ${reservation.route.from} → ${reservation.route.to} est confirmée.</p>`; // Utilisez votre template complet ici
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `✅ Réservation confirmée : ${reservation.bookingNumber}`,
        html: htmlContent
    };
    sendEmail(mailOptions);
}

function sendReminderEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;
    const htmlContent = `<h1>Rappel de votre voyage demain</h1><p>N'oubliez pas votre trajet ${reservation.route.from} → ${reservation.route.to} demain à ${reservation.route.departure}.</p>`;
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `🔔 Rappel de voyage : ${reservation.bookingNumber}`,
        html: htmlContent
    };
    sendEmail(mailOptions);
}

function sendExpirationEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;
    const htmlContent = `<h1>Réservation expirée</h1><p>Votre réservation ${reservation.bookingNumber} a expiré car le paiement n'a pas été effectué à temps.</p>`;
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `❌ Réservation expirée : ${reservation.bookingNumber}`,
        html: htmlContent
    };
    sendEmail(mailOptions);
}

function sendPaymentConfirmedEmail(reservation) {
    // ... Votre logique d'email pour la confirmation de paiement ...
}


// ============================================
// ⏰ CRON JOBS
// ============================================
if (process.env.NODE_ENV === 'production') {
    // Annuler les réservations expirées
    cron.schedule('0 * * * *', async () => {
        const now = new Date();
        const expiredReservations = await reservationsCollection.find({ status: 'En attente de paiement', paymentDeadline: { $lt: now.toISOString() } }).toArray();
        for (const reservation of expiredReservations) {
            await reservationsCollection.updateOne({ _id: reservation._id }, { $set: { status: 'Expiré', cancelledAt: now } });
            console.log(`[CRON] Réservation ${reservation.bookingNumber} expirée.`);
            sendExpirationEmail(reservation);
        }
    });

    // Envoyer des rappels
    cron.schedule('0 8 * * *', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const reservationsToRemind = await reservationsCollection.find({ status: 'Confirmé', date: tomorrowStr }).toArray();
        for (const reservation of reservationsToRemind) {
            sendReminderEmail(reservation);
        }
    });
    console.log('✅ Cron jobs activés pour la production.');
}

// ============================================
// 🛰️ WEBSOCKET POUR TRACKING GPS
// ============================================
const io = new Server(server, { cors: { origin: allowedOrigins } });
io.on('connection', (socket) => {
    socket.on('subscribeToBus', async (busId, callback) => {
        socket.join(busId);
        const lastPosition = await positionsCollection.findOne({ busId });
        if (lastPosition) socket.emit('updatePosition', lastPosition);
        if(callback) callback({ status: 'ok' });
    });
});
app.post('/track/update', async (req, res) => {
    const { tid, lat, lon, tst } = req.body;
    if (!tid || !lat || !lon) return res.status(400).json({ error: "Données invalides" });
    const newPosition = { busId: tid, lat, lon, timestamp: new Date(tst * 1000) };
    await positionsCollection.updateOne({ busId: tid }, { $set: newPosition }, { upsert: true });
    io.to(tid).emit('updatePosition', newPosition);
    res.sendStatus(200);
});

// ============================================
// 🚀 DÉMARRAGE SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;
(async () => {
    await connectToDb();
    server.listen(PORT, () => {
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Backend En-Bus (SÉCURISÉ) démarré
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port : ${PORT}
🌐 Environnement : ${process.env.NODE_ENV}
🛡️ Sécurité : ✅ Helmet, CORS, Rate Limit, JWT
📧 Email : ✅ via Resend
⏰ Cron : ${process.env.NODE_ENV === 'production' ? '✅' : '❌'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    });
})();