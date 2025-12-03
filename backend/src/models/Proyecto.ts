import { Schema, model, Document } from 'mongoose';

export interface IProyecto extends Document {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
  mapa?: {
    imagen: {
      data: string;
      contentType: string;
    };
    width: number;
    height: number;
  };
}

const proyectoSchema = new Schema<IProyecto>({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  ubicacion: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  mapa: {
    imagen: {
      data: String,
      contentType: String
    },
    width: Number,
    height: Number
  }
});

export default model<IProyecto>('Proyecto', proyectoSchema);