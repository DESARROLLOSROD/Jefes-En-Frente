-- Supabase SQL Schema for Jefes en Frente Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Usuarios (Profiles linked to Auth)
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'supervisor', 'jefe en frente')) DEFAULT 'jefe en frente',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  descripcion TEXT,
  mapa_imagen_data TEXT, -- Base64 or reference
  mapa_content_type TEXT,
  mapa_width INTEGER,
  mapa_height INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Proyecto-Usuarios (Join Table)
CREATE TABLE IF NOT EXISTS proyecto_usuarios (
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  PRIMARY KEY (proyecto_id, usuario_id)
);

-- 4. Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  no_economico TEXT UNIQUE NOT NULL,
  horometro_inicial NUMERIC NOT NULL DEFAULT 0,
  horometro_final NUMERIC,
  horas_operacion NUMERIC DEFAULT 0,
  capacidad TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vehículo-Proyectos (Join Table)
CREATE TABLE IF NOT EXISTS vehiculo_proyectos (
  vehiculo_id UUID REFERENCES vehiculos(id) ON DELETE CASCADE,
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  PRIMARY KEY (vehiculo_id, proyecto_id)
);

-- 6. Reportes
CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  ubicacion TEXT NOT NULL,
  turno TEXT,
  inicio_actividades TEXT,
  termino_actividades TEXT,
  zona_id TEXT,
  zona_nombre TEXT,
  seccion_id TEXT,
  seccion_nombre TEXT,
  jefe_frente TEXT,
  sobrestante TEXT,
  observaciones TEXT,
  creado_por TEXT,
  usuario_id UUID REFERENCES perfiles(id),
  proyecto_id UUID REFERENCES proyectos(id),
  offline_id TEXT UNIQUE,
  ubicacion_mapa_pin_x NUMERIC,
  ubicacion_mapa_pin_y NUMERIC,
  ubicacion_mapa_colocado BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Control de Acarreo (Nested in Mongo)
CREATE TABLE IF NOT EXISTS reporte_acarreo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  material TEXT,
  no_viaje INTEGER,
  capacidad TEXT,
  vol_suelto TEXT,
  capa_no TEXT,
  elevacion_ariza TEXT,
  capa_origen TEXT,
  destino TEXT
);

-- 8. Control de Material (Nested in Mongo)
CREATE TABLE IF NOT EXISTS reporte_material (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  material TEXT,
  unidad TEXT,
  cantidad TEXT,
  zona TEXT,
  elevacion TEXT
);

-- 9. Control de Agua (Nested in Mongo)
CREATE TABLE IF NOT EXISTS reporte_agua (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  no_economico TEXT,
  viaje INTEGER,
  capacidad TEXT,
  volumen TEXT,
  origen TEXT,
  destino TEXT
);

-- 10. Control de Maquinaria (Nested in Mongo)
CREATE TABLE IF NOT EXISTS reporte_maquinaria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  tipo TEXT,
  modelo TEXT,
  numero_economico TEXT,
  horas_operacion NUMERIC,
  operador TEXT,
  actividad TEXT,
  vehiculo_id UUID REFERENCES vehiculos(id),
  horometro_inicial NUMERIC,
  horometro_final NUMERIC
);

-- 11. Historial de Modificaciones
CREATE TABLE IF NOT EXISTS reporte_historial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  fecha_modificacion TIMESTAMPTZ DEFAULT NOW(),
  usuario_id UUID REFERENCES perfiles(id),
  usuario_nombre TEXT,
  observacion TEXT
);

-- 12. Cambios Específicos del Historial
CREATE TABLE IF NOT EXISTS reporte_cambios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historial_id UUID REFERENCES reporte_historial(id) ON DELETE CASCADE,
  campo TEXT,
  valor_anterior JSONB,
  valor_nuevo JSONB
);

-- 13. Pines de Mapa (nested en reportes pero normalizado)
CREATE TABLE IF NOT EXISTS pines_mapa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  pin_id TEXT NOT NULL, -- ID del pin en el frontend
  pin_x NUMERIC NOT NULL,
  pin_y NUMERIC NOT NULL,
  etiqueta TEXT,
  color TEXT
);

-- 14. Work Zones (Zonas de Trabajo)
CREATE TABLE IF NOT EXISTS work_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sections JSONB DEFAULT '[]'::jsonb, -- Array de secciones
  status TEXT CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Biblioteca de Mapas
CREATE TABLE IF NOT EXISTS biblioteca_mapas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT DEFAULT 'GENERAL',
  imagen_data TEXT NOT NULL, -- Base64 encoded image
  imagen_content_type TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  etiquetas TEXT[], -- Array de strings
  es_publico BOOLEAN DEFAULT FALSE,
  creado_por UUID REFERENCES perfiles(id),
  proyecto_id UUID REFERENCES proyectos(id),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Catálogos (Lookup Tables) - Completos
CREATE TABLE IF NOT EXISTS cat_materiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  unidad TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat_origenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat_destinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat_capacidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  valor TEXT UNIQUE NOT NULL,
  etiqueta TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat_tipos_vehiculo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en reportes (críticos para performance)
CREATE INDEX IF NOT EXISTS idx_reportes_proyecto_fecha ON reportes(proyecto_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_offline_id ON reportes(offline_id) WHERE offline_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha DESC);

-- Índices en sub-tablas de reportes
CREATE INDEX IF NOT EXISTS idx_reporte_acarreo_reporte ON reporte_acarreo(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_material_reporte ON reporte_material(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_agua_reporte ON reporte_agua(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_maquinaria_reporte ON reporte_maquinaria(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_maquinaria_vehiculo ON reporte_maquinaria(vehiculo_id);

-- Índices en historial
CREATE INDEX IF NOT EXISTS idx_reporte_historial_reporte ON reporte_historial(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_cambios_historial ON reporte_cambios(historial_id);

-- Índices en pines de mapa
CREATE INDEX IF NOT EXISTS idx_pines_mapa_reporte ON pines_mapa(reporte_id);

-- Índices en work zones
CREATE INDEX IF NOT EXISTS idx_work_zones_project ON work_zones(project_id);

-- Índices en biblioteca de mapas
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_proyecto ON biblioteca_mapas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_creador ON biblioteca_mapas(creado_por);
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_categoria ON biblioteca_mapas(categoria);

-- Índices en tablas de relación
CREATE INDEX IF NOT EXISTS idx_proyecto_usuarios_usuario ON proyecto_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_usuarios_proyecto ON proyecto_usuarios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_vehiculo_proyectos_vehiculo ON vehiculo_proyectos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_vehiculo_proyectos_proyecto ON vehiculo_proyectos(proyecto_id);

-- Índices en catálogos (para búsquedas rápidas)
CREATE INDEX IF NOT EXISTS idx_materiales_nombre ON cat_materiales(nombre) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_origenes_nombre ON cat_origenes(nombre) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_destinos_nombre ON cat_destinos(nombre) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_tipos_vehiculo_nombre ON cat_tipos_vehiculo(nombre) WHERE activo = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_mapas ENABLE ROW LEVEL SECURITY;

-- PERFILES: Los usuarios pueden ver y editar solo su propio perfil
CREATE POLICY "Users can view own profile"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON perfiles FOR UPDATE
  USING (auth.uid() = id);

-- PROYECTOS: Usuarios autenticados pueden ver proyectos activos
CREATE POLICY "Authenticated users can view active projects"
  ON proyectos FOR SELECT
  TO authenticated
  USING (activo = TRUE);

-- Admins pueden hacer todo con proyectos
CREATE POLICY "Admins can manage projects"
  ON proyectos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- REPORTES: Usuarios pueden ver reportes de sus proyectos
CREATE POLICY "Users can view reports from their projects"
  ON reportes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyecto_usuarios
      WHERE proyecto_id = reportes.proyecto_id
      AND usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Usuarios pueden crear reportes en sus proyectos
CREATE POLICY "Users can create reports in their projects"
  ON reportes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proyecto_usuarios
      WHERE proyecto_id = reportes.proyecto_id
      AND usuario_id = auth.uid()
    )
  );

-- Usuarios pueden actualizar sus propios reportes o si son admin/supervisor
CREATE POLICY "Users can update own reports or admin/supervisor can update all"
  ON reportes FOR UPDATE
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
    )
  );

-- Solo admins y supervisores pueden eliminar reportes
CREATE POLICY "Only admin and supervisors can delete reports"
  ON reportes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
    )
  );

-- VEHÍCULOS: Todos los usuarios autenticados pueden ver vehículos activos
CREATE POLICY "Authenticated users can view active vehicles"
  ON vehiculos FOR SELECT
  TO authenticated
  USING (activo = TRUE);

-- Solo admins pueden crear/modificar vehículos
CREATE POLICY "Only admins can manage vehicles"
  ON vehiculos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- WORK ZONES: Usuarios pueden ver zonas de sus proyectos
CREATE POLICY "Users can view work zones from their projects"
  ON work_zones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proyecto_usuarios
      WHERE proyecto_id = work_zones.project_id
      AND usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Admin y supervisores pueden gestionar work zones
CREATE POLICY "Admin and supervisors can manage work zones"
  ON work_zones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
    )
  );

-- BIBLIOTECA DE MAPAS: Usuarios pueden ver mapas públicos o de sus proyectos
CREATE POLICY "Users can view public maps or maps from their projects"
  ON biblioteca_mapas FOR SELECT
  TO authenticated
  USING (
    es_publico = TRUE
    OR EXISTS (
      SELECT 1 FROM proyecto_usuarios
      WHERE proyecto_id = biblioteca_mapas.proyecto_id
      AND usuario_id = auth.uid()
    )
    OR creado_por = auth.uid()
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Usuarios pueden crear mapas
CREATE POLICY "Authenticated users can create maps"
  ON biblioteca_mapas FOR INSERT
  TO authenticated
  WITH CHECK (creado_por = auth.uid());

-- Usuarios pueden actualizar sus propios mapas o admins pueden actualizar todos
CREATE POLICY "Users can update own maps or admins can update all"
  ON biblioteca_mapas FOR UPDATE
  TO authenticated
  USING (
    creado_por = auth.uid()
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para work_zones
CREATE TRIGGER update_work_zones_updated_at
  BEFORE UPDATE ON work_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se crea un usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'jefe en frente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMENTARIOS EN TABLAS (DOCUMENTACIÓN)
-- =====================================================

COMMENT ON TABLE perfiles IS 'Perfiles de usuario vinculados a Supabase Auth';
COMMENT ON TABLE proyectos IS 'Proyectos mineros con información de mapas';
COMMENT ON TABLE reportes IS 'Reportes de actividades diarias';
COMMENT ON TABLE vehiculos IS 'Catálogo de vehículos y maquinaria';
COMMENT ON TABLE work_zones IS 'Zonas de trabajo con secciones (JSONB array)';
COMMENT ON TABLE biblioteca_mapas IS 'Biblioteca de mapas e imágenes del proyecto';
COMMENT ON TABLE reporte_acarreo IS 'Control de acarreo de material (nested en reportes)';
COMMENT ON TABLE reporte_material IS 'Control de material utilizado (nested en reportes)';
COMMENT ON TABLE reporte_agua IS 'Control de agua (nested en reportes)';
COMMENT ON TABLE reporte_maquinaria IS 'Control de maquinaria (nested en reportes)';
COMMENT ON TABLE reporte_historial IS 'Historial de modificaciones de reportes';
COMMENT ON TABLE reporte_cambios IS 'Cambios específicos en cada modificación';
COMMENT ON TABLE pines_mapa IS 'Pines colocados en mapas de reportes';
