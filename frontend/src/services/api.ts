import axios from 'axios';
import { ReporteActividades, ApiResponse } from '../types/reporte';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
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
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  },

  async obtenerReportes(): Promise<ApiResponse<ReporteActividades[]>> {
    try {
      const response = await api.get<ApiResponse<ReporteActividades[]>>('/reportes');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  },

  // ... otros métodos
};