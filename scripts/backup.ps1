# Script de backup MongoDB pour Windows
# Usage: .\scripts\backup.ps1

$ErrorActionPreference = "Stop"

$BackupDir = ".\backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ContainerName = "whatsup-mongodb"

Write-Host "📦 Backup MongoDB - $Timestamp" -ForegroundColor Cyan

# Créer le dossier de backup s'il n'existe pas
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Charger les variables d'environnement
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

$MongoUser = $env:MONGO_ROOT_USERNAME
$MongoPassword = $env:MONGO_ROOT_PASSWORD
$MongoDb = $env:MONGO_DB_NAME

# Créer le backup
Write-Host "Création du backup..." -ForegroundColor Yellow
docker-compose exec -T mongodb mongodump `
    --uri="mongodb://${MongoUser}:${MongoPassword}@localhost:27017/${MongoDb}?authSource=admin" `
    --archive > "$BackupDir\mongodb_backup_$Timestamp.archive"

Write-Host "✅ Backup créé: $BackupDir\mongodb_backup_$Timestamp.archive" -ForegroundColor Green

# Nettoyage des anciens backups (garder les 7 derniers)
Write-Host "🧹 Nettoyage des anciens backups..." -ForegroundColor Yellow
Get-ChildItem -Path $BackupDir -Filter "mongodb_backup_*.archive" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -Skip 7 | 
    Remove-Item -Force

Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
