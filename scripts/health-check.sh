# Health Check Script
# Usage: ./scripts/health-check.sh

#!/bin/bash

set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
MAX_RETRIES=30
RETRY_DELAY=2

echo "🏥 Health Check WhatsUp"
echo "======================="
echo ""

# Function to check health
check_health() {
    local url=$1
    local service=$2
    local retries=0
    
    echo "Checking $service..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -sf "$url/health" > /dev/null 2>&1; then
            echo "✅ $service is healthy"
            return 0
        fi
        
        retries=$((retries + 1))
        echo "⏳ Waiting for $service... (attempt $retries/$MAX_RETRIES)"
        sleep $RETRY_DELAY
    done
    
    echo "❌ $service is not responding after $MAX_RETRIES attempts"
    return 1
}

# Check backend
if ! check_health "$BACKEND_URL" "Backend"; then
    echo ""
    echo "Backend logs:"
    docker-compose logs --tail=50 backend
    exit 1
fi

echo ""

# Check frontend
if ! check_health "$FRONTEND_URL" "Frontend"; then
    echo ""
    echo "Frontend logs:"
    docker-compose logs --tail=50 frontend
    exit 1
fi

echo ""
echo "✅ All services are healthy!"
exit 0
