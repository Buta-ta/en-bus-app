// database.js
const { MongoClient } = require("mongodb");

let dbInstance = null;

async function connectToDb() {
  if (dbInstance) return dbInstance;

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    dbInstance = client.db("en-bus-db");
    console.log("🔗 Connexion MongoDB partagée établie.");

    // --- ON DÉPLACE LA LOGIQUE D'INITIALISATION ICI ---
    console.log("🚀 Initialisation de la base de données...");

    // Création des index
    await dbInstance.collection("trips").createIndex({ date: 1, "route.from": 1, "route.to": 1 });
    await dbInstance.collection("destinations").createIndex({ name: 1 });
    console.log("   -> Index assurés.");

    // Initialisation des paramètres
    const existingSettings = await dbInstance.collection("system_settings").findOne({ key: "reportSettings" });
    if (!existingSettings) {
      await dbInstance.collection("system_settings").insertOne({
        key: "reportSettings",
        value: {
            firstReportFree: true,
            secondReportFee: 2000,
            thirdReportFee: 5000,
            maxReportsAllowed: 3,
            minHoursBeforeDeparture: 48,
            maxDaysInFuture: 60
        },
        createdAt: new Date(),
        updatedBy: "system"
      });
      console.log("   -> Paramètres de report initialisés.");
    }

    // Peuplement initial des villes
    const destinationsCount = await dbInstance.collection("destinations").countDocuments();
    if (destinationsCount === 0) {
      console.log("   -> Peuplement initial des destinations...");
      const initialCities = [
        { name: "Brazzaville", country: "Congo", coords: [-4.2634, 15.2429], isActive: true, createdAt: new Date() },
        { name: "Pointe-Noire", country: "Congo", coords: [-4.7761, 11.8636], isActive: true, createdAt: new Date() },
        // ... (ajoute les autres villes si nécessaire)
      ];
      await dbInstance.collection("destinations").insertMany(initialCities);
      console.log(`   -> ${initialCities.length} destinations ajoutées.`);
    }
    
    console.log("✅ Initialisation de la DB terminée.");
    // ----------------------------------------------------

    return dbInstance;
  } catch (error) {
    console.error("❌ Erreur de connexion ou d'initialisation DB:", error);
    process.exit(1);
  }
}

function getDb() {
  if (!dbInstance) throw new Error("Base de données non initialisée !");
  return dbInstance;
}

module.exports = { connectToDb, getDb };