import { supabaseAdmin } from '../config/supabase.js';
import type {
  Proyecto,
  CreateProyectoInput,
  UpdateProyectoInput
} from '../types/database.types.js';

/**
 * Servicio para operaciones de Proyectos en Supabase
 */
export class ProyectosService {
  async getProyectos(activo?: boolean): Promise<any[]> {
    let query = supabaseAdmin
      .from('proyectos')
      .select('id, nombre, ubicacion, descripcion, activo, fecha_creacion')
      .order('fecha_creacion', { ascending: false });

    if (activo !== undefined) {
      query = query.eq('activo', activo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo proyectos:', error);
      throw new Error(`Error obteniendo proyectos: ${error.message}`);
    }

    return (data || []).map(p => this.formatForFrontend(p));
  }

  /**
   * Formatear proyecto para compatibilidad con frontend antiguo (MongoDB style)
   */
  private formatForFrontend(p: any): any {
    if (!p) return null;
    return {
      ...p,
      _id: p.id,
      mapa: p.mapa_imagen_data ? {
        imagen: {
          data: p.mapa_imagen_data,
          contentType: p.mapa_content_type || 'image/png'
        },
        width: p.mapa_width,
        height: p.mapa_height
      } : undefined
    };
  }

  /**
   * Obtener un proyecto por ID
   */
  async getProyectoById(id: string): Promise<any | null> {
    const { data, error } = await supabaseAdmin
      .from('proyectos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el proyecto
        return null;
      }
      console.error('Error obteniendo proyecto:', error);
      throw new Error(`Error obteniendo proyecto: ${error.message}`);
    }

    return this.formatForFrontend(data);
  }

  /**
   * Crear un nuevo proyecto
   */
  async createProyecto(input: CreateProyectoInput): Promise<Proyecto> {
    const { data, error } = await supabaseAdmin
      .from('proyectos')
      .insert({
        ...input,
        activo: input.activo ?? true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando proyecto:', error);
      throw new Error(`Error creando proyecto: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar un proyecto existente
   */
  async updateProyecto(id: string, input: UpdateProyectoInput): Promise<Proyecto> {
    const { data, error } = await supabaseAdmin
      .from('proyectos')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando proyecto:', error);
      throw new Error(`Error actualizando proyecto: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft delete de un proyecto (marcar como inactivo)
   */
  async deleteProyecto(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('proyectos')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      console.error('Error eliminando proyecto:', error);
      throw new Error(`Error eliminando proyecto: ${error.message}`);
    }
  }

  /**
   * Hard delete de un proyecto (eliminar permanentemente)
   * USAR CON PRECAUCIÓN - Eliminará todos los datos relacionados por CASCADE
   */
  async hardDeleteProyecto(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('proyectos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando proyecto permanentemente:', error);
      throw new Error(`Error eliminando proyecto permanentemente: ${error.message}`);
    }
  }

  /**
   * Obtener proyectos de un usuario específico
   */
  async getProyectosByUsuario(usuarioId: string): Promise<Proyecto[]> {
    const { data, error } = await supabaseAdmin
      .from('proyecto_usuarios')
      .select('proyectos(id, nombre, ubicacion, descripcion, activo, fecha_creacion)')
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Error obteniendo proyectos del usuario:', error);
      throw new Error(`Error obteniendo proyectos del usuario: ${error.message}`);
    }

    // Extraer los proyectos del resultado y formatearlos
    return data?.map((item: any) => this.formatForFrontend(item.proyectos)).filter(Boolean) || [];
  }

  /**
   * Asignar un proyecto a un usuario
   */
  async assignProyectoToUsuario(proyectoId: string, usuarioId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('proyecto_usuarios')
      .insert({
        proyecto_id: proyectoId,
        usuario_id: usuarioId
      });

    if (error) {
      // Ignorar error de duplicate key (el usuario ya está asignado)
      if (error.code === '23505') {
        return;
      }
      console.error('Error asignando proyecto a usuario:', error);
      throw new Error(`Error asignando proyecto a usuario: ${error.message}`);
    }
  }

  /**
   * Remover asignación de proyecto a usuario
   */
  async removeProyectoFromUsuario(proyectoId: string, usuarioId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('proyecto_usuarios')
      .delete()
      .eq('proyecto_id', proyectoId)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Error removiendo proyecto de usuario:', error);
      throw new Error(`Error removiendo proyecto de usuario: ${error.message}`);
    }
  }

  /**
   * Asignar múltiples proyectos a un usuario (reemplaza asignaciones existentes)
   */
  async setProyectosForUsuario(usuarioId: string, proyectoIds: string[]): Promise<void> {
    // Primero eliminar todas las asignaciones existentes
    await supabaseAdmin
      .from('proyecto_usuarios')
      .delete()
      .eq('usuario_id', usuarioId);

    // Luego insertar las nuevas asignaciones
    if (proyectoIds.length > 0) {
      const inserts = proyectoIds.map(proyectoId => ({
        usuario_id: usuarioId,
        proyecto_id: proyectoId
      }));

      const { error } = await supabaseAdmin
        .from('proyecto_usuarios')
        .insert(inserts);

      if (error) {
        console.error('Error asignando proyectos a usuario:', error);
        throw new Error(`Error asignando proyectos a usuario: ${error.message}`);
      }
    }
  }
}

// Exportar instancia singleton
export const proyectosService = new ProyectosService();
