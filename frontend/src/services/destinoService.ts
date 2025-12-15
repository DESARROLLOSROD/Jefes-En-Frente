import axios from 'axios';
import { ApiResponse } from '../types/reporte';
import { API_BASE_URL } from '../config/env';

export interface IDestino {
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

export const destinoService = {
    async obtenerDestinos(): Promise<ApiResponse<IDestino[]>> {
        try {
            const response = await api.get<ApiResponse<IDestino[]>>('/destinos');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener destinos',
            };
        }
    },

    async crearDestino(destino: { nombre: string }): Promise<ApiResponse<IDestino>> {
        try {
            console.log('📡 Enviando solicitud crearDestino:', destino);
            const response = await api.post<ApiResponse<IDestino>>('/destinos', destino);
            console.log('✅ Respuesta crearDestino:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error en crearDestino service:', error);
            if (error.response) {
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
            }
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear destino',
            };
        }
    }
};
