const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');
const { setSentryUser, addBreadcrumb } = require('../config/sentry');

/**
 * Middleware d'authentification JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }
    
    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "
    
    // Vérifier le token
    const decoded = verifyToken(token);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Attacher l'utilisateur à la requête
    req.user = user;
    
    // Ajouter le contexte utilisateur à Sentry
    setSentryUser(user);
    
    // Ajouter un breadcrumb
    addBreadcrumb('auth', 'User authenticated', 'info', {
      userId: user._id.toString(),
      email: user.email
    });
    
    next();
    
  } catch (error) {
    logger.error('Erreur authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

module.exports = authMiddleware;
module.exports.authenticate = authMiddleware;
