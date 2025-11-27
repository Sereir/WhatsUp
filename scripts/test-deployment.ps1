# Script de test de déploiement pour Windows
# Usage: .\scripts\test-deployment.ps1

$ErrorActionPreference = "Continue"

Write-Host "🧪 Test de Déploiement WhatsUp" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$script:Errors = 0

function Test-Step {
    param(
        [string]$TestName,
        [scriptblock]$TestCommand
    )
    
    Write-Host -NoNewline "Testing $TestName... "
    
    try {
        $null = & $TestCommand 2>&1
        Write-Host "✅ PASS" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
        $script:Errors++
        return $false
    }
}

# 1. Vérifier les prérequis
Write-Host "📋 Vérification des prérequis:" -ForegroundColor Yellow
Test-Step "Docker installé" { docker --version }
Test-Step "Docker Compose installé" { docker-compose --version }
Test-Step "Git installé" { git --version }
Write-Host ""

# 2. Vérifier la structure des fichiers
Write-Host "📁 Vérification de la structure:" -ForegroundColor Yellow
Test-Step "Dockerfile backend existe" { if (-not (Test-Path "backend\Dockerfile")) { throw } }
Test-Step "Dockerfile frontend existe" { if (-not (Test-Path "frontend\Dockerfile")) { throw } }
Test-Step "docker-compose.yml existe" { if (-not (Test-Path "docker-compose.yml")) { throw } }
Test-Step "nginx.conf existe" { if (-not (Test-Path "frontend\nginx.conf")) { throw } }
Test-Step ".env.example existe" { if (-not (Test-Path ".env.example")) { throw } }
Test-Step "Script de déploiement existe" { if (-not (Test-Path "scripts\deploy.ps1")) { throw } }
Write-Host ""

# 3. Vérifier la configuration
Write-Host "⚙️  Vérification de la configuration:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env existe" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "JWT_SECRET=") {
        Write-Host "✅ JWT_SECRET configuré" -ForegroundColor Green
    } else {
        Write-Host "❌ JWT_SECRET manquant" -ForegroundColor Red
        $script:Errors++
    }
    
    if ($envContent -match "MONGO_ROOT_PASSWORD=") {
        Write-Host "✅ MONGO_ROOT_PASSWORD configuré" -ForegroundColor Green
    } else {
        Write-Host "❌ MONGO_ROOT_PASSWORD manquant" -ForegroundColor Red
        $script:Errors++
    }
    
    if ($envContent -match "CHANGE_ME_IN_PRODUCTION") {
        Write-Host "⚠️  WARNING: Certains secrets utilisent encore des valeurs par défaut" -ForegroundColor Yellow
        $script:Errors++
    } else {
        Write-Host "✅ Les secrets ont été changés" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env n'existe pas" -ForegroundColor Red
    Write-Host "💡 Créez-le avec: Copy-Item .env.example .env" -ForegroundColor Yellow
    $script:Errors++
}
Write-Host ""

# 4. Vérifier le build Docker
Write-Host "🐳 Test de build Docker:" -ForegroundColor Yellow
Write-Host "  Building backend..."
try {
    docker build -t whatsup-backend-test backend\ 2>&1 | Out-Null
    Write-Host "✅ Backend build OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend build FAIL" -ForegroundColor Red
    $script:Errors++
}

Write-Host "  Building frontend..."
try {
    docker build -t whatsup-frontend-test frontend\ 2>&1 | Out-Null
    Write-Host "✅ Frontend build OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend build FAIL" -ForegroundColor Red
    $script:Errors++
}
Write-Host ""

# 5. Test de démarrage
Write-Host "🚀 Test de démarrage des services:" -ForegroundColor Yellow
Write-Host "  Démarrage des conteneurs..."

docker-compose up -d 2>&1 | Out-Null

# Attendre 20 secondes
for ($i = 1; $i -le 20; $i++) {
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 1
}
Write-Host ""

# 6. Health checks
Write-Host ""
Write-Host "🏥 Health Checks:" -ForegroundColor Yellow

# Backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend: OK (HTTP $($backendResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend: FAIL (HTTP $($backendResponse.StatusCode))" -ForegroundColor Red
        $script:Errors++
    }
} catch {
    Write-Host "❌ Backend: FAIL (Erreur de connexion)" -ForegroundColor Red
    $script:Errors++
}

# Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: OK (HTTP $($frontendResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend: FAIL (HTTP $($frontendResponse.StatusCode))" -ForegroundColor Red
        $script:Errors++
    }
} catch {
    Write-Host "❌ Frontend: FAIL (Erreur de connexion)" -ForegroundColor Red
    $script:Errors++
}

# MongoDB
try {
    $mongoOutput = docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>&1
    if ($mongoOutput -match "ok") {
        Write-Host "✅ MongoDB: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB: FAIL" -ForegroundColor Red
        $script:Errors++
    }
} catch {
    Write-Host "❌ MongoDB: FAIL" -ForegroundColor Red
    $script:Errors++
}

Write-Host ""

# 7. Test de l'API
Write-Host "🔌 Test de l'API:" -ForegroundColor Yellow

try {
    $rootResponse = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
    if ($rootResponse.Content -match "WhatsUp") {
        Write-Host "✅ API root endpoint OK" -ForegroundColor Green
    } else {
        Write-Host "❌ API root endpoint FAIL" -ForegroundColor Red
        $script:Errors++
    }
} catch {
    Write-Host "❌ API root endpoint FAIL" -ForegroundColor Red
    $script:Errors++
}

Write-Host ""

# 8. Résumé
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "📊 Résumé des Tests" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

if ($script:Errors -eq 0) {
    Write-Host "✅ Tous les tests sont passés !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 L'application est prête pour le déploiement !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Accès:"
    Write-Host "  - Frontend: http://localhost"
    Write-Host "  - Backend: http://localhost:3000"
    Write-Host "  - API Health: http://localhost:3000/health"
    Write-Host ""
    Write-Host "Commandes utiles:"
    Write-Host "  - Logs: docker-compose logs -f"
    Write-Host "  - Arrêter: docker-compose down"
    Write-Host "  - Redémarrer: docker-compose restart"
    $exitCode = 0
} else {
    Write-Host "❌ $($script:Errors) test(s) ont échoué" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "  1. Vérifiez les logs: docker-compose logs"
    Write-Host "  2. Vérifiez la configuration: Get-Content .env"
    Write-Host "  3. Reconstruisez les images: docker-compose build --no-cache"
    Write-Host "  4. Consultez la documentation: README.deployment.md"
    $exitCode = 1
}

Write-Host ""
Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
docker rmi whatsup-backend-test whatsup-frontend-test 2>&1 | Out-Null

exit $exitCode
