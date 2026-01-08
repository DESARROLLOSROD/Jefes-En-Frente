import { supabaseAdmin } from '../config/supabase.js';
/**
 * Middleware de autenticación usando Supabase Auth
 * Soporta tanto cookies como headers
 */
export const verificarToken = async (req, res, next) => {
    // Intentar obtener el token desde cookie primero, luego desde header
    let token = req.cookies?.accessToken;
    if (!token) {
        const authHeader = req.header('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer ', '');
        }
    }
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido'
        });
    }
    try {
        // Verificar token con Supabase Admin (necesario para verificar tokens en servidor)
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            console.log('❌ Token verification failed:', error?.message);
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado',
                code: error?.message === 'JWT expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
            });
        }
        // Obtener datos adicionales del perfil (rol, proyectos)
        const { data: perfil, error: perfilError } = await supabaseAdmin
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single();
        if (perfilError || !perfil) {
            console.log('❌ Profile not found for user:', user.id);
            return res.status(401).json({
                success: false,
                error: 'Perfil de usuario no encontrado'
            });
        }
        // Obtener proyectos del usuario
        const { data: proyectosData } = await supabaseAdmin
            .from('proyecto_usuarios')
            .select('proyecto_id')
            .eq('usuario_id', user.id);
        const proyectos = proyectosData?.map(p => p.proyecto_id) || [];
        // Agregar info del usuario a la request
        req.user = {
            userId: user.id,
            email: user.email || '',
            rol: perfil.rol,
            proyectos
        };
        next();
    }
    catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).json({
            success: false,
            error: 'Error verificando autenticación'
        });
    }
};
/**
 * Configura las cookies de autenticación
 * Para Supabase, solo guardamos el access token
 * Supabase maneja el refresh token automáticamente
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    // Cookie para access token
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días (Supabase maneja la expiración)
    });
    // Opcionalmente guardar refresh token (si se proporciona)
    if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
    }
};
/**
 * Limpia las cookies de autenticación
 */
export const clearAuthCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};
/**
 * Middleware para verificar que el usuario sea admin
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
 * Middleware para verificar que el usuario sea admin o supervisor
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
