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

router.get('/estadisticas', async (req: AuthRequest, res) => {
  try {
    const { proyectoIds, fechaInicio, fechaFin } = req.query;

    console.log('📊 Obteniendo estadísticas:', { proyectoIds, fechaInicio, fechaFin });

    // Construir query
    const query: any = {};

    if (proyectoIds && proyectoIds !== 'todos') {
      const idsArray = typeof proyectoIds === 'string' ? proyectoIds.split(',') : proyectoIds;
      query.proyectoId = { $in: idsArray };
    }

    if (fechaInicio && fechaFin) {
      query.fecha = {
        $gte: new Date(fechaInicio as string),
        $lte: new Date(fechaFin as string)
      };
    }

    // Obtener reportes del rango
    const reportes = await ReporteActividades.find(query);
    console.log(`✅ ${reportes.length} reportes encontrados para estadísticas`);

    // === ESTADÍSTICAS DE ACARREO ===
    const materialesAcarreo = new Map<string, number>();
    reportes.forEach(reporte => {
      reporte.controlAcarreo?.forEach(item => {
        const volumen = parseFloat(item.volSuelto) || 0;
        const actual = materialesAcarreo.get(item.material) || 0;
        materialesAcarreo.set(item.material, actual + volumen);
      });
    });

    const totalVolumenAcarreo = Array.from(materialesAcarreo.values()).reduce((sum, vol) => sum + vol, 0);
    const acarreoArray = Array.from(materialesAcarreo.entries())
      .map(([nombre, volumen]) => ({
        nombre,
        volumen: parseFloat(volumen.toFixed(2)),
        porcentaje: totalVolumenAcarreo > 0 ? parseFloat(((volumen / totalVolumenAcarreo) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.volumen - a.volumen);

    // === ESTADÍSTICAS DE MATERIAL ===
    const materialesControl = new Map<string, { cantidad: number; unidad: string }>();
    reportes.forEach(reporte => {
      reporte.controlMaterial?.forEach(item => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const actual = materialesControl.get(item.material);
        if (actual) {
          actual.cantidad += cantidad;
        } else {
          materialesControl.set(item.material, { cantidad, unidad: item.unidad });
        }
      });
    });

    const materialArray = Array.from(materialesControl.entries())
      .map(([nombre, data]) => ({
        nombre,
        cantidad: parseFloat(data.cantidad.toFixed(2)),
        unidad: data.unidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // === ESTADÍSTICAS DE AGUA ===
    const aguaPorOrigen = new Map<string, number>();
    let totalVolumenAgua = 0;
    reportes.forEach(reporte => {
      reporte.controlAgua?.forEach(item => {
        const volumen = parseFloat(item.volumen) || 0;
        totalVolumenAgua += volumen;
        const actual = aguaPorOrigen.get(item.origen) || 0;
        aguaPorOrigen.set(item.origen, actual + volumen);
      });
    });

    const aguaArray = Array.from(aguaPorOrigen.entries())
      .map(([origen, volumen]) => ({
        origen,
        volumen: parseFloat(volumen.toFixed(2)),
        porcentaje: totalVolumenAgua > 0 ? parseFloat(((volumen / totalVolumenAgua) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.volumen - a.volumen);

    // === ESTADÍSTICAS DE VEHÍCULOS ===
    const vehiculosMap = new Map<string, { nombre: string; noEconomico: string; horas: number }>();
    reportes.forEach(reporte => {
      reporte.controlMaquinaria?.forEach(item => {
        const horas = item.horasOperacion || 0;
        const key = item.tipo + '_' + (item.vehiculoId || 'sin_id'); // Usar tipo + vehiculoId como clave
        const actual = vehiculosMap.get(key);
        if (actual) {
          actual.horas += horas;
        } else {
          vehiculosMap.set(key, {
            nombre: item.tipo,
            noEconomico: item.tipo, // Usar tipo como identificador
            horas
          });
        }
      });
    });

    const totalHoras = Array.from(vehiculosMap.values()).reduce((sum, v) => sum + v.horas, 0);
    const vehiculosArray = Array.from(vehiculosMap.values())
      .map(v => ({
        nombre: v.nombre,
        noEconomico: v.noEconomico,
        horasOperacion: parseFloat(v.horas.toFixed(2)),
        porcentaje: totalHoras > 0 ? parseFloat(((v.horas / totalHoras) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.horasOperacion - a.horasOperacion);

    // Respuesta
    const estadisticas = {
      rangoFechas: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      totalReportes: reportes.length,
      acarreo: {
        materiales: acarreoArray,
        totalVolumen: parseFloat(totalVolumenAcarreo.toFixed(2)),
        materialMasMovido: acarreoArray[0]?.nombre || 'N/A'
      },
      material: {
        materiales: materialArray,
        materialMasUtilizado: materialArray[0]?.nombre || 'N/A'
      },
      agua: {
        porOrigen: aguaArray,
        volumenTotal: parseFloat(totalVolumenAgua.toFixed(2)),
        origenMasUtilizado: aguaArray[0]?.origen || 'N/A'
      },
      vehiculos: {
        vehiculos: vehiculosArray,
        totalHoras: parseFloat(totalHoras.toFixed(2)),
        vehiculoMasUtilizado: vehiculosArray[0]?.noEconomico || 'N/A'
      }
    };

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





export { router as reporteRouter };