# Script de restauration MongoDB pour Windows
# Usage: .\scripts\restore.ps1 -BackupFile <path_to_backup>

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Fichier de backup non trouvé: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  ATTENTION: Cette opération va remplacer les données actuelles!" -ForegroundColor Yellow
Write-Host "Fichier: $BackupFile" -ForegroundColor Yellow
$confirmation = Read-Host "Continuer? (y/N)"

if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Restauration annulée" -ForegroundColor Red
    exit 1
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

Write-Host "📦 Restauration MongoDB..." -ForegroundColor Cyan

# Restaurer
Get-Content $BackupFile -Raw | docker-compose exec -T mongodb mongorestore `
    --uri="mongodb://${MongoUser}:${MongoPassword}@localhost:27017/${MongoDb}?authSource=admin" `
    --archive `
    --drop

Write-Host "✅ Restauration terminée!" -ForegroundColor Green
