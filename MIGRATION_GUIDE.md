# Guía de Migración: MongoDB → Supabase PostgreSQL

## Sistema: Jefes en Frente v3.0

Esta guía detalla el proceso completo de migración de la base de datos de MongoDB Atlas a Supabase PostgreSQL, incluyendo la migración de autenticación JWT custom a Supabase Auth.

---

## 📋 Tabla de Contenidos

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Pre-requisitos](#pre-requisitos)
3. [Proceso de Migración](#proceso-de-migración)
4. [Verificación Post-Migración](#verificación-post-migración)
5. [Troubleshooting](#troubleshooting)
6. [Rollback](#rollback)

---

## 🔄 Resumen de Cambios

### Base de Datos

**Antes (MongoDB):**
- Base de datos NoSQL con Mongoose ORM
- Documentos embedded (nested arrays)
- ObjectID como identificador principal

**Después (Supabase PostgreSQL):**
- Base de datos relacional PostgreSQL
- Tablas normalizadas con foreign keys
- UUIDs como identificadores

### Autenticación

**Antes:**
- JWT custom con bcrypt
- RefreshTokens almacenados en MongoDB
- Middleware custom para verificación

**Después:**
- Supabase Auth (manejo completo)
- Tokens manejados por Supabase
- Middleware simplificado con Supabase SDK

### Arquitectura de Código

**Antes:**
- Modelos Mongoose con schemas
- Queries directas en routes
- Validación en models

**Después:**
- Tipos TypeScript desde esquema SQL
- Capa de servicios con lógica de negocio
- Validación en routes y services

---

## ✅ Pre-requisitos

### 1. Cuenta de Supabase Configurada

Asegúrate de tener:

- Proyecto de Supabase creado
- Variables de entorno configuradas:
  ```env
  SUPABASE_URL=https://tu-proyecto.supabase.co
  SUPABASE_ANON_KEY=tu_anon_key_aqui
  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
  ```

### 2. Acceso a MongoDB

- MONGODB_URI activo y funcional
- Backup reciente de la base de datos

### 3. Dependencias Instaladas

```bash
npm install @supabase/supabase-js
```

### 4. Backup Completo

**CRÍTICO:** Realiza un backup antes de comenzar:

```bash
# Exportar toda la base de datos
mongodump --uri="mongodb+srv://..." --out=./backup

# O usa MongoDB Compass para exportar a JSON
```

---

## 🚀 Proceso de Migración

### Paso 1: Ejecutar Schema SQL en Supabase

1. Abre el Dashboard de Supabase
2. Ve a **SQL Editor**
3. Abre el archivo `backend/supabase_schema.sql`
4. Copia y pega el contenido completo
5. Ejecuta el SQL
6. Verifica que todas las tablas se crearon correctamente:
   - proyectos
   - perfiles
   - vehiculos
   - reportes
   - cat_materiales, cat_origenes, cat_destinos, cat_capacidades, cat_tipos_vehiculo
   - Tablas de relaciones y sub-tablas de reportes

### Paso 2: Configurar Variables de Entorno

Edita `backend/.env`:

```env
# Supabase Configuration (AÑADIR)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# MongoDB (MANTENER TEMPORALMENTE)
MONGODB_URI=mongodb+srv://...

# Frontend URL (mantener)
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Paso 3: Migrar Usuarios a Supabase Auth

**IMPORTANTE:** Este paso debe hacerse PRIMERO porque los reportes dependen de los usuarios.

```bash
cd backend
npx tsx src/scripts/migrateUsersToAuth.ts
```

Este script:
- Lee usuarios de MongoDB
- Crea cuentas en Supabase Auth con passwords temporales
- Crea perfiles en la tabla `perfiles`
- Asigna proyectos a usuarios
- Genera archivo `temp_passwords.txt` con credentials temporales

**Acción Post-Script:**
1. Revisa el archivo `temp_passwords.txt`
2. Envía los passwords temporales a cada usuario de forma segura (email encriptado, mensaje directo, etc.)
3. Pide a los usuarios que cambien su password en el primer login
4. **ELIMINA** `temp_passwords.txt` después de enviarlo

### Paso 4: Migrar Datos

Una vez migrados los usuarios, ejecuta el script de migración de datos:

```bash
npx tsx src/scripts/migrateDataComplete.ts
```

Este script migra en orden:
1. **Proyectos** (con mapas base64 si existen)
2. **Vehículos** (con relación many-to-many a proyectos)
3. **Catálogos** (materiales, capacidades, orígenes, destinos, tipos vehículo)
4. **Reportes** (con todas sus sub-tablas: acarreo, material, agua, maquinaria)

**Nota:** El script muestra progreso en tiempo real y genera un resumen al final.

### Paso 5: Verificar Migración

Ejecuta queries de verificación en Supabase SQL Editor:

```sql
-- Contar registros en cada tabla
SELECT 'proyectos' as tabla, COUNT(*) as total FROM proyectos
UNION ALL
SELECT 'perfiles', COUNT(*) FROM perfiles
UNION ALL
SELECT 'vehiculos', COUNT(*) FROM vehiculos
UNION ALL
SELECT 'reportes', COUNT(*) FROM reportes
UNION ALL
SELECT 'reporte_acarreo', COUNT(*) FROM reporte_acarreo
UNION ALL
SELECT 'reporte_material', COUNT(*) FROM reporte_material
UNION ALL
SELECT 'reporte_agua', COUNT(*) FROM reporte_agua
UNION ALL
SELECT 'reporte_maquinaria', COUNT(*) FROM reporte_maquinaria;

-- Comparar con MongoDB
-- Proyectos: db.proyectos.countDocuments()
-- Usuarios: db.usuarios.countDocuments()
-- Vehículos: db.vehiculos.countDocuments()
-- Reportes: db.reporteactividades.countDocuments()
```

### Paso 6: Probar Backend con Supabase

1. **Detén el servidor** si está corriendo
2. **Verifica** que no hay errores de TypeScript:
   ```bash
   npm run build
   ```
3. **Inicia el servidor**:
   ```bash
   npm run dev
   ```
4. Verifica la consola, deberías ver:
   ```
   ✅ Cliente Supabase configurado correctamente
   📍 Supabase URL: https://...
   🎯 Servidor corriendo...
   ```

### Paso 7: Probar Autenticación

Usa Postman, Thunder Client o curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com","password":"password_temporal"}'

# Debería retornar:
# {
#   "success": true,
#   "data": {
#     "token": "eyJ...",
#     "user": { ... }
#   }
# }
```

### Paso 8: Probar Endpoints Principales

```bash
# Obtener proyectos (requiere token)
curl -X GET http://localhost:5000/api/proyectos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Crear reporte
curl -X POST http://localhost:5000/api/reportes \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Paso 9: Actualizar Frontend (si es necesario)

Si el frontend usa estructuras de datos antiguas de MongoDB:

1. **ObjectId → UUID**: Cambiar referencias de `_id` a `id`
2. **Nested Data**: Ajustar componentes que esperan datos nested a datos relacionales
3. **Campos Renombrados**: Revisar mapeo de campos (ej. `noEconomico` → `no_economico`)

**Ejemplo de cambio en frontend:**

```typescript
// Antes (MongoDB)
const reportes = data.map(r => ({
  id: r._id,
  proyecto: r.proyectoId,
  usuario: r.usuarioId
}));

// Después (Supabase)
const reportes = data.map(r => ({
  id: r.id,  // Ya es UUID
  proyecto: r.proyecto_id,
  usuario: r.usuario_id
}));
```

### Paso 10: Deployment

Una vez verificado que todo funciona:

1. **Actualiza variables de entorno en producción** (Railway, Heroku, etc.):
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **Elimina `MONGODB_URI`** de las variables de producción

3. **Deploy del backend**

4. **Monitorea logs** las primeras 24-48 horas

---

## ✅ Verificación Post-Migración

### Checklist de Funcionalidad

- [ ] Login con usuarios existentes funciona
- [ ] Crear nuevo usuario (admin) funciona
- [ ] Crear proyecto funciona
- [ ] Subir mapa de proyecto funciona
- [ ] Crear reporte de actividades funciona
- [ ] Ver lista de reportes funciona
- [ ] Editar reporte funciona (historial se guarda)
- [ ] Ver estadísticas funciona
- [ ] Crear vehículo funciona
- [ ] Actualizar horómetros de vehículos funciona (desde reportes)
- [ ] Crear catálogos (materiales, orígenes, etc.) funciona
- [ ] Idempotencia de reportes offline funciona

### Queries de Validación

```sql
-- Verificar integridad referencial
SELECT
  r.id,
  r.proyecto_id,
  r.usuario_id,
  p.nombre as proyecto,
  per.nombre as usuario
FROM reportes r
LEFT JOIN proyectos p ON r.proyecto_id = p.id
LEFT JOIN perfiles per ON r.usuario_id = per.id
WHERE p.id IS NULL OR per.id IS NULL;
-- No debería retornar filas

-- Verificar reportes con sub-tablas
SELECT
  r.id,
  (SELECT COUNT(*) FROM reporte_acarreo WHERE reporte_id = r.id) as acarreos,
  (SELECT COUNT(*) FROM reporte_material WHERE reporte_id = r.id) as materiales,
  (SELECT COUNT(*) FROM reporte_agua WHERE reporte_id = r.id) as agua,
  (SELECT COUNT(*) FROM reporte_maquinaria WHERE reporte_id = r.id) as maquinaria
FROM reportes r
LIMIT 10;

-- Verificar RLS (Row Level Security)
-- Ejecutar como usuario regular (no service_role):
SET ROLE authenticated;
SELECT * FROM reportes LIMIT 5;
-- Solo debería ver reportes de sus proyectos asignados
```

---

## 🛠️ Troubleshooting

### Problema: Error "Usuario no encontrado" al hacer login

**Causa:** El usuario no se migró correctamente a Supabase Auth

**Solución:**
```bash
# Re-ejecutar migración de ese usuario específico
# O crear manualmente en Supabase Dashboard → Authentication → Add User
```

### Problema: Foreign key violation en reportes

**Causa:** Usuario o proyecto no existe en Supabase

**Solución:**
```sql
-- Verificar que existen
SELECT * FROM perfiles WHERE id = 'uuid-del-usuario';
SELECT * FROM proyectos WHERE id = 'uuid-del-proyecto';

-- Si no existen, migrar primero o ajustar datos
```

### Problema: "Cannot read property 'mapa' of undefined"

**Causa:** Frontend espera estructura nested de MongoDB

**Solución:**
Actualizar código de frontend para usar la estructura flat de Supabase:

```typescript
// Antes
proyecto.mapa?.imagen?.data

// Después
proyecto.mapa_imagen_data
```

### Problema: Reportes duplicados con `offline_id`

**Causa:** Idempotencia no funciona

**Solución:**
Verificar que el constraint UNIQUE en `offline_id` existe:

```sql
SELECT * FROM pg_indexes WHERE tablename = 'reportes' AND indexname LIKE '%offline%';
```

### Problema: Performance lento en queries de reportes

**Causa:** Falta de índices

**Solución:**
Verificar que los índices se crearon:

```sql
SELECT * FROM pg_indexes WHERE tablename = 'reportes';

-- Deberías ver:
-- - reportes_proyecto_id_fecha_idx
-- - reportes_usuario_id_idx
-- - reportes_offline_id_idx
```

---

## 🔙 Rollback

Si algo falla gravemente y necesitas volver a MongoDB:

### 1. Revertir código

```bash
# Volver al commit anterior a la migración
git log --oneline
git checkout <commit-hash-pre-migracion>
```

### 2. Restaurar variables de entorno

```env
# Comentar o eliminar Supabase
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...

# Descomentar MongoDB
MONGODB_URI=mongodb+srv://...
```

### 3. Restaurar backup si es necesario

```bash
mongorestore --uri="mongodb+srv://..." ./backup
```

### 4. Redeploy versión anterior

---

## 📊 Diferencias Clave MongoDB vs Supabase

| Aspecto | MongoDB | Supabase |
|---------|---------|----------|
| **Tipo** | NoSQL (documentos) | SQL (relacional) |
| **IDs** | ObjectId (24 hex) | UUID v4 |
| **Nested Data** | Arrays embedded | Tablas separadas con FKs |
| **Auth** | Custom JWT | Supabase Auth |
| **Queries** | `.find()`, `.aggregate()` | SQL con JOINs |
| **Relaciones** | Refs o embedded | Foreign Keys |
| **Validación** | Mongoose schemas | Constraints SQL |
| **Índices** | `.createIndex()` | `CREATE INDEX` |
| **Transacciones** | Sessions | BEGIN/COMMIT nativo |

---

## 📝 Notas Importantes

### Passwords

- Los passwords de MongoDB están hasheados con bcrypt y **NO SE PUEDEN MIGRAR**
- Supabase Auth usa su propio sistema de hashing
- Por esto, se generan passwords temporales que los usuarios deben cambiar

### IDs

- MongoDB ObjectIDs son 24 caracteres hexadecimales
- Supabase UUIDs son 36 caracteres (con guiones)
- Si el frontend hardcodea IDs, deberá actualizarse

### Mapas de Proyectos

- En MongoDB: `mapa.imagen.data` (nested)
- En Supabase: `mapa_imagen_data` (columna flat)
- El tamaño máximo de base64 en PostgreSQL TEXT es ~1GB (suficiente)

### Row Level Security (RLS)

- Supabase tiene RLS habilitado por defecto
- Las policies aseguran que usuarios solo vean sus proyectos
- Admins tienen acceso completo

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs del backend (`npm run dev`)
2. Revisa los logs de Supabase (Dashboard → Logs)
3. Consulta la documentación de Supabase: https://supabase.com/docs
4. Revisa el código en: `backend/src/services/` y `backend/src/routes/`

---

## ✅ Checklist Final

Antes de considerar la migración completa:

- [ ] Todos los usuarios pueden hacer login
- [ ] Se pueden crear nuevos reportes
- [ ] Reportes antiguos son visibles
- [ ] Estadísticas se calculan correctamente
- [ ] Horómetros de vehículos se actualizan
- [ ] Historial de modificaciones funciona
- [ ] No hay errores en consola del backend
- [ ] No hay errores en consola del frontend
- [ ] Performance es aceptable (< 500ms por query)
- [ ] Backup de MongoDB está seguro
- [ ] Variables de entorno en producción están actualizadas
- [ ] Monitoreo está activo (Supabase Dashboard)

---

**Fecha de última actualización:** 2026-01-08
**Versión:** 3.0
**Autor:** Sistema Jefes en Frente
