import express from 'express';
import { reportesService } from '../services/reportes.service.js';
import { usuariosService } from '../services/usuarios.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken, verificarAdminOSupervisor, AuthRequest } from './auth.js';

const router = express.Router();

// TODAS las rutas requieren autenticación
router.use(verificarToken);

// Crear nuevo reporte
router.post('/', async (req: AuthRequest, res) => {
  try {
    const reporteData = {
      ...req.body,
      usuario_id: req.user?.userId
    };

    console.log('📝 Creando reporte:', reporteData);

    // El servicio maneja la idempotencia y actualización de horómetros
    const reporte = await reportesService.createReporte(reporteData);
    console.log('✅ Reporte creado:', reporte.id);

    const response: ApiResponse<typeof reporte> = {
      success: true,
      data: reporte
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Error creando reporte:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(400).json(response);
  }
});

// Obtener reportes del proyecto
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { proyectoId, limit, offset } = req.query;

    console.log('📋 Obteniendo reportes. Proyecto:', proyectoId || 'TODOS');

    const filtros: any = {};
    if (proyectoId) {
      filtros.proyecto_id = proyectoId as string;
    }

    const reportes = await reportesService.getReportes(
      filtros,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );

    console.log(`✅ ${reportes.length} reportes encontrados`);

    const response: ApiResponse<typeof reportes> = {
      success: true,
      data: reportes
    };
    res.json(response);
  } catch (error) {
    console.error('❌ Error obteniendo reportes:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

// Obtener estadísticas (DEBE estar ANTES de la ruta /:id para evitar conflictos)
router.get('/estadisticas', async (req: AuthRequest, res) => {
  try {
    const { proyectoIds, fechaInicio, fechaFin } = req.query;

    console.log('📊 Obteniendo estadísticas:', { proyectoIds, fechaInicio, fechaFin });

    // Parse proyecto IDs
    let proyectoIdsArray: string[] | undefined;
    if (proyectoIds && proyectoIds !== 'todos') {
      proyectoIdsArray = typeof proyectoIds === 'string' ? proyectoIds.split(',') : Array.isArray(proyectoIds) ? proyectoIds : [];
    }

    const estadisticas = await reportesService.getEstadisticas(
      proyectoIdsArray,
      fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin ? new Date(fechaFin as string) : undefined
    );

    const response: ApiResponse<typeof estadisticas> = {
      success: true,
      data: estadisticas
    };
    res.json(response);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

// Obtener historial de modificaciones de un reporte (DEBE estar ANTES de /:id)
router.get('/:id/historial', async (req: AuthRequest, res) => {
  try {
    const historial = await reportesService.getHistorialModificaciones(req.params.id);

    const response: ApiResponse<typeof historial> = {
      success: true,
      data: historial
    };
    res.json(response);
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

// Obtener reporte por ID (DEBE estar DESPUÉS de rutas específicas como /estadisticas y /:id/historial)
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const reporte = await reportesService.getReporteById(req.params.id);
    if (!reporte) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Reporte no encontrado'
      };
      return res.status(404).json(response);
    }
    const response: ApiResponse<typeof reporte> = {
      success: true,
      data: reporte
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

// Actualizar reporte (Solo Admin/Supervisor)
router.put('/:id', verificarAdminOSupervisor, async (req: AuthRequest, res) => {
  try {
    // Obtener información del usuario que modifica
    const usuario = await usuariosService.getUsuarioById(req.user!.userId);
    if (!usuario) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Usuario no encontrado'
      };
      return res.status(404).json(response);
    }

    // Preparar datos de actualización
    const updateData = {
      ...req.body,
      usuario_modificacion_id: req.user!.userId,
      usuario_modificacion_nombre: usuario.nombre,
      observacion_modificacion: req.body.observacionModificacion
    };

    // El servicio maneja la detección de cambios, historial y actualización de horómetros
    const reporteActualizado = await reportesService.updateReporte(
      req.params.id,
      updateData
    );

    if (!reporteActualizado) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Reporte no encontrado'
      };
      return res.status(404).json(response);
    }

    console.log(`📝 Reporte ${req.params.id} modificado por ${usuario.nombre}`);

    const response: ApiResponse<typeof reporteActualizado> = {
      success: true,
      data: reporteActualizado
    };
    res.json(response);
  } catch (error) {
    console.error('❌ Error actualizando reporte:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

// Eliminar reporte (Solo Admin/Supervisor)
router.delete('/:id', verificarAdminOSupervisor, async (req: AuthRequest, res) => {
  try {
    await reportesService.deleteReporte(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      data: null
    };
    res.json(response);
  } catch (error) {
    console.error('❌ Error eliminando reporte:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

export { router as reporteRouter };
