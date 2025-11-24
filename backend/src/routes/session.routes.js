const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/auth.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

/**
 * @route   GET /api/sessions
 * @desc    Obtenir les sessions actives
 * @access  Private
 */
router.get('/', sessionController.getActiveSessions);

/**
 * @route   GET /api/sessions/history
 * @desc    Obtenir l'historique des sessions
 * @query   ?limit=10 (nombre de sessions à retourner)
 * @access  Private
 */
router.get('/history', sessionController.getSessionHistory);

/**
 * @route   DELETE /api/sessions/:sessionId
 * @desc    Révoquer une session spécifique
 * @access  Private
 */
router.delete('/:sessionId', sessionController.revokeSession);

/**
 * @route   POST /api/sessions/revoke-others
 * @desc    Révoquer toutes les autres sessions sauf la courante
 * @access  Private
 */
router.post('/revoke-others', sessionController.revokeOtherSessions);

/**
 * @route   DELETE /api/sessions/cleanup
 * @desc    Nettoyer les sessions inactives
 * @access  Private
 */
router.delete('/cleanup', sessionController.cleanupSessions);

module.exports = router;
