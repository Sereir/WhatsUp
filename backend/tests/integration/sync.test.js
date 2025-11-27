/**
 * Tests d'intégration pour l'API Sync
 */

const request = require('supertest');
const app = require('../../src/app');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, createTestConversation, createTestMessage, generateTestToken } = require('../helpers/testHelpers');
const Message = require('../../src/models/Message');

describe('Sync API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/sync/missed-updates', () => {
    it('devrait synchroniser les données depuis un timestamp', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser({ email: 'other@test.com' });
      const token = generateTestToken(user._id);

      // Créer une conversation et des messages
      const conversation = await createTestConversation([user._id, otherUser._id]);
      
      // Attendre un peu pour avoir un timestamp différent
      await new Promise(resolve => setTimeout(resolve, 100));
      const timestamp = new Date();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Créer des messages après le timestamp
      await createTestMessage(user._id, conversation._id, 'Message 1');
      await createTestMessage(otherUser._id, conversation._id, 'Message 2');

      const res = await request(app)
        .get(`/api/sync/missed-updates?since=${timestamp.toISOString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('notifications');
    });

    it('ne devrait pas synchroniser sans authentification', async () => {
      const res = await request(app)
        .get('/api/sync/missed-updates?since=' + new Date().toISOString());

      expect(res.status).toBe(401);
    });

    it('devrait retourner une erreur si le timestamp est invalide', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .get('/api/sync/missed-updates?since=invalid-timestamp')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('devrait retourner une erreur si le timestamp est manquant', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .get('/api/sync/missed-updates')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});
