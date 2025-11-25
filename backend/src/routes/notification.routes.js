const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Obtenir les notifications
router.get('/', notificationController.getNotifications);

// Obtenir le nombre de notifications non lues
router.get('/unread-count', notificationController.getUnreadCount);

// Marquer toutes les notifications comme lues
router.put('/mark-all-read', notificationController.markAllAsRead);

// Supprimer toutes les notifications lues
router.delete('/read', notificationController.deleteAllRead);

// Marquer une notification comme lue
router.put('/:notificationId/read', notificationController.markAsRead);

// Supprimer une notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
