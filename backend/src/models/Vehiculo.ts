import { Schema, model, Document } from 'mongoose';

export interface IVehiculo extends Document {
    nombre: string;
    tipo: string;
    horometroInicial: number;
    horometroFinal?: number;
    horasOperacion: number;
    noEconomico: string;
    proyectos: Schema.Types.ObjectId[];
    activo: boolean;
    fechaCreacion: Date;
}

const vehiculoSchema = new Schema<IVehiculo>({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        required: true,
        trim: true
    },
    horometroInicial: {
        type: Number,
        required: true,
        min: 0
    },
    horometroFinal: {
        type: Number,
        min: 0
    },
    horasOperacion: {
        type: Number,
        default: 0,
        min: 0
    },
    noEconomico: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    proyectos: {
        type: [Schema.Types.ObjectId],
        ref: 'Proyecto',
        default: []
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

export default model<IVehiculo>('Vehiculo', vehiculoSchema);
