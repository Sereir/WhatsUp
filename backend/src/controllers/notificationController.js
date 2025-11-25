const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Obtenir toutes les notifications de l'utilisateur
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;
    
    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .populate('conversation', 'name isGroup avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Erreur getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
};

/**
 * Obtenir le nombre de notifications non lues
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    logger.error('Erreur getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du compteur'
    });
  }
};

/**
 * Marquer une notification comme lue
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    await notification.markAsRead();
    
    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    logger.error('Erreur markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la notification'
    });
  }
};

/**
 * Marquer toutes les notifications comme lues
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    logger.error('Erreur markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des notifications'
    });
  }
};

/**
 * Supprimer une notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    logger.error('Erreur deleteNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

/**
 * Supprimer toutes les notifications lues
 */
exports.deleteAllRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const result = await Notification.deleteMany({
      recipient: userId,
      read: true
    });
    
    res.json({
      success: true,
      message: `${result.deletedCount} notifications supprimées`
    });
  } catch (error) {
    logger.error('Erreur deleteAllRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};
