import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import { logError } from '../utils/errorHandler';
import offlineQueue from '../utils/offlineQueue';
import NetInfo from '@react-native-community/netinfo';

/**
 * Enhanced API Service con soporte offline completo
 * Encola automáticamente las peticiones fallidas por falta de conexión
 */
class ApiServiceWithOffline {
  private api: AxiosInstance;
  private isOnline: boolean = true;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupNetworkListener();
    this.setupInterceptors();
  }

  /**
   * Escucha cambios en la conectividad de red
   */
  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
      console.log('📶 Estado de red:', this.isOnline ? 'ONLINE' : 'OFFLINE');
    });
  }

  /**
   * Configura interceptores de request y response
   */
  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        logError(error, 'Request Interceptor');
        return Promise.reject(error);
      }
    );

    // Response interceptor con manejo de offline
    this.api.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`✅ ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Error de red (sin conexión)
        if (!error.response && error.message === 'Network Error') {
          console.log('🔴 Network Error detectado');

          // Solo encolar POST, PUT, DELETE (no GET)
          if (config.method && ['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
            await this.enqueueRequest(config);
            throw new Error('Sin conexión. La operación se guardó para sincronizar más tarde.');
          }
        }

        // Token expirado o inválido
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove(['token', 'user', 'selectedProject']);
        }

        // Rate limiting
        if (error.response?.status === 429) {
          console.log('⏳ Rate limited, esperando...');
        }

        logError(error, 'API Response');
        return Promise.reject(error);
      }
    );
  }

  /**
   * Encola una petición fallida para intentarla más tarde
   */
  private async enqueueRequest(config: AxiosRequestConfig) {
    try {
      const endpoint = config.url || '/unknown';
      const method = (config.method?.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE') || 'POST';

      // Determinar tipo de operación basado en el endpoint
      let type: 'CREATE_REPORT' | 'UPDATE_REPORT' | 'DELETE_REPORT' | 'OTHER' = 'OTHER';
      if (endpoint.includes('/reportes')) {
        if (method === 'POST') type = 'CREATE_REPORT';
        else if (method === 'PUT') type = 'UPDATE_REPORT';
        else if (method === 'DELETE') type = 'DELETE_REPORT';
      }

      await offlineQueue.addToQueue({
        type,
        endpoint,
        method,
        data: config.data,
      });

      console.log('✅ Petición encolada para sincronización offline');
    } catch (error) {
      console.error('❌ Error al encolar petición:', error);
    }
  }

  /**
   * Procesa la cola de peticiones offline
   */
  async processOfflineQueue(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      console.log('📵 Sin conexión. No se puede procesar la cola.');
      return { success: 0, failed: 0 };
    }

    console.log('🔄 Procesando cola offline...');
    const queue = await offlineQueue.getQueue();

    let successCount = 0;
    let failedCount = 0;

    for (const item of queue) {
      try {
        console.log(`🔄 Procesando: ${item.type} - ${item.endpoint}`);

        // Hacer la petición nuevamente
        await this.api.request({
          method: item.method,
          url: item.endpoint,
          data: item.data,
        });

        // Éxito: eliminar de la cola
        await offlineQueue.removeFromQueue(item.id);
        successCount++;
        console.log(`✅ Procesado exitosamente: ${item.id}`);
      } catch (error) {
        console.error(`❌ Error al procesar ${item.id}:`, error);

        // Incrementar contador de reintentos
        await offlineQueue.incrementRetry(item.id);

        // Si ya se intentó 3 veces, eliminar
        if (item.retryCount >= 2) {
          console.log(`🗑️ Eliminando item ${item.id} después de 3 intentos`);
          await offlineQueue.removeFromQueue(item.id);
        }

        failedCount++;
      }
    }

    console.log(`✅ Cola procesada: ${successCount} éxitos, ${failedCount} fallos`);
    return { success: successCount, failed: failedCount };
  }

  /**
   * Obtiene el tamaño de la cola offline
   */
  async getQueueSize(): Promise<number> {
    return await offlineQueue.getQueueSize();
  }

  /**
   * Limpia toda la cola offline
   */
  async clearQueue(): Promise<void> {
    await offlineQueue.clearQueue();
  }

  /**
   * Obtiene la instancia de axios para operaciones personalizadas
   */
  getInstance(): AxiosInstance {
    return this.api;
  }
}

export default new ApiServiceWithOffline();
