const logger = require('../../../src/utils/logger');

describe('Logger Utility Tests', () => {
  it('devrait avoir les méthodes de log', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('devrait logger un message info sans erreur', () => {
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  it('devrait logger un message error sans erreur', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('devrait logger un message warn sans erreur', () => {
    expect(() => {
      logger.warn('Test warn message');
    }).not.toThrow();
  });

  it('devrait logger un message debug sans erreur', () => {
    expect(() => {
      logger.debug('Test debug message');
    }).not.toThrow();
  });

  it('devrait logger avec des métadonnées', () => {
    expect(() => {
      logger.info('Test avec métadonnées', { userId: '123', action: 'test' });
    }).not.toThrow();
  });

  it('devrait logger une erreur avec stack trace', () => {
    expect(() => {
      const error = new Error('Test error');
      logger.error('Erreur test', { error: error.stack });
    }).not.toThrow();
  });
});
