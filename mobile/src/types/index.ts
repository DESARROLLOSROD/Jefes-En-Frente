// Tipos de usuario y roles
export type UserRole = 'admin' | 'supervisor' | 'jefe en frente';

export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  proyectos: string[];
  activo: boolean;
  fechaCreacion: Date;
}

// Proyecto
export interface Proyecto {
  _id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
  mapa?: {
    imagen: {
      data: string;
      contentType: string;
    };
    width: number;
    height: number;
  };
}

// Vehículo
export type TipoVehiculo = 'Camioneta' | 'Camión' | 'Maquinaria' | 'Otro';

export interface Vehiculo {
  _id: string;
  nombre: string;
  tipo: TipoVehiculo;
  horometroInicial: number;
  horometroFinal?: number;
  horasOperacion: number;
  noEconomico: string;
  proyectos: string[];
  activo: boolean;
  fechaCreacion: Date;
}

// Zona de trabajo
export type WorkZoneStatus = 'active' | 'inactive' | 'completed';

export interface Section {
  id: string;
  name: string;
  description: string;
  status: WorkZoneStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkZone {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  sections: Section[];
  status: WorkZoneStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Controles del reporte
export interface ControlAcarreo {
  noEconomico: string;
  noViaje: number;
  capacidad: string;
  volSuelto: string;
  material: string;
  origen: string;
  destino: string;
  capaNo?: string;
  elevacionAriza?: string;
  capaOrigen?: string;
}

export interface ControlMaterial {
  material: string;
  unidad: string;
  cantidad: string;
  zona: string;
  elevacion: string;
}

export interface ControlAgua {
  noEconomico: string;
  viaje: number;
  capacidad: string;
  volumen: string;
  origen: string;
  destino: string;
}

export interface ControlMaquinaria {
  vehiculoId?: string;
  nombre: string;
  tipo: string;
  numeroEconomico: string;
  horometroInicial: number;
  horometroFinal: number;
  horasOperacion: number;
  operador: string;
  actividad: string;
}

// Pin de mapa
export interface PinMapa {
  id: string;
  pinX: number;
  pinY: number;
  etiqueta: string;
  color: string;
}

// Reporte de actividades
export type Turno = 'primer' | 'segundo';

export interface ReporteActividades {
  _id?: string;
  fecha: Date;
  ubicacion?: string;
  proyectoId: string;
  usuarioId: string;
  turno: Turno;
  inicioActividades: string;
  terminoActividades: string;
  zonaTrabajo?: {
    zonaId: string;
    zonaNombre: string;
  };
  seccionTrabajo?: {
    seccionId: string;
    seccionNombre: string;
  };
  jefeFrente: string;
  sobrestante: string;
  controlAcarreo: ControlAcarreo[];
  controlMaterial: ControlMaterial[];
  controlAgua: ControlAgua[];
  controlMaquinaria: ControlMaquinaria[];
  observaciones: string;
  ubicacionMapa?: {
    pinX: number;
    pinY: number;
    colocado: boolean;
  };
  pinesMapa: PinMapa[];
  fechaCreacion?: Date;
}

// Respuesta de login
export interface LoginResponse {
  token: string;
  usuario: User;
  proyectos: Proyecto[];
}

// Contexto de autenticación
export interface AuthContextType {
  user: User | null;
  token: string | null;
  proyectos: Proyecto[];
  selectedProject: Proyecto | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectProject: (project: Proyecto) => void;
  checkAuth: () => Promise<void>;
}

export interface Material {
  _id: string;
  nombre: string;
}

export interface Origen {
  _id: string;
  nombre: string;
}

export interface Destino {
  _id: string;
  nombre: string;
}

export interface Capacidad {
  _id: string;
  valor: string;
  etiqueta?: string;
  activo?: boolean;
}
