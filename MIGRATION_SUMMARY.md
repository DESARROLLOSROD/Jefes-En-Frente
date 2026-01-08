# Resumen de Migración: MongoDB → Supabase

## ✅ Estado: Migración de Código Completada

La migración del código del backend de **Jefes en Frente** de MongoDB a Supabase PostgreSQL ha sido completada exitosamente.

---

## 📊 Trabajo Completado

### 1. ✅ Esquema de Base de Datos
**Archivo:** `backend/supabase_schema.sql`

- 16+ tablas creadas con tipos de datos correctos
- Índices para optimización de queries
- Row Level Security (RLS) policies completas
- Triggers para actualización automática de timestamps
- Trigger para creación automática de perfiles al registrar usuarios

### 2. ✅ Configuración de Supabase
**Archivo:** `backend/src/config/supabase.ts`

- Cliente Supabase singleton configurado
- Soporte para admin y cliente regular
- Persistencia de sesión deshabilitada (server-side)

### 3. ✅ Tipos TypeScript
**Archivo:** `backend/src/types/database.types.ts`

- Interfaces completas para todas las tablas
- Tipos para relaciones y joins
- Tipos para inputs/outputs de operaciones CRUD

### 4. ✅ Capa de Servicios

Se crearon 5 servicios completos:

#### `backend/src/services/proyectos.service.ts`
- CRUD completo de proyectos
- Manejo de mapas con imágenes base64
- Soft delete

#### `backend/src/services/usuarios.service.ts`
- Gestión de perfiles de usuario
- Asignación de proyectos a usuarios
- Integración con Supabase Auth

#### `backend/src/services/vehiculos.service.ts`
- CRUD de vehículos
- Actualización de horómetros
- Relación many-to-many con proyectos

#### `backend/src/services/reportes.service.ts` (MÁS COMPLEJO)
- Creación de reportes con nested data (acarreo, material, agua, maquinaria)
- Idempotencia con `offline_id`
- Historial de modificaciones con tracking de cambios
- Estadísticas y agregaciones
- Actualización automática de horómetros de vehículos

#### `backend/src/services/catalogos.service.ts`
- Servicio genérico para todos los catálogos
- Servicios específicos para: materiales, orígenes, destinos, capacidades, tipos de vehículo

### 5. ✅ Middleware de Autenticación
**Archivo:** `backend/src/middleware/auth.ts`

- Migrado de JWT custom a Supabase Auth
- Verificación de tokens con `supabase.auth.getUser()`
- Carga de perfiles y proyectos del usuario
- Eliminadas funciones de generación de tokens (ahora Supabase lo maneja)

### 6. ✅ Rutas Actualizadas

Todas las rutas migradas a usar servicios de Supabase:

- ✅ `backend/src/routes/auth.ts` - Login, logout, refresh con Supabase Auth
- ✅ `backend/src/routes/reportes.ts` - CRUD de reportes con servicios
- ✅ `backend/src/routes/usuarios.ts` - Gestión de usuarios con Supabase Auth Admin API
- ✅ `backend/src/routes/proyectos.ts` - CRUD de proyectos
- ✅ `backend/src/routes/vehiculos.ts` - CRUD de vehículos
- ✅ `backend/src/routes/materiales.ts` - Catálogo de materiales
- ✅ `backend/src/routes/capacidades.ts` - Catálogo de capacidades
- ✅ `backend/src/routes/origenes.ts` - Catálogo de orígenes
- ✅ `backend/src/routes/destinos.ts` - Catálogo de destinos
- ✅ `backend/src/routes/tiposVehiculo.ts` - Catálogo de tipos de vehículo

### 7. ✅ Server Principal
**Archivo:** `backend/src/server.ts`

- Eliminada conexión a MongoDB
- Agregada verificación de variables de Supabase
- Actualizada versión a 3.0
- Actualizada lista de features

### 8. ✅ Scripts de Migración

#### `backend/src/scripts/migrateUsersToAuth.ts`
- Migra usuarios de MongoDB a Supabase Auth
- Genera passwords temporales
- Crea perfiles en tabla `perfiles`
- Asigna proyectos a usuarios
- Exporta passwords a `temp_passwords.txt`

#### `backend/src/scripts/migrateDataComplete.ts`
- Migración completa de datos en orden correcto
- Proyectos con mapas
- Vehículos con relaciones
- Todos los catálogos
- Reportes con todas las sub-tablas
- Logging detallado con resumen final

### 9. ✅ Documentación
**Archivo:** `MIGRATION_GUIDE.md`

- Guía completa paso a paso
- Pre-requisitos detallados
- Instrucciones de cada paso
- Verificación post-migración
- Troubleshooting común
- Plan de rollback

---

## 📋 Próximos Pasos

### Paso 1: Configurar Supabase (SI NO LO HAS HECHO)

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto (o usa el existente)
3. Ve a **Settings → API** y copia:
   - Project URL
   - anon/public key
   - service_role key (secret)

### Paso 2: Agregar Variables de Entorno

Edita `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MongoDB (mantener temporalmente para migración)
MONGODB_URI=mongodb+srv://...
```

### Paso 3: Ejecutar Schema SQL

1. Abre Supabase Dashboard → **SQL Editor**
2. Crea una nueva query
3. Copia todo el contenido de `backend/supabase_schema.sql`
4. Pega y ejecuta
5. Verifica que no haya errores

### Paso 4: Instalar Dependencias (si es necesario)

```bash
cd backend
npm install
```

### Paso 5: Compilar y Verificar

```bash
npm run build
```

Si hay errores de TypeScript, revísalos antes de continuar.

### Paso 6: Migrar Usuarios

```bash
npx tsx src/scripts/migrateUsersToAuth.ts
```

**IMPORTANTE:**
- Revisa el archivo `temp_passwords.txt` generado
- Envía los passwords a los usuarios
- Elimina el archivo después

### Paso 7: Migrar Datos

```bash
npx tsx src/scripts/migrateDataComplete.ts
```

Observa el progreso y el resumen al final.

### Paso 8: Iniciar Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Cliente Supabase configurado correctamente
📍 Supabase URL: https://...
🎯 Servidor corriendo...
```

### Paso 9: Probar Login

Usa Postman/Thunder Client:

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password_temporal_del_archivo"
}
```

### Paso 10: Verificar Datos

En Supabase Dashboard → **Table Editor**, verifica que los datos se migraron:

- Proyectos
- Perfiles
- Vehículos
- Reportes
- Catálogos

---

## 🔍 Cambios Clave para el Frontend

Si tienes un frontend conectado, necesitarás hacer estos ajustes:

### 1. IDs: ObjectId → UUID

```typescript
// Antes
const reporteId = "507f1f77bcf86cd799439011"; // MongoDB ObjectId

// Después
const reporteId = "550e8400-e29b-41d4-a716-446655440000"; // UUID
```

### 2. Estructura de Campos

```typescript
// Antes (MongoDB - snake_case en frontend, camelCase en backend)
{
  _id: "...",
  usuarioId: "...",
  proyectoId: "...",
  noEconomico: "V-001"
}

// Después (Supabase - snake_case consistente)
{
  id: "...",
  usuario_id: "...",
  proyecto_id: "...",
  no_economico: "V-001"
}
```

### 3. Respuestas de API

El formato de respuesta se mantiene igual:

```typescript
{
  success: true,
  data: { ... }
}
```

Pero los datos dentro pueden tener campos renombrados.

### 4. Login

El flujo de login no cambia desde el frontend:

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
// data.token - guardar en localStorage
// data.user - información del usuario
```

---

## 📈 Mejoras Obtenidas

### Seguridad
- ✅ Row Level Security (RLS) en base de datos
- ✅ Supabase Auth manejando tokens de forma segura
- ✅ Políticas de acceso granulares
- ✅ CSRF protection incluido

### Performance
- ✅ Índices optimizados para queries frecuentes
- ✅ Queries SQL optimizados vs agregaciones de MongoDB
- ✅ Conexión pooling nativa de PostgreSQL

### Escalabilidad
- ✅ Base de datos relacional más fácil de escalar verticalmente
- ✅ Supabase maneja conexiones y caché
- ✅ Real-time subscriptions disponibles (si se necesita)

### Mantenibilidad
- ✅ Tipos TypeScript fuertes desde el schema
- ✅ Capa de servicios clara y testeable
- ✅ Separación de responsabilidades

### Features Nuevas Disponibles
- ✅ Supabase Storage (para archivos grandes)
- ✅ Real-time subscriptions
- ✅ Edge Functions
- ✅ Dashboard de administración visual

---

## ⚠️ Consideraciones Importantes

### 1. Passwords Temporales
Todos los usuarios migrados tienen passwords temporales. Debes:
- Notificar a los usuarios
- Implementar flujo de "cambio de password obligatorio" en el primer login
- O permitir reset de password

### 2. MongoDB Aún Activo
Durante la migración, MongoDB sigue activo. Una vez verificado que todo funciona:
- Puedes desactivar MongoDB
- Mantén un backup por al menos 30 días

### 3. IDs Diferentes
Los UUIDs de Supabase son diferentes a los ObjectIDs de MongoDB. Si el frontend tiene IDs hardcodeados, deberán actualizarse.

### 4. Rate Limiting
Supabase tiene límites en el plan gratuito:
- 500 MB de base de datos
- 1 GB de file storage
- 2 GB de bandwidth
- 50,000 monthly active users

Si excedes estos límites, considera el plan Pro.

---

## 🆘 Soporte

### Si Encuentras Problemas

1. **Revisa los logs:** `npm run dev` muestra errores en tiempo real
2. **Supabase Logs:** Dashboard → Logs → API/Postgres
3. **Documentación:** [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
4. **Supabase Docs:** https://supabase.com/docs

### Errores Comunes

#### "SUPABASE_URL no está configurada"
- Verifica que `.env` tiene las variables correctas
- Reinicia el servidor después de cambiar `.env`

#### "Usuario no encontrado"
- El usuario no se migró a Supabase Auth
- Re-ejecuta `migrateUsersToAuth.ts`

#### "Foreign key violation"
- Migra usuarios primero, luego datos
- Verifica que proyectos existen antes de crear reportes

---

## 📞 Contacto

Para preguntas o problemas específicos de la migración, revisa:
- Archivos de servicios: `backend/src/services/`
- Archivos de rutas: `backend/src/routes/`
- Schema SQL: `backend/supabase_schema.sql`

---

## ✅ Checklist de Completitud

- [x] Schema SQL creado
- [x] Cliente Supabase configurado
- [x] Tipos TypeScript definidos
- [x] Servicios de datos creados
- [x] Middleware de auth migrado
- [x] Rutas actualizadas
- [x] Server.ts actualizado
- [x] Scripts de migración creados
- [x] Documentación completa
- [ ] Variables de entorno configuradas (TÚ)
- [ ] Schema ejecutado en Supabase (TÚ)
- [ ] Usuarios migrados (TÚ)
- [ ] Datos migrados (TÚ)
- [ ] Sistema probado (TÚ)
- [ ] Passwords enviados a usuarios (TÚ)
- [ ] Frontend actualizado si es necesario (TÚ)
- [ ] Deployed a producción (TÚ)

---

**¡La migración del código está completa! Ahora es tu turno de ejecutar los scripts y migrar los datos. ¡Éxito! 🚀**
