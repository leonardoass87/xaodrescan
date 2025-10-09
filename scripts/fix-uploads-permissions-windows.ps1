# Script PowerShell para corrigir permissões do diretório uploads no Windows
Write-Host "🔧 Corrigindo permissões do diretório uploads..." -ForegroundColor Yellow

# Criar diretório uploads se não existir
$uploadsPath = ".\uploads"
if (!(Test-Path $uploadsPath)) {
    New-Item -ItemType Directory -Path $uploadsPath -Force
    Write-Host "📁 Criado diretório uploads" -ForegroundColor Green
}

# Criar subdiretórios
$subdirs = @("capas", "capitulos", "temp")
foreach ($subdir in $subdirs) {
    $subdirPath = Join-Path $uploadsPath $subdir
    if (!(Test-Path $subdirPath)) {
        New-Item -ItemType Directory -Path $subdirPath -Force
        Write-Host "📁 Criado diretório $subdir" -ForegroundColor Green
    }
}

# Ajustar permissões usando icacls
try {
    Write-Host "🔐 Ajustando permissões com icacls..." -ForegroundColor Yellow
    
    # Dar permissões completas para todos os usuários
    icacls $uploadsPath /grant Everyone:F /T
    Write-Host "✅ Permissões configuradas com icacls" -ForegroundColor Green
    
    # Verificar permissões
    Write-Host "🔍 Verificando permissões:" -ForegroundColor Cyan
    icacls $uploadsPath
    
} catch {
    Write-Host "⚠️ Erro ao configurar permissões com icacls: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Tente executar como administrador" -ForegroundColor Yellow
}

# Verificar se conseguimos escrever no diretório
Write-Host "🧪 Testando escrita no diretório uploads..." -ForegroundColor Yellow
$testFile = Join-Path $uploadsPath "test-write.txt"
try {
    "test" | Out-File -FilePath $testFile -Encoding UTF8
    if (Test-Path $testFile) {
        Write-Host "✅ Teste de escrita bem-sucedido!" -ForegroundColor Green
        Remove-Item $testFile -Force
    } else {
        Write-Host "❌ Falha no teste de escrita!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro no teste de escrita: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📁 Diretório: $(Resolve-Path $uploadsPath)" -ForegroundColor Cyan
Write-Host "🔍 Conteúdo do diretório uploads:" -ForegroundColor Cyan
Get-ChildItem $uploadsPath -Force | Format-Table Name, Mode, Length

Write-Host ""
Write-Host "🚀 Agora você pode fazer o build do Docker:" -ForegroundColor Green
Write-Host "   docker-compose down" -ForegroundColor White
Write-Host "   docker-compose build --no-cache" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor White