# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Non publié]

### Ajouté
- Configuration Docker complète (Dockerfile backend/frontend)
- Docker Compose pour développement et production
- Pipeline CI/CD avec GitHub Actions
- Scripts de déploiement (deploy.sh, deploy.ps1)
- Scripts de backup/restore MongoDB
- Scripts de monitoring
- Configuration Nginx avec reverse proxy
- Health checks pour tous les services
- Documentation de déploiement complète
- Guide de gestion des secrets
- Support HTTPS/SSL
- Rate limiting
- Upload de fichiers avec Multer
- Logging avec Winston
- Monitoring avec Sentry (optionnel)

### Architecture
- Backend: Node.js + Express + MongoDB
- Frontend: Vue.js 3 + Pinia + Tailwind CSS
- WebSocket: Socket.io pour temps réel
- Tests: Jest (backend) + Vitest (frontend)
- Couverture: Backend 52.88%, Frontend 21.61%

### Fonctionnalités
- ✅ Authentification JWT
- ✅ Messagerie temps réel
- ✅ Conversations privées et groupes
- ✅ Partage multimédia (images, vidéos, fichiers)
- ✅ Réactions aux messages
- ✅ Édition/suppression de messages
- ✅ Gestion des contacts
- ✅ Notifications push
- ✅ Multi-sessions
- ✅ Statut en ligne/hors ligne
- ✅ Alertes de sécurité

## [1.0.0] - 2025-01-XX

### Version initiale
- Première release avec toutes les fonctionnalités de base
- Infrastructure de déploiement complète
- Documentation exhaustive

---

## Format des versions

- **MAJEUR** : Changements incompatibles avec les versions précédentes
- **MINEUR** : Ajout de fonctionnalités rétro-compatibles
- **CORRECTIF** : Corrections de bugs rétro-compatibles

## Catégories de changements

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans les fonctionnalités existantes
- **Obsolète** : Fonctionnalités bientôt supprimées
- **Supprimé** : Fonctionnalités supprimées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Correctifs de sécurité
