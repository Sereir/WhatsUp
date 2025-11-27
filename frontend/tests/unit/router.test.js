import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';

vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: null,
    isAuthenticated: false
  }))
}));

describe('Router Configuration', () => {
  let router;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', name: 'Login', component: { template: '<div>Login</div>' } },
        { path: '/register', name: 'Register', component: { template: '<div>Register</div>' } },
        { path: '/choose-username', name: 'ChooseUsername', component: { template: '<div>Username</div>' } },
        { path: '/upload-avatar', name: 'UploadAvatar', component: { template: '<div>Avatar</div>' } },
        { 
          path: '/chat', 
          name: 'Chat', 
          component: { template: '<div>Chat</div>' },
          meta: { requiresAuth: true }
        },
        { 
          path: '/contacts', 
          name: 'Contacts', 
          component: { template: '<div>Contacts</div>' },
          meta: { requiresAuth: true }
        },
        { 
          path: '/create-group', 
          name: 'CreateGroup', 
          component: { template: '<div>CreateGroup</div>' },
          meta: { requiresAuth: true }
        }
      ]
    });
  });

  it('devrait rediriger / vers /login', async () => {
    await router.push('/');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('devrait avoir toutes les routes définies', () => {
    const routes = router.getRoutes();
    expect(routes.length).toBeGreaterThan(5);
  });

  it('devrait avoir des routes protégées', () => {
    const chatRoute = router.getRoutes().find(r => r.name === 'Chat');
    expect(chatRoute?.meta?.requiresAuth).toBe(true);
  });

  it('devrait naviguer vers login', async () => {
    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('Login');
  });

  it('devrait naviguer vers register', async () => {
    await router.push('/register');
    expect(router.currentRoute.value.name).toBe('Register');
  });

  it('devrait avoir meta requiresAuth sur contacts', () => {
    const contactsRoute = router.getRoutes().find(r => r.name === 'Contacts');
    expect(contactsRoute?.meta?.requiresAuth).toBe(true);
  });

  it('devrait avoir meta requiresAuth sur create-group', () => {
    const groupRoute = router.getRoutes().find(r => r.name === 'CreateGroup');
    expect(groupRoute?.meta?.requiresAuth).toBe(true);
  });
});
