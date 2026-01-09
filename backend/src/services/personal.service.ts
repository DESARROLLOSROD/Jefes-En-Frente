import { supabaseAdmin } from '../config/supabase.js';
import type {
  Personal,
  PersonalConRelaciones,
  CatCargo,
  CreatePersonalInput,
  UpdatePersonalInput,
  Proyecto
} from '../types/database.types.js';

/**
 * Servicio para operaciones de Personal
 */
export class PersonalService {
  /**
   * Formatear para compatibilidad con frontend (MongoDB style)
   */
  private formatForFrontend(item: any): any {
    if (!item) return null;
    return {
      ...item,
      _id: item.id,
      fechaCreacion: item.fecha_creacion,
      fechaModificacion: item.fecha_modificacion,
      nombreCompleto: item.nombre_completo,
      cargoId: item.cargo_id,
      numeroEmpleado: item.numero_empleado,
      fechaIngreso: item.fecha_ingreso,
      fechaBaja: item.fecha_baja,
      fotoUrl: item.foto_url
    };
  }

  /**
   * Obtener todo el personal con sus relaciones (cargo y proyectos)
   */
  async getPersonal(activoOnly: boolean = true): Promise<PersonalConRelaciones[]> {
    let query = supabaseAdmin
      .from('personal')
      .select(`
        *,
        cargo:cat_cargos(*)
      `)
      .order('nombre_completo', { ascending: true });

    if (activoOnly) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo personal:', error);
      throw new Error(`Error obteniendo personal: ${error.message}`);
    }

    // Obtener proyectos para cada persona
    const personalConProyectos = await Promise.all(
      (data || []).map(async (persona) => {
        const proyectos = await this.getProyectosByPersonalId(persona.id);
        return {
          ...this.formatForFrontend(persona),
          cargo: persona.cargo,
          proyectos
        };
      })
    );

    return personalConProyectos as any;
  }

  /**
   * Obtener personal por ID con relaciones
   */
  async getPersonalById(id: string): Promise<PersonalConRelaciones | null> {
    const { data, error } = await supabaseAdmin
      .from('personal')
      .select(`
        *,
        cargo:cat_cargos(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo personal:', error);
      throw new Error(`Error obteniendo personal: ${error.message}`);
    }

    // Obtener proyectos
    const proyectos = await this.getProyectosByPersonalId(id);

    return {
      ...this.formatForFrontend(data),
      cargo: data.cargo,
      proyectos
    } as any;
  }

  /**
   * Obtener personal por cargo
   */
  async getPersonalByCargo(cargoId: string, activoOnly: boolean = true): Promise<PersonalConRelaciones[]> {
    let query = supabaseAdmin
      .from('personal')
      .select(`
        *,
        cargo:cat_cargos(*)
      `)
      .eq('cargo_id', cargoId)
      .order('nombre_completo', { ascending: true });

    if (activoOnly) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo personal por cargo:', error);
      throw new Error(`Error obteniendo personal por cargo: ${error.message}`);
    }

    // Obtener proyectos para cada persona
    const personalConProyectos = await Promise.all(
      (data || []).map(async (persona) => {
        const proyectos = await this.getProyectosByPersonalId(persona.id);
        return {
          ...this.formatForFrontend(persona),
          cargo: persona.cargo,
          proyectos
        };
      })
    );

    return personalConProyectos as any;
  }

  /**
   * Crear nuevo personal
   */
  async createPersonal(input: CreatePersonalInput): Promise<PersonalConRelaciones> {
    const { proyectos, ...personalData } = input;

    const { data, error } = await supabaseAdmin
      .from('personal')
      .insert({
        ...personalData,
        activo: personalData.activo ?? true
      })
      .select(`
        *,
        cargo:cat_cargos(*)
      `)
      .single();

    if (error) {
      console.error('Error creando personal:', error);
      throw new Error(`Error creando personal: ${error.message}`);
    }

    // Asignar proyectos si se proporcionaron
    if (proyectos && proyectos.length > 0) {
      await this.asignarProyectos(data.id, proyectos);
    }

    const proyectosAsignados = proyectos ? await this.getProyectosByPersonalId(data.id) : [];

    return {
      ...this.formatForFrontend(data),
      cargo: data.cargo,
      proyectos: proyectosAsignados
    } as any;
  }

  /**
   * Actualizar personal
   */
  async updatePersonal(id: string, input: UpdatePersonalInput): Promise<PersonalConRelaciones> {
    const { proyectos, ...personalData } = input;

    const { data, error } = await supabaseAdmin
      .from('personal')
      .update(personalData)
      .eq('id', id)
      .select(`
        *,
        cargo:cat_cargos(*)
      `)
      .single();

    if (error) {
      console.error('Error actualizando personal:', error);
      throw new Error(`Error actualizando personal: ${error.message}`);
    }

    // Actualizar proyectos si se proporcionaron
    if (proyectos !== undefined) {
      await this.asignarProyectos(id, proyectos);
    }

    const proyectosAsignados = await this.getProyectosByPersonalId(id);

    return {
      ...this.formatForFrontend(data),
      cargo: data.cargo,
      proyectos: proyectosAsignados
    } as any;
  }

  /**
   * Eliminar personal (soft delete)
   */
  async deletePersonal(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('personal')
      .update({ activo: false, fecha_baja: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error eliminando personal:', error);
      throw new Error(`Error eliminando personal: ${error.message}`);
    }
  }

  /**
   * Asignar proyectos a personal
   */
  async asignarProyectos(personalId: string, proyectoIds: string[]): Promise<void> {
    // Desactivar asignaciones previas
    await supabaseAdmin
      .from('personal_proyectos')
      .update({ activo: false, fecha_desasignacion: new Date().toISOString().split('T')[0] })
      .eq('personal_id', personalId)
      .eq('activo', true);

    // Crear nuevas asignaciones
    if (proyectoIds.length > 0) {
      const inserts = proyectoIds.map(proyectoId => ({
        personal_id: personalId,
        proyecto_id: proyectoId,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        activo: true
      }));

      const { error } = await supabaseAdmin
        .from('personal_proyectos')
        .insert(inserts);

      if (error) {
        console.error('Error asignando proyectos:', error);
        throw new Error(`Error asignando proyectos: ${error.message}`);
      }
    }
  }

  /**
   * Obtener proyectos asignados a un personal
   */
  private async getProyectosByPersonalId(personalId: string): Promise<Proyecto[]> {
    const { data, error } = await supabaseAdmin
      .from('personal_proyectos')
      .select(`
        proyectos (*)
      `)
      .eq('personal_id', personalId)
      .eq('activo', true);

    if (error) {
      console.error('Error obteniendo proyectos del personal:', error);
      return [];
    }

    return data?.map((item: any) => item.proyectos).filter(Boolean) || [];
  }

  /**
   * Obtener personal por proyecto
   */
  async getPersonalByProyecto(proyectoId: string, activoOnly: boolean = true): Promise<PersonalConRelaciones[]> {
    let query = supabaseAdmin
      .from('personal_proyectos')
      .select(`
        personal:personal!inner (
          *,
          cargo:cat_cargos(*)
        )
      `)
      .eq('proyecto_id', proyectoId)
      .eq('activo', true);

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo personal del proyecto:', error);
      throw new Error(`Error obteniendo personal del proyecto: ${error.message}`);
    }

    // Filtrar por activo si es necesario
    let personalList = data?.map((item: any) => item.personal).filter(Boolean) || [];

    if (activoOnly) {
      personalList = personalList.filter((p: any) => p.activo);
    }

    // Obtener proyectos para cada persona
    const personalConProyectos = await Promise.all(
      personalList.map(async (persona: any) => {
        const proyectos = await this.getProyectosByPersonalId(persona.id);
        return {
          ...this.formatForFrontend(persona),
          cargo: persona.cargo,
          proyectos
        };
      })
    );

    return personalConProyectos as any;
  }
}

/**
 * Servicio para catálogo de cargos
 */
export class CargosService {
  /**
   * Formatear para compatibilidad con frontend
   */
  private formatForFrontend(item: any): any {
    if (!item) return null;
    return {
      ...item,
      _id: item.id,
      fechaCreacion: item.fecha_creacion
    };
  }

  async getCargos(activoOnly: boolean = true): Promise<CatCargo[]> {
    let query = supabaseAdmin
      .from('cat_cargos')
      .select('*')
      .order('nombre', { ascending: true });

    if (activoOnly) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo cargos:', error);
      throw new Error(`Error obteniendo cargos: ${error.message}`);
    }

    return (data || []).map(item => this.formatForFrontend(item));
  }

  async getCargoById(id: string): Promise<CatCargo | null> {
    const { data, error } = await supabaseAdmin
      .from('cat_cargos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error obteniendo cargo:', error);
      throw new Error(`Error obteniendo cargo: ${error.message}`);
    }

    return this.formatForFrontend(data);
  }

  async createCargo(input: Omit<CatCargo, 'id' | 'fecha_creacion' | 'activo'> & { activo?: boolean }): Promise<CatCargo> {
    const { data, error } = await supabaseAdmin
      .from('cat_cargos')
      .insert({
        ...input,
        activo: input.activo ?? true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando cargo:', error);
      throw new Error(`Error creando cargo: ${error.message}`);
    }

    return this.formatForFrontend(data);
  }

  async updateCargo(id: string, input: Partial<Omit<CatCargo, 'id' | 'fecha_creacion'>>): Promise<CatCargo> {
    const { data, error } = await supabaseAdmin
      .from('cat_cargos')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando cargo:', error);
      throw new Error(`Error actualizando cargo: ${error.message}`);
    }

    return this.formatForFrontend(data);
  }

  async deleteCargo(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('cat_cargos')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      console.error('Error eliminando cargo:', error);
      throw new Error(`Error eliminando cargo: ${error.message}`);
    }
  }
}

// Exportar instancias singleton
export const personalService = new PersonalService();
export const cargosService = new CargosService();
