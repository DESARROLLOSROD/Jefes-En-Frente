import express from 'express';
import { personalService, cargosService } from '../services/personal.service.js';
import type { ApiResponse } from '../types/database.types.js';
import { verificarToken, verificarAdmin, verificarAdminOSupervisor } from './auth.js';
import type { AuthRequest } from './auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// ========== CARGOS (IMPORTANTE: Definir antes de /:id para evitar conflictos) ==========

// GET /api/personal/cargos - Listar todos los cargos
router.get('/cargos', async (req: AuthRequest, res) => {
  try {
    const cargos = await cargosService.getCargos(true);

    const response: ApiResponse<any[]> = {
      success: true,
      data: cargos
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /cargos:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener cargos'
    };
    res.status(500).json(response);
  }
});

// POST /api/personal/cargos - Crear nuevo cargo (solo admin y supervisor)
router.post('/cargos', verificarAdminOSupervisor, async (req: AuthRequest, res) => {
  try {
    const cargo = await cargosService.createCargo(req.body);

    const response: ApiResponse<any> = {
      success: true,
      data: cargo,
      message: 'Cargo creado exitosamente'
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error en POST /cargos:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || 'Error al crear cargo'
    };
    res.status(500).json(response);
  }
});

// PUT /api/personal/cargos/:id - Actualizar cargo (solo admin)
router.put('/cargos/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const cargo = await cargosService.updateCargo(req.params.id, req.body);

    const response: ApiResponse<any> = {
      success: true,
      data: cargo,
      message: 'Cargo actualizado exitosamente'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /cargos/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || 'Error al actualizar cargo'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/personal/cargos/:id - Eliminar cargo (solo admin)
router.delete('/cargos/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await cargosService.deleteCargo(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Cargo eliminado exitosamente'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /cargos/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar cargo'
    };
    res.status(500).json(response);
  }
});

// ========== PERSONAL ==========

// GET /api/personal - Listar todo el personal
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { cargo, proyecto } = req.query;

    let personal;
    if (cargo) {
      personal = await personalService.getPersonalByCargo(cargo as string);
    } else if (proyecto) {
      personal = await personalService.getPersonalByProyecto(proyecto as string);
    } else {
      personal = await personalService.getPersonal(true);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: personal
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /personal:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener personal'
    };
    res.status(500).json(response);
  }
});

// GET /api/personal/:id - Obtener un personal específico
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const personal = await personalService.getPersonalById(req.params.id);

    if (!personal) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Personal no encontrado'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: personal
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /personal/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener personal'
    };
    res.status(500).json(response);
  }
});

// POST /api/personal - Crear nuevo personal (solo admin y supervisor)
router.post('/', verificarAdminOSupervisor, async (req: AuthRequest, res) => {
  try {
    const personal = await personalService.createPersonal(req.body);

    const response: ApiResponse<any> = {
      success: true,
      data: personal,
      message: 'Personal creado exitosamente'
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error en POST /personal:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || 'Error al crear personal'
    };
    res.status(500).json(response);
  }
});

// PUT /api/personal/:id - Actualizar personal (solo admin y supervisor)
router.put('/:id', verificarAdminOSupervisor, async (req: AuthRequest, res) => {
  try {
    const personal = await personalService.updatePersonal(req.params.id, req.body);

    const response: ApiResponse<any> = {
      success: true,
      data: personal,
      message: 'Personal actualizado exitosamente'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /personal/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || 'Error al actualizar personal'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/personal/:id - Eliminar personal (soft delete, solo admin)
router.delete('/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await personalService.deletePersonal(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Personal eliminado exitosamente'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /personal/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar personal'
    };
    res.status(500).json(response);
  }
});

// PUT /api/personal/:id/proyectos - Asignar proyectos a personal (solo admin y supervisor)
router.put('/:id/proyectos', verificarAdminOSupervisor, async (req: AuthRequest, res) => {
  try {
    const { proyectos } = req.body;

    if (!Array.isArray(proyectos)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de IDs de proyectos'
      });
    }

    await personalService.asignarProyectos(req.params.id, proyectos);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Proyectos asignados exitosamente'
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /personal/:id/proyectos:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al asignar proyectos'
    };
    res.status(500).json(response);
  }
});

export default router;
