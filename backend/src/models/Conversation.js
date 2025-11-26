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
  // Système de rôles pour les groupes
  memberRoles: {
    type: Map,
    of: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    default: {}
  },
  // Permissions du groupe
  groupSettings: {
    onlyAdminsCanSend: { type: Boolean, default: false },
    onlyAdminsCanEditInfo: { type: Boolean, default: true },
    onlyAdminsCanAddMembers: { type: Boolean, default: false },
    membersCanLeave: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 256 }
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
  // Vérifier si une conversation existe déjà (même si supprimée/archivée)
  const existing = await this.findOne({
    isGroup: false,
    participants: { $all: [user1Id, user2Id], $size: 2 }
  });
  
  if (existing) {
    // Restaurer si elle était supprimée pour l'un ou les deux utilisateurs
    existing.deletedBy = existing.deletedBy.filter(
      entry => entry.user.toString() !== user1Id.toString() && entry.user.toString() !== user2Id.toString()
    );
    
    // Désarchiver pour les deux utilisateurs
    existing.archivedBy = existing.archivedBy.filter(
      id => id.toString() !== user1Id.toString() && id.toString() !== user2Id.toString()
    );
    
    await existing.save();
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
 * Méthode pour obtenir le rôle d'un utilisateur dans le groupe
 */
conversationSchema.methods.getMemberRole = function(userId) {
  if (!this.isGroup) return null;
  return this.memberRoles.get(userId.toString()) || 'member';
};

/**
 * Méthode pour vérifier si un utilisateur est modérateur ou admin
 */
conversationSchema.methods.isModerator = function(userId) {
  if (!this.isGroup) return false;
  const role = this.getMemberRole(userId);
  return role === 'moderator' || role === 'admin';
};

/**
 * Méthode pour définir le rôle d'un membre
 */
conversationSchema.methods.setMemberRole = function(userId, role) {
  if (!this.isGroup) {
    throw new Error('Les rôles ne sont disponibles que pour les groupes');
  }
  if (!['admin', 'moderator', 'member'].includes(role)) {
    throw new Error('Rôle invalide');
  }
  
  this.memberRoles.set(userId.toString(), role);
  
  // Synchroniser avec le tableau admins
  if (role === 'admin' && !this.isAdmin(userId)) {
    this.admins.push(userId);
  } else if (role !== 'admin' && this.isAdmin(userId)) {
    this.admins = this.admins.filter(a => a.toString() !== userId.toString());
  }
  
  return this.save();
};

/**
 * Méthode pour ajouter un membre au groupe
 */
conversationSchema.methods.addMember = async function(userId, addedBy = null) {
  if (!this.isGroup) {
    throw new Error('Impossible d\'ajouter des membres à une conversation one-to-one');
  }
  
  if (this.isParticipant(userId)) {
    throw new Error('L\'utilisateur est déjà membre du groupe');
  }
  
  // Vérifier la limite de membres
  if (this.participants.length >= this.groupSettings.maxMembers) {
    throw new Error(`Le groupe a atteint la limite de ${this.groupSettings.maxMembers} membres`);
  }
  
  this.participants.push(userId);
  this.memberRoles.set(userId.toString(), 'member');
  this.unreadCount.set(userId.toString(), 0);
  
  return this.save();
};

/**
 * Méthode pour retirer un membre du groupe
 */
conversationSchema.methods.removeMember = async function(userId) {
  if (!this.isGroup) {
    throw new Error('Impossible de retirer des membres d\'une conversation one-to-one');
  }
  
  if (!this.isParticipant(userId)) {
    throw new Error('L\'utilisateur n\'est pas membre du groupe');
  }
  
  // Ne pas permettre de retirer le créateur
  if (this.creator.toString() === userId.toString()) {
    throw new Error('Le créateur ne peut pas être retiré du groupe');
  }
  
  this.participants = this.participants.filter(p => p.toString() !== userId.toString());
  this.admins = this.admins.filter(a => a.toString() !== userId.toString());
  this.memberRoles.delete(userId.toString());
  this.unreadCount.delete(userId.toString());
  
  return this.save();
};

/**
 * Méthode pour vérifier les permissions d'un utilisateur
 */
conversationSchema.methods.canPerformAction = function(userId, action) {
  if (!this.isGroup) return true;
  
  const role = this.getMemberRole(userId);
  const isCreator = this.creator.toString() === userId.toString();
  
  switch (action) {
    case 'send_message':
      if (this.groupSettings.onlyAdminsCanSend) {
        return role === 'admin' || isCreator;
      }
      return true;
      
    case 'edit_group_info':
      if (this.groupSettings.onlyAdminsCanEditInfo) {
        return role === 'admin' || role === 'moderator' || isCreator;
      }
      return true;
      
    case 'add_members':
      if (this.groupSettings.onlyAdminsCanAddMembers) {
        return role === 'admin' || role === 'moderator' || isCreator;
      }
      return true;
      
    case 'remove_members':
      return role === 'admin' || role === 'moderator' || isCreator;
      
    case 'change_roles':
      return role === 'admin' || isCreator;
      
    case 'change_settings':
      return role === 'admin' || isCreator;
      
    case 'leave_group':
      return this.groupSettings.membersCanLeave || isCreator;
      
    default:
      return false;
  }
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
