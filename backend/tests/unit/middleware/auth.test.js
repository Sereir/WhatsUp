const auth = require('../../../src/middleware/auth.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');
jest.mock('../../../src/utils/logger');

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('devrait extraire le token du header', async () => {
      req.headers.authorization = 'Bearer valid_token';
      jwt.verify = jest.fn().mockReturnValue({ userId: 'user123' });

      await auth.authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalled();
    });

    it('devrait rejeter sans token', async () => {
      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('devrait rejeter avec token invalide', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
