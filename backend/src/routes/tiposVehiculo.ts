import { Router, Request, Response } from 'express';
import TipoVehiculo from '../models/TipoVehiculo.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Obtener todos los tipos activos
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const tipos = await TipoVehiculo.find({ activo: true }).sort({ nombre: 1 });
        res.json({
            success: true,
            data: tipos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener tipos de vehículo'
        });
    }
});

// Crear nuevo tipo
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;

        // Verificar si ya existe (case insensitive)
        const existe = await TipoVehiculo.findOne({
            nombre: { $regex: new RegExp(`^${nombre}$`, 'i') }
        });

        if (existe) {
            if (!existe.activo) {
                existe.activo = true;
                await existe.save();
                return res.json({ success: true, data: existe });
            }
            return res.status(400).json({
                success: false,
                error: 'El tipo de vehículo ya existe'
            });
        }

        const nuevoTipo = new TipoVehiculo({ nombre });
        await nuevoTipo.save();

        res.json({
            success: true,
            data: nuevoTipo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al crear tipo de vehículo'
        });
    }
});

export default router;
