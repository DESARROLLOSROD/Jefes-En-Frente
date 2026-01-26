import express from 'express';
import { reportesService } from '../services/reportes.service.js';
import { usuariosService } from '../services/usuarios.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken, verificarAdminOSupervisor } from './auth.js';
import type { AuthRequest } from './auth.js';

const router = express.Router();

// TODAS las rutas requieren autenticación
router.use(verificarToken);

// Funciones para transformar camelCase a snake_case

// Transformar control de acarreo
const transformControlAcarreo = (items: any[]) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => ({
    material: item.material,
    no_viaje: item.noViaje,
    capacidad: item.capacidad,
    vol_suelto: item.volSuelto,
    capa_no: item.capaNo,
    elevacion_ariza: item.elevacionAriza,
    capa_origen: item.capaOrigen,
    destino: item.destino
  }));
};

// Transformar control de material
const transformControlMaterial = (items: any[]) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => ({
    material: item.material,
    unidad: item.unidad,
    cantidad: item.cantidad,
    zona: item.zona,
    elevacion: item.elevacion
  }));
};

// Transformar control de agua
const transformControlAgua = (items: any[]) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => ({
    no_economico: item.noEconomico,
    viaje: item.viaje,
    capacidad: item.capacidad,
    volumen: item.volumen,
    origen: item.origen,
    destino: item.destino
  }));
};

// Transformar control de maquinaria
const transformControlMaquinaria = (items: any[]) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => ({
    tipo: item.tipo,
    modelo: item.modelo,
    numero_economico: item.numeroEconomico,
    horas_operacion: item.horasOperacion,
    operador: item.operador,
    actividad: item.actividad,
    vehiculo_id: item.vehiculoId,
    horometro_inicial: item.horometroInicial,
    horometro_final: item.horometroFinal
  }));
};

// Transformar pines de mapa
const transformPinesMapa = (items: any[]) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => ({
    pin_id: item.id,
    pin_x: item.pinX,
    pin_y: item.pinY,
    etiqueta: item.etiqueta,
    color: item.color
  }));
};

// Transformar personal asignado
const transformPersonalAsignado = (items: any[]) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => ({
    personal_id: item.personalId,
    cargo_id: item.cargoId,
    actividad_realizada: item.actividadRealizada,
    horas_trabajadas: item.horasTrabajadas,
    observaciones: item.observaciones
  }));
};

const transformToSnakeCase = (data: any) => {
  const mapping: Record<string, string> = {
    proyectoId: 'proyecto_id',
    usuarioId: 'usuario_id',
    creadoPor: 'creado_por',
    jefeFrente: 'jefe_frente',
    inicioActividades: 'inicio_actividades',
    terminoActividades: 'termino_actividades',
    offlineId: 'offline_id',
    zonaTrabajo: 'zona_trabajo',
    seccionTrabajo: 'seccion_trabajo',
    ubicacionMapa: 'ubicacion_mapa'
  };

  const transformed: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Transformar arrays anidados
    if (key === 'controlAcarreo') {
      transformed.controlAcarreo = transformControlAcarreo(value as any[]);
      continue;
    }
    if (key === 'controlMaterial') {
      transformed.controlMaterial = transformControlMaterial(value as any[]);
      continue;
    }
    if (key === 'controlAgua') {
      transformed.controlAgua = transformControlAgua(value as any[]);
      continue;
    }
    if (key === 'controlMaquinaria') {
      transformed.controlMaquinaria = transformControlMaquinaria(value as any[]);
      continue;
    }
    if (key === 'pinesMapa') {
      transformed.pinesMapa = transformPinesMapa(value as any[]);
      continue;
    }
    if (key === 'personalAsignado') {
      transformed.personalAsignado = transformPersonalAsignado(value as any[]);
      continue;
    }

    // Pasar sin transformar arrays de anotaciones (ya tienen formato correcto)
    if (['textosAnotacion', 'dibujosLibres', 'formasMapa', 'medidasMapa'].includes(key)) {
      transformed[key] = value;
      continue;
    }

    // Manejar zonaTrabajo
    if (key === 'zonaTrabajo' && value && typeof value === 'object') {
      const zona = value as { zonaId?: string; zonaNombre?: string };
      transformed.zona_id = zona.zonaId;
      transformed.zona_nombre = zona.zonaNombre;
      continue;
    }

    // Manejar seccionTrabajo
    if (key === 'seccionTrabajo' && value && typeof value === 'object') {
      const seccion = value as { seccionId?: string; seccionNombre?: string };
      transformed.seccion_id = seccion.seccionId;
      transformed.seccion_nombre = seccion.seccionNombre;
      continue;
    }

    // Manejar ubicacionMapa
    if (key === 'ubicacionMapa' && value && typeof value === 'object') {
      const ubicacion = value as { pinX?: number; pinY?: number; colocado?: boolean };
      transformed.ubicacion_mapa_pin_x = ubicacion.pinX;
      transformed.ubicacion_mapa_pin_y = ubicacion.pinY;
      transformed.ubicacion_mapa_colocado = ubicacion.colocado ?? false;
      continue;
    }

    // Usar mapping si existe, o mantener el nombre original
    const newKey = mapping[key] || key;
    transformed[newKey] = value;
  }

  return transformed;
};

// Crear nuevo reporte
router.post('/', async (req: AuthRequest, res) => {
  try {
    // Transformar datos de camelCase a snake_case
    const transformedData = transformToSnakeCase(req.body);

    const reporteData = {
      ...transformedData,
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
      if (typeof proyectoIds === 'string') {
        proyectoIdsArray = proyectoIds.split(',');
      } else if (Array.isArray(proyectoIds)) {
        proyectoIdsArray = proyectoIds.map(String);
      }
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

    // Transformar datos de camelCase a snake_case
    const transformedData = transformToSnakeCase(req.body);

    // Preparar datos de actualización
    const updateData = {
      ...transformedData,
      usuario_modificacion_id: req.user!.userId,
      usuario_modificacion_nombre: usuario.nombre,
      observacion_modificacion: req.body.observacionModificacion
    };

    // El servicio maneja la detección de cambios, historial y actualización de horómetros
    const reporteActualizado = await reportesService.updateReporte(
      req.params.id,
      updateData as any
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
