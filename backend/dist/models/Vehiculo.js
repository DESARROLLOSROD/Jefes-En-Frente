import { Schema, model } from 'mongoose';
const vehiculoSchema = new Schema({
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
export default model('Vehiculo', vehiculoSchema);
