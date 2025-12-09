import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import {
  LoginResponse,
  ReporteActividades,
  Proyecto,
  User,
  Vehiculo,
  WorkZone,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token a todas las peticiones
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          await AsyncStorage.multiRemove(['token', 'user', 'selectedProject']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Autenticación
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
      email,
      password,
    });

    // Transformar la respuesta de la API al formato esperado
    const { data } = response.data;
    return {
      token: data.token,
      usuario: data.user,
      proyectos: data.user.proyectos || []
    };
  }

  async getProyectosDisponibles(): Promise<Proyecto[]> {
    const response = await this.api.get<Proyecto[]>('/auth/proyectos');
    return response.data;
  }

  // Reportes
  async getReportes(proyectoId?: string): Promise<ReporteActividades[]> {
    const params = proyectoId ? { proyectoId } : {};
    const response = await this.api.get<ReporteActividades[]>('/reportes', { params });
    return response.data;
  }

  async getReporteById(id: string): Promise<ReporteActividades> {
    const response = await this.api.get<ReporteActividades>(`/reportes/${id}`);
    return response.data;
  }

  async createReporte(reporte: ReporteActividades): Promise<ReporteActividades> {
    const response = await this.api.post<ReporteActividades>('/reportes', reporte);
    return response.data;
  }

  async updateReporte(id: string, reporte: Partial<ReporteActividades>): Promise<ReporteActividades> {
    const response = await this.api.put<ReporteActividades>(`/reportes/${id}`, reporte);
    return response.data;
  }

  async deleteReporte(id: string): Promise<void> {
    await this.api.delete(`/reportes/${id}`);
  }

  // Proyectos
  async getProyectos(): Promise<Proyecto[]> {
    const response = await this.api.get<Proyecto[]>('/proyectos');
    return response.data;
  }

  async getProyectoById(id: string): Promise<Proyecto> {
    const response = await this.api.get<Proyecto>(`/proyectos/${id}`);
    return response.data;
  }

  async createProyecto(proyecto: Partial<Proyecto>): Promise<Proyecto> {
    const response = await this.api.post<Proyecto>('/proyectos', proyecto);
    return response.data;
  }

  async updateProyecto(id: string, proyecto: Partial<Proyecto>): Promise<Proyecto> {
    const response = await this.api.put<Proyecto>(`/proyectos/${id}`, proyecto);
    return response.data;
  }

  async deleteProyecto(id: string): Promise<void> {
    await this.api.delete(`/proyectos/${id}`);
  }

  // Usuarios
  async getUsuarios(): Promise<User[]> {
    const response = await this.api.get<User[]>('/usuarios');
    return response.data;
  }

  async getUsuarioById(id: string): Promise<User> {
    const response = await this.api.get<User>(`/usuarios/${id}`);
    return response.data;
  }

  async createUsuario(usuario: Partial<User> & { password: string }): Promise<User> {
    const response = await this.api.post<User>('/usuarios', usuario);
    return response.data;
  }

  async updateUsuario(id: string, usuario: Partial<User>): Promise<User> {
    const response = await this.api.put<User>(`/usuarios/${id}`, usuario);
    return response.data;
  }

  async deleteUsuario(id: string): Promise<void> {
    await this.api.delete(`/usuarios/${id}`);
  }

  // Vehículos
  async getVehiculos(): Promise<Vehiculo[]> {
    const response = await this.api.get<Vehiculo[]>('/vehiculos');
    return response.data;
  }

  async getVehiculosByProyecto(proyectoId: string): Promise<Vehiculo[]> {
    const response = await this.api.get<Vehiculo[]>(`/vehiculos/proyecto/${proyectoId}`);
    return response.data;
  }

  async createVehiculo(vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const response = await this.api.post<Vehiculo>('/vehiculos', vehiculo);
    return response.data;
  }

  async updateVehiculo(id: string, vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const response = await this.api.put<Vehiculo>(`/vehiculos/${id}`, vehiculo);
    return response.data;
  }

  async deleteVehiculo(id: string): Promise<void> {
    await this.api.delete(`/vehiculos/${id}`);
  }

  // Zonas de trabajo
  async getZonesByProject(projectId: string): Promise<WorkZone[]> {
    const response = await this.api.get<WorkZone[]>(`/projects/${projectId}/zones`);
    return response.data;
  }

  async getZoneById(zoneId: string): Promise<WorkZone> {
    const response = await this.api.get<WorkZone>(`/zones/${zoneId}`);
    return response.data;
  }

  async createZone(zone: Partial<WorkZone>): Promise<WorkZone> {
    const response = await this.api.post<WorkZone>('/zones', zone);
    return response.data;
  }

  async updateZone(zoneId: string, zone: Partial<WorkZone>): Promise<WorkZone> {
    const response = await this.api.put<WorkZone>(`/zones/${zoneId}`, zone);
    return response.data;
  }

  async deleteZone(zoneId: string): Promise<void> {
    await this.api.delete(`/zones/${zoneId}`);
  }

  async addSection(zoneId: string, section: any): Promise<WorkZone> {
    const response = await this.api.post<WorkZone>(`/zones/${zoneId}/sections`, section);
    return response.data;
  }

  async updateSection(zoneId: string, sectionId: string, section: any): Promise<WorkZone> {
    const response = await this.api.put<WorkZone>(`/zones/${zoneId}/sections/${sectionId}`, section);
    return response.data;
  }

  async deleteSection(zoneId: string, sectionId: string): Promise<void> {
    await this.api.delete(`/zones/${zoneId}/sections/${sectionId}`);
  }
}

export default new ApiService();
