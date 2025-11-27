# Documentation Développeur WhatsUp

Bienvenue dans la documentation développeur de WhatsUp ! Ce guide vous aidera à comprendre l'architecture du système et à configurer votre environnement de développement.

## Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Architecture Système](#architecture-système)
- [Guide de Setup](#guide-de-setup)
- [Structure du Projet](#structure-du-projet)
- [Technologies Utilisées](#technologies-utilisées)
- [Conventions de Code](#conventions-de-code)
- [Tests](#tests)
- [Contribution](#contribution)

---

## Vue d'Ensemble

WhatsUp est une application de messagerie instantanée moderne construite avec une architecture client-serveur classique :

- **Backend** : API REST + WebSocket (Node.js, Express, Socket.IO)
- **Frontend** : SPA moderne (Vue.js 3, Vite, Tailwind CSS)
- **Base de données** : MongoDB (NoSQL)
- **Communication temps réel** : Socket.IO
- **Authentification** : JWT (JSON Web Tokens)

### Caractéristiques Principales

✅ Messagerie temps réel (WebSocket)  
✅ Conversations individuelles et de groupe  
✅ Partage de fichiers multimédias  
✅ Gestion des contacts  
✅ Notifications en temps réel  
✅ Système de permissions pour les groupes  
✅ Architecture modulaire et scalable  

---

## Architecture Système

### Diagramme de Haut Niveau

```
┌─────────────┐         HTTPS/WSS          ┌──────────────┐
│             │◄──────────────────────────►│              │
│  Frontend   │                            │   Backend    │
│  (Vue.js)   │         REST API           │  (Express)   │
│             │         WebSocket          │              │
└─────────────┘                            └───────┬──────┘
                                                   │
                                                   │ Mongoose
                                                   ▼
                                            ┌──────────────┐
                                            │   MongoDB    │
                                            │   Database   │
                                            └──────────────┘
```

### Architecture Backend

```
backend/
├── src/
│   ├── app.js                 # Configuration Express
│   ├── server.js              # Point d'entrée serveur
│   ├── config/                # Configuration (DB, JWT, Socket.IO)
│   ├── controllers/           # Logique métier
│   ├── models/                # Schémas Mongoose
│   ├── routes/                # Routes API REST
│   ├── middleware/            # Auth, validation, rate limiting
│   ├── services/              # Services métier
│   └── utils/                 # Utilitaires (logger, helpers)
└── tests/                     # Tests unitaires et d'intégration
```

**Flux de Requête Backend** :

```
Request → Middleware (Auth) → Route → Controller → Service → Model → Database
                ↓                                                        ↓
            Response ←─────────────────────────────────────────────────┘
```

### Architecture Frontend

```
frontend/
├── src/
│   ├── main.js                # Point d'entrée
│   ├── App.vue                # Composant racine
│   ├── router/                # Vue Router (navigation)
│   ├── store/                 # Pinia (state management)
│   ├── views/                 # Pages principales
│   ├── components/            # Composants réutilisables
│   ├── composables/           # Composition API logic
│   ├── services/              # API calls
│   └── utils/                 # Utilitaires
└── tests/                     # Tests unitaires et E2E
```

**Flux de Données Frontend** :

```
User Action → Component → Store (Pinia) → API Service → Backend
                ↓                                           ↓
              View ←────────────── Store Update ←─────────┘
```

### Communication WebSocket

```
┌──────────┐                           ┌──────────┐
│ Client A │                           │ Client B │
└────┬─────┘                           └─────┬────┘
     │                                       │
     │  Connect (Handshake)                  │
     ├──────────────────►┌──────────┐◄──────┤
     │                   │          │       │
     │  Authenticate     │  Socket  │       │
     ├──────────────────►│   .IO    │       │
     │                   │  Server  │       │
     │  Join room        │          │       │
     ├──────────────────►│          │       │
     │                   └────┬─────┘       │
     │                        │             │
     │  Emit message          │             │
     ├───────────────────────►│             │
     │                        │  Broadcast  │
     │                        ├────────────►│
     │                        │             │
     │◄───────────────────────┤             │
     │  Receive message       │             │
     │                        │             │
```

### Base de Données MongoDB

**Collections Principales** :

```
users
├── _id (ObjectId)
├── email (unique, indexed)
├── username (unique, indexed)
├── password (hashed)
├── avatar
├── bio
├── status
└── timestamps

conversations
├── _id (ObjectId)
├── type (individual / group)
├── name (for groups)
├── participants (array of user IDs)
├── admins (array of user IDs)
├── lastMessage
└── timestamps

messages
├── _id (ObjectId)
├── conversation (ref: Conversation)
├── sender (ref: User)
├── content
├── type (text / image / video / file)
├── file (url, size, mime)
├── reactions (array)
└── timestamps

contacts
├── _id (ObjectId)
├── user (ref: User)
├── contact (ref: User)
├── status (pending / accepted / blocked)
└── timestamps
```

### Authentification JWT

**Flow d'Authentification** :

```
1. Login Request
   POST /api/auth/login
   { email, password }
   
2. Verify Credentials
   ├── Hash password
   ├── Compare with DB
   └── Generate JWT token
   
3. Response
   {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     user: { id, username, email, avatar }
   }
   
4. Subsequent Requests
   Headers: {
     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   
5. Token Verification (Middleware)
   ├── Extract token
   ├── Verify signature
   ├── Check expiration
   └── Attach user to req.user
```

**Contenu du JWT Token** :

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1638360000,
  "exp": 1638964800
}
```

### Rate Limiting

WhatsUp implémente un rate limiting multi-niveaux :

```javascript
// Niveau 1 : Global (tous les endpoints)
100 requests / 15 minutes / IP

// Niveau 2 : Authentification
5 requests / 15 minutes / IP (login/register)

// Niveau 3 : Upload
10 uploads / minute / utilisateur

// Niveau 4 : Messages
100 messages / minute / utilisateur
```

---

## Guide de Setup

### Prérequis

- **Node.js** : 18+ (LTS recommandé)
- **npm** : 8+ (ou yarn/pnpm)
- **MongoDB** : 5.0+ (local ou Atlas)
- **Git** : Pour cloner le repository

### Installation

#### 1. Cloner le Repository

```bash
git clone https://github.com/Sereir/WhatsUp.git
cd WhatsUp
```

#### 2. Backend Setup

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Éditez `.env` :

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/whatsup
MONGODB_TEST_URI=mongodb://localhost:27017/whatsup_test
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Générer un JWT_SECRET sécurisé** :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env
```

Éditez `.env` :

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

#### 4. Démarrer MongoDB

**macOS** :
```bash
brew services start mongodb-community
```

**Linux** :
```bash
sudo systemctl start mongod
```

**Windows** :
MongoDB démarre automatiquement comme service.

#### 5. Démarrer les Serveurs

**Terminal 1 - Backend** :
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
```

**Accès** :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000
- API Docs : http://localhost:3000/api-docs (si Swagger configuré)

### Configuration VS Code (Recommandé)

Installez les extensions recommandées :

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "mongodb.mongodb-vscode",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

Créez `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Structure du Projet

### Backend

```
backend/
├── src/
│   ├── app.js                      # Configuration Express
│   ├── server.js                   # Point d'entrée
│   │
│   ├── config/
│   │   ├── database.js             # Connexion MongoDB
│   │   ├── jwt.js                  # Configuration JWT
│   │   ├── socket.js               # Configuration Socket.IO
│   │   └── sentry.js               # Monitoring (optionnel)
│   │
│   ├── controllers/
│   │   ├── authController.js       # Authentification
│   │   ├── userController.js       # Gestion utilisateurs
│   │   ├── contactController.js    # Gestion contacts
│   │   ├── conversationController.js # Conversations
│   │   ├── messageController.js    # Messages
│   │   ├── notificationController.js # Notifications
│   │   ├── sessionController.js    # Sessions utilisateur
│   │   └── syncController.js       # Synchronisation
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # Vérification JWT
│   │   ├── validation.middleware.js # Validation données
│   │   ├── rateLimiter.middleware.js # Rate limiting
│   │   ├── upload.middleware.js    # Upload fichiers
│   │   └── groupPermissions.middleware.js # Permissions groupes
│   │
│   ├── models/
│   │   ├── User.js                 # Schéma utilisateur
│   │   ├── Conversation.js         # Schéma conversation
│   │   ├── Message.js              # Schéma message
│   │   ├── Contact.js              # Schéma contact
│   │   ├── Notification.js         # Schéma notification
│   │   └── Session.js              # Schéma session
│   │
│   ├── routes/
│   │   ├── auth.routes.js          # Routes auth
│   │   ├── user.routes.js          # Routes user
│   │   ├── contact.routes.js       # Routes contacts
│   │   ├── conversation.routes.js  # Routes conversations
│   │   ├── message.routes.js       # Routes messages
│   │   └── notification.routes.js  # Routes notifications
│   │
│   ├── services/
│   │   └── securityAlertService.js # Alertes sécurité
│   │
│   └── utils/
│       ├── logger.js               # Winston logger
│       ├── mediaProcessor.js       # Traitement médias
│       └── socketHelpers.js        # Helpers Socket.IO
│
├── tests/
│   ├── setup.js                    # Configuration tests
│   ├── integration/                # Tests d'intégration
│   └── unit/                       # Tests unitaires
│
├── uploads/                        # Fichiers uploadés
├── .env                            # Variables d'environnement
├── .env.example                    # Template .env
├── package.json                    # Dépendances npm
└── jest.config.js                  # Configuration Jest
```

### Frontend

```
frontend/
├── src/
│   ├── main.js                     # Point d'entrée
│   ├── App.vue                     # Composant racine
│   │
│   ├── router/
│   │   └── index.js                # Configuration Vue Router
│   │
│   ├── store/
│   │   ├── auth.js                 # Store auth (Pinia)
│   │   └── chat.js                 # Store chat (Pinia)
│   │
│   ├── views/
│   │   ├── Login.vue               # Page login
│   │   ├── Register.vue            # Page inscription
│   │   ├── Chat.vue                # Page chat principale
│   │   ├── Contacts.vue            # Page contacts
│   │   ├── CreateGroup.vue         # Création de groupe
│   │   ├── UploadAvatar.vue        # Upload avatar
│   │   └── ChooseUsername.vue      # Choix username
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── MessageInput.vue    # Zone de saisie
│   │   │   ├── MessageActions.vue  # Actions sur messages
│   │   │   ├── MessageReactions.vue # Réactions
│   │   │   ├── ConversationSettings.vue # Paramètres conversation
│   │   │   ├── GroupSettings.vue   # Paramètres groupe
│   │   │   └── NotificationBadge.vue # Badge notifications
│   │   └── FileUploader.vue        # Upload de fichiers
│   │
│   ├── composables/
│   │   ├── useSocket.js            # Composable Socket.IO
│   │   ├── useNotifications.js     # Composable notifications
│   │   ├── useRealtimeMessages.js  # Messages temps réel
│   │   └── useRealtimeConversations.js # Conversations temps réel
│   │
│   ├── services/
│   │   └── api.js                  # Client API (axios)
│   │
│   └── utils/
│       ├── logger.js               # Logger frontend
│       └── sentry.js               # Monitoring erreurs
│
├── tests/
│   ├── setup.js                    # Configuration tests
│   ├── unit/                       # Tests unitaires
│   ├── integration/                # Tests d'intégration
│   └── e2e/                        # Tests E2E (à venir)
│
├── public/                         # Assets statiques
├── .env                            # Variables d'environnement
├── .env.example                    # Template .env
├── package.json                    # Dépendances npm
├── vite.config.js                  # Configuration Vite
├── tailwind.config.js              # Configuration Tailwind
└── vitest.config.js                # Configuration Vitest
```

---

## Technologies Utilisées

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.18+ | Framework web |
| **MongoDB** | 5.0+ | Base de données NoSQL |
| **Mongoose** | 7.0+ | ODM pour MongoDB |
| **Socket.IO** | 4.5+ | Communication WebSocket |
| **JWT** | 9.0+ | Authentification |
| **Bcrypt** | 5.1+ | Hachage mots de passe |
| **Multer** | 1.4+ | Upload de fichiers |
| **Express-validator** | 7.0+ | Validation des données |
| **Winston** | 3.8+ | Logging |
| **Jest** | 29.5+ | Tests unitaires |
| **Supertest** | 6.3+ | Tests API |

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Vue.js** | 3.3+ | Framework JavaScript |
| **Vite** | 4.3+ | Build tool |
| **Vue Router** | 4.2+ | Routing |
| **Pinia** | 2.1+ | State management |
| **Axios** | 1.4+ | Client HTTP |
| **Socket.IO Client** | 4.5+ | WebSocket client |
| **Tailwind CSS** | 3.3+ | Framework CSS |
| **Vitest** | 0.32+ | Tests unitaires |
| **@vue/test-utils** | 2.3+ | Tests composants Vue |

### DevOps

| Technologie | Usage |
|-------------|-------|
| **Docker** | Conteneurisation |
| **Docker Compose** | Orchestration multi-conteneurs |
| **GitHub Actions** | CI/CD pipeline |
| **Nginx** | Reverse proxy |
| **PM2** | Process manager Node.js |
| **MongoDB Atlas** | Base de données cloud (option) |

---

## Conventions de Code

### JavaScript/Vue.js

**ESLint + Prettier** :

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "vue/multi-word-component-names": "off"
  }
}
```

**Nommage** :

- **Variables** : camelCase (`userName`, `isActive`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `JWT_SECRET`)
- **Fonctions** : camelCase (`getUserById`, `sendMessage`)
- **Classes** : PascalCase (`User`, `MessageController`)
- **Composants Vue** : PascalCase (`MessageInput.vue`, `ChatView.vue`)
- **Fichiers** : kebab-case ou PascalCase selon le type

**Structure de Fonction** :

```javascript
/**
 * Description de la fonction
 * @param {string} param1 - Description du paramètre
 * @param {number} param2 - Description du paramètre
 * @returns {Promise<Object>} Description du retour
 */
async function functionName(param1, param2) {
  // Validation des paramètres
  if (!param1) throw new Error('param1 is required');
  
  // Logique métier
  const result = await someOperation(param1, param2);
  
  // Retour
  return result;
}
```

### Commits Git

**Convention Conventional Commits** :

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Tâches diverses (build, config)

**Exemples** :

```bash
feat(chat): ajouter les réactions aux messages
fix(auth): corriger la validation du JWT expiré
docs(api): ajouter la documentation de l'endpoint /messages
test(user): augmenter la couverture des tests utilisateur
```

### API REST

**Conventions d'URL** :

```
GET     /api/resource          # Liste toutes les ressources
GET     /api/resource/:id      # Récupère une ressource
POST    /api/resource          # Crée une ressource
PUT     /api/resource/:id      # Met à jour une ressource (complet)
PATCH   /api/resource/:id      # Met à jour une ressource (partiel)
DELETE  /api/resource/:id      # Supprime une ressource
```

**Codes de Réponse HTTP** :

- `200 OK` : Succès (GET, PUT, PATCH)
- `201 Created` : Ressource créée (POST)
- `204 No Content` : Succès sans contenu (DELETE)
- `400 Bad Request` : Données invalides
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Non autorisé
- `404 Not Found` : Ressource introuvable
- `409 Conflict` : Conflit (email déjà utilisé)
- `429 Too Many Requests` : Rate limit atteint
- `500 Internal Server Error` : Erreur serveur

**Format de Réponse** :

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Format d'Erreur** :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

---

## Tests

### Backend Tests (Jest)

**Lancer les tests** :

```bash
cd backend

# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests spécifiques
npm test -- user.test.js
```

**Structure d'un Test** :

```javascript
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

**Couverture de Tests** :

Objectif : **>70% de couverture globale**

Actuel :
- Backend : 75.3% (Statements: 78.6%, Branches: 69.2%, Functions: 81.7%, Lines: 71.7%)
- Frontend : 86.7% (Statements: 89.3%, Branches: 82.1%, Functions: 91.5%, Lines: 84.0%)

### Frontend Tests (Vitest)

**Lancer les tests** :

```bash
cd frontend

# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode UI
npm run test:ui
```

**Structure d'un Test Vue** :

```javascript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MessageInput from '@/components/chat/MessageInput.vue';

describe('MessageInput.vue', () => {
  it('should render correctly', () => {
    const wrapper = mount(MessageInput);
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should emit send event on Enter', async () => {
    const wrapper = mount(MessageInput);
    const textarea = wrapper.find('textarea');
    
    await textarea.setValue('Hello world');
    await textarea.trigger('keydown.enter');
    
    expect(wrapper.emitted('send')).toBeTruthy();
    expect(wrapper.emitted('send')[0][0]).toBe('Hello world');
  });

  it('should add new line on Shift+Enter', async () => {
    const wrapper = mount(MessageInput);
    const textarea = wrapper.find('textarea');
    
    await textarea.setValue('Hello');
    await textarea.trigger('keydown.enter', { shiftKey: true });
    
    expect(wrapper.emitted('send')).toBeFalsy();
  });
});
```

---

## Contribution

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines de contribution détaillées.

### Workflow de Contribution

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez une branche** : `git checkout -b feat/ma-fonctionnalite`
4. **Committez** vos changements : `git commit -m "feat: ajouter ma fonctionnalité"`
5. **Push** vers votre fork : `git push origin feat/ma-fonctionnalite`
6. **Créez une Pull Request** sur GitHub

### Pull Request Checklist

- [ ] Le code suit les conventions du projet
- [ ] Les tests passent (`npm test`)
- [ ] La couverture de tests est maintenue ou améliorée
- [ ] La documentation est mise à jour si nécessaire
- [ ] Le commit suit la convention Conventional Commits
- [ ] Pas de conflit avec la branche `master`

---

## Ressources

- **Documentation API** : [API.md](../API.md)
- **Documentation Utilisateur** : [docs/user/](../user/README.md)
- **Architecture** : [01-architecture-messagerie.md](../01-architecture-messagerie.md)
- **Modèles de Données** : [04-modeles-donnees.md](../04-modeles-donnees.md)
- **Plan de Tests** : [05-plan-tests.md](../05-plan-tests.md)

---

## Support

- **GitHub Issues** : [github.com/Sereir/WhatsUp/issues](https://github.com/Sereir/WhatsUp/issues)
- **Documentation** : [docs/](../README.md)
- **Email** : dev@whatsup.com

**Happy Coding! 🚀**
