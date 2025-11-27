# SSL Certificates Directory

Ce dossier contient les certificats SSL/TLS pour HTTPS.

## Génération des certificats (Development)

Pour le développement local avec des certificats auto-signés:

```bash
# Linux/Mac
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=FR/ST=France/L=Paris/O=WhatsUp/CN=localhost"

# Windows PowerShell
# Installer OpenSSL d'abord: https://slproweb.com/products/Win32OpenSSL.html
```

## Production avec Let's Encrypt

Pour la production avec des certificats gratuits de Let's Encrypt:

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Générer le certificat
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Les certificats seront dans /etc/letsencrypt/live/yourdomain.com/
# Copier dans ce dossier:
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/

# Renouvellement automatique
sudo certbot renew --dry-run
```

## Configuration Nginx

Les certificats sont montés dans le conteneur frontend:

```yaml
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

Puis référencés dans `nginx.conf`:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
}
```

## Permissions

```bash
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem
```

## ⚠️ Sécurité

- **NE JAMAIS** committer les certificats dans Git
- Renouveler les certificats avant expiration
- Utiliser des certificats valides en production
- Protéger la clé privée (privkey.pem)
