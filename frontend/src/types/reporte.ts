export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ControlAcarreo {
  material: string;
  noViaje: number;
  capacidad: string;
  volSuelto: string;
  capaNo: string;
  elevacionAriza: string;
  capaOrigen: string;
  destino: string;
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
  vehiculoId?: string;  // ✨ NUEVO - ID del vehículo seleccionado
  nombre: string;       // ✨ NUEVO - Nombre del vehículo
  tipo: string;
  numeroEconomico: string;
  horometroInicial: number;    // ✨ NUEVO
  horometroFinal: number;      // ✨ NUEVO
  horasOperacion: number;      // Calculado automáticamente
  operador: string;
  actividad: string;
}


export interface ZonaTrabajo {
  zonaId: string;
  zonaNombre: string;
}

export interface SeccionTrabajo {
  seccionId: string;
  seccionNombre: string;
}

export interface ReporteActividades {
  _id?: string;
  // NUEVO: Campos de autenticación
  usuarioId: string;
  proyectoId: string;
  ubicacion: string; // Ahora se obtiene del proyecto
  fecha: string;
  turno: 'primer' | 'segundo';
  inicioActividades: string;
  terminoActividades: string;
  zonaTrabajo: ZonaTrabajo;
  seccionTrabajo: SeccionTrabajo;
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
  // Múltiples pins con etiquetas
  pinesMapa?: Array<{
    id: string;
    pinX: number;
    pinY: number;
    etiqueta: string;
    color?: string;
  }>;
  // REMOVER: creadoPor ya no es necesario
  fechaCreacion?: string;
  creadoPor?: string; // Optional as per usage in FormularioReporte.tsx line 47
}