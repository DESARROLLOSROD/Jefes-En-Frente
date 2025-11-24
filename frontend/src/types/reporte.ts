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
}