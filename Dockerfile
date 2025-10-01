# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências e instalar tudo
COPY package.json package-lock.json* ./
RUN npm install

# Copiar o restante do código e buildar
COPY . .
RUN npm run build

# Etapa 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copiar apenas os arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

EXPOSE 3000

# Usar npx garante que o binário next do node_modules/.bin seja encontrado
CMD ["npx", "next", "start"]
