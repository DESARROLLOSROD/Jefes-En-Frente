# 🔐 Guía de Seguridad - Jefes En Frente

## Mejoras de Seguridad Implementadas

Este documento detalla todas las mejoras de seguridad implementadas en el proyecto Jefes-En-Frente.

---

## 📋 Índice

1. [Sistema de Autenticación Mejorado](#1-sistema-de-autenticación-mejorado)
2. [Rate Limiting](#2-rate-limiting)
3. [Validación de Inputs](#3-validación-de-inputs)
4. [Sanitización de Datos](#4-sanitización-de-datos)
5. [Headers de Seguridad](#5-headers-de-seguridad)
6. [Variables de Entorno](#6-variables-de-entorno)
7. [Checklist de Seguridad](#7-checklist-de-seguridad)

---

## 1. Sistema de Autenticación Mejorado

### 🍪 Cookies HTTP-Only

**Implementación:**
- Los tokens JWT ahora se almacenan en cookies `httpOnly` en lugar de localStorage
- Las cookies son seguras (`secure: true` en producción) y usan `sameSite: 'strict'`

**Ventajas:**
- ✅ Protección contra ataques XSS (JavaScript no puede acceder)
- ✅ Protección contra CSRF con sameSite strict
- ✅ Cookies enviadas automáticamente en cada request

**Configuración (Backend):**
```typescript
// backend/src/middleware/auth.ts
res.cookie('accessToken', token, {
  httpOnly: true,        // No accesible desde JavaScript
  secure: isProduction,  // Solo HTTPS en producción
  sameSite: 'strict',    // Protección CSRF
  maxAge: 15 * 60 * 1000 // 15 minutos
});
```

**Configuración (Frontend):**
```typescript
// frontend/src/services/api.ts
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Enviar cookies automáticamente
});
```

### 🔄 Sistema de Refresh Tokens

**Flujo de Autenticación:**

1. **Login:**
   - Usuario envía credenciales
   - Backend genera:
     - Access Token (15 minutos, cookie httpOnly)
     - Refresh Token (7 días, cookie httpOnly, almacenado en BD)
   - Ambas cookies se configuran en la respuesta

2. **Requests Normales:**
   - Frontend envía cookies automáticamente
   - Backend verifica access token desde cookie

3. **Token Expirado:**
   - Backend retorna `401` con código `TOKEN_EXPIRED`
   - Frontend intercepta automáticamente
   - Solicita nuevo access token a `/api/auth/refresh`
   - Reinténta el request original

4. **Logout:**
   - Revoca refresh token en BD
   - Limpia todas las cookies

**Modelo de Refresh Token:**
```typescript
// backend/src/models/RefreshToken.ts
{
  userId: ObjectId,
  token: string (unique),
  expiresAt: Date,
  isRevoked: boolean,
  deviceInfo: string
}
```

**Endpoints:**
- `POST /api/auth/login` - Login y generación de tokens
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Revocar tokens y logout

**Características de Seguridad:**
- ✅ Tokens únicos generados con crypto.randomBytes(64)
- ✅ Revocación de tokens (logout, cambio de password)
- ✅ Auto-limpieza de tokens expirados (MongoDB TTL index)
- ✅ Rastreo de dispositivo (user-agent)

---

## 2. Rate Limiting

### 📊 Limitadores Configurados

**Login (Más Restrictivo):**
```typescript
// backend/src/middleware/rateLimiter.ts
loginLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                     // máximo 5 intentos
  message: 'Demasiados intentos de login'
}
```

**Creación de Recursos:**
```typescript
createLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 30,                    // máximo 30 creaciones
}
```

**APIs Generales:**
```typescript
apiLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // máximo 100 requests
}
```

**Lectura:**
```typescript
readLimiter: {
  windowMs: 1 * 60 * 1000,   // 1 minuto
  max: 60,                    // máximo 60 requests
}
```

### Aplicación de Limitadores

```typescript
// En rutas específicas
router.post('/login', loginLimiter, validateLogin, ...);
router.post('/reportes', createLimiter, ...);

// Global
app.use('/api/', apiLimiter);
```

**Ventajas:**
- ✅ Protección contra fuerza bruta
- ✅ Prevención de DDoS
- ✅ Control de uso de recursos
- ✅ Headers informativos (RateLimit-*)

---

## 3. Validación de Inputs

### 📝 Validadores Implementados

Usando `express-validator` para validación robusta:

**Validación de Login:**
```typescript
// backend/src/middleware/validators.ts
export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }),
  body('password')
    .isString()
    .isLength({ min: 6, max: 100 })
    .trim(),
  handleValidationErrors
];
```

**Validación de Usuario:**
```typescript
export const validateCreateUser = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  body('email')
    .isEmail()
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 100 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('Debe contener mayúscula, minúscula y número'),
  body('rol')
    .isIn(['admin', 'supervisor', 'jefe en frente', 'operador']),
  // ...
];
```

**Validación de Proyectos:**
```typescript
export const validateCreateProject = [
  body('nombre')
    .isLength({ min: 2, max: 200 })
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/),
  body('mapa.imagen')
    .optional()
    .custom((value) => {
      // Validar formato base64
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      if (!base64Regex.test(value)) {
        throw new Error('Formato de imagen inválido');
      }
      // Limitar tamaño (~5MB)
      if (value.length > 7000000) {
        throw new Error('Imagen demasiado grande');
      }
      return true;
    }),
  // ...
];
```

**Validadores Disponibles:**
- `validateLogin` - Autenticación
- `validateCreateUser` / `validateUpdateUser` - Usuarios
- `validateCreateProject` - Proyectos
- `validateCreateVehicle` - Vehículos
- `validateCreateReport` - Reportes
- `validateCreateWorkZone` - Zonas de trabajo
- `validateMongoId` - IDs de MongoDB
- `validateQueryParams` - Query parameters

**Características:**
- ✅ Validación de tipos
- ✅ Sanitización automática (trim, normalizeEmail)
- ✅ Límites de longitud
- ✅ Regex para patrones específicos
- ✅ Mensajes de error descriptivos
- ✅ Validación de MongoIDs
- ✅ Límites en arrays y tamaños

---

## 4. Sanitización de Datos

### 🧹 Middleware de Sanitización

**Prevención de XSS:**
```typescript
// backend/src/middleware/sanitizer.ts
import DOMPurify from 'isomorphic-dompurify';

const sanitizeString = (str: string): string => {
  // Remover caracteres nulos
  str = str.replace(/\0/g, '');

  // Sanitizar HTML (remover tags, mantener contenido)
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};
```

**Sanitización de Imágenes Base64:**
```typescript
const sanitizeBase64Image = (base64: string): string | null => {
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
  const match = base64.match(base64Regex);

  if (!match) return null;

  // Validar contenido base64
  try {
    Buffer.from(match[2], 'base64');
    return base64;
  } catch (e) {
    return null;
  }
};
```

**Prevención de Inyección NoSQL:**
```typescript
export const preventInjection = (req, res, next) => {
  const checkInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      // Detectar operadores MongoDB y patrones peligrosos
      const patterns = [
        /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex)/i,
        /(javascript:|<script|onerror=|onload=)/i,
      ];
      return patterns.some(pattern => pattern.test(obj));
    }

    // Detectar operadores en keys
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) return true;
      }
    }

    return false;
  };

  if (checkInjection(req.body) || checkInjection(req.query)) {
    return res.status(400).json({
      error: 'Datos potencialmente peligrosos detectados'
    });
  }

  next();
};
```

**Aplicación:**
```typescript
// En server.ts
app.use(preventInjection);
app.use(sanitizeInput);
```

**Protege Contra:**
- ✅ XSS (Cross-Site Scripting)
- ✅ Inyección NoSQL
- ✅ Inyección de operadores MongoDB
- ✅ Caracteres nulos y de control
- ✅ HTML malicioso
- ✅ JavaScript embebido

---

## 5. Headers de Seguridad

### 🛡️ Helmet.js

**Configuración:**
```typescript
// backend/src/server.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // Configurar según necesidad
  crossOriginEmbedderPolicy: false
}));
```

**Headers Configurados por Helmet:**
- `X-DNS-Prefetch-Control: off`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `X-Download-Options: noopen`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 0` (navegadores modernos)

**CORS Seguro:**
```typescript
const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === 'production') {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    } else {
      callback(null, true); // Permisivo en desarrollo
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
```

---

## 6. Variables de Entorno

### 🔑 Variables Requeridas

**Backend (.env):**
```env
# Base de Datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/jefes-en-frente

# Seguridad JWT
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres
REFRESH_SECRET=otro_secreto_diferente_para_refresh_tokens

# Configuración
PORT=5000
NODE_ENV=production

# Frontend (CORS)
FRONTEND_URL=https://tu-frontend.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://tu-backend.com/api
```

**Mejores Prácticas:**
- ✅ Usar secrets fuertes (mínimo 32 caracteres)
- ✅ Diferentes secrets para access y refresh tokens
- ✅ No commitear archivos .env al repositorio
- ✅ Usar variables de entorno en plataformas de deploy
- ✅ Rotar secrets periódicamente

---

## 7. Checklist de Seguridad

### ✅ Autenticación y Autorización

- [x] Tokens JWT almacenados en cookies httpOnly
- [x] Cookies con flags secure (HTTPS) y sameSite
- [x] Sistema de refresh tokens implementado
- [x] Revocación de tokens en logout
- [x] Verificación de rol en endpoints protegidos
- [x] Access tokens de corta duración (15 min)
- [x] Refresh tokens de larga duración (7 días)
- [x] Auto-refresh transparente en frontend

### ✅ Protección de Datos

- [x] Sanitización de todos los inputs
- [x] Validación robusta con express-validator
- [x] Prevención de inyección NoSQL
- [x] Protección XSS con DOMPurify
- [x] Validación de imágenes base64
- [x] Límites de tamaño en uploads

### ✅ Rate Limiting

- [x] Rate limiting en login (5 intentos / 15 min)
- [x] Rate limiting en creación de recursos
- [x] Rate limiting global en API
- [x] Headers informativos de rate limit

### ✅ Headers y CORS

- [x] Helmet.js configurado
- [x] CORS restrictivo en producción
- [x] CORS permisivo en desarrollo
- [x] Credentials habilitados para cookies

### ✅ Password Security

- [x] Bcrypt para hash de passwords (12 rounds)
- [x] Validación de complejidad de passwords
- [x] No exposición de passwords en responses
- [x] Mensajes genéricos en errores de login

### ✅ Base de Datos

- [x] MongoDB con autenticación
- [x] Conexión segura con MongoDB Atlas
- [x] Índices en campos sensibles
- [x] TTL index para refresh tokens expirados

### ✅ Monitoreo y Logs

- [x] Logs de intentos de login
- [x] Logs de errores de autenticación
- [x] Información de dispositivo en refresh tokens
- [ ] Sistema de alertas (pendiente)
- [ ] Logs centralizados (pendiente)

---

## 📚 Recursos Adicionales

### Documentación

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

### Herramientas de Testing

```bash
# Instalar herramientas de seguridad
npm audit                    # Auditoría de dependencias
npm audit fix               # Corregir vulnerabilidades

# Análisis de código
npm install -g snyk
snyk test                   # Escaneo de vulnerabilidades

# Testing de APIs
npm install -g newman       # CLI para Postman
```

### Comandos Útiles

```bash
# Backend - Desarrollo
cd backend
npm run dev

# Backend - Producción
npm run build
npm start

# Frontend - Desarrollo
cd frontend
npm run dev

# Frontend - Producción
npm run build
npm run preview
```

---

## 🚨 En Caso de Incidente de Seguridad

1. **Revocar Todos los Tokens:**
   ```typescript
   // En MongoDB
   db.refreshtokens.updateMany({}, { $set: { isRevoked: true } });
   ```

2. **Rotar Secrets:**
   - Generar nuevos JWT_SECRET y REFRESH_SECRET
   - Actualizar variables de entorno
   - Reiniciar servidor

3. **Investigar:**
   - Revisar logs de acceso
   - Identificar IPs sospechosas
   - Verificar integridad de datos

4. **Notificar:**
   - Informar a usuarios afectados
   - Documentar el incidente
   - Implementar medidas correctivas

---

## 📞 Contacto

Para reportar vulnerabilidades de seguridad, contactar al equipo de desarrollo.

**Última actualización:** Diciembre 2024
**Versión del Sistema:** 2.0
