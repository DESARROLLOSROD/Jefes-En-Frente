import express from 'express';
import { usuariosService } from '../services/usuarios.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { verificarToken, verificarAdmin, verificarAdminOSupervisor } from './auth.js';
const router = express.Router();
// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);
// GET y POST permiten admin o supervisor, PUT y DELETE solo admin
// GET /api/usuarios - Listar todos los usuarios (admin o supervisor)
router.get('/', verificarAdminOSupervisor, async (req, res) => {
    try {
        const usuarios = await usuariosService.getUsuarios();
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
// GET /api/usuarios/:id - Obtener un usuario específico (admin o supervisor)
router.get('/:id', verificarAdminOSupervisor, async (req, res) => {
    try {
        const usuario = await usuariosService.getUsuarioById(req.params.id);
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
// POST /api/usuarios - Crear nuevo usuario (admin o supervisor)
router.post('/', verificarAdminOSupervisor, async (req, res) => {
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
        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                nombre,
                rol: rol || 'jefe en frente'
            }
        });
        if (authError || !authData.user) {
            console.error('Error creando usuario en Supabase Auth:', authError);
            const response = {
                success: false,
                error: authError?.message === 'User already registered'
                    ? 'El email ya está registrado'
                    : `Error al crear usuario: ${authError?.message}`
            };
            return res.status(400).json(response);
        }
        // Verificar si el perfil ya fue creado por el trigger
        const existingPerfil = await usuariosService.getUsuarioById(authData.user.id);
        if (!existingPerfil) {
            // Si el trigger no lo creo, crearlo manualmente
            await usuariosService.createPerfil({
                id: authData.user.id,
                nombre,
                rol: rol || 'jefe en frente',
                activo: activo !== undefined ? activo : true
            });
        }
        else {
            // Si ya existe, actualizar con los datos proporcionados
            await usuariosService.updatePerfil(authData.user.id, {
                nombre,
                rol: rol || 'jefe en frente',
                activo: activo !== undefined ? activo : true
            });
        }
        // Asignar proyectos si se proporcionaron
        if (proyectos && Array.isArray(proyectos) && proyectos.length > 0) {
            await usuariosService.assignProyectosToUsuario(authData.user.id, proyectos);
        }
        // Obtener usuario completo con proyectos
        const usuarioCreado = await usuariosService.getUsuarioById(authData.user.id);
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
// PUT /api/usuarios/:id - Actualizar usuario (solo admin)
router.put('/:id', verificarAdmin, async (req, res) => {
    try {
        const { nombre, email, password, rol, proyectos, activo } = req.body;
        const usuario = await usuariosService.getUsuarioById(req.params.id);
        if (!usuario) {
            const response = {
                success: false,
                error: 'Usuario no encontrado'
            };
            return res.status(404).json(response);
        }
        // Actualizar en Supabase Auth si hay cambios de email o password
        if (email || password) {
            const updates = {};
            if (email)
                updates.email = email;
            if (password)
                updates.password = password;
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(req.params.id, updates);
            if (authError) {
                console.error('Error actualizando usuario en Supabase Auth:', authError);
                const response = {
                    success: false,
                    error: authError.message === 'Email already registered'
                        ? 'El email ya está registrado'
                        : `Error al actualizar usuario: ${authError.message}`
                };
                return res.status(400).json(response);
            }
        }
        // Actualizar perfil
        const perfilUpdates = {};
        if (nombre)
            perfilUpdates.nombre = nombre;
        if (rol)
            perfilUpdates.rol = rol;
        if (activo !== undefined)
            perfilUpdates.activo = activo;
        if (Object.keys(perfilUpdates).length > 0) {
            await usuariosService.updatePerfil(req.params.id, perfilUpdates);
        }
        // Actualizar proyectos si se proporcionaron
        if (proyectos !== undefined && Array.isArray(proyectos)) {
            await usuariosService.assignProyectosToUsuario(req.params.id, proyectos);
        }
        // Obtener usuario actualizado
        const usuarioActualizado = await usuariosService.getUsuarioById(req.params.id);
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
// DELETE /api/usuarios/:id - Eliminar usuario permanentemente (solo admin)
router.delete('/:id', verificarAdmin, async (req, res) => {
    try {
        const usuario = await usuariosService.getUsuarioById(req.params.id);
        if (!usuario) {
            const response = {
                success: false,
                error: 'Usuario no encontrado'
            };
            return res.status(404).json(response);
        }
        // Eliminar de Supabase Auth (esto también eliminará el perfil por CASCADE)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
        if (authError) {
            console.error('Error eliminando usuario de Supabase Auth:', authError);
            const response = {
                success: false,
                error: `Error al eliminar usuario: ${authError.message}`
            };
            return res.status(500).json(response);
        }
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
