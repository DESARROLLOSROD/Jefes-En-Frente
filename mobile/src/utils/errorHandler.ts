import { AxiosError } from 'axios';
import { Alert } from 'react-native';

/**
 * Extrae un mensaje de error amigable para el usuario
 */
export const getErrorMessage = (error: any): string => {
  // Error de red
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }

  // Error de timeout
  if (error.code === 'ECONNABORTED') {
    return 'La petición tardó demasiado. Intenta nuevamente.';
  }

  // Error de Axios con respuesta del servidor
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data?.message || 'Los datos enviados no son válidos.';
      case 401:
        return 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return data?.message || 'Ya existe un registro con estos datos.';
      case 422:
        return data?.message || 'Los datos enviados no son válidos.';
      case 429:
        return 'Demasiadas peticiones. Por favor espera un momento.';
      case 500:
        return 'Error en el servidor. Intenta nuevamente más tarde.';
      case 503:
        return 'El servicio no está disponible temporalmente.';
      default:
        return data?.message || `Error del servidor (${status})`;
    }
  }

  // Error genérico
  return error.message || 'Ocurrió un error inesperado. Intenta nuevamente.';
};

/**
 * Muestra una alerta con el error
 */
export const showErrorAlert = (error: any, title: string = 'Error') => {
  const message = getErrorMessage(error);
  Alert.alert(title, message, [{ text: 'Entendido', style: 'cancel' }]);
};

/**
 * Maneja errores de forma silenciosa (solo log)
 */
export const logError = (error: any, context?: string) => {
  if (__DEV__) {
    console.error(`❌ Error${context ? ` en ${context}` : ''}:`, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

/**
 * Determina si un error requiere logout
 */
export const shouldLogout = (error: any): boolean => {
  return error.response?.status === 401;
};

/**
 * Extrae errores de validación del backend
 */
export const getValidationErrors = (error: any): Record<string, string> => {
  if (error.response?.status === 422 && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
};
