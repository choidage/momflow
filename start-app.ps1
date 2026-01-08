# Always Plan - Server Start Script
# Usage: Right-click -> Run with PowerShell

$ErrorActionPreference = "SilentlyContinue"

# 프로젝트 경로 설정
$ProjectRoot = "C:\Users\USER\OneDrive\Desktop\AI18_FINAL"
$BackendPath = "$ProjectRoot\backend"
$FrontendPath = "$ProjectRoot\frontend"
$PythonExe = "$BackendPath\venv\Scripts\python.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Always Plan - Server Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 기존 프로세스 종료
Write-Host "[1/4] Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "      Done!" -ForegroundColor Green

# 백엔드 서버 시작
Write-Host "[2/4] Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath $PythonExe `
    -ArgumentList "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" `
    -WorkingDirectory $BackendPath `
    -PassThru `
    -WindowStyle Normal
Write-Host "      Backend PID: $($backendProcess.Id)" -ForegroundColor Green

Start-Sleep -Seconds 3

# 프론트엔드 서버 시작
Write-Host "[3/4] Starting Frontend Server (Port 5173)..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory $FrontendPath `
    -PassThru `
    -WindowStyle Normal
Write-Host "      Frontend PID: $($frontendProcess.Id)" -ForegroundColor Green

Start-Sleep -Seconds 3

# 서버 상태 확인
Write-Host "[4/4] Checking server status..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$backendOk = $false
$frontendOk = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { $backendOk = $true }
} catch {}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) { $frontendOk = $true }
} catch {}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($backendOk) {
    Write-Host "  Backend  (8000): Running" -ForegroundColor Green
} else {
    Write-Host "  Backend  (8000): Starting..." -ForegroundColor Yellow
}

if ($frontendOk) {
    Write-Host "  Frontend (5173): Running" -ForegroundColor Green
} else {
    Write-Host "  Frontend (5173): Starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Open: http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 브라우저 열기
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press any key to exit (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
