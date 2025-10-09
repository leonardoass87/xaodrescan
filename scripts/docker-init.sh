#!/bin/sh

# Script de inicialização para Docker
# Garante que o diretório uploads tenha as permissões corretas

echo "🔧 Configurando permissões do diretório uploads..."

# Criar diretório uploads se não existir
mkdir -p /app/uploads

# Criar subdiretórios necessários
mkdir -p /app/uploads/capas
mkdir -p /app/uploads/capitulos
mkdir -p /app/uploads/temp

# Criar diretórios para capítulos existentes (1-20 para começar)
for i in {1..20}; do
  mkdir -p /app/uploads/capitulos/$i
done

# Ajustar permissões de forma mais robusta
echo "📁 Configurando permissões dos diretórios..."
chmod -R 777 /app/uploads
chown -R nextjs:nodejs /app/uploads

# Verificar se as permissões foram aplicadas
echo "🔍 Verificando permissões:"
ls -la /app/uploads

# Criar um arquivo de teste para verificar se conseguimos escrever
echo "🧪 Testando escrita no diretório uploads..."
touch /app/uploads/test-write.txt
if [ $? -eq 0 ]; then
    echo "✅ Teste de escrita bem-sucedido!"
    rm -f /app/uploads/test-write.txt
else
    echo "❌ Falha no teste de escrita!"
fi

echo "✅ Permissões configuradas com sucesso!"

# Executar migrações do Prisma
echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate deploy

# Iniciar a aplicação
echo "🚀 Iniciando aplicação..."
npm start
