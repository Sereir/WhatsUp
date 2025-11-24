require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Fonction de d�marrage
const startServer = async () => {
  try {
    // 1. Connexion � MongoDB
    await connectDB();
    
    // 2. D�marrer le serveur
    const server = app.listen(PORT, () => {
      logger.info('Serveur d�marr� sur le port ' + PORT);
      logger.info('Environnement: ' + (process.env.NODE_ENV || 'development'));
      console.log('\n Serveur d�marr� sur le port ' + PORT);
      console.log(' URL: http://localhost:' + PORT);
      console.log(' Environnement: ' + (process.env.NODE_ENV || 'development') + '\n');
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Arr�t du serveur...');
      server.close(() => {
        logger.info('Serveur arr�t� proprement');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Erreur au d�marrage:', error);
    console.error(' Erreur au d�marrage:', error);
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
