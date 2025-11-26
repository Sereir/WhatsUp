const mongoose = require('mongoose');

/**
 * Schéma de message
 */
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type !== 'system';
    },
    index: true
  },
  content: {
    type: String,
    required: false,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'audio', 'system'],
    default: 'text',
    required: true
  },
  // Pour les fichiers média
  mediaUrl: {
    type: String
  },
  mediaSize: {
    type: Number
  },
  mediaDuration: {
    type: Number // Pour audio/video (en secondes)
  },
  thumbnailUrl: {
    type: String // Pour vidéos
  },
  fileName: {
    type: String
  },
  mimeType: {
    type: String
  },
  // Statut global du message
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent',
    index: true
  },
  // Qui a lu le message (pour les groupes)
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Qui a reçu le message (delivered)
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Réactions au message
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message auquel on répond
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Édition
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  // Suppression
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index composés pour les requêtes fréquentes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isDeleted: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

/**
 * Méthode statique pour obtenir les messages d'une conversation
 */
messageSchema.statics.getConversationMessages = async function(conversationId, userId, options = {}) {
  const { limit = 50, skip = 0, before } = options;
  
  const query = {
    conversation: conversationId,
    $or: [
      { isDeleted: false },
      { isDeleted: true, deletedFor: { $ne: userId } }
    ]
  };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  return this.find(query)
    .populate('sender', 'firstName lastName avatar status')
    .populate('replyTo', 'content sender type')
    .populate('readBy.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Méthode pour marquer comme lu par un utilisateur
 */
messageSchema.methods.markAsRead = async function(userId) {
  if (!userId) return;
  
  // Vérifier si déjà lu
  const alreadyRead = this.readBy.some(r => r?.user?.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    
    // Mettre à jour le statut global si tous les participants ont lu
    const Conversation = mongoose.model('Conversation');
    const conversation = await Conversation.findById(this.conversation);
    
    if (conversation) {
      const allParticipants = conversation.participants.filter(
        p => p?.toString() !== this.sender?.toString()
      );
      const allRead = allParticipants.every(p =>
        this.readBy.some(r => r?.user?.toString() === p?.toString())
      );
      
      if (allRead) {
        this.status = 'read';
      }
    }
    
    return this.save();
  }
  
  return this;
};

/**
 * Méthode pour marquer comme livré à un utilisateur
 */
messageSchema.methods.markAsDelivered = async function(userId) {
  const alreadyDelivered = this.deliveredTo.some(d => d.user.toString() === userId.toString());
  
  if (!alreadyDelivered) {
    this.deliveredTo.push({
      user: userId,
      deliveredAt: new Date()
    });
    
    // Mettre à jour le statut si nécessaire
    if (this.status === 'sent') {
      this.status = 'delivered';
    }
    
    return this.save();
  }
  
  return this;
};

/**
 * Méthode pour éditer le message
 */
messageSchema.methods.editContent = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

/**
 * Méthode pour supprimer pour tout le monde
 */
messageSchema.methods.deleteForEveryone = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'Ce message a été supprimé';
  return this.save();
};

/**
 * Méthode pour supprimer pour un utilisateur
 */
messageSchema.methods.deleteForUser = function(userId) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
  }
  return this.save();
};

/**
 * Méthode pour ajouter une réaction
 */
messageSchema.methods.addReaction = function(userId, emoji) {
  // Retirer l'ancienne réaction de cet utilisateur si elle existe
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Ajouter la nouvelle réaction
  this.reactions.push({
    user: userId,
    emoji
  });
  
  return this.save();
};

/**
 * Méthode pour retirer une réaction
 */
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

/**
 * Méthode statique pour créer un message système
 */
messageSchema.statics.createSystemMessage = async function(conversationId, content) {
  return this.create({
    conversation: conversationId,
    sender: null,
    content,
    type: 'system',
    status: 'sent'
  });
};

module.exports = mongoose.model('Message', messageSchema);
