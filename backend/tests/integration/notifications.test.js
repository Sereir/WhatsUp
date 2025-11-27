/**
 * Tests d'intégration pour l'API Notifications
 */

const request = require('supertest');
const app = require('../../src/app');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, createTestConversation, generateTestToken } = require('../helpers/testHelpers');
const Notification = require('../../src/models/Notification');

describe('Notification API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/notifications', () => {
    it('devrait récupérer les notifications de l\'utilisateur', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      // Créer quelques notifications
      await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'Vous avez reçu un message'
      });

      await Notification.create({
        recipient: user._id,
        type: 'group_add',
        content: 'Vous avez été ajouté à un groupe'
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(2);
    });

    it('ne devrait pas récupérer les notifications sans authentification', async () => {
      const res = await request(app)
        .get('/api/notifications');

      expect(res.status).toBe(401);
    });

    it('devrait filtrer les notifications non lues', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'Non lu',
        read: false
      });

      await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'Déjà lu',
        read: true
      });

      const res = await request(app)
        .get('/api/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.every(n => !n.read)).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('devrait marquer une notification comme lue', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const notification = await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'Test notification',
        read: false
      });

      const res = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notification.read).toBe(true);
    });
  });

  describe('PUT /api/notifications/mark-all-read', () => {
    it('devrait marquer toutes les notifications comme lues', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'Message 1',
        read: false
      });

      await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'Message 2',
        read: false
      });

      const res = await request(app)
        .put('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Vérifier que toutes sont lues
      const notifications = await Notification.find({ recipient: user._id });
      expect(notifications.every(n => n.read)).toBe(true);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('devrait supprimer une notification', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const notification = await Notification.create({
        recipient: user._id,
        type: 'message',
        content: 'À supprimer'
      });

      const res = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Vérifier que la notification a été supprimée
      const deleted = await Notification.findById(notification._id);
      expect(deleted).toBeNull();
    });

    it('ne devrait pas supprimer la notification d\'un autre utilisateur', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const token1 = generateTestToken(user1._id);

      const notification = await Notification.create({
        recipient: user2._id,
        type: 'message',
        content: 'Pas à toi'
      });

      const res = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(404);
    });
  });

});
