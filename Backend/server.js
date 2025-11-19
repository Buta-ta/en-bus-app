// ============================================
// 🚀 EN-BUS BACKEND - VERSION CORRIGÉE
// ============================================

require('dotenv').config();

// --- Imports ---
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require('mongodb');
const cron = require('node-cron');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

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
// 📧 CONFIGURATION RESEND
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);
console.log('✅ Service email prêt.');

// ============================================
// 🗄️ CONNEXION MONGODB
// ============================================
const dbClient = new MongoClient(process.env.MONGODB_URI);
let reservationsCollection, positionsCollection, tripsCollection, routeTemplatesCollection;

async function connectToDb() {
    try {
        await dbClient.connect();
        const database = dbClient.db('en-bus-db');
        reservationsCollection = database.collection('reservations');
        positionsCollection = database.collection('positions');
        tripsCollection = database.collection('trips');
        routeTemplatesCollection = database.collection('route_templates');
        
        await tripsCollection.createIndex({ date: 1, "route.from": 1, "route.to": 1 });
        console.log("✅ Connecté à MongoDB et index créés.");
    } catch (error) {
        console.error("❌ Erreur connexion DB:", error.message);
        process.exit(1);
    }
}

// ============================================
// 🔐 MIDDLEWARE
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

// ============================================
// === ROUTES ADMIN ===
// ============================================

app.post('/api/admin/login', loginLimiter, [
    body('username').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { username, password } = req.body;
    if (username !== process.env.ADMIN_USERNAME || !await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
    res.json({ success: true, token });
});

app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user, expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
});

app.get('/api/admin/reservations', authenticateToken, async (req, res) => {
    try {
        const reservations = await reservationsCollection.find({}).sort({ createdAt: -1 }).toArray();
        const stats = {
            total: reservations.length,
            confirmed: reservations.filter(r => r.status === 'Confirmé').length,
            pending: reservations.filter(r => r.status === 'En attente de paiement').length,
            cancelled: reservations.filter(r => r.status === 'Annulé').length,
            expired: reservations.filter(r => r.status === 'Expiré').length
        };
        res.json({ success: true, count: reservations.length, stats, reservations });
    } catch (error) {
        console.error('Erreur récupération réservations:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// GESTION DES MODÈLES DE TRAJETS
// ============================================

app.get('/api/admin/route-templates', authenticateToken, async (req, res) => {
    try {
        const templates = await routeTemplatesCollection.find({}).toArray();
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/admin/route-templates', authenticateToken, async (req, res) => {
    try {
        const template = req.body;
        
        if (template.from) template.from = template.from.trim();
        if (template.to) template.to = template.to.trim();
        if (template.company) template.company = template.company.trim();
        
        const baggageOptions = {
            standard: {
                included: parseInt(template.standardBaggageIncluded) || 1,
                max: parseInt(template.standardBaggageMax) || 5,
                price: parseInt(template.standardBaggagePrice) || 2000
            },
            oversized: {
                max: parseInt(template.oversizedBaggageMax) || 2,
                price: parseInt(template.oversizedBaggagePrice) || 5000
            }
        };

        delete template.standardBaggageIncluded;
        delete template.standardBaggageMax;
        delete template.standardBaggagePrice;
        delete template.oversizedBaggageMax;
        delete template.oversizedBaggagePrice;

        template.baggageOptions = baggageOptions;

        if (!template.duration) {
            try {
                const start = new Date(`1970-01-01T${template.departure}:00`);
                const end = new Date(`1970-01-01T${template.arrival}:00`);
                if (end < start) end.setDate(end.getDate() + 1);
                const diffMs = end - start;
                const hours = Math.floor(diffMs / 3600000);
                const minutes = Math.floor((diffMs % 3600000) / 60000);
                template.duration = `${hours}h ${minutes}m`;
            } catch (e) {
                template.duration = "N/A";
            }
        }
        
        await routeTemplatesCollection.insertOne(template);
        res.status(201).json({ success: true, message: 'Modèle créé avec succès.' });

    } catch (error) {
        console.error('❌ Erreur création modèle:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.patch('/api/admin/route-templates/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        let updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de modèle invalide' });
        }
        
        if (updates.from) updates.from = updates.from.trim();
        if (updates.to) updates.to = updates.to.trim();
        if (updates.company) updates.company = updates.company.trim();

        if (updates.standardBaggageIncluded !== undefined) {
            updates.baggageOptions = {
                standard: {
                    included: parseInt(updates.standardBaggageIncluded),
                    max: parseInt(updates.standardBaggageMax),
                    price: parseInt(updates.standardBaggagePrice)
                },
                oversized: {
                    max: parseInt(updates.oversizedBaggageMax),
                    price: parseInt(updates.oversizedBaggagePrice)
                }
            };
            delete updates.standardBaggageIncluded;
            delete updates.standardBaggageMax;
            delete updates.standardBaggagePrice;
            delete updates.oversizedBaggageMax;
            delete updates.oversizedBaggagePrice;
        }

        const result = await routeTemplatesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.modifiedCount === 0) {
            return res.status(200).json({ success: true, message: 'Aucune modification détectée.' });
        }

        res.json({ success: true, message: 'Modèle mis à jour avec succès.' });

    } catch (error) {
        console.error('❌ Erreur mise à jour modèle:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.delete('/api/admin/route-templates/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });
    
    try {
        const result = await routeTemplatesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Modèle non trouvé' });
        res.json({ success: true, message: 'Modèle supprimé.' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// GESTION DES VOYAGES
// ============================================

app.get('/api/admin/trips', authenticateToken, async (req, res) => {
    try {
        const trips = await tripsCollection.find({}).sort({ date: -1 }).toArray();
        res.json({ success: true, trips });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/admin/trips', authenticateToken, [
    body('routeId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('daysOfWeek').isArray({ min: 1 }),
    body('seatCount').isInt({ min: 10, max: 100 }),
    body('busIdentifier').optional().isString().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { routeId, startDate, endDate, daysOfWeek, seatCount, busIdentifier } = req.body;
        
        const routeTemplate = await routeTemplatesCollection.findOne({ _id: new ObjectId(routeId) });
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
                const seats = Array.from({ length: seatCount }, (_, i) => ({ 
                    number: i + 1, 
                    status: 'available' 
                }));
                
                newTrips.push({
                    date: currentDate.toISOString().split('T')[0],
                    route: routeTemplate,
                    seats: seats,
                    busIdentifier: busIdentifier || null,
                    createdAt: new Date()
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (newTrips.length > 0) {
            await tripsCollection.insertMany(newTrips);
            console.log(`✅ ${newTrips.length} voyage(s) créé(s).`);
        }
        
        res.status(201).json({ 
            success: true, 
            message: `${newTrips.length} voyage(s) créé(s) avec ${seatCount} sièges chacun.` 
        });

    } catch (error) {
        console.error("❌ Erreur création voyages:", error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

app.patch('/api/admin/trips/:id', authenticateToken, [
    body('date').optional().isISO8601(),
    body('seatCount').optional().isInt({ min: 10, max: 100 }),
    body('route.amenities').optional().isArray()
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

        if (updates.seatCount && updates.seatCount !== trip.seats.length) {
            const currentOccupied = trip.seats.filter(s => s.status === 'occupied');
            
            if (updates.seatCount < currentOccupied.length) {
                return res.status(400).json({ 
                    error: `Impossible : ${currentOccupied.length} sièges déjà occupés` 
                });
            }

            const newSeats = [];
            for (let i = 0; i < updates.seatCount; i++) {
                const existingSeat = trip.seats[i];
                newSeats.push(existingSeat || { number: i + 1, status: 'available' });
            }
            updates.seats = newSeats;
            delete updates.seatCount;
        }

        const result = await tripsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updates, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0 && result.matchedCount > 0) {
            return res.status(200).json({ success: true, message: 'Aucune modification nécessaire.' });
        }
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Voyage non trouvé.' });
        }

        res.json({ success: true, message: 'Voyage modifié avec succès' });

    } catch (error) {
        console.error("Erreur modification voyage:", error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

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


// DANS server.js

// ============================================
// ✅ NOUVELLE ROUTE : RÉINITIALISER LES SIÈGES D'UN VOYAGE
// ============================================
app.patch('/api/admin/trips/:id/reset-seats', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de voyage invalide' });
        }

        // Trouver le voyage pour connaître le nombre total de sièges
        const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
        if (!trip) {
            return res.status(404).json({ error: 'Voyage non trouvé.' });
        }

        // Créer un nouveau tableau de sièges où tous sont disponibles
        const newSeats = Array.from({ length: trip.seats.length }, (_, i) => ({
            number: i + 1,
            status: 'available'
        }));

        // Mettre à jour le voyage avec le nouveau tableau de sièges
        const result = await tripsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { seats: newSeats, updatedAt: new Date() } }
        );
        
        if (result.modifiedCount === 0 && result.matchedCount > 0) {
            return res.status(200).json({ success: true, message: 'Les sièges étaient déjà tous disponibles.' });
        }

        console.log(`♻️ Réinitialisation des sièges pour le voyage ${id} par ${req.user?.username || 'admin'}.`);

        res.json({ success: true, message: 'Tous les sièges du voyage ont été réinitialisés.' });

    } catch (error) {
        console.error('❌ Erreur réinitialisation sièges:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

app.patch('/api/admin/trips/:tripId/seats/:seatNumber', authenticateToken, [
    body('status').isIn(['available', 'blocked'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { tripId, seatNumber } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: 'ID de voyage invalide' });
        }

        const seatNum = parseInt(seatNumber);
        
        const result = await tripsCollection.updateOne(
            { _id: new ObjectId(tripId), "seats.number": seatNum },
            { $set: { "seats.$.status": status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Voyage ou siège non trouvé.' });
        }
        
        if (result.modifiedCount === 0) {
            return res.status(200).json({ success: true, message: 'Statut du siège déjà à jour.' });
        }

        res.json({ success: true, message: `Siège ${seatNum} mis à jour` });

    } catch (error) {
        console.error('❌ Erreur mise à jour siège:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ============================================
// RECHERCHE CLIENT
// ============================================

app.get('/api/search', async (req, res) => {
    let { from, to, date } = req.query;
    
    if (!from || !to || !date) {
        return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    from = from.trim();
    to = to.trim();
    
    try {
        console.log(`🔍 Recherche : ${from} → ${to} le ${date}`);
        
        const trips = await tripsCollection.find({
            "route.from": { $regex: `^${from}`, $options: 'i' },
            "route.to": { $regex: `^${to}`, $options: 'i' },
            "date": date
        }).toArray();
        
        console.log(`✅ ${trips.length} voyage(s) trouvé(s)`);
        
        const results = trips.map(trip => {
            const availableSeats = trip.seats.filter(s => s.status === 'available').length;
            
            return {
                id: trip._id.toString(),
                from: trip.route.from,
                to: trip.route.to,
                company: trip.route.company,
                price: trip.route.price,
                duration: trip.route.duration || "N/A",
                departure: trip.route.departure,
                arrival: trip.route.arrival,
                amenities: trip.route.amenities || [],
                tripType: trip.route.tripType || "direct",
                stops: trip.route.stops || [],
                connections: trip.route.connections || [],
                breaks: trip.route.breaks || 0,
                trackerId: trip.busIdentifier || trip.route.trackerId || null,
                availableSeats: availableSeats,
                totalSeats: trip.seats.length,
                date: trip.date,
                createdAt: trip.createdAt,
                busIdentifier: trip.busIdentifier || null,
                baggageOptions: trip.route.baggageOptions
            };
        });
        
        res.json({ success: true, count: results.length, results });
        
    } catch (error) {
        console.error('❌ Erreur recherche:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/trips/:id/seats', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID invalide' });
        }
        
        const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
        if (!trip) {
            return res.status(404).json({ error: 'Voyage non trouvé' });
        }
        
        res.json({ 
            success: true, 
            seats: trip.seats,
            totalSeats: trip.seats.length,
            availableSeats: trip.seats.filter(s => s.status === 'available').length,
            occupiedSeats: trip.seats.filter(s => s.status === 'occupied').length,
            blockedSeats: trip.seats.filter(s => s.status === 'blocked').length
        });
        
    } catch (error) {
        console.error('❌ Erreur sièges:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// RÉSERVATIONS
// ============================================

app.post('/api/reservations', strictLimiter, [
    body('bookingNumber').notEmpty(),
    body('route').isObject(),
    body('route.id').notEmpty(),
    body('date').isISO8601(),
    body('passengers').isArray({ min: 1 }),
    body('totalPrice').notEmpty(),
    body('status').isIn(['Confirmé', 'En attente de paiement'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const reservationData = req.body;
        
        // ✅ LOG CORRIGÉ (APRÈS la déclaration de reservationData)
        console.log("📥 Type de réservation:", {
            hasReturnRoute: !!reservationData.returnRoute,
            hasReturnSeats: !!reservationData.returnSeats,
            tripType: reservationData.returnRoute ? 'ALLER-RETOUR' : 'ALLER SIMPLE'
        });
        
        const trip = await tripsCollection.findOne({ _id: new ObjectId(reservationData.route.id) });
        if (!trip) {
            return res.status(404).json({ error: 'Voyage aller introuvable.' });
        }

        const seatNumbersToOccupy = reservationData.seats.map(s => parseInt(s));
        
        const alreadyTaken = trip.seats.filter(s => 
            seatNumbersToOccupy.includes(s.number) && s.status !== 'available'
        );

        if (alreadyTaken.length > 0) {
            return res.status(409).json({ 
                error: `Conflit : Sièges aller ${alreadyTaken.map(s => s.number).join(', ')} indisponibles.` 
            });
        }

        await tripsCollection.updateOne(
            { _id: new ObjectId(trip._id) },
            { $set: { "seats.$[elem].status": "occupied" } },
            { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] }
        );
        
        if (reservationData.returnRoute && reservationData.returnSeats && reservationData.returnSeats.length > 0) {
            const returnTrip = await tripsCollection.findOne({ _id: new ObjectId(reservationData.returnRoute.id) });
            if (!returnTrip) {
                return res.status(404).json({ error: 'Voyage retour introuvable.' });
            }
            
            const returnSeatNumbers = reservationData.returnSeats.map(s => parseInt(s));
            
            const returnAlreadyTaken = returnTrip.seats.filter(s => 
                returnSeatNumbers.includes(s.number) && s.status !== 'available'
            );

            if (returnAlreadyTaken.length > 0) {
                await tripsCollection.updateOne(
                    { _id: new ObjectId(trip._id) },
                    { $set: { "seats.$[elem].status": "available" } },
                    { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] }
                );
                
                return res.status(409).json({ error: `Conflit : Sièges retour ${returnAlreadyTaken.map(s => s.number).join(', ')} indisponibles.` });
            }

            await tripsCollection.updateOne(
                { _id: new ObjectId(returnTrip._id) },
                { $set: { "seats.$[elem].status": "occupied" } },
                { arrayFilters: [{ "elem.number": { $in: returnSeatNumbers } }] }
            );
        }
        
        const result = await reservationsCollection.insertOne(reservationData);
        sendConfirmationEmail(reservationData);
        
        res.status(201).json({ 
            success: true, 
            message: 'Réservation créée.',
            reservationId: result.insertedId 
        });

    } catch (error) {
        console.error('❌ Erreur réservation:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// Dans server.js - REMPLACER la route existante

app.patch('/api/admin/reservations/:id/:action', authenticateToken, async (req, res) => {
    const { id, action } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID invalide' });
    }

    try {
        const reservation = await reservationsCollection.findOne({ _id: new ObjectId(id) });
        if (!reservation) {
            return res.status(404).json({ error: 'Réservation introuvable.' });
        }

        if (action === 'confirm-payment') {
    if (reservation.status !== 'En attente de paiement') {
        return res.status(400).json({ error: 'Pas en attente de paiement.' });
    }
    
    // ✅ RÉCUPÉRER LA PREUVE DE TRANSACTION (OBLIGATOIRE)
    const { transactionProof } = req.body;
    
    if (!transactionProof || transactionProof.trim() === '') {
        return res.status(400).json({ 
            error: 'Veuillez saisir une preuve de transaction (ID transaction, référence, capture d\'écran, etc.)' 
        });
    }
    
    // ✅ Mise à jour avec preuve de transaction
    await reservationsCollection.updateOne(
        { _id: reservation._id }, 
        { 
            $set: { 
                status: 'Confirmé', 
                confirmedAt: new Date(),
                paymentDetails: {
                    method: reservation.paymentMethod || 'UNKNOWN',
                    customerPhone: reservation.customerPhone || 'N/A',
                    transactionProof: transactionProof.trim(), // ✅ NOUVEAU
                    confirmedByAdmin: req.user?.username || 'admin',
                    confirmedAt: new Date()
                }
            } 
        }
    );
    
    const updatedReservation = await reservationsCollection.findOne({ _id: reservation._id });
    sendConfirmationEmail(updatedReservation);
    
    console.log(`✅ Paiement confirmé pour ${reservation.bookingNumber} par ${req.user?.username || 'admin'} (Preuve: ${transactionProof})`);
    
    return res.json({ 
        success: true, 
        message: 'Paiement confirmé avec succès !' 
    });
}
        if (action === 'cancel') {
            if (reservation.status === 'Annulé' || reservation.status === 'Expiré') {
                return res.status(400).json({ error: 'Déjà annulée ou expirée.' });
            }
            
            const tripId = reservation.route.id;
            const seatNumbersToFree = reservation.seats.map(s => parseInt(s));

            await tripsCollection.updateOne(
                { _id: new ObjectId(tripId) },
                { $set: { "seats.$[elem].status": "available" } },
                { arrayFilters: [{ "elem.number": { $in: seatNumbersToFree } }] }
            );

            if (reservation.returnRoute && reservation.returnSeats && reservation.returnSeats.length > 0) {
                const returnTripId = reservation.returnRoute.id;
                const returnSeatNumbersToFree = reservation.returnSeats.map(s => parseInt(s));
                
                await tripsCollection.updateOne(
                    { _id: new ObjectId(returnTripId) },
                    { $set: { "seats.$[elem].status": "available" } },
                    { arrayFilters: [{ "elem.number": { $in: returnSeatNumbersToFree } }] }
                );
            }
            
            await reservationsCollection.updateOne(
                { _id: reservation._id }, 
                { $set: { status: 'Annulé', cancelledAt: new Date() } }
            );
            
            return res.json({ success: true, message: 'Réservation annulée.' });
        }

        return res.status(400).json({ error: 'Action invalide.' });

    } catch (error) {
        console.error(`❌ Erreur action ${action}:`, error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

app.patch('/api/admin/reservations/:id/seats', authenticateToken, [
    body('newSeats').isArray({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { id } = req.params;
        const { newSeats } = req.body;

        const reservation = await reservationsCollection.findOne({ _id: new ObjectId(id) });
        if (!reservation) return res.status(404).json({ error: 'Réservation introuvable.' });

        const trip = await tripsCollection.findOne({ _id: new ObjectId(reservation.route.id) });
        if (!trip) return res.status(404).json({ error: 'Voyage introuvable.' });

        const oldSeats = reservation.seats.map(s => parseInt(s));

        const unavailable = trip.seats.filter(s => 
            newSeats.includes(s.number) && 
            s.status !== 'available' && 
            !oldSeats.includes(s.number)
        );
        
        if (unavailable.length > 0) {
            return res.status(409).json({ error: `Sièges ${unavailable.map(s => s.number).join(', ')} déjà pris.` });
        }

        await tripsCollection.updateOne(
            { _id: trip._id },
            { $set: { "seats.$[elem].status": "available" } },
            { arrayFilters: [{ "elem.number": { $in: oldSeats } }] }
        );

        await tripsCollection.updateOne(
            { _id: trip._id },
            { $set: { "seats.$[elem].status": "occupied" } },
            { arrayFilters: [{ "elem.number": { $in: newSeats } }] }
        );

        const passengerUpdates = {};
        reservation.passengers.forEach((passenger, index) => {
            passengerUpdates[`passengers.${index}.seat`] = newSeats[index];
        });
        
        await reservationsCollection.updateOne(
            { _id: reservation._id },
            { $set: { seats: newSeats, ...passengerUpdates } }
        );

        res.json({ success: true, message: 'Sièges modifiés.' });

    } catch (error) {
        console.error('❌ Erreur modification sièges:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});


// ============================================
// 💳 PAIEMENT MTN MOBILE MONEY
// ============================================

const mtnPayment = require('./services/mtnPayment');

// 🔍 ENDPOINT DE DEBUG VERSION
app.get('/api/version', (req, res) => {
    res.json({ 
        version: '2025-01-18-FINAL',
        timestamp: new Date().toISOString(),
        message: 'Si vous voyez ceci, le nouveau code est déployé'
    });
});

// Route de diagnostic
app.get('/api/mtn/config', (req, res) => {
    res.json({
        environment: process.env.MTN_ENVIRONMENT,
        hasPrimaryKey: !!process.env.MTN_COLLECTION_PRIMARY_KEY,
        hasUserId: !!process.env.MTN_COLLECTION_USER_ID,
        hasApiKey: !!process.env.MTN_COLLECTION_API_KEY
    });
});

// Test token
app.get('/api/mtn/test-token', async (req, res) => {
    try {
        const token = await mtnPayment.getAccessToken();
        res.json({ success: true, hasToken: !!token });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Initiation paiement MTN (VERSION COMPLÈTE AVEC LOGS)
app.post('/api/payment/mtn/initiate', strictLimiter, [
    body('phone').notEmpty(),
    body('amount').isNumeric(),
    body('bookingNumber').notEmpty()
], async (req, res) => {
    console.log('\n═══════════════════════════════════════');
    console.log('🔵 NOUVELLE REQUÊTE MTN REÇUE');
    console.log('═══════════════════════════════════════');
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    console.log('═══════════════════════════════════════\n');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('❌ Validation:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { phone, amount, bookingNumber, customerName } = req.body;
        const currency = 'EUR';

        console.log('💳 Paiement MTN:', { phone, amount, currency, bookingNumber });

        const result = await mtnPayment.requestToPay(
            phone, amount, currency, bookingNumber, `Réservation ${bookingNumber}`
        );

        console.log('📤 Résultat MTN:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log(`🔄 UPDATE - Recherche réservation: "${bookingNumber}"`);
            
            const updateResult = await reservationsCollection.updateOne(
                { bookingNumber: bookingNumber },
                { $set: { 
                    paymentTransactionId: result.transactionId,
                    paymentProvider: 'MTN',
                    paymentStatus: 'pending',
                    paymentInitiatedAt: new Date()
                }}
            );

            console.log(`📊 UPDATE RESULT:`, {
                matchedCount: updateResult.matchedCount,
                modifiedCount: updateResult.modifiedCount,
                bookingNumber: bookingNumber,
                transactionId: result.transactionId
            });

            if (updateResult.matchedCount === 0) {
                console.error(`❌ RÉSERVATION NON TROUVÉE: "${bookingNumber}"`);
                
                const recent = await reservationsCollection.find({}).sort({ createdAt: -1 }).limit(3).toArray();
                console.log('📋 3 dernières réservations:', recent.map(r => ({
                    bookingNumber: r.bookingNumber,
                    createdAt: r.createdAt
                })));
            } else {
                console.log(`✅ Réservation mise à jour avec transactionId`);
            }

            res.json({
                success: true,
                message: result.message,
                transactionId: result.transactionId
            });
        } else {
            console.error('❌ MTN Error:', result.error);
            res.status(400).json({ success: false, error: result.error });
        }

    } catch (error) {
        console.error('❌ ERREUR:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
});
// Vérification statut paiement
app.get('/api/payment/mtn/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log(`🔍 Vérif statut: ${transactionId}`);
        
        const result = await mtnPayment.getTransactionStatus(transactionId);

        if (result.success && result.status === 'SUCCESSFUL') {
            const reservation = await reservationsCollection.findOneAndUpdate(
                { paymentTransactionId: transactionId },
                { $set: { 
                    status: 'Confirmé',
                    paymentStatus: 'completed',
                    paymentConfirmedAt: new Date()
                }},
                { returnDocument: 'after' }
            );

            if (reservation.value) {
                sendConfirmationEmail(reservation.value);
            }
        }
        
        res.json({ success: true, status: result.status });
        
    } catch (error) {
        console.error('❌ Erreur statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


// 🧪 SIMULATION SUCCÈS PAIEMENT (SANDBOX UNIQUEMENT)
app.post('/api/payment/mtn/simulate-success/:transactionId', async (req, res) => {
    // Sécurité : uniquement en sandbox
    if (process.env.NODE_ENV === 'production' && process.env.MTN_ENVIRONMENT === 'production') {
        return res.status(403).json({ error: 'Route désactivée en production' });
    }
    
    try {
        const { transactionId } = req.params;
        console.log(`🧪 Simulation succès pour: ${transactionId}`);
        
        const reservation = await reservationsCollection.findOneAndUpdate(
            { paymentTransactionId: transactionId },
            { 
                $set: { 
                    status: 'Confirmé',
                    paymentStatus: 'completed',
                    paymentConfirmedAt: new Date(),
                    paymentDetails: {
                        transactionId: transactionId,
                        provider: 'MTN',
                        status: 'SUCCESSFUL',
                        simulatedSuccess: true
                    }
                } 
            },
            { returnDocument: 'after' }
        );
        
        // ✅ CORRECTION : Vérifier AVANT d'accéder à .value
        if (!reservation || !reservation.value) {
            console.warn(`⚠️ Transaction ${transactionId} non trouvée dans la BDD`);
            return res.status(200).json({  // ✅ 200 au lieu de 404
    success: false,
    error: 'Transaction non trouvée dans la base de données' 
});
        }
        
        console.log(`✅ Réservation ${reservation.value.bookingNumber} confirmée`);
        sendConfirmationEmail(reservation.value);
        
        res.json({ 
            success: true, 
            message: 'Paiement simulé avec succès',
            bookingNumber: reservation.value.bookingNumber
        });
        
    } catch (error) {
        console.error('❌ Erreur simulation:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});
// ============================================
// EMAILS
// ============================================

async function sendEmailWithResend(mailOptions) {
    try {
        const { data, error } = await resend.emails.send(mailOptions);
        if (error) throw error;
        console.log(`✅ Email envoyé à ${mailOptions.to}`);
    } catch (error) {
        console.error(`❌ Erreur email:`, error.message);
    }
}

// Dans server.js - Remplacer la fonction sendConfirmationEmail existante

function sendConfirmationEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;

    // Calculer les détails du voyage
    const departureDate = new Date(reservation.date);
    const isRoundTrip = !!reservation.returnRoute;
    const isPendingPayment = reservation.status === 'En attente de paiement';
    
    // Générer la liste des passagers
    const passengersListHTML = reservation.passengers.map((p, index) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px; font-weight: 600;">${p.name}</td>
            <td style="padding: 12px 8px; text-align: center;">${reservation.seats[index]}</td>
            <td style="padding: 12px 8px; text-align: center;">${p.phone}</td>
        </tr>
    `).join('');

    // Section pour le trajet retour (si applicable)
    let returnTripHTML = '';
    if (isRoundTrip) {
        const returnPassengersList = reservation.passengers.map((p, index) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px 8px; font-weight: 600;">${p.name}</td>
                <td style="padding: 12px 8px; text-align: center;">${reservation.returnSeats[index]}</td>
            </tr>
        `).join('');

        returnTripHTML = `
            <div style="margin-top: 40px; padding-top: 30px; border-top: 3px dashed #e0e0e0;">
                <h2 style="font-size: 22px; color: #1a73e8; margin-bottom: 20px; display: flex; align-items: center;">
                    <span style="background: #1a73e8; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 18px;">🔙</span>
                    Trajet Retour
                </h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 15px;">
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: #202124;">${reservation.returnRoute.from}</div>
                            <div style="font-size: 32px; font-weight: 800; color: #1a73e8; margin-top: 5px;">${reservation.returnRoute.departure}</div>
                            <div style="font-size: 13px; color: #5f6368; margin-top: 5px;">${new Date(reservation.returnDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                        <div style="text-align: center; color: #5f6368;">
                            <div style="font-size: 40px;">→</div>
                            <div style="font-size: 12px; margin-top: 5px;">${reservation.returnRoute.duration || 'N/A'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 24px; font-weight: 700; color: #202124;">${reservation.returnRoute.to}</div>
                            <div style="font-size: 32px; font-weight: 800; color: #ea4335; margin-top: 5px;">${reservation.returnRoute.arrival}</div>
                            <div style="font-size: 13px; color: #5f6368; margin-top: 5px;">Compagnie: ${reservation.returnRoute.company}</div>
                        </div>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: #f1f3f4;">
                            <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px;">Passager</th>
                            <th style="padding: 12px 8px; text-align: center; font-size: 12px; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px;">Siège</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${returnPassengersList}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Bloc de paiement en attente (si applicable)
    let paymentWarningHTML = '';
    if (isPendingPayment && reservation.agency) {
        const deadline = new Date(reservation.paymentDeadline);
        const now = new Date();
        const hoursLeft = Math.floor((deadline - now) / (1000 * 60 * 60));
        const minutesLeft = Math.floor(((deadline - now) % (1000 * 60 * 60)) / (1000 * 60));

        paymentWarningHTML = `
            <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffe7a1 100%); border-left: 6px solid #ff9800; padding: 25px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.2);">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 48px; margin-right: 15px;">⏰</span>
                    <div>
                        <h3 style="margin: 0; font-size: 20px; color: #e65100; font-weight: 800;">PAIEMENT REQUIS À L'AGENCE</h3>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #e65100;">Votre réservation sera automatiquement annulée si le paiement n'est pas effectué avant la date limite.</p>
                    </div>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <div style="font-size: 13px; color: #5f6368; margin-bottom: 5px;">DATE LIMITE DE PAIEMENT</div>
                            <div style="font-size: 24px; font-weight: 800; color: #d32f2f;">
                                ${deadline.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                à ${deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 13px; color: #5f6368; margin-bottom: 5px;">TEMPS RESTANT</div>
                            <div style="font-size: 32px; font-weight: 900; color: #ff6f00; font-family: 'Courier New', monospace;">
                                ${hoursLeft}h ${minutesLeft}min
                            </div>
                        </div>
                    </div>
                    
                    <hr style="border: none; border-top: 2px dashed #ff9800; margin: 20px 0;">
                    
                    <div style="background: #fff; padding: 15px; border-radius: 8px; border: 2px solid #ff9800;">
                        <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #e65100; font-weight: 700;">📍 Agence de paiement</h4>
                        <div style="font-size: 18px; font-weight: 700; color: #202124; margin-bottom: 8px;">${reservation.agency.name}</div>
                        <div style="font-size: 14px; color: #5f6368; line-height: 1.6;">
                            <div style="margin-bottom: 6px;"><strong>Adresse :</strong> ${reservation.agency.address}</div>
                            <div style="margin-bottom: 6px;"><strong>Téléphone :</strong> ${reservation.agency.phone}</div>
                            <div style="margin-bottom: 6px;"><strong>Horaires :</strong> ${reservation.agency.hours}</div>
                        </div>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #1976d2;">
                        <p style="margin: 0; font-size: 13px; color: #0d47a1; line-height: 1.5;">
                            <strong>💡 Important :</strong> Présentez votre numéro de réservation <strong>${reservation.bookingNumber}</strong> et une pièce d'identité à l'agence pour effectuer le paiement.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de réservation - En-Bus</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    
                    <!-- En-tête avec logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10101A 0%, #1a1a2e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 48px; font-weight: 900; color: #73d700; text-shadow: 0 0 30px rgba(115, 215, 0, 0.5); letter-spacing: 2px;">EN-BUS</h1>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #b0bac9; letter-spacing: 1px; text-transform: uppercase;">Votre voyage en toute sérénité</p>
                        </td>
                    </tr>
                    
                    <!-- Corps du message -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Message de bienvenue -->
                            <div style="text-align: center; margin-bottom: 35px;">
                                <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
                                <h2 style="margin: 0; font-size: 28px; color: #202124; font-weight: 700;">
                                    ${isPendingPayment ? 'Réservation enregistrée !' : 'Réservation confirmée !'}
                                </h2>
                                <p style="margin: 10px 0 0 0; font-size: 16px; color: #5f6368;">
                                    Bonjour <strong>${passenger.name}</strong>, votre voyage est ${isPendingPayment ? 'en attente de paiement' : 'confirmé'}.
                                </p>
                            </div>
                            
                            <!-- Numéro de réservation -->
                            <div style="background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 35px; border: 2px dashed #dadce0;">
                                <div style="font-size: 12px; color: #5f6368; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">Numéro de réservation</div>
                                <div style="font-size: 36px; font-weight: 900; color: #73d700; font-family: 'Courier New', monospace; letter-spacing: 3px; text-shadow: 2px 2px 0px rgba(115, 215, 0, 0.1);">${reservation.bookingNumber}</div>
                            </div>
                            
                            ${paymentWarningHTML}
                            
                            <!-- Trajet Aller -->
                            <div style="margin-bottom: 30px;">
                                <h2 style="font-size: 22px; color: #34a853; margin-bottom: 20px; display: flex; align-items: center;">
                                    <span style="background: #34a853; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 18px;">🚌</span>
                                    Trajet Aller
                                </h2>
                                
                                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%); padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #34a853;">
                                    <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 15px;">
                                        <div>
                                            <div style="font-size: 24px; font-weight: 700; color: #202124;">${reservation.route.from}</div>
                                            <div style="font-size: 36px; font-weight: 800; color: #34a853; margin-top: 5px;">${reservation.route.departure}</div>
                                            <div style="font-size: 13px; color: #5f6368; margin-top: 5px;">${departureDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        </div>
                                        <div style="text-align: center; color: #5f6368;">
                                            <div style="font-size: 40px;">→</div>
                                            <div style="font-size: 12px; margin-top: 5px;">${reservation.route.duration || 'N/A'}</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 24px; font-weight: 700; color: #202124;">${reservation.route.to}</div>
                                            <div style="font-size: 36px; font-weight: 800; color: #ea4335; margin-top: 5px;">${reservation.route.arrival}</div>
                                            <div style="font-size: 13px; color: #5f6368; margin-top: 5px;">Compagnie: ${reservation.route.company}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tableau des passagers (Aller) -->
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <thead>
                                        <tr style="background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%);">
                                            <th style="padding: 15px 10px; text-align: left; font-size: 12px; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Passager</th>
                                            <th style="padding: 15px 10px; text-align: center; font-size: 12px; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Siège</th>
                                            <th style="padding: 15px 10px; text-align: center; font-size: 12px; color: #5f6368; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Téléphone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${passengersListHTML}
                                    </tbody>
                                </table>
                            </div>
                            
                            ${returnTripHTML}
                            
                            <!-- Prix total -->
                            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; border: 3px solid #66bb6a;">
                                <div style="font-size: 13px; color: #2e7d32; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Prix Total</div>
                                <div style="font-size: 42px; font-weight: 900; color: #1b5e20;">${reservation.totalPrice}</div>
                            </div>
                            
                            <!-- Informations importantes -->
                            <div style="background: #e3f2fd; border-left: 5px solid #1976d2; padding: 20px; border-radius: 8px; margin: 30px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #0d47a1; display: flex; align-items: center;">
                                    <span style="font-size: 24px; margin-right: 10px;">ℹ️</span>
                                    Informations importantes
                                </h3>
                                <ul style="margin: 0; padding-left: 20px; color: #1565c0; line-height: 1.8;">
                                    <li><strong>Présentez-vous 30 minutes avant le départ</strong> avec une pièce d'identité valide.</li>
                                    <li>Bagages inclus : <strong>1 bagage en soute (20kg)</strong> + <strong>1 bagage à main</strong>.</li>
                                    <li>En cas de modification ou annulation, contactez notre service client.</li>
                                    ${reservation.route.busIdentifier ? `<li>Numéro de bus : <strong>${reservation.route.busIdentifier}</strong></li>` : ''}
                                </ul>
                            </div>
                            
                            <!-- Bouton d'action -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${process.env.FRONTEND_URL || process.env.PRODUCTION_URL || 'https://votre-site.com'}" style="display: inline-block; background: linear-gradient(135deg, #73d700 0%, #5cb300 100%); color: #10101A; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 8px 20px rgba(115, 215, 0, 0.4); transition: all 0.3s;">
                                    📱 Voir ma réservation
                                </a>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Pied de page -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #5f6368;">
                                Cet email a été envoyé automatiquement. Pour toute question, contactez notre service client.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9e9e9e;">
                                &copy; ${new Date().getFullYear()} En-Bus. Tous droits réservés.
                            </p>
                            <div style="margin-top: 20px;">
                                <a href="#" style="color: #5f6368; text-decoration: none; margin: 0 10px; font-size: 12px;">Conditions d'utilisation</a>
                                <span style="color: #dadce0;">|</span>
                                <a href="#" style="color: #5f6368; text-decoration: none; margin: 0 10px; font-size: 12px;">Politique de confidentialité</a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    sendEmailWithResend({
        from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `${isPendingPayment ? '⏰ Réservation en attente' : '✅ Réservation confirmée'} - ${reservation.bookingNumber}`,
        html: htmlContent
    });
}



// Dans server.js - Ajouter cette nouvelle fonction

function sendPaymentExpirationEmail(reservation) {
    const passenger = reservation.passengers[0];
    if (!passenger || !passenger.email) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    
                    <!-- En-tête -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 72px; margin-bottom: 15px;">❌</div>
                            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff;">Réservation Annulée</h1>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #ffcdd2; letter-spacing: 1px;">Délai de paiement dépassé</p>
                        </td>
                    </tr>
                    
                    <!-- Corps -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <p style="font-size: 16px; color: #202124; line-height: 1.6; margin: 0 0 20px 0;">
                                Bonjour <strong>${passenger.name}</strong>,
                            </p>
                            
                            <p style="font-size: 16px; color: #5f6368; line-height: 1.6; margin: 0 0 25px 0;">
                                Nous vous informons que votre réservation <strong>${reservation.bookingNumber}</strong> a été automatiquement annulée car le paiement n'a pas été effectué dans les délais requis.
                            </p>
                            
                            <!-- Détails de la réservation annulée -->
                            <div style="background: #fbe9e7; border-left: 5px solid #d32f2f; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #c62828;">Détails de la réservation annulée</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Numéro de réservation :</td>
                                        <td style="padding: 8px 0; color: #202124; font-weight: 700; text-align: right;">${reservation.bookingNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Trajet :</td>
                                        <td style="padding: 8px 0; color: #202124; font-weight: 700; text-align: right;">${reservation.route.from} → ${reservation.route.to}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Date de départ :</td>
                                        <td style="padding: 8px 0; color: #202124; font-weight: 700; text-align: right;">${new Date(reservation.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Heure de départ :</td>
                                        <td style="padding: 8px 0; color: #202124; font-weight: 700; text-align: right;">${reservation.route.departure}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Sièges :</td>
                                        <td style="padding: 8px 0; color: #202124; font-weight: 700; text-align: right;">${reservation.seats.join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Montant :</td>
                                        <td style="padding: 8px 0; color: #d32f2f; font-weight: 900; text-align: right; font-size: 18px;">${reservation.totalPrice}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #5f6368; font-size: 14px;">Date limite de paiement :</td>
                                        <td style="padding: 8px 0; color: #c62828; font-weight: 700; text-align: right;">${new Date(reservation.paymentDeadline).toLocaleString('fr-FR')}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Information -->
                            <div style="background: #fff3e0; border-left: 5px solid #ff9800; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #e65100; display: flex; align-items: center;">
                                    <span style="font-size: 24px; margin-right: 10px;">💡</span>
                                    Que faire maintenant ?
                                </h3>
                                <p style="margin: 0; color: #5f6368; line-height: 1.6; font-size: 14px;">
                                    Si vous souhaitez toujours voyager avec En-Bus, vous pouvez effectuer une nouvelle réservation sur notre site web ou application mobile. Les sièges que vous aviez réservés sont désormais disponibles pour d'autres voyageurs.
                                </p>
                            </div>
                            
                            <!-- Bouton -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${process.env.FRONTEND_URL || process.env.PRODUCTION_URL || 'https://votre-site.com'}" style="display: inline-block; background: linear-gradient(135deg, #73d700 0%, #5cb300 100%); color: #10101A; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 8px 20px rgba(115, 215, 0, 0.4);">
                                    🎫 Faire une nouvelle réservation
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #9e9e9e; text-align: center; margin-top: 30px;">
                                Pour toute question, contactez notre service client.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Pied de page -->
                    <tr>
                        <td style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0; font-size: 12px; color: #9e9e9e;">
                                &copy; ${new Date().getFullYear()} En-Bus. Tous droits réservés.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    sendEmailWithResend({
        from: `"${process.env.EMAIL_FROM_NAME || 'En-Bus'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: passenger.email,
        subject: `❌ Réservation ${reservation.bookingNumber} annulée - Délai de paiement dépassé`,
        html: htmlContent
    });
}

// ============================================
// CRON JOBS
// ============================================

if (process.env.NODE_ENV === 'production' && process.env.CRON_ENABLED === 'true') {
    cron.schedule('*/5 * * * *', async () => {
        const now = new Date();
        const expiredReservations = await reservationsCollection.find({
            status: 'En attente de paiement',
            paymentDeadline: { $lt: now.toISOString() }
        }).toArray();
        
        console.log(`⏰ CRON: ${expiredReservations.length} réservation(s) expirée(s) trouvée(s)`);
        
        for (const reservation of expiredReservations) {
            // Libérer les sièges aller
            const tripId = reservation.route.id;
            const seatNumbersToFree = reservation.seats.map(s => parseInt(s));
            
            await tripsCollection.updateOne(
                { _id: new ObjectId(tripId) },
                { $set: { "seats.$[elem].status": "available" } },
                { arrayFilters: [{ "elem.number": { $in: seatNumbersToFree } }] }
            );
            
            // Libérer les sièges retour (si applicable)
            if (reservation.returnRoute && reservation.returnSeats && reservation.returnSeats.length > 0) {
                const returnTripId = reservation.returnRoute.id;
                const returnSeatNumbersToFree = reservation.returnSeats.map(s => parseInt(s));
                
                await tripsCollection.updateOne(
                    { _id: new ObjectId(returnTripId) },
                    { $set: { "seats.$[elem].status": "available" } },
                    { arrayFilters: [{ "elem.number": { $in: returnSeatNumbersToFree } }] }
                );
            }
            
            // Mettre à jour le statut
            await reservationsCollection.updateOne(
                { _id: reservation._id },
                { $set: { status: 'Expiré', cancelledAt: now } }
            );
            
            // ✅ ENVOYER L'EMAIL D'ANNULATION
            sendPaymentExpirationEmail(reservation);
            
            console.log(`✅ Réservation ${reservation.bookingNumber} expirée et email envoyé`);
        }
    });
    console.log('✅ Cron jobs activés (vérification toutes les 5 minutes).');
}
// ============================================
// WEBSOCKET
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



// Debug log MTN


app.get('/api/mtn/config', (req, res) => {
    res.json({
        environment: process.env.MTN_ENVIRONMENT,
        hasPrimaryKey: !!process.env.MTN_COLLECTION_PRIMARY_KEY,
        primaryKeyLength: process.env.MTN_COLLECTION_PRIMARY_KEY?.length,
        hasUserId: !!process.env.MTN_COLLECTION_USER_ID,
        userId: process.env.MTN_COLLECTION_USER_ID,
        hasApiKey: !!process.env.MTN_COLLECTION_API_KEY,
        apiKeyLength: process.env.MTN_COLLECTION_API_KEY?.length
    });
});

// Route de test MTN (avant les autres routes)
app.post('/api/payment/mtn/test', async (req, res) => {
    console.log('\n🧪 TEST MTN DIRECT');
    console.log('Body:', req.body);
    
    try {
        const result = await mtnPayment.requestToPay(
            '46733123453', // Numéro de test sandbox
            100,
            'EUR',
            'TEST-' + Date.now(),
            'Test direct'
        );
        
        console.log('Résultat:', result);
        
        if (result.success) {
            // Attendre 3 secondes puis vérifier le statut
            setTimeout(async () => {
                const status = await mtnPayment.getTransactionStatus(result.transactionId);
                console.log('Statut après 3s:', status);
            }, 3000);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: error.message });
    }
});


// Vérifier le statut d'un paiement MTN
// Dans server.js - Remplacer cette fonction

// Dans server.js - Remplacer cette fonction

app.get('/api/payment/mtn/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        console.log(`\n🔍 Vérification du statut pour la transaction MTN: ${transactionId}`);
        
        const result = await mtnPayment.getTransactionStatus(transactionId);

        if (result.success) {
            console.log(`✅ Statut reçu de MTN: ${result.status}`);

            if (result.status === 'SUCCESSFUL') {
                console.log('🎉 PAIEMENT RÉUSSI ! Mise à jour de la réservation...');
                
                const reservationUpdate = await reservationsCollection.findOneAndUpdate(
                    { paymentTransactionId: transactionId },
                    { 
                        $set: { 
                            status: 'Confirmé',
                            paymentStatus: 'completed',
                            paymentConfirmedAt: new Date(),
                            paymentDetails: {
                                transactionId: transactionId,
                                amount: result.amount,
                                currency: result.currency,
                                provider: 'MTN',
                                status: result.status,
                                reason: result.reason || 'Paiement réussi'
                            }
                        } 
                    },
                    { returnDocument: 'after' }
                );

                if (reservationUpdate.value) {
                    console.log(`✅ Réservation ${reservationUpdate.value.bookingNumber} mise à jour en "Confirmé"`);
                    sendConfirmationEmail(reservationUpdate.value);
                } else {
                    console.warn(`⚠️ Impossible de trouver la réservation pour la transaction ${transactionId}`);
                }
            }
            
            res.json({ success: true, status: result.status, message: `Statut actuel : ${result.status}` });
            
        } else {
            console.error(`❌ Erreur lors de la vérification du statut chez MTN: ${result.error}`);
            res.status(400).json({ success: false, error: result.error });
        }

    } catch (error) {
        console.error('❌ Erreur serveur lors de la vérification du statut MTN:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});




// Dans server.js - Ajouter après les autres routes /api/reservations

// ============================================
// 🔍 VÉRIFICATION DU STATUT D'UNE RÉSERVATION
// ============================================

app.get('/api/reservations/check/:bookingNumber', async (req, res) => {
    try {
        const { bookingNumber } = req.params;
        
        console.log(`🔍 Vérification du statut pour : ${bookingNumber}`);
        
        const reservation = await reservationsCollection.findOne({ bookingNumber: bookingNumber });
        
        if (!reservation) {
            return res.status(404).json({ 
                success: false, 
                error: 'Réservation introuvable' 
            });
        }
        
        // Retourner uniquement les infos essentielles
        res.json({
            success: true,
            bookingNumber: reservation.bookingNumber,
            status: reservation.status,
            paymentMethod: reservation.paymentMethod,
            customerPhone: reservation.customerPhone,
            confirmedAt: reservation.confirmedAt || null
        });
        
    } catch (error) {
        console.error('❌ Erreur vérification statut:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});


// Dans server.js - AJOUTER après la route /api/reservations/check/:bookingNumber

// ============================================
// 📦 RÉCUPÉRER UNE RÉSERVATION COMPLÈTE
// ============================================

app.get('/api/reservations/:bookingNumber', async (req, res) => {
    try {
        const { bookingNumber } = req.params;
        
        console.log(`📦 Récupération de la réservation : ${bookingNumber}`);
        
        const reservation = await reservationsCollection.findOne({ bookingNumber: bookingNumber });
        
        if (!reservation) {
            return res.status(404).json({ 
                success: false, 
                error: 'Réservation introuvable' 
            });
        }
        
        // ✅ RETOURNER LA RÉSERVATION COMPLÈTE
        res.json({
            success: true,
            reservation: reservation
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération réservation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
});



// DANS server.js, à la fin de la section des routes de réservation

// ============================================
// ✅ NOUVELLE ROUTE : RÉCUPÉRER LES DÉTAILS DE PLUSIEURS RÉSERVATIONS
// ============================================
app.get('/api/reservations/details', async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) {
            return res.status(400).json({ success: false, error: 'Aucun ID de réservation fourni.' });
        }

        const bookingNumbers = ids.split(',').filter(id => id.trim() !== '');
        console.log(`📦 Récupération des détails pour ${bookingNumbers.length} réservations:`, bookingNumbers);

        const reservations = await reservationsCollection.find({
            bookingNumber: { $in: bookingNumbers }
        }).toArray();
        
        // Trier les résultats pour qu'ils correspondent à l'ordre demandé par le client
        const sortedReservations = bookingNumbers.map(id => 
            reservations.find(res => res.bookingNumber === id)
        ).filter(Boolean); // .filter(Boolean) pour enlever les 'undefined' si une réservation n'est plus en BDD

        res.json({
            success: true,
            reservations: sortedReservations
        });

    } catch (error) {
        console.error('❌ Erreur récupération multi-réservations:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur.' });
    }
});

// ============================================
// DÉMARRAGE
// ============================================

const PORT = process.env.PORT || 3000;

(async () => {
    await connectToDb();
    server.listen(PORT, () => {
        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Backend En-Bus démarré
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port : ${PORT}
🌐 Environnement : ${process.env.NODE_ENV || 'development'}
🛡️ Sécurité : ✅
📧 Email : ✅
⏰ Cron : ${process.env.NODE_ENV === 'production' ? '✅' : '❌'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    });
})();