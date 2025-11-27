// ============================================
// 🚀 EN-BUS BACKEND - VERSION FINALE ET CORRIGÉE
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
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz');
const { fr, enUS } = require('date-fns/locale');
const translations = require("./emailTranslations.js");

// --- Validation des variables d'environnement ---
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD_HASH", "RESEND_API_KEY", "EMAIL_FROM_ADDRESS", "ALLOWED_ORIGINS"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error("❌ Variables d'environnement manquantes:", missingEnvVars.join(", "));
  process.exit(1);
}
console.log("✅ Variables d'environnement validées.");

// --- Configuration Express & Sécurité ---
const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// --- Rate Limiting ---
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const strictLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: "Trop de tentatives. Réessayez dans 15 minutes." } });
app.use("/api/", generalLimiter);

// --- Configuration Services (Email, DB) ---
const resend = new Resend(process.env.RESEND_API_KEY);
const dbClient = new MongoClient(process.env.MONGODB_URI);
let reservationsCollection, positionsCollection, tripsCollection, routeTemplatesCollection, systemSettingsCollection, destinationsCollection;

async function connectToDb() {
  try {
    await dbClient.connect();
    const database = dbClient.db("en-bus-db");
    reservationsCollection = database.collection("reservations");
    positionsCollection = database.collection("positions");
    tripsCollection = database.collection("trips");
    routeTemplatesCollection = database.collection("route_templates");
    systemSettingsCollection = database.collection("system_settings");
    destinationsCollection = database.collection("destinations");
    await tripsCollection.createIndex({ date: 1, "route.from": 1, "route.to": 1 });
    await destinationsCollection.createIndex({ name: 1 });

    const settingsCount = await systemSettingsCollection.countDocuments({ key: "reportSettings" });
    if (settingsCount === 0) {
      await systemSettingsCollection.insertOne({ key: "reportSettings", value: { firstReportFree: true, secondReportFee: 2000, thirdReportFee: 5000, maxReportsAllowed: 3, minHoursBeforeDeparture: 48, maxDaysInFuture: 30 }, createdAt: new Date(), updatedBy: "system" });
      console.log("✅ Paramètres de report initialisés.");
    }

    const destinationsCount = await destinationsCollection.countDocuments();
    if (destinationsCount === 0) {
        console.log("🏙️  Peuplement initial de la collection 'destinations'...");
        const initialCities = [ { name: "Brazzaville", country: "Congo", coords: [-4.2634, 15.2429], isActive: true, createdAt: new Date() }, { name: "Pointe-Noire", country: "Congo", coords: [-4.7761, 11.8636], isActive: true, createdAt: new Date() }, { name: "Dolisie", country: "Congo", coords: [-4.2064, 12.6686], isActive: true, createdAt: new Date() }, { name: "Yaoundé", country: "Cameroun", coords: [3.8480, 11.5021], isActive: true, createdAt: new Date() }, { name: "Douala", country: "Cameroun", coords: [4.0511, 9.7679], isActive: true, createdAt: new Date() }, { name: "Libreville", country: "Gabon", coords: [0.4162, 9.4673], isActive: true, createdAt: new Date() }, { name: "Lagos", country: "Nigeria", coords: [6.5244, 3.3792], isActive: true, createdAt: new Date() }, { name: "Abidjan", country: "Côte d'Ivoire", coords: [5.3599, -4.0083], isActive: true, createdAt: new Date() } ];
        await destinationsCollection.insertMany(initialCities);
        console.log(`✅ ${initialCities.length} destinations initiales ajoutées.`);
    }
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
    const translation = translations[lang] || translations.fr;
    return `<!DOCTYPE html><html lang="${lang}"><head>...</head><body><div class="container"><div class="header"><h2>${headerTitle}</h2></div><div class="content">${content}<p>${translation.email_thanks}<br>${translation.email_team}</p></div><div class="footer"><p>${translation.footer_copyright}</p><p><a href="#">${translation.nav_contact}</a> | <a href="#">${translation.nav_my_bookings}</a></p></div></div></body></html>`;
};

async function sendEmail(to, subject, htmlContent, headerTitle, lang = 'fr') {
    if (!process.env.RESEND_API_KEY) { console.warn("⚠️ Clé API Resend manquante. Envoi simulé."); return; }
    try {
        const { data, error } = await resend.emails.send({ from: process.env.EMAIL_FROM_ADDRESS, to: [to], subject: subject, html: emailTemplate(htmlContent, headerTitle, lang) });
        if (error) throw new Error(error.message);
        console.log(`✅ Email envoyé à ${to}. ID: ${data.id}`);
    } catch (e) { console.error("❌ Erreur critique sendEmail:", e.message); }
}

function sendPendingPaymentEmail(reservation) {
    const client = reservation.passengers?.[0]; if (!client?.email) return;
    const lang = reservation.lang || 'fr'; const translation = translations[lang] || translations.fr;
    const subject = translation.email_pending_subject(reservation.bookingNumber);
    const headerTitle = translation.email_pending_title;
    const deadline = format(utcToZonedTime(new Date(reservation.paymentDeadline), 'Africa/Brazzaville'), "PPPP p", { locale: lang === 'en' ? enUS : fr });
    let paymentInstructions = reservation.paymentMethod === 'AGENCY'
      ? `<p>${translation.email_pending_agency_cta}</p><div class="code-box"><h4 class="code-box-title">${translation.email_pending_agency_code_label}</h4><p class="code-box-code">${reservation.agencyPaymentCode}</p></div>`
      : `<p>${translation.email_pending_mm_cta(reservation.totalPrice, reservation.bookingNumber)}</p>`;
    const htmlContent = `<h2>${translation.email_greeting(client.name)}</h2><p>${translation.email_pending_intro(reservation.route.from, reservation.route.to)}</p>${paymentInstructions}<p style="color: #c62828;">${translation.email_pending_deadline_warning(deadline)}</p>`;
    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}

function sendPaymentConfirmedEmail(reservation) {
    const client = reservation.passengers?.[0]; if (!client?.email) return;
    const lang = reservation.lang || 'fr'; const translation = translations[lang] || translations.fr;
    const subject = translation.email_confirmed_subject(reservation.bookingNumber);
    const headerTitle = translation.email_confirmed_title;
    const departureDateTime = format(utcToZonedTime(new Date(`${reservation.date}T${reservation.route.departure}`), 'Africa/Brazzaville'), "PPPP 'à' p", { locale: lang === 'en' ? enUS : fr });
    const htmlContent = `<h2>${translation.email_greeting(client.name)}</h2><p>${translation.email_confirmed_intro}</p><div class="info-box"><strong>${translation.email_confirmed_details_trip}</strong><span>${reservation.route.from} → ${reservation.route.to}</span></div><div class="info-box"><strong>${translation.email_confirmed_details_date}</strong><span>${departureDateTime}</span></div><p>${translation.email_confirmed_cta}</p><a href="${process.env.FRONTEND_URL || '#'}" class="button">${translation.email_confirmed_button}</a><p>${translation.email_confirmed_outro}</p>`;
    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}

function sendReportConfirmedEmail(oldReservation, newReservation) {
    const client = newReservation.passengers?.[0]; if (!client?.email) return;
    const lang = newReservation.lang || 'fr'; const translation = translations[lang] || translations.fr;
    const subject = translation.email_report_subject(newReservation.bookingNumber);
    const headerTitle = translation.email_report_title;
    const oldDate = new Date(oldReservation.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR');
    const newDate = new Date(newReservation.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const htmlContent = `<h2>${translation.email_greeting(client.name)}</h2><p>${translation.email_report_intro}</p><div class="info-box" style="background-color:#ffebee; border-left-color:#e57373;"><strong style="color:#c62828;">${translation.email_report_old_trip_label}</strong>${translation.email_report_old_trip_date(oldDate)} - Billet ${oldReservation.bookingNumber} <em>${translation.email_report_old_trip_invalid}</em></div><div class="booking-number"><div class="booking-label">${translation.email_report_new_trip_label}</div><div class="booking-value">${newReservation.bookingNumber}</div></div><p>${translation.email_report_outro}</p>`;
    sendEmail(client.email, subject, htmlContent, headerTitle, lang);
}

// --- Middleware & Utilitaires ---
// ... (authenticateToken et generateBookingNumber)

// ============================================
// === ROUTES API (Réorganisées pour la priorité)
// ============================================

// --- Routes Publiques ---
app.get("/api/version", (req, res) => res.json({ version: "2025-01-18-FINAL" }));
app.get("/api/destinations", async (req, res) => { /* ... */ });
app.get("/api/popular-destinations", async (req, res) => { /* ... */ });
app.get("/api/route-templates", async (req, res) => { /* ... */ });
app.get("/api/search", async (req, res) => { /* ... */ });
app.get("/api/trips/:id/seats", async (req, res) => { /* ... */ });
app.get("/api/reservations/check/:bookingNumber", async (req, res) => { /* ... */ });
app.get("/api/reservations/details", async (req, res) => { /* ... */ });
app.get("/api/reservations/:bookingNumber", async (req, res) => { /* ... */ });
app.post("/api/reservations", /* ... */ );
app.patch('/api/reservations/:bookingNumber/transaction-id', /* ... */ );

// --- Routes de Report Client ---
app.get("/api/reservations/:bookingNumber/can-report", async (req, res) => { /* ... */ });
app.get("/api/reservations/:bookingNumber/available-trips", async (req, res) => { /* ... */ });
app.post("/api/reservations/:bookingNumber/calculate-report-cost", /* ... */ );
app.post("/api/reservations/:bookingNumber/confirm-report", /* ... */ );

// --- Routes Admin (spécifiques en premier) ---
app.post("/api/admin/login", loginLimiter, /* ... */ );
app.get("/api/admin/verify", authenticateToken, (req, res) => res.json({ valid: true, user: req.user }));

// Routes de liste GET
app.get("/api/admin/reservations", authenticateToken, /* ... */ );
app.get("/api/admin/route-templates", authenticateToken, /* ... */ );
app.get("/api/admin/trips", authenticateToken, /* ... */ );
app.get("/api/admin/destinations", authenticateToken, /* ... */ );
app.get("/api/admin/reports/history", authenticateToken, /* ... */ );
app.get("/api/admin/settings/report", authenticateToken, /* ... */ );

// Routes de création POST
app.post("/api/admin/route-templates", authenticateToken, /* ... */ );
app.post("/api/admin/trips", authenticateToken, /* ... */ );
app.post("/api/admin/destinations", authenticateToken, /* ... */ );
app.post("/api/admin/report-requests/:bookingNumber/approve", authenticateToken, /* ... */ );

// Routes de mise à jour PATCH (plus spécifiques d'abord)
app.patch("/api/admin/trips/:id/reset-seats", authenticateToken, /* ... */ );
app.patch("/api/admin/route-templates/:id/toggle-popular", authenticateToken, /* ... */ );
app.patch("/api/admin/trips/:tripId/seats/:seatNumber", authenticateToken, /* ... */ );
app.patch("/api/admin/reservations/:id/seats", authenticateToken, /* ... */ );
app.patch("/api/admin/settings/report", authenticateToken, /* ... */ );

// Routes de suppression DELETE
app.delete("/api/admin/route-templates/:id", authenticateToken, /* ... */ );
app.delete("/api/admin/trips/:id", authenticateToken, /* ... */ );
app.delete("/api/admin/destinations/:id", authenticateToken, /* ... */ );
app.delete("/api/admin/report-requests/:bookingNumber", authenticateToken, /* ... */ );

// Route admin la plus générique en dernier
app.patch("/api/admin/reservations/:id/:action", authenticateToken, /* ... */ );


// --- CRON JOB & WEBSOCKET ---
// ... (code cron et websocket)

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


// --- Démarrage ---
const PORT = process.env.PORT || 3000;
(async () => {
  await connectToDb();
  server.listen(PORT, () => console.log(`\n🚀 Backend démarré sur le port ${PORT}\n`));
})();