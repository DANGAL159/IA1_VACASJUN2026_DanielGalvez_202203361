# init.ps1
# Script para iniciar el backend y el frontend de Practica1 en ventanas separadas

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"

# Ruta del script de activacion del entorno virtual
$activateScript = Join-Path $backendDir ".mi_entorno\Scripts\Activate.ps1"

# Comandos a ejecutar
$backendCmd = "Set-Location '$backendDir'; & '$activateScript'; uvicorn main:app --reload"
$frontendCmd = "Set-Location '$frontendDir'; npm run dev"

Write-Host "Iniciando Backend..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "Ambos servicios se han iniciado en ventanas separadas de PowerShell." -ForegroundColor Yellow