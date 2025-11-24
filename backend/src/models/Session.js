const mongoose = require('mongoose');

/**
 * Schéma de session
 */
const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index TTL pour supprimer automatiquement les sessions expirées
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index composé pour les requêtes fréquentes
sessionSchema.index({ user: 1, isActive: 1 });

/**
 * Méthode statique pour obtenir les sessions actives d'un utilisateur
 */
sessionSchema.statics.getActiveSessions = async function(userId) {
  return this.find({
    user: userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivity: -1 });
};

/**
 * Méthode statique pour révoquer toutes les sessions d'un utilisateur sauf la courante
 */
sessionSchema.statics.revokeOtherSessions = async function(userId, currentSessionId) {
  return this.updateMany(
    {
      user: userId,
      _id: { $ne: currentSessionId },
      isActive: true
    },
    {
      isActive: false
    }
  );
};

/**
 * Méthode statique pour nettoyer les sessions inactives
 */
sessionSchema.statics.cleanupInactiveSessions = async function(userId) {
  return this.deleteMany({
    user: userId,
    $or: [
      { isActive: false },
      { expiresAt: { $lt: new Date() } }
    ]
  });
};

/**
 * Méthode pour mettre à jour l'activité
 */
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);
