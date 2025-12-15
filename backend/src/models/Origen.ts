import { Schema, model, Document } from 'mongoose';

export interface IOrigen extends Document {
    nombre: string;
    fechaCreacion: Date;
    activo: boolean;
}

const origenSchema = new Schema<IOrigen>({
    nombre: {
        type: String,
        required: true,
        unique: true,
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

export default model<IOrigen>('Origen', origenSchema);
