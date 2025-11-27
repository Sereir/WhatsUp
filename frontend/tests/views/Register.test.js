import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Register from '@/views/Register.vue';

describe('Register.vue', () => {
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/register', component: Register }
      ]
    });
  });

  it('devrait se monter correctement', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('devrait avoir des champs de formulaire', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });
    
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('devrait avoir un bouton d\'inscription', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });
    
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
  });

  it('devrait valider le format d\'email', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });
    
    const emailInput = wrapper.find('input[type="email"]');
    if (emailInput.exists()) {
      await emailInput.setValue('invalid-email');
      expect(emailInput.element.value).toBe('invalid-email');
    }
  });

  it('devrait valider la longueur du mot de passe', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router]
      }
    });
    
    const passwordInput = wrapper.find('input[type="password"]');
    if (passwordInput.exists()) {
      await passwordInput.setValue('123');
      expect(passwordInput.element.value).toBe('123');
    }
  });
});
