/**
 * Tests d'intégration des API d'authentification - VERSION CORRIGÉE
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth.routes');
const User = require('../../src/models/User');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');

// Créer une app Express minimale pour les tests
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock Socket.io
  app.set('io', {
    to: () => ({ emit: jest.fn() }),
    emitToUser: jest.fn()
  });
  
  app.use('/api/auth', authRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  });
  
  return app;
};

describe('Auth API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await connectDatabase();
    app = createTestApp();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('ne devrait pas créer un utilisateur avec un email invalide', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ 
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas créer un utilisateur avec un email existant', async () => {
      await User.create({
        email: 'existing@test.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'existuser'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Smith'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('email');
    });

    it('ne devrait pas créer un utilisateur sans password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'logintest@test.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        username: 'testlogin'
      });
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'Password123!'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.email).toBe('logintest@test.com');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.password).toBeUndefined();
    });

    it('ne devrait pas connecter avec un email inexistant', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas connecter avec un mauvais mot de passe', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com',
          password: 'WrongPassword!'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas connecter sans email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Password123!'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas connecter sans password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@test.com'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner le profil de l\'utilisateur connecté', async () => {
      // Créer un utilisateur
      await User.create({
        email: 'metest@test.com',
        password: 'Password123!',
        firstName: 'Me',
        lastName: 'User',
        username: 'metest'
      });
      
      // Se connecter pour obtenir le token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'metest@test.com',
          password: 'Password123!'
        });

      const token = loginRes.body.data.token;

      // Récupérer le profil
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBeDefined();
      expect(res.body.data.email).toBe('metest@test.com');
      expect(res.body.data.password).toBeUndefined();
    });

    it('ne devrait pas retourner le profil sans token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('ne devrait pas retourner le profil avec un token invalide', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('devrait déconnecter un utilisateur', async () => {
      // Créer et connecter
      await User.create({
        email: 'logouttest@test.com',
        password: 'Password123!',
        firstName: 'Logout',
        lastName: 'User',
        username: 'logouttest'
      });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logouttest@test.com',
          password: 'Password123!'
        });

      const token = loginRes.body.data.token;

      // Se déconnecter
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
