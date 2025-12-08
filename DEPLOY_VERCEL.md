# 🚀 Guía de Deploy en Vercel - Jefes en Frente

Esta guía te ayudará a desplegar tu aplicación completa en Vercel (Backend + Frontend).

---

## 📋 Requisitos Previos

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (para base de datos en la nube)
- ✅ Repositorio Git (GitHub, GitLab, o Bitbucket)
- ✅ Vercel CLI instalado (opcional): `npm install -g vercel`

---

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo cluster (Free tier es suficiente)
4. Espera a que el cluster se cree (5-10 minutos)

### 1.2 Configurar Acceso
1. **Database Access**:
   - Ir a "Database Access"
   - Crear un usuario con contraseña
   - Dar permisos "Read and write to any database"

2. **Network Access**:
   - Ir a "Network Access"
   - Agregar IP Address
   - Seleccionar "Allow Access from Anywhere" (0.0.0.0/0)
   - Esto es necesario para que Vercel pueda conectarse

### 1.3 Obtener Connection String
1. Click en "Connect" en tu cluster
2. Seleccionar "Connect your application"
3. Copiar la connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Reemplazar `<username>` y `<password>` con tus credenciales
5. Agregar el nombre de la base de datos: `/jefes-en-frente` antes de `?`
   ```
   mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/jefes-en-frente?retryWrites=true&w=majority
   ```

---

## 🔧 Paso 2: Preparar el Código

### 2.1 Backend

Los archivos ya están creados:
- ✅ `backend/vercel.json` - Configuración de Vercel
- ✅ `backend/.env.example` - Ejemplo de variables de entorno
- ✅ Script `vercel-build` en package.json

**Verificar CORS en backend/src/server.ts:**

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://tu-frontend.vercel.app', // Agregar después del deploy
  ],
  credentials: true
}));
```

### 2.2 Frontend

Ya está creado:
- ✅ `frontend/vercel.json` - Configuración de Vercel

**Crear archivo de configuración de API:**

Crear `frontend/src/config/api.ts`:
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Actualizar `frontend/src/services/api.ts`:**
```typescript
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  // ... resto del código
});
```

---

## 📤 Paso 3: Deploy del Backend

### 3.1 Desde la Web de Vercel

1. **Ir a [vercel.com](https://vercel.com)**
2. **Click en "Add New" → "Project"**
3. **Importar tu repositorio Git**
4. **Configurar el proyecto:**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Agregar Environment Variables** (muy importante):

   Click en "Environment Variables" y agregar:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/jefes-en-frente?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `tu_secreto_super_seguro_random_string` |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |

   **⚠️ IMPORTANTE**:
   - Generar un JWT_SECRET seguro: puedes usar [este generador](https://randomkeygen.com/)
   - Copiar exactamente tu MONGODB_URI de Atlas

6. **Click en "Deploy"**

7. **Esperar el deploy** (2-3 minutos)

8. **Copiar la URL** del backend (ej: `https://jefes-en-frente-backend.vercel.app`)

### 3.2 Desde CLI (Alternativa)

```bash
cd backend

# Login en Vercel
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add PORT

# Deploy a producción
vercel --prod
```

---

## 📤 Paso 4: Deploy del Frontend

### 4.1 Actualizar Variables de Entorno

Crear `frontend/.env.production`:
```env
VITE_API_URL=https://jefes-en-frente-backend.vercel.app/api
```

### 4.2 Desde la Web de Vercel

1. **Click en "Add New" → "Project"**
2. **Seleccionar el mismo repositorio** (o crear uno nuevo)
3. **Configurar el proyecto:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Agregar Environment Variables:**

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://jefes-en-frente-backend.vercel.app/api` |

5. **Click en "Deploy"**

6. **Copiar la URL** del frontend (ej: `https://jefes-en-frente.vercel.app`)

### 4.3 Desde CLI (Alternativa)

```bash
cd frontend

# Deploy
vercel

# Configurar variables de entorno
vercel env add VITE_API_URL

# Deploy a producción
vercel --prod
```

---

## 🔄 Paso 5: Actualizar CORS

Ahora que tienes las URLs finales, actualiza el CORS en el backend:

1. **Ir a tu repositorio**
2. **Editar `backend/src/server.ts`:**

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://jefes-en-frente.vercel.app', // Tu URL de frontend
    'https://*.vercel.app', // Permitir previews de Vercel
  ],
  credentials: true
}));
```

3. **Commit y push** los cambios
4. Vercel **automáticamente** re-desplegará el backend

---

## ✅ Paso 6: Verificar el Deploy

### 6.1 Probar el Backend

Abrir en el navegador:
```
https://jefes-en-frente-backend.vercel.app/api/auth/proyectos
```

Deberías ver un error 401 (esto es correcto, significa que está funcionando pero necesitas autenticación).

### 6.2 Probar el Frontend

1. Abrir: `https://jefes-en-frente.vercel.app`
2. Deberías ver la pantalla de login
3. Intentar login con credenciales de prueba

### 6.3 Inicializar Usuarios

Para crear los usuarios iniciales en producción:

**Opción A: Desde local conectándote a MongoDB Atlas**
```bash
cd backend
# Editar .env y poner tu MONGODB_URI de Atlas
npm run init
```

**Opción B: Crear manualmente en MongoDB Atlas**
1. Ir a MongoDB Atlas
2. Browse Collections
3. Crear colección `usuarios`
4. Insertar documento con un usuario admin (ver estructura en el código)

---

## 📱 Paso 7: Actualizar App Móvil

Actualizar `mobile/src/constants/config.ts`:

```typescript
export const API_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'  // Desarrollo
  : 'https://jefes-en-frente-backend.vercel.app/api'; // Producción
```

---

## 🔒 Seguridad y Mejores Prácticas

### Variables de Entorno
- ✅ NUNCA commitear archivos `.env`
- ✅ Usar `.env.example` como referencia
- ✅ JWT_SECRET debe ser único y aleatorio
- ✅ Rotar JWT_SECRET periódicamente

### MongoDB
- ✅ Usar usuario y contraseña específicos por proyecto
- ✅ Habilitar IP Whitelist en producción si es posible
- ✅ Hacer backups regulares

### CORS
- ✅ Listar solo dominios autorizados
- ✅ No usar '*' en producción
- ✅ Verificar credentials: true

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"
**Solución:**
1. Verificar que MONGODB_URI sea correcto
2. Verificar que la IP de Vercel esté permitida (0.0.0.0/0)
3. Verificar usuario y contraseña en Atlas

### Error: "CORS blocked"
**Solución:**
1. Verificar que la URL del frontend esté en la lista de CORS
2. Re-deployar el backend después de cambios en CORS
3. Verificar credentials: true

### Error: "Invalid JWT token"
**Solución:**
1. Verificar que JWT_SECRET sea el mismo en todas las instancias
2. Limpiar localStorage del frontend
3. Hacer login nuevamente

### Frontend no se conecta al Backend
**Solución:**
1. Verificar VITE_API_URL en variables de entorno
2. Abrir DevTools → Network → verificar las peticiones
3. Verificar que el backend responda en la URL configurada

### Build falla
**Solución:**
1. Verificar que `npm run build` funcione localmente
2. Verificar que todas las dependencias estén en `dependencies` (no en `devDependencies`)
3. Revisar logs de Vercel para ver el error específico

---

## 🔄 Re-deploys Automáticos

Vercel automáticamente re-desplegará tu aplicación cuando:
- ✅ Hagas push a la rama principal (main/master)
- ✅ Hagas push a cualquier rama (creará un preview)
- ✅ Hagas merge de un Pull Request

**Para deployar manualmente:**
1. Ir a Vercel dashboard
2. Seleccionar proyecto
3. Click en "Deployments"
4. Click en "..." → "Redeploy"

---

## 📊 Monitoreo

### Logs del Backend
1. Ir a Vercel Dashboard
2. Seleccionar proyecto backend
3. Click en "Functions" → Ver logs en tiempo real

### Analytics
Vercel proporciona analytics automáticos:
- Pageviews
- Unique visitors
- Top pages
- Referrers

---

## 💰 Costos

### Vercel
- **Plan Hobby (Free)**:
  - Perfecto para este proyecto
  - 100 GB bandwidth
  - Unlimited deployments
  - Serverless Functions

### MongoDB Atlas
- **Free Tier (M0)**:
  - 512 MB storage
  - Shared RAM
  - Suficiente para desarrollo y producción pequeña

**Ambos son GRATIS** para este proyecto.

---

## 📝 Checklist de Deploy

### Preparación
- [ ] MongoDB Atlas configurado
- [ ] Connection string obtenido
- [ ] JWT_SECRET generado
- [ ] Archivos vercel.json creados
- [ ] CORS configurado

### Backend
- [ ] Deploy completado
- [ ] Variables de entorno configuradas
- [ ] URL del backend copiada
- [ ] Endpoint de salud funciona
- [ ] Usuarios iniciales creados

### Frontend
- [ ] VITE_API_URL configurado
- [ ] Deploy completado
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Reportes se crean correctamente

### Post-Deploy
- [ ] CORS actualizado con URL final
- [ ] App móvil actualizada
- [ ] Documentación actualizada
- [ ] Equipo notificado

---

## 🎯 URLs Finales

Después del deploy, tendrás:

- **Backend API**: `https://jefes-en-frente-backend.vercel.app`
- **Frontend Web**: `https://jefes-en-frente.vercel.app`
- **MongoDB**: `mongodb+srv://...`

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisar logs de Vercel**: Dashboard → Deployments → Click en deployment → Functions tab
2. **Verificar variables de entorno**: Dashboard → Settings → Environment Variables
3. **Probar localmente**: Asegurarse de que funcione en local primero
4. **Documentación de Vercel**: [vercel.com/docs](https://vercel.com/docs)
5. **Documentación de MongoDB**: [docs.mongodb.com](https://docs.mongodb.com)

---

## 📚 Recursos Adicionales

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**¡Felicidades! Tu aplicación está en producción 🎉**

Creado con ❤️ para el proyecto Jefes en Frente
