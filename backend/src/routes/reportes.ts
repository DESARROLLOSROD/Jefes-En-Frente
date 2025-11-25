import express from 'express';
import ReporteActividades from '../models/ReporteActividades.js';
import Vehiculo from '../models/Vehiculo.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = express.Router();

// TODAS las rutas requieren autenticación
router.use(verificarToken);

// Crear nuevo reporte
router.post('/', async (req: AuthRequest, res) => {
  try {
    const reporteData = {
      ...req.body,
      usuarioId: req.userId
    };

    console.log('📝 Creando reporte:', reporteData);
    const reporte = new ReporteActividades(reporteData);
    await reporte.save();
    console.log('✅ Reporte creado:', reporte._id);

    // Actualizar horómetros de los vehículos usados
    if (reporteData.controlMaquinaria && Array.isArray(reporteData.controlMaquinaria)) {
      for (const maquinaria of reporteData.controlMaquinaria) {
        if (maquinaria.vehiculoId && maquinaria.horometroFinal) {
          try {
            await Vehiculo.findByIdAndUpdate(
              maquinaria.vehiculoId,
              {
                horometroInicial: maquinaria.horometroFinal,
                horometroFinal: maquinaria.horometroFinal
              }
            );
            console.log(`🔄 Horómetro actualizado para vehículo ${maquinaria.vehiculoId}: ${maquinaria.horometroFinal}`);
          } catch (error) {
            console.error(`⚠️ Error actualizando horómetro del vehículo ${maquinaria.vehiculoId}:`, error);
            // No fallar el reporte si falla la actualización del horómetro
          }
        }
      }
    }

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
    const { proyectoId } = req.query;

    console.log('📋 Obteniendo reportes para proyecto:', proyectoId);

    if (!proyectoId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'proyectoId es requerido'
      };
      return res.status(400).json(response);
    }

    const reportes = await ReporteActividades.find({
      proyectoId: proyectoId
    }).sort({ fecha: -1, fechaCreacion: -1 });

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

// Actualizar reporte
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const reporte = await ReporteActividades.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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
    console.error('❌ Error actualizando reporte:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: (error as Error).message
    };
    res.status(500).json(response);
  }
});

// Eliminar reporte
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const reporte = await ReporteActividades.findByIdAndDelete(req.params.id);

    if (!reporte) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Reporte no encontrado'
      };
      return res.status(404).json(response);
    }

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