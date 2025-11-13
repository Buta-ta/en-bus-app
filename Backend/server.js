// ============================================
// 🚀 EN-BUS BACKEND - VERSION SÉCURISÉE
// ============================================

require('dotenv').config();

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

// ✅ Importer la configuration email
const emailConfig = require('./config/email');

// ============================================
// ✅ VALIDATION DES VARIABLES D'ENVIRONNEMENT
// ============================================
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD_HASH'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes :');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n⚠️ Vérifiez votre fichier .env');
    process.exit(1);
}

console.log('✅ Variables d\'environnement validées');

// ============================================
// 🔧 CONFIGURATION EXPRESS
// ============================================
const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

// ============================================
// 🛡️ SÉCURITÉ - HELMET
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// ============================================
// 🌐 CORS SÉCURISÉ
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5500'];

console.log('🔒 Origines CORS autorisées:', allowedOrigins);

app.use(cors({
    origin: (origin, callback) => {
        // Autoriser les requêtes sans origin (Postman, mobile apps)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️  Origine bloquée par CORS : ${origin}`);
            callback(new Error('Origine non autorisée par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// ============================================
// 🚦 RATE LIMITING
// ============================================

// Rate limit général
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development'
});

// Rate limit strict (réservations)
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }
});

// Rate limit login (anti brute-force)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});

app.use('/api/', generalLimiter);

// ============================================
// 🔐 MIDDLEWARE AUTHENTIFICATION JWT
// ============================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Token invalide:', err.message);
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }
        req.user = user;
        next();
    });
}

// ============================================
// 📧 CONFIGURATION NODEMAILER
// ============================================
// ============================================
// 📧 CONFIGURATION NODEMAILER
// ============================================

// ✅ NOUVEAU CODE POUR BREVO (ou SendGrid, etc.)
// ============================================
// 📧 CONFIGURATION NODEMAILER
// ============================================

// Dans server.js
const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    secure: true,
    port: 465,
    auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
    }
});

// Vérification au démarrage
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erreur vérification Nodemailer:', error);
    } else {
        console.log('✅ Service email prêt (Nodemailer via Brevo).');
    }
});

// ============================================
// 🗄️ CONNEXION MONGODB
// ============================================
const dbClient = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000
});

let positionsCollection;
let reservationsCollection;

async function connectToDb() {
    try {
        await dbClient.connect();
        console.log("✅ Connecté à MongoDB Atlas");
        
        const database = dbClient.db('en-bus-db');
        positionsCollection = database.collection('positions');
        reservationsCollection = database.collection('reservations');
        
        await reservationsCollection.createIndex({ bookingNumber: 1 }, { unique: true });
        await reservationsCollection.createIndex({ 'passengers.phone': 1 });
        await reservationsCollection.createIndex({ status: 1 });
        await reservationsCollection.createIndex({ paymentDeadline: 1 });
        await positionsCollection.createIndex({ busId: 1 });
        
        console.log("✅ Index MongoDB créés");
        
    } catch (error) { 
        console.error("❌ Erreur connexion DB:", error.message);
        setTimeout(connectToDb, 5000);
    }
}

dbClient.on('close', () => {
    console.log("⚠️  Connexion MongoDB fermée, reconnexion...");
    connectToDb();
});

// ============================================
// 🔑 ROUTE LOGIN ADMIN
// ============================================
app.post('/api/admin/login', 
    loginLimiter,
    [
        body('username').trim().notEmpty().withMessage('Username requis'),
        body('password').trim().notEmpty().withMessage('Password requis')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, password } = req.body;
        
        if (username !== process.env.ADMIN_USERNAME) {
            console.warn(`❌ Tentative login échouée : ${username} depuis ${req.ip}`);
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        const isPasswordValid = await bcrypt.compare(
            password, 
            process.env.ADMIN_PASSWORD_HASH
        );
        
        if (!isPasswordValid) {
            console.warn(`❌ Mot de passe incorrect pour : ${username}`);
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        console.log(`✅ Login admin réussi : ${username} depuis ${req.ip}`);
        
        res.json({
            success: true,
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
    }
);

// ============================================
// 🛡️ ROUTES ADMIN PROTÉGÉES
// ============================================
app.get('/api/admin/reservations', 
    authenticateToken,
    async (req, res) => {
        try {
            console.log(`📊 Admin ${req.user.username} accède aux réservations`);
            
            const reservations = await reservationsCollection
                .find({})
                .sort({ createdAt: -1 })
                .toArray();
            
            const stats = {
                total: reservations.length,
                confirmed: reservations.filter(r => r.status === 'Confirmé').length,
                pending: reservations.filter(r => r.status === 'En attente de paiement').length,
                cancelled: reservations.filter(r => r.status === 'Annulé').length,
                expired: reservations.filter(r => r.status === 'Expiré').length
            };
            
            res.json({ 
                success: true, 
                count: reservations.length,
                stats,
                reservations 
            });
            
        } catch (error) {
            console.error('❌ Erreur admin:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// ============================================
// ✅ ROUTES PUBLIQUES VALIDÉES
// ============================================

// Créer une réservation
app.post('/api/reservations',
    strictLimiter,
    [
        body('bookingNumber')
            .matches(/^EB-\d{6}$/)
            .withMessage('Format numéro réservation invalide'),
        
        body('passengers')
            .isArray({ min: 1, max: 10 })
            .withMessage('1 à 10 passagers maximum'),
        
        body('passengers.*.name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .escape()
            .withMessage('Nom invalide'),
        
        body('passengers.*.phone')
            .matches(/^[\d\s\+\-\(\)]+$/)
            .isLength({ min: 8, max: 20 })
            .withMessage('Téléphone invalide'),
        
        body('passengers.*.email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Email invalide'),
        
        body('totalPriceNumeric')
            .isNumeric()
            .withMessage('Prix invalide'),
        
        body('seats')
            .isArray({ min: 1, max: 10 })
            .withMessage('Sièges invalides'),
        
        body('date')
            .isISO8601()
            .withMessage('Date invalide')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const reservation = req.body;
            
            // Vérifier doublon
            const existing = await reservationsCollection.findOne({ 
                bookingNumber: reservation.bookingNumber 
            });
            
            if (existing) {
                return res.status(409).json({ 
                    error: 'Ce numéro de réservation existe déjà' 
                });
            }
            
            // Validation paiement agence (1h minimum)
            if (reservation.paymentMethod === 'agency') {
                const departureDateTime = new Date(
                    `${reservation.date}T${reservation.route.departure}:00`
                );
                const now = new Date();
                const hoursUntilDeparture = (departureDateTime - now) / (1000 * 60 * 60);
                
                if (hoursUntilDeparture < 1) {
                    return res.status(400).json({ 
                        error: 'Paiement agence non disponible (moins de 1h avant départ)' 
                    });
                }
            }
            
            // Sauvegarder
            const result = await reservationsCollection.insertOne({
                ...reservation,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log(`✅ Réservation créée : ${reservation.bookingNumber} (${reservation.status})`);
            
            // Email (non bloquant)
            if (reservation.passengers[0]?.email) {
                sendConfirmationEmail(reservation).catch(err => 
                    console.error('Email error:', err.message)
                );
            }
            
            res.status(201).json({ 
                success: true, 
                bookingNumber: reservation.bookingNumber,
                id: result.insertedId,
                status: reservation.status,
                emailSent: !!reservation.passengers[0]?.email
            });
            
        } catch (error) {
            console.error('❌ Erreur création réservation:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// Récupérer réservations utilisateur
app.get('/api/reservations/user/:phone',
    [
        param('phone')
            .matches(/^[\d\s\+\-\(\)]+$/)
            .withMessage('Téléphone invalide')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const phone = req.params.phone.trim();
            
            const reservations = await reservationsCollection
                .find({ 'passengers.phone': phone })
                .sort({ createdAt: -1 })
                .toArray();
            
            console.log(`✅ ${reservations.length} réservations trouvées pour ${phone}`);
            
            res.json({ 
                success: true, 
                count: reservations.length,
                reservations 
            });
            
        } catch (error) {
            console.error('❌ Erreur récupération:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// Récupérer UNE réservation
app.get('/api/reservations/:bookingNumber',
    [
        param('bookingNumber')
            .matches(/^EB-\d{6}$/)
            .withMessage('Format numéro invalide')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const bookingNumber = req.params.bookingNumber;
            const reservation = await reservationsCollection.findOne({ bookingNumber });
            
            if (!reservation) {
                return res.status(404).json({ error: 'Réservation non trouvée' });
            }
            
            res.json({ success: true, reservation });
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// Annuler une réservation
app.patch('/api/reservations/:bookingNumber/cancel',
    [
        param('bookingNumber').matches(/^EB-\d{6}$/)
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const bookingNumber = req.params.bookingNumber;
            
            const result = await reservationsCollection.updateOne(
                { bookingNumber },
                { 
                    $set: { 
                        status: 'Annulé',
                        cancelledAt: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );
            
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Réservation non trouvée' });
            }
            
            console.log(`✅ Réservation annulée: ${bookingNumber}`);
            
            res.json({ success: true, message: 'Réservation annulée' });
            
        } catch (error) {
            console.error('❌ Erreur annulation:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// Confirmer paiement agence
app.patch('/api/reservations/:bookingNumber/confirm-payment',
    authenticateToken, // ✅ Seulement l'admin peut confirmer
    [
        param('bookingNumber').matches(/^EB-\d{6}$/)
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const bookingNumber = req.params.bookingNumber;
            
            const reservation = await reservationsCollection.findOne({ 
                bookingNumber,
                status: 'En attente de paiement'
            });
            
            if (!reservation) {
                return res.status(404).json({ 
                    error: 'Réservation non trouvée ou déjà confirmée' 
                });
            }
            
            await reservationsCollection.updateOne(
                { bookingNumber },
                { 
                    $set: { 
                        status: 'Confirmé',
                        paidAt: new Date(),
                        updatedAt: new Date()
                    } 
                }
            );
            
            console.log(`✅ Paiement confirmé par ${req.user.username}: ${bookingNumber}`);
            
            // Email confirmation paiement
            if (reservation.passengers[0]?.email) {
                sendPaymentConfirmedEmail(reservation).catch(err => 
                    console.error('Email error:', err.message)
                );
            }
            
            res.json({ success: true, message: 'Paiement confirmé' });
            
        } catch (error) {
            console.error('❌ Erreur confirmation paiement:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// ============================================
// 🛰️ TRACKING GPS (WebSocket)
// ============================================
const io = new Server(server, { 
    cors: { 
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    } 
});

app.post('/track/update', async (req, res) => {
    const data = req.body;
    const busId = data.tid;
    
    if (!busId || !data.lat || !data.lon) {
        return res.status(400).json({ error: "Données invalides" });
    }
    
    const newPosition = { 
        busId, 
        lat: data.lat, 
        lon: data.lon, 
        timestamp: new Date(data.tst * 1000) 
    };

    try {
        await positionsCollection.updateOne(
            { busId }, 
            { $set: newPosition }, 
            { upsert: true }
        );
        
        io.to(busId).emit('updatePosition', newPosition);
        res.status(200).json({ message: "Position reçue" });
        
    } catch (error) { 
        console.error("❌ Erreur position:", error); 
        res.status(500).json({ error: "Erreur serveur" }); 
    }
});

io.on('connection', (socket) => {
    console.log(`✅ Client WebSocket connecté: ${socket.id}`);
    
    socket.on('subscribeToBus', async (busId, callback) => {
        if (!busId) { 
            if (callback) callback({ status: "error", message: "busId manquant" }); 
            return; 
        }
        
        socket.join(busId);
        
        try {
            const lastPosition = await positionsCollection.findOne({ busId });
            
            if (lastPosition) {
                socket.emit('updatePosition', lastPosition);
                if (callback) callback({ status: "ok", message: "Abonné" });
            } else {
                if (callback) callback({ status: "ok", message: "Aucune position" });
            }
        } catch (error) { 
            console.error("❌ Erreur:", error); 
            if (callback) callback({ status: "error", message: "Erreur serveur" }); 
        }
    });
    
    socket.on('disconnect', () => { 
        console.log(`🔌 Client déconnecté: ${socket.id}`); 
    });
});

// ============================================
// ❌ GESTION D'ERREURS GLOBALE
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err);
    
    if (err.message.includes('CORS')) {
        return res.status(403).json({ error: 'Accès refusé (CORS)' });
    }
    
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Erreur serveur' 
            : err.message 
    });
});

// ============================================
// 📧 FONCTIONS EMAIL (copiées de votre ancien code)
// ============================================
async function sendConfirmationEmail(reservation) {
    // ... (votre code existant)
}

async function sendPaymentConfirmedEmail(reservation) {
    // ... (votre code existant)
}

async function sendExpirationEmail(reservation) {
    // ... (votre code existant)
}

async function sendReminderEmail(reservation) {
    // ... (votre code existant)
}


// ============================================
// 📧 FONCTIONS EMAIL NODEMAILER
// ============================================

/**
 * Envoyer email de confirmation de réservation
 */
async function sendConfirmationEmail(reservation) {
    const passenger = reservation.passengers[0];
    
    if (!passenger || !passenger.email) {
        console.log('⚠️ Pas d\'email pour cette réservation');
        return { success: false, reason: 'no_email' };
    }
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #73d700, #5fb800); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .booking-number { background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 2px solid #73d700; }
        .booking-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .booking-value { font-size: 28px; font-weight: bold; color: #73d700; letter-spacing: 2px; }
        .details { margin: 25px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-label { color: #666; font-size: 14px; }
        .detail-value { font-weight: bold; color: #333; text-align: right; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .warning-box strong { color: #856404; display: block; margin-bottom: 10px; font-size: 16px; }
        .warning-box p { color: #856404; margin: 8px 0; }
        .info-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .info-box strong { color: #2e7d32; }
        .info-box ul { margin: 10px 0 0 20px; color: #2e7d32; }
        .info-box li { margin: 5px 0; }
        .button { display: inline-block; background: #73d700; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; margin: 25px 0; font-weight: bold; }
        .button:hover { background: #5fb800; }
        .footer { background: #f5f5f5; padding: 25px; text-align: center; font-size: 13px; color: #666; }
        .footer p { margin: 5px 0; }
        .footer strong { color: #333; }
        @media only screen and (max-width: 600px) {
            .content { padding: 20px; }
            .detail-row { flex-direction: column; gap: 5px; }
            .detail-value { text-align: left; }
            .booking-value { font-size: 22px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚌 Confirmation de Réservation</h1>
            <p>En-Bus - Voyagez à travers l'Afrique</p>
        </div>
        
        <div class="content">
            <p class="greeting">Bonjour <strong>${passenger.name}</strong>,</p>
            <p>Votre réservation a été enregistrée avec succès !</p>
            
            <div class="booking-number">
                <div class="booking-label">Numéro de réservation</div>
                <div class="booking-value">${reservation.bookingNumber}</div>
            </div>
            
            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">📍 Trajet</span>
                    <span class="detail-value">${reservation.route.from} → ${reservation.route.to}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Date de départ</span>
                    <span class="detail-value">${new Date(reservation.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🕐 Heure de départ</span>
                    <span class="detail-value">${reservation.route.departure}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🚌 Compagnie</span>
                    <span class="detail-value">${reservation.route.company}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💺 Siège(s)</span>
                    <span class="detail-value">${reservation.seats.join(', ')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👥 Passagers</span>
                    <span class="detail-value">${reservation.passengers.length}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💰 Prix total</span>
                    <span class="detail-value">${reservation.totalPrice}</span>
                </div>
            </div>
            
            ${reservation.status === 'En attente de paiement' && reservation.agency ? `
                <div class="warning-box">
                    <strong>⚠️ PAIEMENT REQUIS À L'AGENCE</strong>
                    <p>Vous devez effectuer le paiement avant le <strong>${new Date(reservation.paymentDeadline).toLocaleString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</strong></p>
                    <p style="margin-top: 15px;"><strong>📍 ${reservation.agency.name}</strong></p>
                    <p>📍 ${reservation.agency.address}</p>
                    <p>📞 ${reservation.agency.phone}</p>
                    <p>🕐 ${reservation.agency.hours}</p>
                </div>
            ` : ''}
            
            <div class="info-box">
                <strong>📋 Informations importantes :</strong>
                <ul>
                    <li>Présentez-vous <strong>30 minutes avant le départ</strong></li>
                    <li>Munissez-vous d'une <strong>pièce d'identité valide</strong></li>
                    <li>Bagages inclus : <strong>1 bagage en soute (20kg)</strong> + <strong>1 bagage à main</strong></li>
                    ${reservation.route.trackerId ? `<li>Code de suivi GPS : <strong>${reservation.route.trackerId}</strong></li>` : ''}
                    ${reservation.status === 'En attente de paiement' ? '<li><strong>⚠️ Ce billet ne sera valide qu\'après paiement à l\'agence</strong></li>' : ''}
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}" class="button">
                    Voir ma réservation en ligne
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>En-Bus</strong> - Voyagez à travers l'Afrique en toute simplicité</p>
            <p>📧 ${process.env.EMAIL_FROM_ADDRESS || 'contact@en-bus.com'} | 📱 +242 06 123 4567</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.<br>
                Pour toute question, contactez notre service client.
            </p>
        </div>
    </div>
</body>
</html>
    `;
    
    const textContent = `
Bonjour ${passenger.name},

Votre réservation a été confirmée avec succès !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NUMÉRO DE RÉSERVATION : ${reservation.bookingNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DÉTAILS DU VOYAGE :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trajet : ${reservation.route.from} → ${reservation.route.to}
Date : ${new Date(reservation.date).toLocaleDateString('fr-FR')}
Heure : ${reservation.route.departure}
Compagnie : ${reservation.route.company}
Siège(s) : ${reservation.seats.join(', ')}
Prix total : ${reservation.totalPrice}

${reservation.status === 'En attente de paiement' && reservation.agency ? `
⚠️ PAIEMENT REQUIS À L'AGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deadline : ${new Date(reservation.paymentDeadline).toLocaleString('fr-FR')}
Agence : ${reservation.agency.name}
Adresse : ${reservation.agency.address}
Téléphone : ${reservation.agency.phone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}

INFORMATIONS IMPORTANTES :
• Présentez-vous 30 minutes avant le départ
• Munissez-vous d'une pièce d'identité valide
• Bagages : 1 en soute (20kg) + 1 à main inclus

Bon voyage avec En-Bus !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En-Bus - Voyagez à travers l'Afrique
📧 ${process.env.EMAIL_FROM_ADDRESS} | 📱 +242 06 123 4567
    `;
    
    const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: passenger.email,
        subject: `✅ Réservation ${reservation.status === 'En attente de paiement' ? 'enregistrée' : 'confirmée'} - ${reservation.bookingNumber} - En-Bus`,
        html: htmlContent,
        text: textContent
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé à ${passenger.email} - MessageID: ${info.messageId}`);
        return { 
            success: true, 
            messageId: info.messageId,
            recipient: passenger.email 
        };
    } catch (error) {
        console.error('❌ Erreur envoi email:', error.message);
        return { 
            success: false, 
            error: error.message,
            recipient: passenger.email 
        };
    }
}

/**
 * Envoyer email de rappel 24h avant le départ
 */
async function sendReminderEmail(reservation) {
    const passenger = reservation.passengers[0];
    
    if (!passenger || !passenger.email) {
        return { success: false, reason: 'no_email' };
    }
    
    const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: passenger.email,
        subject: `🔔 Rappel : Votre voyage demain - ${reservation.route.from} → ${reservation.route.to}`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #73d700, #5fb800); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
        .reminder-icon { font-size: 48px; margin-bottom: 10px; }
        h2 { margin: 0; }
        .detail { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .detail strong { color: #73d700; }
        .important { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #856404; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="reminder-icon">🔔</div>
            <h2>Rappel : Départ demain !</h2>
        </div>
        
        <p>Bonjour <strong>${passenger.name}</strong>,</p>
        <p>Nous vous rappelons que votre bus part <strong>demain</strong> :</p>
        
        <div class="detail">
            <p><strong>Numéro de réservation :</strong> ${reservation.bookingNumber}</p>
            <p><strong>Trajet :</strong> ${reservation.route.from} → ${reservation.route.to}</p>
            <p><strong>Heure de départ :</strong> ${reservation.route.departure}</p>
            <p><strong>Compagnie :</strong> ${reservation.route.company}</p>
            <p><strong>Siège(s) :</strong> ${reservation.seats.join(', ')}</p>
        </div>
        
        <div class="important">
            <strong>⚠️ N'oubliez pas :</strong><br>
            • Présentez-vous 30 minutes avant le départ<br>
            • Munissez-vous de votre pièce d'identité<br>
            • Vérifiez vos bagages (20kg en soute + 1 bagage à main)
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
            <strong>Bon voyage avec En-Bus ! 🚌</strong>
        </p>
        
        <div class="footer">
            <p>En-Bus - ${process.env.EMAIL_FROM_ADDRESS} - +242 06 123 4567</p>
        </div>
    </div>
</body>
</html>
        `,
        text: `
🔔 Rappel : Départ demain !

Bonjour ${passenger.name},

Votre bus part DEMAIN à ${reservation.route.departure}

Numéro : ${reservation.bookingNumber}
Trajet : ${reservation.route.from} → ${reservation.route.to}
Siège(s) : ${reservation.seats.join(', ')}

N'oubliez pas :
• Présentez-vous 30 minutes avant
• Munissez-vous de votre pièce d'identité

Bon voyage !
En-Bus
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Rappel envoyé à ${passenger.email}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur rappel:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Envoyer email d'expiration de réservation
 */
async function sendExpirationEmail(reservation) {
    const passenger = reservation.passengers[0];
    
    if (!passenger || !passenger.email) {
        return { success: false, reason: 'no_email' };
    }
    
    const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: passenger.email,
        subject: `❌ Réservation expirée - ${reservation.bookingNumber} - En-Bus`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #f44336; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
        .button { display: inline-block; background: #73d700; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>❌ Réservation expirée</h2>
        </div>
        
        <p>Bonjour <strong>${passenger.name}</strong>,</p>
        <p>Malheureusement, votre réservation <strong>${reservation.bookingNumber}</strong> a expiré car le paiement n'a pas été effectué dans les délais impartis.</p>
        
        <p>Pour voyager, vous devrez effectuer une nouvelle réservation.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}" class="button">
                Faire une nouvelle réservation
            </a>
        </div>
        
        <p style="margin-top: 30px;">Cordialement,<br>L'équipe En-Bus</p>
    </div>
</body>
</html>
        `,
        text: `
Bonjour ${passenger.name},

Votre réservation ${reservation.bookingNumber} a expiré car le paiement n'a pas été effectué dans les délais.

Pour voyager, effectuez une nouvelle réservation sur notre site.

Cordialement,
L'équipe En-Bus
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email expiration envoyé à ${passenger.email}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur email expiration:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Envoyer email de confirmation de paiement
 */
async function sendPaymentConfirmedEmail(reservation) {
    const passenger = reservation.passengers[0];
    
    if (!passenger || !passenger.email) {
        return { success: false, reason: 'no_email' };
    }
    
    const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: passenger.email,

        subject: `✅ Paiement confirmé - ${reservation.bookingNumber} - En-Bus`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
        .success-icon { font-size: 64px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h2>Paiement confirmé !</h2>
        </div>
        
        <p>Bonjour <strong>${passenger.name}</strong>,</p>
        <p>Nous avons bien reçu votre paiement pour la réservation <strong>${reservation.bookingNumber}</strong>.</p>
        <p>Votre billet est maintenant <strong>valide et confirmé</strong>.</p>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0;"><strong>Rappel :</strong></p>
            <p style="margin: 10px 0 0 0;">Présentez-vous 30 minutes avant le départ avec votre pièce d'identité.</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
            <strong>Bon voyage avec En-Bus ! 🚌</strong>
        </p>
    </div>
</body>
</html>
        `,
        text: `
✅ Paiement confirmé !

Bonjour ${passenger.name},

Nous avons bien reçu votre paiement pour ${reservation.bookingNumber}.

Votre billet est maintenant valide et confirmé.

Bon voyage !
En-Bus
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email confirmation paiement envoyé à ${passenger.email}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur email confirmation paiement:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// ⏰ CRON JOBS
// ============================================
if (process.env.CRON_ENABLED === 'true') {
    // Vérifier réservations expirées (toutes les heures)
    cron.schedule(process.env.CRON_SCHEDULE || '0 * * * *', async () => {
        console.log('🕐 [CRON] Vérification réservations expirées...');
        
        const now = new Date();
        
        try {
            const expiredReservations = await reservationsCollection.find({
                status: 'En attente de paiement',
                paymentDeadline: { $lt: now.toISOString() }
            }).toArray();
            
            for (const reservation of expiredReservations) {
                await reservationsCollection.updateOne(
                    { bookingNumber: reservation.bookingNumber },
                    { 
                        $set: { 
                            status: 'Expiré',
                            cancelledAt: now,
                            cancelReason: 'Paiement non effectué',
                            updatedAt: now
                        } 
                    }
                );
                
                console.log(`❌ [CRON] ${reservation.bookingNumber} → Expiré`);
                
                if (reservation.passengers[0]?.email) {
                    sendExpirationEmail(reservation).catch(err => 
                        console.error('Email error:', err.message)
                    );
                }
            }
            
            if (expiredReservations.length > 0) {
                console.log(`✅ [CRON] ${expiredReservations.length} réservation(s) expirée(s)`);
            }
            
        } catch (error) {
            console.error('❌ [CRON] Erreur:', error);
        }
    });

    // Rappels 24h avant (tous les jours à 8h)
    cron.schedule('0 8 * * *', async () => {
        console.log('📧 [CRON] Envoi rappels 24h...');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        try {
            const reservations = await reservationsCollection.find({
                status: 'Confirmé',
                date: tomorrowStr
            }).toArray();
            
            for (const reservation of reservations) {
                if (reservation.passengers[0]?.email) {
                    await sendReminderEmail(reservation);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            console.log(`✅ [CRON] ${reservations.length} rappel(s) envoyé(s)`);
            
        } catch (error) {
            console.error('❌ [CRON] Erreur rappels:', error);
        }
    });
    
    console.log('✅ Cron jobs activés');
}

// ============================================
// 🚀 DÉMARRAGE SERVEUR
// ============================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Backend En-Bus (SÉCURISÉ) démarré
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port : ${PORT}
🌐 Environnement : ${process.env.NODE_ENV || 'development'}
🛡️ Sécurité : ✅ Helmet + CORS + Rate Limit + JWT
📧 Email : ${transporter ? '✅' : '❌'}
⏰ Cron : ${process.env.CRON_ENABLED === 'true' ? '✅' : '❌'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    await connectToDb();
});