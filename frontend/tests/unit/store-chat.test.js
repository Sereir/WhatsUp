import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { defineStore } from 'pinia';

const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    messages: {},
    activeConversationId: null
  }),
  getters: {
    activeConversation: (state) => {
      return state.conversations.find(c => c._id === state.activeConversationId);
    },
    getMessages: (state) => (conversationId) => {
      return state.messages[conversationId] || [];
    },
    unreadCount: (state) => {
      return state.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    }
  },
  actions: {
    addConversation(conversation) {
      const exists = this.conversations.find(c => c._id === conversation._id);
      if (!exists) {
        this.conversations.push(conversation);
      }
    },
    setActiveConversation(conversationId) {
      this.activeConversationId = conversationId;
    },
    addMessage(conversationId, message) {
      if (!this.messages[conversationId]) {
        this.messages[conversationId] = [];
      }
      this.messages[conversationId].push(message);
    },
    removeConversation(conversationId) {
      this.conversations = this.conversations.filter(c => c._id !== conversationId);
      delete this.messages[conversationId];
    },
    updateMessage(conversationId, messageId, updates) {
      const messages = this.messages[conversationId];
      if (messages) {
        const index = messages.findIndex(m => m._id === messageId);
        if (index !== -1) {
          messages[index] = { ...messages[index], ...updates };
        }
      }
    }
  }
});

describe('Chat Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('devrait initialiser avec des valeurs par défaut', () => {
    const store = useChatStore();
    expect(store.conversations).toEqual([]);
    expect(store.messages).toEqual({});
    expect(store.activeConversationId).toBeNull();
  });

  it('devrait ajouter une conversation', () => {
    const store = useChatStore();
    const conv = { _id: 'conv1', name: 'Test' };
    store.addConversation(conv);
    expect(store.conversations).toHaveLength(1);
    expect(store.conversations[0]).toEqual(conv);
  });

  it('ne devrait pas ajouter une conversation en double', () => {
    const store = useChatStore();
    const conv = { _id: 'conv1', name: 'Test' };
    store.addConversation(conv);
    store.addConversation(conv);
    expect(store.conversations).toHaveLength(1);
  });

  it('devrait définir la conversation active', () => {
    const store = useChatStore();
    store.addConversation({ _id: 'conv1', name: 'Test' });
    store.setActiveConversation('conv1');
    expect(store.activeConversationId).toBe('conv1');
  });

  it('devrait ajouter un message', () => {
    const store = useChatStore();
    const message = { _id: 'msg1', content: 'Hello' };
    store.addMessage('conv1', message);
    expect(store.messages.conv1).toHaveLength(1);
    expect(store.messages.conv1[0]).toEqual(message);
  });

  it('devrait récupérer les messages d\'une conversation', () => {
    const store = useChatStore();
    store.addMessage('conv1', { _id: 'msg1', content: 'Hello' });
    store.addMessage('conv1', { _id: 'msg2', content: 'World' });
    
    const messages = store.getMessages('conv1');
    expect(messages).toHaveLength(2);
  });

  it('devrait retourner un tableau vide pour conversation sans messages', () => {
    const store = useChatStore();
    const messages = store.getMessages('inexistant');
    expect(messages).toEqual([]);
  });

  it('devrait supprimer une conversation', () => {
    const store = useChatStore();
    store.addConversation({ _id: 'conv1', name: 'Test' });
    store.addMessage('conv1', { _id: 'msg1', content: 'Hello' });
    
    store.removeConversation('conv1');
    expect(store.conversations).toHaveLength(0);
    expect(store.messages.conv1).toBeUndefined();
  });

  it('devrait mettre à jour un message', () => {
    const store = useChatStore();
    store.addMessage('conv1', { _id: 'msg1', content: 'Hello', edited: false });
    
    store.updateMessage('conv1', 'msg1', { content: 'Updated', edited: true });
    
    const messages = store.getMessages('conv1');
    expect(messages[0].content).toBe('Updated');
    expect(messages[0].edited).toBe(true);
  });

  it('devrait calculer le nombre total de messages non lus', () => {
    const store = useChatStore();
    store.addConversation({ _id: 'conv1', unreadCount: 3 });
    store.addConversation({ _id: 'conv2', unreadCount: 5 });
    
    expect(store.unreadCount).toBe(8);
  });

  it('devrait gérer les conversations sans unreadCount', () => {
    const store = useChatStore();
    store.addConversation({ _id: 'conv1' });
    store.addConversation({ _id: 'conv2', unreadCount: 2 });
    
    expect(store.unreadCount).toBe(2);
  });

  it('devrait retourner la conversation active', () => {
    const store = useChatStore();
    const conv = { _id: 'conv1', name: 'Active' };
    store.addConversation(conv);
    store.setActiveConversation('conv1');
    
    expect(store.activeConversation).toEqual(conv);
  });
});
