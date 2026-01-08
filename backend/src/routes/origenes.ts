import express from 'express';
import { origenesService } from '../services/catalogos.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todos los orígenes
router.get('/', verificarToken, async (req, res) => {
    try {
        const origenes = await origenesService.getAll(true);
        const response: ApiResponse<any[]> = {
            success: true,
            data: origenes
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

// Crear nuevo origen
router.post('/', verificarToken, async (req, res) => {
    try {
        const { nombre } = req.body;

        console.log('📍 Intentando crear origen:', { nombre });

        if (!nombre) {
            console.log('❌ Error: Nombre requerido');
            return res.status(400).json({
                success: false,
                error: 'El nombre del origen es requerido'
            });
        }

        const origenExistente = await origenesService.getByNombre(nombre.toUpperCase());
        if (origenExistente) {
            console.log('⚠️ Origen ya existe:', origenExistente.nombre);
            if (!origenExistente.activo) {
                console.log('🔄 Reactivando origen existente');
                const origenActualizado = await origenesService.update(origenExistente.id, {
                    activo: true
                });
                return res.json({
                    success: true,
                    data: origenActualizado
                });
            }
            return res.status(400).json({
                success: false,
                error: 'El origen ya existe'
            });
        }

        console.log('✨ Creando nuevo origen en BD');
        const nuevoOrigen = await origenesService.create({
            nombre: nombre.toUpperCase()
        });

        console.log('✅ Origen guardado:', nuevoOrigen);

        res.status(201).json({
            success: true,
            data: nuevoOrigen
        });

    } catch (error: any) {
        console.error('💥 Error al guardar origen:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { router as origenesRouter };
