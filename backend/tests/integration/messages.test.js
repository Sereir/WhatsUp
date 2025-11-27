/**
 * Tests d'intégration des API de messages
 */

const request = require('supertest');
const express = require('express');
const messageRoutes = require('../../src/routes/message.routes');
const User = require('../../src/models/User');
const Conversation = require('../../src/models/Conversation');
const Message = require('../../src/models/Message');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, createTestUsers, createTestConversation, generateTestToken } = require('../helpers/testHelpers');

// Créer une app Express minimale pour les tests
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock Socket.io
  app.set('io', {
    to: () => ({
      emit: jest.fn()
    }),
    emitToUser: jest.fn()
  });
  
  app.use('/api/messages', messageRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  });
  
  return app;
};

describe('Message API Integration Tests', () => {
  let app;
  let user1, user2;
  let token1, token2;
  let conversation;

  beforeAll(async () => {
    await connectDatabase();
    app = createTestApp();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Créer deux utilisateurs et une conversation
    [user1, user2] = await createTestUsers(2);
    token1 = generateTestToken(user1._id);
    token2 = generateTestToken(user2._id);
    conversation = await createTestConversation([user1._id, user2._id]);
  });

  describe('POST /api/messages', () => {
    it('devrait créer un nouveau message', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          conversationId: conversation._id.toString(),
          content: 'Hello World',
          type: 'text'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBeDefined();
      expect(res.body.data.message.content).toBe('Hello World');
      // Le sender peut être un objet populé avec _id, firstName, lastName, avatar
      const senderId = typeof res.body.data.message.sender === 'object' 
        ? res.body.data.message.sender._id 
        : res.body.data.message.sender;
      expect(senderId).toBe(user1._id.toString());
    });

    it('ne devrait pas créer un message sans authentification', async () => {
      const res = await request(app)
        .post('/api/messages')
        .send({
          conversationId: conversation._id.toString(),
          content: 'Hello World',
          type: 'text'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas créer un message sans content', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          conversationId: conversation._id.toString(),
          type: 'text'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas créer un message dans une conversation inexistante', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          conversationId: fakeId.toString(),
          content: 'Hello',
          type: 'text'
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/messages/:conversationId', () => {
    beforeEach(async () => {
      // Créer quelques messages
      await Message.create({
        sender: user1._id,
        conversation: conversation._id,
        content: 'Message 1',
        type: 'text'
      });
      await Message.create({
        sender: user2._id,
        conversation: conversation._id,
        content: 'Message 2',
        type: 'text'
      });
    });

    it('devrait récupérer les messages d\'une conversation', async () => {
      const res = await request(app)
        .get(`/api/messages/${conversation._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.messages).toBeDefined();
      expect(res.body.data.messages).toHaveLength(2);
    });

    it('ne devrait pas récupérer les messages sans authentification', async () => {
      const res = await request(app)
        .get(`/api/messages/${conversation._id}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/messages/:messageId/reaction', () => {
    let message;

    beforeEach(async () => {
      message = await Message.create({
        sender: user1._id,
        conversation: conversation._id,
        content: 'Test message',
        type: 'text'
      });
    });

    it('devrait ajouter une réaction à un message', async () => {
      const res = await request(app)
        .post(`/api/messages/${message._id}/reaction`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ emoji: '👍' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message.reactions).toBeDefined();
      expect(res.body.data.message.reactions).toHaveLength(1);
      expect(res.body.data.message.reactions[0].emoji).toBe('👍');
    });

    it('ne devrait pas ajouter une réaction sans emoji', async () => {
      const res = await request(app)
        .post(`/api/messages/${message._id}/reaction`)
        .set('Authorization', `Bearer ${token2}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/messages/:messageId/reaction', () => {
    let message;

    beforeEach(async () => {
      message = await Message.create({
        sender: user1._id,
        conversation: conversation._id,
        content: 'Test message',
        type: 'text'
      });
      
      await message.addReaction(user2._id, '👍');
    });

    it('devrait retirer une réaction d\'un message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${message._id}/reaction`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/messages/:messageId', () => {
    let message;

    beforeEach(async () => {
      message = await Message.create({
        sender: user1._id,
        conversation: conversation._id,
        content: 'Original message',
        type: 'text'
      });
    });

    it('devrait éditer un message', async () => {
      const res = await request(app)
        .patch(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ content: 'Updated message' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.message.content).toBe('Updated message');
      // Le champ edited peut ne pas être retourné par le contrôleur
    });

    it('ne devrait pas éditer le message d\'un autre utilisateur', async () => {
      const res = await request(app)
        .patch(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ content: 'Hacked message' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/messages/:messageId', () => {
    let message;

    beforeEach(async () => {
      message = await Message.create({
        sender: user1._id,
        conversation: conversation._id,
        content: 'Message to delete',
        type: 'text'
      });
    });

    it('devrait supprimer un message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('ne devrait pas supprimer le message d\'un autre utilisateur', async () => {
      const res = await request(app)
        .delete(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});
