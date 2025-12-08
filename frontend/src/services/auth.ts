import axios from 'axios';
import { AuthResponse, Proyecto } from '../types/auth';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debug
api.interceptors.request.use((config) => {
  console.log('📡 Enviando request:', {
    url: config.url,
    method: config.method,
    data: config.data
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Ejecutando authService.login...', { email });
      
      const response = await api.post<AuthResponse>('/auth/login', { 
        email, 
        password 
      });
      
      console.log('✅ authService.login - Éxito:', response.data.success);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ authService.login - Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión'
      };
    }
  },

  async obtenerProyectos(): Promise<{ success: boolean; data?: Proyecto[]; error?: string }> {
    try {
      console.log('📋 Obteniendo proyectos...');
      const response = await api.get('/auth/proyectos');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo proyectos:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
};