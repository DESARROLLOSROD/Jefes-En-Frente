import { api } from './api';
import { ITipoVehiculoCatalog } from '../types/gestion';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export const tipoVehiculoService = {
    async obtenerTipos(): Promise<ApiResponse<ITipoVehiculoCatalog[]>> {
        try {
            const response = await api.get<ApiResponse<ITipoVehiculoCatalog[]>>('/tipos-vehiculo');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al obtener tipos de vehículo',
            };
        }
    },

    async crearTipo(tipo: { nombre: string }): Promise<ApiResponse<ITipoVehiculoCatalog>> {
        try {
            const response = await api.post<ApiResponse<ITipoVehiculoCatalog>>('/tipos-vehiculo', tipo);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al crear tipo de vehículo',
            };
        }
    }
};
