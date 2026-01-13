export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ICapacidadCatalog {
  _id: string;
  valor: string;
  etiqueta?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface IMaterialCatalog {
  _id: string;
  nombre: string;
  unidad?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface ControlAcarreo {
  material: string;
  noViaje: number;
  capacidad: string;
  volSuelto: string;
  capaNo: string;
  elevacionAriza: string;
  capaOrigen: string;
  destino: string;
}

export interface ControlMaterial {
  material: string;
  unidad: string;
  cantidad: string;
  zona: string;
  elevacion: string;
}

export interface ControlAgua {
  noEconomico: string;
  viaje: number;
  capacidad: string;
  volumen: string;
  origen: string;
  destino: string;
}

export interface ControlMaquinaria {
  vehiculoId?: string;  // ✨ NUEVO - ID del vehículo seleccionado
  nombre: string;       // ✨ NUEVO - Nombre del vehículo
  tipo: string;
  numeroEconomico: string;
  horometroInicial: number;    // ✨ NUEVO
  horometroFinal: number;      // ✨ NUEVO
  horasOperacion: number;      // Calculado automáticamente
  operador: string;
  actividad: string;
}


export interface ZonaTrabajo {
  zonaId: string;
  zonaNombre: string;
}

export interface SeccionTrabajo {
  seccionId: string;
  seccionNombre: string;
}

export interface ModificacionReporte {
  fechaModificacion: string;
  usuarioId: string;
  usuarioNombre: string;
  cambios: {
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
  }[];
  observacion?: string;
}

import { ReportePersonal } from './personal';

export interface ReporteActividades {
  _id?: string;
  // NUEVO: Campos de autenticación
  usuarioId: string;
  proyectoId: string;
  ubicacion: string; // Ahora se obtiene del proyecto
  fecha: string;
  turno: 'primer' | 'segundo';
  inicioActividades: string;
  terminoActividades: string;
  zonaTrabajo: ZonaTrabajo;
  seccionTrabajo: SeccionTrabajo;
  jefeFrente: string;
  sobrestante: string;
  controlAcarreo: ControlAcarreo[];
  controlMaterial: ControlMaterial[];
  controlAgua: ControlAgua[];
  controlMaquinaria: ControlMaquinaria[];
  personalAsignado?: ReportePersonal[]; // ✨ NUEVO - Personal asignado al reporte
  observaciones: string;
  ubicacionMapa?: {
    pinX: number;
    pinY: number;
    colocado: boolean;
  };
  // Múltiples pins con etiquetas
  pinesMapa?: Array<{
    id: string;
    pinX: number;
    pinY: number;
    etiqueta: string;
    color?: string;
  }>;
  // Anotaciones del mapa
  textosAnotacion?: Array<{
    id: string;
    x: number;
    y: number;
    texto: string;
    color: string;
    fontSize: number;
  }>;
  dibujosLibres?: Array<{
    id: string;
    puntos: { x: number; y: number }[];
    color: string;
    grosor: number;
    tipo: 'linea' | 'flecha';
  }>;
  formasMapa?: Array<{
    id: string;
    tipo: 'rectangulo' | 'circulo';
    x: number;
    y: number;
    ancho?: number;
    alto?: number;
    radio?: number;
    color: string;
    relleno: boolean;
  }>;
  medidasMapa?: Array<{
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    distancia: number;
    color: string;
  }>;
  // REMOVER: creadoPor ya no es necesario
  fechaCreacion?: string;
  creadoPor?: string; // Optional as per usage in FormularioReporte.tsx line 47
  historialModificaciones?: ModificacionReporte[];
}