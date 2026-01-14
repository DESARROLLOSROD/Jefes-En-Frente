import { supabase } from '../config/supabase.js';
import { BibliotecaMapa, CreateBibliotecaMapaInput, UpdateBibliotecaMapaInput } from '../types/database.types.js';

/**
 * Servicio para gestionar la biblioteca de mapas en Supabase
 */
class BibliotecaMapasService {

  /**
   * Obtener todos los mapas de la biblioteca
   * (públicos o creados por el usuario)
   */
  async obtenerMapas(usuarioId: string): Promise<BibliotecaMapa[]> {
    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .select('*')
      .or(`es_publico.eq.true,creado_por.eq.${usuarioId}`)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener biblioteca de mapas:', error);
      throw new Error('ERROR AL OBTENER BIBLIOTECA DE MAPAS');
    }

    return data || [];
  }

  /**
   * Obtener mapas por categoría
   */
  async obtenerMapasPorCategoria(categoria: string, usuarioId: string): Promise<BibliotecaMapa[]> {
    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .select('*')
      .eq('categoria', categoria)
      .or(`es_publico.eq.true,creado_por.eq.${usuarioId}`)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener mapas por categoría:', error);
      throw new Error('ERROR AL OBTENER MAPAS');
    }

    return data || [];
  }

  /**
   * Obtener mapa por ID
   */
  async obtenerMapaPorId(id: string, usuarioId: string): Promise<BibliotecaMapa | null> {
    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .select('*')
      .eq('id', id)
      .or(`es_publico.eq.true,creado_por.eq.${usuarioId}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error al obtener mapa:', error);
      throw new Error('ERROR AL OBTENER MAPA');
    }

    return data;
  }

  /**
   * Crear nuevo mapa en biblioteca
   */
  async crearMapa(input: CreateBibliotecaMapaInput, usuarioId: string): Promise<BibliotecaMapa> {
    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .insert({
        nombre: input.nombre,
        descripcion: input.descripcion,
        categoria: input.categoria || 'GENERAL',
        imagen_data: input.imagen_data,
        imagen_content_type: input.imagen_content_type,
        width: input.width,
        height: input.height,
        etiquetas: input.etiquetas || [],
        es_publico: input.es_publico || false,
        creado_por: usuarioId,
        proyecto_id: input.proyecto_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear mapa:', error);
      throw new Error('ERROR AL CREAR MAPA EN BIBLIOTECA');
    }

    return data;
  }

  /**
   * Actualizar mapa existente
   */
  async actualizarMapa(id: string, input: UpdateBibliotecaMapaInput, usuarioId: string): Promise<BibliotecaMapa> {
    // Verificar que el usuario es el creador
    const mapaExistente = await this.obtenerMapaPorId(id, usuarioId);

    if (!mapaExistente) {
      throw new Error('MAPA NO ENCONTRADO');
    }

    if (mapaExistente.creado_por !== usuarioId) {
      throw new Error('NO TIENE PERMISOS PARA MODIFICAR ESTE MAPA');
    }

    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .update(input)
      .eq('id', id)
      .eq('creado_por', usuarioId) // Seguridad adicional
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar mapa:', error);
      throw new Error('ERROR AL ACTUALIZAR MAPA');
    }

    return data;
  }

  /**
   * Eliminar mapa de biblioteca
   */
  async eliminarMapa(id: string, usuarioId: string): Promise<void> {
    // Verificar que el usuario es el creador
    const mapaExistente = await this.obtenerMapaPorId(id, usuarioId);

    if (!mapaExistente) {
      throw new Error('MAPA NO ENCONTRADO');
    }

    if (mapaExistente.creado_por !== usuarioId) {
      throw new Error('NO TIENE PERMISOS PARA ELIMINAR ESTE MAPA');
    }

    const { error } = await supabase
      .from('biblioteca_mapas')
      .delete()
      .eq('id', id)
      .eq('creado_por', usuarioId); // Seguridad adicional

    if (error) {
      console.error('Error al eliminar mapa:', error);
      throw new Error('ERROR AL ELIMINAR MAPA');
    }
  }

  /**
   * Buscar mapas por etiquetas
   */
  async buscarPorEtiquetas(etiquetas: string[], usuarioId: string): Promise<BibliotecaMapa[]> {
    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .select('*')
      .or(`es_publico.eq.true,creado_por.eq.${usuarioId}`)
      .overlaps('etiquetas', etiquetas)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al buscar mapas por etiquetas:', error);
      throw new Error('ERROR AL BUSCAR MAPAS');
    }

    return data || [];
  }

  /**
   * Obtener mapas de un proyecto específico
   */
  async obtenerMapasDeProyecto(proyectoId: string, usuarioId: string): Promise<BibliotecaMapa[]> {
    const { data, error } = await supabase
      .from('biblioteca_mapas')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .or(`es_publico.eq.true,creado_por.eq.${usuarioId}`)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener mapas del proyecto:', error);
      throw new Error('ERROR AL OBTENER MAPAS DEL PROYECTO');
    }

    return data || [];
  }
}

export default new BibliotecaMapasService();
