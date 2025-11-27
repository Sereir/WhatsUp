const rateLimit = require('express-rate-limit');

// Désactiver le rate limiting en mode test
const isTestMode = process.env.NODE_ENV === 'test';

// Rate limiter pour l'authentification (plus strict)
const authLimiter = isTestMode ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: {
    success: false,
    message: 'Trop de tentatives, réessayez dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter général pour les API
const apiLimiter = isTestMode ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes
  message: {
    success: false,
    message: 'Trop de requêtes, réessayez plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  apiLimiter
};
