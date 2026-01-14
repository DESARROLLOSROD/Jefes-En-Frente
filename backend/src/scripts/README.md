# Scripts de Migración - OBSOLETOS

## Estado: DEPRECADOS

Los scripts en esta carpeta fueron utilizados durante la migración inicial de **MongoDB** a **Supabase PostgreSQL**.

### Scripts Obsoletos:

- `createInitialUsers.ts` - Creaba usuarios iniciales en MongoDB
- `seedData.ts` - Poblaba datos de prueba en MongoDB
- `migrateToSupabase.ts` - Migración inicial de datos
- `migrateDataComplete.ts` - Migración completa de datos
- `migrateUsersToAuth.ts` - Migración de usuarios a Supabase Auth

### ¿Por qué están deprecados?

La migración a Supabase se completó exitosamente el **2025-01**. Todos los modelos Mongoose han sido eliminados y reemplazados por servicios de Supabase.

### Para crear datos de prueba ahora:

Usa las migraciones SQL en `/backend/src/migrations/` para ejecutar directamente en Supabase:

```bash
# Ejecutar en Supabase SQL Editor o con psql
psql $DATABASE_URL -f backend/src/migrations/001_initial_schema.sql
psql $DATABASE_URL -f backend/src/migrations/002_add_personal_module.sql
psql $DATABASE_URL -f backend/src/migrations/003_add_map_annotations.sql
psql $DATABASE_URL -f backend/src/migrations/004_create_biblioteca_mapas.sql
```

### Semillas de Datos (Seed Data):

Para agregar datos de prueba, crea scripts SQL directamente o usa el panel de Supabase.

**Ejemplo de seed data:**

```sql
-- Insertar proyecto de ejemplo
INSERT INTO proyectos (nombre, ubicacion, descripcion, activo)
VALUES ('Mina San Sebastián', 'SAN SEBASTIAN DEL OESTE, JALISCO', 'Proyecto principal', true);
```

---

**Última actualización:** 2026-01-14
**Estado del proyecto:** MongoDB completamente eliminado, 100% Supabase
