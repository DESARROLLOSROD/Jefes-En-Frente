import express from 'express';
import { materialesService } from '../services/catalogos.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todos los materiales
router.get('/', verificarToken, async (req, res) => {
    try {
        const materiales = await materialesService.getAll(true);
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

        console.log('📦 Intentando crear material:', { nombre, unidad });

        if (!nombre) {
            console.log('❌ Error: Nombre requerido');
            return res.status(400).json({
                success: false,
                error: 'El nombre del material es requerido'
            });
        }

        const materialExistente = await materialesService.getByNombre(nombre.toUpperCase());
        if (materialExistente) {
            console.log('⚠️ Material ya existe:', materialExistente.nombre);
            if (!materialExistente.activo) {
                console.log('🔄 Reactivando material existente');
                const materialActualizado = await materialesService.update(materialExistente.id, {
                    activo: true,
                    unidad: unidad ? unidad.toUpperCase() : materialExistente.unidad
                });
                return res.json({
                    success: true,
                    data: materialActualizado
                });
            }
            return res.status(400).json({
                success: false,
                error: 'El material ya existe'
            });
        }

        console.log('✨ Creando nuevo material en BD');
        const nuevoMaterial = await materialesService.create({
            nombre: nombre.toUpperCase(),
            unidad: unidad ? unidad.toUpperCase() : undefined
        });

        console.log('✅ Material guardado:', nuevoMaterial);

        res.status(201).json({
            success: true,
            data: nuevoMaterial
        });

    } catch (error: any) {
        console.error('💥 Error al guardar material:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { router as materialesRouter };
