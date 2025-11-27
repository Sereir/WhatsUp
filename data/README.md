# Data Directory

Ce dossier contient les données persistantes de l'application en production.

## Structure

```
data/
├── mongodb/       # Données MongoDB
├── uploads/       # Fichiers uploadés (images, vidéos, etc.)
├── logs/          # Logs de l'application
└── README.md      # Ce fichier
```

## Permissions

Assurez-vous que Docker a les permissions nécessaires pour écrire dans ces dossiers:

```bash
# Linux/Mac
chmod -R 777 data/

# Ou plus restrictif
chown -R 1001:1001 data/
chmod -R 755 data/
```

## Backups

Les données MongoDB doivent être sauvegardées régulièrement:

```bash
./scripts/backup.sh
```

## Restauration

En cas de perte de données:

```bash
./scripts/restore.sh backups/mongodb_backup_YYYYMMDD.archive
```

## Monitoring

Vérifiez régulièrement l'espace disque:

```bash
du -sh data/*
df -h
```

## ⚠️ Important

- **NE PAS** committer ce dossier dans Git (déjà dans .gitignore)
- **Sauvegarder** régulièrement les données
- **Monitorer** l'espace disque disponible
- **Protéger** les permissions des fichiers
