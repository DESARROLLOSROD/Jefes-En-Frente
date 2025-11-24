import { Schema, model } from 'mongoose';
const controlAcarreoSchema = new Schema({
    material: String,
    noViaje: Number,
    capacidad: String,
    volSuelto: String,
    capaNo: String,
    elevacionAriza: String,
    capaOrigen: String,
    destino: String
});
const controlAguaSchema = new Schema({
    noEconomico: String,
    viaje: Number,
    capacidad: String,
    volumen: String,
    origen: String,
    destino: String
});
const medicionesSchema = new Schema({
    lupoBSeccion1_1: String,
    lupoBSeccion2: String,
    lupoBSeccion3: String,
    emparinado: String
});
const seccion2DatoSchema = new Schema({
    daj: String,
    valores: [String]
});
const seccion2Schema = new Schema({
    plantaIncorporacion: String,
    datos: [seccion2DatoSchema]
});
const reporteActividadesSchema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    ubicacion: {
        type: String,
        default: "SAN SEBASTIAN DEL OESTE, JALISCO, MEXICO"
    },
    turno: String,
    inicioActividades: String,
    terminoActividades: String,
    zonaTrabajo: String,
    jefeFrente: String,
    sobrestante: String,
    mediciones: medicionesSchema,
    seccion2: seccion2Schema,
    controlAcarreos: [controlAcarreoSchema],
    controlAgua: [controlAguaSchema],
    observaciones: String,
    creadoPor: String,
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});
export default model('ReporteActividades', reporteActividadesSchema);
