import axios from 'axios';
import { WorkZone, CreateWorkZoneDTO, UpdateWorkZoneDTO, CreateSectionDTO, UpdateSectionDTO, Section } from '../types/workZone.types';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
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
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const workZoneService = {
  // Obtener todas las zonas de un proyecto
  async getZonesByProject(projectId: string): Promise<WorkZone[]> {
    try {
      const response = await api.get<ApiResponse<WorkZone[]>>(`/projects/${projectId}/zones`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener zonas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener zonas de trabajo');
    }
  },

  // Obtener una zona específica
  async getZoneById(zoneId: string): Promise<WorkZone> {
    try {
      const response = await api.get<ApiResponse<WorkZone>>(`/zones/${zoneId}`);
      if (!response.data.data) {
        throw new Error('Zona no encontrada');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener zona:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener zona de trabajo');
    }
  },

  // Crear nueva zona
  async createZone(data: CreateWorkZoneDTO): Promise<WorkZone> {
    try {
      const response = await api.post<ApiResponse<WorkZone>>('/zones', data);
      if (!response.data.data) {
        throw new Error('Error al crear zona');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear zona:', error);
      throw new Error(error.response?.data?.message || 'Error al crear zona de trabajo');
    }
  },

  // Actualizar zona
  async updateZone(zoneId: string, data: UpdateWorkZoneDTO): Promise<WorkZone> {
    try {
      const response = await api.put<ApiResponse<WorkZone>>(`/zones/${zoneId}`, data);
      if (!response.data.data) {
        throw new Error('Error al actualizar zona');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar zona:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar zona de trabajo');
    }
  },

  // Eliminar zona
  async deleteZone(zoneId: string): Promise<void> {
    try {
      await api.delete(`/zones/${zoneId}`);
    } catch (error: any) {
      console.error('Error al eliminar zona:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar zona de trabajo');
    }
  },

  // Agregar sección a zona
  async addSection(zoneId: string, data: CreateSectionDTO): Promise<Section> {
    try {
      const response = await api.post<ApiResponse<Section>>(`/zones/${zoneId}/sections`, data);
      if (!response.data.data) {
        throw new Error('Error al agregar sección');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error al agregar sección:', error);
      throw new Error(error.response?.data?.message || 'Error al agregar sección');
    }
  },

  // Actualizar sección
  async updateSection(zoneId: string, sectionId: string, data: UpdateSectionDTO): Promise<Section> {
    try {
      const response = await api.put<ApiResponse<Section>>(`/zones/${zoneId}/sections/${sectionId}`, data);
      if (!response.data.data) {
        throw new Error('Error al actualizar sección');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar sección:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar sección');
    }
  },

  // Eliminar sección
  async deleteSection(zoneId: string, sectionId: string): Promise<void> {
    try {
      await api.delete(`/zones/${zoneId}/sections/${sectionId}`);
    } catch (error: any) {
      console.error('Error al eliminar sección:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar sección');
    }
  },
};
