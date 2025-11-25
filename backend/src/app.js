const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const logger = require('./utils/logger');
const { initSentry, Sentry } = require('./config/sentry');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Initialiser Sentry AVANT Express
initSentry();

const app = express();

// Sentry request handler (doit être le premier middleware)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization MongoDB
app.use(mongoSanitize());

// Rate limiting global
app.use('/api/', apiLimiter);

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
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      contacts: '/api/contacts',
      sessions: '/api/sessions',
      conversations: '/api/conversations',
      messages: '/api/messages',
      notifications: '/api/notifications',
      sync: '/api/sync',
      securityAlerts: '/api/security-alerts'
    }
  });
});

// Routes API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/contacts', require('./routes/contact.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/conversations', require('./routes/conversation.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/sync', require('./routes/sync.routes'));
app.use('/api/security-alerts', require('./routes/securityAlert.routes'));

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
