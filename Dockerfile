# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

#actualizar e instalar dependencias
RUN apk update && apk upgrade --no-cache
COPY app/package*.json ./
RUN npm install
COPY app/ .

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Crear usuario no root por seguridad
RUN apk update && apk upgrade --no-cache && \
    addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "index.js"]
