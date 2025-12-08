# Comandos Rápidos - Deploy Railway

Guía rápida para desplegar en Railway usando CLI.

## Instalación Inicial

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login
```

---

## Deploy Backend

```bash
# Ir al directorio backend
cd backend

# Inicializar proyecto Railway
railway init

# Configurar variables de entorno
railway variables set MONGODB_URI="mongodb+srv://usuario:password@cluster.mongodb.net/jefes-en-frente"
railway variables set JWT_SECRET="tu_secreto_super_seguro"
railway variables set NODE_ENV="production"

# Deploy
railway up

# Crear dominio público
railway domain create

# Ver la URL
railway domain
```

---

## Deploy Frontend

```bash
# Ir al directorio frontend
cd frontend

# Vincular al mismo proyecto
railway link

# Crear nuevo servicio
railway service create

# Configurar variable de entorno (usar la URL del backend)
railway variables set VITE_API_URL="https://tu-backend.up.railway.app/api"

# Deploy
railway up

# Crear dominio público
railway domain create

# Ver la URL
railway domain
```

---

## Actualizar Variables de Entorno del Backend

```bash
cd backend

# Agregar URL del frontend para CORS
railway variables set FRONTEND_URL="https://tu-frontend.up.railway.app"
```

---

## Comandos Útiles

```bash
# Ver logs en tiempo real
railway logs

# Ver logs de un servicio específico
railway logs --service jefes-backend
railway logs --service jefes-frontend

# Ver todas las variables
railway variables

# Abrir en navegador
railway open

# Ver estado
railway status

# Revertir deployment
railway rollback
```

---

## Variables de Entorno Requeridas

### Backend
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secreto_seguro
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.up.railway.app
```

### Frontend
```
VITE_API_URL=https://tu-backend.up.railway.app/api
```

---

## Workflow Típico de Actualización

```bash
# 1. Hacer cambios en el código
# 2. Commit a git
git add .
git commit -m "Descripción de cambios"
git push

# 3. Deploy manual (si auto-deploy no está activado)
railway up

# 4. Ver logs
railway logs
```

---

## Deploy desde GitHub (Alternativa Recomendada)

1. Sube tu código a GitHub
2. Ve a [Railway Dashboard](https://railway.app/dashboard)
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Configura servicios:
   - Backend: Root Directory = `backend`
   - Frontend: Root Directory = `frontend`
6. Agrega variables de entorno en cada servicio
7. Genera dominios para cada servicio

---

## Troubleshooting Rápido

```bash
# Ver errores de build
railway logs --deployment

# Reiniciar servicio
railway restart

# Ver variables configuradas
railway variables

# Conectar al servicio (SSH)
railway shell
```

---

## Notas Importantes

- El primer deploy puede tardar 5-10 minutos
- Los dominios de Railway son del tipo: `*.up.railway.app`
- Cada vez que cambias variables de entorno, el servicio se reinicia automáticamente
- Railway detecta automáticamente Node.js y ejecuta `npm install`
