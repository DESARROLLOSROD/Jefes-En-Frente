/**
 * Configuración de variables de entorno
 * Vite expone las variables que empiezan con VITE_ al cliente
 */

// URL de la API - usa variable de entorno o localhost en desarrollo
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Otras configuraciones de entorno
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Log de configuración en desarrollo
if (IS_DEVELOPMENT) {
  console.log('🔧 Configuración de entorno:', {
    API_BASE_URL,
    IS_PRODUCTION,
    IS_DEVELOPMENT
  });
}
