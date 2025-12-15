import axios from 'axios';
import { ApiResponse } from '../types/reporte';
import { API_BASE_URL } from '../config/env';

export interface IOrigen {
    _id: string;
    nombre: string;
    activo: boolean;
    fechaCreacion: Date;
}

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

export const origenService = {
    async obtenerOrigenes(): Promise<ApiResponse<IOrigen[]>> {
        try {
            const response = await api.get<ApiResponse<IOrigen[]>>('/origenes');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener orígenes',
            };
        }
    },

    async crearOrigen(origen: { nombre: string }): Promise<ApiResponse<IOrigen>> {
        try {
            console.log('📡 Enviando solicitud crearOrigen:', origen);
            const response = await api.post<ApiResponse<IOrigen>>('/origenes', origen);
            console.log('✅ Respuesta crearOrigen:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error en crearOrigen service:', error);
            if (error.response) {
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
            }
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear origen',
            };
        }
    }
};
