import { Document, Types } from 'mongoose';

export interface IControlAcarreo {
  material: string;
  noViaje: number;
  capacidad: string;
  volSuelto: string;
  capaNo: string;
  elevacionAriza: string;
  capaOrigen: string;
  destino: string;
}
export interface IControlMaterial {
  material: string;
  unidad: string;
  cantidad: string;
  zona: string;
  elevacion: string;
}

export interface IControlAgua {
  noEconomico: string;
  viaje: number;
  capacidad: string;
  volumen: string;
  origen: string;
  destino: string;
}

export interface IControlMaquinaria {
  tipo: string;
  modelo: string;
  numeroEconomico: string;
  horasOperacion: number;
  operador: string;
  actividad: string;
  vehiculoId?: string;
  horometroInicial?: number;
  horometroFinal?: number;
}

export interface IZonaTrabajo {
  zonaId: string;
  zonaNombre: string;
}

export interface ISeccionTrabajo {
  seccionId: string;
  seccionNombre: string;
}

export interface IModificacionReporte {
  fechaModificacion: Date;
  usuarioId: string;
  usuarioNombre: string;
  cambios: {
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
  }[];
  observacion?: string;
}

export interface IReporteActividades extends Document {
  fecha: Date;
  ubicacion: string;
  turno: string;
  inicioActividades: string;
  terminoActividades: string;
  zonaTrabajo: IZonaTrabajo;
  seccionTrabajo: ISeccionTrabajo;
  jefeFrente: string;
  sobrestante: string;
  controlAcarreo: Types.Array<IControlAcarreo>;
  controlMaterial: Types.Array<IControlMaterial>;
  controlAgua: Types.Array<IControlAgua>;
  controlMaquinaria: Types.Array<IControlMaquinaria>;
  observaciones: string;
  creadoPor: string;
  proyectoId: string;
  usuarioId: string;
  offlineId?: string; // ID único generado por el cliente para evitar duplicados
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
  // Anotaciones de texto
  textosAnotacion?: Array<{
    id: string;
    x: number;
    y: number;
    texto: string;
    color: string;
    fontSize: number;
  }>;
  // Dibujos libres
  dibujosLibres?: Array<{
    id: string;
    puntos: Array<{
      x: number;
      y: number;
    }>;
    color: string;
    grosor: number;
    tipo: string;
  }>;
  // Formas (rectángulos y círculos)
  formasMapa?: Array<{
    id: string;
    tipo: string;
    x: number;
    y: number;
    ancho?: number;
    alto?: number;
    radio?: number;
    color: string;
    relleno: boolean;
  }>;
  // Medidas
  medidasMapa?: Array<{
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    distancia: number;
    color: string;
  }>;
  fechaCreacion: Date;
  historialModificaciones?: Types.Array<IModificacionReporte>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
