# ==========================
# 🏗️ Etapa 1: Build
# ==========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas arquivos de dependências (para aproveitar cache)
COPY package.json package-lock.json* ./

# Instalar dependências completas (incluindo dev, Prisma etc.)
RUN npm ci --silent



# Copiar o restante do código-fonte
COPY . .

# Gerar Prisma Client (necessário antes do build)
RUN npx prisma generate

# Build da aplicação Next.js
RUN npm run build

# ==========================
# 🚀 Etapa 2: Runtime (mínima)
# ==========================
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar arquivos essenciais
COPY package.json package-lock.json* ./

# Instalar apenas dependências de produção
RUN npm ci --only=production --silent && npm cache clean --force

# Copiar artefatos do builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Criar diretórios e ajustar permissões
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

# 👇 Aqui fica o comando final que garante migrações + start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
