#!/bin/sh

# Script de inicialização para Docker DEV
# Garante que o diretório uploads tenha as permissões corretas

echo "🔧 [DEV] Configurando permissões do diretório uploads..."

# Criar diretório uploads se não existir
mkdir -p /app/uploads

# Criar subdiretórios necessários
mkdir -p /app/uploads/capas
mkdir -p /app/uploads/capitulos
mkdir -p /app/uploads/temp

# Criar diretórios para capítulos existentes (1-50 para desenvolvimento)
for i in {1..50}; do
  mkdir -p /app/uploads/capitulos/$i
done

# Ajustar permissões de forma mais robusta
echo "📁 [DEV] Configurando permissões dos diretórios..."
chmod -R 777 /app/uploads
chown -R nextjs:nodejs /app/uploads

# Verificar se as permissões foram aplicadas
echo "🔍 [DEV] Verificando permissões:"
ls -la /app/uploads

# Criar um arquivo de teste para verificar se conseguimos escrever
echo "🧪 [DEV] Testando escrita no diretório uploads..."
touch /app/uploads/test-write.txt
if [ $? -eq 0 ]; then
    echo "✅ [DEV] Teste de escrita bem-sucedido!"
    rm -f /app/uploads/test-write.txt
else
    echo "❌ [DEV] Falha no teste de escrita!"
fi

echo "✅ [DEV] Permissões configuradas com sucesso!"

# Executar migrações do Prisma
echo "🔄 [DEV] Executando migrações do banco de dados..."
npx prisma migrate deploy

# Iniciar a aplicação em modo desenvolvimento
echo "🚀 [DEV] Iniciando aplicação em modo desenvolvimento..."
npm run dev
