import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
const JWT_SECRET = process.env.JWT_SECRET || 'jefesenfrente_secret_2024';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'jefesenfrente_refresh_secret_2024';
/**
 * Middleware de autenticación que soporta tanto cookies como headers
 */
export const authMiddleware = (req, res, next) => {
    // Intentar obtener el token desde cookie primero, luego desde header
    let token = req.cookies?.accessToken;
    if (!token) {
        token = req.header('Authorization')?.replace('Bearer ', '');
    }
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
        // Si el token expiró, indicar que necesita refresh
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }
};
/**
 * Genera un access token (corta duración: 15 minutos)
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};
/**
 * Genera un refresh token (larga duración: 7 días)
 */
export const generateRefreshToken = async (userId, deviceInfo) => {
    // Generar token único
    const token = crypto.randomBytes(64).toString('hex');
    // Calcular fecha de expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    // Guardar en la base de datos
    await RefreshToken.create({
        userId,
        token,
        expiresAt,
        deviceInfo
    });
    return token;
};
/**
 * Verifica y valida un refresh token
 */
export const verifyRefreshToken = async (token) => {
    const refreshToken = await RefreshToken.findOne({ token }).populate('userId');
    if (!refreshToken) {
        throw new Error('Refresh token no encontrado');
    }
    if (refreshToken.isRevoked) {
        throw new Error('Refresh token revocado');
    }
    if (refreshToken.expiresAt < new Date()) {
        throw new Error('Refresh token expirado');
    }
    return refreshToken;
};
/**
 * Revoca un refresh token
 */
export const revokeRefreshToken = async (token) => {
    await RefreshToken.updateOne({ token }, { $set: { isRevoked: true } });
};
/**
 * Configura las cookies de autenticación
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    // Cookie para access token (15 minutos)
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction, // HTTPS en producción
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutos
    });
    // Cookie para refresh token (7 días)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });
};
/**
 * Limpia las cookies de autenticación
 */
export const clearAuthCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};
