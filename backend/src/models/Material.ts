import { Schema, model, Document } from 'mongoose';

export interface IMaterial extends Document {
    nombre: string;
    unidad?: string;
    fechaCreacion: Date;
    activo: boolean;
}

const materialSchema = new Schema<IMaterial>({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    unidad: {
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

export default model<IMaterial>('Material', materialSchema);
