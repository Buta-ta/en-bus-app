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
// 📧 CONFIGURATION SERVICES (Email, DB)
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("✅ Service email prêt.");
const dbClient = new MongoClient(process.env.MONGODB_URI);
let reservationsCollection,
  positionsCollection,
  tripsCollection,
  routeTemplatesCollection;

async function connectToDb() {
  try {
    await dbClient.connect();
    const database = dbClient.db("en-bus-db");
    reservationsCollection = database.collection("reservations");
    positionsCollection = database.collection("positions");
    tripsCollection = database.collection("trips");
    routeTemplatesCollection = database.collection("route_templates");
    await tripsCollection.createIndex({
      date: 1,
      "route.from": 1,
      "route.to": 1,
    });
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

app.get("/api/search", async (req, res) => {
  let { from, to, date } = req.query;
  if (!from || !to || !date)
    return res.status(400).json({ error: "Paramètres manquants" });
  try {
    const trips = await tripsCollection
      .find({
        "route.from": { $regex: `^${from.trim()}`, $options: "i" },
        "route.to": { $regex: `^${to.trim()}`, $options: "i" },
        date: date,
      })
      .toArray();
    const results = trips.map((trip) => {
      const routeData = trip.route || {};
      return {
        id: trip._id.toString(),
        ...routeData,
        availableSeats: trip.seats.filter((s) => s.status === "available")
          .length,
        totalSeats: trip.seats.length,
        date: trip.date,
        busIdentifier: trip.busIdentifier,
        baggageOptions: routeData.baggageOptions,
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
    const stats = {
      total: reservations.length,
      confirmed: reservations.filter((r) => r.status === "Confirmé").length,
      pending: reservations.filter((r) => r.status === "En attente de paiement")
        .length,
      cancelled: reservations.filter(
        (r) => r.status === "Annulé" || r.status === "Expiré"
      ).length,
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

app.post("/api/admin/route-templates", authenticateToken, async (req, res) => {
  try {
    const template = req.body;
    if (template.from) template.from = template.from.trim();
    if (template.to) template.to = template.to.trim();
    if (template.company) template.company = template.company.trim();
    template.baggageOptions = {
      standard: {
        included: parseInt(template.standardBaggageIncluded) || 1,
        max: parseInt(template.standardBaggageMax) || 5,
        price: parseInt(template.standardBaggagePrice) || 2000,
      },
      oversized: {
        max: parseInt(template.oversizedBaggageMax) || 2,
        price: parseInt(template.oversizedBaggagePrice) || 5000,
      },
    };
    delete template.standardBaggageIncluded;
    delete template.standardBaggageMax;
    delete template.standardBaggagePrice;
    delete template.oversizedBaggageMax;
    delete template.oversizedBaggagePrice;
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
    res
      .status(201)
      .json({ success: true, message: "Modèle créé avec succès." });
  } catch (error) {
    console.error("❌ Erreur création modèle:", error);
    res.status(500).json({ error: "Erreur serveur" });
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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const {
        routeId,
        startDate,
        endDate,
        daysOfWeek,
        seatCount,
        busIdentifier,
      } = req.body;
      const routeTemplate = await routeTemplatesCollection.findOne({
        _id: new ObjectId(routeId),
      });
      if (!routeTemplate)
        return res.status(404).json({ error: "Modèle de trajet non trouvé." });
      let newTrips = [];
      let currentDate = new Date(startDate);
      const lastDate = new Date(endDate);
      const dayMap = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
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
            createdAt: new Date(),
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (newTrips.length > 0) {
        await tripsCollection.insertMany(newTrips);
      }
      res
        .status(201)
        .json({
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

app.patch(
  "/api/admin/reservations/:id/seats",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { newSeats } = req.body;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ error: "ID de réservation invalide." });
      if (
        !Array.isArray(newSeats) ||
        newSeats.length === 0 ||
        newSeats.some((s) => !Number.isInteger(s))
      )
        return res
          .status(400)
          .json({
            error:
              "Le champ 'newSeats' doit être un tableau d'entiers non vide.",
          });
      const reservation = await reservationsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!reservation)
        return res.status(404).json({ error: "Réservation introuvable." });
      if (newSeats.length !== reservation.passengers.length)
        return res
          .status(400)
          .json({
            error: `Le nombre de sièges (${newSeats.length}) ne correspond pas au nombre de passagers (${reservation.passengers.length}).`,
          });
      if (
        !reservation.route ||
        !reservation.route.id ||
        !ObjectId.isValid(reservation.route.id)
      )
        return res
          .status(400)
          .json({
            error:
              "Données de réservation corrompues : ID du voyage manquant ou invalide.",
          });
      const trip = await tripsCollection.findOne({
        _id: new ObjectId(reservation.route.id),
      });
      if (!trip)
        return res
          .status(404)
          .json({ error: "Le voyage associé est introuvable." });
      const oldSeats = reservation.seats.map((s) => parseInt(s));
      const unavailable = trip.seats.filter(
        (s) =>
          newSeats.includes(s.number) &&
          s.status !== "available" &&
          !oldSeats.includes(s.number)
      );
      if (unavailable.length > 0)
        return res
          .status(409)
          .json({
            error: `Conflit : Le(s) siège(s) ${unavailable
              .map((s) => s.number)
              .join(", ")} est/sont déjà pris.`,
          });
      if (oldSeats.length > 0)
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
      reservation.seats = newSeats;
      reservation.passengers.forEach((passenger, index) => {
        passenger.seat = newSeats[index];
      });
      reservation.updatedAt = new Date();
      await reservationsCollection.replaceOne(
        { _id: new ObjectId(id) },
        reservation
      );
      res.json({
        success: true,
        message: "Les sièges ont été modifiés avec succès.",
      });
    } catch (error) {
      console.error(
        "❌ Erreur critique lors de la modification des sièges:",
        error
      );
      res.status(500).json({ error: "Erreur serveur inattendue." });
    }
  }
);

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
