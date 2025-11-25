const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ConversationView = require('../models/ConversationView');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Middleware d'authentification pour Socket.io
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Token manquant'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Utilisateur non trouvé'));
    }
    
    // Attacher l'utilisateur au socket
    socket.user = user;
    socket.userId = user._id.toString();
    
    next();
  } catch (error) {
    logger.error('Erreur authentification socket:', error);
    next(new Error('Authentification échouée'));
  }
};

/**
 * Initialiser Socket.io avec le serveur HTTP
 */
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });
  
  // Middleware d'authentification
  io.use(authenticateSocket);
  
  // Map pour suivre les utilisateurs connectés
  const onlineUsers = new Map(); // userId -> [socketIds]
  
  io.on('connection', (socket) => {
    const userId = socket.userId;
    
    logger.info(`Socket connecté: ${socket.id} - Utilisateur: ${socket.user.email}`);
    
    // Ajouter l'utilisateur à la liste des connectés
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, []);
    }
    onlineUsers.get(userId).push(socket.id);
    
    // Mettre à jour le statut en ligne dans la base de données
    User.findByIdAndUpdate(userId, { 
      status: 'online',
      lastSeen: new Date()
    }).catch(err => {
      logger.error('Erreur mise à jour statut online:', err);
    });
    
    // Notifier les autres que l'utilisateur est en ligne
    socket.broadcast.emit('user:online', {
      userId: userId,
      timestamp: new Date(),
      user: {
        _id: socket.user._id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        avatar: socket.user.avatar
      }
    });
    
    // Demander les messages/notifications manqués
    socket.on('sync:request', async ({ lastSyncDate }) => {
      try {
        const syncDate = lastSyncDate ? new Date(lastSyncDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Récupérer les notifications manquées
        const missedNotifications = await Notification.find({
          recipient: userId,
          createdAt: { $gt: syncDate }
        })
          .populate('sender', 'firstName lastName avatar')
          .populate('conversation', 'name isGroup avatar')
          .sort({ createdAt: -1 })
          .limit(100);
        
        // Récupérer les messages manqués (depuis les conversations de l'utilisateur)
        const missedMessages = await Message.find({
          createdAt: { $gt: syncDate },
          sender: { $ne: userId }
        })
          .populate('sender', 'firstName lastName avatar')
          .populate('conversation')
          .sort({ createdAt: -1 })
          .limit(100);
        
        // Filtrer les messages des conversations dont l'utilisateur est membre
        const userMessages = missedMessages.filter(msg => 
          msg.conversation && msg.conversation.participants.some(p => p.toString() === userId.toString())
        );
        
        socket.emit('sync:response', {
          notifications: missedNotifications,
          messages: userMessages,
          syncDate: new Date()
        });
        
        logger.info(`Sync effectué pour user ${userId} depuis ${syncDate}`);
      } catch (error) {
        logger.error('Erreur sync:request:', error);
        socket.emit('sync:error', { message: 'Erreur lors de la synchronisation' });
      }
    });
    
    // Rejoindre les conversations de l'utilisateur
    socket.on('conversation:join', async (conversationId) => {
      try {
        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${userId} rejoint conversation ${conversationId}`);
        
        socket.emit('conversation:joined', { conversationId });
      } catch (error) {
        logger.error('Erreur conversation:join:', error);
        socket.emit('error', { message: 'Erreur lors de la connexion à la conversation' });
      }
    });
    
    // Quitter une conversation
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${userId} quitte conversation ${conversationId}`);
    });
    
    // Indicateur de saisie
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        timestamp: new Date(),
        user: {
          _id: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });
    
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: userId,
        timestamp: new Date()
      });
    });
    
    // Marquer une conversation comme vue
    socket.on('conversation:view', async ({ conversationId, messageId }) => {
      try {
        await ConversationView.updateView(userId, conversationId, messageId);
        
        // Notifier les autres participants
        socket.to(`conversation:${conversationId}`).emit('conversation:viewed', {
          conversationId,
          userId,
          messageId,
          viewedAt: new Date()
        });
        
        logger.info(`User ${userId} a vu la conversation ${conversationId}`);
      } catch (error) {
        logger.error('Erreur conversation:view:', error);
      }
    });
    
    // Envoi de message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, tempId } = data;
        
        // Le message sera créé via l'API REST
        // Ici on confirme juste la réception
        socket.emit('message:sending', { tempId, conversationId });
        
      } catch (error) {
        logger.error('Erreur message:send:', error);
        socket.emit('message:error', { 
          tempId: data.tempId,
          error: error.message 
        });
      }
    });
    
    // Message livré
    socket.on('message:delivered', async ({ messageId, conversationId }) => {
      try {
        // Notifier l'expéditeur que le message a été livré
        socket.to(`conversation:${conversationId}`).emit('message:delivered', {
          messageId,
          conversationId,
          deliveredBy: userId,
          deliveredAt: new Date()
        });
      } catch (error) {
        logger.error('Erreur message:delivered:', error);
      }
    });
    
    // Message lu
    socket.on('message:read', async ({ messageId, conversationId }) => {
      try {
        // Notifier l'expéditeur que le message a été lu
        socket.to(`conversation:${conversationId}`).emit('message:read', {
          messageId,
          conversationId,
          readBy: userId,
          readAt: new Date()
        });
      } catch (error) {
        logger.error('Erreur message:read:', error);
      }
    });
    
    // Message supprimé
    socket.on('message:delete', ({ messageId, conversationId, deleteForEveryone }) => {
      socket.to(`conversation:${conversationId}`).emit('message:deleted', {
        messageId,
        conversationId,
        deleteForEveryone,
        deletedBy: userId
      });
    });
    
    // Message édité
    socket.on('message:edit', ({ messageId, conversationId, content }) => {
      socket.to(`conversation:${conversationId}`).emit('message:edited', {
        messageId,
        conversationId,
        content,
        editedBy: userId,
        editedAt: new Date()
      });
    });
    
    // Réaction ajoutée
    socket.on('reaction:add', ({ messageId, conversationId, emoji }) => {
      socket.to(`conversation:${conversationId}`).emit('reaction:added', {
        messageId,
        conversationId,
        emoji,
        user: {
          _id: socket.user._id,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName
        }
      });
    });
    
    // Réaction retirée
    socket.on('reaction:remove', ({ messageId, conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('reaction:removed', {
        messageId,
        conversationId,
        userId: userId
      });
    });
    
    // Heartbeat - le client envoie ping, on répond pong
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });
    
    // Reconnexion détectée
    socket.on('reconnect_attempt', () => {
      logger.info(`Tentative de reconnexion pour user ${userId}`);
    });
    
    socket.on('reconnect', () => {
      logger.info(`User ${userId} reconnecté`);
      socket.emit('reconnected', { 
        userId, 
        timestamp: new Date(),
        message: 'Reconnexion réussie' 
      });
    });
    
    // Déconnexion
    socket.on('disconnect', () => {
      logger.info(`Socket déconnecté: ${socket.id} - Utilisateur: ${socket.user.email}`);
      
      // Retirer le socket de la liste
      if (onlineUsers.has(userId)) {
        const sockets = onlineUsers.get(userId).filter(id => id !== socket.id);
        
        if (sockets.length === 0) {
          // L'utilisateur n'a plus de sockets connectés
          onlineUsers.delete(userId);
          
          const now = new Date();
          
          // Mettre à jour le statut et lastSeen dans la base de données
          User.findByIdAndUpdate(userId, { 
            status: 'offline',
            lastSeen: now 
          }).catch(err => {
            logger.error('Erreur mise à jour lastSeen:', err);
          });
          
          // Notifier les autres que l'utilisateur est hors ligne
          socket.broadcast.emit('user:offline', {
            userId: userId,
            lastSeen: now,
            timestamp: now
          });
        } else {
          onlineUsers.set(userId, sockets);
        }
      }
    });
    
    // Gestion erreurs
    socket.on('error', (error) => {
      logger.error(`Erreur socket ${socket.id}:`, error);
    });
  });
  
  // Fonction helper pour émettre à tous les sockets d'un utilisateur
  io.emitToUser = (userId, event, data) => {
    const socketIds = onlineUsers.get(userId.toString());
    if (socketIds) {
      socketIds.forEach(socketId => {
        io.to(socketId).emit(event, data);
      });
    }
  };
  
  // Fonction helper pour vérifier si un utilisateur est en ligne
  io.isUserOnline = (userId) => {
    return onlineUsers.has(userId.toString());
  };
  
  // Fonction helper pour obtenir tous les utilisateurs en ligne
  io.getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
  };
  
  logger.info('Socket.io initialisé avec succès');
  
  return io;
};

module.exports = { initializeSocket };
