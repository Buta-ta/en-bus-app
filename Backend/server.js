// ============================================
// 🚀 EN-BUS BACKEND - VERSION FINALE ET COMPLÈTE
// ============================================

require("dotenv").config();

// --- Imports ---
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");
const cron = require("node-cron");
const { Resend } = require("resend");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// --- Services ---
// Assurez-vous que ce chemin est correct
// const mtnPayment = require("./services/mtnPayment");

// ============================================
// ✅ VALIDATION DES VARIABLES D'ENVIRONNEMENT
// ============================================
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD_HASH",
  "RESEND_API_KEY",
  "EMAIL_FROM_ADDRESS",
  "ALLOWED_ORIGINS",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingEnvVars.length > 0) {
  console.error(
    "❌ Variables d'environnement manquantes:",
    missingEnvVars.join(", ")
  );
  process.exit(1);
}
console.log("✅ Variables d'environnement validées.");

// ============================================
// 🔧 CONFIGURATION EXPRESS & SÉCURITÉ
// ============================================
const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((o) =>
  o.trim()
);
console.log("🔒 Origines CORS autorisées:", allowedOrigins);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// ============================================
// 🚦 RATE LIMITING
// ============================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", generalLimiter);





// ============================================
// 🛠️ FONCTIONS UTILITAIRES
// ============================================

function generateBookingNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EB-${timestamp.slice(-6)}${random}`;
}

// ============================================
// 📧 CONFIGURATION SERVICES (Email, DB)
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("✅ Service email prêt.");

const dbClient = new MongoClient(process.env.MONGODB_URI);

// ✅ DÉCLARATION CORRECTE (virgules entre chaque variable, point-virgule à la fin)
let reservationsCollection,
  positionsCollection,
  tripsCollection,
  routeTemplatesCollection,
  systemSettingsCollection;

async function connectToDb() {
  try {
    await dbClient.connect();
    const database = dbClient.db("en-bus-db");
    reservationsCollection = database.collection("reservations");
    positionsCollection = database.collection("positions");
    tripsCollection = database.collection("trips");
    routeTemplatesCollection = database.collection("route_templates");
    systemSettingsCollection = database.collection("system_settings");

    await tripsCollection.createIndex({
      date: 1,
      "route.from": 1,
      "route.to": 1,
    });

    // ✅ INITIALISER LES PARAMÈTRES PAR DÉFAUT SI NON EXISTANTS
    const existingSettings = await systemSettingsCollection.findOne({ key: "reportSettings" });
    if (!existingSettings) {
      await systemSettingsCollection.insertOne({
        key: "reportSettings",
        value: {
          firstReportFree: true,
          secondReportFee: 2000,
          thirdReportFee: 5000,
          maxReportsAllowed: 3,
          minHoursBeforeDeparture: 48,
          maxDaysInFuture: 30
        },
        createdAt: new Date(),
        updatedBy: "system"
      });
      console.log("✅ Paramètres de report initialisés par défaut.");
    }

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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant." });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide." });
    req.user = user;
    next();
  });
}

// ============================================
// === ROUTES PUBLIQUES (CLIENT) ===
// ============================================
app.get("/api/version", (req, res) => {
  res.json({
    version: "2025-01-18-FINAL",
    timestamp: new Date().toISOString(),
  });
});

// DANS server.js, REMPLACEZ la route GET /api/search

app.get("/api/search", async (req, res) => {
    let { from, to, date } = req.query;
    if (!from || !to || !date) return res.status(400).json({ error: "Paramètres manquants" });

    try {
        const trips = await tripsCollection.find({
            "route.from": { $regex: `^${from.trim()}`, $options: "i" },
            "route.to": { $regex: `^${to.trim()}`, $options: "i" },
            date: date
        }).toArray();

        const results = trips.map(trip => {
            const routeData = trip.route || {};
            
            // ✅ CORRECTION : On s'assure d'extraire toutes les propriétés de routeData
            // et de les fusionner correctement.
            return {
                id: trip._id.toString(),
                from: routeData.from,
                to: routeData.to,
                company: routeData.company,
                price: routeData.price,
                duration: routeData.duration || "N/A",
                departure: routeData.departure,
                arrival: routeData.arrival,
                amenities: routeData.amenities || [],
                tripType: routeData.tripType || "direct",
                stops: routeData.stops || [],
                connections: routeData.connections || [],
                breaks: routeData.breaks || 0,
                
                // ✅ VÉRIFICATION CRUCIALE : On s'assure que ces champs sont bien inclus
                departureLocation: routeData.departureLocation || null,
                arrivalLocation: routeData.arrivalLocation || null,
                
                trackerId: trip.busIdentifier || routeData.trackerId || null,
                availableSeats: trip.seats.filter(s => s.status === 'available').length,
                totalSeats: trip.seats.length,
                date: trip.date,
                busIdentifier: trip.busIdentifier,
                baggageOptions: routeData.baggageOptions,
                // ✅ AJOUTER CETTE LIGNE
        highlightBadge: trip.highlightBadge || null
            };
        });
        
        res.json({ success: true, count: results.length, results });

    } catch (error) {
        console.error("❌ Erreur recherche:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
app.get("/api/trips/:id/seats", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID invalide" });
    const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
    if (!trip) return res.status(404).json({ error: "Voyage non trouvé" });
    res.json({
      success: true,
      seats: trip.seats,
      totalSeats: trip.seats.length,
      availableSeats: trip.seats.filter((s) => s.status === "available").length,
      occupiedSeats: trip.seats.filter((s) => s.status === "occupied").length,
      blockedSeats: trip.seats.filter((s) => s.status === "blocked").length,
    });
  } catch (error) {
    console.error("❌ Erreur sièges:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post(
  "/api/reservations",
  strictLimiter,
  [
    body("bookingNumber").notEmpty(),
    body("route").isObject(),
    body("route.id").notEmpty(),
    body("date").isISO8601(),
    body("passengers").isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const reservationData = req.body;
      const trip = await tripsCollection.findOne({
        _id: new ObjectId(reservationData.route.id),
      });
      if (!trip)
        return res.status(404).json({ error: "Voyage aller introuvable." });
      const seatNumbersToOccupy = reservationData.seats.map((s) => parseInt(s));
      const alreadyTaken = trip.seats.filter(
        (s) =>
          seatNumbersToOccupy.includes(s.number) && s.status !== "available"
      );
      if (alreadyTaken.length > 0)
        return res
          .status(409)
          .json({
            error: `Conflit : Sièges aller ${alreadyTaken
              .map((s) => s.number)
              .join(", ")} indisponibles.`,
          });

      await tripsCollection.updateOne(
        { _id: trip._id },
        { $set: { "seats.$[elem].status": "occupied" } },
        { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] }
      );

      if (reservationData.returnRoute) {
        const returnTrip = await tripsCollection.findOne({
          _id: new ObjectId(reservationData.returnRoute.id),
        });
        if (!returnTrip) {
          // Annuler l'occupation des sièges aller en cas d'erreur sur le retour
          await tripsCollection.updateOne(
            { _id: trip._id },
            { $set: { "seats.$[elem].status": "available" } },
            { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] }
          );
          return res.status(404).json({ error: "Voyage retour introuvable." });
        }
        const returnSeatNumbers = reservationData.returnSeats.map((s) =>
          parseInt(s)
        );
        const returnAlreadyTaken = returnTrip.seats.filter(
          (s) =>
            returnSeatNumbers.includes(s.number) && s.status !== "available"
        );
        if (returnAlreadyTaken.length > 0) {
          await tripsCollection.updateOne(
            { _id: trip._id },
            { $set: { "seats.$[elem].status": "available" } },
            { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] }
          );
          return res
            .status(409)
            .json({
              error: `Conflit : Sièges retour ${returnAlreadyTaken
                .map((s) => s.number)
                .join(", ")} indisponibles.`,
            });
        }
        await tripsCollection.updateOne(
          { _id: returnTrip._id },
          { $set: { "seats.$[elem].status": "occupied" } },
          { arrayFilters: [{ "elem.number": { $in: returnSeatNumbers } }] }
        );
      }

      const result = await reservationsCollection.insertOne(reservationData);
      sendConfirmationEmail(reservationData);
      res
        .status(201)
        .json({
          success: true,
          message: "Réservation créée.",
          reservationId: result.insertedId,
        });
    } catch (error) {
      console.error("❌ Erreur réservation:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

// ============================================
// === ROUTES DE RÉSERVATION (ORDRE OPTIMISÉ) ===
// ============================================
app.get("/api/reservations/details", async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids)
      return res
        .status(400)
        .json({ success: false, error: "Aucun ID de réservation fourni." });
    const bookingNumbers = ids.split(",").filter((id) => id.trim() !== "");
    const reservations = await reservationsCollection
      .find({ bookingNumber: { $in: bookingNumbers } })
      .toArray();
    const sortedReservations = bookingNumbers
      .map((id) => reservations.find((res) => res.bookingNumber === id))
      .filter(Boolean);
    res.json({ success: true, reservations: sortedReservations });
  } catch (error) {
    console.error("❌ Erreur récupération multi-réservations:", error);
    res.status(500).json({ success: false, error: "Erreur serveur." });
  }
});

app.get("/api/reservations/check/:bookingNumber", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const reservation = await reservationsCollection.findOne({
      bookingNumber: bookingNumber,
    });
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, error: "Réservation introuvable" });
    res.json({ success: true, status: reservation.status });
  } catch (error) {
    console.error("❌ Erreur vérification statut:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

app.get("/api/reservations/:bookingNumber", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const reservation = await reservationsCollection.findOne({
      bookingNumber: bookingNumber,
    });
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, error: "Réservation introuvable" });
    res.json({ success: true, reservation: reservation });
  } catch (error) {
    console.error("❌ Erreur récupération réservation:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});



// DANS server.js, dans la section des routes de réservation

// ============================================
// ✅ NOUVELLE ROUTE : AJOUTER UN ID DE TRANSACTION
// ============================================
app.patch('/api/reservations/:bookingNumber/transaction-id', strictLimiter, [
    body('transactionId').notEmpty().isString().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { bookingNumber } = req.params;
        const { transactionId } = req.body;

        const result = await reservationsCollection.updateOne(
            { bookingNumber: bookingNumber },
            { 
                $set: { 
                    'paymentDetails.clientTransactionId': transactionId,
                    'paymentDetails.submittedAt': new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Réservation non trouvée.' });
        }

        console.log(`🧾 ID de transaction ${transactionId} soumis pour la réservation ${bookingNumber}.`);
        res.json({ success: true, message: 'ID de transaction enregistré avec succès.' });

    } catch (error) {
        console.error('❌ Erreur enregistrement ID transaction:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});


// ============================================
// 🔄 ROUTES DE REPORT DE VOYAGE (CLIENT)
// ============================================

// 1️⃣ Vérifier si un report est autorisé
app.get("/api/reservations/:bookingNumber/can-report", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    
    const reservation = await reservationsCollection.findOne({ bookingNumber });
    if (!reservation) {
      return res.status(404).json({ error: "Réservation introuvable." });
    }
    
    // Récupérer les paramètres
    const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
    const config = settings?.value || {
      maxReportsAllowed: 3,
      minHoursBeforeDeparture: 48
    };
    
    // Vérifications
    const canReport = {
      allowed: true,
      reasons: []
    };
    
    // Vérif 1 : Statut
    if (reservation.status !== "Confirmé") {
      canReport.allowed = false;
      canReport.reasons.push(`Statut "${reservation.status}" ne permet pas le report.`);
    }
    
    // Vérif 2 : Délai avant départ
    const departureDate = new Date(reservation.date);
    const now = new Date();
    const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilDeparture < config.minHoursBeforeDeparture) {
      canReport.allowed = false;
      canReport.reasons.push(`Report impossible moins de ${config.minHoursBeforeDeparture}h avant le départ.`);
    }
    
    // Vérif 3 : Nombre de reports
    const reportCount = reservation.reportCount || 0;
    if (reportCount >= config.maxReportsAllowed) {
      canReport.allowed = false;
      canReport.reasons.push(`Nombre maximum de reports atteint (${config.maxReportsAllowed}).`);
    }
    
    res.json({
      success: true,
      canReport: canReport.allowed,
      reasons: canReport.reasons,
      currentReportCount: reportCount,
      maxReportsAllowed: config.maxReportsAllowed
    });
    
  } catch (error) {
    console.error("❌ Erreur vérification report:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 2️⃣ Obtenir les voyages disponibles pour le report
app.get("/api/reservations/:bookingNumber/available-trips", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    
    const reservation = await reservationsCollection.findOne({ bookingNumber });
    if (!reservation) {
      return res.status(404).json({ error: "Réservation introuvable." });
    }
    
    // Récupérer les paramètres
    const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
    const config = settings?.value || { maxDaysInFuture: 30 };
    
    // Calculer la plage de dates autorisée
    const currentDate = new Date(reservation.date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2); // Au moins 2 jours dans le futur
    
    const maxDate = new Date(currentDate);
    maxDate.setDate(maxDate.getDate() + config.maxDaysInFuture);
    
    // Rechercher les voyages disponibles (même trajet)
    const availableTrips = await tripsCollection.find({
      "route.from": reservation.route.from,
      "route.to": reservation.route.to,
      date: {
        $gte: minDate.toISOString().split('T')[0],
        $lte: maxDate.toISOString().split('T')[0],
        $ne: reservation.date // Exclure la date actuelle
      }
    }).sort({ date: 1 }).toArray();
    
    // Formater les résultats
    const formattedTrips = availableTrips.map(trip => ({
      id: trip._id.toString(),
      date: trip.date,
      route: {
        from: trip.route.from,
        to: trip.route.to,
        company: trip.route.company,
        price: trip.route.price,
        departure: trip.route.departure,
        arrival: trip.route.arrival
      },
      availableSeats: trip.seats.filter(s => s.status === 'available').length,
      totalSeats: trip.seats.length
    }));
    
    res.json({
      success: true,
      currentTrip: {
        date: reservation.date,
        price: reservation.route.price
      },
      availableTrips: formattedTrips,
      count: formattedTrips.length
    });
    
  } catch (error) {
    console.error("❌ Erreur récupération voyages disponibles:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 3️⃣ Calculer le coût du report
app.post("/api/reservations/:bookingNumber/calculate-report-cost", 
  strictLimiter,
  [body('newTripId').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { bookingNumber } = req.params;
      const { newTripId } = req.body;
      
      // Récupérer la réservation
      const reservation = await reservationsCollection.findOne({ bookingNumber });
      if (!reservation) {
        return res.status(404).json({ error: "Réservation introuvable." });
      }
      
      // Récupérer le nouveau voyage
      if (!ObjectId.isValid(newTripId)) {
        return res.status(400).json({ error: "ID de voyage invalide." });
      }
      
      const newTrip = await tripsCollection.findOne({ _id: new ObjectId(newTripId) });
      if (!newTrip) {
        return res.status(404).json({ error: "Voyage cible introuvable." });
      }
      
      // Récupérer les paramètres
      const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
      const config = settings?.value || {
        firstReportFree: true,
        secondReportFee: 2000,
        thirdReportFee: 5000
      };
      
      // Calculer les frais de report
      const reportCount = reservation.reportCount || 0;
      let reportFee = 0;
      
      if (reportCount === 0 && config.firstReportFree) {
        reportFee = 0;
      } else if (reportCount === 1) {
        reportFee = config.secondReportFee;
      } else {
        reportFee = config.thirdReportFee;
      }
      
      // Calculer la différence de prix
      const currentPrice = reservation.totalPriceNumeric || reservation.route.price * reservation.passengers.length;
      const newPrice = newTrip.route.price * reservation.passengers.length;
      const priceDifference = newPrice - currentPrice;
      
      // Total à payer (ou crédit)
      const totalCost = reportFee + priceDifference;
      
      res.json({
        success: true,
        calculation: {
          reportFee: reportFee,
          currentPrice: currentPrice,
          newPrice: newPrice,
          priceDifference: priceDifference,
          totalCost: totalCost,
          isPaymentRequired: totalCost > 0,
          isCreditGenerated: totalCost < 0,
          creditAmount: totalCost < 0 ? Math.abs(totalCost) : 0
        },
        reportNumber: reportCount + 1
      });
      
    } catch (error) {
      console.error("❌ Erreur calcul coût report:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

// 4️⃣ Confirmer le report
app.post("/api/reservations/:bookingNumber/confirm-report",
  strictLimiter,
  [
    body('newTripId').notEmpty(),
    body('paymentMethod').optional().isString(),
    body('customerPhone').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { bookingNumber } = req.params;
      const { newTripId, paymentMethod, customerPhone } = req.body;
      
      console.log(`🔄 Début du report pour ${bookingNumber} vers voyage ${newTripId}`);
      
      // 1. Récupérer la réservation actuelle
      const reservation = await reservationsCollection.findOne({ bookingNumber });
      if (!reservation) {
        return res.status(404).json({ error: "Réservation introuvable." });
      }
      
      // 2. Récupérer le nouveau voyage
      if (!ObjectId.isValid(newTripId)) {
        return res.status(400).json({ error: "ID de voyage invalide." });
      }
      
      const newTrip = await tripsCollection.findOne({ _id: new ObjectId(newTripId) });
      if (!newTrip) {
        return res.status(404).json({ error: "Voyage cible introuvable." });
      }
      
      // 3. Vérifier la disponibilité des sièges
      const requiredSeats = reservation.passengers.length;
      const availableSeatsCount = newTrip.seats.filter(s => s.status === 'available').length;
      
      if (availableSeatsCount < requiredSeats) {
        return res.status(409).json({ 
          error: `Pas assez de sièges disponibles. Requis: ${requiredSeats}, Disponibles: ${availableSeatsCount}` 
        });
      }
      
      // 4. Récupérer les paramètres et calculer le coût
      const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
      const config = settings?.value || {
        firstReportFree: true,
        secondReportFee: 2000,
        thirdReportFee: 5000
      };
      
      const reportCount = reservation.reportCount || 0;
      let reportFee = 0;
      
      if (reportCount === 0 && config.firstReportFree) {
        reportFee = 0;
      } else if (reportCount === 1) {
        reportFee = config.secondReportFee;
      } else {
        reportFee = config.thirdReportFee;
      }
      
      const currentPrice = reservation.totalPriceNumeric || reservation.route.price * reservation.passengers.length;
      const newPrice = newTrip.route.price * reservation.passengers.length;
      const priceDifference = newPrice - currentPrice;
      const totalCost = reportFee + priceDifference;
      
      // 5. Si paiement requis et pas de méthode fournie
      if (totalCost > 0 && !paymentMethod) {
        return res.status(400).json({ 
          error: "Paiement requis mais méthode non fournie.",
          totalCost: totalCost
        });
      }
      
      // 6. Attribuer automatiquement de nouveaux sièges
      const availableSeats = newTrip.seats
        .filter(s => s.status === 'available')
        .slice(0, requiredSeats)
        .map(s => s.number);
      
      // 7. Libérer les sièges de l'ancien voyage
      const oldTripId = reservation.route.id;
      const oldSeats = reservation.seats.map(s => parseInt(s));
      
      await tripsCollection.updateOne(
        { _id: new ObjectId(oldTripId) },
        { $set: { "seats.$[elem].status": "available" } },
        { arrayFilters: [{ "elem.number": { $in: oldSeats } }] }
      );
      
      console.log(`✅ Sièges libérés sur ancien voyage: ${oldSeats.join(', ')}`);
      
      // 8. Réserver les sièges du nouveau voyage
      await tripsCollection.updateOne(
        { _id: newTrip._id },
        { $set: { "seats.$[elem].status": "occupied" } },
        { arrayFilters: [{ "elem.number": { $in: availableSeats } }] }
      );
      
      console.log(`✅ Sièges réservés sur nouveau voyage: ${availableSeats.join(', ')}`);
      
      // 9. Marquer l'ancienne réservation comme "Reporté"
      await reservationsCollection.updateOne(
        { _id: reservation._id },
        { 
          $set: { 
            status: "Reporté",
            reportedAt: new Date()
          }
        }
      );
      
      // 10. Créer la nouvelle réservation
      const newBookingNumber = generateBookingNumber(); // ⚠️ À implémenter côté serveur
      
      const newReservation = {
        ...reservation,
        _id: new ObjectId(),
        bookingNumber: newBookingNumber,
        route: {
          ...newTrip.route,
          id: newTrip._id.toString()
        },
        date: newTrip.date,
        seats: availableSeats,
        passengers: reservation.passengers.map((p, i) => ({
          ...p,
          seat: availableSeats[i]
        })),
        totalPriceNumeric: newPrice,
        totalPrice: `${newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`,
        status: totalCost > 0 ? "En attente de paiement" : "Confirmé",
        paymentMethod: totalCost > 0 ? paymentMethod?.toUpperCase() : reservation.paymentMethod,
        customerPhone: customerPhone || reservation.customerPhone,
        reportCount: reportCount + 1,
        originalReservation: reservation._id.toString(),
        reportHistory: [
          ...(reservation.reportHistory || []),
          {
            from: {
              date: reservation.date,
              tripId: oldTripId,
              seats: oldSeats
            },
            to: {
              date: newTrip.date,
              tripId: newTrip._id.toString(),
              seats: availableSeats
            },
            reportedAt: new Date(),
            reportFee: reportFee,
            priceDifference: priceDifference,
            totalCost: totalCost,
            initiatedBy: "client"
          }
        ],
        clientCredit: totalCost < 0 ? Math.abs(totalCost) : 0,
        createdAt: new Date(),
        paymentDeadline: totalCost > 0 
          ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min pour payer
          : null
      };
      
      // Supprimer les champs obsolètes
      delete newReservation.reportedAt;
      delete newReservation.replacementReservation;
      
      await reservationsCollection.insertOne(newReservation);
      
      console.log(`✅ Nouvelle réservation créée: ${newBookingNumber}`);
      
      // 11. Lier les deux réservations
      await reservationsCollection.updateOne(
        { _id: reservation._id },
        { $set: { replacementReservation: newReservation._id.toString() } }
      );
      
      // 12. Envoyer l'email de confirmation
      // TODO: sendReportConfirmationEmail(reservation, newReservation);
      
      res.status(201).json({
        success: true,
        message: "Voyage reporté avec succès !",
        oldBookingNumber: bookingNumber,
        newBookingNumber: newBookingNumber,
        newReservation: {
          bookingNumber: newBookingNumber,
          date: newTrip.date,
          seats: availableSeats,
          totalCost: newReservation.totalPrice,
          status: newReservation.status,
          creditGenerated: newReservation.clientCredit
        }
      });
      
    } catch (error) {
      console.error("❌ Erreur confirmation report:", error);
      res.status(500).json({ error: "Erreur serveur lors du report." });
    }
  }
);






// ============================================
// === ROUTES ADMIN (protégées) ===
// ============================================
app.post(
  "/api/admin/login",
  loginLimiter,
  [body("username").notEmpty(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
      console.error(
        "ERREUR CRITIQUE : ADMIN_USERNAME ou ADMIN_PASSWORD_HASH non défini sur le serveur !"
      );
      return res
        .status(500)
        .json({ error: "Erreur de configuration du serveur." });
    }
    const isMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );
    if (username !== process.env.ADMIN_USERNAME || !isMatch) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }
    const token = jwt.sign(
      { username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({ success: true, token });
  }
);

app.get("/api/admin/verify", authenticateToken, (req, res) =>
  res.json({ valid: true, user: req.user })
);

app.get("/api/admin/reservations", authenticateToken, async (req, res) => {
  try {
    const reservations = await reservationsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    // ✅ CORRECTION : Calcul robuste des statistiques
        const stats = {
            total: reservations.length,
            confirmed: reservations.filter(r => r.status === 'Confirmé').length,
            pending: reservations.filter(r => r.status === 'En attente de paiement').length,
            // On compte les deux statuts 'Annulé' et 'Expiré' ensemble
            cancelled: reservations.filter(r => r.status === 'Annulé' || r.status === 'Expiré').length
        };
    res.json({
      success: true,
      count: reservations.length,
      stats,
      reservations,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/admin/route-templates", authenticateToken, async (req, res) => {
  try {
    const templates = await routeTemplatesCollection.find({}).toArray();
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DANS server.js, REMPLACEZ la route POST /api/admin/route-templates

app.post('/api/admin/route-templates', authenticateToken, async (req, res) => {
    try {
        let template = req.body; // Utilisez 'let' pour pouvoir modifier l'objet
        
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

        // ✅ CORRECTION : Calcul systématique et correct de la durée
        try {
            // Vérifier que les heures de départ et d'arrivée sont valides
            if (template.departure && template.arrival && /^\d{2}:\d{2}$/.test(template.departure) && /^\d{2}:\d{2}$/.test(template.arrival)) {
                
                const start = new Date(`1970-01-01T${template.departure}:00Z`); // Utiliser Z pour UTC
                const end = new Date(`1970-01-01T${template.arrival}:00Z`);
                
                // Si l'heure d'arrivée est antérieure à l'heure de départ, on suppose que c'est le jour suivant
                if (end < start) {
                    end.setDate(end.getDate() + 1);
                }

                const diffMs = end - start;
                const hours = Math.floor(diffMs / 3600000);
                const minutes = Math.floor((diffMs % 3600000) / 60000);

                // Sauvegarder la durée dans le template
                template.duration = `${hours}h ${minutes}m`;
                console.log(`✅ Durée calculée : ${template.duration}`);

            } else {
                template.duration = "N/A";
                console.warn("⚠️ Heures de départ/arrivée invalides, durée non calculée.");
            }
        } catch (e) {
            console.error("❌ Erreur lors du calcul de la durée :", e);
            template.duration = "N/A";
        }
        
        // La sauvegarde se fait avec l'objet 'template' mis à jour
        await routeTemplatesCollection.insertOne(template);
        res.status(201).json({ success: true, message: 'Modèle créé avec succès.' });

    } catch (error) {
        console.error('❌ Erreur création modèle:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
app.patch(
  "/api/admin/route-templates/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      let updates = req.body;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "ID de modèle invalide" });
      if (updates.from) updates.from = updates.from.trim();
      if (updates.to) updates.to = updates.to.trim();
      if (updates.company) updates.company = updates.company.trim();
      if (updates.standardBaggageIncluded !== undefined) {
        updates.baggageOptions = {
          standard: {
            included: parseInt(updates.standardBaggageIncluded),
            max: parseInt(updates.standardBaggageMax),
            price: parseInt(updates.standardBaggagePrice),
          },
          oversized: {
            max: parseInt(updates.oversizedBaggageMax),
            price: parseInt(updates.oversizedBaggagePrice),
          },
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
      if (result.modifiedCount === 0)
        return res
          .status(200)
          .json({ success: true, message: "Aucune modification détectée." });
      res.json({ success: true, message: "Modèle mis à jour avec succès." });
    } catch (error) {
      console.error("❌ Erreur mise à jour modèle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

app.delete(
  "/api/admin/route-templates/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID invalide" });
    try {
      const result = await routeTemplatesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Modèle non trouvé" });
      res.json({ success: true, message: "Modèle supprimé." });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

app.get("/api/admin/trips", authenticateToken, async (req, res) => {
  try {
    const trips = await tripsCollection.find({}).sort({ date: -1 }).toArray();
    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DANS server.js (remplacez votre route par celle-ci)

app.post(
  "/api/admin/trips",
  authenticateToken,
  [
    body("routeId").notEmpty(),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("daysOfWeek").isArray({ min: 1 }),
    body("seatCount").isInt({ min: 10, max: 100 }),
    body("busIdentifier").optional().isString().trim().escape(),
    body('highlightBadge').optional().isString().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      // ✅ CORRECTION FINALE : 'highlightBadge' est maintenant extrait de req.body
      const {
        routeId,
        startDate,
        endDate,
        daysOfWeek,
        seatCount,
        busIdentifier,
        highlightBadge 
      } = req.body;

      const routeTemplate = await routeTemplatesCollection.findOne({
        _id: new ObjectId(routeId),
      });
      if (!routeTemplate) {
        return res.status(404).json({ error: "Modèle de trajet non trouvé." });
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
            status: "available",
          }));
          newTrips.push({
            date: currentDate.toISOString().split("T")[0],
            route: routeTemplate,
            seats: seats,
            busIdentifier: busIdentifier || null,
            // La variable 'highlightBadge' existe maintenant et peut être utilisée
            highlightBadge: highlightBadge || null,
            createdAt: new Date(),
          });
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Utiliser setUTCDate pour éviter les problèmes de fuseau horaire
      }

      if (newTrips.length > 0) {
        await tripsCollection.insertMany(newTrips);
      }

      res.status(201).json({
          success: true,
          message: `${newTrips.length} voyage(s) créé(s).`,
      });
    } catch (error) {
      console.error("❌ Erreur création voyages:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);
app.patch(
  "/api/admin/trips/:id",
  authenticateToken,
  [
    body("date").optional().isISO8601(),
    body("seatCount").optional().isInt({ min: 10, max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { id } = req.params;
      const updates = req.body;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "ID de voyage invalide" });
      const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
      if (!trip) return res.status(404).json({ error: "Voyage non trouvé" });
      if (updates.seatCount && updates.seatCount !== trip.seats.length) {
        const currentOccupied = trip.seats.filter(
          (s) => s.status === "occupied"
        ).length;
        if (updates.seatCount < currentOccupied)
          return res
            .status(400)
            .json({
              error: `Impossible : ${currentOccupied.length} sièges déjà occupés`,
            });
        const newSeats = Array.from(
          { length: updates.seatCount },
          (_, i) => trip.seats[i] || { number: i + 1, status: "available" }
        );
        updates.seats = newSeats;
        delete updates.seatCount;
      }
      const result = await tripsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      if (result.modifiedCount === 0)
        return res
          .status(200)
          .json({ success: true, message: "Aucune modification nécessaire." });
      res.json({ success: true, message: "Voyage modifié avec succès" });
    } catch (error) {
      console.error("Erreur modification voyage:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
);

app.delete("/api/admin/trips/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID de voyage invalide" });
    const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
    if (!trip) return res.status(404).json({ error: "Voyage non trouvé" });
    if (trip.seats.some((s) => s.status === "occupied"))
      return res
        .status(400)
        .json({ error: "Impossible de supprimer : des sièges sont réservés" });
    await tripsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: "Voyage supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression voyage:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.patch(
  "/api/admin/trips/:id/reset-seats",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "ID de voyage invalide" });
      const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
      if (!trip) return res.status(404).json({ error: "Voyage non trouvé." });
      const newSeats = Array.from({ length: trip.seats.length }, (_, i) => ({
        number: i + 1,
        status: "available",
      }));
      await tripsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { seats: newSeats, updatedAt: new Date() } }
      );
      res.json({
        success: true,
        message: "Tous les sièges du voyage ont été réinitialisés.",
      });
    } catch (error) {
      console.error("❌ Erreur réinitialisation sièges:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

app.patch(
  "/api/admin/trips/:tripId/seats/:seatNumber",
  authenticateToken,
  [body("status").isIn(["available", "blocked"])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { tripId, seatNumber } = req.params;
      const { status } = req.body;
      if (!ObjectId.isValid(tripId))
        return res.status(400).json({ error: "ID de voyage invalide" });
      const result = await tripsCollection.updateOne(
        { _id: new ObjectId(tripId), "seats.number": parseInt(seatNumber) },
        { $set: { "seats.$.status": status } }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ error: "Voyage ou siège non trouvé." });
      res.json({ success: true, message: `Siège ${seatNumber} mis à jour` });
    } catch (error) {
      console.error("❌ Erreur mise à jour siège:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);


app.patch(
  "/api/admin/reservations/:id/seats",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newSeats } = req.body;

      // ✅ AJOUT DE LOGS DE DEBUG DÉTAILLÉS
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 MODIFICATION SIÈGES - DEBUG");
      console.log("ID reçu:", id);
      console.log("Type de ID:", typeof id);
      console.log("ID valide ?", ObjectId.isValid(id));
      console.log("Body complet reçu:", JSON.stringify(req.body, null, 2));
      console.log("newSeats:", newSeats);
      console.log("Type de newSeats:", typeof newSeats);
      console.log("Est un tableau ?", Array.isArray(newSeats));
      if (Array.isArray(newSeats)) {
        console.log("Longueur:", newSeats.length);
        console.log("Éléments:", newSeats);
        console.log("Types des éléments:", newSeats.map(s => typeof s));
        console.log("Sont des entiers ?", newSeats.map(s => Number.isInteger(s)));
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Validation de l'ID
      if (!ObjectId.isValid(id)) {
        console.error("❌ ID de réservation invalide:", id);
        return res.status(400).json({ error: "ID de réservation invalide." });
      }

      // Validation de newSeats
      if (!Array.isArray(newSeats)) {
        console.error("❌ newSeats n'est pas un tableau:", newSeats);
        return res.status(400).json({ 
          error: "Le champ 'newSeats' doit être un tableau.",
          received: typeof newSeats
        });
      }

      if (newSeats.length === 0) {
        console.error("❌ newSeats est vide");
        return res.status(400).json({ error: "Le tableau 'newSeats' ne peut pas être vide." });
      }

      const invalidSeats = newSeats.filter(s => !Number.isInteger(s));
      if (invalidSeats.length > 0) {
        console.error("❌ newSeats contient des valeurs non-entières:", invalidSeats);
        return res.status(400).json({ 
          error: "Le champ 'newSeats' doit contenir uniquement des entiers.",
          invalidValues: invalidSeats
        });
      }

      console.log("✅ Validation réussie, recherche de la réservation...");

      // Récupération de la réservation
      const reservation = await reservationsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!reservation) {
        console.error("❌ Réservation introuvable pour ID:", id);
        return res.status(404).json({ error: "Réservation introuvable." });
      }

      console.log("✅ Réservation trouvée:", reservation.bookingNumber);
      console.log("Nombre de passagers:", reservation.passengers.length);
      console.log("Nombre de sièges demandés:", newSeats.length);

      // Vérification du nombre de sièges
      if (newSeats.length !== reservation.passengers.length) {
        console.error(`❌ Nombre de sièges incorrect: ${newSeats.length} vs ${reservation.passengers.length} passagers`);
        return res.status(400).json({
          error: `Le nombre de sièges (${newSeats.length}) ne correspond pas au nombre de passagers (${reservation.passengers.length}).`,
        });
      }

      // Vérification de l'ID du voyage
      if (!reservation.route || !reservation.route.id || !ObjectId.isValid(reservation.route.id)) {
        console.error("❌ ID du voyage manquant ou invalide dans la réservation");
        return res.status(400).json({
          error: "Données de réservation corrompues : ID du voyage manquant ou invalide.",
        });
      }

      console.log("ID du voyage:", reservation.route.id);

      // Récupération du voyage
      const trip = await tripsCollection.findOne({
        _id: new ObjectId(reservation.route.id),
      });

      if (!trip) {
        console.error("❌ Voyage introuvable pour ID:", reservation.route.id);
        return res.status(404).json({ error: "Le voyage associé est introuvable." });
      }

      console.log("✅ Voyage trouvé");

      const oldSeats = reservation.seats.map((s) => parseInt(s));
      console.log("Anciens sièges:", oldSeats);
      console.log("Nouveaux sièges:", newSeats);

      // Vérification de la disponibilité
      const unavailable = trip.seats.filter(
        (s) =>
          newSeats.includes(s.number) &&
          s.status !== "available" &&
          !oldSeats.includes(s.number)
      );

      if (unavailable.length > 0) {
        console.error("❌ Sièges indisponibles:", unavailable.map(s => s.number));
        return res.status(409).json({
          error: `Conflit : Le(s) siège(s) ${unavailable.map((s) => s.number).join(", ")} est/sont déjà pris.`,
        });
      }

      console.log("✅ Tous les sièges sont disponibles, libération des anciens...");

      // Libération des anciens sièges
      if (oldSeats.length > 0) {
        await tripsCollection.updateOne(
          { _id: trip._id },
          { $set: { "seats.$[elem].status": "available" } },
          { arrayFilters: [{ "elem.number": { $in: oldSeats } }] }
        );
        console.log("✅ Anciens sièges libérés");
      }

      // Occupation des nouveaux sièges
      await tripsCollection.updateOne(
        { _id: trip._id },
        { $set: { "seats.$[elem].status": "occupied" } },
        { arrayFilters: [{ "elem.number": { $in: newSeats } }] }
      );
      console.log("✅ Nouveaux sièges occupés");

      // Mise à jour de la réservation
      reservation.seats = newSeats;
      reservation.passengers.forEach((passenger, index) => {
        passenger.seat = newSeats[index];
      });
      reservation.updatedAt = new Date();

      await reservationsCollection.replaceOne(
        { _id: new ObjectId(id) },
        reservation
      );

      console.log("✅ Réservation mise à jour avec succès");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      res.json({
        success: true,
        message: "Les sièges ont été modifiés avec succès.",
      });

    } catch (error) {
      console.error("❌ Erreur critique lors de la modification des sièges:", error);
      res.status(500).json({ error: "Erreur serveur inattendue." });
    }
  }
);



app.patch(
  "/api/admin/reservations/:id/:action",
  authenticateToken,
  async (req, res) => {
    const { id, action } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: "ID invalide" });
    try {
      const reservation = await reservationsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!reservation)
        return res.status(404).json({ error: "Réservation introuvable." });
      if (action === "confirm-payment") {
        if (reservation.status !== "En attente de paiement")
          return res.status(400).json({ error: "Pas en attente de paiement." });
        const { transactionProof } = req.body;
        if (!transactionProof || transactionProof.trim() === "")
          return res
            .status(400)
            .json({ error: "Preuve de transaction requise" });
        await reservationsCollection.updateOne(
          { _id: reservation._id },
          {
            $set: {
              status: "Confirmé",
              confirmedAt: new Date(),
              paymentDetails: {
                method: reservation.paymentMethod,
                customerPhone: reservation.customerPhone,
                transactionProof: transactionProof.trim(),
                confirmedByAdmin: req.user.username,
                confirmedAt: new Date(),
              },
            },
          }
        );
        const updatedReservation = await reservationsCollection.findOne({
          _id: reservation._id,
        });
        sendConfirmationEmail(updatedReservation);
        return res.json({ success: true, message: "Paiement confirmé !" });
      }
      if (action === "cancel") {
        if (reservation.status === "Annulé" || reservation.status === "Expiré")
          return res.status(400).json({ error: "Déjà annulée ou expirée." });
        await tripsCollection.updateOne(
          { _id: new ObjectId(reservation.route.id) },
          { $set: { "seats.$[elem].status": "available" } },
          {
            arrayFilters: [
              {
                "elem.number": {
                  $in: reservation.seats.map((s) => parseInt(s)),
                },
              },
            ],
          }
        );
        if (reservation.returnRoute)
          await tripsCollection.updateOne(
            { _id: new ObjectId(reservation.returnRoute.id) },
            { $set: { "seats.$[elem].status": "available" } },
            {
              arrayFilters: [
                {
                  "elem.number": {
                    $in: reservation.returnSeats.map((s) => parseInt(s)),
                  },
                },
              ],
            }
          );
        await reservationsCollection.updateOne(
          { _id: reservation._id },
          { $set: { status: "Annulé", cancelledAt: new Date() } }
        );
        return res.json({ success: true, message: "Réservation annulée." });
      }
      return res.status(400).json({ error: "Action invalide." });
    } catch (error) {
      console.error(`❌ Erreur action ${action}:`, error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);




// ============================================
// ⚙️ ROUTES ADMIN - PARAMÈTRES DE REPORT
// ============================================

// Obtenir les paramètres actuels
app.get("/api/admin/settings/report", authenticateToken, async (req, res) => {
  try {
    const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
    
    if (!settings) {
      return res.status(404).json({ error: "Paramètres introuvables." });
    }
    
    res.json({
      success: true,
      settings: settings.value,
      lastUpdated: settings.updatedAt,
      updatedBy: settings.updatedBy
    });
    
  } catch (error) {
    console.error("❌ Erreur récupération paramètres:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Mettre à jour les frais de report
app.patch("/api/admin/settings/report",
  authenticateToken,
  [
    body('secondReportFee').optional().isInt({ min: 0 }),
    body('thirdReportFee').optional().isInt({ min: 0 }),
    body('maxReportsAllowed').optional().isInt({ min: 1, max: 10 }),
    body('minHoursBeforeDeparture').optional().isInt({ min: 1 }),
    body('maxDaysInFuture').optional().isInt({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const updates = {};
      
      if (req.body.secondReportFee !== undefined) updates['value.secondReportFee'] = req.body.secondReportFee;
      if (req.body.thirdReportFee !== undefined) updates['value.thirdReportFee'] = req.body.thirdReportFee;
      if (req.body.maxReportsAllowed !== undefined) updates['value.maxReportsAllowed'] = req.body.maxReportsAllowed;
      if (req.body.minHoursBeforeDeparture !== undefined) updates['value.minHoursBeforeDeparture'] = req.body.minHoursBeforeDeparture;
      if (req.body.maxDaysInFuture !== undefined) updates['value.maxDaysInFuture'] = req.body.maxDaysInFuture;
      
      updates.updatedAt = new Date();
      updates.updatedBy = req.user.username;
      
      await systemSettingsCollection.updateOne(
        { key: "reportSettings" },
        { $set: updates }
      );
      
      console.log(`✅ Paramètres de report mis à jour par ${req.user.username}`);
      
      res.json({
        success: true,
        message: "Paramètres mis à jour avec succès."
      });
      
    } catch (error) {
      console.error("❌ Erreur mise à jour paramètres:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

// Obtenir l'historique des reports
app.get("/api/admin/reports/history", authenticateToken, async (req, res) => {
  try {
    const reportedReservations = await reservationsCollection.find({
      status: "Reporté"
    }).sort({ reportedAt: -1 }).toArray();
    
    res.json({
      success: true,
      count: reportedReservations.length,
      reports: reportedReservations
    });
    
  } catch (error) {
    console.error("❌ Erreur récupération historique:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});





// ============================================
// --- PAIEMENT MTN, EMAILS, CRON, WEBSOCKET, DÉMARRAGE ---
// ============================================

// Fonctions email (complètes)
async function sendEmailWithResend(mailOptions) {
  try {
    await resend.emails.send(mailOptions);
    console.log(`✅ Email envoyé à ${mailOptions.to}`);
  } catch (error) {
    console.error(`❌ Erreur email:`, error.message);
  }
}
function sendConfirmationEmail(reservation) {
  /* ... (Logique complète) ... */
}
function sendPaymentExpirationEmail(reservation) {
  /* ... (Logique complète) ... */
}

// Tâches Cron
if (
  process.env.NODE_ENV === "production" &&
  process.env.CRON_ENABLED === "true"
) {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const expiredReservations = await reservationsCollection
      .find({
        status: "En attente de paiement",
        paymentDeadline: { $lt: now.toISOString() },
      })
      .toArray();
    if (expiredReservations.length > 0)
      console.log(
        `⏰ CRON: ${expiredReservations.length} réservation(s) expirée(s) trouvée(s)`
      );
    for (const reservation of expiredReservations) {
      await tripsCollection.updateOne(
        { _id: new ObjectId(reservation.route.id) },
        { $set: { "seats.$[elem].status": "available" } },
        {
          arrayFilters: [
            {
              "elem.number": { $in: reservation.seats.map((s) => parseInt(s)) },
            },
          ],
        }
      );
      if (reservation.returnRoute)
        await tripsCollection.updateOne(
          { _id: new ObjectId(reservation.returnRoute.id) },
          { $set: { "seats.$[elem].status": "available" } },
          {
            arrayFilters: [
              {
                "elem.number": {
                  $in: reservation.returnSeats.map((s) => parseInt(s)),
                },
              },
            ],
          }
        );
      await reservationsCollection.updateOne(
        { _id: reservation._id },
        { $set: { status: "Expiré", cancelledAt: now } }
      );
      sendPaymentExpirationEmail(reservation);
    }
  });
  console.log("✅ Cron jobs activés.");
}

// WebSocket
const io = new Server(server, { cors: { origin: allowedOrigins } });
io.on("connection", (socket) => {
  socket.on("subscribeToBus", async (busId) => {
    socket.join(busId);
    const lastPosition = await positionsCollection.findOne({ busId });
    if (lastPosition) socket.emit("updatePosition", lastPosition);
  });
});
app.post("/track/update", async (req, res) => {
  const { tid, lat, lon, tst } = req.body;
  if (!tid || !lat || !lon)
    return res.status(400).json({ error: "Données invalides" });
  const newPosition = { busId: tid, lat, lon, timestamp: new Date(tst * 1000) };
  await positionsCollection.updateOne(
    { busId: tid },
    { $set: newPosition },
    { upsert: true }
  );
  io.to(tid).emit("updatePosition", newPosition);
  res.sendStatus(200);
});

// Démarrage serveur
const PORT = process.env.PORT || 3000;
(async () => {
  await connectToDb();
  server.listen(PORT, () => {
    console.log(
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🚀 Backend En-Bus démarré sur le port ${PORT}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    );
  });
})();
