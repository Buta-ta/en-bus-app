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

// ✅ AJOUTEZ CES LIGNES ICI
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');
// ✅ Version corrigée
const { fr, enUS } = require('date-fns/locale');



// ✅ IMPORTER LE NOUVEAU FICHIER
const translations = require("./emailTranslations.js");


// --- Validation des variables d'environnement ---
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

// --- Configuration Express & Sécurité ---
const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((o) =>
  o.trim()
);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// --- Rate Limiting ---
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
  message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
});
app.use("/api/", generalLimiter);


// ============================================
// ✅ ROUTE DE TEST (À PLACER ICI TEMPORAIREMENT)
// ============================================
app.get("/api/admin/test-destinations", authenticateToken, async (req, res) => {
    try {
        console.log("--- ✅ LA ROUTE DE TEST EST ATTEINTE ---");
        const destinations = await destinationsCollection.find({}).sort({ name: 1 }).toArray();
        res.json({ success: true, from_test_route: true, destinations });
    } catch (error) {
        console.error("❌ Erreur dans la route de test:", error);
        res.status(500).json({ error: "Erreur serveur dans la route de test" });
    }
});


// --- Configuration Services (Email, DB) ---
const resend = new Resend(process.env.RESEND_API_KEY);
const dbClient = new MongoClient(process.env.MONGODB_URI);
let reservationsCollection,
  positionsCollection,
  tripsCollection,
  routeTemplatesCollection,
  systemSettingsCollection,
  destinationsCollection;

async function connectToDb() {
  try {
    await dbClient.connect();
    const database = dbClient.db("en-bus-db");
    
    // Initialisation de toutes les collections
    reservationsCollection = database.collection("reservations");
    positionsCollection = database.collection("positions");
    tripsCollection = database.collection("trips");
    routeTemplatesCollection = database.collection("route_templates");
    systemSettingsCollection = database.collection("system_settings");
    destinationsCollection = database.collection("destinations"); // Votre ajout est correct

    // Création des index
    await tripsCollection.createIndex({ date: 1, "route.from": 1, "route.to": 1 });
    await destinationsCollection.createIndex({ name: 1 });
    
    // Initialisation des paramètres (votre code est correct)
    const existingSettings = await systemSettingsCollection.findOne({ key: "reportSettings" });
    if (!existingSettings) {
      await systemSettingsCollection.insertOne({
        key: "reportSettings",
        value: { /*...*/ },
        createdAt: new Date(),
        updatedBy: "system"
      });
      console.log("✅ Paramètres de report initialisés.");
    }

    // ====================================================
    // ✅ BLOC MANQUANT : PEUPLEMENT INITIAL DES VILLES
    // ====================================================
    const destinationsCount = await destinationsCollection.countDocuments();
    if (destinationsCount === 0) {
        console.log("🏙️  La collection 'destinations' est vide. Remplissage avec les données initiales...");
        const initialCities = [
            { name: "Brazzaville", country: "Congo", coords: [-4.2634, 15.2429], isActive: true, createdAt: new Date() },
            { name: "Pointe-Noire", country: "Congo", coords: [-4.7761, 11.8636], isActive: true, createdAt: new Date() },
            { name: "Dolisie", country: "Congo", coords: [-4.2064, 12.6686], isActive: true, createdAt: new Date() },
            { name: "Yaoundé", country: "Cameroun", coords: [3.8480, 11.5021], isActive: true, createdAt: new Date() },
            { name: "Douala", country: "Cameroun", coords: [4.0511, 9.7679], isActive: true, createdAt: new Date() },
            { name: "Libreville", country: "Gabon", coords: [0.4162, 9.4673], isActive: true, createdAt: new Date() },
            { name: "Lagos", country: "Nigeria", coords: [6.5244, 3.3792], isActive: true, createdAt: new Date() },
            { name: "Abidjan", country: "Côte d'Ivoire", coords: [5.3599, -4.0083], isActive: true, createdAt: new Date() }
        ];
        await destinationsCollection.insertMany(initialCities);
        console.log(`✅ ${initialCities.length} destinations initiales ajoutées à la base de données.`);
    }
    // ====================================================

    console.log("✅ Connecté à MongoDB.");

  } catch (error) {
    console.error("❌ Erreur connexion DB:", error.message);
    process.exit(1);
  }
}

// ============================================
// 📧 GESTION DES EMAILS (RESEND)
// ============================================
const emailTemplate = (content, headerTitle, lang = 'fr') => {
    // 1. On récupère le bon bloc de traductions
    const translation = translations[lang] || translations.fr;
    
    // 2. On retourne le même HTML, mais avec les textes remplacés par les clés de traduction
    return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Inter', Arial, sans-serif; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: #0a0e27; padding: 30px; text-align: center; }
        .logo { font-family: 'Audiowide', sans-serif; font-size: 32px; color: #73d700; margin: 0; text-decoration: none; }
        .content { padding: 30px; color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #73d700; color: #ffffff !important; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; margin-top: 20px; }
        .footer { background-color: #0a0e27; color: #a2a7c0; padding: 20px; text-align: center; font-size: 12px; }
        .footer a { color: #73d700; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="#" class="logo">En-Bus</a>
            <h2 style="color: white; margin-top: 10px;">${headerTitle}</h2>
        </div>
        <div class="content">
            ${content}
            <p style="margin-top: 30px;">${translation.email_thanks}<br>${translation.email_team}</p>
        </div>
        <div class="footer">
            <p>${translation.footer_copyright}</p>
            <p><a href="#">${translation.nav_contact}</a> | <a href="#">${translation.nav_my_bookings}</a></p>
        </div>
    </div>
</body>
</html>
`;
};

async function sendEmail(to, subject, htmlContent, headerTitle, lang = 'fr') {
    // Sécurité : ne pas planter si la clé API est manquante
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ Clé API Resend non configurée. Envoi d'email SIMULÉ.");
        console.log(`   - À: ${to}, Sujet: ${subject}`);
        return { success: true, message: "Simulation d'envoi." };
    }

    // Sécurité : vérifier que l'expéditeur est configuré
    if (!process.env.EMAIL_FROM_ADDRESS) {
        console.error("❌ La variable d'environnement EMAIL_FROM_ADDRESS est manquante.");
        return { success: false, error: "Configuration de l'expéditeur manquante." };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM_ADDRESS,
            to: [to],
            subject: subject,
            // ✅ On passe tous les arguments nécessaires au template
            html: emailTemplate(htmlContent, headerTitle, lang),
            headers: {
                'X-Entity-Ref-ID': 'ENBUS-TRANSACTIONAL',
            },
        });

        if (error) {
            console.error(`❌ Erreur Resend lors de l'envoi à ${to}:`, error.message);
            return { success: false, error: error.message };
        }

        console.log(`✅ Email envoyé avec succès à ${to}. ID: ${data.id}`);
        return { success: true, messageId: data.id };

    } catch (e) {
        console.error("❌ Erreur critique dans la fonction sendEmail:", e.message);
        return { success: false, error: e.message };
    }
}
function sendPendingPaymentEmail(reservation) {
    const client = reservation.passengers?.[0];
    if (!client?.email) {
        console.log(`(Email non envoyé à ${client?.name}, adresse manquante)`);
        return;
    }

    const lang = reservation.lang || 'fr'; 
    const translation = translations[lang] || translations.fr;
    const locale = lang === 'en' ? enUS : fr; // Choisir la locale pour date-fns
    const timeZone = 'Africa/Brazzaville'; // Fuseau horaire de référence

    const subject = translation.email_pending_subject(reservation.bookingNumber);
    const headerTitle = translation.email_pending_title;
    
    // ===============================================
    // ✅ CORRECTION DU FUSEAU HORAIRE
    // ===============================================
    // 1. On prend la date UTC stockée en base de données
    const deadlineUTC = new Date(reservation.paymentDeadline);
    
    // 2. On la convertit dans le fuseau horaire de l'Afrique Centrale
    const zonedDeadline = utcToZonedTime(deadlineUTC, timeZone);
    
    // 3. On formate cette date pour l'affichage, en spécifiant la langue
    // ✅ Version corrigée
    const deadline = format(zonedDeadline, "PPPP p", { locale: locale });
    // 'PPPP' donne "mercredi 26 novembre 2025"
    // ===============================================
    
    let paymentInstructions = '';
    if (reservation.paymentMethod === 'AGENCY') {
        paymentInstructions = `
            <h3>${translation.email_pending_agency_cta}</h3>
            <div class="code-box">
                <h4 class="code-box-title">${translation.email_pending_agency_code_label}</h4>
                <p class="code-box-code">${reservation.agencyPaymentCode}</p>
            </div>
        `;
    } else {
        paymentInstructions = `
            <h3>${translation.email_pending_mm_cta(reservation.totalPrice, reservation.bookingNumber)}</h3>
        `;
    }

    const htmlContent = `
           

        <h2>${translation.email_greeting(client.name)}</h2>
        <p>${translation.email_pending_intro(reservation.route.from, reservation.route.to)}</p>
        ${paymentInstructions}
        <p style="color: #c62828; font-weight: bold;">${translation.email_pending_deadline_warning(deadline)}</p>
    `;

    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}
function sendPaymentConfirmedEmail(reservation) {
    const client = reservation.passengers?.[0];
    if (!client?.email) {
        console.log(`(Email de confirmation non envoyé, adresse manquante)`);
        return;
    }

    const lang = reservation.lang || 'fr';
    const translation = translations[lang] || translations.fr;
    const locale = lang === 'en' ? enUS : fr;

    const subject = translation.email_confirmed_subject(reservation.bookingNumber);
    const headerTitle = translation.email_confirmed_title;
    
    // --- Correction de la date et de l'heure ---
    const timeZone = 'Africa/Brazzaville';
    const departureDateTimeUTC = new Date(`${reservation.date}T${reservation.route.departure}:00`);
    const zonedDeparture = utcToZonedTime(departureDateTimeUTC, timeZone);
    const formattedDateTime = format(zonedDeparture, "PPPP 'à' p", { locale: locale }); // Utilise 'at' en anglais

    const htmlContent = `
        <h2>${translation.email_greeting(client.name)}</h2>
        <p>${translation.email_confirmed_intro}</p>
        <div class="info-box">
            <strong>${translation.email_confirmed_details_trip}</strong>
            <span>${reservation.route.from} → ${reservation.route.to}</span>
        </div>
        <div class="info-box">
            <strong>${translation.email_confirmed_details_date}</strong>
            <span>${formattedDateTime}</span>
        </div>
        <p>${translation.email_confirmed_cta}</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">${translation.email_confirmed_button}</a>
        </div>
        <p>${translation.email_confirmed_outro}</p>
    `;

    // ✅ On passe bien la langue à la fonction d'envoi principale
    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}
function sendReportConfirmedEmail(oldReservation, newReservation) {
    const client = newReservation.passengers?.[0];
    if (!client?.email) {
        console.log(`(Email de report non envoyé, adresse manquante)`);
        return;
    }

    const lang = newReservation.lang || 'fr';
    const translation = translations[lang] || translations.fr;
    const locale = lang === 'en' ? enUS : fr;
    const timeZone = 'Africa/Brazzaville';

    const subject = translation.email_report_subject(newReservation.bookingNumber);
    const headerTitle = translation.email_report_title;
    
    const oldDate = new Date(oldReservation.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR');
    
    // --- Correction de la date et de l'heure ---
    const newDepartureDateTimeUTC = new Date(`${newReservation.date}T${newReservation.route.departure}:00`);
    const newZonedDeparture = utcToZonedTime(newDepartureDateTimeUTC, timeZone);
    const newFormattedDateTime = format(newZonedDeparture, "PPPP 'à' p", { locale: locale });


    const htmlContent = `
        <h2>${translation.email_greeting(client.name)}</h2>
        <p>${translation.email_report_intro}</p>
        
        <div class="info-box" style="background-color: #ffebee; border-left-color: #e57373;">
            <strong style="color: #c62828;">${translation.email_report_old_trip_label}</strong>
            ${translation.email_report_old_trip_date(oldDate)} - Billet ${oldReservation.bookingNumber} <em>${translation.email_report_old_trip_invalid}</em>
        </div>

        <div class="booking-number">
            <div class="booking-label">${translation.email_report_new_trip_label}</div>
            <div class="booking-value">${newReservation.bookingNumber}</div>
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">${translation.email_confirmed_details_trip}</span>
                <span class="detail-value">${newReservation.route.from} → ${newReservation.route.to}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">${translation.email_confirmed_details_date}</span>
                <span class="detail-value">${newFormattedDateTime}</span>
            </div>
        </div>
        
        <p>${translation.email_report_outro}</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">${translation.email_confirmed_button}</a>
        </div>
    `;

    // ✅ On passe bien la langue à la fonction d'envoi principale
    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}
// --- Middleware & Utilitaires ---
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateBookingNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `EB-${timestamp.slice(-6)}${random}`;
}


// ============================================
// === ROUTES API (Réorganisées pour la priorité)
// ============================================

// ============================================
// === ROUTES PUBLIQUES (CLIENT) ===
// ============================================

// Route get only

app.get("/api/version", (req, res) =>
  res.json({ version: "2025-01-18-FINAL" })
);



app.get("/api/destinations", async (req, res) => {
    try {
        // On ne renvoie que les villes actives
        const destinations = await destinationsCollection.find({ isActive: true }).sort({ name: 1 }).toArray();
        res.json({ success: true, destinations });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// DANS server.js, avec les autres routes publiques

app.get("/api/popular-destinations", async (req, res) => {
    try {
        // On récupère jusqu'à 4 modèles marqués comme populaires
        const popular = await routeTemplatesCollection.find({ isPopular: true }).limit(4).toArray();
        res.json({ success: true, destinations: popular });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// DANS server.js

app.get("/api/route-templates", async (req, res) => {
    try {
        // On ne renvoie que les modèles qui ont au moins une ville de départ et d'arrivée
        const templates = await routeTemplatesCollection.find({ 
            from: { $exists: true, $ne: "" },
            to: { $exists: true, $ne: "" }
        }).toArray();
        res.json({ success: true, templates: templates });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
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
      departureLocation: trip.route.departureLocation || null,
      arrivalLocation: trip.route.arrivalLocation || null,
      trackerId: trip.busIdentifier || trip.route.trackerId || null,
      availableSeats: trip.seats.filter((s) => s.status === "available").length,
      totalSeats: trip.seats.length,
      date: trip.date,
      busIdentifier: trip.busIdentifier,
      baggageOptions: trip.route.baggageOptions,
      highlightBadge: trip.highlightBadge || null,
    }));
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
    res.json({ success: true, seats: trip.seats });
  } catch (error) {
    console.error("❌ Erreur sièges:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



app.get("/api/reservations/check/:bookingNumber", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const reservation = await reservationsCollection.findOne({ bookingNumber });
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, error: "Réservation introuvable" });
    res.json({ success: true, status: reservation.status });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

app.get("/api/reservations/details", async (req, res) => {
    try {
        const knownBookingNumbers = req.query.ids?.split(',').filter(id => id.trim());
        if (!knownBookingNumbers || knownBookingNumbers.length === 0) {
            return res.json({ success: true, reservations: [] });
        }

        // --- PHASE 1 : Trouver toute la chaîne de réservations (originales + remplacements) ---
        
        let allRelevantBookingNumbers = new Set(knownBookingNumbers);
        let numbersToSearch = [...knownBookingNumbers];
        
        // Boucle pour trouver tous les billets liés, au cas où il y aurait plusieurs reports successifs
        while (numbersToSearch.length > 0) {
            const foundReservations = await reservationsCollection
                .find({ bookingNumber: { $in: numbersToSearch } })
                .project({ replacementBookingNumber: 1 }) // On ne prend que le champ qui nous intéresse
                .toArray();
                
            const newReplacements = foundReservations
                .map(r => r.replacementBookingNumber)
                .filter(Boolean) // On enlève les undefined/null
                .filter(num => !allRelevantBookingNumbers.has(num)); // On ne garde que les nouveaux
            
            if (newReplacements.length === 0) {
                break; // Plus rien à trouver, on sort de la boucle
            }
            
            newReplacements.forEach(num => allRelevantBookingNumbers.add(num));
            numbersToSearch = newReplacements;
        }

        // --- PHASE 2 : Récupérer les détails complets de tous les billets pertinents AVEC leur statut live ---
        
        const finalReservations = await reservationsCollection.aggregate([
            { $match: { bookingNumber: { $in: Array.from(allRelevantBookingNumbers) } } },
            { $addFields: { tripObjectId: { $toObjectId: "$route.id" } } },
            {
                $lookup: {
                    from: "trips",
                    localField: "tripObjectId",
                    foreignField: "_id",
                    as: "tripDetails"
                }
            },
            { $unwind: { path: "$tripDetails", preserveNullAndEmptyArrays: true } },
            { $addFields: { liveStatus: "$tripDetails.liveStatus" } },
            { $project: { tripDetails: 0, tripObjectId: 0 } }
        ]).toArray();

        res.json({ success: true, reservations: finalReservations });

    } catch (error) {
        console.error("❌ Erreur récupération multi-réservations:", error);
        res.status(500).json({ success: false, error: "Erreur serveur." });
    }
});




app.get("/api/reservations/:bookingNumber", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const reservation = await reservationsCollection.findOne({ bookingNumber });
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, error: "Réservation introuvable" });
    res.json({ success: true, reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});






// Route Post only


app.post(
  "/api/reservations",
  loginLimiter, // Utilise un rate limiter plus strict pour la création
  [
    body("bookingNumber").notEmpty(),
    body("route").isObject(),
    body("route.id").notEmpty(),
    body("date").isISO8601(),
    body("passengers").isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const reservationData = req.body;
      
      // --- Vérification et réservation du trajet ALLER ---
      if (!reservationData.route || !reservationData.route.id) {
          return res.status(400).json({ error: "Données de route aller invalides." });
      }
      const trip = await tripsCollection.findOne({ _id: new ObjectId(reservationData.route.id) });
      if (!trip) return res.status(404).json({ error: "Voyage aller introuvable." });
        
      const seatNumbersToOccupy = reservationData.seats.map(s => parseInt(s));
      const alreadyTaken = trip.seats.filter(s => seatNumbersToOccupy.includes(s.number) && s.status !== "available");
      if (alreadyTaken.length > 0) return res.status(409).json({ error: `Conflit : Sièges aller ${alreadyTaken.map(s => s.number).join(", ")} indisponibles.` });

      await tripsCollection.updateOne({ _id: trip._id }, { $set: { "seats.$[elem].status": "occupied" } }, { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] });
      
      // --- Vérification et réservation du trajet RETOUR (si applicable) ---
      if (reservationData.returnRoute) {
          if (!reservationData.returnRoute.id) return res.status(400).json({ error: "Données de route retour invalides." });
          const returnTrip = await tripsCollection.findOne({ _id: new ObjectId(reservationData.returnRoute.id) });
          if (!returnTrip) {
              // Annuler l'occupation des sièges aller en cas d'erreur
              await tripsCollection.updateOne({ _id: trip._id }, { $set: { "seats.$[elem].status": "available" } }, { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] });
              return res.status(404).json({ error: "Voyage retour introuvable." });
          }
          const returnSeatNumbers = reservationData.returnSeats.map(s => parseInt(s));
          const returnAlreadyTaken = returnTrip.seats.filter(s => returnSeatNumbers.includes(s.number) && s.status !== "available");
          if (returnAlreadyTaken.length > 0) {
              await tripsCollection.updateOne({ _id: trip._id }, { $set: { "seats.$[elem].status": "available" } }, { arrayFilters: [{ "elem.number": { $in: seatNumbersToOccupy } }] });
              return res.status(409).json({ error: `Conflit : Sièges retour ${returnAlreadyTaken.map(s => s.number).join(", ")} indisponibles.` });
          }
          await tripsCollection.updateOne({ _id: returnTrip._id }, { $set: { "seats.$[elem].status": "occupied" } }, { arrayFilters: [{ "elem.number": { $in: returnSeatNumbers } }] });
      }

      // --- Génération du code agence ---
      if (reservationData.paymentMethod === "AGENCY") {
        reservationData.agencyPaymentCode = `AG-${Math.floor(10000 + Math.random() * 90000)}`;
        console.log(`📠 Code agence généré: ${reservationData.agencyPaymentCode}`);
      }

      // --- Insertion en base de données et envoi de l'email ---
      const result = await reservationsCollection.insertOne(reservationData);
      if (reservationData.status === "En attente de paiement") {
        sendPendingPaymentEmail(reservationData);
      }

      // --- Réponse au client ---
      res.status(201).json({
          success: true,
          message: "Réservation créée.",
          reservationId: result.insertedId,
          agencyPaymentCode: reservationData.agencyPaymentCode || null
      });

    } catch (error) {
      console.error("❌ Erreur réservation:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);



app.patch(
  "/api/reservations/:bookingNumber/transaction-id",
  strictLimiter,
  [body("transactionId").notEmpty().isString().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { bookingNumber } = req.params;
      const { transactionId } = req.body;
      const result = await reservationsCollection.updateOne(
        { bookingNumber },
        {
          $set: {
            "paymentDetails.clientTransactionId": transactionId,
            "paymentDetails.submittedAt": new Date(),
          },
        }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ error: "Réservation non trouvée." });
      res.json({ success: true, message: "ID de transaction enregistré." });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);





// ============================================
// 🔄 ROUTES DE REPORT DE VOYAGE (CLIENT)
// ============================================
app.get("/api/reservations/:bookingNumber/can-report", async (req, res) => {
  try {
    const { bookingNumber } = req.params;
    const reservation = await reservationsCollection.findOne({ bookingNumber });
    if (!reservation)
      return res.status(404).json({ error: "Réservation introuvable." });
    const settings = await systemSettingsCollection.findOne({
      key: "reportSettings",
    });
    const config = settings?.value || {
      maxReportsAllowed: 3,
      minHoursBeforeDeparture: 48,
    };
    const canReport = { allowed: true, reasons: [] };
    if (reservation.status !== "Confirmé") {
      canReport.allowed = false;
      canReport.reasons.push(
        `Statut "${reservation.status}" ne permet pas le report.`
      );
    }
    const hoursUntilDeparture =
      (new Date(reservation.date) - new Date()) / 36e5;
    if (hoursUntilDeparture < config.minHoursBeforeDeparture) {
      canReport.allowed = false;
      canReport.reasons.push(
        `Report impossible moins de ${config.minHoursBeforeDeparture}h avant le départ.`
      );
    }
    const reportCount = reservation.reportCount || 0;
    if (reportCount >= config.maxReportsAllowed) {
      canReport.allowed = false;
      canReport.reasons.push(
        `Nombre maximum de reports atteint (${config.maxReportsAllowed}).`
      );
    }
    res.json({
      success: true,
      canReport: canReport.allowed,
      reasons: canReport.reasons,
      currentReportCount: reportCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});


// ============================================
// --- ROUTE PUBLIQUE POUR LES DESTINATIONS ---
// ============================================

app.get(
  "/api/reservations/:bookingNumber/available-trips",
  async (req, res) => {
    try {
      const { bookingNumber } = req.params;
      const reservation = await reservationsCollection.findOne({
        bookingNumber,
      });
      if (!reservation)
        return res.status(404).json({ error: "Réservation introuvable." });
      const settings = await systemSettingsCollection.findOne({
        key: "reportSettings",
      });
      const config = settings?.value || { maxDaysInFuture: 30 };
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2);
      const maxDate = new Date(reservation.date);
      maxDate.setDate(maxDate.getDate() + config.maxDaysInFuture);
      const availableTrips = await tripsCollection
        .find({
          "route.from": reservation.route.from,
          "route.to": reservation.route.to,
          date: {
            $gte: minDate.toISOString().split("T")[0],
            $lte: maxDate.toISOString().split("T")[0],
            $ne: reservation.date,
          },
        })
        .sort({ date: 1 })
        .toArray();
      const formattedTrips = availableTrips.map((trip) => ({
        id: trip._id.toString(),
        date: trip.date,
        route: {
          from: trip.route.from,
          to: trip.route.to,
          company: trip.route.company,
          price: trip.route.price,
          departure: trip.route.departure,
          arrival: trip.route.arrival,
        },
        availableSeats: trip.seats.filter((s) => s.status === "available")
          .length,
      }));
      res.json({
        success: true,
        currentTrip: { date: reservation.date, price: reservation.route.price },
        availableTrips: formattedTrips,
        count: formattedTrips.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

app.post(
  "/api/reservations/:bookingNumber/calculate-report-cost",
  strictLimiter,
  [body("newTripId").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { newTripId } = req.body;
      const reservation = await reservationsCollection.findOne({
        bookingNumber: req.params.bookingNumber,
      });
      if (!reservation)
        return res.status(404).json({ error: "Réservation introuvable." });
      const newTrip = await tripsCollection.findOne({
        _id: new ObjectId(newTripId),
      });
      if (!newTrip)
        return res.status(404).json({ error: "Voyage cible introuvable." });
      const settings = await systemSettingsCollection.findOne({
        key: "reportSettings",
      });
      const config = settings?.value || {
        firstReportFree: true,
        secondReportFee: 2000,
        thirdReportFee: 5000,
      };
      const reportCount = reservation.reportCount || 0;
      const reportFee =
        reportCount === 0 && config.firstReportFree
          ? 0
          : reportCount === 1
          ? config.secondReportFee
          : config.thirdReportFee;
      const currentPrice = reservation.totalPriceNumeric || 0;
      const newPrice =
        (newTrip.route.price || 0) * reservation.passengers.length;
      const priceDifference = newPrice - currentPrice;
      const totalCost = reportFee + priceDifference;
      res.json({
        success: true,
        calculation: {
          reportFee,
          currentPrice,
          newPrice,
          priceDifference,
          totalCost,
          isPaymentRequired: totalCost > 0,
          isCreditGenerated: totalCost < 0,
          creditAmount: totalCost < 0 ? Math.abs(totalCost) : 0,
        },
        reportNumber: reportCount + 1,
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

app.post(
  "/api/reservations/:bookingNumber/confirm-report",
  strictLimiter,
  [
    body("newTripId").notEmpty(),
    body("paymentMethod").optional().isString(),
    body("transactionId").optional({ nullable: true }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { newTripId, paymentMethod, transactionId } = req.body;
      const reservation = await reservationsCollection.findOne({
        bookingNumber: req.params.bookingNumber,
      });
      if (!reservation)
        return res.status(404).json({ error: "Réservation introuvable." });
      const newTrip = await tripsCollection.findOne({
        _id: new ObjectId(newTripId),
      });
      if (!newTrip)
        return res.status(404).json({ error: "Voyage cible introuvable." });
      const requiredSeats = reservation.passengers.length;
      if (
        newTrip.seats.filter((s) => s.status === "available").length <
        requiredSeats
      )
        return res.status(409).json({ error: `Pas assez de sièges.` });

      const settings = await systemSettingsCollection.findOne({
        key: "reportSettings",
      });
      const config = settings?.value || {
        firstReportFree: true,
        secondReportFee: 2000,
        thirdReportFee: 5000,
      };
      const reportCount = reservation.reportCount || 0;
      const reportFee =
        reportCount === 0 && config.firstReportFree
          ? 0
          : reportCount === 1
          ? config.secondReportFee
          : config.thirdReportFee;
      const currentPrice = reservation.totalPriceNumeric || 0;
      const newPrice = (newTrip.route.price || 0) * requiredSeats;
      const priceDifference = newPrice - currentPrice;
      const totalCost = reportFee + priceDifference;

      if (totalCost > 0) {
        let agencyPaymentCode = null;
        if (paymentMethod?.toUpperCase() === "AGENCY") {
          agencyPaymentCode = `AG-${Math.floor(10000 + Math.random() * 90000)}`;
        }
        const reportRequest = {
          requestedAt: new Date(),
          targetTrip: {
            id: newTrip._id.toString(),
            date: newTrip.date,
            route: newTrip.route,
            seats: [],
          },
          cost: { reportFee, priceDifference, totalCost },
          paymentMethod: paymentMethod?.toUpperCase() || "MTN",
          transactionId: transactionId || null,
          agencyPaymentCode,
          status: "En attente de validation admin",
        };
        await reservationsCollection.updateOne(
          { _id: reservation._id },
          { $set: { reportRequest, status: "En attente de report" } }
        );
        return res
          .status(200)
          .json({
            success: true,
            message: "Demande de report enregistrée.",
            requiresPayment: true,
            paymentAmount: totalCost,
            agencyPaymentCode,
            oldBookingNumber: req.params.bookingNumber,
          });
      } else {
        const availableSeats = newTrip.seats
          .filter((s) => s.status === "available")
          .slice(0, requiredSeats)
          .map((s) => s.number);
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
        await tripsCollection.updateOne(
          { _id: newTrip._id },
          { $set: { "seats.$[elem].status": "occupied" } },
          { arrayFilters: [{ "elem.number": { $in: availableSeats } }] }
        );

        const newBookingNumber = generateBookingNumber();
        const newReservation = {
          ...reservation,
          _id: new ObjectId(),
          bookingNumber: newBookingNumber,
          route: { ...newTrip.route, id: newTrip._id.toString() },
          busIdentifier: newTrip.busIdentifier || newTrip.route?.trackerId || null, // ✅ CORRECTION
          date: newTrip.date,
          seats: availableSeats,
          passengers:  reservation.passengers.map((p, i) => ({ ...p, seat: availableSeats[i] })),
          totalPriceNumeric: newPrice,
          totalPrice: `${newPrice
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`,
          status: "Confirmé",
          busIdentifier:
            newTrip.busIdentifier || newTrip.route?.trackerId || "Non assigné",
          // ... reportCount: (reservation.reportCount || 0) + 1,
          originalReservation: reservation._id.toString(),
          reportHistory: [
            ...(reservation.reportHistory || []),
            {
              from: {
                date: reservation.date,
                tripId: reservation.route.id.toString(),
                seats: reservation.seats,
              },
              to: {
                date: newTrip.date,
                tripId: newTrip._id.toString(),
                seats: availableSeats,
              },
              reportedAt: new Date(),
              totalCost,
              initiatedBy: "client",
            },
          ],
          clientCredit:
            totalCost < 0
              ? Math.abs(totalCost) + (reservation.clientCredit || 0)
              : reservation.clientCredit || 0,
          createdAt: new Date(),
        };
        delete newReservation.reportedAt;
        delete newReservation.replacementReservation;
        delete newReservation.reportRequest;
        await reservationsCollection.insertOne(newReservation);
        await reservationsCollection.updateOne(
          { _id: reservation._id },
          {
            $set: {
              status: "Reporté",
              reportedAt: new Date(),
              replacementReservation: newReservation._id.toString(),
              replacementBookingNumber: newBookingNumber,
            },
          }
        );
        return res
          .status(201)
          .json({
            success: true,
            message: "Voyage reporté avec succès !",
            newBookingNumber,
            creditGenerated: newReservation.clientCredit,
          });
      }
    } catch (error) {
      console.error("❌ Erreur confirmation report:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

// ============================================
// === ROUTES ADMIN (PROTÉGÉES) ===
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
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH)
      return res.status(500).json({ error: "Erreur de configuration." });
    const isMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );
    if (username !== process.env.ADMIN_USERNAME || !isMatch)
      return res.status(401).json({ error: "Identifiants incorrects" });
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




app.get("/api/admin/destinations", authenticateToken, async (req, res) => {
    try {
        const destinations = await destinationsCollection.find({}).sort({ name: 1 }).toArray();
        res.json({ success: true, destinations });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});





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



// ============================================
// --- GESTION DES MODÈLES DE TRAJETS (ADMIN) ---
// ============================================

app.get("/api/admin/route-templates", authenticateToken, async (req, res) => {
  try {
    const templates = await routeTemplatesCollection.find({}).toArray();
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.get("/api/admin/trips", authenticateToken, async (req, res) => {
    try {
        // 1. On récupère les paramètres de l'URL (envoyés par le frontend)
        const { date, route, bus } = req.query;
        
        // 2. On construit l'objet de requête pour MongoDB
        const query = {};
        
        // Si une date est fournie, on filtre par cette date exacte
        if (date) {
            query.date = date;
        }
        
        // Si un texte de route est fourni...
        if (route) {
            // On cherche ce texte dans la ville de départ OU la ville d'arrivée
            // '$regex' permet une recherche partielle, '$options: 'i'' la rend insensible à la casse
            query.$or = [
                { "route.from": { $regex: route, $options: 'i' } },
                { "route.to": { $regex: route, $options: 'i' } }
            ];
        }
        
        // Si un numéro de bus est fourni
        if (bus) {
            query.busIdentifier = { $regex: bus, $options: 'i' };
        }

        // 3. On exécute la recherche avec les filtres et on trie par date la plus récente
        const trips = await tripsCollection.find(query).sort({ date: -1 }).toArray();
        
        res.json({ success: true, trips });

    } catch (error) {
        console.error("❌ Erreur récupération des voyages filtrés:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});


app.get("/api/admin/reports/history", authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;

        // On définit la requête de base
        let query = {
            $or: [
                { status: "En attente de report" },
                { status: "Reporté" },
                { originalReservation: { $exists: true, $ne: null } },
            ],
        };

        // Si un terme de recherche est fourni, on ajoute une condition supplémentaire
        if (search) {
            query.$and = [
                // On garde la condition de base
                { ...query }, 
                // Et on ajoute la condition de recherche
                {
                    $or: [
                        { bookingNumber: { $regex: search, $options: "i" } },
                        { "passengers.0.name": { $regex: search, $options: "i" } },
                    ]
                }
            ];
            // On supprime le $or initial pour éviter les conflits
            delete query.$or;
        }

        const reports = await reservationsCollection.find(query).sort({ createdAt: -1 }).toArray();

        res.json({
            success: true,
            count: reports.length,
            reports: reports,
        });

    } catch (error) {
        console.error("❌ Erreur récupération historique reports:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}); // ✅ NE PAS OUBLIER DE FERMER LA FONCTION DE LA ROUTE


app.get("/api/admin/settings/report", authenticateToken, async (req, res) => {
  try {
    const settings = await systemSettingsCollection.findOne({
      key: "reportSettings",
    });
    if (!settings)
      return res.status(404).json({ error: "Paramètres introuvables." });
    res.json({ success: true, settings: settings.value });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});




// ---ROUTES POST ---


app.post("/api/admin/route-templates", authenticateToken, async (req, res) => {
    try {
        let template = req.body;
        
        // --- 1. Gestion des options de bagages (votre code est conservé) ---
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
        // Nettoyage des champs bruts
        [
            "standardBaggageIncluded",
            "standardBaggageMax",
            "standardBaggagePrice",
            "oversizedBaggageMax",
            "oversizedBaggagePrice",
        ].forEach((p) => delete template[p]);

        // ===================================
        // ✅ 2. AJOUT DU CHAMP 'isPopular'
        // ===================================
        template.isPopular = false; // Par défaut, un nouveau modèle n'est pas populaire
        template.createdAt = new Date(); // C'est une bonne pratique d'ajouter une date de création
        // ===================================

        // --- 3. Insertion en base de données ---
        await routeTemplatesCollection.insertOne(template);
        
        res.status(201).json({ success: true, message: "Modèle créé avec succès." });

    } catch (error) {
        console.error("❌ Erreur création modèle:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});



app.post(
  "/api/admin/trips",
  authenticateToken,
  [
    body("routeId").notEmpty().withMessage("Le modèle de trajet est requis."),
    body("startDate").isISO8601().withMessage("La date de début est invalide."),
    body("endDate").isISO8601().withMessage("La date de fin est invalide."),
    body("daysOfWeek").isArray({ min: 1 }).withMessage("Au moins un jour de la semaine doit être sélectionné."),
    body("seatCount").isInt({ min: 10, max: 100 }).withMessage("Le nombre de sièges doit être entre 10 et 100."),
    body("busIdentifier").optional({ checkFalsy: true }).isString().trim(),
    body('highlightBadge').optional({ checkFalsy: true }).isString().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    try {
      const {
        routeId,
        startDate,
        endDate,
        daysOfWeek,
        seatCount,
        busIdentifier,
        highlightBadge 
      } = req.body;

      if (!ObjectId.isValid(routeId)) {
        return res.status(400).json({ error: "ID de modèle de trajet invalide." });
      }

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
            highlightBadge: highlightBadge || null,
            createdAt: new Date(),
          });
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      if (newTrips.length > 0) {
        await tripsCollection.insertMany(newTrips);
        console.log(`✅ ${newTrips.length} voyage(s) créé(s) avec succès.`);
      } else {
        console.log("⚠️ Aucun voyage créé, les jours ne correspondaient pas à la plage de dates.");
      }

      res.status(201).json({
          success: true,
          message: `${newTrips.length} voyage(s) ont été programmé(s).`,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la création des voyages:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);






// Ajouter une nouvelle destination
// DANS server.js
app.post("/api/admin/destinations", authenticateToken, [
    body('name').notEmpty().withMessage("Le nom est requis."),
    body('country').notEmpty().withMessage("Le pays est requis."),
    // On rend le champ 'coords' complètement optionnel et on accepte qu'il soit vide
    body('coords').optional({ checkFalsy: true }).isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("❌ Erreurs de validation:", errors.array());
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const { name, country, coords } = req.body;
        
        let coordsArray = [];
        
        // On ne traite la chaîne que si elle existe et n'est pas vide
        if (coords && coords.trim() !== '') {
            const parts = coords.split(',').map(c => parseFloat(c.trim()));
            if (parts.length === 2 && !parts.some(isNaN)) {
                coordsArray = parts;
            } else {
                return res.status(400).json({ error: "Format des coordonnées invalide." });
            }
        }
        
        const newDestination = {
            name, country, coords: coordsArray, isActive: true, createdAt: new Date()
        };
        
        await destinationsCollection.insertOne(newDestination);
        res.status(201).json({ success: true, message: "Destination ajoutée." });

    } catch (error) {
        console.error("❌ Erreur création destination:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

// À placer avec les autres routes POST admin dans server.js



app.post("/api/admin/report-requests/:bookingNumber/approve",
  authenticateToken,
  [
    body('transactionProof').optional().isString().trim() 
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { bookingNumber } = req.params;
      let { transactionProof } = req.body;
      
      console.log(`✅ Validation de la demande de report pour ${bookingNumber}`);
      
      const reservation = await reservationsCollection.findOne({ bookingNumber, status: "En attente de report" });
      if (!reservation || !reservation.reportRequest) {
        return res.status(404).json({ error: "Demande de report introuvable ou déjà traitée." });
      }
      
      const request = reservation.reportRequest;

      if (request.paymentMethod === 'AGENCY') {
          transactionProof = `AGENCE-PAY-${Date.now()}`;
          console.log(`Paiement agence validé. Preuve interne générée: ${transactionProof}`);
      } 
      else if (!transactionProof && request.paymentMethod !== 'AGENCY') {
          return res.status(400).json({ error: "La preuve de paiement (ID de transaction) est requise pour Mobile Money." });
      }

      const newTrip = await tripsCollection.findOne({ _id: new ObjectId(request.targetTrip.id) });
      if (!newTrip) {
        return res.status(404).json({ error: "Le voyage cible n'existe plus." });
      }
      
      const requiredSeatsCount = reservation.passengers.length;
      const availableSeats = newTrip.seats.filter(s => s.status === 'available').slice(0, requiredSeatsCount).map(s => s.number);
      if (availableSeats.length < requiredSeatsCount) {
        return res.status(409).json({ error: `Pas assez de sièges.` });
      }
      
      await tripsCollection.updateOne({ _id: new ObjectId(reservation.route.id) }, { $set: { "seats.$[elem].status": "available" } }, { arrayFilters: [{ "elem.number": { $in: reservation.seats.map(s => parseInt(s)) } }] });
      await tripsCollection.updateOne({ _id: newTrip._id }, { $set: { "seats.$[elem].status": "occupied" } }, { arrayFilters: [{ "elem.number": { $in: availableSeats } }] });
      
      // La création de la nouvelle réservation
      const newBookingNumber = generateBookingNumber();
      const newPrice = newTrip.route.price * requiredSeatsCount;
      const newReservation = {
        ...reservation,
        _id: new ObjectId(),
        bookingNumber: newBookingNumber,
        route: { ...newTrip.route, id: newTrip._id.toString() },
        date: newTrip.date,
        seats: availableSeats,
        passengers: reservation.passengers.map((p, i) => ({ ...p, seat: availableSeats[i] })),
        totalPriceNumeric: newPrice,
        totalPrice: `${newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`,
        status: "Confirmé",
        reportCount: (reservation.reportCount || 0) + 1,
        originalReservation: reservation._id.toString(),
        busIdentifier: newTrip.busIdentifier || null,
        reportHistory: [
          ...(reservation.reportHistory || []),
          {
            from: { date: reservation.date, tripId: reservation.route.id.toString() },
            to: { date: newTrip.date, tripId: newTrip._id.toString() },
            reportedAt: new Date(),
            totalCost: request.cost.totalCost,
            initiatedBy: "client",
            approvedBy: req.user.username,
            transactionProof
          }
        ],
        createdAt: new Date()
      };
      
      delete newReservation.reportedAt;
      delete newReservation.replacementReservation;
      delete newReservation.reportRequest;
      delete newReservation.replacementBookingNumber; // On nettoie l'ancien au cas où

      await reservationsCollection.insertOne(newReservation);
      
      // Mise à jour de l'ancienne réservation pour la lier à la nouvelle
      await reservationsCollection.updateOne(
        { _id: reservation._id },
        { 
          $set: { 
            status: "Reporté", 
            reportedAt: new Date(), 
            replacementReservation: newReservation._id.toString(), 
            replacementBookingNumber: newReservation.bookingNumber, // ✅ On ajoute le numéro du nouveau billet
            'reportRequest.status': 'Approuvé', 
            'reportRequest.approvedAt': new Date(), 
            'reportRequest.approvedBy': req.user.username, 
            'reportRequest.transactionProof': transactionProof 
          }
        }
      );
      
      console.log(`✅✅ Report validé par admin. Ancien: ${bookingNumber}, Nouveau: ${newBookingNumber}`);
      
      sendReportConfirmedEmail(reservation, newReservation);

      res.json({ success: true, message: "Demande de report validée avec succès.", newBookingNumber });
      
    } catch (error) {
      console.error("❌ Erreur validation report:", error);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);



// Routes de mise à jour PATCH


app.patch(
  "/api/admin/trips/:id/reset-seats",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
      if (!trip) return res.status(404).json({ error: "Voyage non trouvé." });
      const newSeats = Array.from({ length: trip.seats.length }, (_, i) => ({
        number: i + 1,
        status: "available",
      }));
      await tripsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { seats: newSeats } }
      );
      res.json({ success: true, message: "Sièges réinitialisés." });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

app.patch("/api/admin/route-templates/:id/toggle-popular", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        // On récupère le modèle pour inverser son statut
        const template = await routeTemplatesCollection.findOne({ _id: new ObjectId(id) });
        if (!template) return res.status(404).json({ error: "Modèle non trouvé" });

        const newStatus = !template.isPopular;

        await routeTemplatesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isPopular: newStatus } }
        );

        res.json({ success: true, message: `Statut 'Populaire' mis à jour à ${newStatus}.` });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});



app.patch(
  "/api/admin/trips/:tripId/seats/:seatNumber",
  authenticateToken,
  [body("status").isIn(["available", "blocked"])],
  async (req, res) => {
    try {
      const { tripId, seatNumber } = req.params;
      const { status } = req.body;
      const result = await tripsCollection.updateOne(
        { _id: new ObjectId(tripId), "seats.number": parseInt(seatNumber) },
        { $set: { "seats.$.status": status } }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ error: "Voyage ou siège non trouvé." });
      res.json({ success: true, message: `Siège ${seatNumber} mis à jour` });
    } catch (error) {
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

      console.log("--- 🔄 Début de la modification des sièges ---");
      console.log(
        `ID Réservation: ${id}, Nouveaux sièges demandés: ${newSeats}`
      );

      if (!ObjectId.isValid(id)) {
        console.log("-> Erreur: ID invalide.");
        return res.status(400).json({ error: "ID de réservation invalide." });
      }

      if (!Array.isArray(newSeats) || newSeats.length === 0) {
        console.log("-> Erreur: 'newSeats' n'est pas un tableau valide.");
        return res.status(400).json({ error: "Format de sièges invalide." });
      }

      // 1. Récupérer la réservation
      const reservation = await reservationsCollection.findOne({
        _id: new ObjectId(id),
      });
      if (!reservation) {
        console.log("-> Erreur: Réservation introuvable.");
        return res.status(404).json({ error: "Réservation introuvable." });
      }
      console.log(`-> Réservation trouvée: ${reservation.bookingNumber}`);

      // 2. Vérifier la cohérence (nombre de sièges vs passagers)
      if (newSeats.length !== reservation.passengers.length) {
        console.log(
          "-> Erreur: Nombre de sièges ne correspond pas au nombre de passagers."
        );
        return res
          .status(400)
          .json({
            error: `Le nombre de sièges (${newSeats.length}) doit correspondre au nombre de passagers (${reservation.passengers.length}).`,
          });
      }

      // 3. Vérifier que la réservation a bien un voyage associé
      if (
        !reservation.route ||
        !reservation.route.id ||
        !ObjectId.isValid(reservation.route.id)
      ) {
        console.log(
          "-> Erreur: ID de voyage manquant ou invalide dans la réservation."
        );
        return res
          .status(400)
          .json({ error: "Données de voyage corrompues dans la réservation." });
      }

      // 4. Récupérer le voyage associé
      const trip = await tripsCollection.findOne({
        _id: new ObjectId(reservation.route.id),
      });
      if (!trip) {
        console.log("-> Erreur: Voyage associé introuvable.");
        return res
          .status(404)
          .json({ error: "Le voyage associé est introuvable." });
      }
      console.log(`-> Voyage associé trouvé (Date: ${trip.date})`);

      // 5. Vérifier la disponibilité des nouveaux sièges
      const oldSeats = reservation.seats.map((s) => parseInt(s));
      const unavailable = trip.seats.filter(
        (s) =>
          newSeats.includes(s.number) &&
          s.status !== "available" &&
          !oldSeats.includes(s.number)
      );

      if (unavailable.length > 0) {
        console.log(
          `-> Erreur: Conflit, sièges indisponibles: ${unavailable
            .map((s) => s.number)
            .join(", ")}`
        );
        return res
          .status(409)
          .json({
            error: `Conflit : Le(s) siège(s) ${unavailable
              .map((s) => s.number)
              .join(", ")} est/sont déjà pris.`,
          });
      }
      console.log("-> Tous les nouveaux sièges sont disponibles.");

      // 6. Mettre à jour la base de données (libérer les anciens, occuper les nouveaux)
      console.log("-> Libération des anciens sièges...");
      await tripsCollection.updateOne(
        { _id: trip._id },
        { $set: { "seats.$[elem].status": "available" } },
        { arrayFilters: [{ "elem.number": { $in: oldSeats } }] }
      );

      console.log("-> Occupation des nouveaux sièges...");
      await tripsCollection.updateOne(
        { _id: trip._id },
        { $set: { "seats.$[elem].status": "occupied" } },
        { arrayFilters: [{ "elem.number": { $in: newSeats } }] }
      );

      console.log("-> Mise à jour de la réservation...");
      await reservationsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            seats: newSeats,
            passengers: reservation.passengers.map((p, i) => ({
              ...p,
              seat: newSeats[i],
            })),
            updatedAt: new Date(),
          },
        }
      );

      console.log("--- ✅ Modification des sièges terminée avec succès ---");
      res.json({
        success: true,
        message: "Les sièges ont été modifiés avec succès.",
      });
    } catch (error) {
      console.error(
        "❌ ERREUR FATALE lors de la modification des sièges:",
        error
      );
      res.status(500).json({ error: "Erreur serveur inattendue." });
    }
  }
);


app.patch(
  "/api/admin/settings/report",
  authenticateToken,
  [
    /* ... validations ... */
  ],
  async (req, res) => {
    try {
      const updates = {};
      if (req.body.secondReportFee !== undefined)
        updates["value.secondReportFee"] = req.body.secondReportFee;
      if (req.body.thirdReportFee !== undefined)
        updates["value.thirdReportFee"] = req.body.thirdReportFee;
      // ... etc
      updates.updatedAt = new Date();
      updates.updatedBy = req.user.username;
      await systemSettingsCollection.updateOne(
        { key: "reportSettings" },
        { $set: updates }
      );
      res.json({ success: true, message: "Paramètres mis à jour." });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

// ICI
// ============================================
// --- ROUTES ADMIN (Suite) ---
// ============================================

// --- D. Routes d'action spécifiques (PATCH) ---

app.patch("/api/admin/trips/:tripId/status", authenticateToken, [
    body('status').isIn(['ON_TIME', 'DELAYED', 'CANCELLED', 'ARRIVED', 'MAINTENANCE']),
    body('delayMinutes').if(body('status').equals('DELAYED')).isInt({ min: 1 }).withMessage('Le retard doit être un nombre positif.'),
    body('reason').if(body('status').equals('CANCELLED')).notEmpty().withMessage('La raison est requise pour une annulation.'),
    body('reason').optional().isString().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
        const { tripId } = req.params;
        const { status, delayMinutes, reason } = req.body;
        if (!ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "ID de voyage invalide." });
        }
        const liveStatus = {
            status,
            delayMinutes: status === 'DELAYED' ? (parseInt(delayMinutes) || 0) : 0,
            reason: reason || '',
            lastUpdated: new Date(),
            updatedBy: req.user.username
        };
        const result = await tripsCollection.updateOne({ _id: new ObjectId(tripId) }, { $set: { liveStatus } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Voyage non trouvé." });
        }
        console.log(`📢 Statut du voyage ${tripId} mis à jour : ${status}`);
        res.json({ success: true, message: `Statut du voyage mis à jour : ${status}` });
    } catch (error) {
        console.error("❌ Erreur mise à jour statut voyage:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});


// --- E. Routes de suppression (DELETE) ---

app.delete("/api/admin/route-templates/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });
        const result = await routeTemplatesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Modèle non trouvé" });
        res.json({ success: true, message: "Modèle supprimé." });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.delete("/api/admin/trips/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID de voyage invalide" });
        const trip = await tripsCollection.findOne({ _id: new ObjectId(id) });
        if (!trip) return res.status(404).json({ error: "Voyage non trouvé" });
        if (trip.seats.some((s) => s.status === "occupied")) return res.status(400).json({ error: "Impossible de supprimer : des sièges sont réservés" });
        await tripsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: "Voyage supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.delete("/api/admin/destinations/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });
        // TODO: Vérifier si la ville est utilisée avant de supprimer
        await destinationsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: "Destination supprimée." });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- F. La route générique 'action' à la toute fin ---
// --- F. La route générique 'action' à la toute fin ---

app.patch("/api/admin/reservations/:id/:action", authenticateToken, async (req, res) => {
    const { id, action } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID de réservation invalide." });

    try {
        const reservation = await reservationsCollection.findOne({ _id: new ObjectId(id) });
        if (!reservation) return res.status(404).json({ error: "Réservation introuvable." });

        // --- CAS 1 : Confirmation de paiement ---
        if (action === "confirm-payment") {
            if (reservation.status !== "En attente de paiement") return res.status(400).json({ error: "Cette réservation n'est pas en attente de paiement." });
            
            const { transactionProof } = req.body;
            if (!transactionProof || transactionProof.trim() === '') return res.status(400).json({ error: "Une preuve de transaction est requise." });

            await reservationsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "Confirmé", confirmedAt: new Date(), "paymentDetails.transactionProof": transactionProof.trim(), "paymentDetails.confirmedByAdmin": req.user.username } }
            );
            
            const updatedReservation = await reservationsCollection.findOne({ _id: new ObjectId(id) });
            sendPaymentConfirmedEmail(updatedReservation);
            return res.json({ success: true, message: "Paiement confirmé !" });
        }

        // --- CAS 2 : Annulation de la réservation ---
        if (action === "cancel") {
            if (['Annulé', 'Expiré'].includes(reservation.status)) return res.status(400).json({ error: "Cette réservation est déjà annulée ou expirée." });
            
            // Libérer les sièges du trajet aller
            await tripsCollection.updateOne(
                { _id: new ObjectId(reservation.route.id) },
                { $set: { "seats.$[elem].status": "available" } },
                { arrayFilters: [{ "elem.number": { $in: reservation.seats.map(s => parseInt(s)) } }] }
            );

            // Libérer les sièges du trajet retour si applicable
            if (reservation.returnRoute) {
                await tripsCollection.updateOne(
                    { _id: new ObjectId(reservation.returnRoute.id) },
                    { $set: { "seats.$[elem].status": "available" } },
                    { arrayFilters: [{ "elem.number": { $in: reservation.returnSeats.map(s => parseInt(s)) } }] }
                );
            }

            await reservationsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "Annulé", cancelledAt: new Date(), cancelledBy: "admin" } }
            );
            
            // TODO: Envoyer un email d'annulation au client
            
            return res.json({ success: true, message: "Réservation annulée avec succès." });
        }

        // Si l'action n'est ni "confirm-payment" ni "cancel"
        return res.status(400).json({ error: "Action non valide ou non reconnue." });

    } catch (error) {
        console.error(`❌ Erreur lors de l'action '${action}' sur la réservation ${id}:`, error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});


// ============================================
// --- GESTION DES DESTINATIONS (ADMIN) ---
// ============================================

// Lister toutes les destinations pour l'admin

// Mettre à jour une destination (notamment pour l'activer/désactiver)
app.patch("/api/admin/destinations/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; // ex: { isActive: false } ou { name: "Nouveau nom" }
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        await destinationsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
        res.json({ success: true, message: "Destination mise à jour." });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});


// ============================================
// --- GESTION DES VOYAGES (ADMIN) ---
// ============================================

app.post(
  "/api/admin/trips",
  authenticateToken,
  [
    /* ... validations ... */
  ],
  async (req, res) => {
    try {
      const {
        routeId,
        startDate,
        endDate,
        daysOfWeek,
        seatCount,
        busIdentifier,
        highlightBadge,
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
        if (daysOfWeek.includes(dayMap[currentDate.getUTCDay()])) {
          const seats = Array.from({ length: seatCount }, (_, i) => ({
            number: i + 1,
            status: "available",
          }));
          newTrips.push({
            date: currentDate.toISOString().split("T")[0],
            route: routeTemplate,
            seats: seats,
            busIdentifier: busIdentifier || null,
            highlightBadge: highlightBadge || null,
            createdAt: new Date(),
          });
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
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
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
);

// ===============================================
// --- ROUTE ADMIN LA PLUS GÉNÉRIQUE (ACTION) ---
// ===============================================

// --- CRON JOB & WEBSOCKET ---
if (
  process.env.NODE_ENV === "production" &&
  process.env.CRON_ENABLED === "true"
) {
  cron.schedule("*/5 * * * *", async () => {
    /* ... votre logique cron ... */
  });
  console.log("✅ Cron jobs activés.");
}

const io = new Server(server, { cors: { origin: allowedOrigins } });
// ... (votre logique websocket)

// ============================================
// --- LOGIQUE WEBSOCKET POUR LE SUIVI DE BUS ---
// ============================================
io.on("connection", (socket) => {
  console.log(`🛰️  Nouvelle connexion WebSocket: ${socket.id}`);

  // Un client (navigateur) s'abonne pour suivre un bus spécifique
  socket.on("subscribeToBus", async (busId) => {
    if (!busId) return;

    console.log(`[Socket ${socket.id}] s'abonne au bus: ${busId}`);
    socket.join(busId); // Le client rejoint un "canal" spécifique à ce bus

    // On lui envoie immédiatement la dernière position connue
    try {
      const lastPosition = await positionsCollection.findOne(
        { busId: busId },
        { sort: { timestamp: -1 } }
      );

      if (lastPosition) {
        socket.emit("updatePosition", lastPosition);
        console.log(
          ` -> Dernière position envoyée à [Socket ${socket.id}] pour le bus ${busId}`
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la dernière position:",
        error
      );
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Connexion WebSocket fermée: ${socket.id}`);
  });
});

// ============================================
// --- ROUTE POUR LA MISE À JOUR DE LA POSITION DU BUS ---
// ============================================
// Cette route est appelée par le tracker GPS dans le bus
app.post("/track/update", async (req, res) => {
  const { tid, lat, lon, tst } = req.body; // tid = trackerId, lat = latitude, lon = longitude, tst = timestamp

  if (!tid || !lat || !lon) {
    return res.status(400).json({ error: "Données de suivi invalides" });
  }

  const newPosition = {
    busId: tid,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    timestamp: new Date(parseInt(tst) * 1000), // Convertir le timestamp Unix en date
  };

  try {
    // Sauvegarder la position en base de données
    await positionsCollection.updateOne(
      { busId: tid },
      { $set: newPosition },
      { upsert: true } // Crée le document s'il n'existe pas
    );

    // Diffuser la nouvelle position à tous les clients qui suivent ce bus
    io.to(tid).emit("updatePosition", newPosition);
    console.log(
      `📍 Position mise à jour pour le bus ${tid} -> diffusée sur le canal ${tid}`
    );

    res.sendStatus(200); // Répondre au tracker GPS que tout est OK
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la position:", error);
    res.sendStatus(500);
  }
});

// --- Démarrage ---
const PORT = process.env.PORT || 3000;
(async () => {
  await connectToDb();
  server.listen(PORT, () =>
    console.log(`\n🚀 Backend En-Bus démarré sur le port ${PORT}\n`)
  );
})();
