# Étape 1.2 : Structure Technique du Projet

## 1. Stack Technologique

### Backend
- **Node.js** (v18+) : Runtime JavaScript
- **Express.js** : Framework web minimaliste
- **Socket.io** : Communication WebSocket bidirectionnelle
- **MongoDB** : Base de données NoSQL orientée documents
- **Mongoose** : ODM (Object Document Mapper) pour MongoDB
- **JWT (jsonwebtoken)** : Authentification stateless
- **bcryptjs** : Hachage des mots de passe
- **Multer** : Upload de fichiers
- **Sharp** : Traitement d'images (compression, thumbnails)
- **Joi** : Validation des données
- **Sentry** : Monitoring et gestion d'erreurs

### Frontend
- **Vue.js 3** : Framework progressif
- **Vite** : Build tool et dev server
- **Pinia** : State management (successeur de Vuex)
- **Vue Router** : Routing SPA
- **Socket.io-client** : Client WebSocket
- **Axios** : Client HTTP
- **Tailwind CSS** : Framework CSS utility-first
- **HeadlessUI** : Composants UI accessibles
- **VeeValidate** : Validation de formulaires
- **date-fns** : Manipulation de dates
- **emoji-picker-element** : Sélecteur d'emojis

### DevOps & Tools
- **ESLint** : Linting JavaScript
- **Prettier** : Formatage de code
- **Jest** : Tests unitaires et d'intégration
- **Supertest** : Tests d'API HTTP
- **Nodemon** : Auto-reload du serveur en dev
- **Docker** : Containerisation
- **Git** : Versioning

## 2. Architecture des Dossiers

```
WhatsUp/
│
├── backend/                          # Serveur Node.js
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   │   ├── database.js           # Connexion MongoDB
│   │   │   ├── jwt.js                # Configuration JWT
│   │   │   ├── socket.js             # Configuration Socket.io
│   │   │   └── sentry.js             # Configuration Sentry
│   │   │
│   │   ├── models/                   # Modèles Mongoose
│   │   │   ├── User.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Contact.js
│   │   │   └── Media.js
│   │   │
│   │   ├── controllers/              # Logique métier
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── conversationController.js
│   │   │   ├── messageController.js
│   │   │   ├── contactController.js
│   │   │   └── mediaController.js
│   │   │
│   │   ├── routes/                   # Routes Express
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── conversation.routes.js
│   │   │   ├── message.routes.js
│   │   │   ├── contact.routes.js
│   │   │   └── media.routes.js
│   │   │
│   │   ├── middleware/               # Middlewares
│   │   │   ├── auth.middleware.js    # Vérification JWT
│   │   │   ├── validation.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   │
│   │   ├── services/                 # Services métier
│   │   │   ├── authService.js
│   │   │   ├── messageService.js
│   │   │   ├── conversationService.js
│   │   │   ├── uploadService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── socket/                   # Gestion WebSocket
│   │   │   ├── index.js              # Setup Socket.io
│   │   │   ├── handlers/
│   │   │   │   ├── messageHandler.js
│   │   │   │   ├── conversationHandler.js
│   │   │   │   ├── statusHandler.js
│   │   │   │   └── typingHandler.js
│   │   │   └── middleware/
│   │   │       └── socketAuth.js
│   │   │
│   │   ├── utils/                    # Utilitaires
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   ├── logger.js
│   │   │   └── constants.js
│   │   │
│   │   ├── app.js                    # Configuration Express
│   │   └── server.js                 # Point d'entrée
│   │
│   ├── tests/                        # Tests backend
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.js
│   │
│   ├── uploads/                      # Fichiers uploadés (dev)
│   ├── .env                          # Variables d'environnement
│   ├── .env.example
│   ├── package.json
│   └── jest.config.js
│
├── frontend/                         # Application Vue.js
│   ├── public/
│   │   ├── favicon.ico
│   │   └── notification.mp3
│   │
│   ├── src/
│   │   ├── assets/                   # Ressources statiques
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── styles/
│   │   │       ├── main.css
│   │   │       └── tailwind.css
│   │   │
│   │   ├── components/               # Composants Vue
│   │   │   ├── common/               # Composants réutilisables
│   │   │   │   ├── Avatar.vue
│   │   │   │   ├── Button.vue
│   │   │   │   ├── Input.vue
│   │   │   │   ├── Modal.vue
│   │   │   │   ├── Loader.vue
│   │   │   │   └── Dropdown.vue
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   ├── RegisterForm.vue
│   │   │   │   └── PasswordReset.vue
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── ConversationList.vue
│   │   │   │   ├── ConversationItem.vue
│   │   │   │   ├── ChatWindow.vue
│   │   │   │   ├── MessageList.vue
│   │   │   │   ├── MessageItem.vue
│   │   │   │   ├── MessageInput.vue
│   │   │   │   ├── EmojiPicker.vue
│   │   │   │   ├── FileUpload.vue
│   │   │   │   └── TypingIndicator.vue
│   │   │   │
│   │   │   ├── contacts/
│   │   │   │   ├── ContactList.vue
│   │   │   │   ├── ContactItem.vue
│   │   │   │   └── AddContact.vue
│   │   │   │
│   │   │   ├── groups/
│   │   │   │   ├── CreateGroup.vue
│   │   │   │   ├── GroupSettings.vue
│   │   │   │   └── MemberList.vue
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── UserProfile.vue
│   │   │       ├── EditProfile.vue
│   │   │       └── Settings.vue
│   │   │
│   │   ├── views/                    # Pages/Vues
│   │   │   ├── AuthView.vue
│   │   │   ├── ChatView.vue
│   │   │   ├── ContactsView.vue
│   │   │   └── ProfileView.vue
│   │   │
│   │   ├── stores/                   # Pinia stores
│   │   │   ├── auth.js               # État auth
│   │   │   ├── conversations.js      # État conversations
│   │   │   ├── messages.js           # État messages
│   │   │   ├── contacts.js           # État contacts
│   │   │   ├── ui.js                 # État UI (modals, etc.)
│   │   │   └── socket.js             # État WebSocket
│   │   │
│   │   ├── composables/              # Composition API
│   │   │   ├── useSocket.js
│   │   │   ├── useAuth.js
│   │   │   ├── useChat.js
│   │   │   ├── useNotification.js
│   │   │   └── useMediaUpload.js
│   │   │
│   │   ├── services/                 # Services API
│   │   │   ├── api.js                # Configuration Axios
│   │   │   ├── authService.js
│   │   │   ├── conversationService.js
│   │   │   ├── messageService.js
│   │   │   ├── contactService.js
│   │   │   └── uploadService.js
│   │   │
│   │   ├── utils/                    # Utilitaires
│   │   │   ├── formatters.js         # Formatage dates, etc.
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── router/                   # Configuration Vue Router
│   │   │   └── index.js
│   │   │
│   │   ├── App.vue                   # Composant racine
│   │   └── main.js                   # Point d'entrée
│   │
│   ├── tests/                        # Tests frontend
│   │   ├── unit/
│   │   └── e2e/
│   │
│   ├── .env                          # Variables d'environnement
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── jest.config.js
│
├── docs/                             # Documentation
│   ├── 01-architecture-messagerie.md
│   ├── 02-structure-technique.md
│   ├── 03-user-stories.md
│   ├── 04-modeles-donnees.md
│   ├── 05-plan-tests.md
│   └── api/
│       └── README.md
│
├── docker-compose.yml                # Config Docker
├── .gitignore
└── README.md
```

## 3. Séparation des Responsabilités

### Pattern MVC/Layered Architecture

```
┌─────────────┐
│   Routes    │ ──► Point d'entrée HTTP, définition des endpoints
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │ ──► Gestion des requêtes/réponses, orchestration
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │ ──► Logique métier, règles business
└──────┬──────┘
       │
┌──────▼──────┐
│   Models    │ ──► Schémas de données, validation
└──────┬──────┘
       │
┌──────▼──────┐
│  Database   │ ──► Persistance
└─────────────┘
```

### Exemple concret

```javascript
// 1. ROUTE (message.routes.js)
router.post('/', authMiddleware, messageController.sendMessage);

// 2. CONTROLLER (messageController.js)
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, type } = req.body;
    const userId = req.user._id;
    
    // Appel au service
    const message = await messageService.createMessage({
      conversationId,
      senderId: userId,
      content,
      type
    });
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// 3. SERVICE (messageService.js)
const createMessage = async (data) => {
  // Validation
  if (!data.content?.trim()) {
    throw new Error('Message cannot be empty');
  }
  
  // Vérifier que la conversation existe
  const conversation = await Conversation.findById(data.conversationId);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  // Créer le message
  const message = await Message.create(data);
  
  // Mettre à jour la conversation
  conversation.lastMessage = message._id;
  conversation.updatedAt = new Date();
  await conversation.save();
  
  // Émettre via WebSocket
  io.to(data.conversationId).emit('new_message', message);
  
  return message;
};

// 4. MODEL (Message.js)
const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'video', 'audio', 'file'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true });
```

## 4. Couches de l'Application

### Backend - 5 couches principales

**1. Couche Présentation (Routes + Controllers)**
- Définition des endpoints API
- Validation des entrées
- Transformation des réponses
- Gestion des erreurs HTTP

**2. Couche Logique Métier (Services)**
- Règles métier
- Orchestration des opérations
- Transactions complexes
- Interactions avec les modèles

**3. Couche Données (Models)**
- Définition des schémas
- Validation des données
- Méthodes d'instance et statiques
- Hooks (pre/post save, etc.)

**4. Couche Communication Temps Réel (Socket)**
- Gestion des connexions WebSocket
- Rooms et événements
- Authentification Socket
- Broadcasting

**5. Couche Infrastructure (Config + Utils)**
- Configuration (DB, JWT, etc.)
- Middlewares transversaux
- Utilitaires
- Logging et monitoring

### Frontend - Architecture Composants

```
App.vue
│
├── Router
│   │
│   ├── /auth ──────────► AuthView
│   │                     ├── LoginForm
│   │                     └── RegisterForm
│   │
│   ├── /chat ──────────► ChatView
│   │                     ├── ConversationList
│   │                     │   └── ConversationItem (x N)
│   │                     └── ChatWindow
│   │                         ├── MessageList
│   │                         │   └── MessageItem (x N)
│   │                         └── MessageInput
│   │
│   ├── /contacts ──────► ContactsView
│   │                     └── ContactList
│   │
│   └── /profile ───────► ProfileView
```

## 5. Patterns de Communication

### 1. Client → Server (HTTP REST)

```javascript
// Frontend
const response = await axios.post('/api/conversations', {
  participantIds: ['user1', 'user2'],
  isGroup: false
});

// Backend
router.post('/', authMiddleware, conversationController.create);
```

### 2. Client → Server (WebSocket)

```javascript
// Frontend
socket.emit('send_message', {
  conversationId: '123',
  content: 'Hello',
  type: 'text'
});

// Backend
socket.on('send_message', async (data) => {
  const message = await messageService.createMessage(data);
  io.to(data.conversationId).emit('receive_message', message);
});
```

### 3. Server → Client (WebSocket Push)

```javascript
// Backend - Notification de nouveau message
io.to(userId).emit('notification', {
  type: 'new_message',
  conversationId: '123',
  preview: 'You have a new message'
});

// Frontend
socket.on('notification', (data) => {
  showNotification(data);
  playSound();
});
```

## 6. Flux de Données

### Exemple : Envoi d'un message

```
1. User types message
          ↓
2. Component calls store action
   store.dispatch('sendMessage', { conversationId, content })
          ↓
3. Store emits WebSocket event
   socket.emit('send_message', data)
          ↓
4. Server receives event
   socket.on('send_message', async (data) => {...})
          ↓
5. Service creates message in DB
   await Message.create(data)
          ↓
6. Server broadcasts to room
   io.to(conversationId).emit('receive_message', message)
          ↓
7. All clients in room receive message
   socket.on('receive_message', (msg) => {...})
          ↓
8. Store updates state
   store.commit('ADD_MESSAGE', msg)
          ↓
9. Vue reactivity updates UI
   Component re-renders with new message
```

### Gestion d'état avec Pinia

```javascript
// stores/messages.js
export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messagesByConversation: {}, // { convId: [messages] }
    loading: false,
    error: null
  }),
  
  getters: {
    getMessages: (state) => (conversationId) => {
      return state.messagesByConversation[conversationId] || [];
    }
  },
  
  actions: {
    async fetchMessages(conversationId) {
      this.loading = true;
      try {
        const messages = await messageService.getMessages(conversationId);
        this.messagesByConversation[conversationId] = messages;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    addMessage(message) {
      const { conversationId } = message;
      if (!this.messagesByConversation[conversationId]) {
        this.messagesByConversation[conversationId] = [];
      }
      this.messagesByConversation[conversationId].push(message);
    }
  }
});
```

## 7. Points de Défaillance Possibles

### 1. Connexion WebSocket
**Problème** : Perte de connexion réseau
**Solution** : Reconnexion automatique + file d'attente

### 2. Base de données
**Problème** : MongoDB injoignable
**Solution** : Retry logic + circuit breaker

### 3. Upload de fichiers
**Problème** : Échec d'upload
**Solution** : Retry avec backoff + stockage temporaire local

### 4. Synchronisation
**Problème** : Messages reçus dans le désordre
**Solution** : Timestamps + tri côté client

### 5. Authentification
**Problème** : Token JWT expiré
**Solution** : Refresh token + intercepteur Axios

## 8. Stratégies de Récupération

### Gestion d'erreurs globale (Backend)

```javascript
// middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  // Erreur MongoDB
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate key error'
    });
  }
  
  // Envoyer à Sentry en production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  }
  
  // Erreur générique
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
```

### Gestion d'erreurs (Frontend)

```javascript
// Intercepteur Axios
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Token expiré
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Rediriger vers login
        router.push('/auth');
        return Promise.reject(refreshError);
      }
    }
    
    // Erreur réseau
    if (!error.response) {
      showNotification('Network error. Please check your connection.', 'error');
    }
    
    return Promise.reject(error);
  }
);
```

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Usage
const dbCircuitBreaker = new CircuitBreaker(5, 30000);

const getUser = async (userId) => {
  return dbCircuitBreaker.call(async () => {
    return await User.findById(userId);
  });
};
```

## Conclusion

Cette structure technique assure :
- ✅ Séparation claire des responsabilités
- ✅ Maintenabilité et scalabilité
- ✅ Testabilité de chaque couche
- ✅ Gestion robuste des erreurs
- ✅ Communication efficace entre client et serveur
- ✅ Récupération automatique des défaillances

La prochaine étape consiste à définir les user stories détaillées.
