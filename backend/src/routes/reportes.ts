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
                horometroFinal: maquinaria.horometroFinal,
                $inc: { horasOperacion: maquinaria.horasOperacion || 0 }
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

    console.log('📋 Obteniendo reportes. Proyecto:', proyectoId || 'TODOS');

    const query: any = {};
    if (proyectoId) {
      query.proyectoId = proyectoId;
    }

    const reportes = await ReporteActividades.find(query).sort({ fecha: -1, fechaCreacion: -1 });

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
    // 1. Obtener el reporte ANTES de la actualización
    const reporteAnterior = await ReporteActividades.findById(req.params.id);

    if (!reporteAnterior) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Reporte no encontrado'
      };
      return res.status(404).json(response);
    }

    // 2. Revertir las horas de los vehículos del reporte anterior
    if (reporteAnterior.controlMaquinaria && Array.isArray(reporteAnterior.controlMaquinaria)) {
      for (const maquinaria of reporteAnterior.controlMaquinaria) {
        if (maquinaria.vehiculoId && maquinaria.horasOperacion) {
          try {
            await Vehiculo.findByIdAndUpdate(
              maquinaria.vehiculoId,
              { $inc: { horasOperacion: -maquinaria.horasOperacion } }
            );
            console.log(`↩️ Horas revertidas para vehículo ${maquinaria.vehiculoId}: -${maquinaria.horasOperacion}`);
          } catch (error) {
            console.error(`⚠️ Error revirtiendo horas del vehículo ${maquinaria.vehiculoId}:`, error);
          }
        }
      }
    }

    // 3. Actualizar el reporte con los nuevos datos
    const reporteActualizado = await ReporteActividades.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // 4. Aplicar las nuevas horas de los vehículos
    if (reporteActualizado && reporteActualizado.controlMaquinaria && Array.isArray(reporteActualizado.controlMaquinaria)) {
      for (const maquinaria of reporteActualizado.controlMaquinaria) {
        if (maquinaria.vehiculoId && maquinaria.horasOperacion) {
          try {
            await Vehiculo.findByIdAndUpdate(
              maquinaria.vehiculoId,
              {
                horometroInicial: maquinaria.horometroFinal, // Actualizamos también los horómetros
                horometroFinal: maquinaria.horometroFinal,
                $inc: { horasOperacion: maquinaria.horasOperacion }
              }
            );
            console.log(`🔄 Horas aplicadas para vehículo ${maquinaria.vehiculoId}: +${maquinaria.horasOperacion}`);
          } catch (error) {
            console.error(`⚠️ Error aplicando horas del vehículo ${maquinaria.vehiculoId}:`, error);
          }
        }
      }
    }

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