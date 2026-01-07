import { Schema, model } from 'mongoose';
import { IReporteActividades, IControlAcarreo, IControlAgua, IControlMaterial, IControlMaquinaria, IModificacionReporte } from '../types/reporte.js';

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
  actividad: String,
  vehiculoId: { type: Schema.Types.ObjectId, ref: 'Vehiculo' },
  horometroInicial: Number,
  horometroFinal: Number
});

const modificacionReporteSchema = new Schema<IModificacionReporte>({
  fechaModificacion: {
    type: Date,
    default: Date.now
  },
  usuarioId: {
    type: String,
    required: true
  },
  usuarioNombre: {
    type: String,
    required: true
  },
  cambios: [{
    campo: String,
    valorAnterior: Schema.Types.Mixed,
    valorNuevo: Schema.Types.Mixed
  }],
  observacion: String
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
  zonaTrabajo: {
    zonaId: String,
    zonaNombre: String
  },
  seccionTrabajo: {
    seccionId: String,
    seccionNombre: String
  },
  jefeFrente: String,
  sobrestante: String,
  controlAcarreo: [controlAcarreoSchema],
  controlMaterial: [controlMaterialSchema],
  controlAgua: [controlAguaSchema],
  controlMaquinaria: [controlMaquinariaSchema],
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
  offlineId: {
    type: String,
    index: true // Índice para buscar rápidamente duplicados
  },
  ubicacionMapa: {
    pinX: Number,
    pinY: Number,
    colocado: Boolean
  },
  pinesMapa: [{
    id: String,
    pinX: Number,
    pinY: Number,
    etiqueta: String,
    color: String
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  historialModificaciones: [modificacionReporteSchema]
});

export default model<IReporteActividades>('ReporteActividades', reporteActividadesSchema);
