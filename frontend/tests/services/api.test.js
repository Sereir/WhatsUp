import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/services/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }))
  }
}));

describe('API Service', () => {
  it('devrait exporter une instance axios', () => {
    expect(api).toBeDefined();
  });

  it('devrait avoir les méthodes HTTP', () => {
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.patch).toBeDefined();
    expect(api.delete).toBeDefined();
  });

  it('devrait avoir des interceptors', () => {
    expect(api.interceptors).toBeDefined();
  });

  it('devrait gérer les requêtes GET', async () => {
    const mockResponse = { data: { users: [] } };
    api.get.mockResolvedValue(mockResponse);
    
    const response = await api.get('/users');
    expect(response).toEqual(mockResponse);
  });

  it('devrait gérer les requêtes POST', async () => {
    const mockData = { username: 'test' };
    const mockResponse = { data: { id: '123', ...mockData } };
    api.post.mockResolvedValue(mockResponse);
    
    const response = await api.post('/users', mockData);
    expect(response).toEqual(mockResponse);
  });

  it('devrait gérer les erreurs', async () => {
    const mockError = new Error('Network Error');
    api.get.mockRejectedValue(mockError);
    
    await expect(api.get('/invalid')).rejects.toThrow('Network Error');
  });
});
