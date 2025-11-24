const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });
    
    // Générer le token
    const token = generateToken(user._id);
    
    logger.info(`Nouvel utilisateur inscrit: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status
        },
        token
      }
    });
    
  } catch (error) {
    logger.error('Erreur inscription:', error);
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Mettre à jour le statut
    user.status = 'online';
    user.lastSeen = new Date();
    await user.save();
    
    // Générer le token
    const token = generateToken(user._id);
    
    logger.info(`Utilisateur connecté: ${email}`);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          status: user.status
        },
        token
      }
    });
    
  } catch (error) {
    logger.error('Erreur connexion:', error);
    next(error);
  }
};

/**
 * Déconnexion
 */
const logout = async (req, res, next) => {
  try {
    // Mettre à jour le statut
    req.user.status = 'offline';
    req.user.lastSeen = new Date();
    await req.user.save();
    
    logger.info(`Utilisateur déconnecté: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    logger.error('Erreur déconnexion:', error);
    next(error);
  }
};

/**
 * Obtenir l'utilisateur connecté
 */
const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          avatar: req.user.avatar,
          bio: req.user.bio,
          status: req.user.status,
          lastSeen: req.user.lastSeen
        }
      }
    });
  } catch (error) {
    logger.error('Erreur getCurrentUser:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
