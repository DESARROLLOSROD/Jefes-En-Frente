import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
const usuarioSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    rol: { type: String, enum: ['admin', 'supervisor', 'operador'], default: 'operador' },
    proyectos: [{ type: Schema.Types.ObjectId, ref: 'Proyecto' }],
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now }
});
// Hash password antes de guardar
usuarioSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export default model('Usuario', usuarioSchema);
