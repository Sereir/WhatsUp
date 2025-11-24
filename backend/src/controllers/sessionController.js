const Session = require('../models/Session');
const { generateToken } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Créer une nouvelle session
 */
const createSession = async (userId, req) => {
  try {
    const refreshToken = generateToken(userId);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';
    
    // Expiration dans 30 jours
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const session = await Session.create({
      user: userId,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt
    });
    
    logger.info(`Session créée pour l'utilisateur: ${userId} depuis ${ipAddress}`);
    
    return session;
    
  } catch (error) {
    logger.error('Erreur createSession:', error);
    throw error;
  }
};

/**
 * Obtenir les sessions actives
 */
const getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const sessions = await Session.getActiveSessions(userId);
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session._id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          lastActivity: session.lastActivity,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt
        })),
        total: sessions.length
      }
    });
    
  } catch (error) {
    logger.error('Erreur getActiveSessions:', error);
    next(error);
  }
};

/**
 * Révoquer une session spécifique
 */
const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await Session.findOne({
      _id: sessionId,
      user: userId
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }
    
    session.isActive = false;
    await session.save();
    
    logger.info(`Session révoquée: ${sessionId} pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      message: 'Session révoquée avec succès'
    });
    
  } catch (error) {
    logger.error('Erreur revokeSession:', error);
    next(error);
  }
};

/**
 * Révoquer toutes les autres sessions
 */
const revokeOtherSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const currentSessionId = req.body.currentSessionId;
    
    if (!currentSessionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de session courante requis'
      });
    }
    
    const result = await Session.revokeOtherSessions(userId, currentSessionId);
    
    logger.info(`${result.modifiedCount} sessions révoquées pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      message: `${result.modifiedCount} session(s) révoquée(s)`,
      data: {
        revoked: result.modifiedCount
      }
    });
    
  } catch (error) {
    logger.error('Erreur revokeOtherSessions:', error);
    next(error);
  }
};

/**
 * Nettoyer les sessions inactives
 */
const cleanupSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const result = await Session.cleanupInactiveSessions(userId);
    
    logger.info(`${result.deletedCount} sessions nettoyées pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      message: `${result.deletedCount} session(s) supprimée(s)`,
      data: {
        deleted: result.deletedCount
      }
    });
    
  } catch (error) {
    logger.error('Erreur cleanupSessions:', error);
    next(error);
  }
};

/**
 * Obtenir l'historique des sessions
 */
const getSessionHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const sessions = await Session.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session._id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          isActive: session.isActive,
          lastActivity: session.lastActivity,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt
        })),
        total: sessions.length
      }
    });
    
  } catch (error) {
    logger.error('Erreur getSessionHistory:', error);
    next(error);
  }
};

module.exports = {
  createSession,
  getActiveSessions,
  revokeSession,
  revokeOtherSessions,
  cleanupSessions,
  getSessionHistory
};
