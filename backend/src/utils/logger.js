const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

/**
 * Transport pour les logs d'erreur avec rotation quotidienne
 */
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true
});

/**
 * Transport pour tous les logs avec rotation quotidienne
 */
const combinedFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true
});

/**
 * Transport pour les logs WebSocket
 */
const websocketFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/websocket-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxSize: '20m',
  maxFiles: '7d',
  zippedArchive: true
});

/**
 * Transport pour les logs de sécurité
 */
const securityFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, '../../logs/security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'warn',
  maxSize: '20m',
  maxFiles: '90d',
  zippedArchive: true
});

/**
 * Configuration du logger Winston
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsup-backend' },
  transports: [
    errorFileRotateTransport,
    combinedFileRotateTransport,
    securityFileRotateTransport
  ]
});

// En développement, logger aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Logger spécifique pour les WebSockets
 */
const websocketLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsup-websocket' },
  transports: [websocketFileRotateTransport]
});

/**
 * Logger spécifique pour la sécurité
 */
const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'whatsup-security' },
  transports: [securityFileRotateTransport]
});

/**
 * Fonction helper pour logger les actions utilisateur
 */
logger.logUserAction = (userId, action, details = {}) => {
  logger.info('User action', {
    userId: userId.toString(),
    action,
    ...details,
    timestamp: new Date()
  });
};

/**
 * Fonction helper pour logger les erreurs critiques
 */
logger.logCritical = (message, error, context = {}) => {
  logger.error('CRITICAL ERROR', {
    message,
    error: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date()
  });
  
  // Envoi automatique à Sentry pour erreurs critiques
  const { captureException } = require('../config/sentry');
  captureException(error, context);
};

/**
 * Fonction helper pour logger les événements WebSocket
 */
logger.logWebSocket = (event, socketId, userId, data = {}) => {
  websocketLogger.info('WebSocket event', {
    event,
    socketId,
    userId: userId?.toString(),
    ...data,
    timestamp: new Date()
  });
};

/**
 * Fonction helper pour logger les événements de sécurité
 */
logger.logSecurity = (level, message, details = {}) => {
  securityLogger.log(level, message, {
    ...details,
    timestamp: new Date()
  });
};

module.exports = logger;
