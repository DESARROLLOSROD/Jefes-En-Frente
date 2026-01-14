-- =====================================================
-- MIGRACIÓN: Biblioteca de Mapas
-- Descripción: Tabla para almacenar mapas reutilizables en la biblioteca
-- Fecha: 2026-01-14
-- =====================================================

-- Crear tabla biblioteca_mapas
CREATE TABLE IF NOT EXISTS public.biblioteca_mapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL DEFAULT 'GENERAL',

  -- Datos de imagen (base64)
  imagen_data TEXT NOT NULL,
  imagen_content_type VARCHAR(100) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,

  -- Clasificación y búsqueda
  etiquetas TEXT[] DEFAULT '{}',
  es_publico BOOLEAN DEFAULT FALSE,

  -- Relaciones
  creado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE SET NULL,

  -- Timestamps
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_categoria ON public.biblioteca_mapas(categoria);
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_creado_por ON public.biblioteca_mapas(creado_por);
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_proyecto ON public.biblioteca_mapas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_publico ON public.biblioteca_mapas(es_publico);
CREATE INDEX IF NOT EXISTS idx_biblioteca_mapas_etiquetas ON public.biblioteca_mapas USING GIN(etiquetas);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.biblioteca_mapas ENABLE ROW LEVEL SECURITY;

-- Política: Ver mapas públicos o propios
CREATE POLICY "Usuarios pueden ver mapas públicos o propios"
  ON public.biblioteca_mapas
  FOR SELECT
  USING (
    es_publico = TRUE
    OR creado_por = auth.uid()
  );

-- Política: Crear mapas
CREATE POLICY "Usuarios pueden crear mapas"
  ON public.biblioteca_mapas
  FOR INSERT
  WITH CHECK (creado_por = auth.uid());

-- Política: Actualizar solo mapas propios
CREATE POLICY "Usuarios pueden actualizar solo sus mapas"
  ON public.biblioteca_mapas
  FOR UPDATE
  USING (creado_por = auth.uid())
  WITH CHECK (creado_por = auth.uid());

-- Política: Eliminar solo mapas propios
CREATE POLICY "Usuarios pueden eliminar solo sus mapas"
  ON public.biblioteca_mapas
  FOR DELETE
  USING (creado_por = auth.uid());

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.biblioteca_mapas IS 'Biblioteca de mapas reutilizables para proyectos';
COMMENT ON COLUMN public.biblioteca_mapas.imagen_data IS 'Imagen en formato base64';
COMMENT ON COLUMN public.biblioteca_mapas.etiquetas IS 'Array de etiquetas para búsqueda y clasificación';
COMMENT ON COLUMN public.biblioteca_mapas.es_publico IS 'Si es TRUE, todos los usuarios pueden ver el mapa';
