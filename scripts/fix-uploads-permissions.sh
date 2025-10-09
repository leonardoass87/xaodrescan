#!/bin/bash

# Script para corrigir permissões do diretório uploads
# Execute este script no host antes de fazer o build do Docker

echo "🔧 Corrigindo permissões do diretório uploads..."

# Criar diretório uploads se não existir
mkdir -p ./uploads
mkdir -p ./uploads/capas
mkdir -p ./uploads/capitulos
mkdir -p ./uploads/temp

# Ajustar permissões para permitir escrita do Docker
chmod -R 755 ./uploads

echo "✅ Permissões do diretório uploads configuradas!"
echo "📁 Diretório: $(pwd)/uploads"
echo "🔍 Permissões:"
ls -la ./uploads

echo ""
echo "🚀 Agora você pode fazer o build do Docker:"
echo "   docker-compose build --no-cache"
echo "   docker-compose up -d"
