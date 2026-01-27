import { supabaseAdmin } from '../config/supabase.js';
import type {
  Vehiculo,
  VehiculoConProyectos,
  CreateVehiculoInput,
  UpdateVehiculoInput,
  Proyecto
} from '../types/database.types.js';

/**
 * Servicio para operaciones de Vehículos en Supabase
 */
export class VehiculosService {
  /**
   * Formatear vehículo para compatibilidad con frontend antiguo (MongoDB style)
   */
  private formatForFrontend(v: any): any {
    if (!v) return null;
    return {
      ...v,
      _id: v.id,
      noEconomico: v.no_economico,
      horometroInicial: v.horometro_inicial,
      horometroLlegada: v.horometro_llegada,
      horometroFinal: v.horometro_final,
      horasOperacion: v.horas_operacion,
      fechaCreacion: v.fecha_creacion,
      // Formatear proyectos si están presentes
      proyectos: v.proyectos ? v.proyectos.map((p: any) => ({
        ...p,
        _id: p.id,
        fechaCreacion: p.fecha_creacion
      })) : undefined
    };
  }

  /**
   * Obtener todos los vehículos con sus proyectos
   */
  async getVehiculos(activo?: boolean): Promise<VehiculoConProyectos[]> {
    let query = supabaseAdmin
      .from('vehiculos')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (activo !== undefined) {
      query = query.eq('activo', activo);
    }

    const { data: vehiculos, error } = await query;

    if (error) {
      console.error('Error obteniendo vehículos:', error);
      throw new Error(`Error obteniendo vehículos: ${error.message}`);
    }

    // Obtener proyectos para cada vehículo
    const vehiculosConProyectos = await Promise.all(
      (vehiculos || []).map(async (vehiculo) => {
        const proyectos = await this.getProyectosDeVehiculo(vehiculo.id);
        return {
          ...vehiculo,
          proyectos
        };
      })
    );

    return vehiculosConProyectos.map(v => this.formatForFrontend(v));
  }

  /**
   * Obtener vehículos de un proyecto específico
   */
  async getVehiculosByProyecto(proyectoId: string): Promise<Vehiculo[]> {
    const { data, error } = await supabaseAdmin
      .from('vehiculo_proyectos')
      .select(`
        vehiculos (
          id,
          nombre,
          tipo,
          no_economico,
          horometro_inicial,
          horometro_final,
          horas_operacion,
          capacidad,
          activo,
          fecha_creacion
        )
      `)
      .eq('proyecto_id', proyectoId);

    if (error) {
      console.error('Error obteniendo vehículos del proyecto:', error);
      throw new Error(`Error obteniendo vehículos del proyecto: ${error.message}`);
    }

    return data?.map((item: any) => this.formatForFrontend(item.vehiculos)).filter(Boolean) || [];
  }

  /**
   * Obtener un vehículo por ID
   */
  async getVehiculoById(id: string): Promise<VehiculoConProyectos | null> {
    const { data, error } = await supabaseAdmin
      .from('vehiculos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo vehículo:', error);
      throw new Error(`Error obteniendo vehículo: ${error.message}`);
    }

    const proyectos = await this.getProyectosDeVehiculo(id);

    return this.formatForFrontend({
      ...data,
      proyectos
    });
  }

  /**
   * Obtener vehículo por número económico
   */
  async getVehiculoByNoEconomico(noEconomico: string): Promise<Vehiculo | null> {
    const { data, error } = await supabaseAdmin
      .from('vehiculos')
      .select('*')
      .eq('no_economico', noEconomico)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo vehículo:', error);
      throw new Error(`Error obteniendo vehículo: ${error.message}`);
    }

    return this.formatForFrontend(data);
  }

  /**
   * Crear un nuevo vehículo
   */
  async createVehiculo(input: CreateVehiculoInput): Promise<Vehiculo> {
    const { proyectos, ...vehiculoData } = input;

    // Calcular horas_operacion si no se proporciona
    const horasOperacion = vehiculoData.horas_operacion ??
      (vehiculoData.horometro_final && vehiculoData.horometro_inicial
        ? vehiculoData.horometro_final - vehiculoData.horometro_inicial
        : 0);

    // Crear vehículo
    const { data: vehiculo, error } = await supabaseAdmin
      .from('vehiculos')
      .insert({
        ...vehiculoData,
        horas_operacion: horasOperacion,
        activo: vehiculoData.activo ?? true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando vehículo:', error);
      throw new Error(`Error creando vehículo: ${error.message}`);
    }

    // Asignar proyectos si se proporcionaron
    if (proyectos && proyectos.length > 0) {
      await this.setProyectosForVehiculo(vehiculo.id, proyectos);
    }

    return vehiculo;
  }

  /**
   * Actualizar un vehículo existente
   */
  async updateVehiculo(id: string, input: UpdateVehiculoInput): Promise<Vehiculo> {
    const { proyectos, ...vehiculoData } = input;

    // Actualizar vehículo
    const { data: vehiculo, error } = await supabaseAdmin
      .from('vehiculos')
      .update(vehiculoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando vehículo:', error);
      throw new Error(`Error actualizando vehículo: ${error.message}`);
    }

    // Actualizar proyectos si se proporcionaron
    if (proyectos !== undefined) {
      await this.setProyectosForVehiculo(id, proyectos);
    }

    return vehiculo;
  }

  /**
   * Actualizar horómetros de un vehículo
   */
  async updateHorometros(
    vehiculoId: string,
    horometroInicial?: number,
    horometroFinal?: number
  ): Promise<void> {
    const updates: any = {};

    if (horometroInicial !== undefined) {
      updates.horometro_inicial = horometroInicial;
    }

    if (horometroFinal !== undefined) {
      updates.horometro_final = horometroFinal;
    }

    // Calcular horas de operación si ambos están disponibles
    if (horometroFinal !== undefined && horometroInicial !== undefined) {
      updates.horas_operacion = horometroFinal - horometroInicial;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    const { error } = await supabaseAdmin
      .from('vehiculos')
      .update(updates)
      .eq('id', vehiculoId);

    if (error) {
      console.error('Error actualizando horómetros:', error);
      throw new Error(`Error actualizando horómetros: ${error.message}`);
    }
  }

  /**
   * Soft delete de un vehículo
   */
  async deleteVehiculo(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('vehiculos')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      console.error('Error eliminando vehículo:', error);
      throw new Error(`Error eliminando vehículo: ${error.message}`);
    }
  }

  /**
   * Hard delete de un vehículo
   */
  async hardDeleteVehiculo(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('vehiculos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando vehículo permanentemente:', error);
      throw new Error(`Error eliminando vehículo permanentemente: ${error.message}`);
    }
  }

  /**
   * Obtener proyectos de un vehículo
   */
  private async getProyectosDeVehiculo(vehiculoId: string): Promise<Proyecto[]> {
    const { data, error } = await supabaseAdmin
      .from('vehiculo_proyectos')
      .select(`
        proyectos (
          id,
          nombre,
          ubicacion,
          descripcion,
          activo,
          fecha_creacion
        )
      `)
      .eq('vehiculo_id', vehiculoId);

    if (error) {
      console.error('Error obteniendo proyectos del vehículo:', error);
      return [];
    }

    return data?.map((item: any) => item.proyectos).filter(Boolean) || [];
  }

  /**
   * Asignar proyectos a un vehículo (reemplaza asignaciones existentes)
   */
  async setProyectosForVehiculo(vehiculoId: string, proyectoIds: string[]): Promise<void> {
    // Eliminar asignaciones existentes
    await supabaseAdmin
      .from('vehiculo_proyectos')
      .delete()
      .eq('vehiculo_id', vehiculoId);

    // Insertar nuevas asignaciones
    if (proyectoIds.length > 0) {
      const inserts = proyectoIds.map(proyectoId => ({
        vehiculo_id: vehiculoId,
        proyecto_id: proyectoId
      }));

      const { error } = await supabaseAdmin
        .from('vehiculo_proyectos')
        .insert(inserts);

      if (error) {
        console.error('Error asignando proyectos al vehículo:', error);
        throw new Error(`Error asignando proyectos al vehículo: ${error.message}`);
      }
    }
  }

  /**
   * Alias para setProyectosForVehiculo (para compatibilidad con routes)
   */
  async assignProyectosToVehiculo(vehiculoId: string, proyectoIds: string[]): Promise<void> {
    return this.setProyectosForVehiculo(vehiculoId, proyectoIds);
  }
}

// Exportar instancia singleton
export const vehiculosService = new VehiculosService();
