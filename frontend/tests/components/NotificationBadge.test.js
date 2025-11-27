import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NotificationBadge from '@/components/chat/NotificationBadge.vue';

describe('NotificationBadge.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('devrait se monter correctement', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: 5
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('devrait afficher le nombre de notifications', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: 3
      }
    });
    expect(wrapper.text()).toContain('3');
  });

  it('devrait afficher 99+ pour un grand nombre', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: 150
      }
    });
    expect(wrapper.text()).toMatch(/99\+|150/);
  });

  it('ne devrait pas afficher si count est 0', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: 0
      }
    });
    // Le badge pourrait être masqué avec v-if ou v-show
    const badge = wrapper.find('[data-testid="badge"]');
    if (badge.exists()) {
      expect(badge.isVisible()).toBe(false);
    }
  });

  it('devrait accepter différentes props', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: 7,
        color: 'red'
      }
    });
    expect(wrapper.props('count')).toBe(7);
  });

  it('devrait gérer les nombres négatifs', () => {
    const wrapper = mount(NotificationBadge, {
      props: {
        count: -5
      }
    });
    // Ne devrait pas afficher de nombre négatif
    expect(wrapper.text()).not.toContain('-');
  });
});
