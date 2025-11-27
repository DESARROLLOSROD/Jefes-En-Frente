import express from 'express';
import Usuario from '../models/Usuario.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();
// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(verificarToken);
router.use(verificarAdmin);
// GET /api/usuarios - Listar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find()
            .populate('proyectos', 'nombre ubicacion')
            .select('-password')
            .sort({ fechaCreacion: -1 });
        const response = {
            success: true,
            data: usuarios
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error en GET /usuarios:', error);
        const response = {
            success: false,
            error: 'Error al obtener usuarios'
        };
        res.status(500).json(response);
    }
});
// GET /api/usuarios/:id - Obtener un usuario específico
router.get('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id)
            .populate('proyectos', 'nombre ubicacion descripcion')
            .select('-password');
        if (!usuario) {
            const response = {
                success: false,
                error: 'Usuario no encontrado'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: usuario
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error en GET /usuarios/:id:', error);
        const response = {
            success: false,
            error: 'Error al obtener usuario'
        };
        res.status(500).json(response);
    }
});
// POST /api/usuarios - Crear nuevo usuario
router.post('/', async (req, res) => {
    try {
        const { nombre, email, password, rol, proyectos, activo } = req.body;
        // Validaciones
        if (!nombre || !email || !password) {
            const response = {
                success: false,
                error: 'Nombre, email y password son requeridos'
            };
            return res.status(400).json(response);
        }
        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            const response = {
                success: false,
                error: 'El email ya está registrado'
            };
            return res.status(400).json(response);
        }
        // Crear usuario
        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password,
            rol: rol || 'operador',
            proyectos: proyectos || [],
            activo: activo !== undefined ? activo : true
        });
        await nuevoUsuario.save();
        // Obtener usuario sin password
        const usuarioCreado = await Usuario.findById(nuevoUsuario._id)
            .populate('proyectos', 'nombre ubicacion')
            .select('-password');
        const response = {
            success: true,
            data: usuarioCreado
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error en POST /usuarios:', error);
        const response = {
            success: false,
            error: error.message || 'Error al crear usuario'
        };
        res.status(500).json(response);
    }
});
// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { nombre, email, password, rol, proyectos, activo } = req.body;
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            const response = {
                success: false,
                error: 'Usuario no encontrado'
            };
            return res.status(404).json(response);
        }
        // Verificar si el email ya existe en otro usuario
        if (email && email !== usuario.email) {
            const emailExistente = await Usuario.findOne({ email, _id: { $ne: req.params.id } });
            if (emailExistente) {
                const response = {
                    success: false,
                    error: 'El email ya está registrado'
                };
                return res.status(400).json(response);
            }
        }
        // Actualizar campos
        if (nombre)
            usuario.nombre = nombre;
        if (email)
            usuario.email = email;
        if (password)
            usuario.password = password; // Se hasheará automáticamente por el pre-save hook
        if (rol)
            usuario.rol = rol;
        if (proyectos !== undefined)
            usuario.proyectos = proyectos;
        if (activo !== undefined)
            usuario.activo = activo;
        await usuario.save();
        // Obtener usuario actualizado sin password
        const usuarioActualizado = await Usuario.findById(usuario._id)
            .populate('proyectos', 'nombre ubicacion')
            .select('-password');
        const response = {
            success: true,
            data: usuarioActualizado
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error en PUT /usuarios/:id:', error);
        const response = {
            success: false,
            error: error.message || 'Error al actualizar usuario'
        };
        res.status(500).json(response);
    }
});
// DELETE /api/usuarios/:id - Eliminar usuario permanentemente
router.delete('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            const response = {
                success: false,
                error: 'Usuario no encontrado'
            };
            return res.status(404).json(response);
        }
        // Hard delete - eliminar permanentemente de MongoDB
        await Usuario.findByIdAndDelete(req.params.id);
        const response = {
            success: true,
            data: { message: 'Usuario eliminado permanentemente' }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error en DELETE /usuarios/:id:', error);
        const response = {
            success: false,
            error: 'Error al eliminar usuario'
        };
        res.status(500).json(response);
    }
});
export { router as usuariosRouter };
