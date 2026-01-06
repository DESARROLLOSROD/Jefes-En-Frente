import express from 'express';
import Usuario from '../models/Usuario.js';
import Proyecto from '../models/Proyecto.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, setAuthCookies, clearAuthCookies, verificarToken } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validators.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();
export { verificarToken };
const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';
// Login con soporte de cookies y refresh tokens
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Intentando login para:', email);
        // Buscar usuario con debug
        console.log('📋 Buscando usuario en la base de datos...');
        const usuario = await Usuario.findOne({ email, activo: true })
            .populate('proyectos', 'nombre ubicacion descripcion mapa');
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
        // Generar tokens
        const accessToken = generateAccessToken({
            userId: usuario._id.toString(),
            email: usuario.email,
            rol: usuario.rol,
            proyectos: usuario.proyectos.map((p) => p._id.toString())
        });
        // Obtener información del dispositivo
        const deviceInfo = req.headers['user-agent'] || 'Unknown';
        const refreshToken = await generateRefreshToken(usuario._id.toString(), deviceInfo);
        console.log('✅ Tokens generados para:', usuario.nombre);
        // Configurar cookies httpOnly
        setAuthCookies(res, accessToken, refreshToken);
        const response = {
            success: true,
            data: {
                token: accessToken, // Mantener compatibilidad con clientes que usan headers
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
// Endpoint para renovar access token usando refresh token
router.post('/refresh', async (req, res) => {
    try {
        // Obtener refresh token desde cookie o body
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token requerido'
            });
        }
        // Verificar refresh token
        const tokenData = await verifyRefreshToken(refreshToken);
        const usuario = await Usuario.findById(tokenData.userId)
            .populate('proyectos', 'nombre ubicacion descripcion mapa');
        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no válido'
            });
        }
        // Generar nuevo access token
        const accessToken = generateAccessToken({
            userId: usuario._id.toString(),
            email: usuario.email,
            rol: usuario.rol,
            proyectos: usuario.proyectos.map((p) => p._id.toString())
        });
        // Configurar cookie de access token
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutos
        });
        res.json({
            success: true,
            data: {
                token: accessToken,
                user: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    proyectos: usuario.proyectos
                }
            }
        });
    }
    catch (error) {
        console.error('Error en /auth/refresh:', error);
        res.status(401).json({
            success: false,
            error: 'Refresh token inválido o expirado'
        });
    }
});
// Endpoint para logout
router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (refreshToken) {
            // Revocar refresh token
            await revokeRefreshToken(refreshToken);
        }
        // Limpiar cookies
        clearAuthCookies(res);
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    }
    catch (error) {
        console.error('Error en /auth/logout:', error);
        res.status(500).json({
            success: false,
            error: 'Error al hacer logout'
        });
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
