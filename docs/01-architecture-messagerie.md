# Étape 1.1 : Architecture d'une Application de Messagerie

## 1. Architecture Client-Serveur pour la Messagerie

### Vue d'ensemble
L'application WhatsApp Clone utilise une architecture client-serveur classique avec une couche de communication en temps réel :

```
┌─────────────────┐         WebSocket/HTTP          ┌─────────────────┐
│                 │ ◄──────────────────────────────► │                 │
│  Client Vue.js  │                                  │  Serveur Node   │
│                 │ ◄──────────────────────────────► │  + Express      │
└─────────────────┘         REST API                 └─────────────────┘
                                                              │
                                                              ▼
                                                      ┌──────────────┐
                                                      │   MongoDB    │
                                                      └──────────────┘
```

### Responsabilités

**Client (Vue.js)**
- Interface utilisateur réactive
- Gestion de l'état local (Vuex/Pinia)
- Établissement et maintien de la connexion WebSocket
- Cache local des conversations
- Optimistic UI updates
- Gestion des médias (upload/download)

**Serveur (Node.js + Express)**
- Authentification et autorisation (JWT)
- API REST pour les opérations CRUD
- Gestion des WebSockets (Socket.io)
- Logique métier
- Validation des données
- Stockage et récupération des données
- Distribution des messages en temps réel

**Base de données (MongoDB)**
- Persistance des données
- Indexation pour les recherches rapides
- Agrégations complexes
- Stockage des métadonnées de fichiers

## 2. WebSockets et Communication en Temps Réel

### Pourquoi WebSocket ?
Les WebSockets permettent une **communication bidirectionnelle persistante** entre client et serveur, essentielle pour :
- Réception instantanée des messages
- Notifications de statut (en ligne, en train d'écrire...)
- Indicateurs de lecture
- Synchronisation en temps réel

### Comparaison avec HTTP classique

| HTTP Polling | WebSocket |
|--------------|-----------|
| Requêtes répétées toutes les X secondes | Connexion permanente |
| Latence élevée | Latence minimale (~ms) |
| Overhead important | Overhead minimal après handshake |
| Unidirectionnel (client → serveur) | Bidirectionnel |

### Implémentation avec Socket.io

```javascript
// Serveur
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Événements personnalisés
  socket.on('send_message', (data) => {
    // Émettre vers les destinataires
    io.to(data.conversationId).emit('receive_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Client
const socket = io('http://localhost:3000');

socket.on('receive_message', (message) => {
  // Ajouter le message à l'UI
  store.commit('ADD_MESSAGE', message);
});

socket.emit('send_message', {
  conversationId: '123',
  content: 'Hello!',
  timestamp: Date.now()
});
```

## 3. Rooms et Sessions

### Rooms (Salles)
Les **rooms** sont des canaux logiques regroupant plusieurs sockets :

```javascript
// Rejoindre une room = conversation
socket.join(conversationId);

// Envoyer un message à tous les membres de la room
io.to(conversationId).emit('receive_message', message);

// Quitter une room
socket.leave(conversationId);
```

**Utilisation dans WhatsApp Clone :**
- Chaque conversation = 1 room
- Les utilisateurs rejoignent les rooms de leurs conversations actives
- Les messages sont émis vers la room appropriée

### Sessions
Les **sessions** maintiennent l'état de connexion utilisateur :

```javascript
// Association socket ↔ userId
const userSockets = new Map();

io.on('connection', (socket) => {
  socket.on('authenticate', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    
    // Rejoindre toutes les conversations de l'utilisateur
    getUserConversations(userId).forEach(conv => {
      socket.join(conv._id);
    });
  });
});
```

**Gestion multi-appareils :**
```javascript
// Un utilisateur peut avoir plusieurs sockets (mobile + desktop)
const userSockets = new Map(); // userId → Set([socketId1, socketId2])

// Envoyer à tous les appareils d'un utilisateur
function emitToUser(userId, event, data) {
  const sockets = userSockets.get(userId) || new Set();
  sockets.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
}
```

## 4. Gestion des Connexions Utilisateur

### Cycle de vie d'une connexion

```
1. Connexion WebSocket
   ↓
2. Authentification (envoi du JWT)
   ↓
3. Validation du token
   ↓
4. Association userId ↔ socketId
   ↓
5. Rejoindre les rooms (conversations)
   ↓
6. Mise à jour du statut (online)
   ↓
7. Synchronisation des messages non lus
```

### Gestion des statuts

```javascript
// Statuts possibles
const UserStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  TYPING: 'typing'
};

// Mise à jour et broadcast du statut
function updateUserStatus(userId, status) {
  // MAJ en base
  User.updateOne({ _id: userId }, { status, lastSeen: Date.now() });
  
  // Notifier les contacts
  getUserContacts(userId).forEach(contactId => {
    emitToUser(contactId, 'contact_status_changed', {
      userId,
      status,
      timestamp: Date.now()
    });
  });
}
```

### Heartbeat et détection de déconnexion

```javascript
// Côté serveur : ping/pong pour détecter les connexions mortes
setInterval(() => {
  io.sockets.sockets.forEach(socket => {
    if (socket.isAlive === false) {
      socket.disconnect();
      return;
    }
    socket.isAlive = false;
    socket.emit('ping');
  });
}, 30000);

socket.on('pong', () => {
  socket.isAlive = true;
});

// Côté client : répondre au ping
socket.on('ping', () => {
  socket.emit('pong');
});
```

## 5. Synchronisation des Données

### Défis majeurs

1. **Ordre des messages** : Garantir que les messages s'affichent dans le bon ordre
2. **Messages manqués** : Récupérer les messages envoyés pendant une déconnexion
3. **Conflits de modification** : Gérer les éditions simultanées
4. **États transitoires** : Messages "en cours d'envoi"

### Stratégie de synchronisation

```javascript
// 1. Message temporaire côté client (optimistic update)
const tempMessage = {
  _id: generateTempId(),
  content: 'Hello',
  status: 'sending',
  timestamp: Date.now(),
  senderId: currentUserId
};
store.commit('ADD_MESSAGE', tempMessage);

// 2. Envoi au serveur
socket.emit('send_message', tempMessage);

// 3. Confirmation du serveur avec ID permanent
socket.on('message_sent', (serverMessage) => {
  store.commit('UPDATE_MESSAGE', {
    tempId: tempMessage._id,
    newMessage: serverMessage // Contient l'ID MongoDB
  });
});

// 4. Broadcast aux autres utilisateurs
socket.on('receive_message', (message) => {
  if (message.senderId !== currentUserId) {
    store.commit('ADD_MESSAGE', message);
  }
});
```

### Récupération des messages manqués

```javascript
// Au reconnect
socket.on('connect', async () => {
  const lastSync = getLastSyncTimestamp();
  
  // Récupérer les messages depuis la dernière synchro
  const missedMessages = await api.get('/messages/since', {
    params: { timestamp: lastSync }
  });
  
  missedMessages.forEach(msg => {
    store.commit('ADD_MESSAGE', msg);
  });
  
  updateLastSyncTimestamp(Date.now());
});
```

## 6. Cache Local et Stratégies

### Pourquoi un cache local ?
- **Performance** : Affichage instantané sans attendre le réseau
- **Offline-first** : Fonctionnement partiel sans connexion
- **Réduction de charge serveur** : Moins de requêtes

### Technologies de cache

```javascript
// 1. Vuex/Pinia pour l'état runtime
const store = createStore({
  state: {
    conversations: [],
    messages: {}, // { conversationId: [messages] }
    contacts: [],
    currentUser: null
  }
});

// 2. IndexedDB pour la persistance
import { openDB } from 'idb';

const db = await openDB('whatsapp-clone', 1, {
  upgrade(db) {
    db.createObjectStore('messages', { keyPath: '_id' });
    db.createObjectStore('conversations', { keyPath: '_id' });
  }
});

// Sauvegarder un message
await db.put('messages', message);

// Récupérer les messages d'une conversation
const messages = await db.getAllFromIndex('messages', 'conversationId', convId);

// 3. LocalStorage pour les préférences
localStorage.setItem('user_preferences', JSON.stringify({
  theme: 'dark',
  notifications: true
}));
```

### Stratégie de cache intelligent

```javascript
// Cache-first strategy
async function getConversationMessages(conversationId) {
  // 1. Vérifier le cache local
  let messages = store.state.messages[conversationId];
  
  if (!messages || isCacheStale(conversationId)) {
    // 2. Fetch depuis le serveur
    messages = await api.get(`/conversations/${conversationId}/messages`);
    
    // 3. Mettre à jour le cache
    store.commit('SET_MESSAGES', { conversationId, messages });
    await db.put('messages', messages);
    updateCacheTimestamp(conversationId);
  }
  
  return messages;
}
```

## 7. Patterns de Reconnexion

### Reconnexion automatique avec backoff exponentiel

```javascript
class SocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000; // 30s max
  }
  
  connect() {
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });
    
    this.socket.on('connect', () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
      this.onReconnect();
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnexion manuelle si le serveur a fermé la connexion
        this.socket.connect();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
    });
  }
  
  async onReconnect() {
    // Ré-authentifier
    this.socket.emit('authenticate', getAuthToken());
    
    // Rejoindre les rooms
    const conversations = store.state.conversations;
    conversations.forEach(conv => {
      this.socket.emit('join_conversation', conv._id);
    });
    
    // Synchroniser les messages manqués
    await syncMissedMessages();
  }
}
```

### Gestion de la file d'attente des messages

```javascript
// File des messages à envoyer quand déconnecté
const messageQueue = [];

function sendMessage(message) {
  if (socket.connected) {
    socket.emit('send_message', message);
  } else {
    // Ajouter à la file d'attente
    messageQueue.push(message);
    
    // Sauvegarder localement
    store.commit('ADD_MESSAGE', { ...message, status: 'queued' });
  }
}

socket.on('connect', () => {
  // Envoyer tous les messages en attente
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    socket.emit('send_message', message);
  }
});
```

## 8. Considérations de Scalabilité

### Problématiques à grande échelle

1. **Connexions simultanées** : Un serveur Node.js peut gérer ~10k connexions WebSocket
2. **Distribution de charge** : Comment partager les connexions entre plusieurs serveurs
3. **Synchronisation inter-serveurs** : Les utilisateurs d'une conversation peuvent être sur différents serveurs

### Architecture distribuée avec Redis

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Server 1 │     │ Server 2 │     │ Server 3 │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
                ┌─────▼──────┐
                │   Redis    │
                │  Pub/Sub   │
                └────────────┘
```

```javascript
// Configuration Socket.io avec Redis Adapter
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));

// Maintenant, io.to(room).emit() fonctionne entre tous les serveurs !
```

### Optimisations de performance

**1. Compression des messages**
```javascript
io.on('connection', (socket) => {
  socket.conn.on('packet', ({ type, data }) => {
    if (type === 'message' && data.length > 1024) {
      // Compresser les gros messages
      data = compress(data);
    }
  });
});
```

**2. Batching des notifications**
```javascript
// Au lieu d'envoyer 100 notifications individuelles
const notifications = [];
const flushInterval = 100; // ms

function sendNotification(userId, notification) {
  notifications.push({ userId, notification });
}

setInterval(() => {
  const grouped = groupBy(notifications, 'userId');
  Object.entries(grouped).forEach(([userId, notifs]) => {
    emitToUser(userId, 'notifications_batch', notifs);
  });
  notifications.length = 0;
}, flushInterval);
```

**3. Lazy loading des conversations**
```javascript
// Charger uniquement les 20 dernières conversations
GET /conversations?limit=20&offset=0

// Pagination infinie
GET /conversations?limit=20&offset=20
```

### Monitoring et observabilité

```javascript
// Métriques importantes
const metrics = {
  activeConnections: 0,
  messagesPerSecond: 0,
  averageLatency: 0,
  errorRate: 0
};

io.on('connection', (socket) => {
  metrics.activeConnections++;
  
  socket.on('disconnect', () => {
    metrics.activeConnections--;
  });
  
  socket.on('send_message', (data, callback) => {
    const start = Date.now();
    
    // Traiter le message...
    
    const latency = Date.now() - start;
    updateAverageLatency(latency);
    
    metrics.messagesPerSecond++;
  });
});

// Envoyer les métriques à Sentry/Prometheus
setInterval(() => {
  console.log('Metrics:', metrics);
  // sendToSentry(metrics);
}, 60000);
```

## Conclusion

Une application de messagerie en temps réel nécessite :
- ✅ Architecture client-serveur robuste
- ✅ WebSockets pour la communication instantanée
- ✅ Gestion intelligente des rooms et sessions
- ✅ Stratégies de synchronisation fiables
- ✅ Cache local pour la performance
- ✅ Reconnexion automatique
- ✅ Architecture scalable dès la conception

Ces fondations permettront de construire un clone WhatsApp performant et fiable.
