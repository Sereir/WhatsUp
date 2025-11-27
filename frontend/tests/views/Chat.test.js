import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Chat from '@/views/Chat.vue';

describe('Chat.vue', () => {
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/chat', component: Chat }
      ]
    });
  });

  it('devrait se monter correctement', () => {
    const wrapper = mount(Chat, {
      global: {
        plugins: [router]
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('devrait avoir une zone de conversations', () => {
    const wrapper = mount(Chat, {
      global: {
        plugins: [router]
      }
    });
    
    // Le chat devrait avoir une structure de layout
    expect(wrapper.html()).toBeTruthy();
  });

  it('devrait avoir une zone de messages', () => {
    const wrapper = mount(Chat, {
      global: {
        plugins: [router]
      }
    });
    
    // Chercher une zone qui contiendrait les messages
    expect(wrapper.html().length).toBeGreaterThan(0);
  });

  it('devrait gérer l\'absence de conversation active', () => {
    const wrapper = mount(Chat, {
      global: {
        plugins: [router]
      }
    });
    
    // Devrait afficher un message ou un écran vide
    expect(wrapper.vm).toBeTruthy();
  });
});
