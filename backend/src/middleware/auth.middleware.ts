import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/reporte.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
    userRol?: 'admin' | 'supervisor' | 'operador';
    userProyectos?: string[];
}

// Middleware para verificar token JWT
export const verificarToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Token no proporcionado'
            };
            return res.status(401).json(response);
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            rol: 'admin' | 'supervisor' | 'operador';
            proyectos?: string[];
        };

        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRol = decoded.rol;
        req.userProyectos = decoded.proyectos || [];

        next();
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Token inválido o expirado'
        };
        return res.status(401).json(response);
    }
};

// Middleware para verificar que el usuario sea admin
export const verificarAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRol !== 'admin') {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Acceso denegado. Se requiere rol de administrador'
        };
        return res.status(403).json(response);
    }
    next();
};

// Middleware para verificar que el usuario sea admin o supervisor (para crear)
export const verificarAdminOSupervisor = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRol !== 'admin' && req.userRol !== 'supervisor') {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Acceso denegado. Se requiere rol de administrador o supervisor'
        };
        return res.status(403).json(response);
    }
    next();
};

// Middleware para verificar acceso a proyecto asignado
export const verificarAccesoProyecto = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Admin tiene acceso a todos los proyectos
    if (req.userRol === 'admin') {
        return next();
    }

    // Para supervisor y operador, verificar que el proyecto esté en su lista
    const proyectoId = req.body.proyecto || req.params.proyectoId || req.query.proyecto;

    if (!proyectoId) {
        return next(); // Si no hay proyecto específico, continuar
    }

    if (!req.userProyectos || !req.userProyectos.includes(proyectoId)) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Acceso denegado. No tienes permisos para este proyecto'
        };
        return res.status(403).json(response);
    }

    next();
};
