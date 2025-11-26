const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;
const { processMediaFile, deleteMediaFile } = require('../utils/mediaProcessor');
const { emitNewMessage, emitMessageDeleted, emitMessageEdited, emitReactionAdded, emitReactionRemoved, emitNotification } = require('../utils/socketHelpers');

/**
 * Envoyer un message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, type, replyTo } = req.body;
    const userId = req.user._id;
    
    // Vérifier que la conversation existe
    const conversation = await Conversation.findById(conversationId);
    
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
        message: 'Vous n\'êtes pas participant de cette conversation'
      });
    }
    
    // Vérifier qu'il y a soit du contenu, soit un fichier
    const hasContent = content && content.trim().length > 0;
    if (!hasContent && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Le message doit contenir du texte ou un fichier'
      });
    }
    
    // Créer le message (contenu peut être vide si fichier média)
    const messageData = {
      conversation: conversationId,
      sender: userId,
      content: content || '',
      type: type || 'text',
      status: 'sent'
    };
    
    if (replyTo) {
      messageData.replyTo = replyTo;
    }
    
    // Gérer les fichiers média si présents
    if (req.file) {
      const mediaInfo = await processMediaFile(req.file);
      messageData.mediaUrl = mediaInfo.url;
      messageData.mediaSize = mediaInfo.size;
      messageData.fileName = mediaInfo.fileName;
      messageData.mimeType = mediaInfo.mimeType;
      messageData.thumbnailUrl = mediaInfo.thumbnailUrl;
      
      // Déterminer automatiquement le type basé sur le mimeType
      if (!type) {
        if (mediaInfo.mimeType.startsWith('image/')) {
          messageData.type = 'image';
        } else if (mediaInfo.mimeType.startsWith('video/')) {
          messageData.type = 'video';
        } else if (mediaInfo.mimeType.startsWith('audio/')) {
          messageData.type = 'audio';
        } else {
          messageData.type = 'file';
        }
      }
    }
    
    const message = await Message.create(messageData);
    
    // Mettre à jour la conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    
    // Incrémenter le compteur de non lus pour tous les participants sauf l'expéditeur
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId.toString()) {
        await conversation.incrementUnread(participantId);
      }
    }
    
    await conversation.save();
    
    // Populate pour la réponse
    await message.populate('sender', 'firstName lastName avatar');
    if (replyTo) {
      await message.populate('replyTo', 'content sender type');
    }
    
    logger.info(`Message envoyé dans conversation ${conversationId} par ${req.user.email}`);
    
    // Émettre l'événement Socket.io
    const io = req.app.get('io');
    if (io) {
      emitNewMessage(io, message, conversationId);
      
      // Émettre conversation:updated pour désarchiver automatiquement chez le destinataire
      for (const participantId of conversation.participants) {
        io.to(`user:${participantId}`).emit('conversation:updated', {
          conversation: conversation,
          unarchive: true
        });
      }
      
      // Créer et émettre des notifications pour les autres participants
      for (const participantId of conversation.participants) {
        if (participantId.toString() !== userId.toString()) {
          const notification = await Notification.createNotification({
            recipient: participantId,
            sender: userId,
            type: 'message',
            conversation: conversationId,
            message: message._id,
            content: type === 'text' ? content.substring(0, 100) : `📎 ${type}`,
            data: {
              conversationName: conversation.name,
              isGroup: conversation.isGroup
            }
          });
          
          emitNotification(io, participantId, notification);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Message envoyé',
      data: { message }
    });
    
  } catch (error) {
    logger.error('Erreur sendMessage:', error);
    next(error);
  }
};

/**
 * Obtenir les messages d'une conversation
 */
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { limit, skip, before } = req.query;
    
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
        message: 'Accès non autorisé'
      });
    }
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      before
    };
    
    const messages = await Message.getConversationMessages(conversationId, userId, options);
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Retourner dans l'ordre chronologique
        total: messages.length
      }
    });
    
  } catch (error) {
    logger.error('Erreur getMessages:', error);
    next(error);
  }
};

/**
 * Éditer un message
 */
const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez éditer que vos propres messages'
      });
    }
    
    // Vérifier que le message est de type texte
    if (message.type !== 'text') {
      return res.status(400).json({
        success: false,
        message: 'Seuls les messages texte peuvent être édités'
      });
    }
    
    // Vérifier que le message n'est pas déjà supprimé
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'éditer un message supprimé'
      });
    }
    
    await message.editContent(content);
    
    logger.info(`Message ${messageId} édité par ${req.user.email}`);
    
    // Émettre l'événement Socket.io
    const io = req.app.get('io');
    if (io) {
      emitMessageEdited(io, message, message.conversation);
    }
    
    res.json({
      success: true,
      message: 'Message édité',
      data: { message }
    });
    
  } catch (error) {
    logger.error('Erreur editMessage:', error);
    next(error);
  }
};

/**
 * Supprimer un message
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres messages'
      });
    }
    
    if (deleteForEveryone) {
      // Supprimer le fichier média si présent
      if (message.mediaUrl) {
        await deleteMediaFile(message.mediaUrl);
      }
      
      await message.deleteForEveryone();
    } else {
      await message.deleteForUser(userId);
    }
    
    // Émettre l'événement Socket.io
    const io = req.app.get('io');
    if (io) {
      emitMessageDeleted(io, messageId, message.conversation, deleteForEveryone, userId);
    }
    
    logger.info(`✅ Réponse envoyée au client`);
    res.json({
      success: true,
      message: deleteForEveryone ? 'Message supprimé pour tout le monde' : 'Message supprimé pour vous'
    });
    
  } catch (error) {
    logger.error('Erreur deleteMessage:', error);
    next(error);
  }
};

/**
 * Marquer un message comme lu
 */
const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    await message.markAsRead(userId);
    
    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });
    
  } catch (error) {
    logger.error('Erreur markMessageAsRead:', error);
    next(error);
  }
};

/**
 * Marquer un message comme livré
 */
const markMessageAsDelivered = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    await message.markAsDelivered(userId);
    
    res.json({
      success: true,
      message: 'Message marqué comme livré'
    });
    
  } catch (error) {
    logger.error('Erreur markMessageAsDelivered:', error);
    next(error);
  }
};

/**
 * Ajouter une réaction à un message
 */
const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;
    
    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'L\'emoji est requis'
      });
    }
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    await message.addReaction(userId, emoji);
    
    logger.info(`Réaction ajoutée au message ${messageId} par ${req.user.email}`);
    
    // Émettre l'événement Socket.io
    const io = req.app.get('io');
    if (io) {
      const reaction = message.reactions.find(r => r.user.toString() === userId.toString());
      emitReactionAdded(io, messageId, message.conversation, reaction);
    }
    
    res.json({
      success: true,
      message: 'Réaction ajoutée',
      data: { message }
    });
    
  } catch (error) {
    logger.error('Erreur addReaction:', error);
    next(error);
  }
};

/**
 * Retirer une réaction d'un message
 */
const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    await message.removeReaction(userId);
    
    logger.info(`Réaction retirée du message ${messageId} par ${req.user.email}`);
    
    // Émettre l'événement Socket.io
    const io = req.app.get('io');
    if (io) {
      emitReactionRemoved(io, messageId, message.conversation, userId);
    }
    
    res.json({
      success: true,
      message: 'Réaction retirée'
    });
    
  } catch (error) {
    logger.error('Erreur removeReaction:', error);
    next(error);
  }
};

/**
 * Rechercher des messages
 */
const searchMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { q, conversationId, senderId, limit, skip } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La recherche doit contenir au moins 2 caractères'
      });
    }
    
    // Construire la requête
    const query = {
      isDeleted: false,
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { fileName: { $regex: q, $options: 'i' } }
      ]
    };
    
    // Filtrer par conversation si spécifiée
    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.isParticipant(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette conversation'
        });
      }
      query.conversation = conversationId;
    } else {
      // Sinon, chercher dans toutes les conversations de l'utilisateur
      const userConversations = await Conversation.find({
        participants: userId
      }).select('_id');
      
      query.conversation = { $in: userConversations.map(c => c._id) };
    }
    
    // Filtrer par expéditeur si spécifié
    if (senderId) {
      query.sender = senderId;
    }
    
    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName avatar')
      .populate('conversation', 'participants isGroup groupName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 20)
      .skip(parseInt(skip) || 0);
    
    res.json({
      success: true,
      data: {
        messages,
        total: messages.length,
        query: q
      }
    });
    
  } catch (error) {
    logger.error('Erreur searchMessages:', error);
    next(error);
  }
};

/**
 * Télécharger un fichier
 */
const downloadFile = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    
    const message = await Message.findById(messageId).populate('conversation');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }
    
    // Vérifier l'accès
    if (!message.conversation.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    
    if (!message.mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Ce message ne contient pas de fichier'
      });
    }
    
    const filePath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      path.basename(message.mediaUrl)
    );
    
    // Vérifier que le fichier existe
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }
    
    // Télécharger le fichier
    res.download(filePath, message.fileName || path.basename(filePath));
    
  } catch (error) {
    logger.error('Erreur downloadFile:', error);
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markMessageAsRead,
  markMessageAsDelivered,
  addReaction,
  removeReaction,
  searchMessages,
  downloadFile
};
