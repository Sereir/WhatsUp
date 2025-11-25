/**
 * Helpers pour émettre des événements Socket.io depuis les controllers
 */

/**
 * Émettre un nouveau message aux participants de la conversation
 */
const emitNewMessage = (io, message, conversationId) => {
  io.to(`conversation:${conversationId}`).emit('message:new', {
    message,
    conversationId
  });
};

/**
 * Émettre la suppression d'un message
 */
const emitMessageDeleted = (io, messageId, conversationId, deleteForEveryone, deletedBy) => {
  io.to(`conversation:${conversationId}`).emit('message:deleted', {
    messageId,
    conversationId,
    deleteForEveryone,
    deletedBy
  });
};

/**
 * Émettre l'édition d'un message
 */
const emitMessageEdited = (io, message, conversationId) => {
  io.to(`conversation:${conversationId}`).emit('message:edited', {
    message,
    conversationId
  });
};

/**
 * Émettre l'ajout d'une réaction
 */
const emitReactionAdded = (io, messageId, conversationId, reaction) => {
  io.to(`conversation:${conversationId}`).emit('reaction:added', {
    messageId,
    conversationId,
    reaction
  });
};

/**
 * Émettre la suppression d'une réaction
 */
const emitReactionRemoved = (io, messageId, conversationId, userId) => {
  io.to(`conversation:${conversationId}`).emit('reaction:removed', {
    messageId,
    conversationId,
    userId
  });
};

/**
 * Émettre la livraison d'un message
 */
const emitMessageDelivered = (io, messageId, conversationId, deliveredBy) => {
  io.to(`conversation:${conversationId}`).emit('message:delivered', {
    messageId,
    conversationId,
    deliveredBy,
    deliveredAt: new Date()
  });
};

/**
 * Émettre la lecture d'un message
 */
const emitMessageRead = (io, messageId, conversationId, readBy) => {
  io.to(`conversation:${conversationId}`).emit('message:read', {
    messageId,
    conversationId,
    readBy,
    readAt: new Date()
  });
};

/**
 * Émettre la mise à jour d'une conversation
 */
const emitConversationUpdated = (io, conversation, participants) => {
  participants.forEach(participantId => {
    io.emitToUser(participantId, 'conversation:updated', {
      conversation
    });
  });
};

/**
 * Émettre l'ajout d'un membre au groupe
 */
const emitMemberAdded = (io, conversationId, newMember, addedBy) => {
  io.to(`conversation:${conversationId}`).emit('group:member_added', {
    conversationId,
    member: newMember,
    addedBy
  });
};

/**
 * Émettre le retrait d'un membre du groupe
 */
const emitMemberRemoved = (io, conversationId, memberId, removedBy) => {
  io.to(`conversation:${conversationId}`).emit('group:member_removed', {
    conversationId,
    memberId,
    removedBy
  });
};

/**
 * Émettre le changement de rôle d'un membre
 */
const emitMemberRoleChanged = (io, conversationId, memberId, newRole, changedBy) => {
  io.to(`conversation:${conversationId}`).emit('group:role_changed', {
    conversationId,
    memberId,
    newRole,
    changedBy
  });
};

/**
 * Émettre la mise à jour des paramètres du groupe
 */
const emitGroupSettingsUpdated = (io, conversationId, settings, updatedBy) => {
  io.to(`conversation:${conversationId}`).emit('group:settings_updated', {
    conversationId,
    settings,
    updatedBy
  });
};

/**
 * Émettre une notification à un utilisateur spécifique
 */
const emitNotification = (io, userId, notification) => {
  if (io.emitToUser) {
    io.emitToUser(userId, 'notification:new', {
      notification
    });
  }
};

module.exports = {
  emitNewMessage,
  emitMessageDeleted,
  emitMessageEdited,
  emitReactionAdded,
  emitReactionRemoved,
  emitMessageDelivered,
  emitMessageRead,
  emitConversationUpdated,
  emitMemberAdded,
  emitMemberRemoved,
  emitMemberRoleChanged,
  emitGroupSettingsUpdated,
  emitNotification
};
