# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm install

# Copiar o restante do código
COPY . .

# Build da aplicação
RUN npm run build && npm prune --omit=dev

# Etapa 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copiar apenas os artefatos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# (Opcional) copiar .env.production se existir
# COPY .env.production .env.production

EXPOSE 3000

CMD ["npx", "next", "start"]
