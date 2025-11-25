import { Schema, model } from 'mongoose';
import { IReporteActividades, IControlAcarreo, IControlAgua, IControlMaterial, IControlMaquinaria } from '../types/reporte.js';

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

const controlMaterialSchema = new Schema<IControlMaterial>({
  material: String,
  unidad: String,
  cantidad: String,
  zona: String,
  elevacion: String
});

const controlMaquinariaSchema = new Schema<IControlMaquinaria>({
  tipo: String,
  modelo: String,
  numeroEconomico: String,
  horasOperacion: Number,
  operador: String,
  actividad: String
});

const reporteActividadesSchema = new Schema<IReporteActividades>({
  fecha: {
    type: Date,
    required: true
  },
  ubicacion: {
    type: String,
    required: true
  },
  turno: String,
  inicioActividades: String,
  terminoActividades: String,
  zonaTrabajo: String,
  jefeFrente: String,
  sobrestante: String,
  controlAcarreos: [controlAcarreoSchema],
  controlMaterial: [controlMaterialSchema],
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