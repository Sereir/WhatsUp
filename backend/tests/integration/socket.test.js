/**
 * Tests WebSocket (Socket.io) pour les événements temps réel
 */

const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const socketIOClient = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, createTestUsers, createTestConversation, createTestMessage } = require('../helpers/testHelpers');
const User = require('../../src/models/User');
const Conversation = require('../../src/models/Conversation');
const Message = require('../../src/models/Message');

describe('WebSocket (Socket.io) Tests', () => {
  let server, io;
  let clientSocket1, clientSocket2;
  let user1, user2;
  let token1, token2;
  let conversation;
  const PORT = 5002;

  beforeAll(async () => {
    await connectDatabase();

    // Créer un serveur Express avec Socket.io
    const app = express();
    server = http.createServer(app);
    io = socketIO(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Middleware d'authentification Socket.io
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    // Gérer les connexions
    io.on('connection', (socket) => {
      console.log('User connected:', socket.userId);

      // Joindre les rooms des conversations
      socket.on('conversation:join', async (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation:${conversationId}`);
      });

      // Gérer les nouveaux messages
      socket.on('message:send', async (data) => {
        io.to(`conversation:${data.conversationId}`).emit('message:new', {
          message: data,
          conversationId: data.conversationId
        });
      });

      // Gérer les réactions
      socket.on('reaction:add', async (data) => {
        io.to(`conversation:${data.conversationId}`).emit('reaction:added', {
          messageId: data.messageId,
          conversationId: data.conversationId,
          reaction: data.reaction
        });
      });

      // Gérer le typing
      socket.on('typing:start', (data) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:update', {
          userId: socket.userId,
          conversationId: data.conversationId,
          isTyping: true
        });
      });

      socket.on('typing:stop', (data) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:update', {
          userId: socket.userId,
          conversationId: data.conversationId,
          isTyping: false
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
      });
    });

    // Démarrer le serveur
    await new Promise((resolve) => {
      server.listen(PORT, () => {
        console.log(`Test server listening on port ${PORT}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (clientSocket1) clientSocket1.close();
    if (clientSocket2) clientSocket2.close();
    if (io) io.close();
    if (server) await new Promise((resolve) => server.close(resolve));
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Créer deux utilisateurs et une conversation
    [user1, user2] = await createTestUsers(2);
    token1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    token2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    conversation = await createTestConversation([user1._id, user2._id]);

    // Connecter les clients Socket.io
    clientSocket1 = socketIOClient(`http://localhost:${PORT}`, {
      auth: { token: token1 }
    });

    clientSocket2 = socketIOClient(`http://localhost:${PORT}`, {
      auth: { token: token2 }
    });

    // Attendre la connexion
    await Promise.all([
      new Promise((resolve) => clientSocket1.on('connect', resolve)),
      new Promise((resolve) => clientSocket2.on('connect', resolve))
    ]);

    // Joindre la conversation
    clientSocket1.emit('conversation:join', conversation._id.toString());
    clientSocket2.emit('conversation:join', conversation._id.toString());
    
    // Petit délai pour s'assurer que les rooms sont jointes
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    if (clientSocket1) {
      clientSocket1.removeAllListeners();
    }
    if (clientSocket2) {
      clientSocket2.removeAllListeners();
    }
  });

  describe('Connexion et authentification', () => {
    it('devrait connecter un utilisateur avec un token valide', (done) => {
      expect(clientSocket1.connected).toBe(true);
      expect(clientSocket2.connected).toBe(true);
      done();
    });

    it('ne devrait pas connecter sans token', (done) => {
      const badClient = socketIOClient(`http://localhost:${PORT}`);
      
      badClient.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication error');
        badClient.close();
        done();
      });
    });
  });

  describe('Événements de message', () => {
    it('devrait recevoir un nouveau message', (done) => {
      const testMessage = {
        conversationId: conversation._id.toString(),
        content: 'Hello from test',
        type: 'text',
        sender: user1._id.toString()
      };

      clientSocket2.on('message:new', (data) => {
        expect(data.message.content).toBe('Hello from test');
        expect(data.conversationId).toBe(conversation._id.toString());
        done();
      });

      clientSocket1.emit('message:send', testMessage);
    });

    it('devrait recevoir les deux utilisateurs dans la même conversation', (done) => {
      const testMessage = {
        conversationId: conversation._id.toString(),
        content: 'Broadcast test',
        type: 'text'
      };

      let receivedCount = 0;

      const checkDone = () => {
        receivedCount++;
        if (receivedCount === 2) done();
      };

      clientSocket1.on('message:new', (data) => {
        expect(data.message.content).toBe('Broadcast test');
        checkDone();
      });

      clientSocket2.on('message:new', (data) => {
        expect(data.message.content).toBe('Broadcast test');
        checkDone();
      });

      clientSocket1.emit('message:send', testMessage);
    });
  });

  describe('Événements de réaction', () => {
    it('devrait recevoir l\'ajout d\'une réaction', (done) => {
      const messageId = 'test-message-id';
      const reaction = { emoji: '👍', user: user2._id.toString() };

      clientSocket1.on('reaction:added', (data) => {
        expect(data.messageId).toBe(messageId);
        expect(data.reaction.emoji).toBe('👍');
        done();
      });

      clientSocket2.emit('reaction:add', {
        messageId,
        conversationId: conversation._id.toString(),
        reaction
      });
    });
  });

  describe('Événements de typing', () => {
    it('devrait recevoir l\'indicateur de typing', (done) => {
      clientSocket2.on('typing:update', (data) => {
        expect(data.userId).toBe(user1._id.toString());
        expect(data.isTyping).toBe(true);
        expect(data.conversationId).toBe(conversation._id.toString());
        done();
      });

      clientSocket1.emit('typing:start', {
        conversationId: conversation._id.toString()
      });
    });

    it('devrait recevoir l\'arrêt de typing', (done) => {
      clientSocket2.on('typing:update', (data) => {
        if (data.isTyping === false) {
          expect(data.userId).toBe(user1._id.toString());
          done();
        }
      });

      clientSocket1.emit('typing:start', {
        conversationId: conversation._id.toString()
      });

      setTimeout(() => {
        clientSocket1.emit('typing:stop', {
          conversationId: conversation._id.toString()
        });
      }, 100);
    });
  });

  describe('Gestion des rooms', () => {
    it('ne devrait pas recevoir de messages d\'une autre conversation', (done) => {
      const anotherConvId = 'another-conversation-id';
      let messageReceived = false;

      clientSocket2.on('message:new', () => {
        messageReceived = true;
      });

      // Envoyer un message à une autre conversation
      clientSocket1.emit('message:send', {
        conversationId: anotherConvId,
        content: 'Should not receive',
        type: 'text'
      });

      // Vérifier après un délai
      setTimeout(() => {
        expect(messageReceived).toBe(false);
        done();
      }, 300);
    });
  });

  describe('Déconnexion', () => {
    it('devrait gérer proprement la déconnexion', (done) => {
      clientSocket1.on('disconnect', () => {
        expect(clientSocket1.connected).toBe(false);
        done();
      });

      clientSocket1.close();
    });
  });
});
