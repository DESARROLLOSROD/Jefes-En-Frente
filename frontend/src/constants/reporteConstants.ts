// Constantes para el sistema de reportes

export const MATERIALES = [
  'Base Hidráulica',
  'Sub-base Hidráulica',
  'Material Producto',
  'Material Cribado',
  'Tepetate',
  'Arena',
  'Grava',
  'Concreto',
  'Asfalto',
  'Relleno',
  'Tierra Negra',
  'Tezontle',
  'Material de Banco'
] as const;

export const ORIGENES = [
  'Banco de Material Km 12',
  'Banco de Material Km 15',
  'Banco de Material Km 20',
  'Banco Central',
  'Banco Norte',
  'Banco Sur',
  'Planta de Concreto',
  'Planta de Asfalto',
  'Almacén General',
  'Zona de Acopio',
  'Patio de Maniobras',
  'Sitio Externo'
] as const;

export const DESTINOS = [
  'Tramo 1',
  'Tramo 2',
  'Tramo 3',
  'Tramo 4',
  'Tramo 5',
  'Zona A',
  'Zona B',
  'Zona C',
  'Zona D',
  'Estación 0+000',
  'Estación 0+500',
  'Estación 1+000',
  'Estación 1+500',
  'Estación 2+000',
  'Terraplén',
  'Corte',
  'Cuneta',
  'Capa Base',
  'Capa Sub-base',
  'Carpeta Asfáltica'
] as const;

export const CAPACIDADES_CAMION = [
  { value: '6', label: '6 m³' },
  { value: '7', label: '7 m³' },
  { value: '8', label: '8 m³' },
  { value: '10', label: '10 m³' },
  { value: '12', label: '12 m³' },
  { value: '14', label: '14 m³' },
  { value: '16', label: '16 m³' },
  { value: '20', label: '20 m³' }
] as const;

export const UNIDADES_MEDIDA = [
  { value: 'm³', label: 'm³ (Metros Cúbicos)' },
  { value: 'ton', label: 'Toneladas' },
  { value: 'pza', label: 'Piezas' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'lt', label: 'Litros' },
  { value: 'm²', label: 'm² (Metros Cuadrados)' },
  { value: 'ml', label: 'ml (Metros Lineales)' }
] as const;

export type Material = typeof MATERIALES[number];
export type Origen = typeof ORIGENES[number];
export type Destino = typeof DESTINOS[number];
