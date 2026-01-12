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
  PinMapa,
  ReportePersonal
} from '../types/database.types.js';

/**
 * Servicio para operaciones de Reportes en Supabase
 * Maneja la complejidad de datos nested (acarreo, material, agua, maquinaria, etc.)
 */
export class ReportesService {
  /**
   * Formatear reporte para compatibilidad con frontend antiguo (MongoDB style)
   */
  private formatForFrontend(r: any): any {
    if (!r) return null;
    return {
      ...r,
      _id: r.id,
      usuarioId: r.usuario_id,
      proyectoId: r.proyecto_id,
      fechaCreacion: r.fecha_creacion,
      inicioActividades: r.inicio_actividades,
      termino_actividades: r.termino_actividades, // Keep both for now
      terminoActividades: r.termino_actividades,
      jefeFrente: r.jefe_frente,
      offlineId: r.offline_id,
      zonaTrabajo: {
        zonaId: r.zona_id,
        zonaNombre: r.zona_nombre
      },
      seccionTrabajo: {
        seccionId: r.seccion_id,
        seccionNombre: r.seccion_nombre
      },
      ubicacionMapa: {
        pinX: r.ubicacion_mapa_pin_x,
        pinY: r.ubicacion_mapa_pin_y,
        colocado: r.ubicacion_mapa_colocado
      }
    };
  }

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

    return (data || []).map(r => this.formatForFrontend(r));
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
      personalAsignado,
      historialModificaciones
    ] = await Promise.all([
      this.getControlAcarreo(id),
      this.getControlMaterial(id),
      this.getControlAgua(id),
      this.getControlMaquinaria(id),
      this.getPinesMapa(id),
      this.getPersonalAsignado(id),
      this.getHistorialModificaciones(id)
    ]);

    const formattedReporte = this.formatForFrontend(reporte);

    return {
      ...formattedReporte,
      controlAcarreo: controlAcarreo.map((a: any) => ({ ...a, _id: a.id })),
      controlMaterial: controlMaterial.map((m: any) => ({ ...m, _id: m.id })),
      controlAgua: controlAgua.map((w: any) => ({ ...w, _id: w.id, noEconomico: w.no_economico })),
      controlMaquinaria: controlMaquinaria.map((mq: any) => ({
        ...mq,
        _id: mq.id,
        vehiculoId: mq.vehiculo_id,
        numeroEconomico: mq.numero_economico,
        horometroInicial: mq.horometro_inicial,
        horometroFinal: mq.horometro_final,
        horasOperacion: mq.horas_operacion
      })),
      pinesMapa: pinesMapa.map((p: any) => ({ ...p, _id: p.id })),
      personalAsignado: personalAsignado.map((p: any) => ({
        ...p,
        _id: p.id,
        reporteId: p.reporte_id,
        personalId: p.personal_id,
        cargoId: p.cargo_id,
        actividadRealizada: p.actividad_realizada,
        horasTrabajadas: p.horas_trabajadas,
        fechaCreacion: p.fecha_creacion
      })),
      historialModificaciones: historialModificaciones.map((h: any) => ({
        ...h,
        _id: h.id,
        fechaModificacion: h.fecha_modificacion,
        usuarioId: h.usuario_id,
        usuarioNombre: h.usuario_nombre
      }))
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
      personalAsignado,
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
        : Promise.resolve(),
      personalAsignado && personalAsignado.length > 0
        ? this.insertPersonalAsignado(reporteId, personalAsignado)
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
      personalAsignado,
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

    if (personalAsignado !== undefined) {
      updatePromises.push(this.replacePersonalAsignado(id, personalAsignado));
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
    console.log('📊 Calculando estadísticas detalladas...');

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

    const totalReportes = reportes?.length || 0;

    // Si no hay reportes, retornar estructura vacía
    if (!reportes || reportes.length === 0) {
      return {
        rangoFechas: {
          inicio: fechaInicio?.toISOString().split('T')[0] || '',
          fin: fechaFin?.toISOString().split('T')[0] || ''
        },
        totalReportes: 0,
        totalViajes: 0,
        acarreo: {
          materiales: [],
          totalVolumen: 0,
          totalViajes: 0,
          materialMasMovido: 'N/A'
        },
        material: {
          materiales: [],
          materialMasUtilizado: 'N/A'
        },
        agua: {
          porOrigen: [],
          volumenTotal: 0,
          totalViajes: 0,
          origenMasUtilizado: 'N/A'
        },
        vehiculos: {
          vehiculos: [],
          totalHoras: 0,
          vehiculoMasUtilizado: 'N/A'
        },
        personal: {
          personal: [],
          totalHoras: 0,
          personalMasActivo: 'N/A',
          totalPersonal: 0
        }
      };
    }

    const reporteIds = reportes.map(r => r.id);

    // Obtener datos detallados de todas las tablas en paralelo
    const [
      acarreoData,
      materialData,
      aguaData,
      maquinariaData,
      personalData
    ] = await Promise.all([
      supabaseAdmin.from('reporte_acarreo').select('*').in('reporte_id', reporteIds),
      supabaseAdmin.from('reporte_material').select('*').in('reporte_id', reporteIds),
      supabaseAdmin.from('reporte_agua').select('*').in('reporte_id', reporteIds),
      supabaseAdmin.from('reporte_maquinaria').select('*').in('reporte_id', reporteIds),
      supabaseAdmin.from('reporte_personal').select(`
        *,
        personal:personal(nombre_completo),
        cargo:cat_cargos(nombre)
      `).in('reporte_id', reporteIds)
    ]);

    // ========== ESTADÍSTICAS DE ACARREO ==========
    const acarreoMap = new Map<string, { volumen: number; viajes: number }>();
    let totalVolumenAcarreo = 0;
    let totalViajesAcarreo = 0;

    acarreoData.data?.forEach((item: any) => {
      const material = item.material || 'SIN ESPECIFICAR';
      const volumen = parseFloat(item.vol_suelto) || 0;
      const viajes = parseInt(item.no_viaje) || 0;

      if (!acarreoMap.has(material)) {
        acarreoMap.set(material, { volumen: 0, viajes: 0 });
      }
      const current = acarreoMap.get(material)!;
      current.volumen += volumen;
      current.viajes += viajes;

      totalVolumenAcarreo += volumen;
      totalViajesAcarreo += viajes;
    });

    const acarreoMateriales = Array.from(acarreoMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        volumen: parseFloat(data.volumen.toFixed(2)),
        viajes: data.viajes,
        porcentaje: totalVolumenAcarreo > 0
          ? parseFloat(((data.volumen / totalVolumenAcarreo) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.volumen - a.volumen);

    const materialMasMovido = acarreoMateriales.length > 0
      ? acarreoMateriales[0].nombre
      : 'N/A';

    // ========== ESTADÍSTICAS DE MATERIAL ==========
    const materialMap = new Map<string, { cantidad: number; unidad: string }>();

    materialData.data?.forEach((item: any) => {
      const material = item.material || 'SIN ESPECIFICAR';
      const cantidad = parseFloat(item.cantidad) || 0;
      const unidad = item.unidad || 'UNI';

      if (!materialMap.has(material)) {
        materialMap.set(material, { cantidad: 0, unidad });
      }
      materialMap.get(material)!.cantidad += cantidad;
    });

    const materiales = Array.from(materialMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        cantidad: parseFloat(data.cantidad.toFixed(2)),
        unidad: data.unidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const materialMasUtilizado = materiales.length > 0
      ? materiales[0].nombre
      : 'N/A';

    // ========== ESTADÍSTICAS DE AGUA ==========
    const aguaMap = new Map<string, { volumen: number; viajes: number }>();
    let totalVolumenAgua = 0;
    let totalViajesAgua = 0;

    aguaData.data?.forEach((item: any) => {
      const origen = item.origen || 'SIN ESPECIFICAR';
      const volumen = parseFloat(item.volumen) || 0;
      const viajes = parseInt(item.viaje) || 0;

      if (!aguaMap.has(origen)) {
        aguaMap.set(origen, { volumen: 0, viajes: 0 });
      }
      const current = aguaMap.get(origen)!;
      current.volumen += volumen;
      current.viajes += viajes;

      totalVolumenAgua += volumen;
      totalViajesAgua += viajes;
    });

    const aguaPorOrigen = Array.from(aguaMap.entries())
      .map(([origen, data]) => ({
        origen,
        volumen: parseFloat(data.volumen.toFixed(2)),
        viajes: data.viajes,
        porcentaje: totalVolumenAgua > 0
          ? parseFloat(((data.volumen / totalVolumenAgua) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.volumen - a.volumen);

    const origenMasUtilizado = aguaPorOrigen.length > 0
      ? aguaPorOrigen[0].origen
      : 'N/A';

    // ========== ESTADÍSTICAS DE VEHÍCULOS/MAQUINARIA ==========
    const vehiculoMap = new Map<string, { nombre: string; horas: number }>();
    let totalHorasVehiculos = 0;

    maquinariaData.data?.forEach((item: any) => {
      const noEconomico = item.numero_economico || 'SIN NÚMERO';
      const nombre = item.tipo || 'SIN TIPO';
      const horas = parseFloat(item.horas_operacion) || 0;

      if (!vehiculoMap.has(noEconomico)) {
        vehiculoMap.set(noEconomico, { nombre, horas: 0 });
      }
      vehiculoMap.get(noEconomico)!.horas += horas;
      totalHorasVehiculos += horas;
    });

    const vehiculos = Array.from(vehiculoMap.entries())
      .map(([noEconomico, data]) => ({
        nombre: data.nombre,
        noEconomico,
        horasOperacion: parseFloat(data.horas.toFixed(2)),
        porcentaje: totalHorasVehiculos > 0
          ? parseFloat(((data.horas / totalHorasVehiculos) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.horasOperacion - a.horasOperacion);

    const vehiculoMasUtilizado = vehiculos.length > 0
      ? `${vehiculos[0].nombre} (${vehiculos[0].noEconomico})`
      : 'N/A';

    // ========== ESTADÍSTICAS DE PERSONAL ==========
    const personalMap = new Map<string, {
      nombre: string;
      cargoNombre: string;
      horas: number;
      reportes: Set<string>;
    }>();
    let totalHorasPersonal = 0;

    personalData.data?.forEach((item: any) => {
      const personalId = item.personal_id || 'SIN_ID';
      const nombre = item.personal?.nombre_completo || 'SIN NOMBRE';
      const cargoNombre = item.cargo?.nombre || 'SIN CARGO';
      const horas = parseFloat(item.horas_trabajadas) || 0;
      const reporteId = item.reporte_id;

      if (!personalMap.has(personalId)) {
        personalMap.set(personalId, {
          nombre,
          cargoNombre,
          horas: 0,
          reportes: new Set()
        });
      }
      const current = personalMap.get(personalId)!;
      current.horas += horas;
      current.reportes.add(reporteId);
      totalHorasPersonal += horas;
    });

    const personalStats = Array.from(personalMap.entries())
      .map(([personalId, data]) => ({
        personalId,
        nombre: data.nombre,
        cargoNombre: data.cargoNombre,
        totalHoras: parseFloat(data.horas.toFixed(2)),
        reportesCount: data.reportes.size,
        porcentaje: totalHorasPersonal > 0
          ? parseFloat(((data.horas / totalHorasPersonal) * 100).toFixed(2))
          : 0
      }))
      .sort((a, b) => b.totalHoras - a.totalHoras);

    const personalMasActivo = personalStats.length > 0
      ? personalStats[0].nombre
      : 'N/A';

    // ========== RETORNAR ESTADÍSTICAS COMPLETAS ==========
    return {
      rangoFechas: {
        inicio: fechaInicio?.toISOString().split('T')[0] || '',
        fin: fechaFin?.toISOString().split('T')[0] || ''
      },
      totalReportes,
      totalViajes: totalViajesAcarreo + totalViajesAgua,
      acarreo: {
        materiales: acarreoMateriales,
        totalVolumen: parseFloat(totalVolumenAcarreo.toFixed(2)),
        totalViajes: totalViajesAcarreo,
        materialMasMovido
      },
      material: {
        materiales,
        materialMasUtilizado
      },
      agua: {
        porOrigen: aguaPorOrigen,
        volumenTotal: parseFloat(totalVolumenAgua.toFixed(2)),
        totalViajes: totalViajesAgua,
        origenMasUtilizado
      },
      vehiculos: {
        vehiculos,
        totalHoras: parseFloat(totalHorasVehiculos.toFixed(2)),
        vehiculoMasUtilizado
      },
      personal: {
        personal: personalStats,
        totalHoras: parseFloat(totalHorasPersonal.toFixed(2)),
        personalMasActivo,
        totalPersonal: personalStats.length
      }
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

  private async getPersonalAsignado(reporteId: string): Promise<ReportePersonal[]> {
    const { data, error } = await supabaseAdmin
      .from('reporte_personal')
      .select('*')
      .eq('reporte_id', reporteId);

    if (error) {
      console.error('Error obteniendo personal asignado:', error);
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

  private async insertPersonalAsignado(reporteId: string, items: any[]): Promise<void> {
    const inserts = items.map(item => ({
      reporte_id: reporteId,
      ...item
    }));

    const { error } = await supabaseAdmin
      .from('reporte_personal')
      .insert(inserts);

    if (error) {
      throw new Error(`Error insertando personal asignado: ${error.message}`);
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

  private async replacePersonalAsignado(reporteId: string, items: any[]): Promise<void> {
    await supabaseAdmin.from('reporte_personal').delete().eq('reporte_id', reporteId);
    if (items.length > 0) {
      await this.insertPersonalAsignado(reporteId, items);
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
