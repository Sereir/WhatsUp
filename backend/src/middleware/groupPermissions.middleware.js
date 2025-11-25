const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

/**
 * Middleware pour vérifier qu'une conversation est un groupe
 */
const isGroup = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    req.conversation = conversation;
    next();
    
  } catch (error) {
    logger.error('Erreur isGroup middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur est membre du groupe
 */
const isMember = async (req, res, next) => {
  try {
    const conversation = req.conversation || await Conversation.findById(req.params.conversationId);
    const userId = req.user._id;
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas membre de ce groupe'
      });
    }
    
    req.conversation = conversation;
    next();
    
  } catch (error) {
    logger.error('Erreur isMember middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur est admin du groupe
 */
const isAdmin = async (req, res, next) => {
  try {
    const conversation = req.conversation || await Conversation.findById(req.params.conversationId);
    const userId = req.user._id;
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être administrateur pour effectuer cette action'
      });
    }
    
    req.conversation = conversation;
    next();
    
  } catch (error) {
    logger.error('Erreur isAdmin middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur est modérateur ou admin
 */
const isModerator = async (req, res, next) => {
  try {
    const conversation = req.conversation || await Conversation.findById(req.params.conversationId);
    const userId = req.user._id;
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isModerator(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être modérateur ou administrateur pour effectuer cette action'
      });
    }
    
    req.conversation = conversation;
    next();
    
  } catch (error) {
    logger.error('Erreur isModerator middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur est le créateur du groupe
 */
const isCreator = async (req, res, next) => {
  try {
    const conversation = req.conversation || await Conversation.findById(req.params.conversationId);
    const userId = req.user._id;
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (conversation.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul le créateur du groupe peut effectuer cette action'
      });
    }
    
    req.conversation = conversation;
    next();
    
  } catch (error) {
    logger.error('Erreur isCreator middleware:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier une permission spécifique
 */
const hasPermission = (action) => {
  return async (req, res, next) => {
    try {
      const conversation = req.conversation || await Conversation.findById(req.params.conversationId);
      const userId = req.user._id;
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Groupe non trouvé'
        });
      }
      
      if (!conversation.canPerformAction(userId, action)) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission d\'effectuer cette action'
        });
      }
      
      req.conversation = conversation;
      next();
      
    } catch (error) {
      logger.error(`Erreur hasPermission(${action}) middleware:`, error);
      next(error);
    }
  };
};

module.exports = {
  isGroup,
  isMember,
  isAdmin,
  isModerator,
  isCreator,
  hasPermission
};
