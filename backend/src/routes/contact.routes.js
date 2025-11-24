const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * @route   GET /api/contacts
 * @desc    Obtenir la liste des contacts
 * @query   ?favorites=true (optionnel) - Seulement les favoris
 * @query   ?blocked=true (optionnel) - Seulement les bloqués
 * @access  Private
 */
router.get('/', contactController.getContacts);

/**
 * @route   POST /api/contacts
 * @desc    Ajouter un contact
 * @access  Private
 */
router.post('/', validate(schemas.addContact), contactController.addContact);

/**
 * @route   DELETE /api/contacts/:contactId
 * @desc    Supprimer un contact
 * @access  Private
 */
router.delete('/:contactId', contactController.removeContact);

/**
 * @route   PATCH /api/contacts/:contactId/block
 * @desc    Bloquer un contact
 * @access  Private
 */
router.patch('/:contactId/block', contactController.blockContact);

/**
 * @route   PATCH /api/contacts/:contactId/unblock
 * @desc    Débloquer un contact
 * @access  Private
 */
router.patch('/:contactId/unblock', contactController.unblockContact);

/**
 * @route   PATCH /api/contacts/:contactId/favorite
 * @desc    Basculer le favori d'un contact
 * @access  Private
 */
router.patch('/:contactId/favorite', contactController.toggleFavorite);

/**
 * @route   PATCH /api/contacts/:contactId/name
 * @desc    Mettre à jour le nom personnalisé
 * @access  Private
 */
router.patch('/:contactId/name', validate(schemas.updateContactName), contactController.updateCustomName);

module.exports = router;
