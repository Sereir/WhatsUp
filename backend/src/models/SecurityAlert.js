const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'new_login',
      'profile_change',
      'settings_change',
      'contact_added',
      'contact_blocked',
      'password_change',
      'email_change',
      'suspicious_activity',
      'multiple_failed_logins'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index composé pour recherche rapide
securityAlertSchema.index({ user: 1, type: 1, createdAt: -1 });
securityAlertSchema.index({ resolved: 1, severity: 1 });

// Méthode pour créer une alerte
securityAlertSchema.statics.createAlert = async function(data) {
  const alert = new this(data);
  await alert.save();
  
  // Les alertes critiques/élevées sont loggées automatiquement
  if (alert.severity === 'critical' || alert.severity === 'high') {
    const logger = require('../utils/logger');
    logger.logSecurity(alert.severity === 'critical' ? 'error' : 'warn', 
      `Security Alert: ${alert.type}`, {
        userId: alert.user.toString(),
        ipAddress: alert.ipAddress,
        details: alert.details
      });
  }
  
  return alert;
};

// Méthode pour marquer comme résolue
securityAlertSchema.methods.markResolved = async function() {
  this.resolved = true;
  this.resolvedAt = new Date();
  await this.save();
  return this;
};

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);
