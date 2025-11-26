export interface Proyecto {
    _id: string;
    nombre: string;
    ubicacion: string;
    descripcion: string;
    activo: boolean;
    fechaCreacion: string;
}

export interface Vehiculo {
    _id: string;
    nombre: string;
    tipo: 'Camioneta' | 'Camión' | 'Maquinaria' | 'Otro';
    horometroInicial: number;
    horometroFinal?: number;
    horasOperacion: number;
    noEconomico: string;
    proyectos: string[] | Proyecto[]; // ✨ NUEVO
    activo: boolean;
    fechaCreacion: string;
}
