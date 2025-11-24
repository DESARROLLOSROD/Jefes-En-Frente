import express from 'express';
import * as jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import Proyecto from '../models/Proyecto.js';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const response = {
                success: false,
                error: 'Email y password son requeridos'
            };
            return res.status(400).json(response);
        }
        const usuario = await Usuario.findOne({ email, activo: true })
            .populate('proyectos', 'nombre ubicacion descripcion');
        if (!usuario || !(await usuario.compararPassword(password))) {
            const response = {
                success: false,
                error: 'Credenciales inválidas'
            };
            return res.status(401).json(response);
        }
        const token = jwt.sign({
            userId: usuario._id,
            email: usuario.email,
            rol: usuario.rol
        }, JWT_SECRET, { expiresIn: '24h' });
        const response = {
            success: true,
            data: {
                token,
                user: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    proyectos: usuario.proyectos
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
});
// Obtener proyectos
router.get('/proyectos', async (req, res) => {
    try {
        const proyectos = await Proyecto.find({ activo: true });
        const response = {
            success: true,
            data: proyectos
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
});
export { router as authRouter };
