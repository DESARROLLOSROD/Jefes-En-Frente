import axios from 'axios';
import { ReporteActividades, ApiResponse } from '../types/reporte';
import { Proyecto, Vehiculo } from '../types/gestion';
import { API_BASE_URL } from '../config/env';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANTE: Enviar cookies automáticamente
});

// Interceptor to add auth token automatically (fallback para compatibilidad)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor to handle authentication errors and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y tiene código TOKEN_EXPIRED, intentar refresh
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar obtener nuevo access token con refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true
        });

        if (response.data.success && response.data.data.token) {
          const newToken = response.data.data.token;

          // Actualizar localStorage (compatibilidad)
          localStorage.setItem('token', newToken);
          if (response.data.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }

          // Actualizar header del request original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          isRefreshing = false;

          // Reintentar el request original
          return axios(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Si falla el refresh, hacer logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('proyecto');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Para otros errores 401 (sin código TOKEN_EXPIRED), hacer logout directo
    if (error.response?.status === 401 && error.response?.data?.code !== 'TOKEN_EXPIRED') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('proyecto');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const reporteService = {
  async crearReporte(reporte: Omit<ReporteActividades, '_id' | 'fechaCreacion'>): Promise<ApiResponse<ReporteActividades>> {
    try {
      const response = await api.post<ApiResponse<ReporteActividades>>('/reportes', reporte);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión',
      };
    }
  },

  async obtenerReportes(proyectoId?: string): Promise<ApiResponse<ReporteActividades[]>> {
    try {
      const url = proyectoId ? `/reportes?proyectoId=${proyectoId}` : '/reportes';
      const response = await api.get<ApiResponse<ReporteActividades[]>>(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión',
      };
    }
  },

  async actualizarReporte(id: string, reporte: Partial<ReporteActividades>): Promise<ApiResponse<ReporteActividades>> {
    try {
      const response = await api.put<ApiResponse<ReporteActividades>>(`/reportes/${id}`, reporte);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión',
      };
    }
  },

  async eliminarReporte(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/reportes/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión',
      };
    }
  },
};

export const proyectoService = {
  async obtenerProyectos(): Promise<ApiResponse<Proyecto[]>> {
    try {
      const response = await api.get<ApiResponse<Proyecto[]>>('/proyectos');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener proyectos',
      };
    }
  },

  async obtenerProyectoPorId(id: string): Promise<ApiResponse<Proyecto>> {
    try {
      const response = await api.get<ApiResponse<Proyecto>>(`/proyectos/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener proyecto',
      };
    }
  },

  async crearProyecto(proyecto: Omit<Proyecto, '_id' | 'fechaCreacion' | 'activo'>): Promise<ApiResponse<Proyecto>> {
    try {
      const response = await api.post<ApiResponse<Proyecto>>('/proyectos', proyecto);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear proyecto',
      };
    }
  },

  async actualizarProyecto(id: string, proyecto: Partial<Proyecto>): Promise<ApiResponse<Proyecto>> {
    try {
      const response = await api.put<ApiResponse<Proyecto>>(`/proyectos/${id}`, proyecto);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar proyecto',
      };
    }
  },

  async eliminarProyecto(id: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/proyectos/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar proyecto',
      };
    }
  }
};

export const vehiculoService = {
  async obtenerVehiculos(): Promise<ApiResponse<Vehiculo[]>> {
    try {
      const response = await api.get<ApiResponse<Vehiculo[]>>('/vehiculos');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener vehículos',
      };
    }
  },
  async obtenerVehiculosPorProyecto(proyectoId: string): Promise<ApiResponse<Vehiculo[]>> {
    try {
      const response = await api.get<ApiResponse<Vehiculo[]>>(`/vehiculos/proyecto/${proyectoId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener vehículos del proyecto',
      };
    }
  },

  async crearVehiculo(vehiculo: Omit<Vehiculo, '_id' | 'fechaCreacion' | 'activo'>): Promise<ApiResponse<Vehiculo>> {
    try {
      const response = await api.post<ApiResponse<Vehiculo>>('/vehiculos', vehiculo);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear vehículo',
      };
    }
  },

  async actualizarVehiculo(id: string, vehiculo: Partial<Vehiculo>): Promise<ApiResponse<Vehiculo>> {
    try {
      const response = await api.put<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, vehiculo);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar vehículo',
      };
    }
  },

  async eliminarVehiculo(id: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/vehiculos/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar vehículo',
      };
    }
  }
};