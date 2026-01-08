import { supabaseAdmin } from '../config/supabase.js';
import { vehiculosService } from './vehiculos.service.js';
import type {
  Reporte,
  ReporteCompleto,
  CreateReporteInput,
  UpdateReporteInput,
  ReporteFiltros,
  ReporteAcarreo,
  ReporteMaterial,
  ReporteAgua,
  ReporteMaquinaria,
  PinMapa
} from '../types/database.types.js';

/**
 * Servicio para operaciones de Reportes en Supabase
 * Maneja la complejidad de datos nested (acarreo, material, agua, maquinaria, etc.)
 */
export class ReportesService {
  /**
   * Obtener reportes con filtros
   */
  async getReportes(filtros: ReporteFiltros, limit?: number, offset?: number): Promise<Reporte[]> {
    let query = supabaseAdmin
      .from('reportes')
      .select('*')
      .order('fecha', { ascending: false });

    if (filtros.proyecto_id) {
      query = query.eq('proyecto_id', filtros.proyecto_id);
    }

    if (filtros.usuario_id) {
      query = query.eq('usuario_id', filtros.usuario_id);
    }

    if (filtros.fecha_inicio) {
      query = query.gte('fecha', filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
      query = query.lte('fecha', filtros.fecha_fin);
    }

    // Usar parámetros limit y offset si se proporcionan
    if (limit !== undefined) {
      query = query.limit(limit);
    }

    if (offset !== undefined) {
      const effectiveLimit = limit || 10;
      query = query.range(offset, offset + effectiveLimit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo reportes:', error);
      throw new Error(`Error obteniendo reportes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener un reporte completo por ID (con todos los nested arrays)
   */
  async getReporteById(id: string): Promise<ReporteCompleto | null> {
    // Obtener reporte principal
    const { data: reporte, error } = await supabaseAdmin
      .from('reportes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo reporte:', error);
      throw new Error(`Error obteniendo reporte: ${error.message}`);
    }

    // Obtener datos nested en paralelo
    const [
      controlAcarreo,
      controlMaterial,
      controlAgua,
      controlMaquinaria,
      pinesMapa,
      historialModificaciones
    ] = await Promise.all([
      this.getControlAcarreo(id),
      this.getControlMaterial(id),
      this.getControlAgua(id),
      this.getControlMaquinaria(id),
      this.getPinesMapa(id),
      this.getHistorialModificaciones(id)
    ]);

    return {
      ...reporte,
      controlAcarreo,
      controlMaterial,
      controlAgua,
      controlMaquinaria,
      pinesMapa,
      historialModificaciones
    };
  }

  /**
   * Crear un nuevo reporte con todos sus datos nested
   */
  async createReporte(input: CreateReporteInput): Promise<Reporte> {
    // Verificar idempotencia con offline_id
    if (input.offline_id) {
      const existing = await this.getReporteByOfflineId(input.offline_id);
      if (existing) {
        console.log(`Reporte con offline_id ${input.offline_id} ya existe, retornando existente`);
        return existing;
      }
    }

    // Extraer nested arrays
    const {
      controlAcarreo,
      controlMaterial,
      controlAgua,
      controlMaquinaria,
      pinesMapa,
      ...reporteData
    } = input;

    // Insertar reporte principal
    const { data: reporte, error } = await supabaseAdmin
      .from('reportes')
      .insert(reporteData)
      .select()
      .single();

    if (error) {
      console.error('Error creando reporte:', error);
      throw new Error(`Error creando reporte: ${error.message}`);
    }

    const reporteId = reporte.id;

    // Insertar datos nested en paralelo
    await Promise.all([
      controlAcarreo && controlAcarreo.length > 0
        ? this.insertControlAcarreo(reporteId, controlAcarreo)
        : Promise.resolve(),
      controlMaterial && controlMaterial.length > 0
        ? this.insertControlMaterial(reporteId, controlMaterial)
        : Promise.resolve(),
      controlAgua && controlAgua.length > 0
        ? this.insertControlAgua(reporteId, controlAgua)
        : Promise.resolve(),
      controlMaquinaria && controlMaquinaria.length > 0
        ? this.insertControlMaquinaria(reporteId, controlMaquinaria)
        : Promise.resolve(),
      pinesMapa && pinesMapa.length > 0
        ? this.insertPinesMapa(reporteId, pinesMapa)
        : Promise.resolve()
    ]);

    // Actualizar horómetros de vehículos si hay maquinaria
    if (controlMaquinaria && controlMaquinaria.length > 0) {
      await this.actualizarHorometrosVehiculos(controlMaquinaria);
    }

    return reporte;
  }

  /**
   * Actualizar un reporte existente
   */
  async updateReporte(
    id: string,
    input: UpdateReporteInput
  ): Promise<Reporte> {
    // Extraer usuario y observación del input
    const usuarioId = (input as any).usuario_modificacion_id;
    const usuarioNombre = (input as any).usuario_modificacion_nombre;
    const observacion = (input as any).observacion_modificacion;
    // Obtener reporte actual para comparar cambios
    const reporteActual = await this.getReporteById(id);
    if (!reporteActual) {
      throw new Error('Reporte no encontrado');
    }

    // Extraer nested arrays
    const {
      controlAcarreo,
      controlMaterial,
      controlAgua,
      controlMaquinaria,
      pinesMapa,
      ...reporteData
    } = input;

    // Actualizar reporte principal si hay cambios
    if (Object.keys(reporteData).length > 0) {
      const { error } = await supabaseAdmin
        .from('reportes')
        .update(reporteData)
        .eq('id', id);

      if (error) {
        console.error('Error actualizando reporte:', error);
        throw new Error(`Error actualizando reporte: ${error.message}`);
      }
    }

    // Actualizar datos nested si se proporcionaron
    const updatePromises: Promise<any>[] = [];

    if (controlAcarreo !== undefined) {
      updatePromises.push(this.replaceControlAcarreo(id, controlAcarreo));
    }

    if (controlMaterial !== undefined) {
      updatePromises.push(this.replaceControlMaterial(id, controlMaterial));
    }

    if (controlAgua !== undefined) {
      updatePromises.push(this.replaceControlAgua(id, controlAgua));
    }

    if (controlMaquinaria !== undefined) {
      updatePromises.push(this.replaceControlMaquinaria(id, controlMaquinaria));
      // Actualizar horómetros
      if (controlMaquinaria.length > 0) {
        updatePromises.push(this.actualizarHorometrosVehiculos(controlMaquinaria));
      }
    }

    if (pinesMapa !== undefined) {
      updatePromises.push(this.replacePinesMapa(id, pinesMapa));
    }

    await Promise.all(updatePromises);

    // Registrar en historial (calcular cambios)
    const cambios = this.calcularCambios(reporteActual, reporteData);
    if (cambios.length > 0 || observacion) {
      await this.registrarModificacion(id, usuarioId, usuarioNombre, cambios, observacion);
    }

    // Obtener reporte actualizado
    const { data: reporteActualizado, error: fetchError } = await supabaseAdmin
      .from('reportes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Error obteniendo reporte actualizado: ${fetchError.message}`);
    }

    return reporteActualizado;
  }

  /**
   * Eliminar un reporte
   */
  async deleteReporte(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('reportes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando reporte:', error);
      throw new Error(`Error eliminando reporte: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de reportes
   */
  async getEstadisticas(
    proyectoIds?: string[],
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<any> {
    let query = supabaseAdmin
      .from('reportes')
      .select('*');

    if (proyectoIds && proyectoIds.length > 0) {
      query = query.in('proyecto_id', proyectoIds);
    }

    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio.toISOString());
    }

    if (fechaFin) {
      query = query.lte('fecha', fechaFin.toISOString());
    }

    const { data: reportes, error } = await query;

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }

    // Calcular estadísticas básicas
    const totalReportes = reportes?.length || 0;
    const proyectosUnicos = new Set(reportes?.map(r => r.proyecto_id)).size;
    const usuariosUnicos = new Set(reportes?.map(r => r.usuario_id)).size;

    // Obtener totales de sub-tablas si hay reportes
    let totalAcarreos = 0;
    let totalMateriales = 0;
    let totalAgua = 0;
    let totalMaquinaria = 0;

    if (reportes && reportes.length > 0) {
      const reporteIds = reportes.map(r => r.id);

      const [acarreos, materiales, agua, maquinaria] = await Promise.all([
        supabaseAdmin.from('reporte_acarreo').select('*', { count: 'exact', head: true }).in('reporte_id', reporteIds),
        supabaseAdmin.from('reporte_material').select('*', { count: 'exact', head: true }).in('reporte_id', reporteIds),
        supabaseAdmin.from('reporte_agua').select('*', { count: 'exact', head: true }).in('reporte_id', reporteIds),
        supabaseAdmin.from('reporte_maquinaria').select('*', { count: 'exact', head: true }).in('reporte_id', reporteIds)
      ]);

      totalAcarreos = acarreos.count || 0;
      totalMateriales = materiales.count || 0;
      totalAgua = agua.count || 0;
      totalMaquinaria = maquinaria.count || 0;
    }

    return {
      totalReportes,
      proyectosUnicos,
      usuariosUnicos,
      totalAcarreos,
      totalMateriales,
      totalAgua,
      totalMaquinaria,
      fechaInicio: fechaInicio?.toISOString(),
      fechaFin: fechaFin?.toISOString()
    };
  }

  /**
   * Obtener reporte por offline_id
   */
  private async getReporteByOfflineId(offlineId: string): Promise<Reporte | null> {
    const { data, error } = await supabaseAdmin
      .from('reportes')
      .select('*')
      .eq('offline_id', offlineId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  // ========================================
  // MÉTODOS PRIVADOS PARA NESTED DATA
  // ========================================

  private async getControlAcarreo(reporteId: string): Promise<ReporteAcarreo[]> {
    const { data, error } = await supabaseAdmin
      .from('reporte_acarreo')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) {
      console.error('Error obteniendo control acarreo:', error);
      return [];
    }

    return data || [];
  }

  private async getControlMaterial(reporteId: string): Promise<ReporteMaterial[]> {
    const { data, error } = await supabaseAdmin
      .from('reporte_material')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) {
      console.error('Error obteniendo control material:', error);
      return [];
    }

    return data || [];
  }

  private async getControlAgua(reporteId: string): Promise<ReporteAgua[]> {
    const { data, error } = await supabaseAdmin
      .from('reporte_agua')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) {
      console.error('Error obteniendo control agua:', error);
      return [];
    }

    return data || [];
  }

  private async getControlMaquinaria(reporteId: string): Promise<ReporteMaquinaria[]> {
    const { data, error } = await supabaseAdmin
      .from('reporte_maquinaria')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) {
      console.error('Error obteniendo control maquinaria:', error);
      return [];
    }

    return data || [];
  }

  private async getPinesMapa(reporteId: string): Promise<PinMapa[]> {
    const { data, error } = await supabaseAdmin
      .from('pines_mapa')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) {
      console.error('Error obteniendo pines mapa:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Obtener historial de modificaciones de un reporte
   */
  async getHistorialModificaciones(reporteId: string): Promise<any[]> {
    const { data: historial, error } = await supabaseAdmin
      .from('reporte_historial')
      .select('*')
      .eq('reporte_id', reporteId)
      .order('fecha_modificacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }

    // Obtener cambios para cada entrada del historial
    const historialConCambios = await Promise.all(
      (historial || []).map(async (h) => {
        const { data: cambios } = await supabaseAdmin
          .from('reporte_cambios')
          .select('*')
          .eq('historial_id', h.id);

        return {
          ...h,
          cambios: cambios || []
        };
      })
    );

    return historialConCambios;
  }

  // Métodos para insertar nested data
  private async insertControlAcarreo(reporteId: string, items: any[]): Promise<void> {
    const inserts = items.map(item => ({
      reporte_id: reporteId,
      ...item
    }));

    const { error } = await supabaseAdmin
      .from('reporte_acarreo')
      .insert(inserts);

    if (error) {
      throw new Error(`Error insertando control acarreo: ${error.message}`);
    }
  }

  private async insertControlMaterial(reporteId: string, items: any[]): Promise<void> {
    const inserts = items.map(item => ({
      reporte_id: reporteId,
      ...item
    }));

    const { error } = await supabaseAdmin
      .from('reporte_material')
      .insert(inserts);

    if (error) {
      throw new Error(`Error insertando control material: ${error.message}`);
    }
  }

  private async insertControlAgua(reporteId: string, items: any[]): Promise<void> {
    const inserts = items.map(item => ({
      reporte_id: reporteId,
      ...item
    }));

    const { error } = await supabaseAdmin
      .from('reporte_agua')
      .insert(inserts);

    if (error) {
      throw new Error(`Error insertando control agua: ${error.message}`);
    }
  }

  private async insertControlMaquinaria(reporteId: string, items: any[]): Promise<void> {
    const inserts = items.map(item => ({
      reporte_id: reporteId,
      ...item
    }));

    const { error } = await supabaseAdmin
      .from('reporte_maquinaria')
      .insert(inserts);

    if (error) {
      throw new Error(`Error insertando control maquinaria: ${error.message}`);
    }
  }

  private async insertPinesMapa(reporteId: string, items: any[]): Promise<void> {
    const inserts = items.map(item => ({
      reporte_id: reporteId,
      ...item
    }));

    const { error } = await supabaseAdmin
      .from('pines_mapa')
      .insert(inserts);

    if (error) {
      throw new Error(`Error insertando pines mapa: ${error.message}`);
    }
  }

  // Métodos para reemplazar nested data (delete + insert)
  private async replaceControlAcarreo(reporteId: string, items: any[]): Promise<void> {
    await supabaseAdmin.from('reporte_acarreo').delete().eq('reporte_id', reporteId);
    if (items.length > 0) {
      await this.insertControlAcarreo(reporteId, items);
    }
  }

  private async replaceControlMaterial(reporteId: string, items: any[]): Promise<void> {
    await supabaseAdmin.from('reporte_material').delete().eq('reporte_id', reporteId);
    if (items.length > 0) {
      await this.insertControlMaterial(reporteId, items);
    }
  }

  private async replaceControlAgua(reporteId: string, items: any[]): Promise<void> {
    await supabaseAdmin.from('reporte_agua').delete().eq('reporte_id', reporteId);
    if (items.length > 0) {
      await this.insertControlAgua(reporteId, items);
    }
  }

  private async replaceControlMaquinaria(reporteId: string, items: any[]): Promise<void> {
    await supabaseAdmin.from('reporte_maquinaria').delete().eq('reporte_id', reporteId);
    if (items.length > 0) {
      await this.insertControlMaquinaria(reporteId, items);
    }
  }

  private async replacePinesMapa(reporteId: string, items: any[]): Promise<void> {
    await supabaseAdmin.from('pines_mapa').delete().eq('reporte_id', reporteId);
    if (items.length > 0) {
      await this.insertPinesMapa(reporteId, items);
    }
  }

  // Actualizar horómetros de vehículos
  private async actualizarHorometrosVehiculos(controlMaquinaria: any[]): Promise<void> {
    const updates = controlMaquinaria
      .filter(m => m.vehiculo_id && m.horometro_inicial !== undefined && m.horometro_final !== undefined)
      .map(m => vehiculosService.updateHorometros(m.vehiculo_id, m.horometro_inicial, m.horometro_final));

    await Promise.all(updates);
  }

  // Registrar modificación en historial
  private async registrarModificacion(
    reporteId: string,
    usuarioId: string,
    usuarioNombre: string,
    cambios: any[],
    observacion?: string
  ): Promise<void> {
    const { data: historial, error: historialError } = await supabaseAdmin
      .from('reporte_historial')
      .insert({
        reporte_id: reporteId,
        usuario_id: usuarioId,
        usuario_nombre: usuarioNombre,
        observacion
      })
      .select()
      .single();

    if (historialError) {
      console.error('Error registrando historial:', historialError);
      return;
    }

    if (cambios.length > 0) {
      const cambiosInserts = cambios.map(c => ({
        historial_id: historial.id,
        campo: c.campo,
        valor_anterior: c.valorAnterior,
        valor_nuevo: c.valorNuevo
      }));

      await supabaseAdmin.from('reporte_cambios').insert(cambiosInserts);
    }
  }

  // Calcular cambios entre reporte actual y updates
  private calcularCambios(reporteActual: any, updates: any): any[] {
    const cambios: any[] = [];

    for (const [campo, valorNuevo] of Object.entries(updates)) {
      const valorAnterior = reporteActual[campo];
      if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
        cambios.push({
          campo,
          valorAnterior,
          valorNuevo
        });
      }
    }

    return cambios;
  }
}

// Exportar instancia singleton
export const reportesService = new ReportesService();
