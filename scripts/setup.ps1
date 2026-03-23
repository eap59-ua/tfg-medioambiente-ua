# ==============================================================================
# EcoAlerta — Script de configuración inicial (Windows PowerShell)
# ==============================================================================
# Uso: .\scripts\setup.ps1
# Requisitos: Docker Desktop, Git, Node.js 20+
# ==============================================================================

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  EcoAlerta — Setup Inicial" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar requisitos
$errors = @()

# Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    $errors += "Git no encontrado. Instalar desde https://git-scm.com/"
} else {
    $gitVersion = git --version
    Write-Host "[OK] $gitVersion" -ForegroundColor Green
}

# Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    $errors += "Node.js no encontrado. Instalar desde https://nodejs.org/ (v20 LTS)"
} else {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
}

# Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    $errors += "Docker no encontrado. Instalar Docker Desktop desde https://docker.com/"
} else {
    $dockerVersion = docker --version
    Write-Host "[OK] $dockerVersion" -ForegroundColor Green
}

# Docker Compose
try {
    $composeVersion = docker compose version 2>&1
    Write-Host "[OK] $composeVersion" -ForegroundColor Green
} catch {
    $errors += "Docker Compose no encontrado."
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "ERRORES encontrados:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Instala los requisitos faltantes y vuelve a ejecutar este script." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Todos los requisitos cumplidos." -ForegroundColor Green
Write-Host ""

# Crear archivos .env si no existen
$envFiles = @(
    @{ Source = ".env.example"; Target = ".env" },
    @{ Source = "src\backend\.env.example"; Target = "src\backend\.env" },
    @{ Source = "src\frontend\.env.example"; Target = "src\frontend\.env" }
)

foreach ($envFile in $envFiles) {
    if (!(Test-Path $envFile.Target)) {
        Copy-Item $envFile.Source $envFile.Target
        Write-Host "[CREADO] $($envFile.Target)" -ForegroundColor Yellow
    } else {
        Write-Host "[EXISTE] $($envFile.Target)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Setup completado." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso: ejecuta uno de estos comandos:" -ForegroundColor White
Write-Host ""
Write-Host "  Con Docker (recomendado):" -ForegroundColor Yellow
Write-Host "    docker compose -f docker-compose.dev.yml up --build" -ForegroundColor White
Write-Host ""
Write-Host "  Sin Docker:" -ForegroundColor Yellow
Write-Host "    cd src\backend && npm install && npm run dev" -ForegroundColor White
Write-Host "    cd src\frontend && npm install && npm start" -ForegroundColor White
Write-Host ""
