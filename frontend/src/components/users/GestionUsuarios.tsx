import React, { useState, useEffect } from 'react';
import { Usuario, CrearUsuarioDTO, ActualizarUsuarioDTO } from '../../types/usuario.types';
import { usuarioService } from '../../services/usuario.service';
import FormularioUsuario from './FormularioUsuario';
import ModalConfirmacion from '../shared/modals/ModalConfirmacion';

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
            mostrarMensaje('error', response.error || 'ERROR AL CARGAR USUARIOS');
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
            mostrarMensaje('success', id ? 'USUARIO ACTUALIZADO CORRECTAMENTE' : 'USUARIO CREADO CORRECTAMENTE');
            setMostrarFormulario(false);
            cargarUsuarios();
        } else {
            mostrarMensaje('error', response.error || 'ERROR AL GUARDAR USUARIO');
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
            mostrarMensaje('success', 'USUARIO ELIMINADO CORRECTAMENTE');
            setMostrarConfirmacion(false);
            setUsuarioEliminar(null);
            cargarUsuarios();
        } else {
            mostrarMensaje('error', response.error || 'ERROR AL ELIMINAR USUARIO');
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
            case 'admin': return 'ADMINISTRADOR';
            case 'supervisor': return 'SUPERVISOR';
            case 'jefe en frente': return 'JEFE EN FRENTE';
            default: return rol;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">👥 GESTIÓN DE USUARIOS</h2>
                    <p className="text-gray-600 mt-1">ADMINISTRA LOS USUARIOS DEL SISTEMA</p>
                </div>
                <button
                    onClick={handleNuevoUsuario}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                    ➕ NUEVO USUARIO
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
                    <label className="block text-gray-700 font-semibold mb-2">🔍 BUSCAR</label>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="NOMBRE O EMAIL..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filtro por Rol */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">👔 ROL</label>
                    <select
                        value={filtroRol}
                        onChange={(e) => setFiltroRol(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="todos">TODOS</option>
                        <option value="admin">ADMINISTRADOR</option>
                        <option value="supervisor">SUPERVISOR</option>
                        <option value="jefe en frente">JEFE EN FRENTE</option>
                    </select>
                </div>

                {/* Filtro por Estado */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">📊 ESTADO</label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="todos">TODOS</option>
                        <option value="activos">ACTIVOS</option>
                        <option value="inactivos">INACTIVOS</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">CARGANDO USUARIOS...</p>
                </div>
            ) : usuariosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">NO SE ENCONTRARON USUARIOS</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold uppercase">NOMBRE</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">EMAIL</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">ROL</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">PROYECTOS</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">ESTADO</th>
                                <th className="px-6 py-3 text-center font-semibold uppercase">ACCIONES</th>
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
                                                <span className="text-gray-400">SIN PROYECTOS</span>
                                            ) : (
                                                <span>{usuario.proyectos.length} PROYECTO(S)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${usuario.activo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {usuario.activo ? '✓ ACTIVO' : '✗ INACTIVO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-2">
                                            {userRol === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditarUsuario(usuario)}
                                                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                                                        title="EDITAR USUARIO"
                                                    >
                                                        ✏️ EDITAR
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarClick(usuario)}
                                                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                                                        title="ELIMINAR USUARIO"
                                                    >
                                                        🗑️ ELIMINAR
                                                    </button>
                                                </>
                                            )}
                                            {userRol === 'supervisor' && (
                                                <span className="text-gray-400 text-sm italic">SOLO LECTURA</span>
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
            <ModalConfirmacion
                isOpen={mostrarConfirmacion}
                onClose={() => {
                    setMostrarConfirmacion(false);
                    setUsuarioEliminar(null);
                }}
                onConfirm={handleConfirmarEliminar}
                title="CONFIRMAR ELIMINACIÓN"
                mensaje={
                    <span>
                        ¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR AL USUARIO <strong>{usuarioEliminar?.nombre}</strong>?
                        <br />
                        <span className="text-red-600 font-semibold">ESTA ACCIÓN ES PERMANENTE Y NO SE PUEDE DESHACER.</span>
                    </span>
                }
                confirmText="ELIMINAR"
                cancelText="CANCELAR"
            />
        </div>
    );
};

export default GestionUsuarios;
