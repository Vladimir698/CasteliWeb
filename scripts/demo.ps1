param([int]$Port = 3000)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host ""
Write-Host "CASTELI - Modo demostracion" -ForegroundColor Red
Write-Host "===================================="

if (-not (Test-Path ".env")) {
  Write-Host "ERROR: No existe .env. Casteli necesita su configuracion local." -ForegroundColor Red
  exit 1
}

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
  Write-Host "cloudflared no esta instalado." -ForegroundColor Yellow
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Instalando Cloudflare Tunnel..."
    winget install -e --id Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements
    Write-Host "Si Windows acaba de instalar cloudflared y no lo reconoce aun, cierre esta terminal, abra PowerShell de nuevo y ejecute npm run demo." -ForegroundColor Yellow
  } else {
    Write-Host "Instale cloudflared desde la pagina oficial de Cloudflare y vuelva a ejecutar npm run demo." -ForegroundColor Red
  }
  exit 1
}

Write-Host "1/3 Verificando PostgreSQL y Casteli..."
$env:PORT = "$Port"
$app = Start-Process -FilePath "node" -ArgumentList "server/app.js" -WorkingDirectory $root -PassThru -WindowStyle Normal

$ready=$false
for($i=0;$i -lt 20;$i++){
  Start-Sleep -Milliseconds 750
  try {
    $health=Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 2
    if($health.status -eq "ok"){$ready=$true;break}
  } catch {}
  if($app.HasExited){break}
}

if(-not $ready){
  Write-Host "No se pudo iniciar Casteli o conectar PostgreSQL. Revise la ventana del servidor." -ForegroundColor Red
  if(-not $app.HasExited){Stop-Process -Id $app.Id -Force}
  exit 1
}

Write-Host "2/3 Casteli funciona correctamente en http://localhost:$Port" -ForegroundColor Green
Write-Host "3/3 Creando enlace HTTPS temporal de demostracion..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: mantenga esta ventana y la ventana de Casteli abiertas." -ForegroundColor Yellow
Write-Host "Cloudflare mostrara abajo una URL https://....trycloudflare.com" -ForegroundColor Cyan
Write-Host "Comparta UNICAMENTE esa URL durante la demostracion." -ForegroundColor Cyan
Write-Host "Presione Ctrl+C cuando termine." -ForegroundColor Yellow
Write-Host ""

try {
  cloudflared tunnel --url "http://127.0.0.1:$Port"
} finally {
  if(-not $app.HasExited){Stop-Process -Id $app.Id -Force}
}
