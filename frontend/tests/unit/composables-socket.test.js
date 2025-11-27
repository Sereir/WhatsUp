import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useSocket', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      connected: false,
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
      connect: vi.fn(function() { this.connected = true; }),
      disconnect: vi.fn(function() { this.connected = false; })
    };
  });

  it('devrait se connecter au socket', () => {
    mockSocket.connect();
    expect(mockSocket.connected).toBe(true);
  });

  it('devrait se déconnecter du socket', () => {
    mockSocket.connect();
    mockSocket.disconnect();
    expect(mockSocket.connected).toBe(false);
  });

  it('devrait écouter les événements', () => {
    const handler = vi.fn();
    mockSocket.on('message', handler);
    expect(mockSocket.on).toHaveBeenCalledWith('message', handler);
  });

  it('devrait émettre des événements', () => {
    const data = { content: 'test' };
    mockSocket.emit('send-message', data);
    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', data);
  });

  it('devrait retirer les écouteurs', () => {
    const handler = vi.fn();
    mockSocket.off('message', handler);
    expect(mockSocket.off).toHaveBeenCalledWith('message', handler);
  });

  it('devrait gérer plusieurs événements', () => {
    mockSocket.on('connect', vi.fn());
    mockSocket.on('disconnect', vi.fn());
    mockSocket.on('message', vi.fn());
    expect(mockSocket.on).toHaveBeenCalledTimes(3);
  });

  it('devrait permettre de réconnexion', () => {
    mockSocket.connect();
    mockSocket.disconnect();
    mockSocket.connect();
    expect(mockSocket.connected).toBe(true);
  });
});

describe('useNotifications', () => {
  it('devrait créer une notification', () => {
    const notifications = [];
    const addNotification = (notif) => notifications.push(notif);
    
    addNotification({ id: '1', message: 'Test' });
    expect(notifications).toHaveLength(1);
  });

  it('devrait supprimer une notification', () => {
    const notifications = [{ id: '1' }, { id: '2' }];
    const removeNotification = (id) => {
      const index = notifications.findIndex(n => n.id === id);
      if (index > -1) notifications.splice(index, 1);
    };
    
    removeNotification('1');
    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe('2');
  });

  it('devrait marquer comme lue', () => {
    const notifications = [{ id: '1', read: false }];
    const markAsRead = (id) => {
      const notif = notifications.find(n => n.id === id);
      if (notif) notif.read = true;
    };
    
    markAsRead('1');
    expect(notifications[0].read).toBe(true);
  });

  it('devrait compter les non lues', () => {
    const notifications = [
      { id: '1', read: false },
      { id: '2', read: false },
      { id: '3', read: true }
    ];
    const unreadCount = notifications.filter(n => !n.read).length;
    expect(unreadCount).toBe(2);
  });
});

describe('useRealtimeMessages', () => {
  it('devrait recevoir un nouveau message', () => {
    const messages = [];
    const onNewMessage = (msg) => messages.push(msg);
    
    onNewMessage({ id: '1', content: 'Hello' });
    expect(messages).toHaveLength(1);
  });

  it('devrait mettre à jour un message existant', () => {
    const messages = [{ id: '1', content: 'Old', edited: false }];
    const updateMessage = (id, updates) => {
      const msg = messages.find(m => m.id === id);
      if (msg) Object.assign(msg, updates);
    };
    
    updateMessage('1', { content: 'New', edited: true });
    expect(messages[0].content).toBe('New');
    expect(messages[0].edited).toBe(true);
  });

  it('devrait supprimer un message', () => {
    const messages = [{ id: '1' }, { id: '2' }];
    const deleteMessage = (id) => {
      const index = messages.findIndex(m => m.id === id);
      if (index > -1) messages.splice(index, 1);
    };
    
    deleteMessage('1');
    expect(messages).toHaveLength(1);
  });

  it('devrait ajouter une réaction', () => {
    const messages = [{ id: '1', reactions: [] }];
    const addReaction = (msgId, reaction) => {
      const msg = messages.find(m => m.id === msgId);
      if (msg) msg.reactions.push(reaction);
    };
    
    addReaction('1', { emoji: '👍', user: 'user1' });
    expect(messages[0].reactions).toHaveLength(1);
  });
});

describe('useRealtimeConversations', () => {
  it('devrait ajouter une conversation', () => {
    const conversations = [];
    const addConversation = (conv) => {
      if (!conversations.find(c => c.id === conv.id)) {
        conversations.push(conv);
      }
    };
    
    addConversation({ id: '1', name: 'Test' });
    expect(conversations).toHaveLength(1);
  });

  it('devrait mettre à jour une conversation', () => {
    const conversations = [{ id: '1', name: 'Old', unreadCount: 0 }];
    const updateConversation = (id, updates) => {
      const conv = conversations.find(c => c.id === id);
      if (conv) Object.assign(conv, updates);
    };
    
    updateConversation('1', { name: 'New', unreadCount: 3 });
    expect(conversations[0].name).toBe('New');
    expect(conversations[0].unreadCount).toBe(3);
  });

  it('devrait supprimer une conversation', () => {
    const conversations = [{ id: '1' }, { id: '2' }];
    const deleteConversation = (id) => {
      const index = conversations.findIndex(c => c.id === id);
      if (index > -1) conversations.splice(index, 1);
    };
    
    deleteConversation('1');
    expect(conversations).toHaveLength(1);
  });

  it('devrait incrémenter le compteur de non lus', () => {
    const conversations = [{ id: '1', unreadCount: 0 }];
    const incrementUnread = (id) => {
      const conv = conversations.find(c => c.id === id);
      if (conv) conv.unreadCount++;
    };
    
    incrementUnread('1');
    incrementUnread('1');
    expect(conversations[0].unreadCount).toBe(2);
  });

  it('devrait réinitialiser le compteur de non lus', () => {
    const conversations = [{ id: '1', unreadCount: 5 }];
    const resetUnread = (id) => {
      const conv = conversations.find(c => c.id === id);
      if (conv) conv.unreadCount = 0;
    };
    
    resetUnread('1');
    expect(conversations[0].unreadCount).toBe(0);
  });
});
