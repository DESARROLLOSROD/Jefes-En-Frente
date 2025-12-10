export interface Proyecto {
    _id: string;
    nombre: string;
    ubicacion: string;
    descripcion: string;
    activo: boolean;
    fechaCreacion: string;
    mapa?: {
        imagen: {
            data: string;
            contentType: string;
        };
        width: number;
        height: number;
    };
}

export interface ITipoVehiculoCatalog {
    _id: string;
    nombre: string;
    activo: boolean;
    fechaCreacion: string;
}

export interface Vehiculo {
    _id: string;
    nombre: string;
    tipo: string;
    horometroInicial: number;
    horometroFinal?: number;
    horasOperacion: number;
    noEconomico: string;
    capacidad?: string; // ✨ NUEVO - Capacidad en M³ para CAMIÓN y PIPA
    proyectos: string[] | Proyecto[]; // ✨ NUEVO
    activo: boolean;
    fechaCreacion: string;
}
