import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';
// Middleware para verificar token JWT
export const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            const response = {
                success: false,
                error: 'Token no proporcionado'
            };
            return res.status(401).json(response);
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRol = decoded.rol;
        req.userProyectos = decoded.proyectos || [];
        next();
    }
    catch (error) {
        const response = {
            success: false,
            error: 'Token inválido o expirado'
        };
        return res.status(401).json(response);
    }
};
// Middleware para verificar que el usuario sea admin
export const verificarAdmin = (req, res, next) => {
    if (req.userRol !== 'admin') {
        const response = {
            success: false,
            error: 'Acceso denegado. Se requiere rol de administrador'
        };
        return res.status(403).json(response);
    }
    next();
};
// Middleware para verificar que el usuario sea admin o supervisor (para crear)
export const verificarAdminOSupervisor = (req, res, next) => {
    if (req.userRol !== 'admin' && req.userRol !== 'supervisor') {
        const response = {
            success: false,
            error: 'Acceso denegado. Se requiere rol de administrador o supervisor'
        };
        return res.status(403).json(response);
    }
    next();
};
// Middleware para verificar acceso a proyecto asignado
export const verificarAccesoProyecto = (req, res, next) => {
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
        const response = {
            success: false,
            error: 'Acceso denegado. No tienes permisos para este proyecto'
        };
        return res.status(403).json(response);
    }
    next();
};
