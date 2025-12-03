import express from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import Proyecto from '../models/Proyecto.js';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';
// Login con debug
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Intentando login para:', email);
        if (!email || !password) {
            console.log('❌ Campos faltantes');
            const response = {
                success: false,
                error: 'Email y password son requeridos'
            };
            return res.status(400).json(response);
        }
        // Buscar usuario con debug
        console.log('📋 Buscando usuario en la base de datos...');
        const usuario = await Usuario.findOne({ email, activo: true })
            .populate('proyectos', 'nombre ubicacion descripcion');
        if (!usuario) {
            console.log('❌ Usuario no encontrado:', email);
            const response = {
                success: false,
                error: 'Credenciales inválidas'
            };
            return res.status(401).json(response);
        }
        console.log('✅ Usuario encontrado:', usuario.nombre);
        // Comparar password con debug
        console.log('🔑 Comparando password...');
        const passwordValido = await usuario.compararPassword(password);
        if (!passwordValido) {
            console.log('❌ Password incorrecto');
            const response = {
                success: false,
                error: 'Credenciales inválidas'
            };
            return res.status(401).json(response);
        }
        console.log('✅ Password válido');
        // Generar token
        const token = jwt.sign({
            userId: usuario._id,
            email: usuario.email,
            rol: usuario.rol
        }, JWT_SECRET, { expiresIn: '24h' });
        console.log('✅ Token generado para:', usuario.nombre);
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
        console.error('💥 ERROR en /auth/login:', error);
        console.error('Stack:', error.stack);
        const response = {
            success: false,
            error: 'Error interno del servidor'
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
        console.error('Error en /auth/proyectos:', error);
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
});
// Middleware para verificar token JWT
export const verificarToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido'
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }
};
// Middleware para verificar que el usuario es admin
export const verificarAdmin = (req, res, next) => {
    if (req.user?.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};
// Middleware para verificar que el usuario es admin o supervisor
export const verificarAdminOSupervisor = (req, res, next) => {
    if (req.user?.rol !== 'admin' && req.user?.rol !== 'supervisor') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requieren permisos de administrador o supervisor.'
        });
    }
    next();
};
export { router as authRouter };
