import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface EstadisticasResponse {
    rangoFechas: {
        inicio: string;
        fin: string;
    };
    totalReportes: number;
    totalViajes: number;
    acarreo: {
        materiales: Array<{
            nombre: string;
            volumen: number;
            viajes: number;
            porcentaje: number;
        }>;
        totalVolumen: number;
        totalViajes: number;
        materialMasMovido: string;
    };
    material: {
        materiales: Array<{
            nombre: string;
            cantidad: number;
            unidad: string;
        }>;
        materialMasUtilizado: string;
    };
    agua: {
        porOrigen: Array<{
            origen: string;
            volumen: number;
            viajes: number;
            porcentaje: number;
        }>;
        volumenTotal: number;
        totalViajes: number;
        origenMasUtilizado: string;
    };
    vehiculos: {
        vehiculos: Array<{
            nombre: string;
            noEconomico: string;
            horasOperacion: number;
            porcentaje: number;
        }>;
        totalHoras: number;
        vehiculoMasUtilizado: string;
    };
    personal: {
        personal: Array<{
            personalId: string;
            nombre: string;
            cargoNombre: string;
            totalHoras: number;
            reportesCount: number;
            porcentaje: number;
        }>;
        totalHoras: number;
        personalMasActivo: string;
        totalPersonal: number;
    };
}

export const obtenerEstadisticas = async (
    proyectoIds: string | string[],
    fechaInicio: string,
    fechaFin: string
): Promise<EstadisticasResponse> => {
    const token = localStorage.getItem('token');
    const idsParam = Array.isArray(proyectoIds) ? proyectoIds.join(',') : proyectoIds;

    const response = await axios.get(`${API_URL}/reportes/estadisticas`, {
        params: {
            proyectoIds: idsParam,
            fechaInicio,
            fechaFin
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data.data;
};
