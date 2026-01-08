import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { proyectosService } from '../services/proyectos.service.js';
import { usuariosService } from '../services/usuarios.service.js';
import { ApiResponse } from '../types/reporte.js';
import {
  setAuthCookies,
  clearAuthCookies,
  verificarToken,
  AuthRequest
} from '../middleware/auth.js';
import { validateLogin } from '../middleware/validators.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
export { verificarToken, AuthRequest };

/**
 * Login con Supabase Auth
 */
router.post('/login', loginLimiter, validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Intentando login con Supabase Auth para:', email);

    // Autenticar con Supabase usando Admin API
    // Primero verificar que el usuario existe y obtener su ID
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.log('❌ Error listando usuarios:', listError.message);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Error del servidor'
      };
      return res.status(500).json(response);
    }

    const existingUser = users.users.find(u => u.email === email);

    if (!existingUser) {
      console.log('❌ Usuario no encontrado:', email);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Credenciales inválidas'
      };
      return res.status(401).json(response);
    }

    // Intentar autenticar con Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user || !data.session) {
      console.log('❌ Error de autenticación:', error?.message);
      const response: ApiResponse<null> = {
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
      const response: ApiResponse<null> = {
        success: false,
        error: 'Usuario inactivo'
      };
      return res.status(401).json(response);
    }

    console.log('✅ Usuario encontrado:', usuario.nombre);

    // Configurar cookies con tokens de Supabase
    setAuthCookies(res, data.session.access_token, data.session.refresh_token);

    const response: ApiResponse<{ token: string; user: any }> = {
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

  } catch (error: any) {
    console.error('💥 ERROR en /auth/login:', error);
    console.error('Stack:', error.stack);

    const response: ApiResponse<null> = {
      success: false,
      error: 'Error interno del servidor'
    };
    res.status(500).json(response);
  }
});

/**
 * Refresh token usando Supabase Auth
 */
router.post('/refresh', async (req: Request, res: Response) => {
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

  } catch (error: any) {
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
router.post('/logout', async (req: Request, res: Response) => {
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

  } catch (error: any) {
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
router.get('/proyectos', async (req: Request, res: Response) => {
  try {
    const proyectos = await proyectosService.getProyectos(true);

    const response: ApiResponse<any[]> = {
      success: true,
      data: proyectos
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en /auth/proyectos:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

/**
 * Middleware para verificar que el usuario es admin
 */
export const verificarAdmin = (req: any, res: any, next: any) => {
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
export const verificarAdminOSupervisor = (req: any, res: any, next: any) => {
  if (req.user?.rol !== 'admin' && req.user?.rol !== 'supervisor') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador o supervisor.'
    });
  }
  next();
};

export { router as authRouter };
