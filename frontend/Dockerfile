FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build usando npx para evitar problemas de permisos
RUN npx tsc && npx vite build

# Stage de producción - Usar Node con serve en lugar de Nginx
FROM node:20-alpine
WORKDIR /app

# Copiar el build
COPY --from=builder /app/dist ./dist

# Instalar serve globalmente
RUN npm install -g serve

# Puerto (Railway lo asigna dinámicamente)
EXPOSE ${PORT:-3000}

# Comando de inicio usando serve
# Railway asigna PORT automáticamente, serve lo detecta
CMD serve -s dist -p $PORT
