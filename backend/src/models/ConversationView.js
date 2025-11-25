const mongoose = require('mongoose');

const conversationViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageIdSeen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
conversationViewSchema.index({ user: 1, conversation: 1 }, { unique: true });

// Méthode statique pour mettre à jour la dernière vue
conversationViewSchema.statics.updateView = async function(userId, conversationId, messageId = null) {
  return await this.findOneAndUpdate(
    { user: userId, conversation: conversationId },
    { 
      lastViewedAt: new Date(),
      ...(messageId && { lastMessageIdSeen: messageId })
    },
    { upsert: true, new: true }
  );
};

// Méthode statique pour obtenir la dernière vue
conversationViewSchema.statics.getLastView = async function(userId, conversationId) {
  return await this.findOne({ user: userId, conversation: conversationId });
};

module.exports = mongoose.model('ConversationView', conversationViewSchema);
