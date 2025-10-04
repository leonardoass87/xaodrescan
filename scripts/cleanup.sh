#!/bin/bash

# Script para limpeza de arquivos desnecessários antes do deploy

echo "🧹 Limpando arquivos desnecessários..."

# Remover node_modules se existir
if [ -d "node_modules" ]; then
    echo "Removendo node_modules..."
    rm -rf node_modules
fi

# Remover arquivos de build antigos
if [ -d ".next" ]; then
    echo "Removendo build antigo..."
    rm -rf .next
fi

# Remover logs
echo "Removendo logs..."
find . -name "*.log" -type f -delete
find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true

# Remover arquivos temporários
echo "Removendo arquivos temporários..."
find . -name "*.tmp" -type f -delete
find . -name "*.temp" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete

# Remover cache do npm
echo "Limpando cache do npm..."
npm cache clean --force 2>/dev/null || true

# Remover arquivos de coverage se existirem
if [ -d "coverage" ]; then
    echo "Removendo coverage..."
    rm -rf coverage
fi

# Remover arquivos de teste se existirem
if [ -d ".nyc_output" ]; then
    echo "Removendo .nyc_output..."
    rm -rf .nyc_output
fi

echo "✅ Limpeza concluída!"
echo "📊 Tamanho do diretório atual:"
du -sh . 2>/dev/null || echo "Não foi possível calcular o tamanho"
