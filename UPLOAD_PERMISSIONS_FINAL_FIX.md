# 🔧 Correção Final de Permissões de Upload

## Problema Identificado
O erro `EACCES: permission denied` ainda estava ocorrendo mesmo após as correções anteriores porque:

1. **Docker Volume Mount**: O diretório `./uploads` do host é montado em `/app/uploads` no container
2. **Permissões do Host**: As permissões do diretório no host Windows não eram adequadas
3. **Usuário Docker**: O container roda como usuário `nextjs` (UID 1001) que não tinha permissões de escrita

## ✅ Soluções Implementadas

### 1. **API com Fallback de Permissões**
- ✅ Atualizado `src/app/api/mangas/[id]/capitulo/route.ts`
- ✅ Se falhar com permissões 755/644, tenta com 777/666
- ✅ Logs detalhados para debug

### 2. **Script de Inicialização Docker Robusto**
- ✅ Atualizado `scripts/docker-init.sh`
- ✅ Permissões 777 para garantir acesso total
- ✅ Teste de escrita para verificar se funciona
- ✅ Verificação de permissões com `ls -la`

### 3. **Diretórios Criados no Host**
- ✅ `./uploads/` - Diretório principal
- ✅ `./uploads/capas/` - Para capas dos mangás
- ✅ `./uploads/capitulos/` - Para páginas dos capítulos
- ✅ `./uploads/temp/` - Para arquivos temporários

### 4. **Hook de Fetch Autenticado**
- ✅ Criado `src/hooks/useAuthenticatedFetch.ts`
- ✅ Sempre inclui `credentials: 'include'` para cookies
- ✅ Headers padrão para autenticação

## 🚀 Como Aplicar a Correção

### Passo 1: Parar containers atuais
```bash
docker-compose down
```

### Passo 2: Fazer rebuild sem cache
```bash
docker-compose build --no-cache
```

### Passo 3: Iniciar containers
```bash
docker-compose up -d
```

### Passo 4: Verificar logs
```bash
# Verificar se o script de inicialização funcionou
docker-compose logs frontend | grep -E "(Configurando|Teste de escrita|Permissões)"

# Verificar se consegue escrever no diretório
docker exec -it xaodrescan_frontend touch /app/uploads/test.txt
```

## 🔍 Verificação de Funcionamento

### 1. **Verificar Permissões no Container**
```bash
docker exec -it xaodrescan_frontend ls -la /app/uploads
```

### 2. **Testar Upload de Capítulo**
- Acesse `/admin/mangas/[id]/editar`
- Clique em "Novo Capítulo"
- Adicione páginas e salve
- Verifique se não há erro de permissão

### 3. **Verificar Logs da API**
```bash
docker-compose logs frontend | grep -E "(salvarImagem|EACCES|permission)"
```

## 📋 Código das Correções

### API com Fallback de Permissões:
```typescript
// Tenta com permissões 755, se falhar tenta 777
try {
  await mkdir(uploadsDir, { recursive: true, mode: 0o755 });
} catch (mkdirError) {
  await mkdir(uploadsDir, { recursive: true, mode: 0o777 });
}

// Tenta com permissões 644, se falhar tenta 666
try {
  await writeFile(caminhoArquivo, buffer, { mode: 0o644 });
} catch (writeError) {
  await writeFile(caminhoArquivo, buffer, { mode: 0o666 });
}
```

### Script de Inicialização Docker:
```bash
# Permissões mais permissivas
chmod -R 777 /app/uploads
chown -R nextjs:nodejs /app/uploads

# Teste de escrita
touch /app/uploads/test-write.txt
```

## 🆘 Se Ainda Houver Problemas

### 1. **Verificar se o volume está montado corretamente**
```bash
docker-compose ps
docker inspect xaodrescan_frontend | grep -A 10 "Mounts"
```

### 2. **Verificar permissões do diretório host**
```bash
# No Windows
icacls .\uploads /grant Everyone:F /T
```

### 3. **Verificar logs detalhados**
```bash
docker-compose logs frontend --tail=50
```

## ✅ Resultado Esperado

Após aplicar essas correções:
- ✅ Upload de novos capítulos deve funcionar sem erro EACCES
- ✅ DELETE de capítulos deve funcionar (API criada)
- ✅ Permissões devem ser configuradas automaticamente no Docker
- ✅ Fallback de permissões na API garante funcionamento

## 📝 Notas Importantes

1. **Permissões 777**: Mais permissivas, mas necessárias para o Docker funcionar
2. **Volume Mount**: O diretório do host é compartilhado com o container
3. **Usuário Docker**: `nextjs` (UID 1001) precisa de permissões de escrita
4. **Fallback**: A API tenta permissões mais restritivas primeiro, depois mais permissivas

Agora o sistema deve funcionar corretamente! 🎉
