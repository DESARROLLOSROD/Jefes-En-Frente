FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluye TypeScript)
RUN npm ci

# Copiar código fuente
COPY . .

# Build del proyecto TypeScript
RUN npm run build

# Stage de producción
FROM node:20-alpine
WORKDIR /app

# Copiar el código compilado
COPY --from=builder /app/dist ./dist

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Variables de entorno
ENV NODE_ENV=production

# Puerto (Railway lo asigna dinámicamente)
EXPOSE ${PORT:-5000}

# Comando de inicio
CMD ["node", "dist/server.js"]
