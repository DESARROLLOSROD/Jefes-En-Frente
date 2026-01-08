import { Router, Request, Response } from 'express';
import { tiposVehiculoService } from '../services/catalogos.service.js';
import { verificarToken } from './auth.js';

const router = Router();

// Obtener todos los tipos activos
router.get('/', verificarToken, async (req: Request, res: Response) => {
    try {
        const tipos = await tiposVehiculoService.getAll(true);
        res.json({
            success: true,
            data: tipos
        });
    } catch (error) {
        console.error('Error al obtener tipos de vehículo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener tipos de vehículo'
        });
    }
});

// Crear nuevo tipo
router.post('/', verificarToken, async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                error: 'El nombre del tipo de vehículo es requerido'
            });
        }

        // Verificar si ya existe
        const existe = await tiposVehiculoService.getByNombre(nombre);

        if (existe) {
            if (!existe.activo) {
                const tipoActualizado = await tiposVehiculoService.update(existe.id, {
                    activo: true
                });
                return res.json({ success: true, data: tipoActualizado });
            }
            return res.status(400).json({
                success: false,
                error: 'El tipo de vehículo ya existe'
            });
        }

        const nuevoTipo = await tiposVehiculoService.create({ nombre });

        res.json({
            success: true,
            data: nuevoTipo
        });
    } catch (error) {
        console.error('Error al crear tipo de vehículo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear tipo de vehículo'
        });
    }
});

export default router;
