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

        console.log('📦 Intentando crear material:', { nombre, unidad });

        if (!nombre) {
            console.log('❌ Error: Nombre requerido');
            return res.status(400).json({
                success: false,
                error: 'El nombre del material es requerido'
            });
        }

        const materialExistente = await Material.findOne({ nombre: nombre.toUpperCase() });
        if (materialExistente) {
            console.log('⚠️ Material ya existe:', materialExistente.nombre);
            if (!materialExistente.activo) {
                console.log('🔄 Reactivando material existente');
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

        console.log('✨ Creando nuevo material en BD');
        const nuevoMaterial = new Material({
            nombre: nombre.toUpperCase(),
            unidad: unidad ? unidad.toUpperCase() : undefined
        });

        const guardado = await nuevoMaterial.save();
        console.log('✅ Material guardado:', guardado);

        res.status(201).json({
            success: true,
            data: guardado
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
