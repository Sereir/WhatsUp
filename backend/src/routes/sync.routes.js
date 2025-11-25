const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { authenticate } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Récupérer toutes les mises à jour manquées
router.get('/missed-updates', syncController.getMissedUpdates);

// Récupérer les messages manqués d'une conversation spécifique
router.get('/conversations/:conversationId/missed-messages', syncController.getMissedMessagesForConversation);

module.exports = router;
