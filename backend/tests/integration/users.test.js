/**
 * Tests d'intégration pour l'API Users
 */

const request = require('supertest');
const app = require('../../src/app');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/users/:id', () => {
    it('devrait récupérer le profil d\'un utilisateur', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(user.email);
    });

    it('ne devrait pas récupérer le profil sans authentification', async () => {
      const user = await createTestUser();

      const res = await request(app)
        .get(`/api/users/${user._id}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/users/profile', () => {
    it('devrait mettre à jour le profil utilisateur', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'newusername',
          bio: 'New bio'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('newusername');
      expect(res.body.data.user.bio).toBe('New bio');
    });

    it('ne devrait pas accepter un username invalide', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'ab' // Trop court
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/search', () => {
    it('devrait rechercher des utilisateurs', async () => {
      const user1 = await createTestUser({ username: 'alice', email: 'alice@test.com' });
      const user2 = await createTestUser({ username: 'alison', email: 'alison@test.com' });
      const user3 = await createTestUser({ username: 'bob', email: 'bob@test.com' });
      const token = generateTestToken(user1._id);

      const res = await request(app)
        .get('/api/users/search?q=ali')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
    });

    it('devrait retourner une liste vide si aucun utilisateur trouvé', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .get('/api/users/search?q=nonexistentuser12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBe(0);
    });
  });
});
