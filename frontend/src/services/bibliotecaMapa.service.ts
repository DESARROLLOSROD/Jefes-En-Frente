import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const API_URL = `${API_BASE_URL}/biblioteca-mapas`;

export interface BibliotecaMapa {
  _id?: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: {
    data: string;
    contentType: string;
  };
  width: number;
  height: number;
  etiquetas: string[];
  esPublico: boolean;
  creadoPor: string;
  proyectoId?: string;
  fechaCreacion?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const bibliotecaMapaService = {
  // Obtener todos los mapas
  obtenerMapas: async (): Promise<ApiResponse<BibliotecaMapa[]>> => {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'ERROR AL OBTENER MAPAS'
      };
    }
  },

  // Obtener mapas por categoría
  obtenerMapasPorCategoria: async (categoria: string): Promise<ApiResponse<BibliotecaMapa[]>> => {
    try {
      const response = await axios.get(`${API_URL}/categoria/${categoria}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'ERROR AL OBTENER MAPAS'
      };
    }
  },

  // Crear nuevo mapa
  crearMapa: async (mapa: Omit<BibliotecaMapa, '_id' | 'creadoPor' | 'fechaCreacion'>): Promise<ApiResponse<BibliotecaMapa>> => {
    try {
      const response = await axios.post(API_URL, mapa, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'ERROR AL CREAR MAPA'
      };
    }
  },

  // Eliminar mapa
  eliminarMapa: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'ERROR AL ELIMINAR MAPA'
      };
    }
  }
};
