# 🚀 Despliegue del Frontend en Vercel

## ✅ Cambios Realizados

### 1. Configuración de Variables de Entorno

Se creó el sistema de configuración centralizado para manejar URLs de API:

**Archivo**: [frontend/src/config/env.ts](frontend/src/config/env.ts)
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 2. Servicios Actualizados

Todos los servicios ahora usan la configuración centralizada:
- [api.ts](frontend/src/services/api.ts:4)
- [auth.ts](frontend/src/services/auth.ts:3)
- [usuario.service.ts](frontend/src/services/usuario.service.ts:8)
- [workZone.service.ts](frontend/src/services/workZone.service.ts:3)
- [bibliotecaMapa.service.ts](frontend/src/services/bibliotecaMapa.service.ts:4)

### 3. Archivos de Configuración

- **[vercel.json](frontend/vercel.json)**: Configurado para SPA routing
- **[.env.example](frontend/.env.example)**: Plantilla de variables de entorno
- **[.env](frontend/.env)**: Variables de desarrollo local (ignorado por git)

---

## 📋 Pasos para Desplegar

### 1️⃣ Crear Proyecto en Vercel

Tienes dos opciones:

#### Opción A: Desde el Dashboard de Vercel (Recomendado)
1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Add New Project"**
3. Importa el repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Opción B: Desde la CLI de Vercel
```bash
cd frontend
npx vercel
```

### 2️⃣ Configurar Variables de Entorno

**En el Dashboard de Vercel**:
1. Ve a: **Project Settings → Environment Variables**
2. Agrega la siguiente variable:

```
VITE_API_URL = https://tu-backend-api.vercel.app/api
```

**IMPORTANTE**: Reemplaza `tu-backend-api.vercel.app` con la URL real de tu backend desplegado.

### 3️⃣ Verificar URL del Backend

Antes de desplegar, asegúrate de tener la URL correcta de tu backend:
```bash
# Tu backend debería estar desplegado en algo como:
https://jefes-en-frente-backend.vercel.app
```

### 4️⃣ Desplegar

Vercel desplegará automáticamente cuando detecte el push a `main`.

Si usas la CLI:
```bash
cd frontend
npx vercel --prod
```

---

## 🔧 Configuración Completa de Vercel

### vercel.json
```json
{
  "version": 2,
  "name": "jefes-en-frente-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### package.json (scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 🌍 Conectar Frontend con Backend

### Desarrollo Local
```bash
# En .env (local)
VITE_API_URL=http://localhost:5000/api
```

### Producción
En el dashboard de Vercel, configura:
```
VITE_API_URL=https://tu-backend.vercel.app/api
```

---

## ✅ Verificar Despliegue

Después del despliegue exitoso:

1. **Probar la aplicación**:
   ```
   https://tu-frontend.vercel.app
   ```

2. **Verificar en DevTools**:
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña Console
   - Deberías ver: `🔧 Configuración de entorno: { API_BASE_URL: "https://..." }`

3. **Probar Login**:
   - Intenta iniciar sesión
   - Verifica que las peticiones vayan a tu backend en Vercel
   - Revisa la pestaña Network para ver las peticiones

---

## 🔒 CORS Configuration

**IMPORTANTE**: Asegúrate de que tu backend tenga configurado CORS para permitir peticiones desde tu frontend de Vercel.

En tu backend ([backend/src/server.ts](backend/src/server.ts)), debería tener algo como:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',  // desarrollo local
    'https://tu-frontend.vercel.app'  // producción
  ],
  credentials: true
}));
```

---

## 🎯 Checklist de Despliegue

Antes de desplegar, verifica:

- [x] Backend desplegado y funcionando
- [ ] URL del backend obtenida
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Frontend buildeado sin errores localmente (`npm run build`)
- [ ] vercel.json configurado correctamente
- [ ] CORS configurado en el backend
- [ ] Push a repositorio realizado

---

## 🆘 Solución de Problemas

### Error: "Network Error" o "Failed to fetch"
**Causa**: Backend no accesible o CORS mal configurado

**Solución**:
1. Verifica que la URL del backend en `VITE_API_URL` sea correcta
2. Verifica que el backend esté desplegado y funcionando
3. Verifica la configuración de CORS en el backend

### Error: "404 Not Found" en rutas
**Causa**: SPA routing no configurado

**Solución**: Verifica que [vercel.json](frontend/vercel.json) tenga la configuración de rutas correcta

### Error: API_BASE_URL is undefined
**Causa**: Variable de entorno no configurada

**Solución**:
1. Verifica que `VITE_API_URL` esté configurada en Vercel
2. Redeploya el proyecto después de agregar la variable

---

## 📚 Comandos Útiles

```bash
# Desarrollo local
cd frontend
npm run dev

# Build local (para probar)
npm run build
npm run preview

# Desplegar con Vercel CLI
npx vercel --prod

# Ver logs del deploy
npx vercel logs
```

---

## 🎉 URLs del Proyecto

Después del despliegue exitoso:

**Frontend**: `https://tu-frontend.vercel.app`
**Backend**: `https://tu-backend.vercel.app`

---

## 🔄 Actualizaciones Futuras

Para futuras actualizaciones:

1. Haz cambios en el código
2. Commit y push a `main`:
   ```bash
   git add .
   git commit -m "descripción de cambios"
   git push origin main
   ```
3. Vercel desplegará automáticamente

---

**Todo listo para desplegar el frontend!** 🚀

Sigue los pasos en orden y tu aplicación estará en producción.
