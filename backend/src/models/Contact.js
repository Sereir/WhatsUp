const mongoose = require('mongoose');

/**
 * Schéma de contact
 */
const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customName: {
    type: String,
    trim: true,
    maxlength: [50, 'Le nom personnalisé ne peut pas dépasser 50 caractères']
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false,
    index: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index composé pour garantir l'unicité de la relation user-contact
contactSchema.index({ user: 1, contact: 1 }, { unique: true });

// Index pour les recherches fréquentes
contactSchema.index({ user: 1, isBlocked: 1 });
contactSchema.index({ user: 1, isFavorite: 1 });

/**
 * Méthode statique pour obtenir les contacts d'un utilisateur
 */
contactSchema.statics.getUserContacts = async function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.isBlocked !== undefined) {
    query.isBlocked = filters.isBlocked;
  }
  
  if (filters.isFavorite !== undefined) {
    query.isFavorite = filters.isFavorite;
  }
  
  return this.find(query)
    .populate('contact', 'firstName lastName email avatar status lastSeen')
    .sort({ isFavorite: -1, addedAt: -1 });
};

/**
 * Méthode statique pour vérifier si un contact existe
 */
contactSchema.statics.contactExists = async function(userId, contactId) {
  const contact = await this.findOne({ user: userId, contact: contactId });
  return !!contact;
};

/**
 * Méthode statique pour vérifier si un contact est bloqué
 */
contactSchema.statics.isBlocked = async function(userId, contactId) {
  const contact = await this.findOne({ user: userId, contact: contactId });
  return contact ? contact.isBlocked : false;
};

module.exports = mongoose.model('Contact', contactSchema);
