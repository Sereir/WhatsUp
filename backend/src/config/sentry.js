const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const logger = require('../utils/logger');

/**
 * Initialiser Sentry pour le monitoring des erreurs
 */
const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Taux d'échantillonnage pour les traces de performance
      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE || 0.5,
      
      // Taux d'échantillonnage pour le profiling
      profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE || 0.5,
      
      // Intégrations
      integrations: [
        new ProfilingIntegration(),
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: true }),
        new Sentry.Integrations.Mongo({
          useMongoose: true,
          operations: ['aggregate', 'find', 'findOne', 'update', 'delete']
        })
      ],
      
      // Filtrer les données sensibles
      beforeSend(event, hint) {
        // Ne pas envoyer les tokens ou mots de passe
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
        }
        
        // Filtrer les données sensibles dans les breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data && breadcrumb.data.password) {
              breadcrumb.data.password = '[Filtered]';
            }
            return breadcrumb;
          });
        }
        
        return event;
      },
      
      // Ignorer certaines erreurs
      ignoreErrors: [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ValidationError',
        'CastError'
      ],
      
      // Limiter la taille du breadcrumb
      maxBreadcrumbs: 50,
      
      // Activer la capture automatique des requêtes
      autoSessionTracking: true,
      
      // Release version
      release: process.env.npm_package_version || '1.0.0'
    });
    
    logger.info('Sentry initialisé avec profiling et tracing');
  } else {
    logger.info('Sentry désactivé (mode développement ou DSN manquant)');
  }
};

/**
 * Ajouter le contexte utilisateur à Sentry
 */
const setSentryUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user._id.toString(),
      email: user.email,
      username: `${user.firstName} ${user.lastName}`
    });
  }
};

/**
 * Supprimer le contexte utilisateur
 */
const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Ajouter un breadcrumb personnalisé
 */
const addBreadcrumb = (category, message, level = 'info', data = {}) => {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000
  });
};

/**
 * Capturer une exception avec contexte
 */
const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Ajouter le contexte
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    
    // Capturer l'erreur
    Sentry.captureException(error);
  });
};

/**
 * Capturer un message avec niveau
 */
const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.withScope((scope) => {
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    
    Sentry.captureMessage(message, level);
  });
};

/**
 * Démarrer une transaction
 */
const startTransaction = (name, op) => {
  return Sentry.startTransaction({
    name,
    op,
    trimEnd: true
  });
};

module.exports = { 
  initSentry, 
  Sentry,
  setSentryUser,
  clearSentryUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction
};
