import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { proyectosService } from '../services/proyectos.service.js';
import { usuariosService } from '../services/usuarios.service.js';
import { setAuthCookies, clearAuthCookies, verificarToken } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validators.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
const router = express.Router();
export { verificarToken };
/**
 * Login con Supabase Auth
 */
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Intentando login con Supabase Auth para:', email);
        // Autenticar con Supabase
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });
        if (error || !data.user || !data.session) {
            console.log('❌ Error de autenticación:', error?.message);
            const response = {
                success: false,
                error: 'Credenciales inválidas'
            };
            return res.status(401).json(response);
        }
        console.log('✅ Autenticación exitosa para:', data.user.email);
        // Obtener perfil y proyectos del usuario
        const usuario = await usuariosService.getUsuarioById(data.user.id);
        if (!usuario || !usuario.activo) {
            console.log('❌ Usuario inactivo o sin perfil');
            const response = {
                success: false,
                error: 'Usuario inactivo'
            };
            return res.status(401).json(response);
        }
        console.log('✅ Usuario encontrado:', usuario.nombre);
        // Configurar cookies con tokens de Supabase
        setAuthCookies(res, data.session.access_token, data.session.refresh_token);
        const response = {
            success: true,
            data: {
                token: data.session.access_token,
                user: {
                    _id: usuario.id,
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: data.user.email,
                    rol: usuario.rol,
                    proyectos: usuario.proyectos || []
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
/**
 * Refresh token usando Supabase Auth
 */
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
        console.log('🔄 Renovando token de sesión...');
        // Renovar sesión con Supabase
        const { data, error } = await supabaseAdmin.auth.refreshSession({
            refresh_token: refreshToken
        });
        if (error || !data.session || !data.user) {
            console.log('❌ Error renovando token:', error?.message);
            return res.status(401).json({
                success: false,
                error: 'Refresh token inválido o expirado'
            });
        }
        console.log('✅ Token renovado para:', data.user.email);
        // Obtener perfil del usuario
        const usuario = await usuariosService.getUsuarioById(data.user.id);
        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no válido'
            });
        }
        // Configurar nueva cookie de access token
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', data.session.access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
            success: true,
            data: {
                token: data.session.access_token,
                user: {
                    _id: usuario.id,
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: data.user.email,
                    rol: usuario.rol,
                    proyectos: usuario.proyectos || []
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
/**
 * Logout con Supabase Auth
 */
router.post('/logout', async (req, res) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        if (accessToken) {
            // Cerrar sesión en Supabase (invalida el token)
            await supabaseAdmin.auth.signOut();
        }
        // Limpiar cookies
        clearAuthCookies(res);
        console.log('✅ Logout exitoso');
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
/**
 * Obtener proyectos activos (público)
 */
router.get('/proyectos', async (req, res) => {
    try {
        const proyectos = await proyectosService.getProyectos(true);
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
/**
 * Middleware para verificar que el usuario es admin
 */
export const verificarAdmin = (req, res, next) => {
    if (req.user?.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};
/**
 * Middleware para verificar que el usuario es admin o supervisor
 */
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
