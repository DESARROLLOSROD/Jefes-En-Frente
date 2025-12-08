# Deployment en Railway - Configuración Final

¡Felicidades! Tus servicios están desplegados exitosamente en Railway. Ahora necesitas configurar las variables de entorno para que el frontend y backend se comuniquen correctamente.

## Estado Actual

✅ **Backend**: Desplegado y funcionando
✅ **Frontend**: Desplegado y funcionando
⚠️ **Configuración**: Pendiente (variables de entorno)

---

## Paso 1: Obtener las URLs de los Servicios

1. Ve a tu proyecto en [Railway Dashboard](https://railway.app/dashboard)
2. Identifica las URLs de tus servicios:
   - **Backend**: Algo como `https://jefes-backend-production-xxxx.up.railway.app`
   - **Frontend**: Algo como `https://jefes-frontend-production-xxxx.up.railway.app`

**Copia ambas URLs**, las necesitarás en los siguientes pasos.

---

## Paso 2: Configurar Variables de Entorno del Backend

1. **Ve al servicio del Backend** en Railway
2. Haz clic en la pestaña **"Variables"**
3. **Agrega o verifica** estas variables de entorno:

```bash
# Conexión a MongoDB Atlas (REQUERIDO)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/jefes-en-frente?retryWrites=true&w=majority

# Secret para JWT (REQUERIDO)
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion

# Entorno de Node (REQUERIDO)
NODE_ENV=production

# URL del Frontend para CORS (REQUERIDO)
FRONTEND_URL=https://jefes-frontend-production-xxxx.up.railway.app
```

**IMPORTANTE**: Reemplaza:
- `MONGODB_URI` con tu connection string real de MongoDB Atlas
- `JWT_SECRET` con un secreto seguro (puedes generar uno con `openssl rand -base64 32`)
- `FRONTEND_URL` con la URL real de tu frontend (la que copiaste antes)

4. **Guarda** los cambios
5. El backend se **reiniciará automáticamente**

---

## Paso 3: Configurar Variables de Entorno del Frontend

1. **Ve al servicio del Frontend** en Railway
2. Haz clic en la pestaña **"Variables"**
3. **Agrega** esta variable de entorno:

```bash
# URL del Backend API (REQUERIDO)
VITE_API_URL=https://jefes-backend-production-xxxx.up.railway.app/api
```

**IMPORTANTE**:
- Reemplaza con la URL real de tu backend (la que copiaste antes)
- **NO olvides** agregar `/api` al final

4. **Guarda** los cambios
5. Railway **redesplegar automáticamente** el frontend

---

## Paso 4: Verificar MongoDB Atlas

Asegúrate de que MongoDB Atlas esté configurado correctamente:

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. En tu cluster, ve a **"Network Access"**
3. Verifica que tengas **`0.0.0.0/0`** en la lista (permite conexiones desde cualquier IP)
4. En **"Database Access"**, verifica que tu usuario tenga permisos de **lectura y escritura**

---

## Paso 5: Verificar el Deployment

### Verificar Backend

1. Abre la URL del backend en tu navegador:
   ```
   https://jefes-backend-production-xxxx.up.railway.app
   ```

2. Deberías ver algo como:
   ```json
   {
     "message": "🚀 API Jefes en Frente funcionando!",
     "version": "2.0",
     "features": ["Autenticación JWT", "Múltiples Proyectos", "Gestión de Usuarios"]
   }
   ```

3. Si ves esto, **el backend funciona correctamente** ✅

### Verificar Frontend

1. Abre la URL del frontend en tu navegador:
   ```
   https://jefes-frontend-production-xxxx.up.railway.app
   ```

2. Deberías ver la **página de login** de la aplicación

3. Abre la **consola del navegador** (F12) y verifica que **NO haya errores de CORS**

### Probar la Conexión

1. En el frontend, intenta **hacer login** con las credenciales por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

2. Si puedes iniciar sesión correctamente, **¡todo funciona!** 🎉

---

## Solución de Problemas

### Error: "No permitido por CORS"

**Causa**: La variable `FRONTEND_URL` no está configurada correctamente en el backend.

**Solución**:
1. Ve al backend en Railway → Variables
2. Verifica que `FRONTEND_URL` tenga la URL exacta del frontend (sin / al final)
3. Espera a que el servicio se reinicie

### Error: "Failed to fetch" o "Network Error"

**Causa**: El frontend no puede conectarse al backend.

**Solución**:
1. Ve al frontend en Railway → Variables
2. Verifica que `VITE_API_URL` tenga la URL correcta del backend con `/api` al final
3. Haz un nuevo deploy del frontend (Settings → Redeploy)

### Error: "Cannot connect to database"

**Causa**: MongoDB Atlas no está configurado correctamente.

**Solución**:
1. Verifica que `MONGODB_URI` esté correcta en las variables del backend
2. En MongoDB Atlas, ve a "Network Access" y agrega `0.0.0.0/0`
3. Verifica que el usuario tenga permisos correctos

### El frontend muestra pero no carga datos

**Causa**: Variable `VITE_API_URL` incorrecta o faltante.

**Solución**:
1. Verifica que `VITE_API_URL` esté configurada en el frontend
2. Asegúrate de incluir `/api` al final de la URL
3. Redeploy el frontend después de cambiar variables

---

## Comandos Útiles (Railway CLI)

```bash
# Ver logs del backend
railway logs --service backend

# Ver logs del frontend
railway logs --service frontend

# Ver variables de entorno
railway variables

# Abrir el servicio en el navegador
railway open

# Ver estado de los servicios
railway status
```

---

## Configuración de Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En Railway, ve a **Settings** → **Networking**
2. Haz clic en **"Custom Domain"**
3. Agrega tu dominio (ejemplo: `app.miempresa.com`)
4. Configura el registro DNS según las instrucciones de Railway
5. **Actualiza** las variables de entorno:
   - `FRONTEND_URL` en el backend
   - `VITE_API_URL` en el frontend

---

## Inicializar Usuarios (Primera Vez)

Si es la primera vez que despliegas, necesitas crear el usuario administrador:

### Opción 1: Desde Railway CLI

```bash
# Conectar al servicio backend
railway link

# Ejecutar script de inicialización
railway run npm run init
```

### Opción 2: Crear manualmente en MongoDB Atlas

1. Ve a MongoDB Atlas → Collections
2. Crea un documento en la colección `users`:

```json
{
  "username": "admin",
  "email": "admin@jefes.com",
  "password": "$2a$10$hash_de_admin123",
  "rol": "admin",
  "activo": true
}
```

---

## Resumen de Variables de Entorno

### Backend
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secreto_seguro
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.up.railway.app
```

### Frontend
```bash
VITE_API_URL=https://tu-backend.up.railway.app/api
```

---

## Próximos Pasos

Una vez que todo funcione:

1. ✅ Cambia las credenciales por defecto del admin
2. ✅ Configura respaldos automáticos de MongoDB
3. ✅ Considera implementar monitoreo (Sentry, LogRocket, etc.)
4. ✅ Configura un dominio personalizado
5. ✅ Implementa un flujo de CI/CD más avanzado

---

## Soporte

Si tienes problemas:

1. Revisa los **logs en Railway** (pestaña "Deployments")
2. Verifica las **variables de entorno**
3. Consulta la [documentación de Railway](https://docs.railway.app/)
4. Revisa [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md) para más detalles

---

**¡Felicidades!** Tu aplicación Jefes-En-Frente está ahora desplegada en Railway y lista para usar. 🚀
