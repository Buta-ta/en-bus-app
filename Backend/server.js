// ============================================
// 🚀 EN-BUS BACKEND - VERSION FINALE ET COMPLÈTE
// ============================================

require("dotenv").config();

// --- Imports ---
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { ObjectId } = require("mongodb"); 
const { connectToDb, getDb } = require('./database'); 
const { registerToken, sendPush } = require('./notifications'); // 
const cron = require("node-cron");
const { Resend } = require("resend");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const html_pdf = require('html-pdf-node'); // ✅ AJOUTER CETTE LIGNE

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

let reservationsCollection,
  positionsCollection,
  tripsCollection,
  routeTemplatesCollection,
  systemSettingsCollection,
  destinationsCollection, // ✅ METS UNE VIRGULE ICI
  crewCollection; // ✅ Maintenant elle fait partie du `let`







// ============================================
// 📧 GESTION DES EMAILS (RESEND)
// ============================================
const emailTemplate = (content, headerTitle, lang = 'fr') => {
    const translation = translations[lang] || translations.fr;
    
    // Couleurs modernes
    const primaryColor = "#73d700"; // Vert En-Bus
    const darkColor = "#10101A";    // Bleu Nuit
    const lightBg = "#F4F7F9";      // Gris fond

    return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headerTitle}</title>
    <style>
        /* Reset & Base */
        body { margin: 0; padding: 0; background-color: ${lightBg}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
        
        /* Header */
        .header { background-color: ${darkColor}; padding: 40px 30px; text-align: center; background-image: radial-gradient(circle at top, #1c1c2e 0%, ${darkColor} 100%); }
        .logo { font-size: 28px; font-weight: 900; color: ${primaryColor}; letter-spacing: -1px; text-transform: uppercase; font-family: 'Arial Black', sans-serif; }
        .header-title { color: #ffffff; font-size: 22px; margin-top: 15px; margin-bottom: 0; font-weight: 700; }
        
        /* Content */
        .content { padding: 40px 30px; }
        h2 { font-size: 20px; margin-top: 0; margin-bottom: 20px; color: ${darkColor}; }
        p { margin-bottom: 20px; font-size: 16px; color: #555555; }
        
        /* Info Box (Nouveau style pour vos détails) */
        .info-box { background-color: #f8f9fa; border-left: 4px solid ${primaryColor}; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .info-box strong { color: ${darkColor}; display: block; margin-bottom: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-box span { font-size: 16px; font-weight: 600; color: #333; display: block; margin-bottom: 12px; }
        .info-box span:last-child { margin-bottom: 0; }

        /* Code Box (Pour Agence) */
        .code-box { background-color: #e3f2fd; border: 2px dashed #2196f3; color: #0d47a1; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0; }
        .code-box-title { font-size: 12px; text-transform: uppercase; font-weight: 700; margin: 0 0 5px 0; opacity: 0.8; }
        .code-box-code { font-size: 32px; font-weight: 900; margin: 0; font-family: monospace; letter-spacing: 2px; }

        /* Buttons */
        .button { display: inline-block; background-color: ${primaryColor}; color: #ffffff !important; padding: 14px 30px; border-radius: 50px; font-weight: 700; text-decoration: none; text-align: center; margin-top: 20px; box-shadow: 0 4px 15px rgba(115, 215, 0, 0.4); }
        
        /* Footer */
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eeeeee; }
        .footer a { color: #999; text-decoration: none; font-weight: 600; }
        
        @media only screen and (max-width: 600px) { .wrapper { width: 100% !important; border-radius: 0; margin: 0; } }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="logo">EN-BUS</div>
            <h1 class="header-title">${headerTitle}</h1>
        </div>
        <div class="content">
            ${content}
            <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                ${translation.email_thanks}<br>
                <strong>${translation.email_team}</strong>
            </p>
        </div>
        <div class="footer">
            <p>${translation.footer_copyright}</p>
            <p><a href="#">${translation.nav_contact}</a> • <a href="#">${translation.nav_my_bookings}</a></p>
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
    if (!client?.email) return;

    const lang = reservation.lang || 'fr'; 
    const translation = translations[lang] || translations.fr;
    const locale = lang === 'en' ? enUS : fr;
    const timeZone = 'Africa/Brazzaville';

    const subject = translation.email_pending_subject(reservation.bookingNumber);
    const headerTitle = translation.email_pending_title;
    
    // Date formatée
    const deadlineUTC = new Date(reservation.paymentDeadline);
    const zonedDeadline = utcToZonedTime(deadlineUTC, timeZone);
    const deadline = format(zonedDeadline, "PPPP p", { locale: locale });
    
    let paymentInstructions = '';
    if (reservation.paymentMethod === 'AGENCY') {
        // Style Code Box
        paymentInstructions = `
            <div class="code-box">
                <h4 class="code-box-title">${translation.email_pending_agency_code_label}</h4>
                <p class="code-box-code">${reservation.agencyPaymentCode}</p>
            </div>
            <p style="text-align: center; font-size: 14px;">${translation.email_pending_agency_cta}</p>
        `;
    } else {
        // Style Info Box Mobile Money
        paymentInstructions = `
            <div class="info-box" style="border-left-color: #ffa726; background-color: #fff8e1;">
                <h3 style="color: #ffa726; margin-top: 0; font-size: 18px;">📱 Paiement Mobile</h3>
                <p style="margin-bottom: 0;">${translation.email_pending_mm_cta(reservation.totalPrice, reservation.bookingNumber)}</p>
            </div>
        `;
    }

    const htmlContent = `
        <h2>${translation.email_greeting(client.name)}</h2>
        <p>${translation.email_pending_intro(reservation.route.from, reservation.route.to)}</p>
        
        ${paymentInstructions}
        
        <div style="background-color: #ffebee; border: 1px solid #ef5350; color: #c62828; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center; font-weight: 700;">
            ⚠️ ${translation.email_pending_deadline_warning(deadline)}
        </div>
    `;

    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}


function sendPaymentConfirmedEmail(reservation) {
    const client = reservation.passengers?.[0];
    if (!client?.email) return;

    const lang = reservation.lang || 'fr';
    const translation = translations[lang] || translations.fr;
    const locale = lang === 'en' ? enUS : fr;

    const subject = translation.email_confirmed_subject(reservation.bookingNumber);
    const headerTitle = translation.email_confirmed_title;
    
    const timeZone = 'Africa/Brazzaville';
    const departureDateTimeUTC = new Date(`${reservation.date}T${reservation.route.departure}:00`);
    const zonedDeparture = utcToZonedTime(departureDateTimeUTC, timeZone);
    const formattedDateTime = format(zonedDeparture, "PPPP ''p", { locale: locale });

    const htmlContent = `
        <h2>${translation.email_greeting(client.name)}</h2>
        <p>${translation.email_confirmed_intro}</p>
        
        <div class="info-box">
            <strong>${translation.email_confirmed_details_trip}</strong>
            <span>${reservation.route.from} ➝ ${reservation.route.to}</span>
            
            <strong>${translation.email_confirmed_details_date}</strong>
            <span>${formattedDateTime}</span>
            
            <strong>Référence</strong>
            <span style="font-family: monospace; letter-spacing: 1px;">${reservation.bookingNumber}</span>
        </div>
        
        <p>${translation.email_confirmed_cta}</p>
        
      <div style="text-align: center; margin-top: 30px;">
    <a href="https://incomparable-llama-84897e.netlify.app/?page=reservations" target="_blank" class="button" style="color: #ffffff; text-decoration: none;">
        ${translation.email_confirmed_button}
    </a>
</div>
        <p style="font-size: 14px; color: #777; margin-top: 20px;">${translation.email_confirmed_outro}</p>
    `;

    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}


function sendReportConfirmedEmail(oldReservation, newReservation) {
    const client = newReservation.passengers?.[0];
    if (!client?.email) return;

    const lang = newReservation.lang || 'fr';
    const translation = translations[lang] || translations.fr;
    const locale = lang === 'en' ? enUS : fr;
    const timeZone = 'Africa/Brazzaville';

    const subject = translation.email_report_subject(newReservation.bookingNumber);
    const headerTitle = translation.email_report_title;
    
    const oldDate = new Date(oldReservation.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR');
    
    const newDepartureDateTimeUTC = new Date(`${newReservation.date}T${newReservation.route.departure}:00`);
    const newZonedDeparture = utcToZonedTime(newDepartureDateTimeUTC, timeZone);
    const newFormattedDateTime = format(newZonedDeparture, "PPPP 'à' p", { locale: locale });

    const htmlContent = `
        <h2>${translation.email_greeting(client.name)}</h2>
        <p>${translation.email_report_intro}</p>
        
        <!-- Alerte Ancien Billet -->
        <div style="background-color: #ffebee; border-left: 4px solid #ef5350; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <strong style="color: #c62828; font-size: 12px; text-transform: uppercase;">${translation.email_report_old_trip_label}</strong>
            <div style="color: #b71c1c;">
                ${translation.email_report_old_trip_date(oldDate)} • ${oldReservation.bookingNumber}
                <br><em>${translation.email_report_old_trip_invalid}</em>
            </div>
        </div>

        <div class="info-box">
            <strong>${translation.email_report_new_trip_label}</strong>
            <span style="font-size: 20px; color: #73d700;">${newReservation.bookingNumber}</span>
            
            <strong>${translation.email_confirmed_details_trip}</strong>
            <span>${newReservation.route.from} ➝ ${newReservation.route.to}</span>
            
            <strong>${translation.email_confirmed_details_date}</strong>
            <span>${newFormattedDateTime}</span>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">${translation.email_confirmed_button}</a>
        </div>
        
        <p style="font-size: 14px; color: #777; margin-top: 20px;">${translation.email_report_outro}</p>
    `;

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



// Route pour enregistrer un token
app.post('/api/notifications/register', (req, res) => {
    const { token, bookingNumber, busId } = req.body;
    
    if (!token || !bookingNumber) {
        return res.status(400).json({ error: 'token et bookingNumber requis' });
    }
    
    registerToken(token, bookingNumber, busId);
    res.json({ success: true });
});

// Route pour envoyer une notification (admin)
app.post('/api/notifications/send', async (req, res) => {
    const { bookingNumber, title, body } = req.body;
    
    const success = await sendToBooking(bookingNumber, title, body);
    res.json({ success });
});

// Route pour notifier un bus en retard
app.post('/api/notifications/bus-delay', async (req, res) => {
    const { busId, delayMinutes } = req.body;
    
    const count = await sendToBus(
        busId,
        'Bus en retard',
        `Votre bus a ${delayMinutes} minutes de retard`
    );
    res.json({ success: true, notified: count });
});



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
        date: date, // ✅ On cherche par date de DÉPART
      })
      .toArray();

    // ✅ AJOUT : Filtrer les trajets passés (pour aujourd'hui)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const filteredTrips = trips.filter(trip => {
      // Si le voyage n'est pas aujourd'hui, on le garde
      if (trip.date !== todayStr) return true;
      
      // Si c'est aujourd'hui, on vérifie que l'heure de départ n'est pas passée
      if (trip.route?.departure) {
        const [hours, minutes] = trip.route.departure.split(':').map(Number);
        const departureTime = new Date(now);
        departureTime.setHours(hours, minutes, 0, 0);
        return departureTime > now;
      }
      return true;
    });

    // Fonction utilitaire pour calculer la durée
    const calculateDuration = (start, end) => {
        if (!start || !end) return "N/A";
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        
        // Gestion des trajets de nuit (arrivée le lendemain)
        if (diffMinutes < 0) diffMinutes += 1440; 

        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        
        return `${hours}h ${minutes > 0 ? String(minutes).padStart(2, '0') : ''}`;
    };

    const results = filteredTrips.map((trip) => ({
      id: trip._id.toString(),
      from: trip.route.from,
      to: trip.route.to,
      company: trip.route.company,
      price: trip.route.price,
      duration: trip.route.duration || calculateDuration(trip.route.departure, trip.route.arrival),
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
      // ✅ CHAMPS TRAJET DE NUIT
      isNightTrip: trip.isNightTrip || false,
      arrivalDaysOffset: trip.arrivalDaysOffset || 0,
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
// ============================================
// 🔄 ROUTE REPORT : RECHERCHE VOYAGES DISPONIBLES (CORRIGÉE)
// ============================================
app.get("/api/reservations/:bookingNumber/available-trips", async (req, res) => {
    try {
        const { bookingNumber } = req.params;
        
        // 1. Récupérer la réservation
        const reservation = await reservationsCollection.findOne({ bookingNumber });
        if (!reservation) return res.status(404).json({ error: "Réservation introuvable." });

        // Sécurité : Vérifier que la réservation a bien une route
        if (!reservation.route || !reservation.route.from || !reservation.route.to) {
            console.error("❌ Réservation corrompue (pas de route):", bookingNumber);
            return res.status(500).json({ error: "Données de réservation invalides." });
        }

        // 2. Config et Dates
        const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
        const config = settings?.value || { maxDaysInFuture: 60 };

        const minDateStr = new Date().toISOString().split("T")[0]; // Aujourd'hui YYYY-MM-DD
        
        const maxDateObj = new Date();
        maxDateObj.setDate(maxDateObj.getDate() + (config.maxDaysInFuture || 60));
        const maxDateStr = maxDateObj.toISOString().split("T")[0];

        console.log(`🔍 Recherche report pour ${bookingNumber} (${reservation.route.from} -> ${reservation.route.to}) entre ${minDateStr} et ${maxDateStr}`);

        // 3. Recherche MongoDB
        const availableTrips = await tripsCollection
            .find({
                "route.from": reservation.route.from,
                "route.to": reservation.route.to,
                date: {
                    $gte: minDateStr,
                    $lte: maxDateStr,
                    $ne: reservation.date // Pas le même jour que l'original
                },
            })
            .sort({ date: 1 })
            .toArray();

        // 4. Filtrage post-requête (Heure et Sièges)
        const now = new Date();
        const validTrips = availableTrips.filter(trip => {
            // Vérifier structure du trip
            if (!trip.route || !trip.route.departure || !trip.seats) return false;

            // Vérifier heure si c'est aujourd'hui
            const tripDateTime = new Date(`${trip.date}T${trip.route.departure}:00`);
            if (tripDateTime <= now) return false;

            // Vérifier s'il reste des sièges
            const availableSeatsCount = trip.seats.filter(s => s.status === "available").length;
            return availableSeatsCount > 0;
        });

        // 5. Formatage réponse
        const formattedTrips = validTrips.map((trip) => ({
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
            availableSeats: trip.seats.filter((s) => s.status === "available").length,
        }));

        res.json({
            success: true,
            currentTrip: { 
                date: reservation.date, 
                price: reservation.totalPriceNumeric || reservation.route.price // Fallback si totalPriceNumeric manque
            },
            availableTrips: formattedTrips,
            count: formattedTrips.length,
        });

    } catch (error) {
        console.error("❌ ERREUR CRITIQUE REPORT:", error); // Affiche l'erreur exacte dans les logs serveur
        res.status(500).json({ error: "Erreur serveur interne lors de la recherche." });
    }
});
// ============================================
// 💰 ROUTE CALCUL COÛT REPORT (CORRIGÉE)
// ============================================
// ============================================
// 💰 ROUTE CALCUL COÛT REPORT (CORRIGÉE)
// ============================================
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
      
      // 1. Récupération réservation
      const reservation = await reservationsCollection.findOne({
        bookingNumber: req.params.bookingNumber,
      });
      if (!reservation)
        return res.status(404).json({ error: "Réservation introuvable." });

      // 2. Récupération nouveau voyage
      const newTrip = await tripsCollection.findOne({
        _id: new ObjectId(newTripId),
      });
      if (!newTrip)
        return res.status(404).json({ error: "Voyage cible introuvable." });
// 3. Config frais (VERSION SÉCURISÉE)
let settings = null;
try {
    settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
} catch (e) {
    console.warn("⚠️ Impossible de lire les settings report, utilisation défaut.");
}

// Valeurs par défaut obligatoires si la DB est vide ou settings.value est null
const defaults = { firstReportFree: true, secondReportFee: 2000, thirdReportFee: 5000 };
const config = (settings && settings.value) ? settings.value : defaults;

// S'assurer que les valeurs sont bien des nombres
config.secondReportFee = parseInt(config.secondReportFee) || 2000;
config.thirdReportFee = parseInt(config.thirdReportFee) || 5000;

const reportCount = reservation.reportCount || 0;

// Calcul des frais (garanti d'être un nombre)
let reportFee = 0;
if (reportCount === 0 && config.firstReportFree) {
    reportFee = 0;
} else if (reportCount === 1) {
    reportFee = config.secondReportFee;
} else {
    reportFee = config.thirdReportFee;
}

      // 4. ✅ NETTOYAGE PRIX ACTUEL (OLD)
      let currentPrice = reservation.totalPriceNumeric;
      // Si pas de numérique, on nettoie la chaîne (ex: "10 000 FCFA" -> 10000)
      if ((currentPrice === undefined || currentPrice === null) && reservation.totalPrice) {
          currentPrice = parseInt(reservation.totalPrice.toString().replace(/\D/g, '')); 
      }
      currentPrice = Number.isFinite(currentPrice) ? currentPrice : 0;

      // 5. ✅ NETTOYAGE PRIX NOUVEAU (NEW)
      let rawNewPrice = newTrip.route.price;
      // Si c'est une chaîne, on enlève les espaces et lettres
      if (typeof rawNewPrice === 'string') {
          rawNewPrice = rawNewPrice.replace(/\D/g, '');
      }
      const seatPrice = parseInt(rawNewPrice) || 0;

      // Sécurité passagers
      const passengersCount = (reservation.passengers && Array.isArray(reservation.passengers)) 
          ? reservation.passengers.length 
          : 1; 
      
      const newPrice = seatPrice * passengersCount;

      // 6. Calculs finaux
      const priceDifference = newPrice - currentPrice;
// On force (reportFee || 0) pour éviter undefined + number = NaN
const totalCost = (reportFee || 0) + priceDifference; 

      // Debug (visible dans les logs Render)
      console.log(`💰 Calcul Report: Old=${currentPrice}, New=${newPrice} (Seat:${seatPrice} x ${passengersCount}), Diff=${priceDifference}, Fee=${reportFee}, Total=${totalCost}`);

      res.json({
        success: true,
        calculation: {
          reportFee: reportFee,
          currentPrice: currentPrice,
          newPrice: newPrice,
          priceDifference: priceDifference,
          totalCost: totalCost,
          isPaymentRequired: totalCost > 0, // Si > 0, le front affichera le paiement
          isCreditGenerated: totalCost < 0,
          creditAmount: totalCost < 0 ? Math.abs(totalCost) : 0,
        },
        reportNumber: reportCount + 1,
      });

    } catch (error) {
      console.error("❌ Erreur API calculate-report-cost:", error);
      res.status(500).json({ error: "Erreur serveur lors du calcul." });
    }
  }
);
// ============================================
// ✅ ROUTE CONFIRMATION REPORT (CORRIGÉE)
// ============================================
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { newTripId, paymentMethod, transactionId } = req.body;
      const reservation = await reservationsCollection.findOne({ bookingNumber: req.params.bookingNumber });
      const newTrip = await tripsCollection.findOne({ _id: new ObjectId(newTripId) });

      if (!reservation || !newTrip) return res.status(404).json({ error: "Données introuvables." });

      // 1. Config & Frais
      const settings = await systemSettingsCollection.findOne({ key: "reportSettings" });
      const config = settings?.value || { firstReportFree: true, secondReportFee: 2000, thirdReportFee: 5000 };
      const reportCount = reservation.reportCount || 0;
      
      // Conversion forcée en nombres pour la config
      config.secondReportFee = parseInt(config.secondReportFee) || 2000;
      config.thirdReportFee = parseInt(config.thirdReportFee) || 5000;

      let reportFee = 0;
      if (reportCount === 0 && config.firstReportFree) reportFee = 0;
      else if (reportCount === 1) reportFee = config.secondReportFee;
      else reportFee = config.thirdReportFee;

      // 2. 🧹 FONCTION DE NETTOYAGE (Indispensable)
      const cleanPrice = (val) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return parseInt(val.replace(/\D/g, ''), 10) || 0;
          return 0;
      };

      // 3. Calcul des prix (Nettoyés)
      const currentPrice = cleanPrice(reservation.totalPriceNumeric || reservation.totalPrice);
      const unitPrice = cleanPrice(newTrip.route.price);
      const paxCount = (reservation.passengers && reservation.passengers.length) || 1;
      const newPrice = unitPrice * paxCount;

      const totalCost = reportFee + (newPrice - currentPrice);

      console.log(`📝 CONFIRMATION REPORT: Cost=${totalCost} (Fee:${reportFee} + Diff:${newPrice - currentPrice})`);

      // 4. LOGIQUE DE DÉCISION
      // Si le coût est positif, on demande validation Admin
      if (totalCost > 0) {
        console.log("   -> Paiement requis. Mise en attente validation Admin.");
        
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
          },
          cost: { reportFee, totalCost, newPrice, currentPrice },
          paymentMethod: paymentMethod?.toUpperCase() || "MTN",
          transactionId: transactionId || null,
          agencyPaymentCode,
          status: "En attente de validation admin",
        };

        // MISE À JOUR STATUT : "En attente de report"
        await reservationsCollection.updateOne(
          { _id: reservation._id },
          { $set: { reportRequest, status: "En attente de report" } }
        );

        return res.status(200).json({
            success: true,
            message: "Demande envoyée. En attente de validation.",
            requiresPayment: true,
            paymentAmount: totalCost
        });
      } 
      
      // SINON (Gratuit ou Moins cher) : Validation Automatique
      else {
        console.log("   -> Gratuit/Moins cher. Validation automatique.");
        
        const requiredSeats = reservation.passengers.length;
        const availableSeats = newTrip.seats.filter((s) => s.status === "available").slice(0, requiredSeats).map((s) => s.number);
        
        if (availableSeats.length < requiredSeats) return res.status(409).json({ error: "Plus assez de sièges disponibles." });

        // Libérer anciens sièges
        await tripsCollection.updateOne(
          { _id: new ObjectId(reservation.route.id) },
          { $set: { "seats.$[elem].status": "available" } },
          { arrayFilters: [{ "elem.number": { $in: reservation.seats.map((s) => parseInt(s)) } }] }
        );

        // Occuper nouveaux sièges
        await tripsCollection.updateOne(
          { _id: newTrip._id },
          { $set: { "seats.$[elem].status": "occupied" } },
          { arrayFilters: [{ "elem.number": { $in: availableSeats } }] }
        );

        // Créer nouvelle résa
        const newBookingNumber = generateBookingNumber();
        const newReservation = {
          ...reservation,
          _id: new ObjectId(),
          bookingNumber: newBookingNumber,
          route: { ...newTrip.route, id: newTrip._id.toString() },
          busIdentifier: newTrip.busIdentifier || newTrip.route?.trackerId || null,
          date: newTrip.date,
          seats: availableSeats,
          passengers: reservation.passengers.map((p, i) => ({ ...p, seat: availableSeats[i] })),
          totalPriceNumeric: newPrice,
          totalPrice: `${newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`,
          status: "Confirmé", // Directement confirmé
          reportCount: (reservation.reportCount || 0) + 1,
          originalReservation: reservation._id.toString(),
          createdAt: new Date(),
          // Crédit client si moins cher
          clientCredit: totalCost < 0 ? Math.abs(totalCost) + (reservation.clientCredit || 0) : (reservation.clientCredit || 0),
          reportHistory: [...(reservation.reportHistory || []), { from: reservation.date, to: newTrip.date, totalCost, initiatedBy: "client", type: "auto" }]
        };

        delete newReservation.reportedAt;
        delete newReservation.replacementReservation;
        delete newReservation.reportRequest;

        await reservationsCollection.insertOne(newReservation);
        
        await reservationsCollection.updateOne(
          { _id: reservation._id },
          { $set: { status: "Reporté", reportedAt: new Date(), replacementReservation: newReservation._id.toString(), replacementBookingNumber: newBookingNumber } }
        );

        return res.status(201).json({
            success: true,
            message: "Voyage reporté avec succès !",
            newBookingNumber,
            requiresPayment: false
        });
      }

    } catch (error) {
      console.error("❌ Erreur confirm-report:", error);
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



// ============================================
// 📊 ANALYTICS BUS - STATISTIQUES PAR BUS
// ============================================

// Liste des bus disponibles
app.get("/api/admin/analytics/buses", authenticateToken, async (req, res) => {
    try {
        // Récupérer tous les numéros de bus uniques (en excluant les null)
        const buses = await tripsCollection.distinct("busIdentifier", { 
            busIdentifier: { $exists: true, $ne: null, $ne: "" } 
        });
        
        res.json({ 
            success: true, 
            buses: buses.sort() // Trier par ordre alphabétique
        });
    } catch (error) {
        console.error("❌ Erreur récupération liste des bus:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Statistiques complètes d'un bus
app.get("/api/admin/analytics/bus/:busId", authenticateToken, async (req, res) => {
    try {
        const { busId } = req.params;
        
        if (!busId) {
            return res.status(400).json({ error: "Numéro de bus manquant" });
        }

        console.log(`📊 Calcul des statistiques pour le bus: ${busId}`);

        // 1. Récupérer TOUS les voyages de ce bus
        const allTrips = await tripsCollection.find({ 
            busIdentifier: busId 
        }).sort({ date: -1 }).toArray();

        if (allTrips.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalTrips: 0,
                    totalRevenue: 0,
                    averageOccupancy: 0,
                    onTimeRate: 0,
                    maintenanceDays: 0,
                },
                trips: []
            });
        }

        // 2. Calculer les statistiques globales
        let totalRevenue = 0;
        let totalSeatsAvailable = 0;
        let totalSeatsSold = 0;
        let onTimeTrips = 0;
        let maintenanceDays = 0;
        let totalKm = 0 // ✅ NOUVELLE LIGNE


        const tripsDetails = allTrips.map(trip => {
            const totalSeats = trip.seats.length;
            const occupiedSeats = trip.seats.filter(s => s.status === 'occupied').length;
            const revenue = occupiedSeats * (trip.route.price || 0);

            // Accumulation pour les stats globales
            totalRevenue += revenue;
            totalSeatsAvailable += totalSeats;
            totalSeatsSold += occupiedSeats;
            totalKm += trip?.route?.distance || 0; // ✅ NOUVELLE LIGNE

            if (trip.liveStatus?.status === 'ON_TIME' || trip.liveStatus?.status === 'ARRIVED') {
                onTimeTrips++;
            }

            if (trip.liveStatus?.status === 'MAINTENANCE') {
                maintenanceDays++;
            }

            return {
                date: trip.date,
                route: `${trip.route.from} → ${trip.route.to}`,
                seatsOccupied: occupiedSeats,
                seatsTotal: totalSeats,
                occupancyRate: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
                revenue: revenue,
                finalStatus: trip.liveStatus?.status || 'Non défini'
            };
        });

        const stats = {
            totalTrips: allTrips.length,
            totalRevenue: totalRevenue,
            averageRevenue: allTrips.length > 0 ? Math.round(totalRevenue / allTrips.length) : 0,
            averageOccupancy: totalSeatsAvailable > 0 ? Math.round((totalSeatsSold / totalSeatsAvailable) * 100) : 0,
            onTimeRate: allTrips.length > 0 ? Math.round((onTimeTrips / allTrips.length) * 100) : 0,
            maintenanceDays: maintenanceDays,
            totalSeatsSold: totalSeatsSold,
            totalSeatsAvailable: totalSeatsAvailable,
            totalKm: totalKm // ✅ NOUVELLE LIGNE
        };

        console.log(`✅ Statistiques calculées pour ${busId}:`, stats);

        res.json({
            success: true,
            busId: busId,
            stats: stats,
            trips: tripsDetails
        });

    } catch (error) {
        console.error("❌ Erreur calcul analytics bus:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});



// ============================================
// 👥 GESTION DU PERSONNEL (CREW)
// ============================================

// Récupérer tous les membres du personnel
app.get("/api/admin/crew", authenticateToken, async (req, res) => {
    try {
        // ✅ CODE CORRECT
        const crewMembers = await crewCollection.find({}).sort({ createdAt: -1 }).toArray();
        // Calculer les stats générales
        const stats = {
            total: crewMembers.length,
            drivers: crewMembers.filter(m => m.role === 'Chauffeur').length,
            controllers: crewMembers.filter(m => m.role === 'Contrôleur').length,
            active: crewMembers.filter(m => m.status === 'Actif').length
        };

        res.json({
            success: true,
            stats: stats,
            crew: crewMembers
        });

    } catch (error) {
        console.error("❌ Erreur récupération personnel:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Ajouter un nouveau membre du personnel
app.post("/api/admin/crew", authenticateToken, [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('role').isIn(['Chauffeur', 'Contrôleur']).withMessage('Poste invalide'),
    body('phone').notEmpty().withMessage('Le téléphone est requis'),
    body('status').isIn(['Actif', 'En congé', 'Inactif']).withMessage('Statut invalide')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const { name, role, phone, status } = req.body;

        // Générer le matricule automatiquement
        const prefix = role === 'Chauffeur' ? 'CH' : 'CT';
        
        // Compter le nombre de membres avec ce poste pour générer le numéro
        // ✅ LIGNE MODIFIÉE
        const count = await crewCollection.countDocuments({ role: role });
        const matricule = `${prefix}-${String(count + 1).padStart(3, '0')}`;

        const newMember = {
            matricule: matricule,
            name: name,
            role: role,
            phone: phone,
            status: status,
            totalKm: 0,
            totalTrips: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // ✅ LIGNE MODIFIÉE
        const result = await crewCollection.insertOne(newMember);

        console.log(`✅ Nouveau membre ajouté: ${matricule} - ${name}`);

        res.status(201).json({
            success: true,
            message: `${role} ajouté avec succès`,
            member: { ...newMember, _id: result.insertedId }
        });

    } catch (error) {
        console.error("❌ Erreur ajout personnel:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});
// Modifier un membre du personnel
app.patch("/api/admin/crew/:id", authenticateToken, [
    body('name').optional().notEmpty(),
    body('phone').optional().notEmpty(),
    body('status').optional().isIn(['Actif', 'En congé', 'Inactif'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.phone) updates.phone = req.body.phone;
        if (req.body.status) updates.status = req.body.status;
        
        updates.updatedAt = new Date();

        // ✅ LIGNE MODIFIÉE
        const result = await crewCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Membre introuvable" });
        }

        console.log(`✅ Membre ${id} modifié`);

        res.json({
            success: true,
            message: "Informations mises à jour"
        });

    } catch (error) {
        console.error("❌ Erreur modification personnel:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Supprimer (désactiver) un membre du personnel
app.delete("/api/admin/crew/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // On ne supprime pas vraiment, on désactive
        // ✅ LIGNE MODIFIÉE
        const result = await crewCollection.updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: 'Inactif',
                    updatedAt: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Membre introuvable" });
        }

        console.log(`✅ Membre ${id} désactivé`);

        res.json({
            success: true,
            message: "Membre désactivé"
        });

    } catch (error) {
        console.error("❌ Erreur suppression personnel:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});



// Récupérer les détails d'un membre spécifique et son historique
app.get("/api/admin/crew/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID de membre invalide" });
        }

        // 1. Récupérer le profil du membre
        // ✅ LIGNE MODIFIÉE
        const member = await crewCollection.findOne({ _id: new ObjectId(id) });
        
        if (!member) {
            return res.status(404).json({ error: "Membre du personnel introuvable" });
        }

        // 2. Récupérer les 5 derniers voyages auxquels ce membre a été assigné
        // On cherche où son ID apparaît dans crew.drivers.id OU crew.controllers.id
        const recentTrips = await tripsCollection.find({
            $or: [
                { "crew.drivers.id": id },
                { "crew.controllers.id": id }
            ],
            // On ne prend que les voyages terminés pour l'historique
            "liveStatus.status": "ARRIVED" 
        })
        .sort({ date: -1 }) // Trie par date la plus récente
        .limit(5)           // Limite à 5 résultats
        .toArray();

        // 3. Formater l'historique pour le frontend
        const history = recentTrips.map(trip => ({
            date: trip.date,
            route: `${trip.route.from} → ${trip.route.to}`,
            busIdentifier: trip.busIdentifier,
            distance: trip.route.distance || 0
        }));

        res.json({
            success: true,
            member,
            history
        });

    } catch (error) {
        console.error("❌ Erreur récupération détails personnel:", error);
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
// 📄 GESTION DES FACTURES (INVOICES)
// ============================================

// Fonction qui génère le template HTML de la facture
function generateInvoiceHTML(reservation, lang = 'fr') {
  
    // Mini-traductions pour la facture
    const t = {
        fr: {
            title: "FACTURE",
            invoice_nr: "Facture N°",
            booking_nr: "Réf. Réservation",
            date: "Date d'émission",
            billed_to: "Facturé à",
            description: "Description",
            qty: "Qté",
            unit_price: "P.U.",
            total: "Total",
            subtotal: "Sous-total",
            vat: "TVA",
            total_paid: "TOTAL PAYÉ",
            payment_method: "Payé via",
            status_paid: "PAYÉE",
            adult_ticket_desc: "Billet(s) Adulte"  // ✅ Ajouté
        },
        en: {
            title: "INVOICE",
            invoice_nr: "Invoice #",
            booking_nr: "Booking Ref.",
            date: "Issue Date",
            billed_to: "Billed to",
            description: "Description",
            qty: "Qty",
            unit_price: "Unit Price",
            total: "Total",
            subtotal: "Subtotal",
            vat: "VAT",
            total_paid: "TOTAL PAID",
            payment_method: "Paid via",
            status_paid: "PAID",
            adult_ticket_desc: "Adult Ticket(s)"  // ✅ Ajouté
        }
    };
     
    // ✅ CORRECTION ICI : Utilise 't' pas 'translations'
    const texts = t[lang] || t.fr;
    
    const passenger = reservation.passengers[0];
    const adultTickets = reservation.passengers.length;
    const ticketPrice = reservation.route.price;
    const subtotal = reservation.totalPriceNumeric;

    return `
    <!DOCTYPE html>
    <html>
        <head><meta charset="utf-8"><style>body{font-family:sans-serif;color:#333;}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15);font-size:16px;line-height:24px;}.invoice-box table{width:100%;line-height:inherit;text-align:left;border-collapse:collapse;}.invoice-box table td{padding:5px;vertical-align:top;}.invoice-box table tr.top table td{padding-bottom:20px;}.invoice-box table tr.top table td.title{font-size:45px;line-height:45px;color:#333;}.invoice-box table tr.information table td{padding-bottom:40px;}.invoice-box table tr.heading td{background:#eee;border-bottom:1px solid #ddd;font-weight:700;}.invoice-box table tr.item td{border-bottom:1px solid #eee;}.invoice-box table tr.total td:nth-child(2){border-top:2px solid #eee;font-weight:700;}.status{font-size:1.5em;color:green;font-weight:bold;}</style></head>
        <body>
            <div class="invoice-box">
                <table>
                    <tr class="top">
                        <td colspan="4">
                            <table>
                                <tr>
                                    <td class="title">En-Bus</td>
                                    <td style="text-align:right;">
                                        ${texts.invoice_nr}: INV-${reservation.bookingNumber.slice(3)}<br>
                                        ${texts.date}: ${new Date(reservation.confirmedAt || reservation.createdAt).toLocaleDateString(lang)}<br>
                                        ${texts.booking_nr}: ${reservation.bookingNumber}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr class="information">
                        <td colspan="4">
                            <table>
                                <tr>
                                    <td>
                                        <strong>En-Bus SAS</strong><br>
                                        123 Avenue de la République<br>
                                        Brazzaville, Congo
                                    </td>
                                    <td style="text-align:right;">
                                        <strong>${texts.billed_to}</strong><br>
                                        ${passenger.name}<br>
                                        ${passenger.email || passenger.phone}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr class="heading">
                        <td>${texts.description}</td>
                        <td>${texts.qty}</td>
                        <td>${texts.unit_price}</td>
                        <td style="text-align:right;">${texts.total}</td>
                    </tr>
                    <tr class="item">
                        <td>${texts.adult_ticket_desc}: ${reservation.route.from} → ${reservation.route.to}</td>
                        <td>${adultTickets}</td>
                        <td>${ticketPrice} FCFA</td>
                        <td style="text-align:right;">${adultTickets * ticketPrice} FCFA</td>
                    </tr>
                    <tr class="total">
                        <td colspan="3" style="text-align:right;"><strong>${texts.subtotal}</strong></td>
                        <td style="text-align:right;">${subtotal} FCFA</td>
                    </tr>
                    <tr class="total">
                        <td colspan="3" style="text-align:right;"><strong>${texts.vat} (0%)</strong></td>
                        <td style="text-align:right;">0 FCFA</td>
                    </tr>
                    <tr class="total">
                        <td colspan="3" style="text-align:right;"><strong>${texts.total_paid}</strong></td>
                        <td style="text-align:right;"><strong>${reservation.totalPrice}</strong></td>
                    </tr>
                </table>
                <div style="text-align:center; margin-top: 40px;">
                    <p><strong>${texts.payment_method}:</strong> ${reservation.paymentMethod}</p>
                    <p class="status">${texts.status_paid}</p>
                </div>
            </div>
        </body>
    </html>
    `;
}

// Route pour générer et télécharger une facture
app.get('/api/reservations/:bookingNumber/invoice', async (req, res) => {
    try {
        const { bookingNumber } = req.params;
        const lang = req.query.lang || 'fr'; // Récupère la langue depuis l'URL

        const reservation = await reservationsCollection.findOne({ bookingNumber });

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }
        
        if (reservation.status !== 'Confirmé') {
            return res.status(403).send('Invoice is only available for confirmed bookings.');
        }

        const htmlContent = generateInvoiceHTML(reservation, lang);
        
        const html_pdf = require('html-pdf-node');
                const options = { 
            format: 'A4',
            // ✅ AJOUTER CETTE PARTIE POUR LA COMPATIBILITÉ SERVEUR
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        }; 
        const file = { content: htmlContent };
        
        html_pdf.generatePdf(file, options).then(pdfBuffer => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=facture-${bookingNumber}.pdf`);
            res.send(pdfBuffer);
        });

    } catch (error) {
        console.error("❌ Erreur génération facture:", error);
        res.status(500).send('Server Error');
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


// server.js

app.post(
  "/api/admin/trips",
  authenticateToken,
  [
    // ... tes validations existantes ...
    body("routeId").notEmpty().withMessage("Le modèle de trajet est requis."),
    body("startDate").isISO8601().withMessage("La date de début est invalide."),
    body("endDate").isISO8601().withMessage("La date de fin est invalide."),
    body("daysOfWeek").isArray({ min: 1 }).withMessage("Au moins un jour de la semaine doit être sélectionné."),
    body("seatCount").isInt({ min: 10, max: 100 }).withMessage("Le nombre de sièges doit être entre 10 et 100."),
    body("busIdentifier").optional({ checkFalsy: true }).isString().trim(),
    body('highlightBadge').optional({ checkFalsy: true }).isString().trim(),
    
    // ✅ NOUVELLES VALIDATIONS AJOUTÉES
    body("isNightTrip").isBoolean().withMessage("Le statut de voyage de nuit doit être un booléen."),
    body("arrivalDaysOffset").isInt({ min: 0, max: 5 }).withMessage("Le décalage de jour d'arrivée est invalide.")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    
    try {
      // ✅ RÉCUPÉRATION DES NOUVELLES DONNÉES
      const {
        routeId,
        startDate,
        endDate,
        daysOfWeek,
        seatCount,
        busIdentifier,
        highlightBadge,
        driver1Id,
        driver1Name,
        driver2Id,
        driver2Name,
        controller1Id,
        controller1Name,
        controller2Id,
        controller2Name,
        isNightTrip,         // <-- Nouveau
        arrivalDaysOffset    // <-- Nouveau
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
      
      const drivers = [];
      if (driver1Id) drivers.push({ id: driver1Id, name: driver1Name });
      if (driver2Id) drivers.push({ id: driver2Id, name: driver2Name });

      const controllers = [];
      if (controller1Id) controllers.push({ id: controller1Id, name: controller1Name });
      if (controller2Id) controllers.push({ id: controller2Id, name: controller2Name });

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
            crew: {
                drivers: drivers.length > 0 ? drivers : null,
                controllers: controllers.length > 0 ? controllers : null
            },
            createdAt: new Date(),

            // ✅ AJOUT DES NOUVEAUX CHAMPS DANS LE DOCUMENT
            isNightTrip: isNightTrip || false,
            arrivalDaysOffset: parseInt(arrivalDaysOffset) || 0
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
    // On supprime .isString() pour accepter aussi les tableaux
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


// ============================================
// ❌ REFUSER DEMANDE REPORT (ROUTE REQUISE)
// ============================================
app.post("/api/admin/report-requests/:bookingNumber/reject", authenticateToken, async (req, res) => {
    try {
        const { bookingNumber } = req.params;
        
        console.log(`🚫 Tentative de refus pour ${bookingNumber}`);

        // 1. Trouver la réservation en attente
        const reservation = await reservationsCollection.findOne({ bookingNumber, status: "En attente de report" });
        
        if (!reservation) {
            return res.status(404).json({ error: "Demande introuvable ou déjà traitée." });
        }

        // 2. Remettre l'ancien statut "Confirmé"
        // (On annule juste la demande, le billet original reste valide)
        await reservationsCollection.updateOne(
            { _id: reservation._id },
            { 
                $set: { 
                    status: "Confirmé", // Retour au statut normal
                    "reportRequest.status": "Refusé",
                    "reportRequest.rejectedAt": new Date(),
                    "reportRequest.rejectedBy": req.user.username
                } 
            }
        );

        res.json({ success: true, message: "Demande refusée. Le billet original reste valide." });

    } catch (error) {
        console.error("Erreur refus report:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});


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

// ============================================
// ⚙️ ENREGISTRER LES PARAMÈTRES (ROBUSTE)
// ============================================
app.patch("/api/admin/settings/report", authenticateToken, [
    body('secondReportFee').isInt(),
    body('thirdReportFee').isInt(),
    body('maxReportsAllowed').isInt(),
    body('minHoursBeforeDeparture').isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Données invalides." });
    }

    try {
        const newSettingsValue = {
            // On s'assure que les valeurs sont bien des nombres
            secondReportFee: parseInt(req.body.secondReportFee),
            thirdReportFee: parseInt(req.body.thirdReportFee),
            maxReportsAllowed: parseInt(req.body.maxReportsAllowed),
            minHoursBeforeDeparture: parseInt(req.body.minHoursBeforeDeparture),
            // On peut ajouter la valeur par défaut pour firstReportFree
            firstReportFree: true 
        };

        // Requête MongoDB simplifiée : on remplace tout l'objet 'value'
        await systemSettingsCollection.updateOne(
            { key: "reportSettings" },
            { 
                $set: { 
                    value: newSettingsValue, // Remplace tout l'objet d'un coup
                    updatedAt: new Date(),
                    updatedBy: req.user.username 
                } 
            },
            { upsert: true } // Crée le document s'il n'existe pas
        );
        
        console.log("✅ Paramètres mis à jour par", req.user.username);
        res.json({ success: true, message: "Paramètres mis à jour." });

    } catch (error) {
        console.error("Erreur sauvegarde settings:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

// ICI
// ============================================
// --- ROUTES ADMIN (Suite) ---
// ============================================

// --- D. Routes d'action spécifiques (PATCH) ---
app.patch("/api/admin/trips/:tripId/status", authenticateToken, [
    body('status').isIn(['ON_TIME', 'DELAYED', 'CANCELLED', 'ARRIVED', 'MAINTENANCE']),
    body('delayMinutes').if(body('status').equals('DELAYED')).isInt({ min: 1 }).withMessage('Le retard doit être un nombre positif.'),
    body('reason').if(body('status').equals('CANCELLED') || body('status').equals('MAINTENANCE')).notEmpty().withMessage('La raison est requise pour cette action.'),
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

        // ==========================================================
        // ✅ BLOC DE MISE À JOUR DES STATS (PLACÉ AU BON ENDROIT)
        // ==========================================================
        if (status === 'ARRIVED') {
            console.log(`🏁 Voyage ${tripId} marqué "Arrivé". Tentative de mise à jour des stats...`);
            
            const trip = await tripsCollection.findOne({ _id: new ObjectId(tripId) });
            const distance = trip?.route?.distance;
            const crew = trip?.crew;

            if (!distance) console.log(`   -> ⚠️ Distance non trouvée pour ce voyage.`);
            if (!crew || (!crew.drivers && !crew.controllers)) console.log(`   -> ⚠️ Équipage non trouvé pour ce voyage.`);

            if (distance && crew && (crew.drivers || crew.controllers)) {
                const crewMembers = [...(crew.drivers || []), ...(crew.controllers || [])];

                if (crewMembers.length > 0) {
                    const crewIds = crewMembers
                        .map(member => member.id)
                        .filter(id => id && ObjectId.isValid(id))
                        .map(id => new ObjectId(id));
                    
                    console.log(`   -> IDs de l'équipage à mettre à jour:`, crewIds);
                    
                    if (crewIds.length > 0) {
                        const updateResult = await dbClient.db("en-bus-db").collection('crew').updateMany(
                            { _id: { $in: crewIds } },
                            { $inc: { totalTrips: 1, totalKm: distance } }
                        );
                        console.log(`   -> ✅ Succès ! ${updateResult.modifiedCount} membre(s) d'équipage mis à jour.`);
                    }
                }
            } else {
                console.log('   -> ❌ Mise à jour des stats ignorée (données manquantes).');
            }
        }
        // ==========================================================

        console.log(`📢 Statut du voyage ${tripId} mis à jour : ${status}`);
        res.json({ success: true, message: `Statut du voyage mis à jour : ${status}` });

    } catch (error) {
        console.error("❌ Erreur mise à jour statut voyage:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});


// ============================================
// ✅ ROUTE MANQUANTE : MODIFIER UN VOYAGE (DATE, BUS, ETC.)
// ============================================
app.patch("/api/admin/trips/:id", authenticateToken, [
    body('date').optional().isISO8601().withMessage('Format de date invalide'),
    body('busIdentifier').optional().isString().trim(),
    body('highlightBadge').optional().isString().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        const { id } = req.params;
        const updates = req.body; // Contient { date: "...", busIdentifier: "..." }

        // Vérification de l'ID
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID de voyage invalide." });
        }

        // On nettoie l'objet updates pour ne pas écraser l'ID par erreur
        delete updates._id;

        // Mise à jour dans la base de données
        const result = await tripsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updates, updatedAt: new Date() } } // On met à jour les champs envoyés
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Voyage introuvable." });
        }

        console.log(`✅ Voyage ${id} mis à jour avec succès.`);
        res.json({ success: true, message: "Voyage mis à jour." });

    } catch (error) {
        console.error("❌ Erreur lors de la modification du voyage:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

// Modifier l'équipage d'un voyage spécifique
app.patch("/api/admin/trips/:tripId/crew", authenticateToken, async (req, res) => {
    try {
        const { tripId } = req.params;
        const {
            driver1Id, driver1Name, driver2Id, driver2Name,
            controller1Id, controller1Name, controller2Id, controller2Name
        } = req.body;

        if (!ObjectId.isValid(tripId)) {
            return res.status(400).json({ error: "ID de voyage invalide." });
        }

        const drivers = [];
        if (driver1Id) drivers.push({ id: driver1Id, name: driver1Name });
        if (driver2Id) drivers.push({ id: driver2Id, name: driver2Name });

        const controllers = [];
        if (controller1Id) controllers.push({ id: controller1Id, name: controller1Name });
        if (controller2Id) controllers.push({ id: controller2Id, name: controller2Name });

        const newCrewObject = {
            drivers: drivers.length > 0 ? drivers : null,
            controllers: controllers.length > 0 ? controllers : null
        };

        const result = await tripsCollection.updateOne(
            { _id: new ObjectId(tripId) },
            { $set: { crew: newCrewObject } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Voyage introuvable." });
        }

        console.log(`✅ Équipage du voyage ${tripId} mis à jour.`);
        res.json({ success: true, message: "Équipage mis à jour avec succès." });

    } catch (error) {
        console.error("❌ Erreur mise à jour équipage:", error);
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



// --- ROUTES ADMIN NOTIFICATIONS ---

// 1. Envoyer à TOUS les utilisateurs (ceux qui ont un token)
app.post('/api/admin/notifications/send-to-all', authenticateToken, async (req, res) => {
    const { title, body } = req.body;
    try {
        const tokens = await getDb().collection('reservations').distinct('fcmToken', { fcmToken: { $exists: true } });
        const count = await sendPush(tokens, title, body);
        res.json({ success: true, message: `${count} notifications envoyées.` });
    } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// 2. Envoyer aux passagers d'un VOYAGE spécifique
app.post('/api/admin/notifications/send-to-trip/:tripId', authenticateToken, async (req, res) => {
    const { title, body } = req.body;
    try {
        const tokens = await getDb().collection('reservations').distinct('fcmToken', { 
            'route.id': req.params.tripId, 
            fcmToken: { $exists: true } 
        });
        const count = await sendPush(tokens, title, body);
        res.json({ success: true, message: `${count} notifications envoyées.` });
    } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// 3. Envoyer à une RÉSERVATION spécifique
app.post('/api/admin/notifications/send-to-booking/:bookingNumber', authenticateToken, async (req, res) => {
    const { title, body } = req.body;
    try {
        const reser = await getDb().collection('reservations').findOne({ bookingNumber: req.params.bookingNumber });
        if (!reser?.fcmToken) return res.status(404).json({ error: "Pas de token pour ce client." });
        
        await sendPush([reser.fcmToken], title, body);
        res.json({ success: true, message: "Notification envoyée." });
    } catch (e) { res.status(500).json({ error: "Erreur serveur" }); }
});

// 4. Mise à jour de la route d'enregistrement (Client)
app.post('/api/notifications/register', async (req, res) => {
    const { token, bookingNumber, busId } = req.body;
    await registerToken(token, bookingNumber, busId);
    res.json({ success: true });
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
// server.js - à la fin du fichier

// --- Démarrage ---
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    // 1. On se connecte à la base de données
    await connectToDb();
    console.log("✅ Connexion à la DB réussie depuis server.js.");

    // 2. ✅ ON REMPLIT LES VARIABLES GLOBALES
    const db = getDb();
    reservationsCollection = db.collection("reservations");
    tripsCollection = db.collection("trips");
    routeTemplatesCollection = db.collection("route_templates");
    destinationsCollection = db.collection("destinations");
    systemSettingsCollection = db.collection("system_settings");
    positionsCollection = db.collection("positions");
    crewCollection = db.collection("crew");
    
    console.log("✅ Collections MongoDB assignées aux variables globales.");

    // 3. On démarre le serveur
    server.listen(PORT, () =>
      console.log(`\n🚀 Backend En-Bus démarré sur le port ${PORT}\n`)
    );
  } catch (error) {
    console.error("❌ Échec critique du démarrage du serveur:", error);
    process.exit(1);
  }
})();