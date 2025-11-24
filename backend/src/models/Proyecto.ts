import { Schema, model, Document } from 'mongoose';

export interface IProyecto extends Document {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
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
  }
});

export default model<IProyecto>('Proyecto', proyectoSchema);