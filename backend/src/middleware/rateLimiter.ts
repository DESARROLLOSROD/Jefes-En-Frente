import rateLimit from 'express-rate-limit';

// Rate limiter para login (más restrictivo)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 25, // máximo 25 intentos (ajustado para evitar bloqueos falsos positivos)
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
  max: 100, // máximo 100 creaciones (aumentado de 30)
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
  max: 1000, // máximo 1000 requests (aumentado de 100)
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
  max: 300, // máximo 300 requests por minuto (aumentado de 60)
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intente más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
