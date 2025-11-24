const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Créer une conversation (one-to-one ou groupe)
 */
const createConversation = async (req, res, next) => {
  try {
    const { participantId, participants, isGroup, groupName, groupDescription } = req.body;
    const userId = req.user._id;
    
    if (isGroup) {
      // Créer un groupe
      if (!participants || participants.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Un groupe doit avoir au moins 2 participants en plus du créateur'
        });
      }
      
      if (!groupName) {
        return res.status(400).json({
          success: false,
          message: 'Le nom du groupe est requis'
        });
      }
      
      // Ajouter le créateur aux participants
      const allParticipants = [...new Set([userId, ...participants])];
      
      const conversation = await Conversation.create({
        participants: allParticipants,
        isGroup: true,
        groupName,
        groupDescription,
        creator: userId,
        admins: [userId],
        unreadCount: Object.fromEntries(allParticipants.map(p => [p.toString(), 0]))
      });
      
      await conversation.populate('participants', 'firstName lastName email avatar status');
      await conversation.populate('creator', 'firstName lastName');
      
      logger.info(`Groupe créé: ${groupName} par ${req.user.email}`);
      
      return res.status(201).json({
        success: true,
        message: 'Groupe créé avec succès',
        data: { conversation }
      });
      
    } else {
      // Conversation one-to-one
      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: 'L\'ID du participant est requis'
        });
      }
      
      // Vérifier que le participant existe
      const participant = await User.findById(participantId);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Créer ou récupérer la conversation existante
      const conversation = await Conversation.createOneToOne(userId, participantId);
      
      await conversation.populate('participants', 'firstName lastName email avatar status');
      
      logger.info(`Conversation créée entre ${req.user.email} et ${participant.email}`);
      
      return res.status(201).json({
        success: true,
        message: 'Conversation créée avec succès',
        data: { conversation }
      });
    }
    
  } catch (error) {
    logger.error('Erreur createConversation:', error);
    next(error);
  }
};

/**
 * Obtenir toutes les conversations de l'utilisateur
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { includeArchived, limit, skip } = req.query;
    
    const options = {
      includeArchived: includeArchived === 'true',
      limit: parseInt(limit) || 20,
      skip: parseInt(skip) || 0
    };
    
    const conversations = await Conversation.getUserConversations(userId, options);
    
    // Calculer le nombre total de non lus
    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount.get(userId.toString()) || 0);
    }, 0);
    
    res.json({
      success: true,
      data: {
        conversations,
        total: conversations.length,
        totalUnread
      }
    });
    
  } catch (error) {
    logger.error('Erreur getConversations:', error);
    next(error);
  }
};

/**
 * Obtenir une conversation spécifique
 */
const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'firstName lastName email avatar status lastSeen')
      .populate('lastMessage')
      .populate('creator', 'firstName lastName')
      .populate('admins', 'firstName lastName');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }
    
    // Vérifier que l'utilisateur est participant
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette conversation'
      });
    }
    
    res.json({
      success: true,
      data: { conversation }
    });
    
  } catch (error) {
    logger.error('Erreur getConversation:', error);
    next(error);
  }
};

/**
 * Marquer une conversation comme lue
 */
const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }
    
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    // Réinitialiser le compteur
    await conversation.resetUnread(userId);
    
    // Marquer tous les messages non lus comme lus
    const messages = await Message.find({
      conversation: conversationId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId }
    });
    
    for (const message of messages) {
      await message.markAsRead(userId);
    }
    
    logger.info(`Conversation ${conversationId} marquée comme lue par ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Conversation marquée comme lue'
    });
    
  } catch (error) {
    logger.error('Erreur markAsRead:', error);
    next(error);
  }
};

/**
 * Archiver/Désarchiver une conversation
 */
const toggleArchive = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }
    
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    await conversation.toggleArchive(userId);
    
    const isArchived = conversation.archivedBy.includes(userId);
    
    logger.info(`Conversation ${conversationId} ${isArchived ? 'archivée' : 'désarchivée'} par ${req.user.email}`);
    
    res.json({
      success: true,
      message: isArchived ? 'Conversation archivée' : 'Conversation désarchivée',
      data: { isArchived }
    });
    
  } catch (error) {
    logger.error('Erreur toggleArchive:', error);
    next(error);
  }
};

/**
 * Supprimer une conversation (pour l'utilisateur uniquement)
 */
const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }
    
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    await conversation.deleteForUser(userId);
    
    logger.info(`Conversation ${conversationId} supprimée pour ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Conversation supprimée'
    });
    
  } catch (error) {
    logger.error('Erreur deleteConversation:', error);
    next(error);
  }
};

/**
 * Rechercher dans les conversations
 */
const searchConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La recherche doit contenir au moins 2 caractères'
      });
    }
    
    const conversations = await Conversation.find({
      participants: userId,
      'deletedBy.user': { $ne: userId },
      $or: [
        { groupName: { $regex: q, $options: 'i' } },
        { groupDescription: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('participants', 'firstName lastName email avatar')
    .populate('lastMessage')
    .limit(20);
    
    res.json({
      success: true,
      data: {
        conversations,
        total: conversations.length
      }
    });
    
  } catch (error) {
    logger.error('Erreur searchConversations:', error);
    next(error);
  }
};

/**
 * Mettre à jour les paramètres de notification
 */
const updateNotificationSettings = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { muted, mutedUntil } = req.body;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }
    
    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    conversation.notificationSettings.set(userId.toString(), {
      muted: muted || false,
      mutedUntil: mutedUntil ? new Date(mutedUntil) : null
    });
    
    await conversation.save();
    
    logger.info(`Paramètres de notification mis à jour pour conversation ${conversationId} par ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Paramètres de notification mis à jour'
    });
    
  } catch (error) {
    logger.error('Erreur updateNotificationSettings:', error);
    next(error);
  }
};

/**
 * Mettre à jour les informations du groupe
 */
const updateGroupInfo = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { groupName, groupDescription } = req.body;
    const userId = req.user._id;
    
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
    
    if (!conversation.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les admins peuvent modifier les informations du groupe'
      });
    }
    
    if (groupName) conversation.groupName = groupName;
    if (groupDescription !== undefined) conversation.groupDescription = groupDescription;
    
    await conversation.save();
    
    logger.info(`Informations du groupe ${conversationId} mises à jour par ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Informations du groupe mises à jour',
      data: { conversation }
    });
    
  } catch (error) {
    logger.error('Erreur updateGroupInfo:', error);
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  markAsRead,
  toggleArchive,
  deleteConversation,
  searchConversations,
  updateNotificationSettings,
  updateGroupInfo
};
