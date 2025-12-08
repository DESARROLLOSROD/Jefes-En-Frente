import axios from 'axios';
import { ApiResponse, IMaterialCatalog } from '../types/reporte';
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

export const materialService = {
    async obtenerMateriales(): Promise<ApiResponse<IMaterialCatalog[]>> {
        try {
            const response = await api.get<ApiResponse<IMaterialCatalog[]>>('/materiales');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener materiales',
            };
        }
    },

    async crearMaterial(material: { nombre: string; unidad?: string }): Promise<ApiResponse<IMaterialCatalog>> {
        try {
            console.log('📡 Enviando solicitud crearMaterial:', material);
            const response = await api.post<ApiResponse<IMaterialCatalog>>('/materiales', material);
            console.log('✅ Respuesta crearMaterial:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error en crearMaterial service:', error);
            if (error.response) {
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
            }
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear material',
            };
        }
    }
};
