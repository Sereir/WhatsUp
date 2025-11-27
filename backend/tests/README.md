# Guide des Tests Backend - WhatsUp

## 📋 Vue d'ensemble

Suite complète de tests pour l'application WhatsUp incluant :
- **Tests unitaires** des modèles, services et middleware
- **Tests d'intégration** des API REST
- **Tests WebSocket** pour les événements temps réel
- **Couverture de code** avec Jest

## 🚀 Installation

```bash
cd backend
npm install
```

Les dépendances de test sont déjà incluses :
- `jest` - Framework de test
- `supertest` - Tests HTTP
- `mongodb-memory-server` - Base de données MongoDB en mémoire
- `socket.io-client` - Tests WebSocket

## 📝 Scripts de test disponibles

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:verbose": "jest --verbose"
}
```

### Exécution des tests

```bash
# Tous les tests
npm test

# Avec couverture de code
npm run test:coverage

# Mode watch (développement)
npm run test:watch

# Tests verbeux avec détails
npm run test:verbose

# Test spécifique
npm test -- tests/unit/models/User.test.js

# Tests d'intégration uniquement
npm test -- tests/integration

# Tests unitaires uniquement  
npm test -- tests/unit
```

## 📂 Structure des tests

```
backend/
├── jest.config.js                    # Configuration Jest
├── tests/
│   ├── jest.setup.js                 # Configuration globale
│   ├── helpers/
│   │   ├── dbSetup.js                # Gestion MongoDB Memory Server
│   │   ├── testHelpers.js            # Fonctions utilitaires
│   │   └── mockData.js               # Données de test
│   ├── unit/
│   │   ├── models/
│   │   │   ├── User.test.js          # Tests modèle User
│   │   │   ├── Message.test.js       # Tests modèle Message
│   │   │   └── Conversation.test.js  # Tests modèle Conversation
│   │   ├── services/
│   │   │   └── securityAlertService.test.js
│   │   └── middleware/
│   │       ├── auth.middleware.test.js
│   │       └── validation.middleware.test.js
│   └── integration/
│       ├── auth.test.js              # Tests API authentification
│       ├── messages.test.js          # Tests API messages
│       ├── conversations.test.js     # Tests API conversations
│       └── socket.test.js            # Tests WebSocket (Socket.io)
```

## 🧪 Types de tests

### 1. Tests Unitaires des Modèles

**User.test.js** - 15 tests
- Création d'utilisateurs
- Validation des données
- Hachage du mot de passe
- Méthodes du modèle (comparePassword, updateLastSeen, fullName)
- Protection de la vie privée (exclusion du password)

**Message.test.js** - 12 tests
- Création de messages (texte, image, vidéo)
- Gestion des réactions (ajout, retrait, doublons)
- Statuts de messages (livré, lu)
- Suppression de messages

**Conversation.test.js** - 11 tests
- Conversations privées et de groupe
- Gestion des membres (ajout, retrait)
- Archivage de conversations
- Protection de l'admin

### 2. Tests Unitaires des Services

**securityAlertService.test.js** - 5 tests
- Création d'alertes de sécurité
- Enregistrement des connexions
- Changements de mot de passe
- Récupération et pagination des alertes

### 3. Tests Unitaires des Middleware

**auth.middleware.test.js** - 5 tests
- Authentification JWT
- Validation des tokens
- Gestion des tokens expirés
- Protection des routes

**validation.middleware.test.js** - 15 tests
- Validation des données d'inscription
- Validation des données de connexion
- Validation des messages
- Validation des réactions
- Validation des profils

### 4. Tests d'Intégration des API

**auth.test.js** - 13 tests
```javascript
POST /api/auth/register   // Inscription
POST /api/auth/login      // Connexion  
GET  /api/auth/me         // Profil utilisateur
POST /api/auth/logout     // Déconnexion
```

**messages.test.js** - 13 tests
```javascript
POST   /api/messages                      // Créer message
GET    /api/messages/:conversationId     // Récupérer messages
POST   /api/messages/:id/reaction         // Ajouter réaction
DELETE /api/messages/:id/reaction         // Retirer réaction
PUT    /api/messages/:id                  // Éditer message
DELETE /api/messages/:id                  // Supprimer message
```

**conversations.test.js** - 13 tests
```javascript
GET    /api/conversations                 // Liste conversations
POST   /api/conversations                 // Créer conversation
POST   /api/conversations/group           // Créer groupe
PUT    /api/conversations/:id             // Mettre à jour groupe
DELETE /api/conversations/:id             // Supprimer conversation
POST   /api/conversations/:id/members     // Ajouter membre
DELETE /api/conversations/:id/members/:id // Retirer membre
```

### 5. Tests WebSocket (Socket.io)

**socket.test.js** - 9 tests
- Connexion et authentification Socket.io
- Événements de messages en temps réel
- Événements de réactions
- Indicateurs de typing
- Gestion des rooms
- Déconnexion propre

## 🔧 Helpers de test

### testHelpers.js

```javascript
// Créer des utilisateurs de test
const user = await createTestUser({ email: 'custom@test.com' });
const [user1, user2] = await createTestUsers(2);

// Générer un token JWT
const token = generateTestToken(user._id);

// Créer des conversations de test
const conv = await createTestConversation([user1._id, user2._id]);

// Créer des messages de test
const message = await createTestMessage(user._id, conv._id, 'Hello');

// Nettoyer la base de données
await cleanupDatabase();

// Mocks pour les middleware
const req = createMockRequest({ body: { email: 'test@test.com' } });
const res = createMockResponse();
const next = createMockNext();
```

### dbSetup.js

```javascript
// Configuration MongoDB Memory Server
beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});
```

## 📊 Couverture de code

### Objectif : 70% minimum

Configuration dans `jest.config.js` :
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Rapport de couverture

Après exécution de `npm run test:coverage`, le rapport est disponible dans :
- Console : Résumé textuel
- `coverage/lcov-report/index.html` : Rapport HTML détaillé

Ouvrir le rapport HTML :
```bash
start coverage/lcov-report/index.html
```

## 🐛 Débogage des tests

### Mode verbose
```bash
npm run test:verbose
```

### Tests spécifiques avec pattern
```bash
npm test -- --testNamePattern="devrait créer un utilisateur"
```

### Détecter les handles async ouverts
```bash
npm test -- --detectOpenHandles
```

### Afficher la stack trace complète
```bash
npm test -- --verbose --no-coverage
```

## ⚠️ Notes importantes

### Variables d'environnement de test

Les variables sont configurées automatiquement dans `tests/jest.setup.js` :
```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRE = '7d';
process.env.PORT = 5001;
process.env.SENTRY_DSN = ''; // Désactivé en test
```

### MongoDB Memory Server

- Base de données en mémoire pour l'isolation des tests
- Chaque suite de tests utilise sa propre instance
- Nettoyage automatique entre les tests

### Isolation des tests

- Chaque test est indépendant
- La base de données est nettoyée entre chaque test
- Les mocks sont réinitialisés automatiquement

### Timeout

Timeout par défaut : 30 secondes (configuré dans `jest.setup.js`)

Pour un test spécifique nécessitant plus de temps :
```javascript
it('test long', async () => {
  // code
}, 60000); // 60 secondes
```

## 📝 Écrire de nouveaux tests

### Template de test unitaire

```javascript
const { connectDatabase, clearDatabase, closeDatabase } = require('../helpers/dbSetup');

describe('Ma Feature', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('devrait faire quelque chose', async () => {
    // Arrange
    const user = await createTestUser();
    
    // Act
    const result = await myFunction(user);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

### Template de test d'intégration

```javascript
const request = require('supertest');
const app = createTestApp();

describe('Mon API', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  it('devrait retourner 200', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
```

## 🔍 Bonnes pratiques

1. **Nommer les tests clairement** : Utiliser "devrait..." pour décrire le comportement attendu
2. **Un test = Un concept** : Tester une seule chose par test
3. **Arranger, Agir, Affirmer** : Structure AAA (Arrange, Act, Assert)
4. **Tests indépendants** : Ne pas dépendre de l'ordre d'exécution
5. **Nettoyer après les tests** : Utiliser `afterEach` et `afterAll`
6. **Mocks intelligents** : Mocker les dépendances externes (APIs, Socket.io)
7. **Assertions précises** : Vérifier les valeurs exactes, pas juste l'existence
8. **Tests edge cases** : Tester les cas limites et erreurs

## 🚨 Résolution des problèmes courants

### Erreur "MongoMemoryServer already running"
```bash
# Forcer l'arrêt de Jest
npm test -- --forceExit
```

### Tests qui timeout
- Augmenter le timeout dans jest.config.js
- Vérifier les connexions non fermées

### Erreurs de validation Mongoose
- Vérifier les contraintes du schéma
- S'assurer que les données de test sont valides

### Rate limiting dans les tests
- Désactiver le rate limiting en mode test
- Ou augmenter les limites pour les tests

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Socket.io Testing](https://socket.io/docs/v4/testing/)
