/**
 * Configuration globale Jest
 * Exécuté avant tous les tests
 */

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRE = '7d';
process.env.PORT = 5001;

// Désactiver Sentry en mode test
process.env.SENTRY_DSN = '';

// Augmenter le timeout pour les tests de base de données
jest.setTimeout(30000);

// Mock console en mode test (optionnel)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
