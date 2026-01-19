import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_URL, ENV } from '../constants/config';
import { logError } from '../utils/errorHandler';
import offlineQueue from '../utils/offlineQueue';
import {
  LoginResponse,
  ReporteActividades,
  Proyecto,
  User,
  Vehiculo,
  WorkZone,
  Material,
  Origen,
  Destino,
  Capacidad,
  Personal,
  Cargo,
  ApiResponse,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private isOnline: boolean = true;
  private isSyncingQueue: boolean = false; // Prevenir sincronizaciones concurrentes

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

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (__DEV__) {
        console.log('📶 NetInfo status:', this.isOnline ? 'ONLINE' : 'OFFLINE');
      }

      // Si volvemos a estar online, intentar procesar la cola
      // NOTA: Esta sincronización está deshabilitada porque NetworkContext/useSyncQueue
      // ya maneja la sincronización automática al reconectar
      // if (wasOffline && this.isOnline) {
      //   this.processOfflineQueue();
      // }
    });
  }

  private setupInterceptors() {
    // Interceptor para agregar el token a todas las peticiones
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log en desarrollo
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

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => {
        // Log en desarrollo
        if (__DEV__) {
          console.log(`✅ ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retry?: boolean };
        logError(error, 'API Response');

        // Error de red (sin conexión o servidor caído)
        if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
          if (__DEV__) console.log('🔴 Network Error detectado');

          // Solo encolar POST, PUT, DELETE (no GET)
          if (config && config.method && ['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
            // SI LA PETICIÓN TIENE _skipOfflineQueue, NO LA VOLVEMOS A ENCOLAR
            // Esto evita duplicados durante la sincronización
            if ((config as any)._skipOfflineQueue) {
              if (__DEV__) console.log('⚠️ Petición fallida durante sincronización, NO re-encolando');
              return Promise.reject(error);
            }

            await this.enqueueRequest(config);
            // Devolver un error específico que los componentes puedan reconocer
            return Promise.reject({
              ...error,
              isOffline: true,
              message: 'SIN CONEXIÓN. LA OPERACIÓN SE SINCRONIZARÁ AUTOMÁTICAMENTE CUANDO VUELVA LA SEÑAL.'
            });
          }
        }

        // Token expirado o inválido - limpiar storage (con logs mejorados de mi edición anterior)
        if (error.response?.status === 401) {
          console.warn('⚠️ 401 Unauthorized detected');
          console.warn('Response data:', error.response?.data);
          await AsyncStorage.multiRemove(['token', 'user', 'selectedProject']);
        }

        // Rate limiting - esperar antes de reintentar
        if (error.response?.status === 429) {
          console.log('⏳ Rate limited, esperando...');
        }

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

      // 🔍 DEDUPLICACIÓN: No encolar si ya existe una petición idéntica pendiente
      const queue = await offlineQueue.getQueue();
      const isDuplicate = queue.some(item =>
        item.endpoint === endpoint &&
        item.method === method &&
        JSON.stringify(item.data) === JSON.stringify(config.data)
      );

      if (isDuplicate) {
        if (__DEV__) console.log('🚫 Petición duplicada detectada en la cola, ignorando');
        return;
      }


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

      if (__DEV__) console.log('✅ Petición encolada para sincronización offline');
    } catch (error) {
      console.error('❌ Error al encolar petición:', error);
    }
  }

  /**
   * Procesa la cola de peticiones offline
   */
  async processOfflineQueue(): Promise<{ success: number; failed: number }> {
    // Prevenir múltiples sincronizaciones concurrentes
    if (!this.isOnline || this.isSyncingQueue) {
      if (__DEV__ && this.isSyncingQueue) {
        console.log('⚠️ Ya hay una sincronización en progreso, saltando...');
      }
      return { success: 0, failed: 0 };
    }

    this.isSyncingQueue = true;

    try {
      const queue = await offlineQueue.getQueue();
      if (queue.length === 0) return { success: 0, failed: 0 };

      if (__DEV__) console.log(`🔄 Procesando cola offline (${queue.length} items)...`);

      let successCount = 0;
      let failedCount = 0;

      // OPTIMIZACIÓN: Procesar en lotes de 5 items en paralelo
      const BATCH_SIZE = 5;
      const batches: typeof queue[] = [];

      for (let i = 0; i < queue.length; i += BATCH_SIZE) {
        batches.push(queue.slice(i, i + BATCH_SIZE));
      }

      if (__DEV__) console.log(`📦 Procesando ${batches.length} lotes de hasta ${BATCH_SIZE} items`);

      // Procesar cada lote en paralelo
      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(item =>
            this.api.request({
              method: item.method,
              url: item.endpoint,
              data: item.data,
              _skipOfflineQueue: true, // FLAG CRÍTICO: Evita que el interceptor lo vuelva a encolar si falla
            } as any).then(() => ({ success: true, item }))
              .catch(error => ({ success: false, item, error }))
          )
        );

        // Procesar resultados del lote
        for (const result of results) {
          if (result.status === 'fulfilled') {
            const { success, item, error } = result.value;

            if (success) {
              await offlineQueue.removeFromQueue(item.id);
              successCount++;
            } else {
              console.error(`❌ Error al procesar item offline ${item.id}:`, error);
              await offlineQueue.incrementRetry(item.id);

              // Si ya falló muchas veces, eliminarlo
              const updatedQueue = await offlineQueue.getQueue();
              const currentItem = updatedQueue.find(qi => qi.id === item.id);
              if (currentItem && currentItem.retryCount >= 5) {
                console.log(`🗑️ Eliminando item offline ${item.id} tras 5 intentos fallidos`);
                await offlineQueue.removeFromQueue(item.id);
              }

              failedCount++;
            }
          } else {
            // Promise.allSettled nunca debería dar rejected, pero por seguridad
            failedCount++;
          }
        }
      }

      if (__DEV__) {
        console.log(`✅ Resultado de sincronización: ${successCount} éxitos, ${failedCount} fallos`);
      }

      return { success: successCount, failed: failedCount };
    } finally {
      this.isSyncingQueue = false;
    }
  }

  /**
   * Helpers para la UI
   */
  getConnectivity() { return this.isOnline; }
  async getPendingCount() { return await offlineQueue.getQueueSize(); }

  // Autenticación
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('📡 Haciendo POST a:', `${API_URL}/auth/login`);
    console.log('📤 Datos:', { email, password: '***' });

    try {
      const response = await this.api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
        email,
        password,
      });

      console.log('✅ Respuesta recibida:', response.status);

      // Transformar la respuesta de la API al formato esperado
      const data = response.data.data;
      if (!data) throw new Error(response.data.error || 'ERROR EN LOGIN');

      return {
        token: data.token,
        usuario: data.user,
        proyectos: data.user.proyectos || []
      };
    } catch (error: any) {
      console.error('❌ Error en ApiService.login:', error.message);
      console.error('❌ Error.code:', error.code);
      console.error('❌ Error.config:', error.config?.url);
      throw error;
    }
  }

  async getProyectosDisponibles(): Promise<Proyecto[]> {
    const response = await this.api.get<ApiResponse<Proyecto[]>>('/auth/proyectos');
    return response.data.data || [];
  }

  // Reportes
  async getReportes(proyectoId?: string): Promise<ReporteActividades[]> {
    const params = proyectoId ? { proyectoId } : {};
    const response = await this.api.get<{ success: boolean; data: ReporteActividades[] }>('/reportes', { params });
    return response.data.data; // Extraer el array del objeto {success, data}
  }

  async getReporteById(id: string): Promise<ReporteActividades> {
    const response = await this.api.get<{ success: boolean; data: ReporteActividades }>(`/reportes/${id}`);
    return response.data.data;
  }

  async createReporte(reporte: ReporteActividades): Promise<ReporteActividades> {
    const response = await this.api.post<{ success: boolean; data: ReporteActividades }>('/reportes', reporte);
    return response.data.data;
  }

  async updateReporte(id: string, reporte: Partial<ReporteActividades>): Promise<ReporteActividades> {
    const response = await this.api.put<{ success: boolean; data: ReporteActividades }>(`/reportes/${id}`, reporte);
    return response.data.data;
  }

  async deleteReporte(id: string): Promise<void> {
    await this.api.delete(`/reportes/${id}`);
  }

  // Proyectos
  async getProyectos(): Promise<Proyecto[]> {
    const response = await this.api.get<ApiResponse<Proyecto[]>>('/proyectos');
    return response.data.data || [];
  }

  async getProyectoById(id: string): Promise<Proyecto> {
    const response = await this.api.get<ApiResponse<Proyecto>>(`/proyectos/${id}`);
    if (!response.data.data) throw new Error('PROYECTO NO ENCONTRADO');
    return response.data.data;
  }

  async createProyecto(proyecto: Partial<Proyecto>): Promise<Proyecto> {
    const response = await this.api.post<ApiResponse<Proyecto>>('/proyectos', proyecto);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR PROYECTO');
    return response.data.data;
  }

  async updateProyecto(id: string, proyecto: Partial<Proyecto>): Promise<Proyecto> {
    const response = await this.api.put<ApiResponse<Proyecto>>(`/proyectos/${id}`, proyecto);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR PROYECTO');
    return response.data.data;
  }

  async deleteProyecto(id: string): Promise<void> {
    await this.api.delete(`/proyectos/${id}`);
  }

  // Usuarios
  async getUsuarios(): Promise<User[]> {
    const response = await this.api.get<ApiResponse<User[]>>('/usuarios');
    return response.data.data || [];
  }

  async getUsuarioById(id: string): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>(`/usuarios/${id}`);
    if (!response.data.data) throw new Error('USUARIO NO ENCONTRADO');
    return response.data.data;
  }

  async createUsuario(usuario: Partial<User> & { password: string }): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>('/usuarios', usuario);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR USUARIO');
    return response.data.data;
  }

  async updateUsuario(id: string, usuario: Partial<User>): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>(`/usuarios/${id}`, usuario);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR USUARIO');
    return response.data.data;
  }

  async deleteUsuario(id: string): Promise<void> {
    await this.api.delete(`/usuarios/${id}`);
  }

  // Vehículos
  async getVehiculos(): Promise<Vehiculo[]> {
    const response = await this.api.get<ApiResponse<Vehiculo[]>>('/vehiculos');
    return response.data.data || [];
  }

  async getVehiculosByProyecto(proyectoId: string): Promise<Vehiculo[]> {
    const response = await this.api.get<ApiResponse<Vehiculo[]>>(`/vehiculos/proyecto/${proyectoId}`);
    return response.data.data || [];
  }

  async createVehiculo(vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const response = await this.api.post<ApiResponse<Vehiculo>>('/vehiculos', vehiculo);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR VEHÍCULO');
    return response.data.data;
  }

  async updateVehiculo(id: string, vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const response = await this.api.put<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, vehiculo);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR VEHÍCULO');
    return response.data.data;
  }

  async deleteVehiculo(id: string): Promise<void> {
    await this.api.delete(`/vehiculos/${id}`);
  }

  // Zonas de trabajo
  async getZonesByProject(projectId: string): Promise<WorkZone[]> {
    const response = await this.api.get<ApiResponse<WorkZone[]>>(`/projects/${projectId}/zones`);
    return response.data.data || [];
  }

  async getZoneById(zoneId: string): Promise<WorkZone> {
    const response = await this.api.get<ApiResponse<WorkZone>>(`/zones/${zoneId}`);
    if (!response.data.data) throw new Error('ZONA NO ENCONTRADA');
    return response.data.data;
  }

  async createZone(zone: Partial<WorkZone>): Promise<WorkZone> {
    const response = await this.api.post<ApiResponse<WorkZone>>('/zones', zone);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR ZONA');
    return response.data.data;
  }

  async updateZone(zoneId: string, zone: Partial<WorkZone>): Promise<WorkZone> {
    const response = await this.api.put<ApiResponse<WorkZone>>(`/zones/${zoneId}`, zone);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR ZONA');
    return response.data.data;
  }

  async deleteZone(zoneId: string): Promise<void> {
    await this.api.delete(`/zones/${zoneId}`);
  }

  async addSection(zoneId: string, section: any): Promise<WorkZone> {
    const response = await this.api.post<ApiResponse<WorkZone>>(`/zones/${zoneId}/sections`, section);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL AGREGAR SECCIÓN');
    return response.data.data;
  }

  async updateSection(zoneId: string, sectionId: string, section: any): Promise<WorkZone> {
    const response = await this.api.put<ApiResponse<WorkZone>>(`/zones/${zoneId}/sections/${sectionId}`, section);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR SECCIÓN');
    return response.data.data;
  }

  async deleteSection(zoneId: string, sectionId: string): Promise<void> {
    await this.api.delete(`/zones/${zoneId}/sections/${sectionId}`);
  }

  // Materiales
  async getMateriales(): Promise<Material[]> {
    const response = await this.api.get<ApiResponse<Material[]>>('/materiales');
    return response.data.data || [];
  }

  async createMaterial(material: Partial<Material>): Promise<Material> {
    const response = await this.api.post<ApiResponse<Material>>('/materiales', material);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR MATERIAL');
    return response.data.data;
  }

  // Orígenes
  async getOrigenes(): Promise<Origen[]> {
    const response = await this.api.get<ApiResponse<Origen[]>>('/origenes');
    return response.data.data || [];
  }

  async createOrigen(origen: Partial<Origen>): Promise<Origen> {
    const response = await this.api.post<ApiResponse<Origen>>('/origenes', origen);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR ORIGEN');
    return response.data.data;
  }

  // Destinos
  async getDestinos(): Promise<Destino[]> {
    const response = await this.api.get<ApiResponse<Destino[]>>('/destinos');
    return response.data.data || [];
  }

  async createDestino(destino: Partial<Destino>): Promise<Destino> {
    const response = await this.api.post<ApiResponse<Destino>>('/destinos', destino);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR DESTINO');
    return response.data.data;
  }

  // Capacidades
  async getCapacidades(): Promise<Capacidad[]> {
    const response = await this.api.get<ApiResponse<Capacidad[]>>('/capacidades');
    return response.data.data || [];
  }

  async createCapacidad(capacidad: Partial<Capacidad>): Promise<Capacidad> {
    const response = await this.api.post<ApiResponse<Capacidad>>('/capacidades', capacidad);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR CAPACIDAD');
    return response.data.data;
  }

  // Personal
  async getPersonal(cargo?: string, proyecto?: string): Promise<Personal[]> {
    const params: any = {};
    if (cargo) params.cargo = cargo;
    if (proyecto) params.proyecto = proyecto;
    const response = await this.api.get<ApiResponse<Personal[]>>('/personal', { params });
    return response.data.data || [];
  }

  async getPersonalById(id: string): Promise<Personal> {
    const response = await this.api.get<ApiResponse<Personal>>(`/personal/${id}`);
    if (!response.data.data) throw new Error('PERSONAL NO ENCONTRADO');
    return response.data.data;
  }

  async createPersonal(personal: Partial<Personal>): Promise<Personal> {
    const response = await this.api.post<ApiResponse<Personal>>('/personal', personal);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR PERSONAL');
    return response.data.data;
  }

  async updatePersonal(id: string, personal: Partial<Personal>): Promise<Personal> {
    const response = await this.api.put<ApiResponse<Personal>>(`/personal/${id}`, personal);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR PERSONAL');
    return response.data.data;
  }

  async deletePersonal(id: string): Promise<void> {
    await this.api.delete(`/personal/${id}`);
  }

  // Cargos
  async getCargos(): Promise<Cargo[]> {
    const response = await this.api.get<ApiResponse<Cargo[]>>('/personal/cargos');
    return response.data.data || [];
  }

  async createCargo(cargo: Partial<Cargo>): Promise<Cargo> {
    const response = await this.api.post<ApiResponse<Cargo>>('/personal/cargos', cargo);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL CREAR CARGO');
    return response.data.data;
  }

  async updateCargo(id: string, cargo: Partial<Cargo>): Promise<Cargo> {
    const response = await this.api.put<ApiResponse<Cargo>>(`/personal/cargos/${id}`, cargo);
    if (!response.data.data) throw new Error(response.data.error || 'ERROR AL ACTUALIZAR CARGO');
    return response.data.data;
  }

  async deleteCargo(id: string): Promise<void> {
    await this.api.delete(`/personal/cargos/${id}`);
  }
}

export default new ApiService();
