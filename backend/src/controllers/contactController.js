const Contact = require('../models/Contact');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Ajouter un contact
 */
const addContact = async (req, res, next) => {
  try {
    const { contactId, customName } = req.body;
    const userId = req.user._id;
    
    // Vérifier qu'on n'ajoute pas soi-même
    if (userId.toString() === contactId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous ajouter vous-même comme contact'
      });
    }
    
    // Vérifier que l'utilisateur à ajouter existe
    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Vérifier si le contact existe déjà
    const existingContact = await Contact.findOne({ user: userId, contact: contactId });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Ce contact existe déjà'
      });
    }
    
    // Créer le contact
    const contact = await Contact.create({
      user: userId,
      contact: contactId,
      customName: customName || null
    });
    
    // Populate pour retourner les infos du contact
    await contact.populate('contact', 'firstName lastName email avatar status lastSeen');
    
    logger.info(`Contact ajouté: ${req.user.email} -> ${contactUser.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Contact ajouté avec succès',
      data: { contact }
    });
    
  } catch (error) {
    logger.error('Erreur addContact:', error);
    next(error);
  }
};

/**
 * Supprimer un contact
 */
const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;
    
    const contact = await Contact.findOneAndDelete({
      user: userId,
      contact: contactId
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }
    
    logger.info(`Contact supprimé: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });
    
  } catch (error) {
    logger.error('Erreur removeContact:', error);
    next(error);
  }
};

/**
 * Obtenir la liste des contacts
 */
const getContacts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { favorites, blocked } = req.query;
    
    const filters = {};
    
    if (favorites === 'true') {
      filters.isFavorite = true;
    }
    
    if (blocked === 'true') {
      filters.isBlocked = true;
    } else {
      // Par défaut, exclure les contacts bloqués
      filters.isBlocked = false;
    }
    
    const contacts = await Contact.getUserContacts(userId, filters);
    
    res.json({
      success: true,
      data: {
        contacts,
        total: contacts.length
      }
    });
    
  } catch (error) {
    logger.error('Erreur getContacts:', error);
    next(error);
  }
};

/**
 * Bloquer un contact
 */
const blockContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;
    
    const contact = await Contact.findOne({
      user: userId,
      contact: contactId
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }
    
    if (contact.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'Ce contact est déjà bloqué'
      });
    }
    
    contact.isBlocked = true;
    await contact.save();
    
    logger.info(`Contact bloqué: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Contact bloqué avec succès',
      data: { contact }
    });
    
  } catch (error) {
    logger.error('Erreur blockContact:', error);
    next(error);
  }
};

/**
 * Débloquer un contact
 */
const unblockContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;
    
    const contact = await Contact.findOne({
      user: userId,
      contact: contactId
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }
    
    if (!contact.isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'Ce contact n\'est pas bloqué'
      });
    }
    
    contact.isBlocked = false;
    await contact.save();
    
    logger.info(`Contact débloqué: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Contact débloqué avec succès',
      data: { contact }
    });
    
  } catch (error) {
    logger.error('Erreur unblockContact:', error);
    next(error);
  }
};

/**
 * Basculer le favori d'un contact
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;
    
    const contact = await Contact.findOne({
      user: userId,
      contact: contactId
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }
    
    contact.isFavorite = !contact.isFavorite;
    await contact.save();
    
    logger.info(`Favori basculé: ${req.user.email} - ${contact.isFavorite}`);
    
    res.json({
      success: true,
      message: contact.isFavorite ? 'Contact ajouté aux favoris' : 'Contact retiré des favoris',
      data: { contact }
    });
    
  } catch (error) {
    logger.error('Erreur toggleFavorite:', error);
    next(error);
  }
};

/**
 * Mettre à jour le nom personnalisé d'un contact
 */
const updateCustomName = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { customName } = req.body;
    const userId = req.user._id;
    
    const contact = await Contact.findOne({
      user: userId,
      contact: contactId
    }).populate('contact', 'firstName lastName email avatar status lastSeen');
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }
    
    contact.customName = customName || null;
    await contact.save();
    
    logger.info(`Nom personnalisé mis à jour: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Nom personnalisé mis à jour',
      data: { contact }
    });
    
  } catch (error) {
    logger.error('Erreur updateCustomName:', error);
    next(error);
  }
};

module.exports = {
  addContact,
  removeContact,
  getContacts,
  blockContact,
  unblockContact,
  toggleFavorite,
  updateCustomName
};
