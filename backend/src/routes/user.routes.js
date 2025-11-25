const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * @route   GET /api/users/search
 * @desc    Rechercher des utilisateurs
 * @access  Private
 */
router.get('/search', userController.searchUsers);

/**
 * @route   PATCH /api/users/profile
 * @desc    Mettre à jour le profil
 * @access  Private
 */
router.patch('/profile', validate(schemas.updateProfile), userController.updateProfile);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload avatar
 * @access  Private
 */
router.post('/avatar', uploadAvatar, userController.updateAvatar);

/**
 * @route   PATCH /api/users/status
 * @desc    Mettre à jour le statut
 * @access  Private
 */
router.patch('/status', validate(schemas.updateStatus), userController.updateStatus);

/**
 * @route   PUT /api/users/me/username
 * @desc    Définir le username
 * @access  Private
 */
router.put('/me/username', userController.updateUsername);

/**
 * @route   POST /api/users/me/avatar
 * @desc    Upload avatar utilisateur connecté
 * @access  Private
 */
router.post('/me/avatar', uploadAvatar, userController.updateAvatar);

/**
 * @route   DELETE /api/users/account
 * @desc    Supprimer le compte
 * @access  Private
 */
router.delete('/account', userController.deleteAccount);

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir le profil d'un utilisateur
 * @access  Private
 */
router.get('/:id', userController.getUserProfile);

module.exports = router;
