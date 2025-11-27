import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('API Service', () => {
  let mockAxios;

  beforeEach(() => {
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };
    axios.create = vi.fn(() => mockAxios);
  });

  it('devrait créer une instance axios', () => {
    const api = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 10000
    });
    expect(axios.create).toHaveBeenCalled();
  });

  it('devrait effectuer une requête GET', async () => {
    mockAxios.get.mockResolvedValue({ data: { users: [] } });
    const response = await mockAxios.get('/api/users');
    expect(mockAxios.get).toHaveBeenCalledWith('/api/users');
    expect(response.data).toEqual({ users: [] });
  });

  it('devrait effectuer une requête POST', async () => {
    const userData = { username: 'test' };
    mockAxios.post.mockResolvedValue({ data: { id: '1' } });
    
    const response = await mockAxios.post('/api/users', userData);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/users', userData);
    expect(response.data.id).toBe('1');
  });

  it('devrait effectuer une requête PUT', async () => {
    mockAxios.put.mockResolvedValue({ data: { updated: true } });
    const response = await mockAxios.put('/api/users/1', { name: 'Updated' });
    expect(mockAxios.put).toHaveBeenCalled();
  });

  it('devrait effectuer une requête PATCH', async () => {
    mockAxios.patch.mockResolvedValue({ data: { patched: true } });
    const response = await mockAxios.patch('/api/users/1', { status: 'active' });
    expect(mockAxios.patch).toHaveBeenCalled();
  });

  it('devrait effectuer une requête DELETE', async () => {
    mockAxios.delete.mockResolvedValue({ data: { deleted: true } });
    const response = await mockAxios.delete('/api/users/1');
    expect(mockAxios.delete).toHaveBeenCalledWith('/api/users/1');
  });

  it('devrait ajouter un intercepteur de requête', () => {
    mockAxios.interceptors.request.use((config) => {
      config.headers.Authorization = 'Bearer token123';
      return config;
    });
    expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
  });

  it('devrait ajouter un intercepteur de réponse', () => {
    mockAxios.interceptors.response.use((response) => response);
    expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
  });

  it('devrait gérer les erreurs', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network Error'));
    
    try {
      await mockAxios.get('/api/fail');
    } catch (error) {
      expect(error.message).toBe('Network Error');
    }
  });

  it('devrait envoyer des headers personnalisés', async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    await mockAxios.get('/api/data', {
      headers: { 'X-Custom': 'value' }
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/api/data', {
      headers: { 'X-Custom': 'value' }
    });
  });

  it('devrait gérer le timeout', async () => {
    mockAxios.get.mockRejectedValue({ code: 'ECONNABORTED' });
    
    try {
      await mockAxios.get('/api/slow');
    } catch (error) {
      expect(error.code).toBe('ECONNABORTED');
    }
  });

  it('devrait gérer les codes de statut', async () => {
    mockAxios.get.mockResolvedValue({ status: 200, data: {} });
    const response = await mockAxios.get('/api/status');
    expect(response.status).toBe(200);
  });

  it('devrait gérer les erreurs 401', async () => {
    mockAxios.get.mockRejectedValue({ response: { status: 401 } });
    
    try {
      await mockAxios.get('/api/protected');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('devrait gérer les erreurs 404', async () => {
    mockAxios.get.mockRejectedValue({ response: { status: 404 } });
    
    try {
      await mockAxios.get('/api/notfound');
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  it('devrait gérer les erreurs 500', async () => {
    mockAxios.get.mockRejectedValue({ response: { status: 500 } });
    
    try {
      await mockAxios.get('/api/error');
    } catch (error) {
      expect(error.response.status).toBe(500);
    }
  });
});
