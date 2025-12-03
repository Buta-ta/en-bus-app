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
        return dbInstance;
    } catch (error) {
        console.error("❌ Erreur de connexion DB:", error);
        process.exit(1);
    }
}

function getDb() {
    if (!dbInstance) throw new Error("Base de données non initialisée !");
    return dbInstance;
}

module.exports = { connectToDb, getDb };