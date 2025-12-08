import express from 'express';
import Material from '../models/Material.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todos los materiales
router.get('/', verificarToken, async (req, res) => {
    try {
        const materiales = await Material.find({ activo: true }).sort({ nombre: 1 });
        const response: ApiResponse<any[]> = {
            success: true,
            data: materiales
        };
        res.json(response);
    } catch (error: any) {
        const response: ApiResponse<null> = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
});

// Crear nuevo material
router.post('/', verificarToken, async (req, res) => {
    try {
        const { nombre, unidad } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                error: 'El nombre del material es requerido'
            });
        }

        const materialExistente = await Material.findOne({ nombre: nombre.toUpperCase() });
        if (materialExistente) {
            if (!materialExistente.activo) {
                materialExistente.activo = true;
                if (unidad) materialExistente.unidad = unidad;
                await materialExistente.save();
                return res.json({
                    success: true,
                    data: materialExistente
                });
            }
            return res.status(400).json({
                success: false,
                error: 'El material ya existe'
            });
        }

        const nuevoMaterial = new Material({
            nombre,
            unidad
        });

        await nuevoMaterial.save();

        res.status(201).json({
            success: true,
            data: nuevoMaterial
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { router as materialesRouter };
