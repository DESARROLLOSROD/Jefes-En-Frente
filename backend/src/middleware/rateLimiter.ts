import rateLimit from 'express-rate-limit';

// Rate limiter para login (más restrictivo)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de login. Por favor intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Rate limiter para creación de recursos (moderado)
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo 30 creaciones
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para APIs generales (menos restrictivo)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para endpoints de lectura
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // máximo 60 requests por minuto
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
