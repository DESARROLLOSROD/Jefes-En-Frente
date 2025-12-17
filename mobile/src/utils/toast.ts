import Toast from 'react-native-toast-message';

/**
 * Utilidades para mostrar toasts en la aplicación
 */

export const toast = {
  /**
   * Muestra un toast de éxito
   */
  success: (message: string, title: string = '✅ Éxito') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 50,
    });
  },

  /**
   * Muestra un toast de error
   */
  error: (message: string, title: string = '❌ Error') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 50,
    });
  },

  /**
   * Muestra un toast de advertencia
   */
  warning: (message: string, title: string = '⚠️ Advertencia') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3500,
      topOffset: 50,
    });
  },

  /**
   * Muestra un toast informativo
   */
  info: (message: string, title: string = 'ℹ️ Información') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      topOffset: 50,
    });
  },

  /**
   * Muestra un toast para operación offline
   */
  offline: (message: string = 'Sin conexión. La operación se guardó para sincronizar más tarde.') => {
    Toast.show({
      type: 'info',
      text1: '📵 Modo Offline',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      topOffset: 50,
    });
  },

  /**
   * Muestra un toast de carga
   */
  loading: (message: string, title: string = '⏳ Cargando...') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 50,
      autoHide: false, // No ocultar automáticamente
    });
  },

  /**
   * Oculta todos los toasts
   */
  hide: () => {
    Toast.hide();
  },
};

/**
 * Maneja errores de la API y muestra toasts apropiados
 */
export const handleApiError = (error: any, defaultMessage: string = 'Ocurrió un error'): void => {
  console.error('API Error:', error);

  let errorMessage = defaultMessage;
  let errorTitle = '❌ Error';

  // Manejo de operación guardada offline (específico de nuestro ApiService)
  if (error.isOffline) {
    toast.offline(error.message);
    return;
  }

  // Error de red (sin conexión detectado de forma genérica)
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    errorTitle = '📵 Sin Conexión';
    errorMessage = 'No hay conexión a internet. Verifica tu conexión.';
  }
  // Error de timeout
  else if (error.code === 'ECONNABORTED') {
    errorTitle = '⏱️ Tiempo Agotado';
    errorMessage = 'La operación tardó demasiado. Intenta nuevamente.';
  }
  // Error 401 - No autorizado
  else if (error.response?.status === 401) {
    errorTitle = '🔒 No Autorizado';
    errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  }
  // Error 403 - Prohibido
  else if (error.response?.status === 403) {
    errorTitle = '🚫 Acceso Denegado';
    errorMessage = 'No tienes permisos para realizar esta acción.';
  }
  // Error 404 - No encontrado
  else if (error.response?.status === 404) {
    errorTitle = '🔍 No Encontrado';
    errorMessage = 'El recurso solicitado no fue encontrado.';
  }
  // Error 422 - Datos inválidos
  else if (error.response?.status === 422) {
    errorTitle = '📝 Datos Inválidos';
    errorMessage = error.response?.data?.message || 'Los datos enviados no son válidos.';
  }
  // Error 429 - Rate limit
  else if (error.response?.status === 429) {
    errorTitle = '⏳ Demasiadas Solicitudes';
    errorMessage = 'Has realizado demasiadas solicitudes. Espera un momento.';
  }
  // Error 500 - Error del servidor
  else if (error.response?.status >= 500) {
    errorTitle = '🔧 Error del Servidor';
    errorMessage = 'Hubo un problema en el servidor. Intenta más tarde.';
  }
  // Mensaje personalizado del backend
  else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  }
  // Error genérico con mensaje
  else if (error.message) {
    errorMessage = error.message;
  }

  toast.error(errorMessage, errorTitle);
};

export default toast;
