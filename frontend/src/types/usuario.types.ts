export interface Usuario {
    _id?: string;
    nombre: string;
    email: string;
    rol: 'admin' | 'supervisor' | 'jefe en frente';
    proyectos: any[];
    activo: boolean;
    fechaCreacion?: string;
}

export interface CrearUsuarioDTO {
    nombre: string;
    email: string;
    password: string;
    rol: 'admin' | 'supervisor' | 'jefe en frente';
    proyectos: string[];
    activo: boolean;
}

export interface ActualizarUsuarioDTO {
    nombre?: string;
    email?: string;
    password?: string;
    rol?: 'admin' | 'supervisor' | 'jefe en frente';
    proyectos?: string[];
    activo?: boolean;
}

export interface UsuarioResponse {
    success: boolean;
    data?: Usuario;
    error?: string;
}

export interface UsuariosResponse {
    success: boolean;
    data?: Usuario[];
    error?: string;
}
