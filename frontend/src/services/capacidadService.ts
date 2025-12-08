import axios from 'axios';
import { ApiResponse, ICapacidadCatalog } from '../types/reporte';
import { API_BASE_URL } from '../config/env';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const capacidadService = {
    async obtenerCapacidades(): Promise<ApiResponse<ICapacidadCatalog[]>> {
        try {
            const response = await api.get<ApiResponse<ICapacidadCatalog[]>>('/capacidades');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener capacidades',
            };
        }
    },

    async crearCapacidad(capacidad: { valor: string; etiqueta?: string }): Promise<ApiResponse<ICapacidadCatalog>> {
        try {
            console.log('📡 Enviando solicitud crearCapacidad:', capacidad);
            const response = await api.post<ApiResponse<ICapacidadCatalog>>('/capacidades', capacidad);
            console.log('✅ Respuesta crearCapacidad:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error en crearCapacidad service:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear capacidad',
            };
        }
    }
};
