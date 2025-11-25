require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initializeSocket } = require('./config/socket');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Fonction de démarrage
const startServer = async () => {
  try {
    // 1. Connexion à MongoDB
    await connectDB(); 
    
    // 2. Créer serveur HTTP
    const server = http.createServer(app);
    
    // 3. Initialiser Socket.io
    const io = initializeSocket(server);
    
    // Attacher io à l'app pour y accéder depuis les controllers
    app.set('io', io);
    
    // 4. Démarrer le serveur
    server.listen(PORT, () => {
      logger.info('Serveur démarré sur le port  ' + PORT);
      logger.info('Environnement: ' + (process.env.NODE_ENV || 'development'));
      logger.info('WebSocket (Socket.io) activé');
      console.log('\n✅ Serveur démarré sur le port ' + PORT);
      console.log('🌐 URL: http://localhost:' + PORT);
      console.log('🔌 WebSocket: ws://localhost:' + PORT);
      console.log('📁 Environnement: ' + (process.env.NODE_ENV || 'development') + '\n');
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Arrêt du serveur...');
      io.close(() => {
        logger.info('Socket.io fermé');
      });
      server.close(() => {
        logger.info('Serveur arrêté proprement');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Erreur au démarrage:', error);
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
};

// D�marrer
startServer();

// Gestion des erreurs non captur�es
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error(' Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error(' Uncaught Exception:', err);
  process.exit(1);
});
