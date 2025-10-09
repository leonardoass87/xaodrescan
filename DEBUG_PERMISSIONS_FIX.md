# 🔧 Debug e Correção de Permissões - Cenário 1

## Problema Identificado
O **Cenário 1** (criar capítulo + páginas) está falhando com erro EACCES, enquanto o **Cenário 2** (adicionar páginas) funciona.

## 🔍 Investigação Realizada

### Diferenças Encontradas:
1. **Timing**: Cenário 1 cria capítulo e imediatamente salva páginas
2. **Diretório**: Cenário 1 precisa criar `/app/uploads/capitulos/11/` do zero
3. **Permissões**: Docker volume mount pode não propagar permissões corretamente

### Teste de Permissões no Host:
```bash
✅ Teste local funcionou
📁 Diretório: C:\DevEnv\MVP-XAODRESCAN\xaodrescan\uploads\capitulos\test
✅ Arquivo criado com sucesso
🔍 Permissões: 40666 (diretório), 100666 (arquivo)
```

## ✅ Correções Implementadas

### 1. **Logs de Debug Adicionados**
```typescript
console.log('🔍 Debug - Tentando criar diretório:', uploadsDir);
console.log('✅ Debug - Diretório criado com sucesso (755):', uploadsDir);
console.log('🔍 Debug - Tentando salvar arquivo:', caminhoArquivo);
```

### 2. **Criação Sequencial de Diretórios**
```typescript
// Garantir que todos os diretórios pais existem
const dirsToCreate = [uploadsBaseDir, capitulosDir, uploadsDir];

for (const dir of dirsToCreate) {
  await mkdir(dir, { recursive: true, mode: 0o777 });
}
```

### 3. **Script Docker Atualizado**
```bash
# Criar diretórios para capítulos existentes (1-20 para começar)
for i in {1..20}; do
  mkdir -p /app/uploads/capitulos/$i
done
```

## 🚀 Para Aplicar as Correções

### Passo 1: Rebuild do Docker
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Passo 2: Verificar Logs
```bash
# Verificar se o script de inicialização funcionou
docker-compose logs frontend | findstr "Configurando"

# Verificar logs de debug da API
docker-compose logs frontend | findstr "Debug"
```

### Passo 3: Testar Cenário 1
1. Acesse `/admin/mangas/[id]/editar`
2. Clique em "Novo Capítulo"
3. Adicione páginas e salve
4. Verifique se não há erro EACCES

## 🔍 Logs Esperados

### Script de Inicialização:
```
🔧 Configurando permissões do diretório uploads...
📁 Configurando permissões dos diretórios...
✅ Teste de escrita bem-sucedido!
```

### API de Upload:
```
🔍 Debug - Tentando criar diretório: /app/uploads/capitulos/11
✅ Debug - Diretório criado/verificado: /app/uploads
✅ Debug - Diretório criado/verificado: /app/uploads/capitulos
✅ Debug - Diretório criado com sucesso (755): /app/uploads/capitulos/11
🔍 Debug - Tentando salvar arquivo: /app/uploads/capitulos/11/pagina_11_1_xxx.jpg
✅ Debug - Arquivo salvo com sucesso (644): /app/uploads/capitulos/11/pagina_11_1_xxx.jpg
```

## 🆘 Se Ainda Houver Problemas

### 1. **Verificar Permissões no Container**
```bash
docker exec -it xaodrescan_frontend ls -la /app/uploads
docker exec -it xaodrescan_frontend ls -la /app/uploads/capitulos
```

### 2. **Testar Escrita Manual**
```bash
docker exec -it xaodrescan_frontend touch /app/uploads/capitulos/11/test.txt
```

### 3. **Verificar Volume Mount**
```bash
docker inspect xaodrescan_frontend | findstr "Mounts"
```

## ✅ Resultado Esperado

Após as correções:
- ✅ **Cenário 1**: Criar capítulo + páginas (deve funcionar)
- ✅ **Cenário 2**: Adicionar páginas (já funcionava)
- ✅ **Logs detalhados** para debug
- ✅ **Criação robusta** de diretórios

## 📋 Próximos Passos

1. **Testar** a correção
2. **Verificar logs** de debug
3. **Confirmar** que ambos os cenários funcionam
4. **Remover logs** de debug se necessário

A correção deve resolver o problema de permissões no Cenário 1! 🎉
