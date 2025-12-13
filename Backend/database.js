// database.js
const { MongoClient, ObjectId } = require("mongodb"); // ✅ Assurez-vous que ObjectId est importé

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

    // Création des index (inchangé)
    await dbInstance.collection("trips").createIndex({ date: 1, "route.from": 1, "route.to": 1 });
    await dbInstance.collection("destinations").createIndex({ name: 1 });
    console.log("   -> Index assurés.");

    // Initialisation des paramètres (inchangé)
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

    // Peuplement initial des villes (inchangé)
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

    // ==========================================================
    // ✅ NOUVEAU BLOC : INITIALISATION DE LA COLLECTION 'agencies'
    // ==========================================================
    console.log("   -> Vérification de la collection 'agencies'...");
    const agenciesCollection = dbInstance.collection("agencies");
    const agenciesCount = await agenciesCollection.countDocuments();

    // Si la collection 'agencies' est vide, on la peuple avec des données de départ.
    if (agenciesCount === 0) {
        console.log("   -> Collection 'agencies' vide. Peuplement initial...");
        
        const initialAgencies = [
            {
                name: "Agence Principale de Ouenzé",
                city: "Brazzaville",
                address: "123 Avenue des Plateaux, Ouenzé, Brazzaville",
                phone: "+242 06 123 4567",
                coords: { lat: -4.25, lon: 15.28 },
                openingHours: "Lun-Sam: 07h-19h, Dim: 08h-14h",
                managerId: null,
                status: "active",
                createdAt: new Date()
            },
            {
                name: "Agence du Grand Marché",
                city: "Pointe-Noire",
                address: "Avenue Charles de Gaulle, en face du Grand Marché",
                phone: "+242 05 765 4321",
                coords: { lat: -4.78, lon: 11.86 },
                openingHours: "Lun-Sam: 07h-18h",
                managerId: null,
                status: "active",
                createdAt: new Date()
            },
            {
                name: "Agence de la Gare Routière",
                city: "Dolisie",
                address: "Près de la gare routière principale",
                phone: "+242 04 555 8899",
                coords: { lat: -4.20, lon: 12.67 },
                openingHours: "Lun-Sam: 08h-17h",
                managerId: null,
                status: "active",
                createdAt: new Date()
            }
        ];

        await agenciesCollection.insertMany(initialAgencies);
        console.log(`   -> ✅ ${initialAgencies.length} agences initiales créées.`);
    } else {
        console.log("   -> Collection 'agencies' déjà existante. Aucune action requise.");
    }
    // ==========================================================
    
    console.log("✅ Initialisation de la DB terminée.");
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