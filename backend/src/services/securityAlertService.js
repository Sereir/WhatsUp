const SecurityAlert = require('../models/SecurityAlert');
const logger = require('../utils/logger');
const { captureMessage } = require('../config/sentry');

/**
 * Service pour gérer les alertes de sécurité
 */
class SecurityAlertService {
  
  /**
   * Créer une alerte de connexion
   */
  static async logLogin(userId, req, success = true) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      const alertData = {
        user: userId,
        type: 'new_login',
        severity: success ? 'low' : 'medium',
        ipAddress,
        userAgent,
        details: {
          success,
          timestamp: new Date(),
          endpoint: req.originalUrl
        }
      };
      
      const alert = await SecurityAlert.createAlert(alertData);
      
      logger.info(`Alerte de connexion créée pour user ${userId}`, {
        alertId: alert._id,
        success
      });
      
      if (!success) {
        // Vérifier les tentatives multiples
        await this.checkMultipleFailedLogins(userId, ipAddress);
      }
      
      return alert;
    } catch (error) {
      logger.error('Erreur logLogin:', error);
    }
  }
  
  /**
   * Vérifier les tentatives de connexion échouées multiples
   */
  static async checkMultipleFailedLogins(userId, ipAddress) {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const failedAttempts = await SecurityAlert.countDocuments({
        user: userId,
        type: 'new_login',
        'details.success': false,
        ipAddress,
        createdAt: { $gte: fiveMinutesAgo }
      });
      
      if (failedAttempts >= 5) {
        await SecurityAlert.createAlert({
          user: userId,
          type: 'multiple_failed_logins',
          severity: 'high',
          ipAddress,
          details: {
            failedAttempts,
            timeWindow: '5 minutes'
          }
        });
        
        captureMessage('Multiple failed login attempts', 'warning', {
          userId: userId.toString(),
          ipAddress,
          failedAttempts
        });
      }
    } catch (error) {
      logger.error('Erreur checkMultipleFailedLogins:', error);
    }
  }
  
  /**
   * Alerter modification de profil
   */
  static async logProfileChange(userId, changes, req) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      
      const alert = await SecurityAlert.createAlert({
        user: userId,
        type: 'profile_change',
        severity: 'low',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: {
          changes,
          timestamp: new Date()
        }
      });
      
      logger.info(`Alerte de modification de profil pour user ${userId}`);
      
      return alert;
    } catch (error) {
      logger.error('Erreur logProfileChange:', error);
    }
  }
  
  /**
   * Alerter modification de paramètres
   */
  static async logSettingsChange(userId, settingType, req) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      
      const alert = await SecurityAlert.createAlert({
        user: userId,
        type: 'settings_change',
        severity: 'low',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: {
          settingType,
          timestamp: new Date()
        }
      });
      
      logger.info(`Alerte de modification de paramètres pour user ${userId}`);
      
      return alert;
    } catch (error) {
      logger.error('Erreur logSettingsChange:', error);
    }
  }
  
  /**
   * Alerter ajout de contact
   */
  static async logContactAdded(userId, contactId, req) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      
      const alert = await SecurityAlert.createAlert({
        user: userId,
        type: 'contact_added',
        severity: 'low',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: {
          contactId: contactId.toString(),
          timestamp: new Date()
        }
      });
      
      logger.info(`Alerte d'ajout de contact pour user ${userId}`);
      
      return alert;
    } catch (error) {
      logger.error('Erreur logContactAdded:', error);
    }
  }
  
  /**
   * Alerter blocage de contact
   */
  static async logContactBlocked(userId, contactId, req) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      
      const alert = await SecurityAlert.createAlert({
        user: userId,
        type: 'contact_blocked',
        severity: 'medium',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: {
          contactId: contactId.toString(),
          timestamp: new Date()
        }
      });
      
      logger.info(`Alerte de blocage de contact pour user ${userId}`);
      
      return alert;
    } catch (error) {
      logger.error('Erreur logContactBlocked:', error);
    }
  }
  
  /**
   * Alerter changement de mot de passe
   */
  static async logPasswordChange(userId, req) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      
      const alert = await SecurityAlert.createAlert({
        user: userId,
        type: 'password_change',
        severity: 'high',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: {
          timestamp: new Date()
        }
      });
      
      logger.info(`Alerte de changement de mot de passe pour user ${userId}`);
      
      captureMessage('Password changed', 'info', {
        userId: userId.toString(),
        ipAddress
      });
      
      return alert;
    } catch (error) {
      logger.error('Erreur logPasswordChange:', error);
    }
  }
  
  /**
   * Obtenir les alertes d'un utilisateur
   */
  static async getUserAlerts(userId, options = {}) {
    try {
      const { limit = 50, skip = 0, resolved = null, severity = null } = options;
      
      const query = { user: userId };
      if (resolved !== null) query.resolved = resolved;
      if (severity) query.severity = severity;
      
      const alerts = await SecurityAlert.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await SecurityAlert.countDocuments(query);
      
      return { alerts, total };
    } catch (error) {
      logger.error('Erreur getUserAlerts:', error);
      throw error;
    }
  }
}

module.exports = SecurityAlertService;
