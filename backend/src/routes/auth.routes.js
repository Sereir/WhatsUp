const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post('/register', authLimiter, validate(schemas.register), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connexion
 * @access  Public
 */
router.post('/login', authLimiter, validate(schemas.login), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/password
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;
