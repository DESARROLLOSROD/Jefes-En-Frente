// Constantes para el sistema de reportes

export const MATERIALES = [
  'BASE HIDRÁULICA',
  'SUB-BASE HIDRÁULICA',
  'MATERIAL PRODUCTO',
  'MATERIAL CRIBADO',
  'TEPETATE',
  'ARENA',
  'GRAVA',
  'CONCRETO',
  'ASFALTO',
  'RELLENO',
  'TIERRA NEGRA',
  'TEZONTLE',
  'MATERIAL DE BANCO'
] as const;

export const ORIGENES = [
  'BANCO DE MATERIAL KM 12',
  'BANCO DE MATERIAL KM 15',
  'BANCO DE MATERIAL KM 20',
  'BANCO CENTRAL',
  'BANCO NORTE',
  'BANCO SUR',
  'PLANTA DE CONCRETO',
  'PLANTA DE ASFALTO',
  'ALMACÉN GENERAL',
  'ZONA DE ACOPIO',
  'PATIO DE MANIOBRAS',
  'SITIO EXTERNO'
] as const;

export const DESTINOS = [
  'TRAMO 1',
  'TRAMO 2',
  'TRAMO 3',
  'TRAMO 4',
  'TRAMO 5',
  'ZONA A',
  'ZONA B',
  'ZONA C',
  'ZONA D',
  'ESTACIÓN 0+000',
  'ESTACIÓN 0+500',
  'ESTACIÓN 1+000',
  'ESTACIÓN 1+500',
  'ESTACIÓN 2+000',
  'TERRAPLÉN',
  'CORTE',
  'CUNETA',
  'CAPA BASE',
  'CAPA SUB-BASE',
  'CARPETA ASFÁLTICA'
] as const;

export const CAPACIDADES_CAMION = [
  { value: '6', label: '6 M³' },
  { value: '7', label: '7 M³' },
  { value: '8', label: '8 M³' },
  { value: '10', label: '10 M³' },
  { value: '12', label: '12 M³' },
  { value: '14', label: '14 M³' },
  { value: '16', label: '16 M³' },
  { value: '20', label: '20 M³' }
] as const;

export const UNIDADES_MEDIDA = [
  { value: 'm³', label: 'M³ (METROS CÚBICOS)' },
  { value: 'ton', label: 'TONELADAS' },
  { value: 'pza', label: 'PIEZAS' },
  { value: 'kg', label: 'KILOGRAMOS' },
  { value: 'lt', label: 'LITROS' },
  { value: 'm²', label: 'M² (METROS CUADRADOS)' },
  { value: 'ml', label: 'ML (METROS LINEALES)' }
] as const;

export type Material = typeof MATERIALES[number];
export type Origen = typeof ORIGENES[number];
export type Destino = typeof DESTINOS[number];
