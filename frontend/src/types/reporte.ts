export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Mediciones {
  lupoBSeccion1_1: string;
  lupoBSeccion2: string;
  lupoBSeccion3: string;
  emparinado: string;
}

export interface Seccion2Dato {
  daj: string;
  valores: string[];
}

export interface Seccion2 {
  plantaIncorporacion: string;
  datos: Seccion2Dato[];
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

export interface ControlAgua {
  noEconomico: string;
  viaje: number;
  capacidad: string;
  volumen: string;
  origen: string;
  destino: string;
}

export interface ControlMaquinaria {
  tipo: string;
  modelo: string;
  numeroEconomico: string;
  horasOperacion: number;
  operador: string;
  actividad: string;
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
  zonaTrabajo: string;
  seccionTrabajo: string;
  jefeFrente: string;
  sobrestante: string;
  mediciones: Mediciones;
  seccion2: Seccion2;
  controlAcarreo: ControlAcarreo[];
  controlAgua: ControlAgua[];
  controlMaquinaria: ControlMaquinaria[];
  observaciones: string;
  // REMOVER: creadoPor ya no es necesario
  fechaCreacion?: string;
  creadoPor?: string; // Optional as per usage in FormularioReporte.tsx line 47
}