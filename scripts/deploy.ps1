# Script de déploiement WhatsUp pour Windows PowerShell
# Usage: .\scripts\deploy.ps1 [-Environment production|staging|development]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('production', 'staging', 'development')]
    [string]$Environment = 'production'
)

$ErrorActionPreference = "Stop"
$ProjectName = "whatsup"

Write-Host "🚀 Déploiement de WhatsUp - Environnement: $Environment" -ForegroundColor Cyan

# Vérifier que Docker est installé
try {
    docker --version | Out-Null
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Docker ou Docker Compose n'est pas installé" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Fichier .env non trouvé, copie depuis .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  ATTENTION: Modifiez le fichier .env avec vos valeurs de production!" -ForegroundColor Yellow
    exit 1
}

# Backup de la base de données (si production)
if ($Environment -eq "production") {
    Write-Host "📦 Backup de la base de données..." -ForegroundColor Cyan
    $BackupDir = ".\backups"
    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    
    try {
        $env:COMPOSE_CONVERT_WINDOWS_PATHS = 1
        docker-compose exec -T mongodb mongodump `
            --uri="mongodb://${env:MONGO_ROOT_USERNAME}:${env:MONGO_ROOT_PASSWORD}@localhost:27017/${env:MONGO_DB_NAME}?authSource=admin" `
            --archive > "$BackupDir\mongodb_backup_$Timestamp.archive"
        Write-Host "✅ Backup créé: $BackupDir\mongodb_backup_$Timestamp.archive" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Backup non créé (première installation?)" -ForegroundColor Yellow
    }
}

# Arrêter les conteneurs existants
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Cyan
docker-compose down 2>&1 | Out-Null

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images Docker obsolètes..." -ForegroundColor Cyan
docker system prune -f --filter "label=project=$ProjectName" 2>&1 | Out-Null

# Build des images
Write-Host "🔨 Build des images Docker..." -ForegroundColor Cyan
docker-compose build --no-cache

# Démarrer les conteneurs
Write-Host "🚀 Démarrage des conteneurs..." -ForegroundColor Cyan
docker-compose up -d

# Attendre que les services soient healthy
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Vérifier le statut des conteneurs
Write-Host "📊 Statut des conteneurs:" -ForegroundColor Cyan
docker-compose ps

# Vérifier la santé des services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Cyan

# Backend health check
try {
    $BackendHealth = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($BackendHealth.StatusCode -eq 200) {
        Write-Host "✅ Backend: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend: KO" -ForegroundColor Red
}

# Frontend health check
try {
    $FrontendHealth = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 5
    if ($FrontendHealth.StatusCode -eq 200) {
        Write-Host "✅ Frontend: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: KO" -ForegroundColor Red
}

# MongoDB health check
try {
    $MongoHealth = docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>&1
    if ($MongoHealth -match "ok") {
        Write-Host "✅ MongoDB: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ MongoDB: KO" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Informations:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost"
Write-Host "   - Backend API: http://localhost:3000"
Write-Host "   - Logs backend: docker-compose logs -f backend"
Write-Host "   - Logs frontend: docker-compose logs -f frontend"
Write-Host ""
Write-Host "🛠️  Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Arrêter: docker-compose down"
Write-Host "   - Redémarrer: docker-compose restart"
Write-Host "   - Logs: docker-compose logs -f"
Write-Host "   - Status: docker-compose ps"
