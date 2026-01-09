import React, { useState, useEffect } from 'react';
import { Personal, PersonalInput } from '../../types/personal';
import { personalService } from '../../services/api';
import FormularioPersonal from './FormularioPersonal';
import ModalConfirmacion from '../shared/modals/ModalConfirmacion';

interface GestionPersonalProps {
    userRol?: 'admin' | 'supervisor' | 'jefe en frente' | 'operador';
}

const GestionPersonal: React.FC<GestionPersonalProps> = ({ userRol = 'admin' }) => {
    const [personal, setPersonal] = useState<Personal[]>([]);
    const [personalFiltrado, setPersonalFiltrado] = useState<Personal[]>([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [personalEditar, setPersonalEditar] = useState<Personal | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [personalEliminar, setPersonalEliminar] = useState<Personal | null>(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<string>('activos');

    // Mensajes
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

    useEffect(() => {
        cargarPersonal();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [personal, busqueda, filtroEstado]);

    const cargarPersonal = async () => {
        setLoading(true);
        const response = await personalService.getPersonal();
        if (response.success && response.data) {
            setPersonal(response.data);
        } else {
            mostrarMensaje('error', response.error || 'ERROR AL CARGAR PERSONAL');
        }
        setLoading(false);
    };

    const aplicarFiltros = () => {
        let resultado = [...personal];

        // Filtro por búsqueda (nombre o cargo)
        if (busqueda) {
            const termino = busqueda.toLowerCase();
            resultado = resultado.filter(p =>
                p.nombreCompleto.toLowerCase().includes(termino) ||
                (p.cargo?.nombre || '').toLowerCase().includes(termino)
            );
        }

        // Filtro por estado
        if (filtroEstado === 'activos') {
            resultado = resultado.filter(p => p.activo);
        } else if (filtroEstado === 'inactivos') {
            resultado = resultado.filter(p => !p.activo);
        }

        setPersonalFiltrado(resultado);
    };

    const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje(null), 5000);
    };

    const handleNuevoPersonal = () => {
        setPersonalEditar(null);
        setMostrarFormulario(true);
    };

    const handleEditarPersonal = (p: Personal) => {
        setPersonalEditar(p);
        setMostrarFormulario(true);
    };

    const handleGuardarPersonal = async (data: PersonalInput, id?: string) => {
        let response;

        if (id) {
            response = await personalService.updatePersonal(id, data);
        } else {
            response = await personalService.createPersonal(data);
        }

        if (response.success) {
            mostrarMensaje('success', id ? 'PERSONAL ACTUALIZADO CORRECTAMENTE' : 'PERSONAL CREADO CORRECTAMENTE');
            setMostrarFormulario(false);
            cargarPersonal();
        } else {
            // Note: The error handling in FormularioPersonal will also catch this if we threw there,
            // but displaying a toast here is also good practice
            mostrarMensaje('error', response.error || 'ERROR AL GUARDAR PERSONAL');
        }
    };

    const handleEliminarClick = (p: Personal) => {
        setPersonalEliminar(p);
        setMostrarConfirmacion(true);
    };

    const handleConfirmarEliminar = async () => {
        if (!personalEliminar) return;

        const response = await personalService.deletePersonal(personalEliminar._id);

        if (response.success) {
            mostrarMensaje('success', 'PERSONAL ELIMINADO CORRECTAMENTE');
            setMostrarConfirmacion(false);
            setPersonalEliminar(null);
            cargarPersonal();
        } else {
            mostrarMensaje('error', response.error || 'ERROR AL ELIMINAR PERSONAL');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">👷 GESTIÓN DE PERSONAL</h2>
                    <p className="text-gray-600 mt-1">ADMINISTRA LOS EMPLEADOS OPERATIVOS</p>
                </div>
                {(userRol === 'admin' || userRol === 'supervisor') && (
                    <button
                        onClick={handleNuevoPersonal}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                        ➕ NUEVO PERSONAL
                    </button>
                )}
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`mb-4 p-4 rounded-lg ${mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Búsqueda */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">🔍 BUSCAR</label>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="NOMBRE O PUESTO..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    />
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
                    <p className="text-gray-600 mt-4">CARGANDO PERSONAL...</p>
                </div>
            ) : personalFiltrado.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">NO SE ENCONTRÓ PERSONAL</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold uppercase">NOMBRE</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">CARGO</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">TELÉFONO</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">PROYECTOS</th>
                                <th className="px-6 py-3 text-left font-semibold uppercase">ESTADO</th>
                                <th className="px-6 py-3 text-center font-semibold uppercase">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {personalFiltrado.map((p, index) => (
                                <tr
                                    key={p._id}
                                    className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800 uppercase">{p.nombreCompleto}</div>
                                        {p.numeroEmpleado && <div className="text-xs text-gray-500">#{p.numeroEmpleado}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 uppercase">{p.cargo?.nombre || 'SIN CARGO'}</td>
                                    <td className="px-6 py-4 text-gray-600">{p.telefono || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {p.proyectos && p.proyectos.length > 0 ? (
                                                p.proyectos.map((proj: any, idx: number) => (
                                                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-1">
                                                        {proj.nombre}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">SIN ASIGNACIÓN</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${p.activo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {p.activo ? '✓ ACTIVO' : '✗ BAJA'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-2">
                                            {(userRol === 'admin' || userRol === 'supervisor') && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditarPersonal(p)}
                                                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                                                        title="EDITAR"
                                                    >
                                                        ✏️
                                                    </button>
                                                </>
                                            )}
                                            {userRol === 'admin' && (
                                                <button
                                                    onClick={() => handleEliminarClick(p)}
                                                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                                                    title="ELIMINAR"
                                                >
                                                    🗑️
                                                </button>
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
                <FormularioPersonal
                    personal={personalEditar}
                    onClose={() => setMostrarFormulario(false)}
                    onGuardar={handleGuardarPersonal}
                />
            )}

            {/* Modal de Confirmación */}
            <ModalConfirmacion
                isOpen={mostrarConfirmacion}
                onClose={() => {
                    setMostrarConfirmacion(false);
                    setPersonalEliminar(null);
                }}
                onConfirm={handleConfirmarEliminar}
                title="CONFIRMAR ELIMINACIÓN"
                mensaje={
                    <span>
                        ¿ESTÁS SEGURO DE QUE DESEAS DAR DE BAJA A <strong>{personalEliminar?.nombreCompleto}</strong>?
                    </span>
                }
                confirmText="DAR DE BAJA"
                cancelText="CANCELAR"
            />
        </div>
    );
};

export default GestionPersonal;
