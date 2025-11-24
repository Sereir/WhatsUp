# Backend WhatsApp Clone

Backend Node.js/Express pour l'application WhatsApp Clone.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

### Configuration

Créer un fichier `.env` à la racine avec les variables suivantes :

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/whatsup
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Lancement

```bash
# Développement (avec auto-reload)
npm run dev

# Production
npm start

# Tests
npm test

# Tests avec watch
npm run test:watch
```

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, JWT, Sentry)
│   ├── controllers/     # Logique métier
│   ├── middleware/      # Middlewares Express
│   ├── models/          # Modèles Mongoose
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires
│   ├── app.js           # Configuration Express
│   └── server.js        # Point d'entrée
├── uploads/             # Fichiers uploadés
├── logs/                # Logs de l'application
└── tests/               # Tests
```

## 🔐 API Endpoints

### Authentification

```
POST   /api/auth/register       # Inscription
POST   /api/auth/login          # Connexion
POST   /api/auth/logout         # Déconnexion
POST   /api/auth/refresh        # Rafraîchir le token
GET    /api/auth/me             # Utilisateur actuel
```

### Utilisateurs

```
GET    /api/users/search        # Rechercher des utilisateurs
GET    /api/users/sessions      # Sessions actives
DELETE /api/users/sessions/:id  # Révoquer une session
PATCH  /api/users/profile       # Mettre à jour le profil
POST   /api/users/avatar        # Upload avatar
PATCH  /api/users/status        # Mettre à jour le statut
DELETE /api/users/account       # Supprimer le compte
GET    /api/users/:id           # Profil utilisateur
```

### Contacts

```
GET    /api/contacts                    # Liste des contacts
POST   /api/contacts                    # Ajouter un contact
PATCH  /api/contacts/:id                # Mettre à jour un contact
DELETE /api/contacts/:id                # Supprimer un contact
PATCH  /api/contacts/:id/block          # Bloquer un contact
PATCH  /api/contacts/:id/unblock        # Débloquer un contact
PATCH  /api/contacts/:id/favorite       # Favori/non-favori
```

## 🔒 Sécurité

- ✅ Hachage des mots de passe (bcrypt)
- ✅ Authentification JWT
- ✅ Rate limiting
- ✅ Helmet (sécurité HTTP)
- ✅ CORS configuré
- ✅ Sanitization MongoDB
- ✅ Validation des entrées (Joi)

## 📝 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement | development |
| `PORT` | Port du serveur | 3000 |
| `MONGODB_URI` | URI MongoDB | - |
| `JWT_SECRET` | Secret JWT | - |
| `JWT_EXPIRES_IN` | Durée du token | 7d |
| `CORS_ORIGIN` | Origine CORS | http://localhost:5173 |
| `MAX_FILE_SIZE` | Taille max fichier | 52428800 (50MB) |
| `SENTRY_DSN` | DSN Sentry (optionnel) | - |

## 🧪 Tests

```bash
# Tous les tests
npm test

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Couverture
npm run test:coverage
```

## 📊 Logging

Les logs sont enregistrés dans le dossier `logs/` :
- `error.log` : Erreurs uniquement
- `combined.log` : Tous les logs

## 🐛 Debug

```bash
# Logs détaillés
NODE_ENV=development npm run dev
```

## 📦 Dépendances Principales

- **express** : Framework web
- **mongoose** : ODM MongoDB
- **jsonwebtoken** : Authentification JWT
- **bcryptjs** : Hachage de mots de passe
- **joi** : Validation de données
- **socket.io** : WebSocket (à venir)
- **multer** : Upload de fichiers
- **sharp** : Traitement d'images
- **winston** : Logging

## 🚧 TODO

- [ ] WebSocket pour le temps réel
- [ ] Conversations et messages
- [ ] Groupes
- [ ] Médias (images, vidéos, fichiers)
- [ ] Notifications
- [ ] Tests E2E

## 📄 Licence

MIT
