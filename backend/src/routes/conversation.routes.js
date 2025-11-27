const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { uploadConversationAvatar, uploadGroupAvatar } = require('../middleware/upload.middleware');
const { isGroup, isMember, isAdmin, hasPermission } = require('../middleware/groupPermissions.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * @route   POST /api/conversations
 * @desc    Créer une conversation (one-to-one ou groupe)
 * @access  Private
 */
router.post('/', uploadConversationAvatar, validate(schemas.createConversation), conversationController.createConversation);

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

/**
 * @route   GET /api/conversations/:conversationId/members
 * @desc    Obtenir la liste des membres d'un groupe
 * @access  Private (member)
 */
router.get('/:conversationId/members', isGroup, isMember, conversationController.getGroupMembers);

/**
 * @route   POST /api/conversations/:conversationId/members
 * @desc    Ajouter un membre au groupe
 * @access  Private (admin/moderator)
 */
router.post('/:conversationId/members', isGroup, hasPermission('add_members'), validate(schemas.addGroupMember), conversationController.addGroupMember);

/**
 * @route   DELETE /api/conversations/:conversationId/members/:userId
 * @desc    Retirer un membre du groupe
 * @access  Private (admin/moderator)
 */
router.delete('/:conversationId/members/:userId', isGroup, hasPermission('remove_members'), conversationController.removeGroupMember);

/**
 * @route   POST /api/conversations/:conversationId/leave
 * @desc    Quitter un groupe
 * @access  Private (member)
 */
router.post('/:conversationId/leave', isGroup, isMember, conversationController.leaveGroup);

/**
 * @route   PATCH /api/conversations/:conversationId/members/:userId/role
 * @desc    Changer le rôle d'un membre
 * @access  Private (admin only)
 */
router.patch('/:conversationId/members/:userId/role', isGroup, isAdmin, validate(schemas.changeMemberRole), conversationController.changeMemberRole);

/**
 * @route   PATCH /api/conversations/:conversationId/settings
 * @desc    Mettre à jour les paramètres du groupe
 * @access  Private (admin only)
 */
router.patch('/:conversationId/settings', isGroup, isAdmin, validate(schemas.updateGroupSettings), conversationController.updateGroupSettings);

/**
 * @route   POST /api/conversations/:conversationId/avatar
 * @desc    Uploader une photo de groupe
 * @access  Private (admin/moderator)
 */
router.post('/:conversationId/avatar', isGroup, hasPermission('edit_group_info'), uploadGroupAvatar, conversationController.uploadGroupAvatar);

module.exports = router;
