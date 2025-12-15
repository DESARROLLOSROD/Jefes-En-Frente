import { Schema, model, Document } from 'mongoose';

export interface IDestino extends Document {
    nombre: string;
    fechaCreacion: Date;
    activo: boolean;
}

const destinoSchema = new Schema<IDestino>({
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

export default model<IDestino>('Destino', destinoSchema);
