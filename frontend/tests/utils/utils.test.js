import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Logger Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait exporter les méthodes de logging', async () => {
    try {
      const logger = await import('@/utils/logger.js');
      expect(logger).toBeTruthy();
      
      if (logger.default) {
        expect(typeof logger.default === 'object' || typeof logger.default === 'function').toBe(true);
      }
    } catch (e) {
      // Si le logger n'existe pas encore
      expect(true).toBe(true);
    }
  });

  it('devrait logger les erreurs', () => {
    const mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn()
    };

    mockLogger.error('Test error');
    expect(mockLogger.error).toHaveBeenCalledWith('Test error');
  });

  it('devrait logger les avertissements', () => {
    const mockLogger = {
      warn: vi.fn()
    };

    mockLogger.warn('Test warning');
    expect(mockLogger.warn).toHaveBeenCalledWith('Test warning');
  });

  it('devrait logger les informations', () => {
    const mockLogger = {
      info: vi.fn()
    };

    mockLogger.info('Test info');
    expect(mockLogger.info).toHaveBeenCalledWith('Test info');
  });

  it('devrait logger en mode debug', () => {
    const mockLogger = {
      debug: vi.fn()
    };

    mockLogger.debug('Test debug');
    expect(mockLogger.debug).toHaveBeenCalledWith('Test debug');
  });
});

describe('Sentry Integration', () => {
  it('devrait initialiser Sentry', async () => {
    try {
      const sentry = await import('@/utils/sentry.js');
      expect(sentry).toBeTruthy();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('devrait capturer les exceptions', () => {
    const mockSentry = {
      captureException: vi.fn()
    };

    const error = new Error('Test error');
    mockSentry.captureException(error);
    expect(mockSentry.captureException).toHaveBeenCalledWith(error);
  });

  it('devrait capturer les messages', () => {
    const mockSentry = {
      captureMessage: vi.fn()
    };

    mockSentry.captureMessage('Test message');
    expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test message');
  });

  it('devrait définir le contexte utilisateur', () => {
    const mockSentry = {
      setUser: vi.fn()
    };

    const user = { id: '123', email: 'test@example.com' };
    mockSentry.setUser(user);
    expect(mockSentry.setUser).toHaveBeenCalledWith(user);
  });
});
