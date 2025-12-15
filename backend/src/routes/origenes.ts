import express from 'express';
import Origen from '../models/Origen.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todos los orígenes
router.get('/', verificarToken, async (req, res) => {
    try {
        const origenes = await Origen.find({ activo: true }).sort({ nombre: 1 });
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

        const origenExistente = await Origen.findOne({ nombre: nombre.toUpperCase() });
        if (origenExistente) {
            console.log('⚠️ Origen ya existe:', origenExistente.nombre);
            if (!origenExistente.activo) {
                console.log('🔄 Reactivando origen existente');
                origenExistente.activo = true;
                await origenExistente.save();
                return res.json({
                    success: true,
                    data: origenExistente
                });
            }
            return res.status(400).json({
                success: false,
                error: 'El origen ya existe'
            });
        }

        console.log('✨ Creando nuevo origen en BD');
        const nuevoOrigen = new Origen({
            nombre: nombre.toUpperCase()
        });

        const guardado = await nuevoOrigen.save();
        console.log('✅ Origen guardado:', guardado);

        res.status(201).json({
            success: true,
            data: guardado
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
