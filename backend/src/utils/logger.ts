/**
 * Logger condicional para desarrollo y producción
 *
 * En desarrollo: muestra todos los logs
 * En producción: solo muestra errores críticos
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

interface Logger {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

/**
 * Logger para desarrollo
 */
const devLogger: Logger = {
  log: (...args: any[]) => console.log(...args),
  info: (...args: any[]) => console.info('ℹ️', ...args),
  warn: (...args: any[]) => console.warn('⚠️', ...args),
  error: (...args: any[]) => console.error('❌', ...args),
  debug: (...args: any[]) => console.debug('🐛', ...args),
};

/**
 * Logger para producción
 * Solo registra errores críticos
 */
const prodLogger: Logger = {
  log: () => {}, // No registrar en producción
  info: () => {}, // No registrar en producción
  warn: () => {}, // No registrar en producción
  error: (...args: any[]) => {
    // En producción, solo registrar errores sin datos sensibles
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        // Eliminar campos sensibles
        const { password, token, refreshToken, email, ...safe } = arg;
        return safe;
      }
      return arg;
    });
    console.error('[ERROR]', new Date().toISOString(), ...sanitizedArgs);
  },
  debug: () => {}, // No registrar en producción
};

/**
 * Logger principal exportado
 * Usa devLogger en desarrollo y prodLogger en producción
 */
export const logger: Logger = isDevelopment ? devLogger : prodLogger;

/**
 * Helper para logs de solicitudes HTTP (solo en desarrollo)
 */
export const logRequest = (method: string, url: string, userId?: string) => {
  if (isDevelopment) {
    logger.info(`📡 ${method} ${url}${userId ? ` | User: ${userId}` : ''}`);
  }
};

/**
 * Helper para logs de base de datos (solo en desarrollo)
 */
export const logDatabase = (operation: string, table: string, details?: string) => {
  if (isDevelopment) {
    logger.debug(`💾 ${operation} | ${table}${details ? ` | ${details}` : ''}`);
  }
};

/**
 * Helper para logs de autenticación (solo en desarrollo)
 */
export const logAuth = (event: string, userId?: string) => {
  if (isDevelopment) {
    logger.info(`🔐 ${event}${userId ? ` | User: ${userId}` : ''}`);
  }
};

export default logger;
