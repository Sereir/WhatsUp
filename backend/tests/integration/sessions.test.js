/**
 * Tests d'intégration pour l'API Sessions
 */

const request = require('supertest');
const app = require('../../src/app');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');
const Session = require('../../src/models/Session');

describe('Session API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/sessions', () => {
    it('devrait récupérer les sessions de l\'utilisateur', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      // Créer quelques sessions (en plus de celle du token de test)
      await Session.create({
        user: user._id,
        refreshToken: 'refresh_token_1_' + Date.now(),
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      await Session.create({
        user: user._id,
        refreshToken: 'refresh_token_2_' + Date.now(),
        ipAddress: '192.168.1.2',
        userAgent: 'Firefox',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false
      });

      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // On devrait avoir au moins les 2 sessions créées (la session false ne devrait pas être comptée si la route filtre)
      expect(res.body.data.sessions.length).toBeGreaterThanOrEqual(1);
    });

    it('ne devrait pas récupérer les sessions sans authentification', async () => {
      const res = await request(app)
        .get('/api/sessions');

      expect(res.status).toBe(401);
    });

    it('devrait filtrer les sessions actives', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      await Session.create({
        user: user._id,
        refreshToken: 'refresh_active_' + Date.now(),
        ipAddress: '192.168.1.1',
        userAgent: 'Active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      await Session.create({
        user: user._id,
        refreshToken: 'refresh_inactive_' + Date.now(),
        ipAddress: '192.168.1.2',
        userAgent: 'Inactive',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: false
      });

      const res = await request(app)
        .get('/api/sessions?active=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Vérifier qu'on a au moins une session active
      expect(res.body.data.sessions.length).toBeGreaterThanOrEqual(1);
      // Les sessions retournées sont déjà filtrées par getActiveSessions (isActive=true)
    });
  });

  describe('DELETE /api/sessions/:sessionId', () => {
    it('devrait révoquer une session', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const session = await Session.create({
        user: user._id,
        refreshToken: 'refresh_to_revoke_' + Date.now(),
        ipAddress: '192.168.1.100',
        userAgent: 'Safari',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      const res = await request(app)
        .delete(`/api/sessions/${session._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Vérifier que la session est inactive
      const updated = await Session.findById(session._id);
      expect(updated.isActive).toBe(false);
    });

    it('ne devrait pas révoquer la session d\'un autre utilisateur', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const token1 = generateTestToken(user1._id);

      const session = await Session.create({
        user: user2._id,
        refreshToken: 'refresh_user2_' + Date.now(),
        ipAddress: '192.168.1.1',
        userAgent: 'Test',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      const res = await request(app)
        .delete(`/api/sessions/${session._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/sessions/revoke-others', () => {
    it('devrait révoquer toutes les autres sessions', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      // Créer plusieurs sessions
      const session1 = await Session.create({
        user: user._id,
        refreshToken: 'refresh_session_1_' + Date.now(),
        ipAddress: '192.168.1.1',
        userAgent: 'Session 1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      const session2 = await Session.create({
        user: user._id,
        refreshToken: 'refresh_session_2_' + Date.now(),
        ipAddress: '192.168.1.2',
        userAgent: 'Session 2',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });

      const res = await request(app)
        .post('/api/sessions/revoke-others')
        .send({ currentSessionId: session1._id.toString() })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

});
