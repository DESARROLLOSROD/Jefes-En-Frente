import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/reporte.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
    userRol?: 'admin' | 'supervisor' | 'operador';
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
        };

        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRol = decoded.rol;

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
