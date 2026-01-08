import express from 'express';
import { proyectosService } from '../services/proyectos.service.js';
import { verificarToken, verificarAdmin } from './auth.js';
import { ApiResponse } from '../types/reporte.js';

export const proyectosRouter = express.Router();

// Middleware de autenticación para todas las rutas
proyectosRouter.use(verificarToken);

// Obtener todos los proyectos
proyectosRouter.get('/', async (req, res) => {
    try {
        const proyectos = await proyectosService.getProyectos(true); // Solo activos

        const response: ApiResponse<any[]> = {
            success: true,
            data: proyectos
        };
        res.json(response);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al obtener proyectos'
        };
        res.status(500).json(response);
    }
});

// Obtener proyecto por ID
proyectosRouter.get('/:id', async (req, res) => {
    try {
        const proyecto = await proyectosService.getProyectoById(req.params.id);
        if (!proyecto) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Proyecto no encontrado'
            };
            return res.status(404).json(response);
        }
        console.log('✅ Proyecto encontrado:', proyecto.id);
        console.log('✅ Tiene mapa:', !!proyecto.mapa_imagen_data);

        const response: ApiResponse<any> = {
            success: true,
            data: proyecto
        };
        res.json(response);
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al obtener proyecto'
        };
        res.status(500).json(response);
    }
});

// Crear nuevo proyecto (solo admin)
proyectosRouter.post('/', verificarAdmin, async (req, res) => {
    try {
        const { nombre, ubicacion, descripcion, mapa } = req.body;

        // Si viene un mapa en el formato antiguo (nested object), convertirlo
        let mapaData: any = {};
        if (mapa?.imagen?.data) {
            mapaData = {
                mapa_imagen_data: mapa.imagen.data,
                mapa_content_type: mapa.imagen.contentType || 'image/png',
                mapa_width: mapa.width || null,
                mapa_height: mapa.height || null
            };
        }

        const nuevoProyecto = await proyectosService.createProyecto({
            nombre,
            ubicacion,
            descripcion,
            ...mapaData
        });

        const response: ApiResponse<any> = {
            success: true,
            data: nuevoProyecto
        };
        res.status(201).json(response);
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al crear proyecto'
        };
        res.status(500).json(response);
    }
});

// Actualizar proyecto (solo admin)
proyectosRouter.put('/:id', verificarAdmin, async (req, res) => {
    try {
        const { nombre, ubicacion, descripcion, activo, mapa } = req.body;

        // Preparar datos de actualización
        const updateData: any = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (activo !== undefined) updateData.activo = activo;

        // Si viene un mapa en el formato antiguo (nested object), convertirlo
        if (mapa?.imagen?.data) {
            updateData.mapa_imagen_data = mapa.imagen.data;
            updateData.mapa_content_type = mapa.imagen.contentType || 'image/png';
            updateData.mapa_width = mapa.width || null;
            updateData.mapa_height = mapa.height || null;
        }

        const proyectoActualizado = await proyectosService.updateProyecto(req.params.id, updateData);

        if (!proyectoActualizado) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Proyecto no encontrado'
            };
            return res.status(404).json(response);
        }

        const response: ApiResponse<any> = {
            success: true,
            data: proyectoActualizado
        };
        res.json(response);
    } catch (error) {
        console.error('Error al actualizar proyecto:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al actualizar proyecto'
        };
        res.status(500).json(response);
    }
});

// Eliminar proyecto (soft delete) (solo admin)
proyectosRouter.delete('/:id', verificarAdmin, async (req, res) => {
    try {
        // Soft delete
        await proyectosService.updateProyecto(req.params.id, { activo: false });

        const response: ApiResponse<any> = {
            success: true,
            data: { message: 'Proyecto eliminado correctamente' }
        };
        res.json(response);
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        const response: ApiResponse<null> = {
            success: false,
            error: 'Error al eliminar proyecto'
        };
        res.status(500).json(response);
    }
});
