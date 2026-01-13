-- ========================================
-- MIGRACIÓN: Anotaciones de Mapa
-- ========================================
-- Agrega tablas para textos, dibujos, formas y medidas en los mapas de reportes
-- Similar a la estructura existente de pines_mapa

-- 1. Textos de anotación
CREATE TABLE IF NOT EXISTS textos_anotacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  texto_id TEXT NOT NULL, -- ID del texto en el frontend
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  texto TEXT NOT NULL,
  color TEXT NOT NULL,
  font_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dibujos libres (líneas y trazos)
CREATE TABLE IF NOT EXISTS dibujos_libres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  dibujo_id TEXT NOT NULL, -- ID del dibujo en el frontend
  puntos JSONB NOT NULL, -- Array de {x, y}
  color TEXT NOT NULL,
  grosor INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- 'linea' o 'flecha'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Formas (rectángulos y círculos)
CREATE TABLE IF NOT EXISTS formas_mapa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  forma_id TEXT NOT NULL, -- ID de la forma en el frontend
  tipo TEXT NOT NULL, -- 'rectangulo' o 'circulo'
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  ancho NUMERIC, -- Para rectángulos
  alto NUMERIC, -- Para rectángulos
  radio NUMERIC, -- Para círculos
  color TEXT NOT NULL,
  relleno BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medidas (líneas de medición con distancia)
CREATE TABLE IF NOT EXISTS medidas_mapa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporte_id UUID REFERENCES reportes(id) ON DELETE CASCADE,
  medida_id TEXT NOT NULL, -- ID de la medida en el frontend
  x1 NUMERIC NOT NULL,
  y1 NUMERIC NOT NULL,
  x2 NUMERIC NOT NULL,
  y2 NUMERIC NOT NULL,
  distancia NUMERIC NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_textos_anotacion_reporte ON textos_anotacion(reporte_id);
CREATE INDEX IF NOT EXISTS idx_dibujos_libres_reporte ON dibujos_libres(reporte_id);
CREATE INDEX IF NOT EXISTS idx_formas_mapa_reporte ON formas_mapa(reporte_id);
CREATE INDEX IF NOT EXISTS idx_medidas_mapa_reporte ON medidas_mapa(reporte_id);

-- ========================================
-- COMENTARIOS
-- ========================================
COMMENT ON TABLE textos_anotacion IS 'Textos colocados en mapas de reportes';
COMMENT ON TABLE dibujos_libres IS 'Dibujos libres (líneas y trazos) en mapas de reportes';
COMMENT ON TABLE formas_mapa IS 'Formas geométricas (rectángulos y círculos) en mapas de reportes';
COMMENT ON TABLE medidas_mapa IS 'Líneas de medición con distancia en mapas de reportes';
