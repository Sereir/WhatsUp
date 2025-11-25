const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { emitNotification, emitMemberAdded, emitMemberRemoved, emitMemberRoleChanged, emitGroupSettingsUpdated } = require('../utils/socketHelpers');

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
      
      // Initialiser les rôles et permissions
      const memberRoles = new Map();
      memberRoles.set(userId.toString(), 'admin');
      participants.forEach(p => {
        memberRoles.set(p.toString(), 'member');
      });
      
      const conversation = await Conversation.create({
        participants: allParticipants,
        isGroup: true,
        groupName,
        groupDescription,
        creator: userId,
        admins: [userId],
        memberRoles: Object.fromEntries(memberRoles),
        groupSettings: {
          onlyAdminsCanSend: false,
          onlyAdminsCanEditInfo: true,
          onlyAdminsCanAddMembers: false,
          membersCanLeave: true,
          maxMembers: 256
        },
        unreadCount: Object.fromEntries(allParticipants.map(p => [p.toString(), 0]))
      });
      
      await conversation.populate('participants', 'firstName lastName email avatar status');
      await conversation.populate('creator', 'firstName lastName');
      
      // Créer un message système
      await Message.createSystemMessage(
        conversation._id,
        `${req.user.firstName} ${req.user.lastName} a créé le groupe "${groupName}"`
      );
      
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

/**
 * Ajouter un membre au groupe
 */
const addGroupMember = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId: newMemberId } = req.body;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    // Vérifier les permissions
    if (!conversation.canPerformAction(userId, 'add_members')) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission d\'ajouter des membres'
      });
    }
    
    // Vérifier que le nouvel utilisateur existe
    const newUser = await User.findById(newMemberId);
    if (!newUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    await conversation.addMember(newMemberId);
    
    // Créer un message système
    await Message.createSystemMessage(
      conversation._id,
      `${req.user.firstName} ${req.user.lastName} a ajouté ${newUser.firstName} ${newUser.lastName}`
    );
    
    await conversation.populate('participants', 'firstName lastName email avatar status');
    
    logger.info(`Membre ${newMemberId} ajouté au groupe ${conversationId} par ${req.user.email}`);
    
    // Émettre les événements Socket.io
    const io = req.app.get('io');
    if (io) {
      emitMemberAdded(io, conversationId, {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        avatar: newUser.avatar
      }, userId);
      
      // Notifier le nouveau membre
      const notification = await Notification.createNotification({
        recipient: newMemberId,
        sender: userId,
        type: 'group_add',
        conversation: conversationId,
        content: `Vous avez été ajouté au groupe "${conversation.groupName}"`,
        data: {
          groupName: conversation.groupName,
          addedBy: `${req.user.firstName} ${req.user.lastName}`
        }
      });
      
      emitNotification(io, newMemberId, notification);
    }
    
    res.json({
      success: true,
      message: 'Membre ajouté avec succès',
      data: { conversation }
    });
    
  } catch (error) {
    if (error.message.includes('déjà membre') || error.message.includes('limite')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Erreur addGroupMember:', error);
    next(error);
  }
};

/**
 * Retirer un membre du groupe
 */
const removeGroupMember = async (req, res, next) => {
  try {
    const { conversationId, userId: memberIdToRemove } = req.params;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    // Vérifier les permissions
    if (!conversation.canPerformAction(userId, 'remove_members')) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de retirer des membres'
      });
    }
    
    const memberUser = await User.findById(memberIdToRemove);
    
    await conversation.removeMember(memberIdToRemove);
    
    // Créer un message système
    if (memberUser) {
      await Message.createSystemMessage(
        conversation._id,
        `${req.user.firstName} ${req.user.lastName} a retiré ${memberUser.firstName} ${memberUser.lastName}`
      );
    }
    
    await conversation.populate('participants', 'firstName lastName email avatar status');
    
    logger.info(`Membre ${memberIdToRemove} retiré du groupe ${conversationId} par ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Membre retiré avec succès',
      data: { conversation }
    });
    
  } catch (error) {
    if (error.message.includes('créateur') || error.message.includes('membre')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Erreur removeGroupMember:', error);
    next(error);
  }
};

/**
 * Quitter un groupe
 */
const leaveGroup = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    // Vérifier les permissions
    if (!conversation.canPerformAction(userId, 'leave_group')) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de quitter ce groupe'
      });
    }
    
    // Le créateur ne peut pas quitter
    if (conversation.creator.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Le créateur ne peut pas quitter le groupe. Transférez d\'abord la propriété ou supprimez le groupe.'
      });
    }
    
    await conversation.removeMember(userId);
    
    // Créer un message système
    await Message.createSystemMessage(
      conversation._id,
      `${req.user.firstName} ${req.user.lastName} a quitté le groupe`
    );
    
    logger.info(`Utilisateur ${userId} a quitté le groupe ${conversationId}`);
    
    res.json({
      success: true,
      message: 'Vous avez quitté le groupe'
    });
    
  } catch (error) {
    logger.error('Erreur leaveGroup:', error);
    next(error);
  }
};

/**
 * Changer le rôle d'un membre
 */
const changeMemberRole = async (req, res, next) => {
  try {
    const { conversationId, userId: memberIdToChange } = req.params;
    const { role } = req.body;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    // Vérifier les permissions
    if (!conversation.canPerformAction(userId, 'change_roles')) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de changer les rôles'
      });
    }
    
    // Ne pas permettre de changer le rôle du créateur
    if (conversation.creator.toString() === memberIdToChange.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Le rôle du créateur ne peut pas être modifié'
      });
    }
    
    const memberUser = await User.findById(memberIdToChange);
    if (!memberUser) {
      return res.status(404).json({
        success: false,
        message: 'Membre non trouvé'
      });
    }
    
    const oldRole = conversation.getMemberRole(memberIdToChange);
    await conversation.setMemberRole(memberIdToChange, role);
    
    // Créer un message système
    const roleNames = { admin: 'administrateur', moderator: 'modérateur', member: 'membre' };
    await Message.createSystemMessage(
      conversation._id,
      `${req.user.firstName} ${req.user.lastName} a changé le rôle de ${memberUser.firstName} ${memberUser.lastName} : ${roleNames[oldRole]} → ${roleNames[role]}`
    );
    
    await conversation.populate('participants', 'firstName lastName email avatar status');
    
    logger.info(`Rôle de ${memberIdToChange} changé en ${role} dans le groupe ${conversationId}`);
    
    res.json({
      success: true,
      message: 'Rôle modifié avec succès',
      data: { conversation }
    });
    
  } catch (error) {
    if (error.message.includes('Rôle invalide')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Erreur changeMemberRole:', error);
    next(error);
  }
};

/**
 * Mettre à jour les paramètres du groupe
 */
const updateGroupSettings = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { onlyAdminsCanSend, onlyAdminsCanEditInfo, onlyAdminsCanAddMembers, membersCanLeave, maxMembers } = req.body;
    const userId = req.user._id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    // Vérifier les permissions
    if (!conversation.canPerformAction(userId, 'change_settings')) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier les paramètres'
      });
    }
    
    if (onlyAdminsCanSend !== undefined) conversation.groupSettings.onlyAdminsCanSend = onlyAdminsCanSend;
    if (onlyAdminsCanEditInfo !== undefined) conversation.groupSettings.onlyAdminsCanEditInfo = onlyAdminsCanEditInfo;
    if (onlyAdminsCanAddMembers !== undefined) conversation.groupSettings.onlyAdminsCanAddMembers = onlyAdminsCanAddMembers;
    if (membersCanLeave !== undefined) conversation.groupSettings.membersCanLeave = membersCanLeave;
    if (maxMembers !== undefined) conversation.groupSettings.maxMembers = maxMembers;
    
    await conversation.save();
    
    logger.info(`Paramètres du groupe ${conversationId} mis à jour par ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: { conversation }
    });
    
  } catch (error) {
    logger.error('Erreur updateGroupSettings:', error);
    next(error);
  }
};

/**
 * Uploader une photo de groupe
 */
const uploadGroupAvatar = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie'
      });
    }
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }
    
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation n\'est pas un groupe'
      });
    }
    
    // Vérifier les permissions
    if (!conversation.canPerformAction(userId, 'edit_group_info')) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission de modifier la photo du groupe'
      });
    }
    
    // Supprimer l'ancienne photo si elle existe
    if (conversation.groupAvatar) {
      const oldPath = path.join(process.cwd(), conversation.groupAvatar);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        logger.warn(`Impossible de supprimer l'ancienne photo: ${err.message}`);
      }
    }
    
    // Compresser l'image
    const compressedPath = req.file.path.replace(path.extname(req.file.path), '-compressed.jpg');
    
    await sharp(req.file.path)
      .resize(500, 500, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(compressedPath);
    
    // Supprimer l'original
    await fs.unlink(req.file.path);
    
    conversation.groupAvatar = compressedPath.replace(process.cwd(), '').replace(/\\/g, '/');
    await conversation.save();
    
    // Créer un message système
    await Message.createSystemMessage(
      conversation._id,
      `${req.user.firstName} ${req.user.lastName} a changé la photo du groupe`
    );
    
    logger.info(`Photo du groupe ${conversationId} mise à jour par ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Photo de groupe mise à jour',
      data: { 
        conversation,
        groupAvatar: conversation.groupAvatar
      }
    });
    
  } catch (error) {
    logger.error('Erreur uploadGroupAvatar:', error);
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
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  changeMemberRole,
  updateGroupSettings,
  uploadGroupAvatar
};
