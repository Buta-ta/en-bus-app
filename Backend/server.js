// ============================================
// 🚀 EN-BUS BACKEND - VERSION CORRIGÉE ET STABILISÉE
// ============================================

require("dotenv").config();

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

// ... (Toute la configuration initiale est correcte et reste inchangée)
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
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, // ✅ AJOUTER CE MESSAGE PERSONNALISÉ
    message: {
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },standardHeaders: true,
    legacyHeaders: false });
app.use("/api/", generalLimiter);
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

// --- Recherche de voyages ---
app.get("/api/search", async (req, res) => {
  // ... (Code inchangé, il est correct)
  let { from, to, date } = req.query;
  if (!from || !to || !date)
    return res.status(400).json({ error: "Paramètres manquants" });
  from = from.trim();
  to = to.trim();
  try {
    const trips = await tripsCollection
      .find({
        "route.from": { $regex: `^${from}`, $options: "i" },
        "route.to": { $regex: `^${to}`, $options: "i" },
        date: date,
      })
      .toArray();
    const results = trips.map((trip) => ({
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
      availableSeats: trip.seats.filter((s) => s.status === "available").length,
      totalSeats: trip.seats.length,
      date: trip.date,
      createdAt: trip.createdAt,
      busIdentifier: trip.busIdentifier || null,
      baggageOptions: trip.route.baggageOptions,
    }));
    res.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error("❌ Erreur recherche:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// --- Obtenir les sièges pour un voyage ---
app.get("/api/trips/:id/seats", async (req, res) => {
  // ... (Code inchangé, il est correct)
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

// --- Créer une nouvelle réservation ---
app.post(
  "/api/reservations",
  strictLimiter,
  [
    // ... (Validateurs inchangés, ils sont corrects)
    body("bookingNumber").notEmpty(),
    body("route").isObject(),
    body("route.id").notEmpty(),
    body("date").isISO8601(),
    body("passengers").isArray({ min: 1 }),
    body("totalPrice").notEmpty(),
    body("status").isIn(["Confirmé", "En attente de paiement"]),
  ],
  async (req, res) => {
    // ... (Code inchangé, il est correct)
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
        { _id: new ObjectId(trip._id) },
        { $set: { "seats.$[elem].status": "occupied" } },
        { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] }
      );
      if (
        reservationData.returnRoute &&
        reservationData.returnSeats &&
        reservationData.returnSeats.length > 0
      ) {
        const returnTrip = await tripsCollection.findOne({
          _id: new ObjectId(reservationData.returnRoute.id),
        });
        if (!returnTrip)
          return res.status(404).json({ error: "Voyage retour introuvable." });
        const returnSeatNumbers = reservationData.returnSeats.map((s) =>
          parseInt(s)
        );
        const returnAlreadyTaken = returnTrip.seats.filter(
          (s) =>
            returnSeatNumbers.includes(s.number) && s.status !== "available"
        );
        if (returnAlreadyTaken.length > 0) {
          await tripsCollection.updateOne(
            { _id: new ObjectId(trip._id) },
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
          { _id: new ObjectId(returnTrip._id) },
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
// === ROUTES DE RÉSERVATION (ORDRE CORRIGÉ) ===
// ============================================

// ✅ CORRECTION : Les routes spécifiques sont déclarées AVANT les routes génériques

// --- Obtenir les détails de plusieurs réservations ---
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

// --- Vérifier le statut d'une réservation ---
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
    res.json({
      success: true,
      bookingNumber: reservation.bookingNumber,
      status: reservation.status,
      paymentMethod: reservation.paymentMethod,
      customerPhone: reservation.customerPhone,
      confirmedAt: reservation.confirmedAt || null,
    });
  } catch (error) {
    console.error("❌ Erreur vérification statut:", error);
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

// --- Obtenir les détails complets d'une seule réservation ---
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
  [
    /* ... */
  ],
  async (req, res) => {
    /* ... (inchangé) */
  }
);
app.get("/api/admin/verify", authenticateToken, (req, res) => {
  /* ... (inchangé) */
});
app.get("/api/admin/reservations", authenticateToken, async (req, res) => {
  /* ... (inchangé) */
});

// --- GESTION DES MODÈLES DE TRAJETS ---
app.get("/api/admin/route-templates", authenticateToken, async (req, res) => {
  /* ... (inchangé) */
});
app.post("/api/admin/route-templates", authenticateToken, async (req, res) => {
  /* ... (inchangé) */
});
app.patch(
  "/api/admin/route-templates/:id",
  authenticateToken,
  async (req, res) => {
    /* ... (inchangé) */
  }
);
app.delete(
  "/api/admin/route-templates/:id",
  authenticateToken,
  async (req, res) => {
    /* ... (inchangé) */
  }
);

// --- GESTION DES VOYAGES ---
app.get("/api/admin/trips", authenticateToken, async (req, res) => {
  /* ... (inchangé) */
});
app.post(
  "/api/admin/trips",
  authenticateToken,
  [
    /* ... */
  ],
  async (req, res) => {
    /* ... (inchangé) */
  }
);
app.patch(
  "/api/admin/trips/:id",
  authenticateToken,
  [
    /* ... */
  ],
  async (req, res) => {
    /* ... (inchangé) */
  }
);
app.delete("/api/admin/trips/:id", authenticateToken, async (req, res) => {
  /* ... (inchangé) */
});
app.patch(
  "/api/admin/trips/:id/reset-seats",
  authenticateToken,
  async (req, res) => {
    /* ... (inchangé) */
  }
);
app.patch(
  "/api/admin/trips/:tripId/seats/:seatNumber",
  authenticateToken,
  [
    /* ... */
  ],
  async (req, res) => {
    /* ... (inchangé) */
  }
);

// --- GESTION DES RÉSERVATIONS (Admin) ---

app.patch(
  "/api/admin/reservations/:id/:action",
  authenticateToken,
  async (req, res) => {
    /* ... (inchangé) */
  }
);

// ✅ CORRECTION FINALE : ROUTE DE MODIFICATION DES SIÈGES
app.patch(
  "/api/admin/reservations/:id/seats",
  authenticateToken,
  [
    body("newSeats")
      .isArray({ min: 1 })
      .withMessage("Le champ newSeats doit être un tableau."),
    body("newSeats.*")
      .isInt({ min: 1 })
      .withMessage("Chaque siège doit être un nombre entier positif."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "ID de réservation invalide." });
      }

      const newSeats = req.body.newSeats.map((s) => parseInt(s));

      const reservation = await reservationsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!reservation) {
        return res.status(404).json({ error: "Réservation introuvable." });
      }

      if (newSeats.length !== reservation.passengers.length) {
        return res
          .status(400)
          .json({
            error: `Le nombre de sièges (${newSeats.length}) ne correspond pas au nombre de passagers (${reservation.passengers.length}).`,
          });
      }

      // ✅ CORRECTION : Utiliser ObjectId() pour chercher le voyage
      const tripId = new ObjectId(reservation.route.id);
      const trip = await tripsCollection.findOne({ _id: tripId });
      if (!trip) {
        return res
          .status(404)
          .json({ error: "Le voyage associé est introuvable." });
      }

      const oldSeats = reservation.seats.map((s) => parseInt(s));

      const unavailable = trip.seats.filter(
        (s) =>
          newSeats.includes(s.number) &&
          s.status !== "available" &&
          !oldSeats.includes(s.number)
      );

      if (unavailable.length > 0) {
        return res
          .status(409)
          .json({
            error: `Conflit : Le(s) siège(s) ${unavailable
              .map((s) => s.number)
              .join(", ")} est/sont déjà pris.`,
          });
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
      console.error("❌ Erreur modification sièges:", error);
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la modification des sièges." });
    }
  }
);

// ============================================
// --- PAIEMENT MTN, EMAILS, CRON, WEBSOCKET ---
// ============================================
// ... (Toutes ces sections sont correctes et restent inchangées) ...
const mtnPayment = require("./services/mtnPayment");
app.get("/api/version", (req, res) => {
  /* ... */
});
app.get("/api/mtn/config", (req, res) => {
  /* ... */
});
app.get("/api/mtn/test-token", async (req, res) => {
  /* ... */
});
app.post(
  "/api/payment/mtn/initiate",
  strictLimiter,
  [
    /* ... */
  ],
  async (req, res) => {
    /* ... */
  }
);
app.get("/api/payment/mtn/status/:transactionId", async (req, res) => {
  /* ... */
});
app.post(
  "/api/payment/mtn/simulate-success/:transactionId",
  async (req, res) => {
    /* ... */
  }
);
async function sendEmailWithResend(mailOptions) {
  /* ... */
}
function sendConfirmationEmail(reservation) {
  /* ... */
}
function sendPaymentExpirationEmail(reservation) {
  /* ... */
}
if (
  process.env.NODE_ENV === "production" &&
  process.env.CRON_ENABLED === "true"
) {
  cron.schedule("*/5 * * * *", async () => {
    /* ... */
  });
}
const io = new Server(server, { cors: { origin: allowedOrigins } });
io.on("connection", (socket) => {
  /* ... */
});
app.post("/track/update", async (req, res) => {
  /* ... */
});

// ============================================
// DÉMARRAGE
// ============================================
const PORT = process.env.PORT || 3000;
(async () => {
  await connectToDb();
  server.listen(PORT, () => {
    console.log(
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🚀 Backend En-Bus démarré\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📡 Port : ${PORT}\n🌐 Environnement : ${
        process.env.NODE_ENV || "development"
      }\n🛡️ Sécurité : ✅\n📧 Email : ✅\n⏰ Cron : ${
        process.env.NODE_ENV === "production" ? "✅" : "❌"
      }\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    );
  });
})();
