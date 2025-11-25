const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

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
