#!/bin/bash

# Script de restauration MongoDB
# Usage: ./scripts/restore.sh <backup_file>

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: ./scripts/restore.sh <backup_file>"
    echo "Exemple: ./scripts/restore.sh backups/mongodb_backup_20231127.archive"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Fichier de backup non trouvé: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATTENTION: Cette opération va remplacer les données actuelles!"
echo "Fichier: $BACKUP_FILE"
read -p "Continuer? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 1
fi

# Charger les variables d'environnement
source .env

echo "📦 Restauration MongoDB..."

# Décompresser si nécessaire
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Décompression du backup..."
    gunzip -k "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Restaurer
cat "$BACKUP_FILE" | docker-compose exec -T mongodb mongorestore \
    --uri="mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@localhost:27017/${MONGO_DB_NAME}?authSource=admin" \
    --archive \
    --drop

echo "✅ Restauration terminée!"
