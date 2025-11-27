# 🚀 Guide de Déploiement WhatsUp

## Table des matières
1. [Prérequis](#prérequis)
2. [Configuration](#configuration)
3. [Déploiement Local](#déploiement-local)
4. [Déploiement Production](#déploiement-production)
5. [CI/CD](#cicd)
6. [Maintenance](#maintenance)
7. [Sécurité](#sécurité)

---

## Prérequis

### Logiciels requis
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**
- **Node.js 18+** (pour le développement local)

### Vérification
```bash
docker --version
docker-compose --version
git --version
node --version
```

---

## Configuration

### 1. Cloner le repository
```bash
git clone https://github.com/yourusername/WhatsUp.git
cd WhatsUp
```

### 2. Configuration des variables d'environnement

#### Pour la production
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos valeurs
nano .env
```

**⚠️ IMPORTANT: Changez TOUS les secrets en production!**

Variables critiques à modifier:
- `JWT_SECRET` - Clé secrète JWT (générer avec `openssl rand -base64 64`)
- `JWT_REFRESH_SECRET` - Clé secrète refresh token
- `MONGO_ROOT_PASSWORD` - Mot de passe MongoDB
- `CORS_ORIGIN` - URL de votre domaine

#### Générer des secrets sécurisés
```bash
# Linux/Mac
openssl rand -base64 64

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

---

## Déploiement Local

### Mode Développement

```bash
# Démarrer avec docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

**Accès:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MongoDB: localhost:27017

### Mode Production (local)

```bash
# Windows PowerShell
.\scripts\deploy.ps1 -Environment production

# Linux/Mac
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

**Accès:**
- Application: http://localhost
- API: http://localhost:3000

---

## Déploiement Production

### 1. Sur un serveur VPS/Cloud

#### Prérequis serveur
- Ubuntu 22.04 LTS (recommandé)
- 2 CPU / 4GB RAM minimum
- 20GB+ espace disque
- Accès SSH root ou sudo

#### Installation initiale

```bash
# Connexion SSH
ssh user@your-server-ip

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Déconnexion et reconnexion pour appliquer les droits
exit
ssh user@your-server-ip
```

#### Déploiement de l'application

```bash
# Cloner le repository
git clone https://github.com/yourusername/WhatsUp.git
cd WhatsUp

# Configurer les variables d'environnement
cp .env.example .env
nano .env

# Déployer
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### 2. Configuration Nginx (Reverse Proxy)

Si vous utilisez un domaine:

```bash
# Installer Nginx
sudo apt install nginx -y

# Créer la configuration
sudo nano /etc/nginx/sites-available/whatsup
```

Contenu du fichier:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/whatsup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Installer Certbot pour HTTPS
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## CI/CD

### GitHub Actions

Le pipeline CI/CD est configuré dans `.github/workflows/ci.yml`.

**Étapes du pipeline:**
1. ✅ Lint Backend (ESLint)
2. ✅ Lint Frontend (ESLint)
3. ✅ Tests Backend (Jest)
4. ✅ Tests Frontend (Vitest)
5. 🐳 Build Docker Images
6. 🔐 Security Scanning (Trivy)

### Configuration des secrets GitHub

Allez dans: `Settings > Secrets and variables > Actions`

Ajoutez:
- `DOCKER_USERNAME` - Votre username Docker Hub
- `DOCKER_PASSWORD` - Votre token Docker Hub
- `MONGODB_URI` - URI MongoDB production
- `JWT_SECRET` - Secret JWT

### Déclencher un déploiement

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

Le pipeline se lance automatiquement.

---

## Maintenance

### Logs

```bash
# Voir tous les logs
docker-compose logs -f

# Logs backend uniquement
docker-compose logs -f backend

# Logs frontend uniquement
docker-compose logs -f frontend

# Logs MongoDB
docker-compose logs -f mongodb
```

### Backup MongoDB

```bash
# Backup manuel
docker-compose exec mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/whatsup?authSource=admin" \
  --archive > backup_$(date +%Y%m%d).archive

# Restaurer un backup
docker-compose exec -T mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/whatsup?authSource=admin" \
  --archive < backup_20231127.archive
```

### Mise à jour de l'application

```bash
# Pull les derniers changements
git pull origin main

# Redéployer
./scripts/deploy.sh production
```

### Monitoring

```bash
# Statut des conteneurs
docker-compose ps

# Ressources utilisées
docker stats

# Espace disque
docker system df
```

### Nettoyage

```bash
# Nettoyer les images inutilisées
docker system prune -a

# Nettoyer les volumes inutilisés
docker volume prune

# Tout nettoyer (ATTENTION: supprime les données!)
docker-compose down -v
```

---

## Sécurité

### ✅ Checklist de sécurité

- [ ] Changé tous les secrets par défaut
- [ ] JWT_SECRET est un string aléatoire de 64+ caractères
- [ ] Mot de passe MongoDB fort
- [ ] CORS configuré pour votre domaine uniquement
- [ ] HTTPS activé avec certificat SSL
- [ ] Rate limiting activé
- [ ] Firewall configuré (UFW)
- [ ] Fail2ban installé
- [ ] Backups automatiques configurés
- [ ] Monitoring mis en place
- [ ] Logs centralisés

### Configuration Firewall (UFW)

```bash
# Installer UFW
sudo apt install ufw -y

# Autoriser SSH
sudo ufw allow OpenSSH

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable
sudo ufw status
```

### Fail2ban

```bash
# Installer Fail2ban
sudo apt install fail2ban -y

# Configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Redémarrer
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

---

## Troubleshooting

### Problème: Les conteneurs ne démarrent pas

```bash
# Voir les logs d'erreur
docker-compose logs

# Vérifier le fichier .env
cat .env

# Reconstruire les images
docker-compose build --no-cache
docker-compose up -d
```

### Problème: MongoDB ne se connecte pas

```bash
# Vérifier que MongoDB est en cours d'exécution
docker-compose ps mongodb

# Tester la connexion
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Vérifier les credentials
docker-compose exec backend env | grep MONGODB
```

### Problème: Frontend ne charge pas

```bash
# Vérifier les logs Nginx
docker-compose logs frontend

# Vérifier la configuration Nginx
docker-compose exec frontend cat /etc/nginx/nginx.conf

# Rebuild le frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

## Support

Pour toute question ou problème:
- 📧 Email: support@whatsup.com
- 🐛 Issues: https://github.com/yourusername/WhatsUp/issues
- 📚 Documentation: https://docs.whatsup.com

---

## Licence

MIT © 2025 WhatsUp Team
