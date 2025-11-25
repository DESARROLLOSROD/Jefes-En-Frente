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

export interface IControlAgua {
  noEconomico: string;
  viaje: number;
  capacidad: string;
  volumen: string;
  origen: string;
  destino: string;
}

export interface IMediciones {
  lupoBSeccion1_1: string;
  lupoBSeccion2: string;
  lupoBSeccion3: string;
  emparinado: string;
}

export interface ISeccion2Dato {
  daj: string;
  valores: string[];
}

export interface ISeccion2 {
  plantaIncorporacion: string;
  datos: ISeccion2Dato[];
}

export interface IReporteActividades extends Document {
  fecha: Date;
  ubicacion: string;
  turno: string;
  inicioActividades: string;
  terminoActividades: string;
  zonaTrabajo: string;
  jefeFrente: string;
  sobrestante: string;
  mediciones: IMediciones;
  seccion2: ISeccion2;
  controlAcarreos: Types.Array<IControlAcarreo>;
  controlAgua: Types.Array<IControlAgua>;
  observaciones: string;
  creadoPor: string;
  proyectoId: string;
  usuarioId: string;
  fechaCreacion: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}