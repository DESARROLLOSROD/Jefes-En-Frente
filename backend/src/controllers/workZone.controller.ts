import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import WorkZone from '../models/WorkZone.js';
import Proyecto from '../models/Proyecto.js';
import { CreateWorkZoneDTO, UpdateWorkZoneDTO, CreateSectionDTO, UpdateSectionDTO } from '../types/workZone.types.js';

// Obtener todas las zonas de un proyecto
export const getZonesByProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const zones = await WorkZone.find({ projectId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zonas de trabajo'
    });
  }
};

// Obtener una zona específica
export const getZoneById = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;

    const zone = await WorkZone.findById(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de trabajo no encontrada'
      });
    }

    res.json({
      success: true,
      data: zone
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
    const { projectId, name, description, sections }: CreateWorkZoneDTO = req.body;

    // Validar que el proyecto existe
    const project = await Proyecto.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Procesar secciones si existen
    const processedSections = sections?.map(section => ({
      id: uuidv4(),
      name: section.name,
      description: section.description,
      status: section.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })) || [];

    // Crear zona
    const newZone = new WorkZone({
      projectId,
      name,
      description,
      sections: processedSections,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newZone.save();

    res.status(201).json({
      success: true,
      data: newZone,
      message: 'Zona de trabajo creada exitosamente'
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
    const { name, description, status }: UpdateWorkZoneDTO = req.body;

    const zone = await WorkZone.findById(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de trabajo no encontrada'
      });
    }

    // Actualizar campos
    if (name !== undefined) zone.name = name;
    if (description !== undefined) zone.description = description;
    if (status !== undefined) zone.status = status;
    zone.updatedAt = new Date();

    await zone.save();

    res.json({
      success: true,
      data: zone,
      message: 'Zona de trabajo actualizada exitosamente'
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

    const zone = await WorkZone.findByIdAndDelete(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de trabajo no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Zona de trabajo eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar zona de trabajo'
    });
  }
};

// Agregar sección a zona
export const addSection = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const { name, description }: CreateSectionDTO = req.body;

    const zone = await WorkZone.findById(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de trabajo no encontrada'
      });
    }

    const newSection = {
      id: uuidv4(),
      name,
      description,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    zone.sections.push(newSection);
    zone.updatedAt = new Date();

    await zone.save();

    res.status(201).json({
      success: true,
      data: newSection,
      message: 'Sección agregada exitosamente'
    });
  } catch (error) {
    console.error('Error al agregar sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar sección'
    });
  }
};

// Actualizar sección
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { zoneId, sectionId } = req.params;
    const { name, description, status }: UpdateSectionDTO = req.body;

    const zone = await WorkZone.findById(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de trabajo no encontrada'
      });
    }

    const section = zone.sections.find(s => s.id === sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    // Actualizar campos
    if (name !== undefined) section.name = name;
    if (description !== undefined) section.description = description;
    if (status !== undefined) section.status = status;
    section.updatedAt = new Date();
    zone.updatedAt = new Date();

    await zone.save();

    res.json({
      success: true,
      data: section,
      message: 'Sección actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sección'
    });
  }
};

// Eliminar sección
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { zoneId, sectionId } = req.params;

    const zone = await WorkZone.findById(zoneId);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zona de trabajo no encontrada'
      });
    }

    const sectionIndex = zone.sections.findIndex(s => s.id === sectionId);

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      });
    }

    zone.sections.splice(sectionIndex, 1);
    zone.updatedAt = new Date();

    await zone.save();

    res.json({
      success: true,
      message: 'Sección eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sección'
    });
  }
};
