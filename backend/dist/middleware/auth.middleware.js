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
