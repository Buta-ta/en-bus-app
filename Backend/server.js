// ============================================
// 🚀 EN-BUS BACKEND - VERSION FINALE COMPLÈTE
// ============================================

require('dotenv').config();

// --- Imports ---
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require('mongodb'); // ✅ On importe aussi ObjectId
const cron = require('node-cron');
const { Resend } = require('resend');
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
    'MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH',
    'RESEND_API_KEY', 'EMAIL_FROM_ADDRESS', 'ALLOWED_ORIGINS'
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingEnvVars.join(', '));
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
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ============================================
// 🚦 RATE LIMITING
// ============================================
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.use('/api/', generalLimiter);

// ============================================
// 📧 CONFIGURATION RESEND (API HTTP)
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);
console.log('✅ Service email prêt (via Resend API).');

// ============================================
// 🗄️ CONNEXION MONGODB
// ============================================
const dbClient = new MongoClient(process.env.MONGODB_URI);
let reservationsCollection, positionsCollection, tripsCollection, routeTemplatesCollection;;
async function connectToDb() {
    try {
        await dbClient.connect();
        const database = dbClient.db('en-bus-db');
        reservationsCollection = database.collection('reservations');
        positionsCollection = database.collection('positions');

        tripsCollection = database.collection('trips'); // ✅ AJOUTER CETTE LIGNE
        routeTemplatesCollection = database.collection('route_templates'); // ✅ AJOUTER CETTE LIGNE
        console.log("✅ Connecté à MongoDB et index créés.");
        await tripsCollection.createIndex({ date: 1, "route.from": 1, "route.to": 1 }); 
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
        const stats = { total: reservations.length, confirmed: reservations.filter(r => r.status === 'Confirmé').length, pending: reservations.filter(r => r.status === 'En attente de paiement').length, cancelled: reservations.filter(r => r.status === 'Annulé').length, expired: reservations.filter(r => r.status === 'Expiré').length };
        res.json({ success: true, count: reservations.length, stats, reservations });
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// Dans server.js, dans la section des routes admin


// ============================================
// 🔐 ROUTE DE VÉRIFICATION DU TOKEN
// ============================================
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true, 
        user: req.user,
        expiresIn: process.env.JWT_EXPIRES_IN 
    });
});

// ============================================
// 🚌 NOUVELLES ROUTES ADMIN - GESTION DES MODÈLES DE TRAJETS
// ============================================

// Lister tous les modèles de trajets
app.get('/api/admin/route-templates', authenticateToken, async (req, res) => {
    try {
        const templates = await routeTemplatesCollection.find({}).toArray();
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Dans Backend/server.js

app.post('/api/admin/trips', authenticateToken, [
    body('routeId').notEmpty().withMessage('Un modèle de trajet est requis.'),
    body('startDate').isISO8601().withMessage('Date de début invalide.'),
    body('endDate').isISO8601().withMessage('Date de fin invalide.'),
    body('daysOfWeek').isArray({ min: 1 }).withMessage('Veuillez sélectionner au moins un jour.'),
    body('seatCount').isInt({ min: 10, max: 100 }).withMessage('Le nombre de sièges doit être entre 10 et 100.') // ✅ NOUVELLE VALIDATION
],

async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { routeId, startDate, endDate, daysOfWeek, seatCount } = req.body; // ✅ RÉCUPÉRER seatCount
        
        const routeTemplate = await routeTemplatesCollection.findOne({ 
            _id: new ObjectId(routeId) 
        });
        if (!routeTemplate) {
            return res.status(404).json({ error: 'Modèle de trajet non trouvé.' });
        }

        let newTrips = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        while (currentDate <= lastDate) {
            const dayName = dayMap[currentDate.getUTCDay()];

            if (daysOfWeek.includes(dayName)) {
                
                // ✅ UTILISER LE NOMBRE DE SIÈGES FOURNI PAR L'ADMIN
                const seats = Array.from({ length: seatCount }, (_, i) => ({ 
                    number: i + 1, 
                    status: 'available' 
                }));

                newTrips.push({
                    date: currentDate.toISOString().split('T')[0],
                    route: routeTemplate,
                    seats: seats, // Le tableau de sièges a maintenant la bonne taille
                    createdAt: new Date()
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (newTrips.length > 0) {
            await tripsCollection.insertMany(newTrips);
        }
        
        res.status(201).json({ success: true, message: `${newTrips.length} voyage(s) créé(s) avec ${seatCount} sièges chacun.` });

    } catch (error) {
        console.error("Erreur création voyages:", error);
        res.status(500).json({ error: 'Erreur serveur lors de la création des voyages.' });
    }
});












async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { routeId, startDate, endDate, daysOfWeek } = req.body;
        
        // ✅ C'EST ICI LA CORRECTION
        const routeTemplate = await routeTemplatesCollection.findOne({ 
            _id: new ObjectId(routeId) 
        });

        if (!routeTemplate) {
            return res.status(404).json({ error: 'Modèle de trajet non trouvé' });
        }

        let newTrips = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        while (currentDate <= lastDate) {
            const dayName = dayMap[currentDate.getUTCDay()];
            if (daysOfWeek.includes(dayName)) {
                const seats = Array.from({ length: 61 }, (_, i) => ({ number: i + 1, status: 'available' }));
                newTrips.push({
                    date: currentDate.toISOString().split('T')[0],
                    route: routeTemplate,
                    seats,
                    createdAt: new Date()
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (newTrips.length > 0) {
            await tripsCollection.insertMany(newTrips);
        }
        
        res.status(201).json({ success: true, message: `${newTrips.length} voyage(s) créé(s) avec succès.` });

    } catch (error) {
        console.error("Erreur création voyages:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}


// Supprimer un modèle de trajet
app.delete('/api/admin/route-templates/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Utilisation corrigée de ObjectId.isValid()
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de modèle invalide' });
        }

        const result = await routeTemplatesCollection.deleteOne({ 
            // ✅ Utilisation corrigée de new ObjectId()
            _id: new ObjectId(id) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Modèle de trajet non trouvé' });
        }

        res.json({ success: true, message: 'Modèle de trajet supprimé avec succès.' });

    } catch (error) {
        console.error("Erreur suppression modèle:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ✅ NOUVELLES ROUTES AJOUTÉES
app.get('/api/admin/trips', authenticateToken, async (req, res) => {
    try {
        const trips = await tripsCollection.find({}).sort({ date: -1 }).toArray();
        res.json({ success: true, trips });
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});


// ============================================
// 🚌 MODIFICATION ET SUPPRESSION DE VOYAGES
// ============================================

// Modifier un voyage (date, heure, prix, etc.)
app.patch('/api/admin/trips/:id', authenticateToken, [
    body('date').optional().isISO8601(),
    body('seatCount').optional().isInt({ min: 10, max: 100 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de voyage invalide' });
        }

        const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
        if (!trip) {
            return res.status(404).json({ error: 'Voyage non trouvé' });
        }

        // Si modification du nombre de sièges
        if (updates.seatCount && updates.seatCount !== trip.seats.length) {
            const currentOccupied = trip.seats.filter(s => s.status === 'occupied');
            
            if (updates.seatCount < currentOccupied.length) {
                return res.status(400).json({ 
                    error: `Impossible : ${currentOccupied.length} sièges déjà occupés` 
                });
            }

            // Recréer le tableau de sièges
            const newSeats = [];
            for (let i = 0; i < updates.seatCount; i++) {
                const existingSeat = trip.seats[i];
                newSeats.push(existingSeat || { number: i + 1, status: 'available' });
            }
            updates.seats = newSeats;
        }

        const result = await tripsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updates, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ error: 'Aucune modification effectuée' });
        }

        res.json({ success: true, message: 'Voyage modifié avec succès' });

    } catch (error) {
        console.error("Erreur modification voyage:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un voyage
app.delete('/api/admin/trips/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de voyage invalide' });
        }

        const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
        if (!trip) {
            return res.status(404).json({ error: 'Voyage non trouvé' });
        }

        // Vérifier s'il y a des réservations
        const occupiedSeats = trip.seats.filter(s => s.status === 'occupied').length;
        if (occupiedSeats > 0) {
            return res.status(400).json({ 
                error: `Impossible de supprimer : ${occupiedSeats} siège(s) réservé(s)` 
            });
        }

        const result = await tripsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Voyage non trouvé' });
        }

        res.json({ success: true, message: 'Voyage supprimé avec succès' });

    } catch (error) {
        console.error("Erreur suppression voyage:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


app.post('/api/admin/trips', authenticateToken, [ /* ... validations ... */ ], async (req, res) => {
    try {
        const { routeId, startDate, endDate, daysOfWeek } = req.body;
        const routeTemplate = await routeTemplatesCollection.findOne({ _id: new ObjectId(routeId) });
        if (!routeTemplate) return res.status(404).json({ error: 'Modèle non trouvé' });

        let newTrips = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
        const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        while (currentDate <= lastDate) {
            const dayName = dayMap[currentDate.getUTCDay()];
            if (daysOfWeek.includes(dayName)) {
                const seats = Array.from({ length: 61 }, (_, i) => ({ number: i + 1, status: 'available' }));
                newTrips.push({ date: currentDate.toISOString().split('T')[0], route: routeTemplate, seats, createdAt: new Date() });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (newTrips.length > 0) await tripsCollection.insertMany(newTrips);
        res.status(201).json({ success: true, message: `${newTrips.length} voyage(s) créé(s).` });
    } catch (error) { console.error("Erreur création voyages:", error); res.status(500).json({ error: 'Erreur serveur' }); }
});

app.get('/api/admin/route-templates', authenticateToken, async (req, res) => {
    try {
        const templates = await routeTemplatesCollection.find({}).toArray();
        res.json({ success: true, templates });
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.post('/api/admin/route-templates', authenticateToken, async (req, res) => {
    try {
        const template = req.body;
        await routeTemplatesCollection.insertOne(template);
        res.status(201).json({ success: true, message: 'Modèle créé.' });
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});

app.delete('/api/admin/route-templates/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    try {
        const result = await routeTemplatesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Modèle non trouvé' });
        res.json({ success: true, message: 'Modèle supprimé.' });
    } catch (error) { res.status(500).json({ error: 'Erreur serveur' }); }
});


// ============================================
// 🔍 ROUTE DE RECHERCHE CLIENT (données dynamiques)
// ============================================

app.get('/api/search', async (req, res) => {
    const { from, to, date } = req.query;
    
    // Validation
    if (!from || !to || !date) {
        return res.status(400).json({ 
            error: 'Paramètres manquants. Requis : from, to, date' 
        });
    }
    
    try {
        console.log(`🔍 Recherche : ${from} → ${to} le ${date}`);
        
        // Rechercher dans MongoDB les voyages correspondants
        // ✅ DEBUG : Afficher toutes les requêtes
console.log('📋 Critères de recherche:', {
    from: from,
    to: to,
    date: date
});

// Chercher TOUS les voyages pour cette route (sans filtre de date)
const allTripsForRoute = await tripsCollection.find({
    "route.from": from,
    "route.to": to
}).toArray();

console.log(`📊 Voyages trouvés pour ${from} → ${to} (toutes dates) : ${allTripsForRoute.length}`);
if (allTripsForRoute.length > 0) {
    console.log('Dates disponibles:', allTripsForRoute.map(t => t.date));
}

// Maintenant chercher avec la date exacte
const trips = await tripsCollection.find({
    "route.from": from,
    "route.to": to,
    "date": date
}).toArray();

console.log(`✅ ${trips.length} voyage(s) trouvé(s) pour la date ${date}`);
        
        console.log(`✅ ${trips.length} voyage(s) trouvé(s)`);
        
        // Transformer les données pour correspondre au format attendu par le frontend
        const results = trips.map(trip => {
            const availableSeats = trip.seats.filter(s => s.status === 'available').length;
            
            return {
                // ✅ ID MongoDB converti en string
                id: trip._id.toString(),
                
                // ✅ Informations du trajet (depuis le modèle utilisé lors de la création)
                from: trip.route.from,
                to: trip.route.to,
                company: trip.route.company,
                price: trip.route.price,
                duration: trip.route.duration || "N/A",
                departure: trip.route.departure,
                arrival: trip.route.arrival,
                
                // ✅ Équipements et type de trajet
                amenities: trip.route.amenities || [],
                tripType: trip.route.tripType || "direct",
                stops: trip.route.stops || [],
                connections: trip.route.connections || [],
                breaks: trip.route.breaks || 0,
                
                // ✅ Suivi GPS (si disponible)
                trackerId: trip.route.trackerId || null,
                
                // ✅ Disponibilité en temps réel
                availableSeats: availableSeats,
                totalSeats: trip.seats.length,
                
                // ✅ Métadonnées utiles
                date: trip.date,
                createdAt: trip.createdAt
            };
        });
        
        res.json({ 
            success: true, 
            count: results.length,
            results: results 
        });
        
    } catch (error) {
        console.error('❌ Erreur recherche:', error);
        res.status(500).json({ 
            error: 'Erreur serveur lors de la recherche' 
        });
    }
});


// ============================================
// 🔍 NOUVELLE ROUTE DE RECHERCHE CLIENT
// ============================================

app.get('/api/search', [
    body('from').notEmpty(),
    body('to').notEmpty(),
    body('date').isISO8601(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { from, to, date } = req.query;

        const availableTrips = await tripsCollection.find({
            "route.from": from,
            "route.to": to,
            "date": date
        }).toArray();
        
        // Pour chaque voyage, on calcule le nombre de sièges disponibles
        const results = availableTrips.map(trip => {
            const availableSeatsCount = trip.seats.filter(s => s.status === 'available').length;
            return {
                tripId: trip._id,
                route: trip.route,
                availableSeats: availableSeatsCount
            };
        });

        res.json({ success: true, results });

    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// 🐛 ROUTE DE DEBUG (À SUPPRIMER APRÈS TEST)
// ============================================
app.get('/api/debug/trips', authenticateToken, async (req, res) => {
    try {
        const allTrips = await tripsCollection.find({}).limit(10).toArray();
        
        res.json({
            count: allTrips.length,
            trips: allTrips.map(t => ({
                id: t._id,
                date: t.date,
                from: t.route?.from,
                to: t.route?.to,
                company: t.route?.company,
                seatsTotal: t.seats?.length
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ============================================
// 📧 FONCTIONS D'ENVOI D'EMAIL (complètes)
// ============================================
async function sendEmailWithResend(mailOptions) {
    try {
        const { data, error } = await resend.emails.send(mailOptions);
        if (error) throw error;
        console.log(`✅ Email envoyé à ${mailOptions.to} via Resend. ID: ${data.id}`);
    } catch (error) { console.error(`❌ Erreur envoi email (Resend) à ${mailOptions.to}:`, error.message); }
}

// Dans Backend/server.js

function sendConfirmationEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;

    // ✅ TEMPLATE HTML PROFESSIONNEL
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background-color: #10101A; color: #73d700; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 25px; line-height: 1.6; }
        .booking-number { background-color: #f0f0f0; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px dashed #ccc; }
        .booking-label { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
        .booking-value { font-size: 32px; font-weight: bold; color: #73d700; font-family: 'Courier New', Courier, monospace; }
        .details-table { width: 100%; margin: 30px 0; border-collapse: collapse; }
        .details-table td { padding: 15px 0; border-bottom: 1px solid #eeeeee; font-size: 15px; }
        .details-table tr:last-child td { border-bottom: none; }
        .details-table td:first-child { color: #555; }
        .details-table td:last-child { font-weight: 700; text-align: right; }
        .info-box { background-color: #e8f5e9; border-left: 5px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 5px; }
        .info-box strong { color: #2e7d32; display: block; margin-bottom: 10px; }
        .info-box ul { margin: 0; padding-left: 20px; color: #388e3c; }
        .info-box li { margin-bottom: 8px; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: #73d700; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
        .footer { background-color: #f4f4f7; padding: 25px; text-align: center; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>En-Bus</h1>
        </div>
        <div class="content">
            <p class="greeting">Bonjour <strong>${passenger.name}</strong>,</p>
            <p style="line-height: 1.6;">Votre réservation a été enregistrée avec succès ! Voici un récapitulatif complet de votre prochain voyage :</p>
            
            <div class="booking-number">
                <div class="booking-label">Numéro de Réservation</div>
                <div class="booking-value">${reservation.bookingNumber}</div>
            </div>
            
            <h3 style="font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #73d700; padding-bottom: 5px;">Détails du Voyage</h3>
            <table class="details-table">
                <tr><td>Statut</td><td><strong>${reservation.status}</strong></td></tr>
                <tr><td>Trajet</td><td>${reservation.route.from} → ${reservation.route.to}</td></tr>
                <tr><td>Date</td><td>${new Date(reservation.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                <tr><td>Heure de Départ</td><td>${reservation.route.departure}</td></tr>
                <tr><td>Compagnie</td><td>${reservation.route.company}</td></tr>
                <tr><td>Siège(s)</td><td>${reservation.seats.join(', ')}</td></tr>
                <tr><td>Passagers</td><td>${reservation.passengers.length}</td></tr>
                <tr><td>Prix Total</td><td>${reservation.totalPrice}</td></tr>
            </table>
            
            ${reservation.status === 'En attente de paiement' ? `
                <div style="background-color: #fff8e1; border-left: 5px solid #ffab00; padding: 20px; margin: 30px 0; border-radius: 5px;">
                    <strong style="color: #e65100; display: block; margin-bottom: 10px;">⚠️ PAIEMENT REQUIS À L'AGENCE</strong>
                    <p style="color: #e65100;">Vous devez effectuer le paiement avant le <strong>${new Date(reservation.paymentDeadline).toLocaleString('fr-FR')}</strong> pour valider ce billet.</p>
                </div>
            ` : ''}
            
            <div class="info-box">
                <strong>Informations importantes pour l'embarquement :</strong>
                <ul>
                    <li>Présentez-vous <strong>30 minutes avant l'heure de départ</strong>.</li>
                    <li>Une <strong>pièce d'identité valide</strong> est obligatoire.</li>
                    <li>Bagages inclus : 1 bagage en soute (20kg) et 1 bagage à main.</li>
                </ul>
            </div>
            
            <div class="button-container">
                <a href="${process.env.PRODUCTION_URL || process.env.FRONTEND_URL}" class="button">Voir ma réservation en ligne</a>
            </div>
        </div>
        <div class="footer">
            <p>Cet email est envoyé automatiquement. Pour toute question, contactez notre service client.</p>
            <p>&copy; ${new Date().getFullYear()} En-Bus. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
    `;

    sendEmailWithResend({
        from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `✅ Réservation ${reservation.status === 'En attente de paiement' ? 'enregistrée' : 'confirmée'} : ${reservation.bookingNumber}`,
        html: htmlContent
    });
}

function sendReminderEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;
    const htmlContent = `<h1>Rappel de votre voyage demain</h1><p>N'oubliez pas votre trajet ${reservation.route.from} → ${reservation.route.to} demain à ${reservation.route.departure}.</p>`;
    sendEmailWithResend({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `🔔 Rappel de voyage : ${reservation.bookingNumber}`,
        html: htmlContent
    });
}

function sendExpirationEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;
    const htmlContent = `<h1>Réservation expirée</h1><p>Votre réservation ${reservation.bookingNumber} a expiré.</p>`;
    sendEmailWithResend({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `❌ Réservation expirée : ${reservation.bookingNumber}`,
        html: htmlContent
    });
}

function sendPaymentConfirmedEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;
    const htmlContent = `<h1>Paiement Confirmé</h1><p>Votre paiement pour la réservation ${reservation.bookingNumber} a été reçu.</p>`;
    sendEmailWithResend({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `✅ Paiement confirmé : ${reservation.bookingNumber}`,
        html: htmlContent
    });
}

// ============================================
// ⏰ CRON JOBS
// ============================================
if (process.env.NODE_ENV === 'production' && process.env.CRON_ENABLED === 'true') {
    cron.schedule('0 * * * *', async () => {
        const now = new Date();
        const expiredReservations = await reservationsCollection.find({ status: 'En attente de paiement', paymentDeadline: { $lt: now.toISOString() } }).toArray();
        for (const reservation of expiredReservations) {
            await reservationsCollection.updateOne({ _id: reservation._id }, { $set: { status: 'Expiré', cancelledAt: now } });
            sendExpirationEmail(reservation);
        }
    });
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
    socket.on('subscribeToBus', async (busId) => {
        socket.join(busId);
        const lastPosition = await positionsCollection.findOne({ busId });
        if (lastPosition) socket.emit('updatePosition', lastPosition);
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
📧 Email : ✅ via Resend API
⏰ Cron : ${process.env.NODE_ENV === 'production' ? '✅' : '❌'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    });
})();