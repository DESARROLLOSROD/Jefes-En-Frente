import axios from 'axios';
import {
    CrearUsuarioDTO,
    ActualizarUsuarioDTO,
    UsuarioResponse,
    UsuariosResponse
} from '../types/usuario.types';
import { API_BASE_URL } from '../config/env';

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

export const usuarioService = {
    async obtenerUsuarios(): Promise<UsuariosResponse> {
        try {
            const response = await api.get<UsuariosResponse>('/usuarios');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error de conexión'
            };
        }
    },

    async obtenerUsuario(id: string): Promise<UsuarioResponse> {
        try {
            const response = await api.get<UsuarioResponse>(`/usuarios/${id}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error de conexión'
            };
        }
    },

    async crearUsuario(data: CrearUsuarioDTO): Promise<UsuarioResponse> {
        try {
            const response = await api.post<UsuarioResponse>('/usuarios', data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error de conexión'
            };
        }
    },

    async actualizarUsuario(id: string, data: ActualizarUsuarioDTO): Promise<UsuarioResponse> {
        try {
            const response = await api.put<UsuarioResponse>(`/usuarios/${id}`, data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error de conexión'
            };
        }
    },

    async eliminarUsuario(id: string): Promise<UsuarioResponse> {
        try {
            const response = await api.delete<UsuarioResponse>(`/usuarios/${id}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error de conexión'
            };
        }
    }
};
