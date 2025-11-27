#!/bin/bash

# Script de backup MongoDB
# Usage: ./scripts/backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="whatsup-mongodb"

echo "📦 Backup MongoDB - $TIMESTAMP"

# Créer le dossier de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Charger les variables d'environnement
source .env

# Créer le backup
docker-compose exec -T mongodb mongodump \
    --uri="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@localhost:27017/${MONGO_DB_NAME}?authSource=admin" \
    --archive > "$BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive"

# Compression
gzip "$BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive"

echo "✅ Backup créé: $BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive.gz"

# Nettoyage des anciens backups (garder les 7 derniers)
cd $BACKUP_DIR
ls -t mongodb_backup_*.archive.gz | tail -n +8 | xargs -r rm
echo "🧹 Nettoyage des anciens backups terminé"
