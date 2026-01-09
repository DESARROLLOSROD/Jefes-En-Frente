-- =====================================================
-- INTEGRACIÓN DE PERSONAL CON REPORTES
-- Agregar personal que participó en cada reporte
-- =====================================================

-- Tabla para registrar personal que participó en un reporte
CREATE TABLE IF NOT EXISTS reporte_personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE RESTRICT,
    cargo_id UUID REFERENCES cat_cargos(id) ON DELETE SET NULL,
    actividad_realizada TEXT,
    horas_trabajadas DECIMAL(5,2),
    observaciones TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reporte_id, personal_id)
);

-- Índices para reporte_personal
CREATE INDEX IF NOT EXISTS idx_reporte_personal_reporte ON reporte_personal(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_personal_personal ON reporte_personal(personal_id);
CREATE INDEX IF NOT EXISTS idx_reporte_personal_cargo ON reporte_personal(cargo_id);

-- Comentarios
COMMENT ON TABLE reporte_personal IS 'Personal que participó en cada reporte de actividades';
COMMENT ON COLUMN reporte_personal.actividad_realizada IS 'Descripción de la actividad que realizó este personal en el reporte';
COMMENT ON COLUMN reporte_personal.horas_trabajadas IS 'Horas que trabajó este personal en las actividades del reporte';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE reporte_personal ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver personal de reportes de sus proyectos
CREATE POLICY "Usuarios pueden ver personal de reportes de sus proyectos"
    ON reporte_personal FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reportes r
            INNER JOIN proyecto_usuarios pu ON r.proyecto_id = pu.proyecto_id
            WHERE r.id = reporte_personal.reporte_id
            AND pu.usuario_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol = 'admin'
        )
    );

-- Usuarios pueden agregar personal a reportes de sus proyectos
CREATE POLICY "Usuarios pueden agregar personal a sus reportes"
    ON reporte_personal FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reportes r
            INNER JOIN proyecto_usuarios pu ON r.proyecto_id = pu.proyecto_id
            WHERE r.id = reporte_personal.reporte_id
            AND pu.usuario_id = auth.uid()
        )
    );

-- Usuarios pueden actualizar personal de reportes de sus proyectos
CREATE POLICY "Usuarios pueden actualizar personal de sus reportes"
    ON reporte_personal FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM reportes r
            INNER JOIN proyecto_usuarios pu ON r.proyecto_id = pu.proyecto_id
            WHERE r.id = reporte_personal.reporte_id
            AND pu.usuario_id = auth.uid()
        )
    );

-- Solo creador o admin puede eliminar personal de reportes
CREATE POLICY "Solo creador o admin pueden eliminar personal de reportes"
    ON reporte_personal FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM reportes r
            WHERE r.id = reporte_personal.reporte_id
            AND r.usuario_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE perfiles.id = auth.uid()
            AND perfiles.rol = 'admin'
        )
    );

-- =====================================================
-- FUNCIÓN HELPER PARA OBTENER RESUMEN DE PERSONAL
-- =====================================================

-- Función para obtener resumen de personal por cargo en un reporte
CREATE OR REPLACE FUNCTION get_reporte_personal_resumen(reporte_uuid UUID)
RETURNS TABLE (
    cargo_nombre VARCHAR(100),
    cantidad BIGINT,
    total_horas DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.nombre as cargo_nombre,
        COUNT(rp.id) as cantidad,
        COALESCE(SUM(rp.horas_trabajadas), 0) as total_horas
    FROM reporte_personal rp
    INNER JOIN cat_cargos c ON rp.cargo_id = c.id
    WHERE rp.reporte_id = reporte_uuid
    GROUP BY c.nombre
    ORDER BY c.nombre;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_reporte_personal_resumen IS 'Obtiene resumen de personal por cargo en un reporte específico';
