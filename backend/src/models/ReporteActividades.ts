import { Schema, model } from 'mongoose';
import { IReporteActividades, IControlAcarreo, IControlAgua, IMediciones, ISeccion2 } from '../types/reporte.js';

const controlAcarreoSchema = new Schema<IControlAcarreo>({
  material: String,
  noViaje: Number,
  capacidad: String,
  volSuelto: String,
  capaNo: String,
  elevacionAriza: String,
  capaOrigen: String,
  destino: String
});

const controlAguaSchema = new Schema<IControlAgua>({
  noEconomico: String,
  viaje: Number,
  capacidad: String,
  volumen: String,
  origen: String,
  destino: String
});

const medicionesSchema = new Schema<IMediciones>({
  lupoBSeccion1_1: String,
  lupoBSeccion2: String,
  lupoBSeccion3: String,
  emparinado: String
});

const seccion2DatoSchema = new Schema({
  daj: String,
  valores: [String]
});

const seccion2Schema = new Schema<ISeccion2>({
  plantaIncorporacion: String,
  datos: [seccion2DatoSchema]
});

const reporteActividadesSchema = new Schema<IReporteActividades>({
  fecha: {
    type: Date,
    required: true
  },
  ubicacion: {
    type: String,
  },
  turno: String,
  inicioActividades: String,
  terminoActividades: String,
  zonaTrabajo: String,
  jefeFrente: String,
  sobrestante: String,
  mediciones: medicionesSchema,
  seccion2: seccion2Schema,
  controlAcarreos: [controlAcarreoSchema],
  controlAgua: [controlAguaSchema],
  observaciones: String,
  creadoPor: String,
  proyectoId: {
    type: String,
    required: true,
    index: true
  },
  usuarioId: {
    type: String,
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

export default model<IReporteActividades>('ReporteActividades', reporteActividadesSchema);