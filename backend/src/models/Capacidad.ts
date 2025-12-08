import { Schema, model, Document } from 'mongoose';

export interface ICapacidad extends Document {
    valor: string;
    etiqueta?: string;
    activo: boolean;
    fechaCreacion: Date;
}

const capacidadSchema = new Schema<ICapacidad>({
    valor: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    etiqueta: {
        type: String,
        trim: true,
        uppercase: true
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

export default model<ICapacidad>('Capacidad', capacidadSchema);
