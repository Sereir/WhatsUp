const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

/**
 * Récupérer les messages et notifications manqués depuis une date
 */
exports.getMissedUpdates = async (req, res) => {
  try {
    const { since } = req.query;
    const userId = req.user._id;
    
    if (!since) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "since" (timestamp ISO) est requis'
      });
    }
    
    const sinceDate = new Date(since);
    
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Format de date invalide'
      });
    }
    
    // Récupérer les conversations de l'utilisateur
    const userConversations = await Conversation.find({
      participants: userId
    }).select('_id');
    
    const conversationIds = userConversations.map(c => c._id);
    
    // Récupérer les messages manqués
    const missedMessages = await Message.find({
      conversation: { $in: conversationIds },
      createdAt: { $gt: sinceDate },
      sender: { $ne: userId }
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('conversation', 'name isGroup avatar groupName')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: 1 })
      .limit(500);
    
    // Récupérer les notifications manquées
    const missedNotifications = await Notification.find({
      recipient: userId,
      createdAt: { $gt: sinceDate }
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('conversation', 'name isGroup avatar groupName')
      .sort({ createdAt: 1 })
      .limit(200);
    
    // Grouper les messages par conversation
    const messagesByConversation = {};
    missedMessages.forEach(msg => {
      const convId = msg.conversation._id.toString();
      if (!messagesByConversation[convId]) {
        messagesByConversation[convId] = {
          conversation: msg.conversation,
          messages: []
        };
      }
      messagesByConversation[convId].messages.push(msg);
    });
    
    res.json({
      success: true,
      data: {
        messages: missedMessages,
        messagesByConversation,
        notifications: missedNotifications,
        counts: {
          totalMessages: missedMessages.length,
          totalNotifications: missedNotifications.length,
          unreadNotifications: missedNotifications.filter(n => !n.read).length
        },
        syncedAt: new Date()
      }
    });
    
  } catch (error) {
    logger.error('Erreur getMissedUpdates:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des mises à jour'
    });
  }
};

/**
 * Récupérer uniquement les messages manqués d'une conversation
 */
exports.getMissedMessagesForConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { since } = req.query;
    const userId = req.user._id;
    
    if (!since) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre "since" (timestamp ISO) est requis'
      });
    }
    
    const sinceDate = new Date(since);
    
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Format de date invalide'
      });
    }
    
    // Vérifier l'accès à la conversation
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
        message: 'Accès refusé'
      });
    }
    
    // Récupérer les messages manqués
    const missedMessages = await Message.find({
      conversation: conversationId,
      createdAt: { $gt: sinceDate }
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: 1 })
      .limit(500);
    
    res.json({
      success: true,
      data: {
        messages: missedMessages,
        count: missedMessages.length,
        syncedAt: new Date()
      }
    });
    
  } catch (error) {
    logger.error('Erreur getMissedMessagesForConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};
