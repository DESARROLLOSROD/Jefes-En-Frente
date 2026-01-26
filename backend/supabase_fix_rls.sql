-- =====================================================
-- SCRIPT DE CORRECCION DE POLITICAS RLS
-- Jefes en Frente - Sistema Minero
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. PERFILES (Usuarios)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON perfiles;
DROP POLICY IF EXISTS "Users can update own profile" ON perfiles;
DROP POLICY IF EXISTS "Allow profile creation" ON perfiles;
DROP POLICY IF EXISTS "Service role full access" ON perfiles;
DROP POLICY IF EXISTS "perfiles_select" ON perfiles;
DROP POLICY IF EXISTS "perfiles_insert" ON perfiles;
DROP POLICY IF EXISTS "perfiles_update" ON perfiles;
DROP POLICY IF EXISTS "perfiles_delete" ON perfiles;
DROP POLICY IF EXISTS "perfiles_all" ON perfiles;

CREATE POLICY "perfiles_all" ON perfiles FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 2. PROYECTOS
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view active projects" ON proyectos;
DROP POLICY IF EXISTS "Admins can manage projects" ON proyectos;
DROP POLICY IF EXISTS "proyectos_all" ON proyectos;

CREATE POLICY "proyectos_all" ON proyectos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 3. PROYECTO_USUARIOS (Relacion M:N)
-- =====================================================
DROP POLICY IF EXISTS "proyecto_usuarios_all" ON proyecto_usuarios;

-- Habilitar RLS si no esta habilitado
ALTER TABLE proyecto_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proyecto_usuarios_all" ON proyecto_usuarios FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 4. VEHICULOS
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view active vehicles" ON vehiculos;
DROP POLICY IF EXISTS "Only admins can manage vehicles" ON vehiculos;
DROP POLICY IF EXISTS "vehiculos_all" ON vehiculos;

CREATE POLICY "vehiculos_all" ON vehiculos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 5. VEHICULO_PROYECTOS (Relacion M:N)
-- =====================================================
DROP POLICY IF EXISTS "vehiculo_proyectos_all" ON vehiculo_proyectos;

-- Habilitar RLS si no esta habilitado
ALTER TABLE vehiculo_proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehiculo_proyectos_all" ON vehiculo_proyectos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 6. REPORTES
-- =====================================================
DROP POLICY IF EXISTS "Users can view reports from their projects" ON reportes;
DROP POLICY IF EXISTS "Users can create reports in their projects" ON reportes;
DROP POLICY IF EXISTS "Users can update own reports or admin/supervisor can update all" ON reportes;
DROP POLICY IF EXISTS "Only admin and supervisors can delete reports" ON reportes;
DROP POLICY IF EXISTS "reportes_all" ON reportes;

CREATE POLICY "reportes_all" ON reportes FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 7. REPORTE_ACARREO
-- =====================================================
DROP POLICY IF EXISTS "reporte_acarreo_all" ON reporte_acarreo;

-- Habilitar RLS si no esta habilitado
ALTER TABLE reporte_acarreo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporte_acarreo_all" ON reporte_acarreo FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 8. REPORTE_MATERIAL
-- =====================================================
DROP POLICY IF EXISTS "reporte_material_all" ON reporte_material;

-- Habilitar RLS si no esta habilitado
ALTER TABLE reporte_material ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporte_material_all" ON reporte_material FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 9. REPORTE_AGUA
-- =====================================================
DROP POLICY IF EXISTS "reporte_agua_all" ON reporte_agua;

-- Habilitar RLS si no esta habilitado
ALTER TABLE reporte_agua ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporte_agua_all" ON reporte_agua FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 10. REPORTE_MAQUINARIA
-- =====================================================
DROP POLICY IF EXISTS "reporte_maquinaria_all" ON reporte_maquinaria;

-- Habilitar RLS si no esta habilitado
ALTER TABLE reporte_maquinaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporte_maquinaria_all" ON reporte_maquinaria FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 11. REPORTE_HISTORIAL
-- =====================================================
DROP POLICY IF EXISTS "reporte_historial_all" ON reporte_historial;

-- Habilitar RLS si no esta habilitado
ALTER TABLE reporte_historial ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporte_historial_all" ON reporte_historial FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 12. REPORTE_CAMBIOS
-- =====================================================
DROP POLICY IF EXISTS "reporte_cambios_all" ON reporte_cambios;

-- Habilitar RLS si no esta habilitado
ALTER TABLE reporte_cambios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporte_cambios_all" ON reporte_cambios FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 13. PINES_MAPA
-- =====================================================
DROP POLICY IF EXISTS "pines_mapa_all" ON pines_mapa;

-- Habilitar RLS si no esta habilitado
ALTER TABLE pines_mapa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pines_mapa_all" ON pines_mapa FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 14. WORK_ZONES (Zonas de Trabajo)
-- =====================================================
DROP POLICY IF EXISTS "Users can view work zones from their projects" ON work_zones;
DROP POLICY IF EXISTS "Admin and supervisors can manage work zones" ON work_zones;
DROP POLICY IF EXISTS "work_zones_select" ON work_zones;
DROP POLICY IF EXISTS "work_zones_insert" ON work_zones;
DROP POLICY IF EXISTS "work_zones_update" ON work_zones;
DROP POLICY IF EXISTS "work_zones_delete" ON work_zones;
DROP POLICY IF EXISTS "work_zones_all" ON work_zones;

CREATE POLICY "work_zones_all" ON work_zones FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 15. BIBLIOTECA_MAPAS
-- =====================================================
DROP POLICY IF EXISTS "Users can view public maps or maps from their projects" ON biblioteca_mapas;
DROP POLICY IF EXISTS "Authenticated users can create maps" ON biblioteca_mapas;
DROP POLICY IF EXISTS "Users can update own maps or admins can update all" ON biblioteca_mapas;
DROP POLICY IF EXISTS "biblioteca_mapas_all" ON biblioteca_mapas;

CREATE POLICY "biblioteca_mapas_all" ON biblioteca_mapas FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 16. CATALOGOS - Materiales
-- =====================================================
DROP POLICY IF EXISTS "cat_materiales_all" ON cat_materiales;

-- Habilitar RLS si no esta habilitado
ALTER TABLE cat_materiales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_materiales_all" ON cat_materiales FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 17. CATALOGOS - Origenes
-- =====================================================
DROP POLICY IF EXISTS "cat_origenes_all" ON cat_origenes;

-- Habilitar RLS si no esta habilitado
ALTER TABLE cat_origenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_origenes_all" ON cat_origenes FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 18. CATALOGOS - Destinos
-- =====================================================
DROP POLICY IF EXISTS "cat_destinos_all" ON cat_destinos;

-- Habilitar RLS si no esta habilitado
ALTER TABLE cat_destinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_destinos_all" ON cat_destinos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 19. CATALOGOS - Capacidades
-- =====================================================
DROP POLICY IF EXISTS "cat_capacidades_all" ON cat_capacidades;

-- Habilitar RLS si no esta habilitado
ALTER TABLE cat_capacidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_capacidades_all" ON cat_capacidades FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 20. CATALOGOS - Tipos de Vehiculo
-- =====================================================
DROP POLICY IF EXISTS "cat_tipos_vehiculo_all" ON cat_tipos_vehiculo;

-- Habilitar RLS si no esta habilitado
ALTER TABLE cat_tipos_vehiculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_tipos_vehiculo_all" ON cat_tipos_vehiculo FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 21. PERSONAL
-- =====================================================
DROP POLICY IF EXISTS "personal_all" ON personal;

-- Habilitar RLS si no esta habilitado
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personal_all" ON personal FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 22. CAT_CARGOS (Cargos del Personal)
-- =====================================================
DROP POLICY IF EXISTS "cat_cargos_all" ON cat_cargos;

-- Habilitar RLS si no esta habilitado
ALTER TABLE cat_cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cat_cargos_all" ON cat_cargos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 23. PERSONAL_PROYECTOS (Relacion M:N)
-- =====================================================
DROP POLICY IF EXISTS "personal_proyectos_all" ON personal_proyectos;

-- Habilitar RLS si no esta habilitado
ALTER TABLE personal_proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personal_proyectos_all" ON personal_proyectos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 24. REPORTE_PERSONAL (Personal asignado a reportes)
-- =====================================================
DROP POLICY IF EXISTS "reporte_personal_all" ON reporte_personal;

-- Verificar si existe la tabla antes de crear politica
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'reporte_personal') THEN
    ALTER TABLE reporte_personal ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'reporte_personal' AND policyname = 'reporte_personal_all') THEN
      CREATE POLICY "reporte_personal_all" ON reporte_personal FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- =====================================================
-- VERIFICACION FINAL
-- =====================================================
-- Ver todas las politicas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
