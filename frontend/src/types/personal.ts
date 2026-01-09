export interface CatCargo {
    _id: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    fechaCreacion: string;
}

export interface Personal {
    _id: string;
    nombreCompleto: string;
    cargoId: string;
    cargo?: CatCargo; // Populated
    numeroEmpleado?: string;
    telefono?: string;
    email?: string;
    fechaIngreso?: string;
    fechaBaja?: string;
    activo: boolean;
    observaciones?: string;
    fotoUrl?: string;
    proyectos?: any[]; // Proyectos asignados
    fechaCreacion: string;
    fechaModificacion: string;
}

// Interface for creating/updating personnel
export interface PersonalInput {
    nombreCompleto: string;
    cargoId: string;
    numeroEmpleado?: string;
    telefono?: string;
    email?: string;
    fechaIngreso?: string;
    activo?: boolean;
    observaciones?: string;
    fotoUrl?: string;
    proyectos?: string[]; // Array of project IDs
}

export interface ReportePersonal {
    _id?: string;
    reporteId?: string;
    personalId: string;
    cargoId?: string;
    actividadRealizada?: string;
    horasTrabajadas?: number;
    observaciones?: string;
    // UI helper fields (populated)
    personal?: Personal;
    cargo?: CatCargo;
}
