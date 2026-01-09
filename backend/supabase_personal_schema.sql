-- =====================================================
-- SCHEMA PARA MÓDULO DE CONTROL DE PERSONAL
-- Sistema Jefes en Frente - Gestión Minera
-- =====================================================

-- Tabla de catálogo de cargos/puestos
CREATE TABLE IF NOT EXISTS cat_cargos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cat_cargos
CREATE INDEX IF NOT EXISTS idx_cat_cargos_nombre ON cat_cargos(nombre);
CREATE INDEX IF NOT EXISTS idx_cat_cargos_activo ON cat_cargos(activo);

-- Tabla principal de personal
CREATE TABLE IF NOT EXISTS personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(200) NOT NULL,
    cargo_id UUID REFERENCES cat_cargos(id) ON DELETE RESTRICT,
    numero_empleado VARCHAR(50) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_ingreso DATE,
    fecha_baja DATE,
    activo BOOLEAN DEFAULT true,
    observaciones TEXT,
    foto_url TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para personal
CREATE INDEX IF NOT EXISTS idx_personal_nombre ON personal(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_personal_cargo ON personal(cargo_id);
CREATE INDEX IF NOT EXISTS idx_personal_activo ON personal(activo);
CREATE INDEX IF NOT EXISTS idx_personal_numero_empleado ON personal(numero_empleado);

-- Tabla de asignación de personal a proyectos
CREATE TABLE IF NOT EXISTS personal_proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    fecha_desasignacion DATE,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(personal_id, proyecto_id, activo)
);

-- Índices para personal_proyectos
CREATE INDEX IF NOT EXISTS idx_personal_proyectos_personal ON personal_proyectos(personal_id);
CREATE INDEX IF NOT EXISTS idx_personal_proyectos_proyecto ON personal_proyectos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_personal_proyectos_activo ON personal_proyectos(activo);

-- Tabla de asistencia/registro de personal
CREATE TABLE IF NOT EXISTS personal_asistencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    horas_trabajadas DECIMAL(5,2),
    presente BOOLEAN DEFAULT true,
    observaciones TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(personal_id, proyecto_id, fecha)
);

-- Índices para personal_asistencia
CREATE INDEX IF NOT EXISTS idx_personal_asistencia_personal ON personal_asistencia(personal_id);
CREATE INDEX IF NOT EXISTS idx_personal_asistencia_proyecto ON personal_asistencia(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_personal_asistencia_fecha ON personal_asistencia(fecha);

-- Trigger para actualizar fecha_modificacion en personal
CREATE OR REPLACE FUNCTION update_personal_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_personal_fecha_modificacion
    BEFORE UPDATE ON personal
    FOR EACH ROW
    EXECUTE FUNCTION update_personal_fecha_modificacion();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE cat_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_asistencia ENABLE ROW LEVEL SECURITY;

-- Políticas para cat_cargos (todos pueden leer, solo admin puede modificar)
CREATE POLICY "Todos pueden ver cargos activos"
    ON cat_cargos FOR SELECT
    USING (activo = true);

CREATE POLICY "Solo admin puede insertar cargos"
    ON cat_cargos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol = 'admin'
        )
    );

CREATE POLICY "Solo admin puede actualizar cargos"
    ON cat_cargos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol = 'admin'
        )
    );

-- Políticas para personal
CREATE POLICY "Usuarios pueden ver personal de sus proyectos"
    ON personal FOR SELECT
    USING (
        activo = true AND (
            -- Admin puede ver todo
            EXISTS (
                SELECT 1 FROM perfiles
                WHERE perfiles.id = auth.uid()
                AND perfiles.rol = 'admin'
            )
            OR
            -- Otros usuarios solo ven personal de sus proyectos
            EXISTS (
                SELECT 1 FROM personal_proyectos pp
                INNER JOIN proyecto_usuarios pu ON pp.proyecto_id = pu.proyecto_id
                WHERE pp.personal_id = personal.id
                AND pu.usuario_id = auth.uid()
                AND pp.activo = true
            )
        )
    );

CREATE POLICY "Admin y supervisor pueden insertar personal"
    ON personal FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Admin y supervisor pueden actualizar personal"
    ON personal FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol IN ('admin', 'supervisor')
        )
    );

-- Políticas para personal_proyectos
CREATE POLICY "Usuarios pueden ver asignaciones de sus proyectos"
    ON personal_proyectos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM proyecto_usuarios
            WHERE proyecto_usuarios.proyecto_id = personal_proyectos.proyecto_id
            AND proyecto_usuarios.usuario_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol = 'admin'
        )
    );

CREATE POLICY "Admin y supervisor pueden asignar personal"
    ON personal_proyectos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol IN ('admin', 'supervisor')
        )
    );

CREATE POLICY "Admin y supervisor pueden actualizar asignaciones"
    ON personal_proyectos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol IN ('admin', 'supervisor')
        )
    );

-- Políticas para personal_asistencia
CREATE POLICY "Usuarios pueden ver asistencia de sus proyectos"
    ON personal_asistencia FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM proyecto_usuarios
            WHERE proyecto_usuarios.proyecto_id = personal_asistencia.proyecto_id
            AND proyecto_usuarios.usuario_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol = 'admin'
        )
    );

CREATE POLICY "Todos pueden registrar asistencia"
    ON personal_asistencia FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM proyecto_usuarios
            WHERE proyecto_usuarios.proyecto_id = personal_asistencia.proyecto_id
            AND proyecto_usuarios.usuario_id = auth.uid()
        )
    );

CREATE POLICY "Admin y supervisor pueden actualizar asistencia"
    ON personal_asistencia FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol IN ('admin', 'supervisor')
        )
    );

-- =====================================================
-- DATOS INICIALES - CARGOS COMUNES EN MINERÍA
-- =====================================================

INSERT INTO cat_cargos (nombre, descripcion) VALUES
    ('Topógrafo', 'Personal encargado de levantamientos topográficos y mediciones'),
    ('Operador de Maquinaria', 'Opera maquinaria pesada en el sitio'),
    ('Supervisor de Obra', 'Supervisa las actividades en el proyecto'),
    ('Ingeniero de Campo', 'Ingeniero a cargo de operaciones en campo'),
    ('Ayudante General', 'Personal de apoyo en actividades generales'),
    ('Mecánico', 'Mantenimiento y reparación de maquinaria'),
    ('Almacenista', 'Control de inventario y almacén'),
    ('Chofer', 'Transporte de personal y materiales'),
    ('Técnico en Seguridad', 'Encargado de seguridad e higiene'),
    ('Velador', 'Vigilancia y seguridad del sitio')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE cat_cargos IS 'Catálogo de cargos/puestos de trabajo';
COMMENT ON TABLE personal IS 'Registro de personal de la empresa';
COMMENT ON TABLE personal_proyectos IS 'Asignación de personal a proyectos específicos';
COMMENT ON TABLE personal_asistencia IS 'Registro de asistencia y horas trabajadas del personal';

COMMENT ON COLUMN personal.numero_empleado IS 'Número único de empleado';
COMMENT ON COLUMN personal.fecha_baja IS 'Fecha de baja del empleado (NULL si está activo)';
COMMENT ON COLUMN personal_asistencia.horas_trabajadas IS 'Horas trabajadas en el día';
