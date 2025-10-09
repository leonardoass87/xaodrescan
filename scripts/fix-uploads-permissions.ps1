# Script PowerShell para corrigir permissões do diretório uploads
Write-Host "🔧 Corrigindo permissões do diretório uploads..." -ForegroundColor Yellow

# Criar diretório uploads se não existir
if (!(Test-Path "./uploads")) {
    New-Item -ItemType Directory -Path "./uploads" -Force
    Write-Host "📁 Criado diretório uploads" -ForegroundColor Green
}

if (!(Test-Path "./uploads/capas")) {
    New-Item -ItemType Directory -Path "./uploads/capas" -Force
    Write-Host "📁 Criado diretório uploads/capas" -ForegroundColor Green
}

if (!(Test-Path "./uploads/capitulos")) {
    New-Item -ItemType Directory -Path "./uploads/capitulos" -Force
    Write-Host "📁 Criado diretório uploads/capitulos" -ForegroundColor Green
}

if (!(Test-Path "./uploads/temp")) {
    New-Item -ItemType Directory -Path "./uploads/temp" -Force
    Write-Host "📁 Criado diretório uploads/temp" -ForegroundColor Green
}

# Ajustar permissões para permitir escrita do Docker
try {
    icacls "./uploads" /grant Everyone:F /T
    Write-Host "✅ Permissões do diretório uploads configuradas!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível ajustar permissões automaticamente" -ForegroundColor Yellow
    Write-Host "   Certifique-se de que o diretório uploads tem permissões de escrita" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Diretório: $(Get-Location)/uploads" -ForegroundColor Cyan
Write-Host "🔍 Conteúdo do diretório uploads:" -ForegroundColor Cyan
Get-ChildItem "./uploads" -Force | Format-Table Name, Mode, Length

Write-Host ""
Write-Host "🚀 Agora você pode fazer o build do Docker:" -ForegroundColor Green
Write-Host "   docker-compose build --no-cache" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor White