# 🔧 Correção de Permissões do Docker

## Problema
Após fazer o build da aplicação, o erro de permissão EACCES voltou porque o Docker está rodando com um usuário diferente que não tem permissões para escrever no diretório `/app/uploads/`.

## Soluções Implementadas

### 1. ✅ Dockerfile Atualizado
- Adicionado script de inicialização que configura permissões
- Garantido que o diretório uploads tenha permissões corretas (755)
- Usuário `nextjs` com permissões adequadas

### 2. ✅ Script de Inicialização
- Criado `scripts/docker-init.sh` que:
  - Cria diretórios necessários
  - Ajusta permissões
  - Executa migrações do Prisma
  - Inicia a aplicação

### 3. ✅ Diretórios Criados
- `./uploads/` - Diretório principal
- `./uploads/capas/` - Para capas dos mangás
- `./uploads/capitulos/` - Para páginas dos capítulos
- `./uploads/temp/` - Para arquivos temporários

## 🚀 Como Aplicar a Correção

### Passo 1: Parar os containers atuais
```bash
docker-compose down
```

### Passo 2: Fazer rebuild sem cache
```bash
docker-compose build --no-cache
```

### Passo 3: Iniciar os containers
```bash
docker-compose up -d
```

### Passo 4: Verificar se funcionou
```bash
# Verificar logs
docker-compose logs frontend

# Testar upload de um novo capítulo
```

## 🔍 Verificação

Se ainda houver problemas de permissão, execute:

```bash
# Verificar permissões do diretório uploads
ls -la ./uploads

# Verificar logs do container
docker-compose logs frontend | grep -i permission
```

## 📝 Notas Importantes

1. **Volume Mount**: O Docker está montando `./uploads:/app/uploads`, então as permissões do host são importantes
2. **Usuário Docker**: O container roda como usuário `nextjs` (UID 1001)
3. **Permissões**: O diretório deve ter permissões 755 para funcionar corretamente

## 🆘 Se Ainda Houver Problemas

1. **Verificar se o diretório existe no host**:
   ```bash
   ls -la ./uploads
   ```

2. **Verificar permissões do diretório**:
   ```bash
   chmod -R 755 ./uploads
   ```

3. **Verificar se o Docker tem acesso**:
   ```bash
   docker exec -it xaodrescan_frontend ls -la /app/uploads
   ```

## ✅ Resultado Esperado

Após aplicar essas correções, o upload de novos capítulos deve funcionar sem erros de permissão EACCES.
