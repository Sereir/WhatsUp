const express = require('express');
const router = express.Router();
const securityAlertController = require('../controllers/securityAlertController');
const { authenticate } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Obtenir mes alertes de sécurité
router.get('/', securityAlertController.getMyAlerts);

// Obtenir les statistiques des alertes
router.get('/stats', securityAlertController.getAlertStats);

// Marquer une alerte comme résolue
router.put('/:alertId/resolve', securityAlertController.markAlertResolved);

module.exports = router;
