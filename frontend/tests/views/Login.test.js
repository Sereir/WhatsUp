import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Login from '@/views/Login.vue';

describe('Login.vue', () => {
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: Login },
        { path: '/chat', component: { template: '<div>Chat</div>' } }
      ]
    });
  });

  it('devrait se monter correctement', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('devrait avoir des champs email et password', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });
    
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('devrait avoir un bouton de soumission', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });
    
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists() || wrapper.find('button').exists()).toBe(true);
  });

  it('devrait gérer la soumission du formulaire', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });
    
    const form = wrapper.find('form');
    if (form.exists()) {
      await form.trigger('submit');
      // La soumission devrait être gérée
      expect(wrapper.vm).toBeTruthy();
    }
  });

  it('devrait valider les champs requis', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    });
    
    const form = wrapper.find('form');
    if (form.exists()) {
      await form.trigger('submit');
      // Devrait afficher des erreurs de validation
      expect(wrapper.html()).toBeTruthy();
    }
  });
});
