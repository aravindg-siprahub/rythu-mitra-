# ─────────────────────────────────────────────────────────────────
#  Rythu Mitra — Windows PowerShell Startup Script
#  Starts: Redis → Celery Worker → Django
#  Usage: cd backend; .\run_server.ps1
# ─────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# ── Navigate to backend directory ─────────────────────────────────
$backendDir = $PSScriptRoot
Set-Location $backendDir

# ── Activate Virtual Environment ──────────────────────────────────
$venvPaths = @("venv\Scripts\Activate.ps1", ".venv\Scripts\Activate.ps1")
$activated = $false

foreach ($venvPath in $venvPaths) {
    if (Test-Path $venvPath) {
        Write-Host "🔧 Activating virtual environment from $venvPath..." -ForegroundColor Cyan
        . $venvPath
        $activated = $true
        break
    }
}

if (-not $activated) {
    Write-Host "⚠️  No virtual environment found (venv or .venv). Using system Python." -ForegroundColor Yellow
}

# ── Kill anything already on port 8000 ────────────────────────────
Write-Host ""
Write-Host "🔍 Checking port 8000..." -ForegroundColor Cyan
$tcp = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($tcp) {
    $pid8000 = $tcp.OwningProcess
    Write-Host "⚠️  Port 8000 in use by PID $pid8000. Killing..." -ForegroundColor Yellow
    Stop-Process -Id $pid8000 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "✅ Port 8000 freed." -ForegroundColor Green
} else {
    Write-Host "✅ Port 8000 is free." -ForegroundColor Green
}

# ── 1. Start Redis in a new terminal window ────────────────────────
Write-Host ""
Write-Host "🔴 Starting Redis server..." -ForegroundColor Red
$redisProcess = Start-Process -FilePath "redis-server" `
    -ArgumentList "--port 6379" `
    -PassThru `
    -WindowStyle Normal

if ($redisProcess) {
    Write-Host "✅ Redis started (PID: $($redisProcess.Id)) on port 6379" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Redis. Is redis-server installed and in PATH?" -ForegroundColor Red
    Write-Host "   Install: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    exit 1
}

# Give Redis time to fully start
Start-Sleep -Seconds 2

# ── 2. Start Celery Worker in a new terminal window ────────────────
Write-Host ""
Write-Host "🌿 Starting Celery worker..." -ForegroundColor Green

# Get the python executable path from the venv
$pythonExe = if (Test-Path "venv\Scripts\python.exe") {
    "venv\Scripts\python.exe"
} elseif (Test-Path ".venv\Scripts\python.exe") {
    ".venv\Scripts\python.exe"
} else {
    "python"
}

$celeryProcess = Start-Process -FilePath $pythonExe `
    -ArgumentList "-m celery -A rythu_mitra worker --loglevel=info --pool=solo" `
    -PassThru `
    -WindowStyle Normal

if ($celeryProcess) {
    Write-Host "✅ Celery worker started (PID: $($celeryProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Celery." -ForegroundColor Red
    exit 1
}

# Give Celery time to connect to Redis
Start-Sleep -Seconds 3

# ── 3. Start Django in THIS terminal (foreground) ──────────────────
Write-Host ""
Write-Host "🚀 Starting Django on http://localhost:8000 ..." -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "   Redis PID  : $($redisProcess.Id)" -ForegroundColor DarkGray
Write-Host "   Celery PID : $($celeryProcess.Id)" -ForegroundColor DarkGray
Write-Host "   Press Ctrl+C to stop Django (Redis/Celery stay open)" -ForegroundColor DarkGray
Write-Host "───────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

& $pythonExe manage.py runserver 0.0.0.0:8000
