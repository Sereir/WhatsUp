const Sentry = require('@sentry/node');
const logger = require('../utils/logger');

/**
 * Initialiser Sentry pour le monitoring des erreurs
 */
const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0
    });
    
    logger.info('Sentry initialisé');
  } else {
    logger.info('Sentry désactivé (mode développement ou DSN manquant)');
  }
};

module.exports = { initSentry, Sentry };
