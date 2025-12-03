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
  ubicacionMapa?: {
    pinX: number;
    pinY: number;
    colocado: boolean;
  };
  fechaCreacion: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
