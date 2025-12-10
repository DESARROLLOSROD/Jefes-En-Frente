import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza strings para prevenir XSS
 */
const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;

  // Remover caracteres nulos y de control
  str = str.replace(/\0/g, '');

  // Sanitizar HTML
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [], // No permitir tags HTML
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true // Mantener el contenido, solo remover tags
  });
};

/**
 * Valida y sanitiza imágenes base64
 */
const sanitizeBase64Image = (base64: string): string | null => {
  if (typeof base64 !== 'string') return null;

  // Validar formato base64 de imagen
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
  const match = base64.match(base64Regex);

  if (!match) return null;

  // Validar que el contenido base64 sea válido
  const base64Content = match[2];
  try {
    // Intentar decodificar para verificar validez
    if (typeof atob !== 'undefined') {
      atob(base64Content);
    } else {
      Buffer.from(base64Content, 'base64');
    }
    return base64;
  } catch (e) {
    return null;
  }
};

/**
 * Sanitiza recursivamente objetos
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Casos especiales para campos que contienen base64
        if (key === 'imagen' || key.includes('mapa')) {
          if (typeof obj[key] === 'string' && obj[key].startsWith('data:image')) {
            sanitized[key] = sanitizeBase64Image(obj[key]);
          } else if (typeof obj[key] === 'object') {
            sanitized[key] = sanitizeObject(obj[key]);
          } else {
            sanitized[key] = obj[key];
          }
        } else {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware para sanitizar el body de las requests
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Middleware para prevenir SQL/NoSQL injection en queries
 */
export const preventInjection = (req: Request, res: Response, next: NextFunction) => {
  const checkInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      // Detectar patrones de inyección comunes
      const injectionPatterns = [
        /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex)/i,
        /(javascript:|<script|onerror=|onload=)/i,
      ];

      return injectionPatterns.some(pattern => pattern.test(obj));
    }

    if (Array.isArray(obj)) {
      return obj.some(item => checkInjection(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      // Detectar operadores de MongoDB en las keys
      for (const key in obj) {
        if (key.startsWith('$') || checkInjection(obj[key])) {
          return true;
        }
      }
    }

    return false;
  };

  if (checkInjection(req.body) || checkInjection(req.query) || checkInjection(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Datos potencialmente peligrosos detectados'
    });
  }

  next();
};

export default {
  sanitizeInput,
  preventInjection,
  sanitizeString,
  sanitizeBase64Image
};
