# Etapa 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copiar apenas os arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Instalar apenas dependências de produção
RUN npm install --omit=dev --ignore-scripts --prefer-offline

EXPOSE 3000
CMD ["npm", "start"]
