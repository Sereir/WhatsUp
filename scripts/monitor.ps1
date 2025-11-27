# Script de monitoring pour Windows
# Usage: .\scripts\monitor.ps1

$ErrorActionPreference = "Continue"

Write-Host "📊 Monitoring WhatsUp" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# Statut des conteneurs
Write-Host "📦 Statut des conteneurs:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""

# Ressources utilisées
Write-Host "💻 Ressources utilisées:" -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
Write-Host ""

# Espace disque Docker
Write-Host "💾 Espace disque Docker:" -ForegroundColor Yellow
docker system df
Write-Host ""

# Health checks
Write-Host "🏥 Health Checks:" -ForegroundColor Yellow

# Backend
try {
    $BackendResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($BackendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend: KO (Status: $($BackendResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend: KO (Erreur de connexion)" -ForegroundColor Red
}

# Frontend
try {
    $FrontendResponse = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 5
    if ($FrontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend: KO (Status: $($FrontendResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend: KO (Erreur de connexion)" -ForegroundColor Red
}

# MongoDB
try {
    $MongoOutput = docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>&1
    if ($MongoOutput -match "ok") {
        Write-Host "✅ MongoDB: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB: KO" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ MongoDB: KO" -ForegroundColor Red
}

Write-Host ""

# Logs récents (erreurs)
Write-Host "🔍 Erreurs récentes (dernières 10 lignes):" -ForegroundColor Yellow
$Logs = docker-compose logs --tail=10 2>&1 | Select-String -Pattern "error" -CaseSensitive:$false
if ($Logs) {
    $Logs
} else {
    Write-Host "Aucune erreur récente" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Monitoring terminé" -ForegroundColor Green
