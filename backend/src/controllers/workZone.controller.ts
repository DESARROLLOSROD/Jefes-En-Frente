import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase.js';
import { CreateWorkZoneDTO, UpdateWorkZoneDTO, CreateSectionDTO, UpdateSectionDTO } from '../types/workZone.types.js';

// Formatear zona para el frontend
const formatZoneForFrontend = (zone: any) => ({
  _id: zone.id,
  id: zone.id,
  projectId: zone.project_id,
  name: zone.name,
  description: zone.description,
  sections: zone.sections || [],
  status: zone.status,
  createdAt: zone.created_at,
  updatedAt: zone.updated_at
});

// Obtener todas las zonas de un proyecto
export const getZonesByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener zonas:', error);
      return res.status(500).json({
        success: false,
        message: `Error al obtener zonas: ${error.message}`
      });
    }

    res.json({
      success: true,
      data: (data || []).map(formatZoneForFrontend)
    });
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zonas de trabajo'
    });
  }
};

// Obtener una zona especifica
export const getZoneById = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .select('*')
      .eq('id', zoneId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Zona de trabajo no encontrada'
        });
      }
      console.error('Error al obtener zona:', error);
      return res.status(500).json({
        success: false,
        message: `Error al obtener zona: ${error.message}`
      });
    }

    res.json({
      success: true,
      data: formatZoneForFrontend(data)
    });
  } catch (error) {
    console.error('Error al obtener zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zona de trabajo'
    });
  }
};

// Crear nueva zona
export const createZone = async (req: Request, res: Response) => {
  try {
    const { projectId, name, description, sections, status } = req.body as CreateWorkZoneDTO;

    if (!projectId || !name) {
      return res.status(400).json({
        success: false,
        message: 'projectId y name son requeridos'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .insert({
        project_id: projectId,
        name,
        description: description || '',
        sections: sections || [],
        status: status || 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear zona:', error);
      return res.status(500).json({
        success: false,
        message: `Error al crear zona: ${error.message}`
      });
    }

    res.status(201).json({
      success: true,
      data: formatZoneForFrontend(data)
    });
  } catch (error) {
    console.error('Error al crear zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear zona de trabajo'
    });
  }
};

// Actualizar zona
export const updateZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const updates: UpdateWorkZoneDTO = req.body;

    // Construir objeto de actualizacion
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.sections !== undefined) updateData.sections = updates.sections;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .update(updateData)
      .eq('id', zoneId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Zona de trabajo no encontrada'
        });
      }
      console.error('Error al actualizar zona:', error);
      return res.status(500).json({
        success: false,
        message: `Error al actualizar zona: ${error.message}`
      });
    }

    res.json({
      success: true,
      data: formatZoneForFrontend(data)
    });
  } catch (error) {
    console.error('Error al actualizar zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar zona de trabajo'
    });
  }
};

// Eliminar zona
export const deleteZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;

    const { error } = await supabaseAdmin
      .from('work_zones')
      .delete()
      .eq('id', zoneId);

    if (error) {
      console.error('Error al eliminar zona:', error);
      return res.status(500).json({
        success: false,
        message: `Error al eliminar zona: ${error.message}`
      });
    }

    res.json({
      success: true,
      message: 'Zona eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar zona de trabajo'
    });
  }
};

// Agregar seccion a zona
export const addSection = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { name, description } = req.body as CreateSectionDTO;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name es requerido'
      });
    }

    // Obtener zona actual
    const { data: zone, error: fetchError } = await supabaseAdmin
      .from('work_zones')
      .select('sections')
      .eq('id', zoneId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Zona de trabajo no encontrada'
        });
      }
      throw fetchError;
    }

    // Agregar nueva seccion
    const newSection = {
      id: uuidv4(),
      name,
      description: description || '',
      status: 'active'
    };

    const updatedSections = [...(zone.sections || []), newSection];

    // Actualizar zona
    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .update({ sections: updatedSections })
      .eq('id', zoneId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: formatZoneForFrontend(data)
    });
  } catch (error) {
    console.error('Error al agregar seccion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar seccion'
    });
  }
};

// Actualizar seccion
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { zoneId, sectionId } = req.params;
    const updates: UpdateSectionDTO = req.body;

    // Obtener zona actual
    const { data: zone, error: fetchError } = await supabaseAdmin
      .from('work_zones')
      .select('sections')
      .eq('id', zoneId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Zona de trabajo no encontrada'
        });
      }
      throw fetchError;
    }

    // Encontrar y actualizar seccion
    const sections = zone.sections || [];
    const sectionIndex = sections.findIndex((s: any) => s.id === sectionId);

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Seccion no encontrada'
      });
    }

    sections[sectionIndex] = {
      ...sections[sectionIndex],
      ...updates
    };

    // Actualizar zona
    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .update({ sections })
      .eq('id', zoneId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: formatZoneForFrontend(data)
    });
  } catch (error) {
    console.error('Error al actualizar seccion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar seccion'
    });
  }
};

// Eliminar seccion
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { zoneId, sectionId } = req.params;

    // Obtener zona actual
    const { data: zone, error: fetchError } = await supabaseAdmin
      .from('work_zones')
      .select('sections')
      .eq('id', zoneId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Zona de trabajo no encontrada'
        });
      }
      throw fetchError;
    }

    // Filtrar secciones
    const sections = (zone.sections || []).filter((s: any) => s.id !== sectionId);

    // Actualizar zona
    const { data, error } = await supabaseAdmin
      .from('work_zones')
      .update({ sections })
      .eq('id', zoneId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: formatZoneForFrontend(data)
    });
  } catch (error) {
    console.error('Error al eliminar seccion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar seccion'
    });
  }
};
