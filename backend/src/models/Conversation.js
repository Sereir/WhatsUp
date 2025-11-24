const mongoose = require('mongoose');

/**
 * Schéma de conversation
 */
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true,
    maxlength: [100, 'Le nom du groupe ne peut pas dépasser 100 caractères']
  },
  groupAvatar: {
    type: String
  },
  groupDescription: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Compteurs de messages non lus par participant
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  // Paramètres de notification par participant
  notificationSettings: {
    type: Map,
    of: {
      muted: { type: Boolean, default: false },
      mutedUntil: { type: Date }
    },
    default: {}
  },
  // Archivage par participant
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Suppression logique par participant (conversation masquée)
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index pour les recherches fréquentes
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ isGroup: 1 });
conversationSchema.index({ lastMessageAt: -1 });

/**
 * Méthode statique pour obtenir les conversations d'un utilisateur
 */
conversationSchema.statics.getUserConversations = async function(userId, options = {}) {
  const { includeArchived = false, limit = 20, skip = 0 } = options;
  
  const query = {
    participants: userId,
    'deletedBy.user': { $ne: userId }
  };
  
  if (!includeArchived) {
    query.archivedBy = { $ne: userId };
  }
  
  return this.find(query)
    .populate('participants', 'firstName lastName email avatar status lastSeen')
    .populate('lastMessage')
    .populate('creator', 'firstName lastName')
    .populate('admins', 'firstName lastName')
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Méthode statique pour créer une conversation one-to-one
 */
conversationSchema.statics.createOneToOne = async function(user1Id, user2Id) {
  // Vérifier si une conversation existe déjà
  const existing = await this.findOne({
    isGroup: false,
    participants: { $all: [user1Id, user2Id], $size: 2 }
  });
  
  if (existing) {
    return existing;
  }
  
  // Créer nouvelle conversation
  return this.create({
    participants: [user1Id, user2Id],
    isGroup: false,
    creator: user1Id,
    unreadCount: {
      [user1Id]: 0,
      [user2Id]: 0
    }
  });
};

/**
 * Méthode pour incrémenter le compteur de messages non lus
 */
conversationSchema.methods.incrementUnread = function(userId) {
  const current = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), current + 1);
  return this.save();
};

/**
 * Méthode pour réinitialiser le compteur de messages non lus
 */
conversationSchema.methods.resetUnread = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

/**
 * Méthode pour vérifier si un utilisateur est participant
 */
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

/**
 * Méthode pour vérifier si un utilisateur est admin (pour les groupes)
 */
conversationSchema.methods.isAdmin = function(userId) {
  if (!this.isGroup) return false;
  return this.admins.some(a => a.toString() === userId.toString());
};

/**
 * Méthode pour archiver/désarchiver pour un utilisateur
 */
conversationSchema.methods.toggleArchive = function(userId) {
  const index = this.archivedBy.findIndex(id => id.toString() === userId.toString());
  
  if (index > -1) {
    this.archivedBy.splice(index, 1);
  } else {
    this.archivedBy.push(userId);
  }
  
  return this.save();
};

/**
 * Méthode pour supprimer (masquer) pour un utilisateur
 */
conversationSchema.methods.deleteForUser = function(userId) {
  // Retirer les anciennes entrées de cet utilisateur
  this.deletedBy = this.deletedBy.filter(d => d.user.toString() !== userId.toString());
  
  // Ajouter nouvelle entrée
  this.deletedBy.push({
    user: userId,
    deletedAt: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
