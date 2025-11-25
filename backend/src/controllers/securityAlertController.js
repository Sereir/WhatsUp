const SecurityAlert = require('../models/SecurityAlert');
const SecurityAlertService = require('../services/securityAlertService');
const logger = require('../utils/logger');

/**
 * Obtenir les alertes de sécurité de l'utilisateur
 */
exports.getMyAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, resolved } = req.query;
    
    const options = {
      limit: parseInt(limit),
      skip: (page - 1) * parseInt(limit),
      severity,
      resolved: resolved !== undefined ? resolved === 'true' : null
    };
    
    const { alerts, total } = await SecurityAlertService.getUserAlerts(req.user._id, options);
    
    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Erreur getMyAlerts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des alertes'
    });
  }
};

/**
 * Marquer une alerte comme résolue
 */
exports.markAlertResolved = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;
    
    const alert = await SecurityAlert.findOne({
      _id: alertId,
      user: userId
    });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alerte non trouvée'
      });
    }
    
    await alert.markResolved();
    
    res.json({
      success: true,
      message: 'Alerte marquée comme résolue',
      data: { alert }
    });
  } catch (error) {
    logger.error('Erreur markAlertResolved:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'alerte'
    });
  }
};

/**
 * Obtenir les statistiques des alertes
 */
exports.getAlertStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const total = await SecurityAlert.countDocuments({ user: userId });
    const unresolved = await SecurityAlert.countDocuments({ user: userId, resolved: false });
    const critical = await SecurityAlert.countDocuments({ user: userId, severity: 'critical', resolved: false });
    const high = await SecurityAlert.countDocuments({ user: userId, severity: 'high', resolved: false });
    
    // Alertes par type
    const byType = await SecurityAlert.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        unresolved,
        critical,
        high,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Erreur getAlertStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};
