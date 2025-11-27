# WhatsUp 💬

Application de messagerie instantanée moderne avec support multimédia, conversations de groupe et synchronisation en temps réel.

[![CI/CD](https://github.com/yourusername/WhatsUp/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/WhatsUp/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Déploiement](#-déploiement)
- [Documentation](#-documentation)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Licence](#-licence)

## ✨ Fonctionnalités

### Messagerie
- 💬 **Conversations privées** - Messages 1-to-1 en temps réel
- 👥 **Groupes** - Créez et gérez des conversations de groupe
- 📎 **Multimédia** - Envoi d'images, vidéos, fichiers
- ⚡ **Temps réel** - Synchronisation instantanée via WebSocket
- ✅ **Statuts** - Vu, livré, en cours d'envoi
- 😊 **Réactions** - Réagissez aux messages avec des emojis
- ✏️ **Édition** - Modifiez vos messages envoyés
- 🗑️ **Suppression** - Supprimez vos messages

### Utilisateurs
- 🔐 **Authentification JWT** - Connexion sécurisée
- 👤 **Profils** - Avatar, bio, statut personnalisé
- 📱 **Multi-sessions** - Connectez-vous sur plusieurs appareils
- 🔔 **Notifications** - Notifications push en temps réel
- 🛡️ **Sécurité** - Alertes de sécurité, détection d'activité suspecte

### Contacts
- 📇 **Gestion contacts** - Ajoutez et bloquez des utilisateurs
- 🟢 **Statut en ligne** - Voyez qui est connecté
- 🕐 **Dernière connexion** - Heure de dernière activité

## 🏗️ Architecture

```
WhatsUp/
├── backend/          # API Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/         # Application Vue.js 3
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── store/
│   │   ├── router/
│   │   └── services/
│   └── tests/
└── docs/            # Documentation
```

## 🛠️ Technologies

### Backend
- **Node.js** 18+ - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Socket.io** - WebSocket pour temps réel
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **Winston** - Logging
- **Jest** - Tests

### Frontend
- **Vue.js 3** - Framework progressif
- **Pinia** - State management
- **Vue Router** - Routing
- **Axios** - Client HTTP
- **Socket.io-client** - WebSocket client
- **Tailwind CSS** - Framework CSS
- **Vitest** - Tests

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy
- **Sentry** - Monitoring des erreurs

## 🚀 Installation

### Prérequis

- **Node.js** 18+ et npm
- **MongoDB** 7.0+
- **Docker** et Docker Compose (optionnel)

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/yourusername/WhatsUp.git
cd WhatsUp

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install

# Revenir à la racine
cd ..
```

### Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer avec vos valeurs
nano .env
```

**Variables importantes:**
```bash
MONGODB_URI=mongodb://localhost:27017/whatsup
JWT_SECRET=votre-secret-jwt-tres-long-et-securise
JWT_REFRESH_SECRET=votre-autre-secret-different
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **Sécurité**: Générez des secrets forts pour la production! Voir [docs/SECRETS.md](docs/SECRETS.md)

### Démarrage

#### Mode développement (sans Docker)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Accès:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

#### Mode développement (avec Docker)

```bash
docker-compose -f docker-compose.dev.yml up
```

## 🐳 Déploiement

### Déploiement rapide avec Docker

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
nano .env  # Éditez avec vos valeurs de production

# 2. Déployer
./scripts/deploy.sh production

# Ou sur Windows PowerShell
.\scripts\deploy.ps1 -Environment production
```

**L'application sera accessible sur:**
- Frontend: http://localhost
- API: http://localhost:3000

### Déploiement sur serveur

Voir le guide complet: [README.deployment.md](README.deployment.md)

**Étapes principales:**
1. Installation Docker sur le serveur
2. Clonage du repository
3. Configuration des secrets
4. Exécution du script de déploiement
5. Configuration Nginx + SSL

### CI/CD avec GitHub Actions

Le pipeline CI/CD s'exécute automatiquement sur:
- Push vers `main`/`master`
- Pull requests

**Pipeline:**
1. ✅ Lint (ESLint backend + frontend)
2. ✅ Tests (Jest + Vitest)
3. 🐳 Build Docker images
4. 🔐 Security scanning (Trivy)
5. 🚀 Déploiement automatique (si configuré)

## 📚 Documentation

- **[Architecture](docs/01-architecture-messagerie.md)** - Vue d'ensemble de l'architecture
- **[Structure technique](docs/02-structure-technique.md)** - Organisation du code
- **[User stories](docs/03-user-stories.md)** - Fonctionnalités utilisateur
- **[Modèles de données](docs/04-modeles-donnees.md)** - Schémas MongoDB
- **[Tests](docs/05-plan-tests.md)** - Stratégie de tests
- **[Déploiement](README.deployment.md)** - Guide de déploiement complet
- **[Secrets](docs/SECRETS.md)** - Gestion des secrets et sécurité

## 🧪 Tests

### Backend

```bash
cd backend

# Tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch

# Lint
npm run lint
```

### Frontend

```bash
cd frontend

# Tous les tests
npm run test

# Tests avec coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch

# Lint
npm run lint
```

### Couverture de tests actuelle

- **Backend**: 52.88% statements, 32.98% branches
- **Frontend**: 21.61% statements, 12.41% branches

> 🎯 **Objectif**: 70%+ de couverture

## 🔧 Scripts utiles

```bash
# Démarrer en production
./scripts/deploy.sh production

# Backup de la base de données
./scripts/backup.sh

# Restaurer un backup
./scripts/restore.sh backups/mongodb_backup_20231127.archive

# Monitoring
./scripts/monitor.sh

# Voir les logs
docker-compose logs -f

# Redémarrer les services
docker-compose restart
```

**Sur Windows, utilisez les scripts `.ps1`:**
```powershell
.\scripts\deploy.ps1
.\scripts\backup.ps1
.\scripts\monitor.ps1
```

## 🐛 Troubleshooting

### MongoDB ne démarre pas

```bash
# Vérifier les logs
docker-compose logs mongodb

# Supprimer les volumes et recréer
docker-compose down -v
docker-compose up -d
```

### Backend ne se connecte pas

```bash
# Vérifier la variable MONGODB_URI
docker-compose exec backend env | grep MONGODB

# Tester la connexion MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Frontend ne charge pas

```bash
# Rebuild le frontend
docker-compose build frontend
docker-compose up -d frontend

# Vérifier les logs
docker-compose logs frontend
```

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Conventions

- **Commits**: Format [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction de bug
  - `docs:` documentation
  - `test:` ajout de tests
  - `refactor:` refactoring
  - `chore:` tâches de maintenance

- **Code**: ESLint + Prettier
- **Tests**: Écrire des tests pour les nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Votre Nom** - [@yourusername](https://github.com/yourusername)

## 🙏 Remerciements

- [Vue.js](https://vuejs.org/)
- [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

- 📧 Email: support@whatsup.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/WhatsUp/issues)
- 💬 Discord: [Rejoindre notre serveur](https://discord.gg/whatsup)

---

**Made with ❤️ by the WhatsUp Team**
