import express from 'express';
import {
  materialesService,
  origenesService,
  destinosService,
  capacidadesService,
  tiposVehiculoService
} from '../services/catalogos.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken, verificarAdmin, verificarAdminOSupervisor } from './auth.js';
import type { AuthRequest } from './auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// ========== MATERIALES ==========

// GET /api/materiales - Listar materiales activos
router.get('/materiales', async (req: AuthRequest, res) => {
  try {
    const materiales = await materialesService.getAll(true);
    const response: ApiResponse<any[]> = {
      success: true,
      data: materiales
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /materiales:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener materiales: ' + error.message
    };
    res.status(500).json(response);
  }
});

// POST /api/materiales - Crear material (solo admin)
router.post('/materiales', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const material = await materialesService.create(req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: material
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en POST /materiales:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al crear material: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// PUT /api/materiales/:id - Actualizar material (solo admin)
router.put('/materiales/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const material = await materialesService.update(req.params.id, req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: material
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /materiales/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al actualizar material: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// DELETE /api/materiales/:id - Eliminar material (solo admin)
router.delete('/materiales/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await materialesService.delete(req.params.id);
    const response: ApiResponse<null> = {
      success: true
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /materiales/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar material: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// ========== ORÍGENES ==========

// GET /api/origenes - Listar orígenes activos
router.get('/origenes', async (req: AuthRequest, res) => {
  try {
    const origenes = await origenesService.getAll(true);
    const response: ApiResponse<any[]> = {
      success: true,
      data: origenes
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /origenes:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener orígenes: ' + error.message
    };
    res.status(500).json(response);
  }
});

// POST /api/origenes - Crear origen (solo admin)
router.post('/origenes', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const origen = await origenesService.create(req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: origen
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en POST /origenes:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al crear origen: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// PUT /api/origenes/:id - Actualizar origen (solo admin)
router.put('/origenes/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const origen = await origenesService.update(req.params.id, req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: origen
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /origenes/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al actualizar origen: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// DELETE /api/origenes/:id - Eliminar origen (solo admin)
router.delete('/origenes/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await origenesService.delete(req.params.id);
    const response: ApiResponse<null> = {
      success: true
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /origenes/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar origen: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// ========== DESTINOS ==========

// GET /api/destinos - Listar destinos activos
router.get('/destinos', async (req: AuthRequest, res) => {
  try {
    const destinos = await destinosService.getAll(true);
    const response: ApiResponse<any[]> = {
      success: true,
      data: destinos
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /destinos:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener destinos: ' + error.message
    };
    res.status(500).json(response);
  }
});

// POST /api/destinos - Crear destino (solo admin)
router.post('/destinos', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const destino = await destinosService.create(req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: destino
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en POST /destinos:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al crear destino: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// PUT /api/destinos/:id - Actualizar destino (solo admin)
router.put('/destinos/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const destino = await destinosService.update(req.params.id, req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: destino
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /destinos/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al actualizar destino: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// DELETE /api/destinos/:id - Eliminar destino (solo admin)
router.delete('/destinos/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await destinosService.delete(req.params.id);
    const response: ApiResponse<null> = {
      success: true
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /destinos/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar destino: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// ========== CAPACIDADES ==========

// GET /api/capacidades - Listar capacidades activas
router.get('/capacidades', async (req: AuthRequest, res) => {
  try {
    const capacidades = await capacidadesService.getAll(true);
    const response: ApiResponse<any[]> = {
      success: true,
      data: capacidades
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /capacidades:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener capacidades: ' + error.message
    };
    res.status(500).json(response);
  }
});

// POST /api/capacidades - Crear capacidad (solo admin)
router.post('/capacidades', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const capacidad = await capacidadesService.create(req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: capacidad
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en POST /capacidades:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al crear capacidad: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// PUT /api/capacidades/:id - Actualizar capacidad (solo admin)
router.put('/capacidades/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const capacidad = await capacidadesService.update(req.params.id, req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: capacidad
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /capacidades/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al actualizar capacidad: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// DELETE /api/capacidades/:id - Eliminar capacidad (solo admin)
router.delete('/capacidades/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await capacidadesService.delete(req.params.id);
    const response: ApiResponse<null> = {
      success: true
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /capacidades/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar capacidad: ' + (error.message || error)
    };
    res.status(500).json(response);
  }
});

// ========== TIPOS DE VEHÍCULO ==========

// GET /api/tipos-vehiculo - Listar tipos de vehículo activos
router.get('/tipos-vehiculo', async (req: AuthRequest, res) => {
  try {
    const tipos = await tiposVehiculoService.getAll(true);
    const response: ApiResponse<any[]> = {
      success: true,
      data: tipos
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en GET /tipos-vehiculo:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al obtener tipos de vehículo: ' + error.message
    };
    res.status(500).json(response);
  }
});

// POST /api/tipos-vehiculo - Crear tipo de vehículo (solo admin)
router.post('/tipos-vehiculo', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const tipo = await tiposVehiculoService.create(req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: tipo
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en POST /tipos-vehiculo:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al crear tipo de vehículo'
    };
    res.status(500).json(response);
  }
});

// PUT /api/tipos-vehiculo/:id - Actualizar tipo de vehículo (solo admin)
router.put('/tipos-vehiculo/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    const tipo = await tiposVehiculoService.update(req.params.id, req.body);
    const response: ApiResponse<any> = {
      success: true,
      data: tipo
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en PUT /tipos-vehiculo/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al actualizar tipo de vehículo'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/tipos-vehiculo/:id - Eliminar tipo de vehículo (solo admin)
router.delete('/tipos-vehiculo/:id', verificarAdmin, async (req: AuthRequest, res) => {
  try {
    await tiposVehiculoService.delete(req.params.id);
    const response: ApiResponse<null> = {
      success: true
    };
    res.json(response);
  } catch (error: any) {
    console.error('Error en DELETE /tipos-vehiculo/:id:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Error al eliminar tipo de vehículo'
    };
    res.status(500).json(response);
  }
});

export default router;
