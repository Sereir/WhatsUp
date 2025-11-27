# Health Check Script for Windows
# Usage: .\scripts\health-check.ps1

param(
    [string]$BackendUrl = "http://localhost:3000",
    [string]$FrontendUrl = "http://localhost",
    [int]$MaxRetries = 30,
    [int]$RetryDelay = 2
)

$ErrorActionPreference = "Continue"

Write-Host "🏥 Health Check WhatsUp" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

function Test-ServiceHealth {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    Write-Host "Checking $ServiceName..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "$Url/health" -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is healthy" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "⏳ Waiting for $ServiceName... (attempt $i/$MaxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds $RetryDelay
        }
    }
    
    Write-Host "❌ $ServiceName is not responding after $MaxRetries attempts" -ForegroundColor Red
    return $false
}

# Check backend
$backendHealthy = Test-ServiceHealth -Url $BackendUrl -ServiceName "Backend"

if (-not $backendHealthy) {
    Write-Host ""
    Write-Host "Backend logs:" -ForegroundColor Red
    docker-compose logs --tail=50 backend
    exit 1
}

Write-Host ""

# Check frontend
$frontendHealthy = Test-ServiceHealth -Url $FrontendUrl -ServiceName "Frontend"

if (-not $frontendHealthy) {
    Write-Host ""
    Write-Host "Frontend logs:" -ForegroundColor Red
    docker-compose logs --tail=50 frontend
    exit 1
}

Write-Host ""
Write-Host "✅ All services are healthy!" -ForegroundColor Green
exit 0
