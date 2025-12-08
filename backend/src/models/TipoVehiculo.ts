import { Schema, model, Document } from 'mongoose';

export interface ITipoVehiculo extends Document {
    nombre: string;
    activo: boolean;
    fechaCreacion: Date;
}

const tipoVehiculoSchema = new Schema<ITipoVehiculo>({
    nombre: {
        type: String,
        required: true,
        unique: true,
        trim: true
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

export default model<ITipoVehiculo>('TipoVehiculo', tipoVehiculoSchema);
