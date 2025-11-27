# Script de test de déploiement
# Usage: ./scripts/test-deployment.sh

#!/bin/bash

set -e

echo "🧪 Test de Déploiement WhatsUp"
echo "=============================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Function pour tester
test_step() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# 1. Vérifier les prérequis
echo "📋 Vérification des prérequis:"
test_step "Docker installé" "docker --version"
test_step "Docker Compose installé" "docker-compose --version"
test_step "Git installé" "git --version"
echo ""

# 2. Vérifier la structure des fichiers
echo "📁 Vérification de la structure:"
test_step "Dockerfile backend existe" "test -f backend/Dockerfile"
test_step "Dockerfile frontend existe" "test -f frontend/Dockerfile"
test_step "docker-compose.yml existe" "test -f docker-compose.yml"
test_step "nginx.conf existe" "test -f frontend/nginx.conf"
test_step ".env.example existe" "test -f .env.example"
test_step "Script de déploiement existe" "test -f scripts/deploy.sh"
echo ""

# 3. Vérifier la configuration
echo "⚙️  Vérification de la configuration:"
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env existe${NC}"
    
    # Vérifier les variables critiques
    test_step "JWT_SECRET configuré" "grep -q 'JWT_SECRET=' .env"
    test_step "MONGO_ROOT_PASSWORD configuré" "grep -q 'MONGO_ROOT_PASSWORD=' .env"
    
    # Vérifier que les secrets ne sont pas les valeurs par défaut
    if grep -q "CHANGE_ME_IN_PRODUCTION" .env; then
        echo -e "${YELLOW}⚠️  WARNING: Certains secrets utilisent encore des valeurs par défaut${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ Les secrets ont été changés${NC}"
    fi
else
    echo -e "${RED}❌ .env n'existe pas${NC}"
    echo -e "${YELLOW}💡 Créez-le avec: cp .env.example .env${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Vérifier le build Docker
echo "🐳 Test de build Docker:"
echo "  Building backend..."
if docker build -t whatsup-backend-test backend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend build OK${NC}"
else
    echo -e "${RED}❌ Backend build FAIL${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo "  Building frontend..."
if docker build -t whatsup-frontend-test frontend/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend build OK${NC}"
else
    echo -e "${RED}❌ Frontend build FAIL${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Test de démarrage
echo "🚀 Test de démarrage des services:"
echo "  Démarrage des conteneurs..."

docker-compose up -d > /dev/null 2>&1

# Attendre 20 secondes
for i in {1..20}; do
    echo -n "."
    sleep 1
done
echo ""

# 6. Health checks
echo ""
echo "🏥 Health Checks:"

# Backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Backend: OK (HTTP $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Backend: FAIL (HTTP $BACKEND_STATUS)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Frontend: OK (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Frontend: FAIL (HTTP $FRONTEND_STATUS)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# MongoDB
MONGO_OUTPUT=$(docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null || echo "error")
if [[ $MONGO_OUTPUT == *"ok"* ]]; then
    echo -e "${GREEN}✅ MongoDB: OK${NC}"
else
    echo -e "${RED}❌ MongoDB: FAIL${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 7. Test de l'API
echo "🔌 Test de l'API:"

# Test endpoint root
ROOT_RESPONSE=$(curl -s http://localhost:3000/ 2>/dev/null)
if [[ $ROOT_RESPONSE == *"WhatsUp"* ]]; then
    echo -e "${GREEN}✅ API root endpoint OK${NC}"
else
    echo -e "${RED}❌ API root endpoint FAIL${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 8. Résumé
echo "==============================="
echo "📊 Résumé des Tests"
echo "==============================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
    echo ""
    echo "🎉 L'application est prête pour le déploiement !"
    echo ""
    echo "Accès:"
    echo "  - Frontend: http://localhost"
    echo "  - Backend: http://localhost:3000"
    echo "  - API Health: http://localhost:3000/health"
    echo ""
    echo "Commandes utiles:"
    echo "  - Logs: docker-compose logs -f"
    echo "  - Arrêter: docker-compose down"
    echo "  - Redémarrer: docker-compose restart"
    EXIT_CODE=0
else
    echo -e "${RED}❌ $ERRORS test(s) ont échoué${NC}"
    echo ""
    echo "📋 Actions recommandées:"
    echo "  1. Vérifiez les logs: docker-compose logs"
    echo "  2. Vérifiez la configuration: cat .env"
    echo "  3. Reconstruisez les images: docker-compose build --no-cache"
    echo "  4. Consultez la documentation: README.deployment.md"
    EXIT_CODE=1
fi

echo ""
echo "🧹 Nettoyage..."
docker-compose down > /dev/null 2>&1
docker rmi whatsup-backend-test whatsup-frontend-test > /dev/null 2>&1 || true

exit $EXIT_CODE
