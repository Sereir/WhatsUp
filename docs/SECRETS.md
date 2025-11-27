# 🔐 Guide de Configuration des Secrets

Ce guide explique comment générer et configurer tous les secrets nécessaires pour le déploiement de WhatsUp.

## 📋 Secrets Requis

### 1. JWT Secrets

Les secrets JWT doivent être des chaînes aléatoires longues et sécurisées.

#### Génération

**Linux/Mac:**
```bash
# JWT Secret (64 caractères)
openssl rand -base64 64 | tr -d '\n' && echo

# JWT Refresh Secret (64 caractères)
openssl rand -base64 64 | tr -d '\n' && echo
```

**Windows PowerShell:**
```powershell
# JWT Secret
$bytes = New-Object Byte[] 64
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# JWT Refresh Secret (répéter la commande)
$bytes = New-Object Byte[] 64
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Node.js:**
```javascript
// Dans Node.js REPL
require('crypto').randomBytes(64).toString('base64')
```

#### Configuration dans .env
```bash
JWT_SECRET=votre_secret_genere_ici
JWT_REFRESH_SECRET=votre_autre_secret_genere_ici
```

---

### 2. MongoDB Password

Utilisez un mot de passe fort pour la base de données.

#### Génération

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Online:** https://passwordsgenerator.net/ (32+ caractères)

#### Configuration dans .env
```bash
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=votre_mot_de_passe_securise
```

---

### 3. Session Secret

Pour signer les sessions (si utilisé).

#### Génération
```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

#### Configuration dans .env
```bash
SESSION_SECRET=votre_session_secret
```

---

## 🔒 GitHub Secrets (Pour CI/CD)

Allez dans `Settings > Secrets and variables > Actions` de votre repo GitHub.

### Secrets à configurer

| Nom du Secret | Description | Exemple |
|---------------|-------------|---------|
| `DOCKER_USERNAME` | Username Docker Hub | `monusername` |
| `DOCKER_PASSWORD` | Token Docker Hub | Token depuis hub.docker.com |
| `MONGODB_URI` | URI MongoDB production | `mongodb://user:pass@host:27017/db` |
| `JWT_SECRET` | Secret JWT | Généré avec openssl |
| `JWT_REFRESH_SECRET` | Secret refresh | Généré avec openssl |
| `SERVER_HOST` | IP/domaine serveur | `123.456.789.0` ou `app.domain.com` |
| `SERVER_USER` | User SSH serveur | `ubuntu` |
| `SERVER_PATH` | Chemin de l'app | `/home/ubuntu/WhatsUp` |
| `SSH_PRIVATE_KEY` | Clé SSH privée | Contenu de `~/.ssh/id_rsa` |

---

## 🐳 Docker Hub Token

1. Allez sur https://hub.docker.com/settings/security
2. Cliquez sur "New Access Token"
3. Donnez un nom: "GitHub Actions"
4. Copiez le token généré
5. Ajoutez-le dans GitHub Secrets comme `DOCKER_PASSWORD`

---

## 🔑 SSH Key pour Déploiement

### Générer une clé SSH

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions@whatsup" -f ~/.ssh/whatsup_deploy

# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/whatsup_deploy.pub user@your-server
```

### Ajouter dans GitHub Secrets

```bash
# Copier le contenu de la clé privée
cat ~/.ssh/whatsup_deploy

# Ajouter dans GitHub Secret: SSH_PRIVATE_KEY
```

---

## 📧 Email (Optionnel)

Si vous utilisez les notifications par email.

### Gmail (avec App Password)

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application: https://myaccount.google.com/apppasswords
3. Configurez dans `.env`:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_app_password
EMAIL_FROM=WhatsUp <noreply@yourdomain.com>
```

### Autres fournisseurs

**SendGrid:**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=votre_api_key
```

**Mailgun:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASSWORD=votre_password
```

---

## 🐛 Sentry (Optionnel)

Pour le tracking des erreurs en production.

1. Créez un compte sur https://sentry.io
2. Créez un nouveau projet
3. Copiez le DSN
4. Ajoutez dans `.env`:

```bash
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

Et dans `frontend/.env.production`:
```bash
VITE_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

---

## ✅ Checklist de Sécurité

Avant le déploiement en production:

- [ ] Tous les secrets par défaut ont été changés
- [ ] JWT_SECRET a au moins 64 caractères aléatoires
- [ ] JWT_REFRESH_SECRET est différent de JWT_SECRET
- [ ] Mot de passe MongoDB est fort (32+ caractères)
- [ ] CORS_ORIGIN est configuré pour votre domaine uniquement
- [ ] Le fichier `.env` n'est PAS commité dans Git
- [ ] Les secrets GitHub Actions sont configurés
- [ ] SSH key est configurée pour le déploiement
- [ ] HTTPS/SSL est activé en production
- [ ] Rate limiting est activé
- [ ] Logs ne contiennent pas de secrets

---

## 📝 Fichier .env Complet

```bash
# Application
NODE_ENV=production
PORT=3000
FRONTEND_PORT=80

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=[GÉNÉRÉ - 32+ caractères]
MONGO_DB_NAME=whatsup

# JWT
JWT_SECRET=[GÉNÉRÉ - 64+ caractères base64]
JWT_REFRESH_SECRET=[GÉNÉRÉ - 64+ caractères base64]
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Session
SESSION_SECRET=[GÉNÉRÉ - 32+ caractères]

# Logging
LOG_LEVEL=info

# Sentry (optionnel)
SENTRY_DSN=

# Email (optionnel)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

---

## 🔄 Rotation des Secrets

Il est recommandé de changer les secrets régulièrement (tous les 3-6 mois).

### Procédure de rotation JWT

1. Générez de nouveaux secrets
2. Mettez à jour `.env` avec les nouveaux secrets
3. Redéployez l'application
4. Les anciens tokens expireront naturellement

⚠️ **Note:** Tous les utilisateurs devront se reconnecter après la rotation.

---

## 🆘 En cas de compromission

Si un secret est compromis:

1. **IMMÉDIATEMENT:** Changez le secret
2. Redéployez l'application
3. Forcez la déconnexion de tous les utilisateurs (si JWT)
4. Auditez les logs pour détecter toute activité suspecte
5. Vérifiez les autres systèmes utilisant le même secret
6. Documentez l'incident

---

## 📞 Support

Pour toute question sur la sécurité:
- 📧 security@whatsup.com
- 🔒 Responsable sécurité: security-team@whatsup.com
