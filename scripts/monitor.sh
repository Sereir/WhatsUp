#!/bin/bash

# Script de monitoring
# Usage: ./scripts/monitor.sh

set -e

echo "📊 Monitoring WhatsUp"
echo "===================="
echo ""

# Statut des conteneurs
echo "📦 Statut des conteneurs:"
docker-compose ps
echo ""

# Ressources utilisées
echo "💻 Ressources utilisées:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

# Espace disque Docker
echo "💾 Espace disque Docker:"
docker system df
echo ""

# Health checks
echo "🏥 Health Checks:"

# Backend
BACKEND_URL="http://localhost:3000/health"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" == "200" ]; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: KO (Status: $BACKEND_STATUS)"
fi

# Frontend
FRONTEND_URL="http://localhost/health"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: KO (Status: $FRONTEND_STATUS)"
fi

# MongoDB
MONGO_STATUS=$(docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null || echo "error")
if [[ $MONGO_STATUS == *"ok"* ]]; then
    echo "✅ MongoDB: OK"
else
    echo "❌ MongoDB: KO"
fi

echo ""

# Logs récents (erreurs)
echo "🔍 Erreurs récentes (dernières 10 lignes):"
docker-compose logs --tail=10 2>&1 | grep -i "error" || echo "Aucune erreur récente"
echo ""

# Connexions actives
echo "👥 Connexions Socket.IO actives:"
docker-compose exec -T backend node -e "
const io = require('socket.io-client');
console.log('Info: Vérifier dans les logs backend');
" 2>/dev/null || echo "Non disponible"

echo ""
echo "✅ Monitoring terminé"
