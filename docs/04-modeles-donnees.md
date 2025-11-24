# Étape 1.4 : Modèles de Données

## Introduction

Ce document définit les schémas de données MongoDB avec Mongoose pour l'application WhatsApp Clone. Chaque modèle est documenté avec :
- Ses champs et types
- Les relations avec d'autres modèles
- Les index pour la performance
- Les méthodes et hooks utiles
- Les validations

## 1. Modèle User (Utilisateur)

### Schéma

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // N'est pas renvoyé par défaut dans les requêtes
  },
  
  // Profil
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  
  bio: {
    type: String,
    maxlength: [150, 'La bio ne peut pas dépasser 150 caractères'],
    default: ''
  },
  
  // Statut et activité
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Préférences de confidentialité
  privacy: {
    lastSeen: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    },
    profilePhoto: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    },
    status: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    }
  },
  
  // Paramètres
  settings: {
    notifications: {
      enabled: { type: Boolean, default: true },
      sound: { type: String, default: 'default.mp3' },
      desktop: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  
  // Sécurité
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationToken: String,
  
  resetPasswordToken: String,
  
  resetPasswordExpires: Date,
  
  // Métadonnées
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  socketId: String, // ID de la connexion WebSocket active
  
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour la performance
userSchema.index({ email: 1 });
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ status: 1 });

// Méthode d'instance : Comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode d'instance : Générer un nom complet
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Méthode d'instance : Vérifier si l'utilisateur peut voir les infos d'un autre
userSchema.methods.canSeeInfo = function(targetUser, infoType) {
  const privacySetting = targetUser.privacy[infoType];
  
  if (privacySetting === 'everyone') return true;
  if (privacySetting === 'nobody') return false;
  if (privacySetting === 'contacts') {
    // Vérifier si this._id est dans les contacts de targetUser
    // (Nécessite une requête à la collection Contact)
    return true; // Simplifié pour l'exemple
  }
  
  return false;
};

// Hook pre-save : Hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Seulement si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode statique : Rechercher des utilisateurs
userSchema.statics.search = function(query, limit = 20) {
  const searchRegex = new RegExp(query, 'i'); // Insensible à la casse
  
  return this.find({
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex }
    ]
  })
  .limit(limit)
  .select('firstName lastName email avatar status');
};

module.exports = mongoose.model('User', userSchema);
```

### Relations
- **1-N** avec `Message` (un utilisateur peut envoyer plusieurs messages)
- **N-N** avec `User` via `Contact` (un utilisateur a plusieurs contacts)
- **N-N** avec `Conversation` (un utilisateur participe à plusieurs conversations)

---

## 2. Modèle Conversation

### Schéma

```javascript
const conversationSchema = new Schema({
  // Type de conversation
  isGroup: {
    type: Boolean,
    default: false
  },
  
  // Informations du groupe (si applicable)
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Le nom du groupe ne peut pas dépasser 50 caractères'],
    required: function() {
      return this.isGroup;
    }
  },
  
  avatar: {
    type: String,
    default: function() {
      return this.isGroup ? 'default-group.png' : null;
    }
  },
  
  description: {
    type: String,
    maxlength: [200, 'La description ne peut pas dépasser 200 caractères']
  },
  
  // Participants
  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    // Dernier message lu par ce participant
    lastReadMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }
  }],
  
  // Permissions (pour les groupes)
  permissions: {
    sendMessages: {
      type: String,
      enum: ['all', 'admins'],
      default: 'all'
    },
    editGroupInfo: {
      type: String,
      enum: ['all', 'admins'],
      default: 'admins'
    },
    addMembers: {
      type: String,
      enum: ['all', 'admins'],
      default: 'all'
    }
  },
  
  // Dernier message (pour trier les conversations)
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // Métadonnées
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isArchived: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Index
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 }); // Tri décroissant
conversationSchema.index({ isGroup: 1 });

// Méthode : Obtenir les participants actifs
conversationSchema.methods.getActiveParticipants = function() {
  return this.participants.filter(p => !p.leftAt);
};

// Méthode : Vérifier si un utilisateur est participant
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString() && !p.leftAt
  );
};

// Méthode : Vérifier si un utilisateur est admin
conversationSchema.methods.isAdmin = function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString() && !p.leftAt
  );
  return participant && participant.role === 'admin';
};

// Méthode : Compter les messages non lus pour un utilisateur
conversationSchema.methods.getUnreadCount = async function(userId) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) return 0;
  
  const Message = mongoose.model('Message');
  
  const query = {
    conversation: this._id,
    sender: { $ne: userId }
  };
  
  if (participant.lastReadMessageId) {
    query._id = { $gt: participant.lastReadMessageId };
  }
  
  return await Message.countDocuments(query);
};

// Validation : Au moins 2 participants
conversationSchema.path('participants').validate(function(participants) {
  return participants.length >= 2;
}, 'Une conversation doit avoir au moins 2 participants');

// Validation : Les conversations non-groupe doivent avoir exactement 2 participants
conversationSchema.pre('validate', function(next) {
  if (!this.isGroup && this.participants.length !== 2) {
    next(new Error('Une conversation individuelle doit avoir exactement 2 participants'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);
```

### Relations
- **N-N** avec `User` via le champ `participants`
- **1-N** avec `Message` (une conversation contient plusieurs messages)

---

## 3. Modèle Message

### Schéma

```javascript
const messageSchema = new Schema({
  // Conversation parente
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  // Expéditeur
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Contenu
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file'],
    default: 'text',
    required: true
  },
  
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    },
    maxlength: [5000, 'Le message ne peut pas dépasser 5000 caractères']
  },
  
  // Média (si type != 'text')
  media: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
    required: function() {
      return this.type !== 'text';
    }
  },
  
  // Réponse à un autre message
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Statut de livraison
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Pour les groupes : qui a lu le message
  readBy: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Réactions
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
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
  
  // Édition et suppression
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: Date,
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  
  deletedFor: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }], // Utilisateurs pour qui le message est supprimé
  
  // Métadonnées
  deliveredAt: Date,
  
  readAt: Date
  
}, {
  timestamps: true
});

// Index composites pour la performance
messageSchema.index({ conversation: 1, createdAt: -1 }); // Messages d'une conversation
messageSchema.index({ sender: 1, createdAt: -1 }); // Messages d'un utilisateur
messageSchema.index({ conversation: 1, status: 1 }); // Messages par statut

// Index pour la recherche full-text
messageSchema.index({ content: 'text' });

// Méthode : Marquer comme lu par un utilisateur
messageSchema.methods.markAsReadBy = async function(userId) {
  // Éviter les doublons
  const alreadyRead = this.readBy.some(
    r => r.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    
    // Mettre à jour le statut global si tous les participants ont lu
    const Conversation = mongoose.model('Conversation');
    const conversation = await Conversation.findById(this.conversation);
    const activeParticipants = conversation.getActiveParticipants();
    
    if (this.readBy.length === activeParticipants.length - 1) {
      // -1 car l'expéditeur ne compte pas
      this.status = 'read';
      this.readAt = new Date();
    }
    
    await this.save();
  }
};

// Méthode : Supprimer pour un utilisateur
messageSchema.methods.deleteForUser = function(userId) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
  }
  return this.save();
};

// Méthode : Supprimer pour tous
messageSchema.methods.deleteForEveryone = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = 'Ce message a été supprimé';
  return this.save();
};

// Méthode : Ajouter une réaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Supprimer la réaction existante de cet utilisateur avec cet emoji
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  
  // Ajouter la nouvelle réaction
  this.reactions.push({ user: userId, emoji });
  
  return this.save();
};

// Méthode : Retirer une réaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  
  return this.save();
};

// Hook post-save : Mettre à jour lastMessage de la conversation
messageSchema.post('save', async function(doc) {
  const Conversation = mongoose.model('Conversation');
  
  await Conversation.findByIdAndUpdate(doc.conversation, {
    lastMessage: doc._id,
    lastMessageAt: doc.createdAt
  });
});

module.exports = mongoose.model('Message', messageSchema);
```

### Relations
- **N-1** avec `Conversation` (plusieurs messages appartiennent à une conversation)
- **N-1** avec `User` (plusieurs messages sont envoyés par un utilisateur)
- **1-1** avec `Media` (optionnel, pour les messages non-texte)
- **1-1** avec `Message` (optionnel, pour les réponses)

---

## 4. Modèle Contact

### Schéma

```javascript
const contactSchema = new Schema({
  // Propriétaire de la liste de contacts
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Contact ajouté
  contact: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Nom personnalisé (optionnel)
  customName: {
    type: String,
    trim: true,
    maxlength: [50, 'Le nom personnalisé ne peut pas dépasser 50 caractères']
  },
  
  // Statut
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Métadonnées
  addedAt: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true
});

// Index composite unique pour éviter les doublons
contactSchema.index({ user: 1, contact: 1 }, { unique: true });

// Validation : Un utilisateur ne peut pas s'ajouter lui-même
contactSchema.pre('save', function(next) {
  if (this.user.toString() === this.contact.toString()) {
    next(new Error('Vous ne pouvez pas vous ajouter vous-même comme contact'));
  } else {
    next();
  }
});

// Méthode statique : Obtenir les contacts d'un utilisateur
contactSchema.statics.getContactsOfUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.onlyFavorites) {
    query.isFavorite = true;
  }
  
  if (options.excludeBlocked) {
    query.isBlocked = false;
  }
  
  return this.find(query)
    .populate('contact', 'firstName lastName email avatar status lastSeen')
    .sort({ 'contact.firstName': 1 });
};

// Méthode statique : Vérifier si deux utilisateurs sont contacts
contactSchema.statics.areContacts = async function(userId1, userId2) {
  const contact = await this.findOne({
    user: userId1,
    contact: userId2,
    isBlocked: false
  });
  
  return !!contact;
};

module.exports = mongoose.model('Contact', contactSchema);
```

### Relations
- **N-1** avec `User` (plusieurs contacts appartiennent à un utilisateur)
- **N-1** avec `User` (plusieurs entrées référencent un utilisateur comme contact)

---

## 5. Modèle Media (Médias)

### Schéma

```javascript
const mediaSchema = new Schema({
  // Type de média
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'file'],
    required: true
  },
  
  // Fichier original
  filename: {
    type: String,
    required: true
  },
  
  originalName: {
    type: String,
    required: true
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  size: {
    type: Number, // en octets
    required: true,
    max: [52428800, 'La taille maximale est de 50 MB'] // 50 MB
  },
  
  // URLs
  url: {
    type: String,
    required: true
  },
  
  // Thumbnail (pour images et vidéos)
  thumbnail: {
    url: String,
    width: Number,
    height: Number
  },
  
  // Dimensions (pour images et vidéos)
  width: Number,
  height: Number,
  
  // Durée (pour audio et vidéo)
  duration: Number, // en secondes
  
  // Métadonnées
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  // Stockage
  storage: {
    type: String,
    enum: ['local', 's3', 'cloudinary'],
    default: 'local'
  },
  
  storageKey: String, // Clé pour S3 ou Cloudinary
  
  // Compression (pour images)
  isCompressed: {
    type: Boolean,
    default: false
  },
  
  originalSize: Number // Taille avant compression
  
}, {
  timestamps: true
});

// Index
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ type: 1 });

// Méthode virtuelle : URL complète
mediaSchema.virtual('fullUrl').get(function() {
  if (this.storage === 'local') {
    return `${process.env.BASE_URL}/uploads/${this.filename}`;
  }
  return this.url;
});

// Méthode : Obtenir les infos de fichier formatées
mediaSchema.methods.getFileInfo = function() {
  return {
    name: this.originalName,
    size: this.formatSize(),
    type: this.type,
    url: this.fullUrl,
    thumbnail: this.thumbnail?.url
  };
};

// Méthode : Formater la taille en Ko/Mo
mediaSchema.methods.formatSize = function() {
  const bytes = this.size;
  
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
};

// Hook pre-remove : Supprimer le fichier du stockage
mediaSchema.pre('remove', async function(next) {
  try {
    if (this.storage === 'local') {
      const fs = require('fs');
      const path = require('path');
      
      // Supprimer le fichier principal
      const filePath = path.join(__dirname, '../../uploads', this.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Supprimer le thumbnail si existe
      if (this.thumbnail?.url) {
        const thumbPath = path.join(__dirname, '../../uploads', path.basename(this.thumbnail.url));
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }
    }
    // TODO: Gérer la suppression pour S3/Cloudinary
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Media', mediaSchema);
```

### Relations
- **1-1** avec `Message` (un média appartient à un message)
- **N-1** avec `User` (plusieurs médias uploadés par un utilisateur)

---

## 6. Schémas Supplémentaires (Optionnels)

### 6.1 Modèle Notification

```javascript
const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['new_message', 'new_conversation', 'added_to_group', 'mention'],
    required: true
  },
  
  data: {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation'
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  message: {
    type: String,
    required: true
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date
  
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
```

### 6.2 Modèle Report (Signalement)

```javascript
const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reportedMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate_content', 'other'],
    required: true
  },
  
  description: {
    type: String,
    maxlength: 500
  },
  
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  
  resolution: String
  
}, {
  timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
```

---

## 7. Diagramme de Relations

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1:N (sender)
       │
       ▼
┌──────────────┐        1:1        ┌──────────────┐
│   Message    │◄──────────────────►│    Media     │
└──────┬───────┘                    └──────────────┘
       │
       │ N:1
       │
       ▼
┌──────────────┐
│ Conversation │
└──────┬───────┘
       │
       │ N:N (participants)
       │
       ▼
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐        N:1        ┌──────────────┐
│   Contact    │───────────────────►│     User     │
└──────────────┘                    │  (contact)   │
                                    └──────────────┘
```

---

## 8. Requêtes Courantes Optimisées

### 8.1 Obtenir les conversations d'un utilisateur avec derniers messages

```javascript
const getUserConversations = async (userId) => {
  return await Conversation.find({
    'participants.user': userId,
    'participants.leftAt': { $exists: false }
  })
  .populate('lastMessage')
  .populate('participants.user', 'firstName lastName avatar status')
  .sort({ lastMessageAt: -1 })
  .limit(50);
};
```

### 8.2 Obtenir les messages d'une conversation avec pagination

```javascript
const getMessages = async (conversationId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  return await Message.find({
    conversation: conversationId,
    isDeleted: false
  })
  .populate('sender', 'firstName lastName avatar')
  .populate('replyTo')
  .populate('media')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};
```

### 8.3 Rechercher dans les messages

```javascript
const searchMessages = async (userId, query) => {
  // Trouver les conversations de l'utilisateur
  const conversations = await Conversation.find({
    'participants.user': userId
  }).select('_id');
  
  const conversationIds = conversations.map(c => c._id);
  
  // Rechercher dans les messages
  return await Message.find({
    conversation: { $in: conversationIds },
    $text: { $search: query },
    isDeleted: false
  })
  .populate('conversation', 'name isGroup participants')
  .populate('sender', 'firstName lastName avatar')
  .limit(50)
  .sort({ score: { $meta: 'textScore' } });
};
```

### 8.4 Compter les messages non lus

```javascript
const getUnreadCount = async (userId) => {
  const conversations = await Conversation.find({
    'participants.user': userId
  });
  
  let totalUnread = 0;
  
  for (const conv of conversations) {
    const count = await conv.getUnreadCount(userId);
    totalUnread += count;
  }
  
  return totalUnread;
};
```

---

## 9. Considérations de Performance

### Index Essentiels

```javascript
// User
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ firstName: 1, lastName: 1 });

// Conversation
db.conversations.createIndex({ 'participants.user': 1 });
db.conversations.createIndex({ lastMessageAt: -1 });

// Message
db.messages.createIndex({ conversation: 1, createdAt: -1 });
db.messages.createIndex({ content: 'text' }); // Full-text search

// Contact
db.contacts.createIndex({ user: 1, contact: 1 }, { unique: true });
```

### Stratégies d'Optimisation

1. **Projection** : Ne récupérer que les champs nécessaires
   ```javascript
   User.find().select('firstName lastName avatar');
   ```

2. **Lean queries** : Pour les lectures seules (plus rapide)
   ```javascript
   Message.find().lean();
   ```

3. **Pagination** : Toujours limiter les résultats
   ```javascript
   .skip(offset).limit(pageSize)
   ```

4. **Populate sélectif** : Limiter les champs populate
   ```javascript
   .populate('sender', 'firstName lastName')
   ```

---

## Conclusion

Ces modèles de données fournissent :
- ✅ Structure robuste et évolutive
- ✅ Relations bien définies
- ✅ Validations intégrées
- ✅ Méthodes utilitaires
- ✅ Index pour la performance
- ✅ Hooks pour automatiser les tâches

La prochaine étape consiste à définir le plan de tests complet.
