import express from 'express';
import Destino from '../models/Destino.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todos los destinos
router.get('/', verificarToken, async (req, res) => {
    try {
        const destinos = await Destino.find({ activo: true }).sort({ nombre: 1 });
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

        const destinoExistente = await Destino.findOne({ nombre: nombre.toUpperCase() });
        if (destinoExistente) {
            console.log('⚠️ Destino ya existe:', destinoExistente.nombre);
            if (!destinoExistente.activo) {
                console.log('🔄 Reactivando destino existente');
                destinoExistente.activo = true;
                await destinoExistente.save();
                return res.json({
                    success: true,
                    data: destinoExistente
                });
            }
            return res.status(400).json({
                success: false,
                error: 'El destino ya existe'
            });
        }

        console.log('✨ Creando nuevo destino en BD');
        const nuevoDestino = new Destino({
            nombre: nombre.toUpperCase()
        });

        const guardado = await nuevoDestino.save();
        console.log('✅ Destino guardado:', guardado);

        res.status(201).json({
            success: true,
            data: guardado
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
