import { Schema, model, Document } from 'mongoose';

interface IBibliotecaMapa extends Document {
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: {
    data: string;
    contentType: string;
  };
  width: number;
  height: number;
  etiquetas: string[];
  esPublico: boolean;
  creadoPor: string;
  proyectoId?: string;
  fechaCreacion: Date;
}

const bibliotecaMapaSchema = new Schema<IBibliotecaMapa>({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true,
    default: 'GENERAL'
  },
  imagen: {
    data: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  etiquetas: [{
    type: String
  }],
  esPublico: {
    type: Boolean,
    default: false
  },
  creadoPor: {
    type: String,
    required: true
  },
  proyectoId: {
    type: String
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

export default model<IBibliotecaMapa>('BibliotecaMapa', bibliotecaMapaSchema);
