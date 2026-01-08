import { supabaseAdmin } from '../config/supabase.js';
import type { Perfil, PerfilConProyectos, Proyecto } from '../types/database.types.js';

/**
 * Servicio para operaciones de Usuarios (Perfiles) en Supabase
 */
export class UsuariosService {
  /**
   * Obtener todos los usuarios con sus proyectos
   */
  async getUsuarios(): Promise<PerfilConProyectos[]> {
    const { data: perfiles, error } = await supabaseAdmin
      .from('perfiles')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }

    // Obtener proyectos para cada usuario
    const perfilesConProyectos = await Promise.all(
      (perfiles || []).map(async (perfil) => {
        const proyectos = await this.getProyectosDeUsuario(perfil.id);
        return {
          ...perfil,
          proyectos
        };
      })
    );

    return perfilesConProyectos;
  }

  /**
   * Obtener un usuario por ID con sus proyectos
   */
  async getUsuarioById(id: string): Promise<PerfilConProyectos | null> {
    const { data, error } = await supabaseAdmin
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo usuario:', error);
      throw new Error(`Error obteniendo usuario: ${error.message}`);
    }

    // Obtener proyectos del usuario
    const proyectos = await this.getProyectosDeUsuario(id);

    return {
      ...data,
      proyectos
    };
  }

  /**
   * Obtener usuario por email
   */
  async getUsuarioByEmail(email: string): Promise<Perfil | null> {
    // Buscar en auth.users primero
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error buscando usuario por email:', authError);
      throw new Error(`Error buscando usuario por email: ${authError.message}`);
    }

    const authUser = authData.users.find(u => u.email === email);
    if (!authUser) {
      return null;
    }

    // Buscar perfil
    const { data, error } = await supabaseAdmin
      .from('perfiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo perfil:', error);
      throw new Error(`Error obteniendo perfil: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar perfil de usuario (no incluye password ni email, eso se maneja con Supabase Auth)
   */
  async updateUsuarioPerfil(
    id: string,
    updates: Partial<Pick<Perfil, 'nombre' | 'rol' | 'activo'>>
  ): Promise<Perfil> {
    const { data, error } = await supabaseAdmin
      .from('perfiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando perfil:', error);
      throw new Error(`Error actualizando perfil: ${error.message}`);
    }

    return data;
  }

  /**
   * Asignar proyectos a un usuario
   */
  async assignProyectosToUsuario(usuarioId: string, proyectoIds: string[]): Promise<void> {
    // Eliminar asignaciones existentes
    await supabaseAdmin
      .from('proyecto_usuarios')
      .delete()
      .eq('usuario_id', usuarioId);

    // Insertar nuevas asignaciones
    if (proyectoIds.length > 0) {
      const inserts = proyectoIds.map(proyectoId => ({
        usuario_id: usuarioId,
        proyecto_id: proyectoId
      }));

      const { error } = await supabaseAdmin
        .from('proyecto_usuarios')
        .insert(inserts);

      if (error) {
        console.error('Error asignando proyectos:', error);
        throw new Error(`Error asignando proyectos: ${error.message}`);
      }
    }
  }

  /**
   * Obtener proyectos de un usuario
   */
  private async getProyectosDeUsuario(usuarioId: string): Promise<Proyecto[]> {
    const { data, error } = await supabaseAdmin
      .from('proyecto_usuarios')
      .select(`
        proyectos (
          id,
          nombre,
          ubicacion,
          descripcion,
          mapa_imagen_data,
          mapa_content_type,
          mapa_width,
          mapa_height,
          activo,
          fecha_creacion
        )
      `)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Error obteniendo proyectos del usuario:', error);
      return [];
    }

    return data?.map((item: any) => item.proyectos).filter(Boolean) || [];
  }

  /**
   * Desactivar usuario (soft delete)
   */
  async desactivarUsuario(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('perfiles')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      console.error('Error desactivando usuario:', error);
      throw new Error(`Error desactivando usuario: ${error.message}`);
    }
  }

  /**
   * Activar usuario
   */
  async activarUsuario(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('perfiles')
      .update({ activo: true })
      .eq('id', id);

    if (error) {
      console.error('Error activando usuario:', error);
      throw new Error(`Error activando usuario: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario permanentemente
   * IMPORTANTE: Esto eliminará el usuario de Auth y su perfil
   */
  async deleteUsuario(id: string): Promise<void> {
    // Primero eliminar de Auth (esto también eliminará el perfil por CASCADE)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error('Error eliminando usuario:', error);
      throw new Error(`Error eliminando usuario: ${error.message}`);
    }
  }

  /**
   * Crear perfil para un usuario existente en Auth
   * (normalmente esto se hace automáticamente con el trigger, pero puede ser útil para casos especiales)
   */
  async createPerfil(perfilData: { id: string; nombre: string; rol: 'admin' | 'supervisor' | 'jefe en frente'; activo?: boolean }): Promise<Perfil> {
    const { data, error } = await supabaseAdmin
      .from('perfiles')
      .insert({
        id: perfilData.id,
        nombre: perfilData.nombre,
        rol: perfilData.rol,
        activo: perfilData.activo ?? true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando perfil:', error);
      throw new Error(`Error creando perfil: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar perfil (alias de updateUsuarioPerfil para consistencia)
   */
  async updatePerfil(
    id: string,
    updates: Partial<Pick<Perfil, 'nombre' | 'rol' | 'activo'>>
  ): Promise<Perfil> {
    return this.updateUsuarioPerfil(id, updates);
  }
}

// Exportar instancia singleton
export const usuariosService = new UsuariosService();
