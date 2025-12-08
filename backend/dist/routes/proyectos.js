import express from 'express';
import mongoose from 'mongoose';
import Proyecto from '../models/Proyecto.js';
import { verificarToken, verificarAdmin } from './auth.js';
export const proyectosRouter = express.Router();
// Middleware de autenticación para todas las rutas
proyectosRouter.use(verificarToken);
// Obtener todos los proyectos
proyectosRouter.get('/', async (req, res) => {
    try {
        const proyectos = await Proyecto.find({ activo: true }).sort({ fechaCreacion: -1 });
        res.json(proyectos);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener proyectos', error });
    }
});
// Obtener proyecto por ID
proyectosRouter.get('/:id', async (req, res) => {
    try {
        // Validar que el ID sea válido
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }
        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        console.log('✅ Proyecto encontrado:', proyecto._id);
        console.log('✅ Tiene mapa:', !!proyecto.mapa);
        if (proyecto.mapa) {
            console.log('✅ Mapa tiene imagen:', !!proyecto.mapa.imagen);
            console.log('✅ Imagen tiene data:', !!proyecto.mapa.imagen?.data);
        }
        res.json(proyecto);
    }
    catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).json({ message: 'Error al obtener proyecto', error });
    }
});
// Crear nuevo proyecto (solo admin)
proyectosRouter.post('/', verificarAdmin, async (req, res) => {
    try {
        const { nombre, ubicacion, descripcion, mapa } = req.body;
        const nuevoProyecto = new Proyecto({
            nombre,
            ubicacion,
            descripcion,
            mapa
        });
        await nuevoProyecto.save();
        res.status(201).json(nuevoProyecto);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear proyecto', error });
    }
});
// Actualizar proyecto (solo admin)
proyectosRouter.put('/:id', verificarAdmin, async (req, res) => {
    try {
        const { nombre, ubicacion, descripcion, activo, mapa } = req.body;
        const proyectoActualizado = await Proyecto.findByIdAndUpdate(req.params.id, { nombre, ubicacion, descripcion, activo, mapa }, { new: true });
        if (!proyectoActualizado) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(proyectoActualizado);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar proyecto', error });
    }
});
// Eliminar proyecto (soft delete) (solo admin)
proyectosRouter.delete('/:id', verificarAdmin, async (req, res) => {
    try {
        const proyectoEliminado = await Proyecto.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
        if (!proyectoEliminado) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json({ message: 'Proyecto eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar proyecto', error });
    }
});
