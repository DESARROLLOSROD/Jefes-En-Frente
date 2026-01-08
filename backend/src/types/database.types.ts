/**
 * Tipos TypeScript para las tablas de Supabase
 * Generados basados en supabase_schema.sql
 */

// =====================================================
// ENUMS
// =====================================================

export type Rol = 'admin' | 'supervisor' | 'jefe en frente';
export type WorkZoneStatus = 'active' | 'inactive' | 'completed';

// =====================================================
// TABLAS PRINCIPALES
// =====================================================

export interface Perfil {
  id: string; // UUID (auth.users)
  nombre: string;
  rol: Rol;
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface Proyecto {
  id: string; // UUID
  nombre: string;
  ubicacion: string;
  descripcion?: string;
  mapa_imagen_data?: string; // Base64
  mapa_content_type?: string;
  mapa_width?: number;
  mapa_height?: number;
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface ProyectoUsuario {
  proyecto_id: string; // UUID
  usuario_id: string; // UUID
}

export interface Vehiculo {
  id: string; // UUID
  nombre: string;
  tipo: string;
  no_economico: string; // UNIQUE
  horometro_inicial: number;
  horometro_final?: number;
  horas_operacion: number;
  capacidad?: string;
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface VehiculoProyecto {
  vehiculo_id: string; // UUID
  proyecto_id: string; // UUID
}

export interface Reporte {
  id: string; // UUID
  fecha: string; // DATE
  ubicacion: string;
  turno?: string;
  inicio_actividades?: string;
  termino_actividades?: string;
  zona_id?: string;
  zona_nombre?: string;
  seccion_id?: string;
  seccion_nombre?: string;
  jefe_frente?: string;
  sobrestante?: string;
  observaciones?: string;
  creado_por?: string;
  usuario_id?: string; // UUID
  proyecto_id?: string; // UUID
  offline_id?: string; // UNIQUE
  ubicacion_mapa_pin_x?: number;
  ubicacion_mapa_pin_y?: number;
  ubicacion_mapa_colocado: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

// =====================================================
// SUB-TABLAS DE REPORTES (NESTED DATA)
// =====================================================

export interface ReporteAcarreo {
  id: string; // UUID
  reporte_id: string; // UUID
  material?: string;
  no_viaje?: number;
  capacidad?: string;
  vol_suelto?: string;
  capa_no?: string;
  elevacion_ariza?: string;
  capa_origen?: string;
  destino?: string;
}

export interface ReporteMaterial {
  id: string; // UUID
  reporte_id: string; // UUID
  material?: string;
  unidad?: string;
  cantidad?: string;
  zona?: string;
  elevacion?: string;
}

export interface ReporteAgua {
  id: string; // UUID
  reporte_id: string; // UUID
  no_economico?: string;
  viaje?: number;
  capacidad?: string;
  volumen?: string;
  origen?: string;
  destino?: string;
}

export interface ReporteMaquinaria {
  id: string; // UUID
  reporte_id: string; // UUID
  tipo?: string;
  modelo?: string;
  numero_economico?: string;
  horas_operacion?: number;
  operador?: string;
  actividad?: string;
  vehiculo_id?: string; // UUID
  horometro_inicial?: number;
  horometro_final?: number;
}

export interface ReporteHistorial {
  id: string; // UUID
  reporte_id: string; // UUID
  fecha_modificacion: string; // TIMESTAMPTZ
  usuario_id?: string; // UUID
  usuario_nombre?: string;
  observacion?: string;
}

export interface ReporteCambio {
  id: string; // UUID
  historial_id: string; // UUID
  campo?: string;
  valor_anterior?: any; // JSONB
  valor_nuevo?: any; // JSONB
}

export interface PinMapa {
  id: string; // UUID
  reporte_id: string; // UUID
  pin_id: string; // ID del frontend
  pin_x: number;
  pin_y: number;
  etiqueta?: string;
  color?: string;
}

// =====================================================
// WORK ZONES Y BIBLIOTECA
// =====================================================

export interface WorkZoneSection {
  id: string;
  name: string;
  description?: string;
  status: WorkZoneStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkZone {
  id: string; // UUID
  project_id: string; // UUID
  name: string;
  description?: string;
  sections: WorkZoneSection[]; // JSONB array
  status: WorkZoneStatus;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface BibliotecaMapa {
  id: string; // UUID
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen_data: string; // Base64
  imagen_content_type: string;
  width: number;
  height: number;
  etiquetas: string[]; // TEXT[]
  es_publico: boolean;
  creado_por?: string; // UUID
  proyecto_id?: string; // UUID
  fecha_creacion: string; // TIMESTAMPTZ
}

// =====================================================
// CATÁLOGOS
// =====================================================

export interface CatMaterial {
  id: string; // UUID
  nombre: string; // UNIQUE
  unidad?: string;
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface CatOrigen {
  id: string; // UUID
  nombre: string; // UNIQUE
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface CatDestino {
  id: string; // UUID
  nombre: string; // UNIQUE
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface CatCapacidad {
  id: string; // UUID
  valor: string; // UNIQUE
  etiqueta?: string;
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

export interface CatTipoVehiculo {
  id: string; // UUID
  nombre: string; // UNIQUE
  activo: boolean;
  fecha_creacion: string; // TIMESTAMPTZ
}

// =====================================================
// TIPOS COMPUESTOS (CON RELACIONES)
// =====================================================

/**
 * Reporte completo con todos sus nested arrays
 * (usado para GET /reportes/:id)
 */
export interface ReporteCompleto extends Reporte {
  controlAcarreo?: ReporteAcarreo[];
  controlMaterial?: ReporteMaterial[];
  controlAgua?: ReporteAgua[];
  controlMaquinaria?: ReporteMaquinaria[];
  pinesMapa?: PinMapa[];
  historialModificaciones?: (ReporteHistorial & {
    cambios?: ReporteCambio[];
  })[];
}

/**
 * Perfil con proyectos asociados
 * (usado para login response)
 */
export interface PerfilConProyectos extends Perfil {
  proyectos?: Proyecto[];
}

/**
 * Vehículo con proyectos asociados
 */
export interface VehiculoConProyectos extends Vehiculo {
  proyectos?: Proyecto[];
}

// =====================================================
// TIPOS PARA INPUT (CREATE/UPDATE)
// =====================================================

export type CreateProyectoInput = Omit<Proyecto, 'id' | 'fecha_creacion' | 'activo'> & {
  activo?: boolean;
};

export type UpdateProyectoInput = Partial<Omit<Proyecto, 'id' | 'fecha_creacion'>>;

export type CreateVehiculoInput = Omit<Vehiculo, 'id' | 'fecha_creacion' | 'activo' | 'horas_operacion'> & {
  activo?: boolean;
  horas_operacion?: number;
  proyectos?: string[]; // Array de proyecto_ids
};

export type UpdateVehiculoInput = Partial<Omit<Vehiculo, 'id' | 'fecha_creacion'>> & {
  proyectos?: string[];
};

export type CreateReporteInput = Omit<Reporte, 'id' | 'fecha_creacion'> & {
  controlAcarreo?: Omit<ReporteAcarreo, 'id' | 'reporte_id'>[];
  controlMaterial?: Omit<ReporteMaterial, 'id' | 'reporte_id'>[];
  controlAgua?: Omit<ReporteAgua, 'id' | 'reporte_id'>[];
  controlMaquinaria?: Omit<ReporteMaquinaria, 'id' | 'reporte_id'>[];
  pinesMapa?: Omit<PinMapa, 'id' | 'reporte_id'>[];
};

export type UpdateReporteInput = Partial<Omit<Reporte, 'id' | 'fecha_creacion'>> & {
  controlAcarreo?: Omit<ReporteAcarreo, 'id' | 'reporte_id'>[];
  controlMaterial?: Omit<ReporteMaterial, 'id' | 'reporte_id'>[];
  controlAgua?: Omit<ReporteAgua, 'id' | 'reporte_id'>[];
  controlMaquinaria?: Omit<ReporteMaquinaria, 'id' | 'reporte_id'>[];
  pinesMapa?: Omit<PinMapa, 'id' | 'reporte_id'>[];
};

export type CreateWorkZoneInput = Omit<WorkZone, 'id' | 'created_at' | 'updated_at'>;
export type UpdateWorkZoneInput = Partial<Omit<WorkZone, 'id' | 'created_at' | 'updated_at'>>;

export type CreateBibliotecaMapaInput = Omit<BibliotecaMapa, 'id' | 'fecha_creacion'>;
export type UpdateBibliotecaMapaInput = Partial<Omit<BibliotecaMapa, 'id' | 'fecha_creacion'>>;

// =====================================================
// TIPOS PARA RESPUESTAS DE API
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =====================================================
// TIPOS PARA FILTROS Y QUERIES
// =====================================================

export interface ReporteFiltros {
  proyecto_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  usuario_id?: string;
  limit?: number;
  offset?: number;
}

export interface EstadisticasFiltros {
  proyecto_id: string;
  fecha_inicio: string;
  fecha_fin: string;
}
