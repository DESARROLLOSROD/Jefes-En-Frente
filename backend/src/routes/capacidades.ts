import express from 'express';
import { capacidadesService } from '../services/catalogos.service.js';
import { ApiResponse } from '../types/reporte.js';
import { verificarToken } from './auth.js';

const router = express.Router();

// Obtener todas las capacidades
router.get('/', verificarToken, async (req, res) => {
    try {
        const capacidades = await capacidadesService.getAll(true);

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

        const capacidadExistente = await capacidadesService.getByValor(valor.toString().trim());

        if (capacidadExistente) {
            console.log('⚠️ Capacidad ya existe:', capacidadExistente.valor);
            if (!capacidadExistente.activo) {
                console.log('🔄 Reactivando capacidad existente');
                const capacidadActualizada = await capacidadesService.update(capacidadExistente.id, {
                    activo: true,
                    etiqueta: etiqueta ? etiqueta.toUpperCase() : capacidadExistente.etiqueta
                });
                return res.json({
                    success: true,
                    data: capacidadActualizada
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

        const nuevaCapacidad = await capacidadesService.create({
            valor: valor.toString().trim(),
            etiqueta: etiquetaFinal.toUpperCase()
        });

        console.log('✅ Capacidad guardada:', nuevaCapacidad);

        res.status(201).json({
            success: true,
            data: nuevaCapacidad
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
