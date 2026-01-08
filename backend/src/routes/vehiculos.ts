import express from 'express';
import { vehiculosService } from '../services/vehiculos.service.js';
import { verificarToken, verificarAdmin, verificarAdminOSupervisor } from './auth.js';
import { ApiResponse } from '../types/reporte.js';

export const vehiculosRouter = express.Router();

// Middleware de autenticación para todas las rutas
vehiculosRouter.use(verificarToken);

// Obtener todos los vehículos (admin o supervisor)
vehiculosRouter.get('/', verificarAdminOSupervisor, async (req, res) => {
    try {
        const vehiculos = await vehiculosService.getVehiculos();

        const response: ApiResponse<any[]> = {
            success: true,
            data: vehiculos
        };
        res.json(response);
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al obtener vehículos'
        };
        res.status(500).json(response);
    }
});

// Obtener vehículos por proyecto (admin o supervisor)
vehiculosRouter.get('/proyecto/:proyectoId', verificarAdminOSupervisor, async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const vehiculos = await vehiculosService.getVehiculosByProyecto(proyectoId);

        const response: ApiResponse<any[]> = {
            success: true,
            data: vehiculos
        };
        res.json(response);
    } catch (error) {
        console.error('Error al obtener vehículos del proyecto:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al obtener vehículos del proyecto'
        };
        res.status(500).json(response);
    }
});

// Crear nuevo vehículo (admin o supervisor)
vehiculosRouter.post('/', verificarAdminOSupervisor, async (req, res) => {
    try {
        const { nombre, tipo, horometroInicial, horometroFinal, noEconomico, capacidad, proyectos } = req.body;

        // Verificar si ya existe el número económico
        const vehiculoExistente = await vehiculosService.getVehiculoByNoEconomico(noEconomico);
        if (vehiculoExistente) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Ya existe un vehículo con ese número económico'
            };
            return res.status(400).json(response);
        }

        const nuevoVehiculo = await vehiculosService.createVehiculo({
            nombre,
            tipo,
            horometro_inicial: horometroInicial,
            horometro_final: horometroFinal,
            no_economico: noEconomico,
            capacidad,
            horas_operacion: 0 // Se calculará en el servicio
        });

        // Asignar proyectos si se proporcionaron
        if (proyectos && Array.isArray(proyectos) && proyectos.length > 0) {
            await vehiculosService.setProyectosForVehiculo(nuevoVehiculo.id, proyectos);
        }

        // Obtener vehículo completo con proyectos
        const vehiculoConProyectos = await vehiculosService.getVehiculoById(nuevoVehiculo.id);

        const response: ApiResponse<any> = {
            success: true,
            data: vehiculoConProyectos
        };
        res.status(201).json(response);
    } catch (error: any) {
        console.error('Error al crear vehículo:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: error.message || 'Error al crear vehículo'
        };
        res.status(500).json(response);
    }
});

// Actualizar vehículo (solo admin)
vehiculosRouter.put('/:id', verificarAdmin, async (req, res) => {
    try {
        const { nombre, tipo, horometroInicial, horometroFinal, noEconomico, capacidad, proyectos, activo } = req.body;

        // Preparar datos de actualización
        const updateData: any = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (tipo !== undefined) updateData.tipo = tipo;
        if (horometroInicial !== undefined) updateData.horometro_inicial = horometroInicial;
        if (horometroFinal !== undefined) updateData.horometro_final = horometroFinal;
        if (noEconomico !== undefined) updateData.no_economico = noEconomico;
        if (capacidad !== undefined) updateData.capacidad = capacidad;
        if (activo !== undefined) updateData.activo = activo;

        const vehiculoActualizado = await vehiculosService.updateVehiculo(req.params.id, updateData);

        if (!vehiculoActualizado) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Vehículo no encontrado'
            };
            return res.status(404).json(response);
        }

        // Actualizar proyectos si se proporcionaron
        if (proyectos !== undefined && Array.isArray(proyectos)) {
            await vehiculosService.setProyectosForVehiculo(req.params.id, proyectos);
        }

        // Obtener vehículo actualizado con proyectos
        const vehiculoFinal = await vehiculosService.getVehiculoById(req.params.id);

        const response: ApiResponse<any> = {
            success: true,
            data: vehiculoFinal
        };
        res.json(response);
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al actualizar vehículo'
        };
        res.status(500).json(response);
    }
});

// Eliminar vehículo (soft delete) (solo admin)
vehiculosRouter.delete('/:id', verificarAdmin, async (req, res) => {
    try {
        // Soft delete
        await vehiculosService.updateVehiculo(req.params.id, { activo: false });

        const response: ApiResponse<any> = {
            success: true,
            data: { message: 'Vehículo eliminado correctamente' }
        };
        res.json(response);
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al eliminar vehículo'
        };
        res.status(500).json(response);
    }
});
