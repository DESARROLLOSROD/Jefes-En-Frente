import { supabaseAdmin } from '../config/supabase.js';
import type {
  CatMaterial,
  CatOrigen,
  CatDestino,
  CatCapacidad,
  CatTipoVehiculo
} from '../types/database.types.js';

/**
 * Servicio genérico para operaciones CRUD en catálogos
 */
class CatalogoService<T extends { id: string; activo: boolean; fecha_creacion: string }> {
  constructor(private tableName: string) { }

  /**
   * Formatear para compatibilidad con frontend antiguo (MongoDB style)
   */
  private formatForFrontend(item: any): any {
    if (!item) return null;
    return {
      ...item,
      _id: item.id,
      fechaCreacion: item.fecha_creacion
    };
  }

  async getAll(activoOnly: boolean = true): Promise<T[]> {
    const orderCol = this.tableName === 'cat_capacidades' ? 'valor' : 'nombre';
    let query = supabaseAdmin
      .from(this.tableName)
      .select('*')
      .order(orderCol, { ascending: true });

    if (activoOnly) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error obteniendo ${this.tableName}:`, error);
      throw new Error(`DB_ERROR: ${error.message} (${error.code})`);
    }

    return (data || []).map(item => this.formatForFrontend(item));
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error(`Error obteniendo item de ${this.tableName}:`, error);
      throw new Error(`Error obteniendo item de ${this.tableName}: ${error.message}`);
    }

    return this.formatForFrontend(data);
  }

  async create(input: Omit<T, 'id' | 'fecha_creacion' | 'activo'> & { activo?: boolean }): Promise<T> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .insert({
        ...input,
        activo: input.activo ?? true
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creando item en ${this.tableName}:`, error);
      throw new Error(`Error creando item en ${this.tableName}: ${error.message}`);
    }

    return data;
  }

  async update(id: string, input: Partial<Omit<T, 'id' | 'fecha_creacion'>>): Promise<T> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error actualizando item en ${this.tableName}:`, error);
      throw new Error(`Error actualizando item en ${this.tableName}: ${error.message}`);
    }

    return data;
  }

  async delete(id: string, soft: boolean = true): Promise<void> {
    if (soft) {
      // Soft delete
      await this.update(id, { activo: false } as any);
    } else {
      // Hard delete
      const { error } = await supabaseAdmin
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error eliminando item de ${this.tableName}:`, error);
        throw new Error(`Error eliminando item de ${this.tableName}: ${error.message}`);
      }
    }
  }
}

/**
 * Servicio para catálogo de materiales
 */
export class MaterialesService extends CatalogoService<CatMaterial> {
  constructor() {
    super('cat_materiales');
  }

  async getByNombre(nombre: string): Promise<CatMaterial | null> {
    const { data, error } = await supabaseAdmin
      .from('cat_materiales')
      .select('*')
      .eq('nombre', nombre.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
}

/**
 * Servicio para catálogo de orígenes
 */
export class OrigenesService extends CatalogoService<CatOrigen> {
  constructor() {
    super('cat_origenes');
  }

  async getByNombre(nombre: string): Promise<CatOrigen | null> {
    const { data, error } = await supabaseAdmin
      .from('cat_origenes')
      .select('*')
      .eq('nombre', nombre.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
}

/**
 * Servicio para catálogo de destinos
 */
export class DestinosService extends CatalogoService<CatDestino> {
  constructor() {
    super('cat_destinos');
  }

  async getByNombre(nombre: string): Promise<CatDestino | null> {
    const { data, error } = await supabaseAdmin
      .from('cat_destinos')
      .select('*')
      .eq('nombre', nombre.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
}

/**
 * Servicio para catálogo de capacidades
 */
export class CapacidadesService extends CatalogoService<CatCapacidad> {
  constructor() {
    super('cat_capacidades');
  }

  async getByValor(valor: string): Promise<CatCapacidad | null> {
    const { data, error } = await supabaseAdmin
      .from('cat_capacidades')
      .select('*')
      .eq('valor', valor)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
}

/**
 * Servicio para catálogo de tipos de vehículo
 */
export class TiposVehiculoService extends CatalogoService<CatTipoVehiculo> {
  constructor() {
    super('cat_tipos_vehiculo');
  }

  async getByNombre(nombre: string): Promise<CatTipoVehiculo | null> {
    const { data, error } = await supabaseAdmin
      .from('cat_tipos_vehiculo')
      .select('*')
      .eq('nombre', nombre)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }
}

// Exportar instancias singleton
export const materialesService = new MaterialesService();
export const origenesService = new OrigenesService();
export const destinosService = new DestinosService();
export const capacidadesService = new CapacidadesService();
export const tiposVehiculoService = new TiposVehiculoService();
