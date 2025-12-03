import { Schema, model } from 'mongoose';
const proyectoSchema = new Schema({
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
export default model('Proyecto', proyectoSchema);
