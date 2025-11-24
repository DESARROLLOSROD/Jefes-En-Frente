import express from 'express';
import ReporteActividades from '../models/ReporteActividades.js'; // Corregido: ../models/
import { ApiResponse } from '../types/reporte.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();


// TODAS las rutas requieren autenticación
router.use(authMiddleware);

// Crear nuevo reporte
router.post('/', async (req: AuthRequest, res) => {
  try {
    const reporteData = {
      ...req.body,
      usuarioId: req.user?.userId
    };

    const reporte = new ReporteActividades(reporteData);
    await reporte.save();
    
    const response: ApiResponse<typeof reporte> = { 
      success: true, 
      data: reporte 
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = { 
      success: false, 
      error: (error as Error).message 
    };
    res.status(400).json(response);
  }
});

// Obtener reportes del usuario
router.get('/', async (req: AuthRequest, res) => {
  try {
    const reportes = await ReporteActividades.find({ 
      usuarioId: req.user?.userId 
    }).sort({ fecha: -1 });
    
    const response: ApiResponse<typeof reportes> = { 
      success: true, 
      data: reportes 
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

// Obtener reporte por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const reporte = await ReporteActividades.findById(req.params.id);
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

export { router as reporteRouter };