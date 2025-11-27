/**
 * Configuration de la base de données en mémoire pour les tests
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Connecte à la base de données en mémoire
 */
const connectDatabase = async () => {
  // Fermer toute connexion existante
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Créer un nouveau serveur MongoDB en mémoire
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Stocker la connexion globalement pour les tests
  global.__MONGOOSE__ = mongoose;
};

/**
 * Vide toutes les collections
 */
const clearDatabase = async () => {
  if (!mongoose.connection.db) return;

  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Ferme la connexion et arrête le serveur
 */
const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  connectDatabase,
  clearDatabase,
  closeDatabase
};
