# 📋 Checklist de Déploiement

Utilisez cette checklist avant chaque déploiement en production.

## ☑️ Avant le déploiement

### Configuration

- [ ] Toutes les variables d'environnement sont configurées dans `.env`
- [ ] Les secrets ont été changés (JWT_SECRET, MONGO_PASSWORD, etc.)
- [ ] CORS_ORIGIN pointe vers le bon domaine
- [ ] NODE_ENV est défini sur "production"
- [ ] Les URLs backend/frontend sont correctes
- [ ] Sentry DSN est configuré (si utilisé)

### Sécurité

- [ ] Tous les secrets par défaut ont été remplacés
- [ ] JWT_SECRET a au moins 64 caractères aléatoires
- [ ] Le mot de passe MongoDB est fort
- [ ] Rate limiting est activé
- [ ] HTTPS/SSL est configuré
- [ ] Firewall est configuré sur le serveur
- [ ] Fail2ban est installé (optionnel)

### Tests

- [ ] Tous les tests backend passent (`npm test`)
- [ ] Tous les tests frontend passent (`npm test`)
- [ ] Les linters ne retournent pas d'erreurs
- [ ] L'application fonctionne en local
- [ ] Les migrations de base de données sont prêtes (si applicable)

### Infrastructure

- [ ] Serveur avec ressources suffisantes (2 CPU / 4GB RAM min)
- [ ] Docker et Docker Compose installés
- [ ] Domaine configuré avec DNS pointant vers le serveur
- [ ] Certificats SSL générés (Let's Encrypt)
- [ ] Backup de l'ancienne version (si applicable)

### Documentation

- [ ] README.md est à jour
- [ ] CHANGELOG.md est mis à jour
- [ ] Variables d'environnement documentées
- [ ] Notes de release préparées

## ☑️ Pendant le déploiement

### Build

- [ ] Images Docker buildées sans erreurs
- [ ] `docker-compose build --no-cache` réussi
- [ ] Taille des images raisonnable

### Démarrage

- [ ] Conteneurs démarrés avec `docker-compose up -d`
- [ ] Tous les services sont "healthy"
- [ ] Logs ne montrent pas d'erreurs critiques
- [ ] Health checks passent (backend et frontend)

### Base de données

- [ ] MongoDB démarre correctement
- [ ] Connexion backend → MongoDB OK
- [ ] Données migrées (si applicable)
- [ ] Indexes créés

### Réseau

- [ ] Frontend accessible via le domaine
- [ ] Backend API répond
- [ ] WebSocket connecté
- [ ] HTTPS fonctionne correctement
- [ ] Redirection HTTP → HTTPS active

## ☑️ Après le déploiement

### Tests fonctionnels

- [ ] Page de connexion s'affiche
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Envoi de message fonctionne
- [ ] Upload de fichiers fonctionne
- [ ] Notifications temps réel OK
- [ ] Création de groupe fonctionne

### Performance

- [ ] Temps de réponse API < 500ms
- [ ] Page charge en < 3s
- [ ] WebSocket latence < 100ms
- [ ] Pas de memory leaks visibles
- [ ] CPU/RAM dans les limites acceptables

### Monitoring

- [ ] Logs centralisés configurés
- [ ] Sentry reçoit les erreurs (si configuré)
- [ ] Monitoring serveur actif
- [ ] Alertes configurées
- [ ] Backup automatique configuré

### Documentation

- [ ] Notes de déploiement documentées
- [ ] Équipe notifiée du déploiement
- [ ] CHANGELOG mis à jour
- [ ] Documentation utilisateur à jour

## ☑️ Rollback (si nécessaire)

### Préparation

- [ ] Procédure de rollback documentée
- [ ] Backup récent disponible
- [ ] Accès au serveur confirmé

### Exécution

- [ ] Arrêter les nouveaux conteneurs
- [ ] Restaurer l'ancienne version
- [ ] Restaurer le backup de la base de données
- [ ] Vérifier que l'ancienne version fonctionne
- [ ] Notifier l'équipe

### Post-rollback

- [ ] Investiguer la cause du problème
- [ ] Fixer les bugs
- [ ] Re-tester en staging
- [ ] Planifier un nouveau déploiement

## 📊 Métriques de succès

- ✅ Temps de déploiement: < 10 minutes
- ✅ Downtime: < 1 minute
- ✅ Erreurs après déploiement: 0
- ✅ Rollback rate: < 5%
- ✅ Temps de détection d'erreur: < 5 minutes
- ✅ Temps de résolution d'incident: < 30 minutes

## 📞 Contacts d'urgence

En cas de problème:

- **DevOps Lead**: devops@whatsup.com
- **Backend Lead**: backend@whatsup.com
- **Frontend Lead**: frontend@whatsup.com
- **On-call**: +33 X XX XX XX XX

## 🔗 Ressources

- [Guide de déploiement](README.deployment.md)
- [Gestion des secrets](docs/SECRETS.md)
- [Commandes rapides](docs/QUICK_COMMANDS.md)
- [Monitoring Dashboard](https://monitoring.whatsup.com)
- [Sentry](https://sentry.io/whatsup)

---

**Date**: _______________
**Déployé par**: _______________
**Version**: _______________
**Résultat**: ⬜ Succès ⬜ Rollback
