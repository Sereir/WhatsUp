const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * @route   POST /api/conversations
 * @desc    Créer une conversation (one-to-one ou groupe)
 * @access  Private
 */
router.post('/', validate(schemas.createConversation), conversationController.createConversation);

/**
 * @route   GET /api/conversations
 * @desc    Obtenir toutes les conversations de l'utilisateur
 * @query   ?includeArchived=true (optionnel)
 * @query   ?limit=20 (optionnel)
 * @query   ?skip=0 (optionnel)
 * @access  Private
 */
router.get('/', conversationController.getConversations);

/**
 * @route   GET /api/conversations/search
 * @desc    Rechercher dans les conversations
 * @query   ?q=terme (requis)
 * @access  Private
 */
router.get('/search', conversationController.searchConversations);

/**
 * @route   GET /api/conversations/:conversationId
 * @desc    Obtenir une conversation spécifique
 * @access  Private
 */
router.get('/:conversationId', conversationController.getConversation);

/**
 * @route   PATCH /api/conversations/:conversationId/read
 * @desc    Marquer une conversation comme lue
 * @access  Private
 */
router.patch('/:conversationId/read', conversationController.markAsRead);

/**
 * @route   PATCH /api/conversations/:conversationId/archive
 * @desc    Archiver/Désarchiver une conversation
 * @access  Private
 */
router.patch('/:conversationId/archive', conversationController.toggleArchive);

/**
 * @route   DELETE /api/conversations/:conversationId
 * @desc    Supprimer une conversation (pour l'utilisateur uniquement)
 * @access  Private
 */
router.delete('/:conversationId', conversationController.deleteConversation);

/**
 * @route   PATCH /api/conversations/:conversationId/notifications
 * @desc    Mettre à jour les paramètres de notification
 * @access  Private
 */
router.patch('/:conversationId/notifications', validate(schemas.updateNotifications), conversationController.updateNotificationSettings);

/**
 * @route   PATCH /api/conversations/:conversationId/group
 * @desc    Mettre à jour les informations du groupe
 * @access  Private (admin only)
 */
router.patch('/:conversationId/group', validate(schemas.updateGroupInfo), conversationController.updateGroupInfo);

module.exports = router;
