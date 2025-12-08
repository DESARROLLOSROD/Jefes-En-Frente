# ⚡ Deploy Rápido en Vercel - Comandos

## 🚀 Opción 1: Deploy desde la Web (Recomendado)

### Backend
```
1. Ir a vercel.com → New Project
2. Importar repo → Root: backend
3. Environment Variables:
   - MONGODB_URI: mongodb+srv://...
   - JWT_SECRET: generar_random_string
   - NODE_ENV: production
   - PORT: 5000
4. Deploy
```

### Frontend
```
1. Vercel.com → New Project
2. Importar repo → Root: frontend
3. Environment Variables:
   - VITE_API_URL: https://tu-backend.vercel.app/api
4. Deploy
```

---

## 💻 Opción 2: Deploy desde CLI

### Instalación
```bash
npm install -g vercel
```

### Backend
```bash
cd backend

# Login
vercel login

# Deploy
vercel

# Variables de entorno
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add PORT

# Deploy a producción
vercel --prod
```

### Frontend
```bash
cd frontend

# Deploy
vercel

# Variable de entorno
vercel env add VITE_API_URL

# Deploy a producción
vercel --prod
```

---

## 📋 Variables de Entorno

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/jefes-en-frente
JWT_SECRET=tu_secreto_super_seguro
NODE_ENV=production
PORT=5000
```

### Frontend (.env.production)
```env
VITE_API_URL=https://tu-backend.vercel.app/api
```

---

## ✅ Verificación Rápida

### Probar Backend
```bash
curl https://tu-backend.vercel.app/api/auth/proyectos
# Debe responder 401 (correcto)
```

### Probar Frontend
```bash
# Abrir en navegador
https://tu-frontend.vercel.app
```

---

## 🔧 Post-Deploy

### Actualizar CORS
```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tu-frontend.vercel.app',
  ],
  credentials: true
}));
```

### Inicializar Usuarios
```bash
cd backend
# Configurar .env con MONGODB_URI de Atlas
npm run init
```

---

## 🐛 Problemas Comunes

| Error | Solución |
|-------|----------|
| Cannot connect to MongoDB | Verificar MONGODB_URI y whitelist IPs (0.0.0.0/0) |
| CORS blocked | Agregar URL del frontend en CORS |
| Build fails | Ejecutar `npm run build` localmente |
| 404 en API | Verificar vercel.json routes |

---

## 📱 App Móvil

```typescript
// mobile/src/constants/config.ts
export const API_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'
  : 'https://tu-backend.vercel.app/api';
```

---

## 🔄 Re-deploy

```bash
# Automático: push a main
git push origin main

# Manual: desde dashboard
Vercel → Project → Deployments → Redeploy

# CLI
vercel --prod
```

---

**Ver guía completa**: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
