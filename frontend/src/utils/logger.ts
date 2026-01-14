/**
 * Logger condicional para desarrollo y producción (Frontend)
 *
 * En desarrollo: muestra todos los logs
 * En producción: silencia todos los logs excepto errores críticos
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

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
 * Solo registra errores críticos sin datos sensibles
 */
const prodLogger: Logger = {
  log: () => {},
  info: () => {},
  warn: () => {},
  error: (...args: any[]) => {
    // En producción, solo registrar errores sin datos sensibles
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        // Eliminar campos sensibles
        const { password, token, email, ...safe } = arg;
        return safe;
      }
      // Ocultar tokens en strings
      if (typeof arg === 'string') {
        return arg.replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/g, 'Bearer [REDACTED]');
      }
      return arg;
    });
    console.error('[ERROR]', new Date().toISOString(), ...sanitizedArgs);
  },
  debug: () => {},
};

/**
 * Logger principal exportado
 */
export const logger: Logger = isDevelopment ? devLogger : prodLogger;

/**
 * Helper para logs de API (solo en desarrollo)
 */
export const logAPI = (method: string, url: string, data?: any) => {
  if (isDevelopment) {
    logger.info(`📡 ${method} ${url}`, data || '');
  }
};

/**
 * Helper para logs de autenticación (solo en desarrollo)
 */
export const logAuth = (event: string, details?: string) => {
  if (isDevelopment) {
    logger.info(`🔐 ${event}${details ? ` | ${details}` : ''}`);
  }
};

/**
 * Helper para logs de renderizado (solo en desarrollo)
 */
export const logRender = (component: string, props?: any) => {
  if (isDevelopment) {
    logger.debug(`🎨 Rendering ${component}`, props || '');
  }
};

export default logger;
