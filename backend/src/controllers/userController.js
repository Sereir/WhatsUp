const User = require('../models/User');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const SecurityAlertService = require('../services/securityAlertService');
const { addBreadcrumb } = require('../config/sentry');

/**
 * Mettre à jour le username
 */
const updateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Le pseudo doit contenir au moins 3 caractères'
      });
    }
    
    // Vérifier si le username est déjà pris
    const existingUser = await User.findOne({ 
      username: username.trim(), 
      _id: { $ne: req.user._id } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ce pseudo est déjà utilisé'
      });
    }
    
    req.user.username = username.trim();
    await req.user.save();
    
    logger.info(`Username mis à jour: ${req.user.email} -> ${username}`);
    
    res.json({
      success: true,
      message: 'Pseudo mis à jour',
      data: {
        user: {
          _id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          avatar: req.user.avatar
        }
      }
    });
    
  } catch (error) {
    logger.error('Erreur updateUsername:', error);
    next(error);
  }
};

/**
 * Obtenir le profil d'un utilisateur
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    logger.error('Erreur getUserProfile:', error);
    next(error);
  }
};

/**
 * Mettre à jour le profil
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Créer alerte de sécurité
    await SecurityAlertService.logProfileChange(req.user._id, Object.keys(updateData), req);
    
    addBreadcrumb('user', 'Profile updated', 'info', {
      userId: user._id.toString(),
      changes: Object.keys(updateData)
    });
    
    logger.info(`Profil mis à jour: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: { user }
    });
    
  } catch (error) {
    logger.error('Erreur updateProfile:', error);
    next(error);
  }
};

/**
 * Upload avatar
 */
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    // Optimiser l'image avec Sharp
    const filename = `avatar-${req.user._id}-${Date.now()}.jpg`;
    const filepath = path.join(process.env.UPLOAD_PATH || './uploads', filename);
    
    await sharp(req.file.path)
      .resize(400, 400)
      .jpeg({ quality: 90 })
      .toFile(filepath);
    
    // Supprimer l'ancien avatar s'il existe
    if (req.user.avatar) {
      const oldPath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(req.user.avatar));
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        // Ignorer si le fichier n'existe pas
      }
    }
    
    // Supprimer le fichier temporaire
    await fs.unlink(req.file.path);
    
    // Mettre à jour l'utilisateur
    req.user.avatar = `/uploads/${filename}`;
    await req.user.save();
    
    logger.info(`Avatar mis à jour: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Avatar mis à jour',
      data: {
        avatar: req.user.avatar
      }
    });
    
  } catch (error) {
    logger.error('Erreur updateAvatar:', error);
    next(error);
  }
};

/**
 * Rechercher des utilisateurs
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La recherche doit contenir au moins 2 caractères'
      });
    }
    
    const users = await User.search(q.trim(), 10);
    
    res.json({
      success: true,
      data: { users }
    });
    
  } catch (error) {
    logger.error('Erreur searchUsers:', error);
    next(error);
  }
};

/**
 * Mettre à jour le statut
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    req.user.status = status;
    req.user.lastSeen = new Date();
    await req.user.save();
    
    logger.info(`Statut mis à jour: ${req.user.email} - ${status}`);
    
    res.json({
      success: true,
      message: 'Statut mis à jour',
      data: {
        status: req.user.status,
        lastSeen: req.user.lastSeen
      }
    });
    
  } catch (error) {
    logger.error('Erreur updateStatus:', error);
    next(error);
  }
};

/**
 * Supprimer le compte
 */
const deleteAccount = async (req, res, next) => {
  try {
    // Supprimer l'avatar s'il existe
    if (req.user.avatar) {
      const avatarPath = path.join(process.env.UPLOAD_PATH || './uploads', path.basename(req.user.avatar));
      try {
        await fs.unlink(avatarPath);
      } catch (err) {
        // Ignorer si le fichier n'existe pas
      }
    }
    
    await User.findByIdAndDelete(req.user._id);
    
    logger.info(`Compte supprimé: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });
    
  } catch (error) {
    logger.error('Erreur deleteAccount:', error);
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  updateAvatar,
  searchUsers,
  updateStatus,
  deleteAccount,
  updateUsername
};
