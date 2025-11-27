# WhatsUp - Application de Messagerie

Ce projet est une application de messagerie instantanée complète avec support temps réel, conversations de groupe et partage multimédia.

## 🚀 Démarrage Rapide

### Avec Docker (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/yourusername/WhatsUp.git
cd WhatsUp

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer l'application
docker-compose up -d

# 4. Accéder à l'application
# Frontend: http://localhost
# Backend: http://localhost:3000
```

### Sans Docker

```bash
# 1. Installer MongoDB localement
# https://www.mongodb.com/docs/manual/installation/

# 2. Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# 3. Configurer l'environnement
cp .env.example .env

# 4. Démarrer (2 terminaux)
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 📚 Documentation Complète

- **[README Principal](README.md)** - Vue d'ensemble et installation détaillée
- **[Guide de Déploiement](README.deployment.md)** - Déploiement en production
- **[Gestion des Secrets](docs/SECRETS.md)** - Sécurité et configuration
- **[Commandes Rapides](docs/QUICK_COMMANDS.md)** - Référence des commandes

## 🔗 Liens Utiles

- Frontend Dev: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## 📞 Support

- Issues: https://github.com/yourusername/WhatsUp/issues
- Email: support@whatsup.com
