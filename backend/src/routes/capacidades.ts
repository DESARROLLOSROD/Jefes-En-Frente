import express from 'express';
import Capacidad from '../models/Capacidad.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todas las capacidades
router.get('/', verificarToken, async (req, res) => {
    try {
        // Ordenar numéricamente si es posible
        const capacidades = await Capacidad.find({ activo: true }).sort({ valor: 1 });
        // Ordenamiento personalizado para asegurar orden numérico (ej. 6, 7, 10, 12, 14, 20)
        const sortedCapacidades = capacidades.sort((a, b) => {
            const valA = parseFloat(a.valor);
            const valB = parseFloat(b.valor);
            if (!isNaN(valA) && !isNaN(valB)) {
                return valA - valB;
            }
            return a.valor.localeCompare(b.valor);
        });

        const response: ApiResponse<any[]> = {
            success: true,
            data: sortedCapacidades
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

// Crear nueva capacidad
router.post('/', verificarToken, async (req, res) => {
    try {
        const { valor, etiqueta } = req.body;

        console.log('📦 Intentando crear capacidad:', { valor, etiqueta });

        if (!valor) {
            console.log('❌ Error: Valor requerido');
            return res.status(400).json({
                success: false,
                error: 'El valor de la capacidad es requerido'
            });
        }

        const capacidadExistente = await Capacidad.findOne({ valor: valor.toString().trim() });

        if (capacidadExistente) {
            console.log('⚠️ Capacidad ya existe:', capacidadExistente.valor);
            if (!capacidadExistente.activo) {
                console.log('🔄 Reactivando capacidad existente');
                capacidadExistente.activo = true;
                if (etiqueta) capacidadExistente.etiqueta = etiqueta;
                await capacidadExistente.save();
                return res.json({
                    success: true,
                    data: capacidadExistente
                });
            }
            return res.status(400).json({
                success: false,
                error: 'La capacidad ya existe'
            });
        }

        console.log('✨ Creando nueva capacidad en BD');

        // Si no se envía etiqueta, generarla por defecto (ej. "14 M³")
        const etiquetaFinal = etiqueta || `${valor} M³`;

        const nuevaCapacidad = new Capacidad({
            valor: valor.toString().trim(),
            etiqueta: etiquetaFinal.toUpperCase()
        });

        const guardado = await nuevaCapacidad.save();
        console.log('✅ Capacidad guardada:', guardado);

        res.status(201).json({
            success: true,
            data: guardado
        });

    } catch (error: any) {
        console.error('💥 Error al guardar capacidad:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { router as capacidadesRouter };
