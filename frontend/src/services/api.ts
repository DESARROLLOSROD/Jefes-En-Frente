import axios from 'axios';
import { ReporteActividades, ApiResponse } from '../types/reporte';
import { Proyecto, Vehiculo } from '../types/gestion';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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

  async obtenerReportes(proyectoId: string): Promise<ApiResponse<ReporteActividades[]>> {
    try {
      const response = await api.get<ApiResponse<ReporteActividades[]>>(`/reportes?proyectoId=${proyectoId}`);
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
      const response = await api.get<Proyecto[]>('/proyectos');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener proyectos',
      };
    }
  },

  async crearProyecto(proyecto: Omit<Proyecto, '_id' | 'fechaCreacion' | 'activo'>): Promise<ApiResponse<Proyecto>> {
    try {
      const response = await api.post<Proyecto>('/proyectos', proyecto);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear proyecto',
      };
    }
  },

  async actualizarProyecto(id: string, proyecto: Partial<Proyecto>): Promise<ApiResponse<Proyecto>> {
    try {
      const response = await api.put<Proyecto>(`/proyectos/${id}`, proyecto);
      return { success: true, data: response.data };
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
      const response = await api.get<Vehiculo[]>('/vehiculos');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener vehículos',
      };
    }
  },
  async obtenerVehiculosPorProyecto(proyectoId: string): Promise<ApiResponse<Vehiculo[]>> {
    try {
      const response = await api.get<Vehiculo[]>(`/vehiculos/proyecto/${proyectoId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener vehículos del proyecto',
      };
    }
  },

  async crearVehiculo(vehiculo: Omit<Vehiculo, '_id' | 'fechaCreacion' | 'activo'>): Promise<ApiResponse<Vehiculo>> {
    try {
      const response = await api.post<Vehiculo>('/vehiculos', vehiculo);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear vehículo',
      };
    }
  },

  async actualizarVehiculo(id: string, vehiculo: Partial<Vehiculo>): Promise<ApiResponse<Vehiculo>> {
    try {
      const response = await api.put<Vehiculo>(`/vehiculos/${id}`, vehiculo);
      return { success: true, data: response.data };
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