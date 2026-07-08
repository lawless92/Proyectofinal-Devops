# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app

#actualizar e instalar dependencias
RUN apk update && apk upgrade --no-cache
COPY app/package*.json ./
RUN npm install
COPY app/ .

# Stage 2: Production
FROM node:24-alpine
WORKDIR /app

# Crear usuario no root por seguridad
RUN apk update && apk upgrade --no-cache && \
    addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/index.js ./
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

EXPOSE 5000
CMD ["node", "index.js"]
