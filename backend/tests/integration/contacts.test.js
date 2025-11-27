/**
 * Tests d'intégration pour l'API Contacts
 */

const request = require('supertest');
const app = require('../../src/app');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');

describe('Contact API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/contacts', () => {
    it('devrait ajouter un contact', async () => {
      const user = await createTestUser();
      const contactUser = await createTestUser({ email: 'contact@test.com' });
      const token = generateTestToken(user._id);

      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactId: contactUser._id.toString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contact).toBeDefined();
    });

    it('ne devrait pas ajouter un contact déjà existant', async () => {
      const user = await createTestUser();
      const contactUser = await createTestUser({ email: 'contact@test.com' });
      const token = generateTestToken(user._id);

      // Premier ajout
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactId: contactUser._id.toString()
        });

      // Deuxième ajout (devrait échouer)
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactId: contactUser._id.toString()
        });

      expect(res.status).toBe(400);
    });

    it('ne devrait pas ajouter soi-même comme contact', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contactId: user._id.toString()
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/contacts', () => {
    it('devrait récupérer la liste des contacts', async () => {
      const user = await createTestUser();
      const contact1 = await createTestUser({ email: 'contact1@test.com' });
      const contact2 = await createTestUser({ email: 'contact2@test.com' });
      const token = generateTestToken(user._id);

      // Ajouter des contacts
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact1._id.toString() });

      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contact2._id.toString() });

      // Récupérer la liste
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DELETE /api/contacts/:contactId', () => {
    it('devrait supprimer un contact', async () => {
      const user = await createTestUser();
      const contactUser = await createTestUser({ email: 'contact@test.com' });
      const token = generateTestToken(user._id);

      // Ajouter le contact
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contactUser._id.toString() });

      // Supprimer le contact
      const res = await request(app)
        .delete(`/api/contacts/${contactUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('ne devrait pas supprimer un contact inexistant', async () => {
      const user = await createTestUser();
      const contactUser = await createTestUser({ email: 'contact@test.com' });
      const token = generateTestToken(user._id);

      const res = await request(app)
        .delete(`/api/contacts/${contactUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/contacts/:contactId/name', () => {
    it('devrait mettre à jour un contact', async () => {
      const user = await createTestUser();
      const contactUser = await createTestUser({ email: 'contact@test.com' });
      const token = generateTestToken(user._id);

      // Ajouter le contact
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contactUser._id.toString() });

      // Mettre à jour le contact
      const res = await request(app)
        .patch(`/api/contacts/${contactUser._id}/name`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          customName: 'Best Friend'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contact.customName).toBe('Best Friend');
    });
  });

  describe('PATCH /api/contacts/:contactId/favorite', () => {
    it('devrait basculer le favori d\'un contact', async () => {
      const user = await createTestUser();
      const contactUser = await createTestUser({ email: 'contact@test.com' });
      const token = generateTestToken(user._id);

      // Ajouter le contact
      await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token}`)
        .send({ contactId: contactUser._id.toString() });

      // Basculer le favori
      const res = await request(app)
        .patch(`/api/contacts/${contactUser._id}/favorite`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contact.isFavorite).toBe(true);
    });
  });
});
