-- ========================================
-- MIGRACIÓN: Agregar columna 'fijado' a pines_mapa
-- ========================================
-- Permite marcar pines como fijos para usar como puntos de referencia en mediciones

-- Agregar columna fijado a la tabla pines_mapa
ALTER TABLE pines_mapa
ADD COLUMN IF NOT EXISTS fijado BOOLEAN DEFAULT FALSE;

-- Comentario
COMMENT ON COLUMN pines_mapa.fijado IS 'Indica si el pin está fijado para usarse como punto de referencia en mediciones';
