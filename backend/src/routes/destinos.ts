import express from 'express';
import { destinosService } from '../services/catalogos.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todos los destinos
router.get('/', verificarToken, async (req, res) => {
    try {
        const destinos = await destinosService.getAll(true);
        const response: ApiResponse<any[]> = {
            success: true,
            data: destinos
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

// Crear nuevo destino
router.post('/', verificarToken, async (req, res) => {
    try {
        const { nombre } = req.body;

        console.log('🎯 Intentando crear destino:', { nombre });

        if (!nombre) {
            console.log('❌ Error: Nombre requerido');
            return res.status(400).json({
                success: false,
                error: 'El nombre del destino es requerido'
            });
        }

        const destinoExistente = await destinosService.getByNombre(nombre.toUpperCase());
        if (destinoExistente) {
            console.log('⚠️ Destino ya existe:', destinoExistente.nombre);
            if (!destinoExistente.activo) {
                console.log('🔄 Reactivando destino existente');
                const destinoActualizado = await destinosService.update(destinoExistente.id, {
                    activo: true
                });
                return res.json({
                    success: true,
                    data: destinoActualizado
                });
            }
            return res.status(400).json({
                success: false,
                error: 'El destino ya existe'
            });
        }

        console.log('✨ Creando nuevo destino en BD');
        const nuevoDestino = await destinosService.create({
            nombre: nombre.toUpperCase()
        });

        console.log('✅ Destino guardado:', nuevoDestino);

        res.status(201).json({
            success: true,
            data: nuevoDestino
        });

    } catch (error: any) {
        console.error('💥 Error al guardar destino:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { router as destinosRouter };
