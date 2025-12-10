# 🔄 Guía de Migración de Seguridad

## Migración del Sistema de Autenticación Antiguo al Nuevo

Esta guía te ayudará a migrar del sistema antiguo (localStorage + tokens de 24h) al nuevo sistema seguro (cookies httpOnly + refresh tokens).

---

## 📋 Resumen de Cambios

### Antes (Sistema Antiguo)
- ❌ Tokens en localStorage (vulnerable a XSS)
- ❌ Tokens de larga duración (24 horas)
- ❌ Sin refresh tokens
- ❌ Sin rate limiting
- ❌ Sin validación robusta de inputs
- ❌ Sin sanitización de datos

### Después (Sistema Nuevo)
- ✅ Tokens en cookies httpOnly (seguro)
- ✅ Access tokens de corta duración (15 minutos)
- ✅ Refresh tokens (7 días)
- ✅ Rate limiting en todos los endpoints
- ✅ Validación robusta con express-validator
- ✅ Sanitización completa de inputs

---

## 🚀 Pasos de Migración

### Paso 1: Actualizar Dependencias del Backend

```bash
cd backend
npm install cookie-parser express-rate-limit express-validator helmet isomorphic-dompurify @types/cookie-parser
```

### Paso 2: Actualizar Variables de Entorno

Edita tu archivo `backend/.env`:

```env
# Agregar nueva variable para refresh tokens
REFRESH_SECRET=tu_secreto_refresh_diferente_al_jwt_secret

# Asegurarse de tener
JWT_SECRET=tu_secreto_super_seguro
MONGODB_URI=mongodb+srv://...
NODE_ENV=production  # o development
FRONTEND_URL=https://tu-frontend.com
```

### Paso 3: Ejecutar Migraciones de Base de Datos

El nuevo modelo de RefreshToken se creará automáticamente al iniciar el servidor. No requiere migración manual.

```bash
# Iniciar el servidor backend
npm run dev
```

El servidor creará automáticamente:
- Colección `refreshtokens`
- Índices necesarios

### Paso 4: Actualizar Frontend

No hay cambios necesarios en el código del frontend. El sistema es **100% compatible hacia atrás**:

- ✅ Las cookies se configuran automáticamente en login
- ✅ El frontend sigue funcionando con `localStorage` como fallback
- ✅ El auto-refresh es transparente para el usuario

```bash
cd frontend
# No se requieren cambios de código
npm run dev
```

---

## 🔄 Compatibilidad Hacia Atrás

El nuevo sistema mantiene **compatibilidad completa** con clientes antiguos:

### Para Clientes Web (Frontend React)
1. Login retorna tanto cookie como token en JSON
2. Axios automáticamente usa cookies si están disponibles
3. Si las cookies fallan, usa el header Authorization como fallback

### Para Clientes Móviles (React Native)
- El token sigue retornándose en el JSON response
- Pueden seguir usando `Authorization: Bearer <token>`
- La migración a cookies es opcional

---

## 🧪 Testing de la Migración

### 1. Probar Login

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Prueba:
1. Abrir http://localhost:5173
2. Login con credenciales de prueba
3. Verificar en DevTools > Application > Cookies:
   - `accessToken` (httpOnly, 15 min)
   - `refreshToken` (httpOnly, 7 días)

### 2. Probar Auto-Refresh

1. Hacer login
2. Esperar 15 minutos (o modificar expiración a 1 min para testing)
3. Hacer una operación (crear reporte, etc.)
4. Verificar en Network tab:
   - Request original falla con 401 TOKEN_EXPIRED
   - Request automático a `/auth/refresh`
   - Request original se reintenta con éxito

### 3. Probar Rate Limiting

```bash
# Intentar login 6 veces seguidas con password incorrecta
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```

Después de 5 intentos, debería retornar:
```json
{
  "success": false,
  "error": "Demasiados intentos de login. Por favor intente más tarde."
}
```

### 4. Probar Validación de Inputs

```bash
# Email inválido
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"test123"}'

# Debería retornar error de validación
```

---

## 📊 Monitoreo Post-Migración

### Verificar Logs del Backend

```bash
cd backend
npm run dev
```

Buscar estos mensajes:
- ✅ "CORS Config loaded"
- ✅ "Conectado a MongoDB Atlas"
- ✅ "Servidor corriendo"

### Verificar Cookies en el Navegador

1. Login en la aplicación
2. DevTools > Application > Cookies > http://localhost:5173
3. Verificar:
   - `accessToken`: HttpOnly ✓, Secure (en prod), SameSite: Strict
   - `refreshToken`: HttpOnly ✓, Secure (en prod), SameSite: Strict

### Verificar Refresh Tokens en MongoDB

```bash
# Conectar a MongoDB
mongosh "tu-connection-string"

# Ver refresh tokens
use jefes-en-frente
db.refreshtokens.find().pretty()
```

Debería mostrar:
```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "token": "abc123...",
  "expiresAt": ISODate("2024-12-17T..."),
  "isRevoked": false,
  "deviceInfo": "Mozilla/5.0...",
  "createdAt": ISODate("2024-12-10T...")
}
```

---

## 🔧 Troubleshooting

### Problema: Las cookies no se están configurando

**Solución:**
1. Verificar que `withCredentials: true` esté en axios:
   ```typescript
   // frontend/src/services/api.ts
   withCredentials: true
   ```

2. Verificar CORS en backend:
   ```typescript
   // backend/src/server.ts
   credentials: true
   ```

3. En desarrollo, asegúrate de que frontend y backend estén en el mismo dominio o:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   (No usar 127.0.0.1 mezclado con localhost)

### Problema: Error "No permitido por CORS"

**Solución:**
```typescript
// backend/src/server.ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);
```

Asegúrate de que tu URL de frontend esté en la lista.

### Problema: Refresh token no funciona

**Verificar:**
1. MongoDB está accesible
2. La colección `refreshtokens` existe
3. El token no está revocado ni expirado
4. Las cookies se envían en el request a `/auth/refresh`

**Debug:**
```javascript
// En el interceptor de axios (frontend)
console.log('Refresh token cookie:', document.cookie);
```

### Problema: Rate limiting muy agresivo en desarrollo

**Solución temporal:**
```typescript
// backend/src/middleware/rateLimiter.ts
// Aumentar límites en desarrollo
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 5,
  // ...
});
```

---

## 🔐 Seguridad en Producción

### Checklist Pre-Deployment

- [ ] `NODE_ENV=production` configurado
- [ ] HTTPS configurado (certificado SSL válido)
- [ ] `JWT_SECRET` es fuerte (mínimo 32 caracteres random)
- [ ] `REFRESH_SECRET` es diferente de JWT_SECRET
- [ ] `FRONTEND_URL` apunta al dominio correcto
- [ ] MongoDB tiene autenticación habilitada
- [ ] Firewall configurado (solo puertos necesarios abiertos)
- [ ] Rate limiting en valores de producción
- [ ] Logs configurados y monitoreados
- [ ] Backup de base de datos configurado

### Variables de Entorno - Producción

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod-user:strong-password@cluster.mongodb.net/jefes-prod
JWT_SECRET=super-secret-at-least-32-characters-long-random-string
REFRESH_SECRET=different-super-secret-for-refresh-tokens-random
FRONTEND_URL=https://jefes-en-frente.com
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.jefes-en-frente.com/api
```

### Configuración de Cookies en Producción

Las cookies automáticamente usarán:
- `secure: true` (solo HTTPS)
- `sameSite: 'strict'`
- `httpOnly: true`

**No se requiere configuración adicional** si `NODE_ENV=production`.

---

## 📈 Rollback Plan

Si necesitas revertir los cambios:

### Opción 1: Mantener compatibilidad (Recomendado)

El sistema nuevo es compatible con el antiguo. Los clientes pueden seguir usando tokens en headers.

### Opción 2: Revertir completamente

```bash
# Backend
cd backend
git checkout <commit-anterior>
npm install
npm run dev

# Frontend
cd frontend
git checkout <commit-anterior>
npm install
npm run dev
```

---

## 🎓 Educación del Usuario

### Para Usuarios Finales

**No se requiere ninguna acción.** Los cambios son transparentes:
- Login funciona igual
- La sesión se renueva automáticamente
- Mejor seguridad sin cambios visibles

### Para Desarrolladores

**Nuevos endpoints disponibles:**
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Logout y revocación de tokens

**Nuevos comportamientos:**
- Tokens expiran en 15 minutos (vs 24 horas)
- Auto-refresh transparente
- Rate limiting activo
- Validación estricta de inputs

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisar logs del backend: `npm run dev`
2. Revisar consola del navegador (F12)
3. Verificar variables de entorno
4. Consultar [SEGURIDAD.md](./SEGURIDAD.md) para detalles

---

## ✅ Verificación Final

Después de la migración, verifica:

- [ ] Login funciona correctamente
- [ ] Cookies se configuran (DevTools > Application)
- [ ] Refresh automático funciona (esperar 15 min o forzar)
- [ ] Rate limiting está activo (intentar 6 logins)
- [ ] Validación rechaza inputs inválidos
- [ ] Logout limpia cookies
- [ ] MongoDB tiene colección `refreshtokens`
- [ ] Logs muestran actividad normal

**¡Migración Completada! 🎉**

---

**Última actualización:** Diciembre 2024
**Versión:** 2.0 con mejoras de seguridad
