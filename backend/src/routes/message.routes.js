const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { uploadMedia } = require('../middleware/upload.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * @route   POST /api/messages
 * @desc    Envoyer un message
 * @access  Private
 */
router.post('/', uploadMedia, validate(schemas.sendMessage), messageController.sendMessage);

/**
 * @route   GET /api/messages/search
 * @desc    Rechercher des messages
 * @query   ?q=terme (requis)
 * @query   ?conversationId=id (optionnel)
 * @query   ?senderId=id (optionnel)
 * @query   ?limit=20 (optionnel)
 * @query   ?skip=0 (optionnel)
 * @access  Private
 */
router.get('/search', messageController.searchMessages);

/**
 * @route   GET /api/messages/:conversationId
 * @desc    Obtenir les messages d'une conversation
 * @query   ?limit=50 (optionnel)
 * @query   ?skip=0 (optionnel)
 * @query   ?before=timestamp (optionnel)
 * @access  Private
 */
router.get('/:conversationId', messageController.getMessages);

/**
 * @route   PATCH /api/messages/:messageId/read
 * @desc    Marquer un message comme lu
 * @access  Private
 */
router.patch('/:messageId/read', messageController.markMessageAsRead);

/**
 * @route   PATCH /api/messages/:messageId/delivered
 * @desc    Marquer un message comme livré
 * @access  Private
 */
router.patch('/:messageId/delivered', messageController.markMessageAsDelivered);

/**
 * @route   POST /api/messages/:messageId/reaction
 * @desc    Ajouter une réaction à un message
 * @access  Private
 */
router.post('/:messageId/reaction', validate(schemas.addReaction), messageController.addReaction);

/**
 * @route   DELETE /api/messages/:messageId/reaction
 * @desc    Retirer une réaction d'un message
 * @access  Private
 */
router.delete('/:messageId/reaction', messageController.removeReaction);

/**
 * @route   GET /api/messages/:messageId/download
 * @desc    Télécharger le fichier d'un message
 * @access  Private
 */
router.get('/:messageId/download', messageController.downloadFile);

/**
 * @route   PATCH /api/messages/:messageId
 * @desc    Éditer un message
 * @access  Private
 */
router.patch('/:messageId', validate(schemas.editMessage), messageController.editMessage);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Supprimer un message
 * @access  Private
 */
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
