export interface Proyecto {
  _id?: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
  mapa?: {
    imagen: {
      data: string;
      contentType: string;
    };
    width: number;
    height: number;
  };
}

export interface User {
  _id?: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'supervisor' | 'jefe en frente';
  proyectos: Proyecto[];
  activo: boolean;
  fechaCreacion?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  proyecto: Proyecto | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  seleccionarProyecto: (proyecto: Proyecto) => void;
  actualizarProyecto: (proyecto: Proyecto) => void;
  recargarProyectoActual: () => Promise<void>;
  loading: boolean;
}