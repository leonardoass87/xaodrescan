# 🔧 Correção dos Dois Cenários de Upload

## Problema Identificado
Você estava certo! Existem **dois cenários diferentes** para adicionar capítulos:

### ✅ **Cenário 1 (Funcionando)**: Criar capítulo + páginas juntos
- **Path**: `/api/mangas/[id]/capitulo/route.ts`
- **Status**: ✅ Já corrigido com fallback de permissões
- **Uso**: Formulário "Novo Capítulo" com páginas

### ❌ **Cenário 2 (Com erro)**: Criar capítulo vazio + adicionar páginas depois
- **Path**: `/api/mangas/[id]/capitulo/[capituloId]/adicionar-paginas/route.ts`
- **Status**: ❌ Tinha erro de permissão EACCES
- **Uso**: Botão "Adicionar Páginas" em capítulo existente

## ✅ Correções Aplicadas

### 1. **Cenário 1 - Já Funcionando**
```typescript
// src/app/api/mangas/[id]/capitulo/route.ts
// ✅ Já tinha fallback de permissões 755→777 e 644→666
```

### 2. **Cenário 2 - Corrigido Agora**
```typescript
// src/app/api/mangas/[id]/capitulo/[capituloId]/adicionar-paginas/route.ts
// ✅ Aplicado mesmo fallback de permissões

try {
  await mkdir(uploadsDir, { recursive: true, mode: 0o755 });
} catch (mkdirError) {
  await mkdir(uploadsDir, { recursive: true, mode: 0o777 });
}

try {
  await writeFile(caminhoArquivo, buffer, { mode: 0o644 });
} catch (writeError) {
  await writeFile(caminhoArquivo, buffer, { mode: 0o666 });
}
```

## 🎯 Resultado Esperado

Agora **ambos os cenários** devem funcionar:

### **Cenário 1**: Criar capítulo com páginas
1. Acesse `/admin/mangas/[id]/editar`
2. Clique em "Novo Capítulo"
3. Adicione páginas e salve
4. ✅ **Deve funcionar sem erro EACCES**

### **Cenário 2**: Adicionar páginas a capítulo existente
1. Acesse `/admin/mangas/[id]/editar`
2. Selecione um capítulo existente
3. Clique em "Adicionar Páginas"
4. Adicione páginas e salve
5. ✅ **Deve funcionar sem erro EACCES**

## 🔍 Verificação

### Teste Cenário 1:
```bash
# Verificar logs do Cenário 1
docker-compose logs frontend | grep -E "(salvarImagem|EACCES|permission)" | grep "capitulo/route.ts"
```

### Teste Cenário 2:
```bash
# Verificar logs do Cenário 2
docker-compose logs frontend | grep -E "(salvarImagem|EACCES|permission)" | grep "adicionar-paginas"
```

## 📋 APIs Corrigidas

| Cenário | API Path | Status | Fallback |
|---------|----------|--------|----------|
| 1 | `/api/mangas/[id]/capitulo/` | ✅ | 755→777, 644→666 |
| 2 | `/api/mangas/[id]/capitulo/[capituloId]/adicionar-paginas/` | ✅ | 755→777, 644→666 |
| 3 | `/api/mangas/` (criar mangá) | ✅ | Já usa 777 |

## 🚀 Para Aplicar

```bash
# 1. Parar containers
docker-compose down

# 2. Rebuild sem cache
docker-compose build --no-cache

# 3. Iniciar containers
docker-compose up -d
```

## ✅ Resultado Final

Agora **ambos os cenários** de upload de capítulos devem funcionar perfeitamente:

- ✅ **Cenário 1**: Criar capítulo + páginas (já funcionava)
- ✅ **Cenário 2**: Adicionar páginas a capítulo existente (corrigido agora)
- ✅ **DELETE**: Deletar capítulos (API criada)
- ✅ **Permissões**: Fallback robusto em todas as APIs

Obrigado por identificar corretamente os dois cenários! 🎉
