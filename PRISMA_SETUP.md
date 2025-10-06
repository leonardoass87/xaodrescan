# 🚀 Configuração do Prisma ORM

Este documento explica como o Prisma foi integrado ao projeto XAODRESCAN e como utilizá-lo.

## 📋 O que foi implementado

### ✅ Instalação e Configuração
- ✅ Prisma Client instalado
- ✅ Schema do banco criado (`prisma/schema.prisma`)
- ✅ Cliente Prisma configurado (`src/lib/prisma.ts`)

### ✅ Migração de Scripts
- ✅ Script de migração de dados existentes (`scripts/migrate-to-prisma.js`)
- ✅ Script de seed para dados de teste (`scripts/seed-prisma.js`)
- ✅ Script de teste de conexão (`scripts/test-prisma.js`)

### ✅ Atualização das APIs
- ✅ `/api/register` - Registro de usuários
- ✅ `/api/login` - Login de usuários
- ✅ `/api/user/profile` - Perfil do usuário
- ✅ `/api/confirm-email` - Confirmação de email
- ✅ `/api/favoritos` - Sistema de favoritos

## 🛠️ Scripts Disponíveis

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações (desenvolvimento)
npm run prisma:migrate

# Executar migrações (produção)
npm run prisma:deploy

# Abrir Prisma Studio (interface visual)
npm run prisma:studio

# Migrar dados existentes para Prisma
npm run migrate-to-prisma

# Popular banco com dados de teste
npm run prisma:seed

# Testar conexão com Prisma
npm run test-prisma
```

## 📊 Modelos do Banco

### Usuario
```typescript
{
  id: number
  nome: string
  email: string (unique)
  senha: string
  role: 'ADMIN' | 'USUARIO'
  email_confirmado: boolean
  email_confirmation_token?: string
  email_confirmation_expires?: DateTime
  created_at: DateTime
  updated_at: DateTime
}
```

### Manga
```typescript
{
  id: number
  titulo: string
  autor?: string
  generos: string[]
  status: 'EM_ANDAMENTO' | 'COMPLETO' | 'PAUSADO'
  visualizacoes: number
  capa?: string
  data_adicao: DateTime
  created_at: DateTime
  updated_at: DateTime
}
```

### Capitulo
```typescript
{
  id: number
  manga_id: number
  numero: number
  titulo?: string
  data_publicacao: DateTime
  created_at: DateTime
  updated_at: DateTime
}
```

### Pagina
```typescript
{
  id: number
  capitulo_id: number
  numero: number
  imagem: string
  legenda?: string
  created_at: DateTime
}
```

### Favorito
```typescript
{
  id: number
  usuario_id: number
  manga_id: number
  data_favorito: DateTime
}
```

### SecurityLog
```typescript
{
  id: number
  timestamp: DateTime
  user_id?: number
  ip: string
  user_agent?: string
  action: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  details?: Json
  success: boolean
}
```

## 🔗 Relacionamentos

- **Usuario** ↔ **Favorito** (1:N)
- **Manga** ↔ **Favorito** (1:N)
- **Manga** ↔ **Capitulo** (1:N)
- **Capitulo** ↔ **Pagina** (1:N)
- **Usuario** ↔ **SecurityLog** (1:N)

## 💡 Exemplos de Uso

### Buscar usuário com favoritos
```typescript
const user = await prisma.usuario.findUnique({
  where: { id: userId },
  include: {
    favoritos: {
      include: {
        manga: true
      }
    }
  }
});
```

### Criar novo favorito
```typescript
const favorito = await prisma.favorito.create({
  data: {
    usuario_id: userId,
    manga_id: mangaId
  }
});
```

### Buscar mangás com capítulos
```typescript
const mangas = await prisma.manga.findMany({
  include: {
    capitulos: {
      include: {
        paginas: true
      }
    }
  }
});
```

## 🚀 Próximos Passos

1. **Executar migração**: `npm run migrate-to-prisma`
2. **Testar conexão**: `npm run test-prisma`
3. **Popular dados**: `npm run prisma:seed`
4. **Iniciar desenvolvimento**: `npm run dev`

## 🔧 Configuração do Ambiente

Certifique-se de que a variável `DATABASE_URL` está configurada no arquivo `.env`:

```env
DATABASE_URL="postgresql://xaodrescan_user:xaodrescan_password@localhost:5432/xaodrescan"
```

## 📚 Documentação Adicional

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Studio](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/prisma-studio)
