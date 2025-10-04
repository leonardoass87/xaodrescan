# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (para cache)
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production --silent
#RUN npm ci --silent

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Etapa 2: Runtime (imagem mínima)
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar apenas dependências de produção
COPY package.json package-lock.json* ./
RUN npm ci --only=production --silent && npm cache clean --force

# Copiar apenas arquivos necessários
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Criar diretórios e ajustar permissões
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads


# Mudar ownership dos arquivos
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
