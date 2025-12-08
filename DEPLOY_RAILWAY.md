# Guía de Despliegue en Railway

Esta guía te llevará paso a paso para desplegar **Jefes-En-Frente** en Railway, tanto el backend como el frontend.

## Índice
1. [Preparación](#preparación)
2. [Configuración de MongoDB Atlas](#configuración-de-mongodb-atlas)
3. [Deploy del Backend](#deploy-del-backend)
4. [Deploy del Frontend](#deploy-del-frontend)
5. [Configuración Final](#configuración-final)
6. [Verificación](#verificación)
7. [Solución de Problemas](#solución-de-problemas)

---

## Preparación

### 1. Crear cuenta en Railway

1. Ve a [Railway.app](https://railway.app/)
2. Haz clic en "Start a New Project" o "Login with GitHub"
3. Autoriza Railway para acceder a tu cuenta de GitHub

### 2. Instalar Railway CLI (Opcional pero recomendado)

```bash
npm install -g @railway/cli
```

Luego inicia sesión:

```bash
railway login
```

---

## Configuración de MongoDB Atlas

Si aún no tienes una base de datos MongoDB en la nube:

### 1. Crear cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (el tier gratuito es suficiente)

### 2. Configurar acceso

1. En "Database Access", crea un usuario con permisos de lectura/escritura
2. En "Network Access", agrega `0.0.0.0/0` para permitir conexiones desde cualquier IP
3. Obtén tu connection string desde "Connect" → "Connect your application"

Debería verse así:
```
mongodb+srv://usuario:password@cluster.mongodb.net/jefes-en-frente?retryWrites=true&w=majority
```

---

## Deploy del Backend

### Opción A: Deploy con CLI de Railway

1. Navega al directorio del backend:
```bash
cd backend
```

2. Inicializa un nuevo proyecto en Railway:
```bash
railway init
```

3. Selecciona "Create new project" y dale un nombre (ej: `jefes-backend`)

4. Agrega las variables de entorno:
```bash
railway variables set MONGODB_URI="tu_connection_string_de_mongodb"
railway variables set JWT_SECRET="tu_secreto_super_seguro_cambiar_en_produccion"
railway variables set NODE_ENV="production"
```

5. Despliega:
```bash
railway up
```

6. Obtén la URL pública:
```bash
railway domain
```

Si no tiene dominio, créalo:
```bash
railway domain create
```

Guarda esta URL, la necesitarás para configurar el frontend.

### Opción B: Deploy desde GitHub (Recomendado)

1. Sube tu código a GitHub si aún no lo has hecho

2. En Railway Dashboard:
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio `Jefes-En-Frente`
   - Railway detectará que tienes múltiples servicios

3. Configura el servicio del backend:
   - Haz clic en "Add service"
   - Selecciona "GitHub Repo"
   - En "Root Directory", escribe: `backend`
   - En "Service Name", escribe: `jefes-backend`

4. Configurar variables de entorno:
   - Ve a la pestaña "Variables"
   - Agrega las siguientes variables:
     ```
     MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/jefes-en-frente
     JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
     NODE_ENV=production
     PORT=5000
     ```

5. Generar dominio público:
   - Ve a "Settings" → "Networking"
   - Haz clic en "Generate Domain"
   - Guarda la URL (ej: `jefes-backend.up.railway.app`)

---

## Deploy del Frontend

### Opción A: Deploy con CLI de Railway

1. Navega al directorio del frontend:
```bash
cd ../frontend
```

2. Instala serve (si no lo has hecho):
```bash
npm install
```

3. Crea un archivo `.env` con la URL del backend:
```bash
echo "VITE_API_URL=https://jefes-backend.up.railway.app/api" > .env
```

4. Inicializa Railway:
```bash
railway init
```

5. Selecciona "Link to existing project" y elige el proyecto que creaste antes

6. Crea un nuevo servicio:
```bash
railway service create
```

Nombra el servicio como `jefes-frontend`

7. Agrega la variable de entorno:
```bash
railway variables set VITE_API_URL="https://jefes-backend.up.railway.app/api"
```

8. Despliega:
```bash
railway up
```

9. Genera dominio:
```bash
railway domain create
```

### Opción B: Deploy desde GitHub (Recomendado)

1. En el mismo proyecto de Railway:
   - Haz clic en "New Service"
   - Selecciona "GitHub Repo"
   - Selecciona el mismo repositorio
   - En "Root Directory", escribe: `frontend`
   - En "Service Name", escribe: `jefes-frontend`

2. Configurar variables de entorno:
   - Ve a la pestaña "Variables"
   - Agrega:
     ```
     VITE_API_URL=https://jefes-backend.up.railway.app/api
     ```
   - Reemplaza la URL con la URL real de tu backend

3. Generar dominio público:
   - Ve a "Settings" → "Networking"
   - Haz clic en "Generate Domain"
   - Guarda la URL (ej: `jefes-frontend.up.railway.app`)

---

## Configuración Final

### 1. Actualizar CORS en el Backend

Ahora que tienes la URL del frontend, debes actualizar las variables de entorno del backend:

1. Ve al servicio `jefes-backend` en Railway
2. En "Variables", agrega:
   ```
   FRONTEND_URL=https://jefes-frontend.up.railway.app
   ```
3. El servicio se reiniciará automáticamente

### 2. Verificar la conexión

1. Abre la URL del frontend en tu navegador
2. Intenta hacer login con las credenciales por defecto:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## Verificación

### Verificar Backend

Visita la URL de tu backend (ej: `https://jefes-backend.up.railway.app`), deberías ver:

```json
{
  "message": "🚀 API Jefes en Frente funcionando!",
  "version": "2.0",
  "features": ["Autenticación JWT", "Múltiples Proyectos", "Gestión de Usuarios"]
}
```

### Verificar Frontend

1. Visita la URL del frontend
2. Deberías ver la página de login
3. Intenta iniciar sesión
4. Verifica que puedas crear reportes y ver proyectos

### Verificar Logs

Para ver los logs de cada servicio en Railway:

```bash
# Ver logs del backend
railway logs --service jefes-backend

# Ver logs del frontend
railway logs --service jefes-frontend
```

O desde el Dashboard:
- Ve al servicio
- Haz clic en "Deployments"
- Haz clic en el deployment activo
- Ve a la pestaña "Logs"

---

## Solución de Problemas

### Error: "No permitido por CORS"

**Causa**: La URL del frontend no está configurada en el backend.

**Solución**:
1. Ve a las variables de entorno del backend en Railway
2. Agrega o actualiza `FRONTEND_URL` con la URL exacta de tu frontend
3. Espera a que el servicio se reinicie

### Error: "Cannot connect to database"

**Causa**: El connection string de MongoDB es incorrecto o la IP de Railway no está permitida.

**Solución**:
1. Verifica que `MONGODB_URI` esté configurada correctamente
2. En MongoDB Atlas, asegúrate de tener `0.0.0.0/0` en Network Access
3. Verifica que el usuario de la base de datos tenga los permisos correctos

### Error: "Build failed" o "tsc: Permission denied"

**Causa**: Problemas con permisos de binarios npm o configuración de Nixpacks.

**Solución** (Ya implementada en el proyecto):
El proyecto está configurado para usar Dockerfile en lugar de Nixpacks, lo que soluciona los problemas de permisos.

Si aún tienes problemas:
1. Verifica que el archivo `backend/railway.json` tenga `"builder": "DOCKERFILE"`
2. Verifica que el `Dockerfile` exista en `backend/Dockerfile`
3. Revisa los logs del deployment para ver el error específico

**Solución alternativa** (si quieres usar Nixpacks):
1. Elimina el `backend/railway.json`
2. Usa el archivo `backend/nixpacks.toml` que está configurado correctamente
3. O cambia el `startCommand` en railway.json a: `"npx tsc && node dist/server.js"`

### Frontend no se conecta al Backend

**Causa**: La variable `VITE_API_URL` no está configurada correctamente.

**Solución**:
1. Verifica que `VITE_API_URL` en las variables de Railway apunte a la URL correcta del backend
2. Recuerda incluir `/api` al final: `https://jefes-backend.up.railway.app/api`
3. Haz un nuevo deploy después de cambiar variables de entorno

### El servicio se cae constantemente

**Causa**: Posible error en el código o falta de recursos.

**Solución**:
1. Revisa los logs para ver el error específico
2. Verifica que `PORT` esté configurada como variable de entorno si Railway la requiere
3. Asegúrate de que el `startCommand` en `railway.json` sea correcto

---

## Comandos Útiles de Railway CLI

```bash
# Ver estado de los servicios
railway status

# Ver variables de entorno
railway variables

# Ver logs en tiempo real
railway logs

# Abrir el servicio en el navegador
railway open

# Conectarse a la base de datos (si usas Railway PostgreSQL)
railway connect

# Desplegar cambios
railway up

# Revertir a un deployment anterior
railway rollback
```

---

## Monitoreo y Mantenimiento

### Ver métricas

1. Ve al Dashboard de Railway
2. Selecciona tu proyecto
3. Haz clic en cada servicio para ver:
   - CPU usage
   - Memory usage
   - Network traffic
   - Deployment history

### Auto-deploys

Railway puede configurarse para auto-deployar cuando haces push a GitHub:

1. Ve a "Settings" del servicio
2. En "Deploy Triggers", asegúrate de que "Watch Paths" esté configurado correctamente
3. Para backend: `backend/**`
4. Para frontend: `frontend/**`

---

## Costos

Railway ofrece:
- **Hobby Plan**: $5 USD de crédito gratis al mes
- **Developer Plan**: $5 USD/mes + uso adicional

Para este proyecto básico, el plan Hobby debería ser suficiente para desarrollo y pruebas.

---

## Recursos Adicionales

- [Documentación oficial de Railway](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Railway Community](https://discord.gg/railway)
- [Guía de Variables de Entorno](https://docs.railway.app/develop/variables)

---

## Próximos Pasos

Una vez desplegado:

1. Configura un dominio personalizado (opcional)
2. Configura respaldos automáticos de MongoDB
3. Implementa monitoreo con herramientas como Sentry
4. Configura CI/CD más avanzado si es necesario

---

**¡Felicidades!** Tu aplicación Jefes-En-Frente ahora está desplegada en Railway. 🚀
