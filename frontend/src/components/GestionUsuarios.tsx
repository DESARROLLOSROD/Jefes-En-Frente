import React, { useState, useEffect } from 'react';
import { Usuario, CrearUsuarioDTO, ActualizarUsuarioDTO } from '../types/usuario.types';
import { usuarioService } from '../services/usuario.service';
import FormularioUsuario from './FormularioUsuario';

interface GestionUsuariosProps {
    userRol?: 'admin' | 'supervisor' | 'jefe en frente';
}

const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ userRol = 'admin' }) => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [usuarioEliminar, setUsuarioEliminar] = useState<Usuario | null>(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroRol, setFiltroRol] = useState<string>('todos');
    const [filtroEstado, setFiltroEstado] = useState<string>('activos');

    // Mensajes
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [usuarios, busqueda, filtroRol, filtroEstado]);

    const cargarUsuarios = async () => {
        setLoading(true);
        const response = await usuarioService.obtenerUsuarios();
        if (response.success && response.data) {
            setUsuarios(response.data);
        } else {
            mostrarMensaje('error', response.error || 'Error al cargar usuarios');
        }
        setLoading(false);
    };

    const aplicarFiltros = () => {
        let resultado = [...usuarios];

        // Filtro por búsqueda
        if (busqueda) {
            resultado = resultado.filter(u =>
                u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                u.email.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        // Filtro por rol
        if (filtroRol !== 'todos') {
            resultado = resultado.filter(u => u.rol === filtroRol);
        }

        // Filtro por estado
        if (filtroEstado === 'activos') {
            resultado = resultado.filter(u => u.activo);
        } else if (filtroEstado === 'inactivos') {
            resultado = resultado.filter(u => !u.activo);
        }

        setUsuariosFiltrados(resultado);
    };

    const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje(null), 5000);
    };

    const handleNuevoUsuario = () => {
        setUsuarioEditar(null);
        setMostrarFormulario(true);
    };

    const handleEditarUsuario = (usuario: Usuario) => {
        setUsuarioEditar(usuario);
        setMostrarFormulario(true);
    };

    const handleGuardarUsuario = async (data: CrearUsuarioDTO | ActualizarUsuarioDTO, id?: string) => {
        let response;

        if (id) {
            response = await usuarioService.actualizarUsuario(id, data as ActualizarUsuarioDTO);
        } else {
            response = await usuarioService.crearUsuario(data as CrearUsuarioDTO);
        }

        if (response.success) {
            mostrarMensaje('success', id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            setMostrarFormulario(false);
            cargarUsuarios();
        } else {
            mostrarMensaje('error', response.error || 'Error al guardar usuario');
        }
    };

    const handleEliminarClick = (usuario: Usuario) => {
        setUsuarioEliminar(usuario);
        setMostrarConfirmacion(true);
    };

    const handleConfirmarEliminar = async () => {
        if (!usuarioEliminar) return;

        const response = await usuarioService.eliminarUsuario(usuarioEliminar._id!);

        if (response.success) {
            mostrarMensaje('success', 'Usuario eliminado correctamente');
            setMostrarConfirmacion(false);
            setUsuarioEliminar(null);
            cargarUsuarios();
        } else {
            mostrarMensaje('error', response.error || 'Error al eliminar usuario');
        }
    };

    const getRolBadgeColor = (rol: string) => {
        switch (rol) {
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'supervisor': return 'bg-blue-100 text-blue-800';
            case 'jefe en frente': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRolLabel = (rol: string) => {
        switch (rol) {
            case 'admin': return 'Administrador';
            case 'supervisor': return 'Supervisor';
            case 'jefe en frente': return 'JEFE EN FRENTE';
            default: return rol;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">👥 Gestión de Usuarios</h2>
                    <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
                </div>
                <button
                    onClick={handleNuevoUsuario}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                    ➕ Nuevo Usuario
                </button>
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`mb-4 p-4 rounded-lg ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Búsqueda */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">🔍 Buscar</label>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Nombre o email..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filtro por Rol */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">👔 Rol</label>
                    <select
                        value={filtroRol}
                        onChange={(e) => setFiltroRol(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="todos">Todos</option>
                        <option value="admin">Administrador</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="jefe en frente">JEFE EN FRENTE</option>
                    </select>
                </div>

                {/* Filtro por Estado */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">📊 Estado</label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Cargando usuarios...</p>
                </div>
            ) : usuariosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">Email</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">Rol</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">Proyectos</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">Estado</th>
                                <th className="px-6 py-3 text-center font-semibold uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuariosFiltrados.map((usuario, index) => (
                                <tr
                                    key={usuario._id}
                                    className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800 uppercase">{usuario.nombre}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 uppercase">{usuario.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getRolBadgeColor(usuario.rol)}`}>
                                            {getRolLabel(usuario.rol)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 uppercase">
                                            {usuario.proyectos.length === 0 ? (
                                                <span className="text-gray-400">Sin proyectos</span>
                                            ) : (
                                                <span>{usuario.proyectos.length} proyecto(s)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${usuario.activo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {usuario.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-2">
                                            {userRol === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditarUsuario(usuario)}
                                                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                                                        title="Editar usuario"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarClick(usuario)}
                                                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                                                        title="Eliminar usuario"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </>
                                            )}
                                            {userRol === 'supervisor' && (
                                                <span className="text-gray-400 text-sm italic">Solo lectura</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Formulario Modal */}
            {mostrarFormulario && (
                <FormularioUsuario
                    usuario={usuarioEditar}
                    onClose={() => setMostrarFormulario(false)}
                    onGuardar={handleGuardarUsuario}
                />
            )}

            {/* Modal de Confirmación */}
            {mostrarConfirmacion && usuarioEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Confirmar Eliminación</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar al usuario <strong>{usuarioEliminar.nombre}</strong>?
                            <br />
                            <span className="text-red-600 font-semibold">Esta acción es PERMANENTE y no se puede deshacer.</span>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setMostrarConfirmacion(false);
                                    setUsuarioEliminar(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarEliminar}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;
