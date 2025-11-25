import express from 'express';
import Vehiculo from '../models/Vehiculo.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.middleware.js';

export const vehiculosRouter = express.Router();

// Middleware de autenticación para todas las rutas
vehiculosRouter.use(verificarToken);

// Obtener todos los vehículos
vehiculosRouter.get('/', async (req, res) => {
    try {
        const vehiculos = await Vehiculo.find({ activo: true })
            .populate('proyectos', 'nombre ubicacion')
            .sort({ nombre: 1 });
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener vehículos', error });
    }
});

// Obtener vehículos por proyecto
vehiculosRouter.get('/proyecto/:proyectoId', async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const vehiculos = await Vehiculo.find({
            activo: true,
            proyectos: proyectoId
        }).sort({ nombre: 1 });
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener vehículos del proyecto', error });
    }
});

// Crear nuevo vehículo (solo admin)
vehiculosRouter.post('/', verificarAdmin, async (req, res) => {
    try {
        const { nombre, tipo, horometroInicial, horometroFinal, noEconomico, proyectos } = req.body;

        // Verificar si ya existe el número económico
        const vehiculoExistente = await Vehiculo.findOne({ noEconomico });
        if (vehiculoExistente) {
            return res.status(400).json({ message: 'Ya existe un vehículo con ese número económico' });
        }

        const nuevoVehiculo = new Vehiculo({
            nombre,
            tipo,
            horometroInicial,
            horometroFinal,
            noEconomico,
            proyectos: proyectos || []
        });

        await nuevoVehiculo.save();
        const vehiculoConProyectos = await Vehiculo.findById(nuevoVehiculo._id)
            .populate('proyectos', 'nombre ubicacion');
        res.status(201).json(vehiculoConProyectos);
    } catch (error: any) {
        console.error('Error al crear vehículo:', error);
        res.status(500).json({
            message: 'Error al crear vehículo',
            error: error.message || error
        });
    }
});

// Actualizar vehículo (solo admin)
vehiculosRouter.put('/:id', verificarAdmin, async (req, res) => {
    try {
        const { nombre, tipo, horometroInicial, horometroFinal, noEconomico, proyectos, activo } = req.body;

        const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(
            req.params.id,
            { nombre, tipo, horometroInicial, horometroFinal, noEconomico, proyectos, activo },
            { new: true }
        ).populate('proyectos', 'nombre ubicacion');

        if (!vehiculoActualizado) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        res.json(vehiculoActualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar vehículo', error });
    }
});

// Eliminar vehículo (soft delete) (solo admin)
vehiculosRouter.delete('/:id', verificarAdmin, async (req, res) => {
    try {
        const vehiculoEliminado = await Vehiculo.findByIdAndUpdate(
            req.params.id,
            { activo: false },
            { new: true }
        );

        if (!vehiculoEliminado) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        res.json({ message: 'Vehículo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar vehículo', error });
    }
});
