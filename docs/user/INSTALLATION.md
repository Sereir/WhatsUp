# Guide d'Installation WhatsUp

## Prérequis

Avant d'installer WhatsUp, assurez-vous d'avoir les éléments suivants :

### Logiciels Requis
- **Node.js** : version 18 ou supérieure
- **npm** : version 8 ou supérieure (inclus avec Node.js)
- **MongoDB** : version 5.0 ou supérieure
- **Git** : pour cloner le repository

### Configuration Minimale
- **RAM** : 2 GB minimum (4 GB recommandé)
- **Espace disque** : 500 MB minimum
- **Système d'exploitation** : Windows 10+, macOS 10.15+, ou Linux (Ubuntu 20.04+)

---

## Installation en Local (Développement)

### 1. Cloner le Repository

```bash
git clone https://github.com/Sereir/WhatsUp.git
cd WhatsUp
```

### 2. Installer MongoDB

#### Windows
1. Téléchargez MongoDB Community Server depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Installez avec les paramètres par défaut
3. MongoDB démarre automatiquement comme service Windows

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```

#### Linux (Ubuntu/Debian)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 3. Configurer le Backend

```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier de configuration
cp .env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
# Serveur
NODE_ENV=development
PORT=3000

# Base de données
MONGODB_URI=mongodb://localhost:27017/whatsup
MONGODB_TEST_URI=mongodb://localhost:27017/whatsup_test

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Important** : Générez un JWT_SECRET sécurisé :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configurer le Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Créer le fichier de configuration
cp .env.example .env
```

Éditez le fichier `.env` :

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 5. Démarrer l'Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Le backend démarre sur `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### 6. Vérifier l'Installation

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Vous devriez voir la page d'inscription/connexion
3. Créez un compte pour tester l'application

---

## Installation avec Docker (Production)

### Prérequis Docker
- **Docker** : version 20.10 ou supérieure
- **Docker Compose** : version 2.0 ou supérieure

### 1. Cloner le Repository

```bash
git clone https://github.com/Sereir/WhatsUp.git
cd WhatsUp
```

### 2. Configuration

Créez un fichier `.env` à la racine :

```env
# Backend
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/whatsup
JWT_SECRET=votre_secret_jwt_production_tres_securise
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost

# Frontend
VITE_API_URL=http://localhost
VITE_WS_URL=ws://localhost

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=changez_ce_mot_de_passe
```

**IMPORTANT** : Changez TOUS les mots de passe et secrets en production !

### 3. Démarrer avec Docker Compose

```bash
# Build et démarrage
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

L'application est accessible sur `http://localhost`

### 4. Arrêter l'Application

```bash
docker-compose down
```

Pour supprimer aussi les volumes (données) :
```bash
docker-compose down -v
```

---

## Installation sur Serveur (Production Manuelle)

### 1. Prérequis Serveur
- Ubuntu 20.04+ ou CentOS 8+
- Accès root ou sudo
- Nom de domaine configuré (optionnel mais recommandé)

### 2. Installer les Dépendances

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MongoDB
# (voir instructions Linux ci-dessus)

# PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Nginx (reverse proxy)
sudo apt-get install -y nginx

# Certbot (SSL gratuit)
sudo apt-get install -y certbot python3-certbot-nginx
```

### 3. Déployer l'Application

```bash
# Cloner le code
cd /var/www
sudo git clone https://github.com/Sereir/WhatsUp.git
cd WhatsUp

# Backend
cd backend
npm install --production
cp .env.example .env
# Éditer .env avec vos paramètres de production

# Frontend
cd ../frontend
npm install
npm run build

# Copier les fichiers build vers nginx
sudo cp -r dist/* /var/www/html/
```

### 4. Configurer PM2 pour le Backend

```bash
cd /var/www/WhatsUp/backend

# Démarrer avec PM2
pm2 start src/server.js --name whatsup-backend

# Sauvegarder la configuration
pm2 save

# Démarrage automatique au boot
pm2 startup
```

### 5. Configurer Nginx

Créez `/etc/nginx/sites-available/whatsup` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Activez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/whatsup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurer SSL (HTTPS)

```bash
sudo certbot --nginx -d votre-domaine.com
```

Suivez les instructions pour obtenir un certificat SSL gratuit.

---

## Vérification de l'Installation

### Tests Backend

```bash
cd backend

# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Démarrer en mode debug
npm run dev
```

### Tests Frontend

```bash
cd frontend

# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Build de production
npm run build
```

### Health Check

Vérifiez que les services sont opérationnels :

```bash
# Backend API
curl http://localhost:3000/api/health

# MongoDB
mongosh --eval "db.adminCommand('ping')"
```

Réponse attendue du backend :
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T...",
  "uptime": 1234
}
```

---

## Dépannage Courant

### Le backend ne démarre pas

**Erreur : "Cannot connect to MongoDB"**
- Vérifiez que MongoDB est démarré : `sudo systemctl status mongod`
- Vérifiez l'URI dans `.env` : `MONGODB_URI`
- Testez la connexion : `mongosh`

**Erreur : "Port 3000 already in use"**
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Le frontend ne se connecte pas au backend

**Erreur CORS**
- Vérifiez `CORS_ORIGIN` dans `.env` du backend
- Doit correspondre à l'URL du frontend (ex: `http://localhost:5173`)

**Erreur 404 sur les API calls**
- Vérifiez `VITE_API_URL` dans `.env` du frontend
- Doit pointer vers le backend (ex: `http://localhost:3000`)

### WebSocket ne fonctionne pas

- Vérifiez que `socket.io` est bien installé : `npm list socket.io`
- Vérifiez la configuration nginx pour le reverse proxy
- Vérifiez les logs : `docker-compose logs backend`

### Erreurs de permissions

```bash
# Donner les permissions appropriées
sudo chown -R $USER:$USER /var/www/WhatsUp

# Pour les uploads
chmod -R 755 backend/uploads
```

---

## Mise à Jour

### Mise à jour en Local

```bash
# Sauvegarder vos fichiers .env
cp backend/.env backend/.env.backup
cp frontend/.env frontend/.env.backup

# Récupérer les nouvelles versions
git pull origin master

# Backend
cd backend
npm install
npm run test

# Frontend
cd ../frontend
npm install
npm run build
```

### Mise à jour avec Docker

```bash
# Arrêter les conteneurs
docker-compose down

# Récupérer les mises à jour
git pull origin master

# Rebuild et redémarrer
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f
```

### Mise à jour sur Serveur

```bash
cd /var/www/WhatsUp

# Sauvegarder
git stash

# Mise à jour
git pull origin master
git stash pop

# Backend
cd backend
npm install --production
pm2 restart whatsup-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/

# Vérifier
pm2 status
sudo systemctl status nginx
```

---

## Désinstallation

### Désinstallation Locale

```bash
# Arrêter les processus
# Ctrl+C dans les terminaux

# Supprimer MongoDB (optionnel)
# Windows : Désinstaller via "Programmes et fonctionnalités"
# macOS : brew uninstall mongodb-community
# Linux : sudo apt-get remove mongodb-org

# Supprimer le code
cd ..
rm -rf WhatsUp
```

### Désinstallation Docker

```bash
# Arrêter et supprimer tout
docker-compose down -v --rmi all

# Supprimer le code
cd ..
rm -rf WhatsUp
```

### Désinstallation Serveur

```bash
# Arrêter les services
pm2 delete whatsup-backend
sudo systemctl stop nginx

# Supprimer les fichiers
sudo rm -rf /var/www/WhatsUp
sudo rm /etc/nginx/sites-enabled/whatsup
sudo rm /etc/nginx/sites-available/whatsup

# Redémarrer nginx
sudo systemctl restart nginx

# Désinstaller MongoDB (optionnel)
sudo systemctl stop mongod
sudo apt-get remove mongodb-org
```

---

## Support

Pour toute question ou problème :

- **Issues GitHub** : [github.com/Sereir/WhatsUp/issues](https://github.com/Sereir/WhatsUp/issues)
- **Documentation** : [docs/](../README.md)
- **FAQ** : [FAQ.md](FAQ.md)

---

## Prochaines Étapes

Après l'installation, consultez :
- [Guide d'Utilisation](GUIDE_UTILISATEUR.md) - Comment utiliser WhatsUp
- [FAQ](FAQ.md) - Questions fréquentes
- [Documentation Développeur](../developer/README.md) - Pour contribuer au projet
