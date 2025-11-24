# Étape 1.5 : Plan de Tests Complet

## Introduction

Ce document définit la stratégie de tests pour l'application WhatsApp Clone. Il couvre les tests unitaires, d'intégration, end-to-end et de performance.

---

## 1. Stratégie de Tests Globale

### Pyramide de Tests

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲           <- 10% (Tests end-to-end)
                 ╱──────╲
                ╱        ╲
               ╱Integration╲       <- 30% (Tests d'intégration)
              ╱────────────╲
             ╱              ╲
            ╱   Unit Tests   ╲    <- 60% (Tests unitaires)
           ╱──────────────────╲
```

### Outils de Test

**Backend**
- **Jest** : Framework de test principal
- **Supertest** : Tests d'API HTTP
- **MongoDB Memory Server** : Base de données en mémoire pour les tests
- **Socket.io-client** : Tests WebSocket

**Frontend**
- **Vitest** : Framework de test (alternative Jest pour Vite)
- **Vue Test Utils** : Utilitaires pour tester les composants Vue
- **Cypress** : Tests E2E
- **Mock Service Worker (MSW)** : Mock des API

### Couverture de Code

**Objectifs minimums :**
- Tests unitaires : **80%** de couverture
- Tests d'intégration : **70%** de couverture
- Tests E2E : Couverture des **user flows critiques**

---

## 2. Tests Backend

### 2.1 Tests Unitaires - Modèles

#### Test : User Model

```javascript
// tests/unit/models/User.test.js
const User = require('../../../src/models/User');
const { connectDB, closeDB, clearDB } = require('../../setup');

describe('User Model', () => {
  beforeAll(async () => await connectDB());
  afterAll(async () => await closeDB());
  afterEach(async () => await clearDB());

  describe('Validation', () => {
    it('devrait créer un utilisateur valide', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe('John');
      expect(savedUser.email).toBe('john@example.com');
    });

    it('devrait rejeter un email invalide', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123!'
      });
      
      await expect(user.save()).rejects.toThrow();
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Pass1!'
      });
      
      await expect(user.save()).rejects.toThrow();
    });

    it('devrait rejeter un email en double', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };
      
      await new User(userData).save();
      
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Méthodes', () => {
    it('devrait hasher le mot de passe avant sauvegarde', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!'
      });
      
      await user.save();
      
      expect(user.password).not.toBe('Password123!');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('devrait comparer correctement les mots de passe', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!'
      });
      
      await user.save();
      
      const userFromDB = await User.findById(user._id).select('+password');
      const isMatch = await userFromDB.comparePassword('Password123!');
      const isNotMatch = await userFromDB.comparePassword('WrongPassword');
      
      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('devrait retourner le nom complet', () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!'
      });
      
      expect(user.getFullName()).toBe('John Doe');
    });
  });

  describe('Recherche', () => {
    beforeEach(async () => {
      await User.create([
        { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', password: 'Password123!' },
        { firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', password: 'Password123!' },
        { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', password: 'Password123!' }
      ]);
    });

    it('devrait trouver des utilisateurs par prénom', async () => {
      const results = await User.search('Alice');
      
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('Alice');
    });

    it('devrait trouver des utilisateurs par email', async () => {
      const results = await User.search('bob@');
      
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('bob@example.com');
    });

    it('devrait être insensible à la casse', async () => {
      const results = await User.search('ALICE');
      
      expect(results).toHaveLength(1);
    });
  });
});
```

#### Test : Message Model

```javascript
// tests/unit/models/Message.test.js
describe('Message Model', () => {
  let conversation, user1, user2;

  beforeEach(async () => {
    user1 = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'Password123!'
    });

    user2 = await User.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      password: 'Password123!'
    });

    conversation = await Conversation.create({
      participants: [
        { user: user1._id },
        { user: user2._id }
      ],
      createdBy: user1._id
    });
  });

  it('devrait créer un message texte', async () => {
    const message = await Message.create({
      conversation: conversation._id,
      sender: user1._id,
      type: 'text',
      content: 'Hello, World!'
    });

    expect(message._id).toBeDefined();
    expect(message.content).toBe('Hello, World!');
    expect(message.status).toBe('sent');
  });

  it('devrait marquer un message comme lu', async () => {
    const message = await Message.create({
      conversation: conversation._id,
      sender: user1._id,
      type: 'text',
      content: 'Hello!'
    });

    await message.markAsReadBy(user2._id);

    expect(message.readBy).toHaveLength(1);
    expect(message.readBy[0].user.toString()).toBe(user2._id.toString());
    expect(message.status).toBe('read');
  });

  it('devrait ajouter une réaction', async () => {
    const message = await Message.create({
      conversation: conversation._id,
      sender: user1._id,
      type: 'text',
      content: 'Great!'
    });

    await message.addReaction(user2._id, '👍');

    expect(message.reactions).toHaveLength(1);
    expect(message.reactions[0].emoji).toBe('👍');
  });

  it('devrait mettre à jour lastMessage de la conversation', async () => {
    const message = await Message.create({
      conversation: conversation._id,
      sender: user1._id,
      type: 'text',
      content: 'Test'
    });

    const updatedConv = await Conversation.findById(conversation._id);
    
    expect(updatedConv.lastMessage.toString()).toBe(message._id.toString());
  });
});
```

### 2.2 Tests d'Intégration - API

#### Test : Authentification

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/auth/register', () => {
  it('devrait créer un nouvel utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('token');
  });

  it('devrait rejeter un email déjà existant', async () => {
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'john@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!'
    });
  });

  it('devrait connecter un utilisateur valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('devrait rejeter un mot de passe incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('devrait rejeter un email inexistant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(401);
  });
});
```

#### Test : Messages API

```javascript
// tests/integration/messages.test.js
describe('Messages API', () => {
  let token, user, conversation;

  beforeEach(async () => {
    user = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'Password123!'
    });

    const user2 = await User.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      password: 'Password123!'
    });

    conversation = await Conversation.create({
      participants: [{ user: user._id }, { user: user2._id }],
      createdBy: user._id
    });

    // Générer un token JWT
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  });

  describe('GET /api/conversations/:id/messages', () => {
    beforeEach(async () => {
      await Message.create([
        { conversation: conversation._id, sender: user._id, content: 'Message 1', type: 'text' },
        { conversation: conversation._id, sender: user._id, content: 'Message 2', type: 'text' },
        { conversation: conversation._id, sender: user._id, content: 'Message 3', type: 'text' }
      ]);
    });

    it('devrait récupérer les messages d\'une conversation', async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversation._id}/messages`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
    });

    it('devrait rejeter sans authentification', async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversation._id}/messages`);

      expect(res.status).toBe(401);
    });

    it('devrait supporter la pagination', async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversation._id}/messages?page=1&limit=2`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toHaveProperty('page', 1);
      expect(res.body.pagination).toHaveProperty('total', 3);
    });
  });

  describe('POST /api/messages', () => {
    it('devrait créer un nouveau message', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversationId: conversation._id,
          content: 'Hello!',
          type: 'text'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Hello!');
    });

    it('devrait rejeter un message vide', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversationId: conversation._id,
          content: '',
          type: 'text'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/messages/:id', () => {
    let message;

    beforeEach(async () => {
      message = await Message.create({
        conversation: conversation._id,
        sender: user._id,
        content: 'Original content',
        type: 'text'
      });
    });

    it('devrait éditer son propre message', async () => {
      const res = await request(app)
        .patch(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Updated content'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Updated content');
      expect(res.body.data.isEdited).toBe(true);
    });

    it('ne devrait pas éditer le message d\'un autre', async () => {
      const otherUser = await User.create({
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com',
        password: 'Password123!'
      });

      const otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET);

      const res = await request(app)
        .patch(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          content: 'Hacked!'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    let message;

    beforeEach(async () => {
      message = await Message.create({
        conversation: conversation._id,
        sender: user._id,
        content: 'To be deleted',
        type: 'text'
      });
    });

    it('devrait supprimer un message pour tous', async () => {
      const res = await request(app)
        .delete(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ deleteFor: 'everyone' });

      expect(res.status).toBe(200);

      const deletedMessage = await Message.findById(message._id);
      expect(deletedMessage.isDeleted).toBe(true);
    });
  });
});
```

### 2.3 Tests WebSocket

```javascript
// tests/integration/socket.test.js
const io = require('socket.io-client');
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketHandler = require('../../src/socket');

describe('WebSocket Events', () => {
  let ioServer, serverSocket, clientSocket1, clientSocket2;
  let user1, user2, conversation;

  beforeAll((done) => {
    const httpServer = createServer();
    ioServer = new Server(httpServer);
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      socketHandler(ioServer);

      clientSocket1 = io(`http://localhost:${port}`);
      clientSocket2 = io(`http://localhost:${port}`);
      
      done();
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket1.close();
    clientSocket2.close();
  });

  beforeEach(async () => {
    user1 = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'Password123!'
    });

    user2 = await User.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      password: 'Password123!'
    });

    conversation = await Conversation.create({
      participants: [{ user: user1._id }, { user: user2._id }],
      createdBy: user1._id
    });
  });

  it('devrait émettre et recevoir un message', (done) => {
    clientSocket2.on('receive_message', (message) => {
      expect(message.content).toBe('Hello from Alice!');
      expect(message.conversationId).toBe(conversation._id.toString());
      done();
    });

    // User1 envoie un message
    clientSocket1.emit('send_message', {
      conversationId: conversation._id,
      content: 'Hello from Alice!',
      type: 'text',
      senderId: user1._id
    });
  });

  it('devrait mettre à jour le statut "en train d\'écrire"', (done) => {
    clientSocket2.on('user_typing', (data) => {
      expect(data.userId).toBe(user1._id.toString());
      expect(data.conversationId).toBe(conversation._id.toString());
      done();
    });

    clientSocket1.emit('typing_start', {
      conversationId: conversation._id,
      userId: user1._id
    });
  });

  it('devrait marquer les messages comme lus', (done) => {
    clientSocket1.on('messages_read', (data) => {
      expect(data.conversationId).toBe(conversation._id.toString());
      expect(data.userId).toBe(user2._id.toString());
      done();
    });

    clientSocket2.emit('mark_as_read', {
      conversationId: conversation._id,
      userId: user2._id
    });
  });

  it('devrait rejoindre une room de conversation', (done) => {
    clientSocket1.emit('join_conversation', conversation._id, () => {
      // Vérifier que le socket est dans la room
      const rooms = Array.from(clientSocket1.rooms);
      expect(rooms).toContain(conversation._id.toString());
      done();
    });
  });
});
```

### 2.4 Tests de Reconnexion

```javascript
// tests/integration/reconnection.test.js
describe('Reconnexion WebSocket', () => {
  it('devrait se reconnecter automatiquement', (done) => {
    const client = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 100
    });

    let disconnected = false;

    client.on('disconnect', () => {
      disconnected = true;
    });

    client.on('connect', () => {
      if (disconnected) {
        // Reconnecté avec succès
        expect(client.connected).toBe(true);
        client.close();
        done();
      } else {
        // Première connexion, forcer la déconnexion
        client.io.engine.close();
      }
    });
  });

  it('devrait synchroniser les messages manqués', async () => {
    // Simuler une déconnexion
    clientSocket.disconnect();

    // Créer des messages pendant la déconnexion
    const missedMessages = await Message.create([
      { conversation: conversation._id, sender: user2._id, content: 'Missed 1', type: 'text' },
      { conversation: conversation._id, sender: user2._id, content: 'Missed 2', type: 'text' }
    ]);

    // Reconnecter
    clientSocket.connect();

    return new Promise((resolve) => {
      clientSocket.on('sync_messages', (messages) => {
        expect(messages).toHaveLength(2);
        resolve();
      });

      clientSocket.emit('request_sync', {
        lastSyncTimestamp: Date.now() - 60000 // 1 minute ago
      });
    });
  });
});
```

---

## 3. Tests Frontend

### 3.1 Tests de Composants Vue

#### Test : MessageItem Component

```javascript
// tests/unit/components/MessageItem.spec.js
import { mount } from '@vue/test-utils';
import MessageItem from '@/components/chat/MessageItem.vue';

describe('MessageItem.vue', () => {
  const mockMessage = {
    _id: '123',
    content: 'Hello, World!',
    sender: {
      _id: 'user1',
      firstName: 'Alice',
      avatar: 'alice.jpg'
    },
    createdAt: new Date(),
    status: 'read'
  };

  it('devrait afficher le contenu du message', () => {
    const wrapper = mount(MessageItem, {
      props: {
        message: mockMessage,
        isOwn: false
      }
    });

    expect(wrapper.text()).toContain('Hello, World!');
  });

  it('devrait afficher l\'avatar de l\'expéditeur', () => {
    const wrapper = mount(MessageItem, {
      props: {
        message: mockMessage,
        isOwn: false
      }
    });

    const avatar = wrapper.find('img');
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes('src')).toContain('alice.jpg');
  });

  it('devrait appliquer la classe "own" pour les messages envoyés', () => {
    const wrapper = mount(MessageItem, {
      props: {
        message: mockMessage,
        isOwn: true
      }
    });

    expect(wrapper.classes()).toContain('message-own');
  });

  it('devrait afficher les réactions', async () => {
    const messageWithReactions = {
      ...mockMessage,
      reactions: [
        { user: 'user2', emoji: '👍' },
        { user: 'user3', emoji: '❤️' }
      ]
    };

    const wrapper = mount(MessageItem, {
      props: {
        message: messageWithReactions,
        isOwn: false
      }
    });

    expect(wrapper.text()).toContain('👍');
    expect(wrapper.text()).toContain('❤️');
  });

  it('devrait émettre un événement au clic droit', async () => {
    const wrapper = mount(MessageItem, {
      props: {
        message: mockMessage,
        isOwn: true
      }
    });

    await wrapper.trigger('contextmenu');

    expect(wrapper.emitted('showMenu')).toBeTruthy();
  });
});
```

#### Test : MessageInput Component

```javascript
// tests/unit/components/MessageInput.spec.js
describe('MessageInput.vue', () => {
  it('devrait émettre un événement lors de l\'envoi', async () => {
    const wrapper = mount(MessageInput);

    const input = wrapper.find('textarea');
    await input.setValue('Hello!');

    const button = wrapper.find('button[type="submit"]');
    await button.trigger('click');

    expect(wrapper.emitted('send')).toBeTruthy();
    expect(wrapper.emitted('send')[0][0]).toBe('Hello!');
  });

  it('ne devrait pas envoyer un message vide', async () => {
    const wrapper = mount(MessageInput);

    const button = wrapper.find('button[type="submit"]');
    await button.trigger('click');

    expect(wrapper.emitted('send')).toBeFalsy();
  });

  it('devrait émettre l\'événement "typing"', async () => {
    jest.useFakeTimers();

    const wrapper = mount(MessageInput);
    const input = wrapper.find('textarea');

    await input.setValue('H');
    await input.setValue('He');

    expect(wrapper.emitted('typing')).toBeTruthy();

    jest.advanceTimersByTime(3000);

    expect(wrapper.emitted('stoppedTyping')).toBeTruthy();

    jest.useRealTimers();
  });

  it('devrait supporter les emojis', async () => {
    const wrapper = mount(MessageInput);

    await wrapper.vm.insertEmoji('😀');

    expect(wrapper.vm.message).toContain('😀');
  });
});
```

### 3.2 Tests de Stores Pinia

```javascript
// tests/unit/stores/messages.spec.js
import { setActivePinia, createPinia } from 'pinia';
import { useMessagesStore } from '@/stores/messages';
import { vi } from 'vitest';

describe('Messages Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('devrait ajouter un message', () => {
    const store = useMessagesStore();

    const message = {
      _id: '123',
      conversationId: 'conv1',
      content: 'Hello!',
      sender: 'user1'
    };

    store.addMessage(message);

    expect(store.messagesByConversation['conv1']).toHaveLength(1);
    expect(store.messagesByConversation['conv1'][0]._id).toBe('123');
  });

  it('devrait récupérer les messages d\'une conversation', async () => {
    const store = useMessagesStore();

    // Mock de l'API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          data: [
            { _id: '1', content: 'Message 1' },
            { _id: '2', content: 'Message 2' }
          ]
        })
      })
    );

    await store.fetchMessages('conv1');

    expect(store.messagesByConversation['conv1']).toHaveLength(2);
  });

  it('devrait gérer les erreurs', async () => {
    const store = useMessagesStore();

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    await store.fetchMessages('conv1');

    expect(store.error).toBe('Network error');
  });
});
```

### 3.3 Tests d'Intégration Frontend

```javascript
// tests/integration/ChatFlow.spec.js
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import ChatView from '@/views/ChatView.vue';
import { useAuthStore } from '@/stores/auth';
import { useConversationsStore } from '@/stores/conversations';

describe('Flux de Chat Complet', () => {
  let wrapper, authStore, conversationsStore;

  beforeEach(() => {
    const pinia = createPinia();

    wrapper = mount(ChatView, {
      global: {
        plugins: [pinia]
      }
    });

    authStore = useAuthStore();
    conversationsStore = useConversationsStore();

    // Simuler un utilisateur connecté
    authStore.user = { _id: 'user1', firstName: 'Alice' };
  });

  it('devrait afficher la liste des conversations', async () => {
    conversationsStore.conversations = [
      { _id: 'conv1', name: 'Bob', lastMessage: { content: 'Hey!' } },
      { _id: 'conv2', name: 'Charlie', lastMessage: { content: 'Hello' } }
    ];

    await wrapper.vm.$nextTick();

    const conversations = wrapper.findAll('.conversation-item');
    expect(conversations).toHaveLength(2);
  });

  it('devrait ouvrir une conversation au clic', async () => {
    conversationsStore.conversations = [
      { _id: 'conv1', name: 'Bob' }
    ];

    await wrapper.vm.$nextTick();

    const conversationItem = wrapper.find('.conversation-item');
    await conversationItem.trigger('click');

    expect(conversationsStore.activeConversationId).toBe('conv1');
    expect(wrapper.find('.chat-window').exists()).toBe(true);
  });

  it('devrait envoyer un message', async () => {
    conversationsStore.activeConversationId = 'conv1';

    await wrapper.vm.$nextTick();

    const input = wrapper.find('textarea');
    await input.setValue('Test message');

    const sendButton = wrapper.find('button[type="submit"]');
    await sendButton.trigger('click');

    // Vérifier que le message a été ajouté au store
    const messages = conversationsStore.getMessages('conv1');
    expect(messages).toContainEqual(
      expect.objectContaining({ content: 'Test message' })
    );
  });
});
```

---

## 4. Tests End-to-End (Cypress)

### 4.1 Test : Flux d'Authentification

```javascript
// cypress/e2e/auth.cy.js
describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('devrait s\'inscrire avec succès', () => {
    cy.get('[data-cy=register-tab]').click();

    cy.get('[data-cy=firstName-input]').type('John');
    cy.get('[data-cy=lastName-input]').type('Doe');
    cy.get('[data-cy=email-input]').type('john@example.com');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=confirmPassword-input]').type('Password123!');

    cy.get('[data-cy=register-button]').click();

    cy.url().should('include', '/chat');
    cy.contains('Bienvenue, John');
  });

  it('devrait se connecter avec succès', () => {
    // Créer un utilisateur au préalable
    cy.request('POST', '/api/auth/register', {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'Password123!'
    });

    cy.get('[data-cy=email-input]').type('alice@example.com');
    cy.get('[data-cy=password-input]').type('Password123!');

    cy.get('[data-cy=login-button]').click();

    cy.url().should('include', '/chat');
  });

  it('devrait afficher une erreur pour des identifiants incorrects', () => {
    cy.get('[data-cy=email-input]').type('wrong@example.com');
    cy.get('[data-cy=password-input]').type('WrongPassword');

    cy.get('[data-cy=login-button]').click();

    cy.contains('Identifiants invalides');
    cy.url().should('include', '/auth');
  });
});
```

### 4.2 Test : Envoi et Réception de Messages

```javascript
// cypress/e2e/messaging.cy.js
describe('Messagerie en Temps Réel', () => {
  let user1Token, user2Token;

  before(() => {
    // Créer deux utilisateurs
    cy.request('POST', '/api/auth/register', {
      firstName: 'Alice',
      email: 'alice@test.com',
      password: 'Password123!'
    }).then((res) => {
      user1Token = res.body.data.token;
    });

    cy.request('POST', '/api/auth/register', {
      firstName: 'Bob',
      email: 'bob@test.com',
      password: 'Password123!'
    }).then((res) => {
      user2Token = res.body.data.token;
    });
  });

  it('devrait envoyer et recevoir un message en temps réel', () => {
    // User1 se connecte
    cy.visit('/auth');
    cy.get('[data-cy=email-input]').type('alice@test.com');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=login-button]').click();

    // Ouvrir une conversation avec Bob
    cy.get('[data-cy=new-conversation]').click();
    cy.get('[data-cy=search-user]').type('Bob');
    cy.get('[data-cy=user-Bob]').click();

    // Envoyer un message
    cy.get('[data-cy=message-input]').type('Hello, Bob!');
    cy.get('[data-cy=send-button]').click();

    // Vérifier que le message s'affiche
    cy.contains('Hello, Bob!').should('be.visible');

    // Dans un autre navigateur/onglet, Bob devrait recevoir le message
    // (Nécessite un setup multi-fenêtres ou des tests WebSocket séparés)
  });

  it('devrait afficher l\'indicateur "en train d\'écrire"', () => {
    cy.get('[data-cy=message-input]').type('Test...');

    // Simuler la réception de l'événement typing
    cy.window().then((win) => {
      win.socket.emit('typing_start', {
        conversationId: 'conv1',
        userId: 'user2'
      });
    });

    cy.contains('Bob est en train d\'écrire...').should('be.visible');
  });
});
```

### 4.3 Test : Upload de Fichiers

```javascript
// cypress/e2e/fileUpload.cy.js
describe('Upload de Fichiers', () => {
  beforeEach(() => {
    cy.login('alice@test.com', 'Password123!');
    cy.visit('/chat/conv1');
  });

  it('devrait uploader une image', () => {
    const fileName = 'test-image.jpg';

    cy.get('[data-cy=attach-button]').click();
    cy.get('[data-cy=upload-image]').click();

    cy.get('input[type="file"]').attachFile(fileName);

    // Vérifier la preview
    cy.get('[data-cy=image-preview]').should('be.visible');

    cy.get('[data-cy=send-button]').click();

    // Vérifier que l'image est affichée dans la conversation
    cy.get('.message-image').should('be.visible');
  });

  it('devrait rejeter un fichier trop volumineux', () => {
    const largeFile = 'large-file.zip'; // > 50 MB

    cy.get('[data-cy=attach-button]').click();
    cy.get('input[type="file"]').attachFile(largeFile);

    cy.contains('Le fichier est trop volumineux').should('be.visible');
  });
});
```

---

## 5. Tests de Performance

### 5.1 Test de Charge (Artillery)

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 utilisateurs par seconde
      name: "Warm up"
    - duration: 120
      arrivalRate: 50 # 50 utilisateurs par seconde
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100 # 100 utilisateurs par seconde
      name: "Spike"

scenarios:
  - name: "Send messages"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "Password123!"
          capture:
            - json: "$.data.token"
              as: "token"
      
      - post:
          url: "/api/messages"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            conversationId: "{{ conversationId }}"
            content: "Test message {{ $randomString() }}"
            type: "text"
```

### 5.2 Tests de Performance WebSocket

```javascript
// tests/performance/websocket-load.test.js
const io = require('socket.io-client');

describe('WebSocket Load Test', () => {
  it('devrait gérer 1000 connexions simultanées', async () => {
    const clients = [];
    const numClients = 1000;

    const connectPromises = [];

    for (let i = 0; i < numClients; i++) {
      const promise = new Promise((resolve) => {
        const client = io('http://localhost:3000');
        
        client.on('connect', () => {
          clients.push(client);
          resolve();
        });
      });

      connectPromises.push(promise);
    }

    await Promise.all(connectPromises);

    expect(clients).toHaveLength(numClients);

    // Nettoyer
    clients.forEach(client => client.disconnect());
  });

  it('devrait gérer 100 messages/seconde', async () => {
    const client = io('http://localhost:3000');

    await new Promise(resolve => client.on('connect', resolve));

    const startTime = Date.now();
    const numMessages = 100;

    for (let i = 0; i < numMessages; i++) {
      client.emit('send_message', {
        conversationId: 'test-conv',
        content: `Message ${i}`,
        type: 'text'
      });
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // en secondes

    expect(duration).toBeLessThan(1); // Moins d'une seconde

    client.disconnect();
  });
});
```

---

## 6. Récapitulatif des Scénarios de Test

### ✅ Authentification
- [x] Inscription avec validation
- [x] Connexion avec identifiants valides/invalides
- [x] Déconnexion
- [x] Réinitialisation de mot de passe
- [x] Token JWT expiré (refresh)

### ✅ Gestion des Contacts
- [x] Recherche d'utilisateurs
- [x] Ajout de contact
- [x] Suppression de contact
- [x] Blocage/déblocage

### ✅ Conversations
- [x] Création de conversation individuelle
- [x] Création de groupe
- [x] Ajout/retrait de membres
- [x] Modification des infos du groupe
- [x] Archivage/désarchivage

### ✅ Messages
- [x] Envoi de message texte
- [x] Réception en temps réel
- [x] Édition de message
- [x] Suppression de message (pour moi/pour tous)
- [x] Réponse à un message
- [x] Réactions emoji
- [x] Statuts (envoyé/livré/lu)
- [x] Indicateur "en train d'écrire"

### ✅ Médias
- [x] Upload d'image
- [x] Upload de fichier
- [x] Validation de taille/type
- [x] Compression d'image
- [x] Génération de thumbnail

### ✅ Temps Réel (WebSocket)
- [x] Connexion/déconnexion
- [x] Reconnexion automatique
- [x] Synchronisation après reconnexion
- [x] Rooms (join/leave)
- [x] Broadcasting dans les groupes

### ✅ Performance
- [x] Pagination des messages
- [x] Charge simultanée (1000+ utilisateurs)
- [x] Débit de messages (100+/sec)
- [x] Temps de réponse API (< 200ms)

### ✅ Sécurité
- [x] Validation des entrées
- [x] Protection CSRF
- [x] Rate limiting
- [x] Authentification obligatoire
- [x] Autorisation (ne peut éditer que ses propres messages)

---

## 7. Commandes pour Exécuter les Tests

### Backend

```bash
# Tous les tests
npm test

# Tests unitaires seulement
npm run test:unit

# Tests d'intégration
npm run test:integration

# Avec couverture
npm run test:coverage

# Mode watch (développement)
npm run test:watch
```

### Frontend

```bash
# Tests unitaires
npm run test:unit

# Tests E2E
npm run test:e2e

# Tests E2E avec interface
npm run test:e2e:ui

# Couverture
npm run test:coverage
```

### Performance

```bash
# Test de charge Artillery
artillery run artillery-config.yml

# Tests de performance Jest
npm run test:performance
```

---

## Conclusion

Ce plan de tests complet assure :
- ✅ **Qualité** : Couverture de code élevée
- ✅ **Fiabilité** : Tests unitaires, intégration et E2E
- ✅ **Performance** : Tests de charge et de débit
- ✅ **Sécurité** : Validation et autorisation
- ✅ **Temps réel** : Tests WebSocket robustes
- ✅ **Automatisation** : CI/CD ready

Vous êtes maintenant prêts à passer à la phase de développement ! 🚀
