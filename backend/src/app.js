const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./utils/logger');
const { initSentry, Sentry } = require('./config/sentry');

// Initialiser Sentry AVANT Express
initSentry();

const app = express();

// Sentry request handler (doit être le premier middleware)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Middlewares de base
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));

// Route de test
app.get('/health', (req, res) => {
  logger.info('Health check');
  res.status(200).json({
    status: 'OK',
    message: 'Serveur fonctionne !',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API WhatsUp !',
    version: '1.0.0',
    endpoints: {
      health: '/health'
    }
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.originalUrl}`
  });
});

// Sentry error handler (doit être avant le error handler custom)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  logger.error('Erreur:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
