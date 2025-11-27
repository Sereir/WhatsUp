#!/bin/bash

# Script de déploiement WhatsUp
# Usage: ./scripts/deploy.sh [environment]
# Environments: production, staging, development

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="whatsup"

echo "🚀 Déploiement de WhatsUp - Environnement: $ENVIRONMENT"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé, copie depuis .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  ATTENTION: Modifiez le fichier .env avec vos valeurs de production!${NC}"
    exit 1
fi

# Backup de la base de données (si production)
if [ "$ENVIRONMENT" == "production" ]; then
    echo "📦 Backup de la base de données..."
    BACKUP_DIR="./backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p $BACKUP_DIR
    
    docker-compose exec -T mongodb mongodump \
        --uri="mongodb://\${MONGO_ROOT_USERNAME}:\${MONGO_ROOT_PASSWORD}@localhost:27017/\${MONGO_DB_NAME}?authSource=admin" \
        --archive > "$BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Backup créé: $BACKUP_DIR/mongodb_backup_$TIMESTAMP.archive${NC}"
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down || true

# Nettoyer les images obsolètes
echo "🧹 Nettoyage des images Docker obsolètes..."
docker system prune -f --filter "label=project=$PROJECT_NAME" || true

# Pull des dernières images (si en production depuis registry)
if [ "$ENVIRONMENT" == "production" ]; then
    echo "📥 Pull des dernières images..."
    # docker-compose pull
fi

# Build des images
echo "🔨 Build des images Docker..."
docker-compose build --no-cache

# Démarrer les conteneurs
echo "🚀 Démarrage des conteneurs..."
docker-compose up -d

# Attendre que les services soient healthy
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs:"
docker-compose ps

# Vérifier la santé des services
echo "🏥 Vérification de la santé des services..."

# Backend health check
BACKEND_HEALTH=$(docker-compose exec -T backend wget -qO- http://localhost:3000/health 2>/dev/null || echo "unhealthy")
if [[ $BACKEND_HEALTH == *"healthy"* ]] || [[ $BACKEND_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend: OK${NC}"
else
    echo -e "${RED}❌ Backend: KO${NC}"
fi

# Frontend health check
FRONTEND_HEALTH=$(docker-compose exec -T frontend wget -qO- http://localhost/health 2>/dev/null || echo "unhealthy")
if [[ $FRONTEND_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Frontend: OK${NC}"
else
    echo -e "${RED}❌ Frontend: KO${NC}"
fi

# MongoDB health check
MONGO_HEALTH=$(docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null || echo "unhealthy")
if [[ $MONGO_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ MongoDB: OK${NC}"
else
    echo -e "${RED}❌ MongoDB: KO${NC}"
fi

echo ""
echo -e "${GREEN}✅ Déploiement terminé!${NC}"
echo ""
echo "📝 Informations:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:3000"
echo "   - Logs backend: docker-compose logs -f backend"
echo "   - Logs frontend: docker-compose logs -f frontend"
echo ""
echo "🛠️  Commandes utiles:"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
echo "   - Logs: docker-compose logs -f"
echo "   - Status: docker-compose ps"
