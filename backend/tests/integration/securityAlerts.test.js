/**
 * Tests d'intégration pour l'API Security Alerts
 */

const request = require('supertest');
const app = require('../../src/app');
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');
const SecurityAlert = require('../../src/models/SecurityAlert');

describe('Security Alert API Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('GET /api/security-alerts', () => {
    it('devrait récupérer les alertes de sécurité', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      // Créer quelques alertes
      await SecurityAlert.create({
        user: user._id,
        type: 'new_login',
        severity: 'medium',
        ipAddress: '192.168.1.1',
        details: { reason: 'Tentative de connexion' }
      });

      await SecurityAlert.create({
        user: user._id,
        type: 'password_change',
        severity: 'high',
        ipAddress: '192.168.1.2',
        details: { reason: 'Changement de mot de passe' }
      });

      const res = await request(app)
        .get('/api/security-alerts')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alerts.length).toBeGreaterThanOrEqual(2);
    });

    it('ne devrait pas récupérer les alertes sans authentification', async () => {
      const res = await request(app)
        .get('/api/security-alerts');

      expect(res.status).toBe(401);
    });

    it('devrait filtrer les alertes par sévérité', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      await SecurityAlert.create({
        user: user._id,
        type: 'suspicious_activity',
        severity: 'high',
        ipAddress: '192.168.1.1',
        details: { reason: 'Alerte haute' }
      });

      await SecurityAlert.create({
        user: user._id,
        type: 'new_login',
        severity: 'low',
        ipAddress: '192.168.1.2',
        details: { reason: 'Alerte basse' }
      });

      const res = await request(app)
        .get('/api/security-alerts?severity=high')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.alerts.every(a => a.severity === 'high')).toBe(true);
    });
  });

  describe('PUT /api/security-alerts/:id/resolve', () => {
    it('devrait marquer une alerte comme résolue', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id);

      const alert = await SecurityAlert.create({
        user: user._id,
        type: 'new_login',
        severity: 'medium',
        ipAddress: '192.168.1.1',
        details: { reason: 'Test' },
        resolved: false
      });

      const res = await request(app)
        .put(`/api/security-alerts/${alert._id}/resolve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alert.resolved).toBe(true);
    });
  });

});
