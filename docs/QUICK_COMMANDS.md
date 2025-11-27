# 🚀 Commandes Rapides WhatsUp

Guide de référence rapide pour les commandes courantes.

## 📦 Installation

```bash
# Installation complète
npm run install-all  # ou make install
```

## 🏃 Démarrage

### Sans Docker

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Avec Docker

```bash
# Développement
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# Ou avec le script
./scripts/deploy.sh production      # Linux/Mac
.\scripts\deploy.ps1                # Windows
```

## 🧪 Tests

```bash
# Backend
cd backend
npm test                    # Tous les tests
npm run test:watch         # Mode watch
npm run test:coverage      # Avec couverture
npm run lint              # Linter

# Frontend
cd frontend
npm run test              # Tous les tests
npm run test:watch        # Mode watch
npm run test:coverage     # Avec couverture
npm run lint             # Linter
```

## 🐳 Docker

```bash
# Build
docker-compose build
docker-compose build --no-cache  # Sans cache

# Démarrer
docker-compose up -d
docker-compose -f docker-compose.dev.yml up -d

# Arrêter
docker-compose down
docker-compose down -v  # Avec volumes

# Logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Status
docker-compose ps
docker stats

# Redémarrer un service
docker-compose restart backend
docker-compose restart frontend
```

## 🗄️ MongoDB

```bash
# Se connecter à MongoDB
docker-compose exec mongodb mongosh

# Backup
./scripts/backup.sh                # Linux/Mac
.\scripts\backup.ps1              # Windows

# Restore
./scripts/restore.sh backups/file.archive  # Linux/Mac
.\scripts\restore.ps1 -BackupFile backups/file.archive  # Windows

# Commandes MongoDB utiles
docker-compose exec mongodb mongosh --eval "show dbs"
docker-compose exec mongodb mongosh --eval "use whatsup; db.users.find()"
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 📊 Monitoring

```bash
# Script de monitoring
./scripts/monitor.sh              # Linux/Mac
.\scripts\monitor.ps1            # Windows

# Logs en temps réel
docker-compose logs -f --tail=100

# Ressources
docker stats

# Espace disque
docker system df
```

## 🧹 Nettoyage

```bash
# Nettoyer Docker
docker-compose down -v
docker system prune -a
docker volume prune

# Nettoyer node_modules
rm -rf backend/node_modules frontend/node_modules
npm install  # Réinstaller
```

## 🔐 Sécurité

```bash
# Générer un secret JWT (Linux/Mac)
openssl rand -base64 64

# Générer un secret JWT (Windows)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))

# Audit des dépendances
cd backend && npm audit
cd frontend && npm audit

# Fix automatique
npm audit fix
```

## 🌐 Production

```bash
# Build production
docker-compose build --no-cache

# Déployer
./scripts/deploy.sh production    # Linux/Mac
.\scripts\deploy.ps1              # Windows

# Health check
curl http://localhost/health
curl http://localhost:3000/health

# Vérifier SSL
curl https://yourdomain.com/health
```

## 🔄 Git

```bash
# Commit standard
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Conventions de commit
feat:      # Nouvelle fonctionnalité
fix:       # Correction de bug
docs:      # Documentation
test:      # Tests
refactor:  # Refactoring
chore:     # Maintenance
style:     # Formatage
perf:      # Performance
```

## 📝 Variables d'environnement

```bash
# Copier l'exemple
cp .env.example .env

# Éditer
nano .env              # Linux/Mac
notepad .env          # Windows

# Vérifier les variables
cat .env | grep JWT
docker-compose config  # Voir la config finale
```

## 🆘 Dépannage

### Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Reconstruire
docker-compose build backend --no-cache
docker-compose up -d backend

# Vérifier MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Frontend ne charge pas

```bash
# Vérifier les logs
docker-compose logs frontend

# Reconstruire
docker-compose build frontend --no-cache
docker-compose up -d frontend

# Vérifier Nginx
docker-compose exec frontend nginx -t
```

### MongoDB ne se connecte pas

```bash
# Logs MongoDB
docker-compose logs mongodb

# Réinitialiser
docker-compose down -v
docker-compose up -d mongodb

# Tester la connexion
docker-compose exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.error(e))"
```

### Port déjà utilisé

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📊 Makefile (si installé)

```bash
make help       # Voir toutes les commandes
make install    # Installer les dépendances
make build      # Build Docker
make up         # Démarrer
make down       # Arrêter
make logs       # Voir les logs
make test       # Lancer les tests
make lint       # Lancer les linters
make clean      # Nettoyer
make backup     # Backup MongoDB
make dev        # Mode développement
make prod       # Mode production
```

## 🔗 URLs importantes

```
Frontend Dev:      http://localhost:5173
Frontend Prod:     http://localhost
Backend API:       http://localhost:3000
MongoDB:           mongodb://localhost:27017
Health Backend:    http://localhost:3000/health
Health Frontend:   http://localhost/health
API Docs:          http://localhost:3000/api-docs (si configuré)
```

## 📱 API Endpoints

```bash
# Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh

# Users
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/avatar

# Contacts
GET    /api/contacts
POST   /api/contacts
DELETE /api/contacts/:id

# Conversations
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/:id
PUT    /api/conversations/:id
DELETE /api/conversations/:id

# Messages
GET    /api/messages/conversation/:id
POST   /api/messages
PUT    /api/messages/:id
DELETE /api/messages/:id
POST   /api/messages/:id/react

# Notifications
GET    /api/notifications
PUT    /api/notifications/:id/read
DELETE /api/notifications/:id
```

## 🎯 Tests rapides

```bash
# Tester l'API avec curl
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Avec token
TOKEN="votre_token_jwt"
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

💡 **Astuce**: Ajoutez ces alias dans votre `.bashrc` ou `.zshrc`:

```bash
alias wup="cd ~/WhatsUp && docker-compose up -d"
alias wdown="cd ~/WhatsUp && docker-compose down"
alias wlogs="cd ~/WhatsUp && docker-compose logs -f"
alias wtest="cd ~/WhatsUp/backend && npm test && cd ../frontend && npm test"
```
