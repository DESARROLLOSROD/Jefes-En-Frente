import React, { useState, useEffect } from 'react';
import { vehiculoService, proyectoService } from '../services/api';
import { Vehiculo, Proyecto } from '../types/gestion';

const GestionVehiculos: React.FC = () => {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(false);
    const [vehiculoActual, setVehiculoActual] = useState<Vehiculo | null>(null);
    const [alertMessage, setAlertMessage] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'Camioneta' as 'Camioneta' | 'Camión' | 'Maquinaria' | 'Otro',
        horometroInicial: 0,
        horometroFinal: 0,
        noEconomico: '',
        proyectos: [] as string[],
    });

    useEffect(() => {
        cargarVehiculos();
        cargarProyectos();
    }, []);

    const cargarVehiculos = async () => {
        setLoading(true);
        const response = await vehiculoService.obtenerVehiculos();
        if (response.success && response.data) {
            setVehiculos(response.data);
            setError('');
        } else {
            setError(response.error || 'Error al cargar vehículos');
        }
        setLoading(false);
    };

    const cargarProyectos = async () => {
        const response = await proyectoService.obtenerProyectos();
        if (response.success && response.data) {
            setProyectos(response.data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = editando && vehiculoActual
            ? await vehiculoService.actualizarVehiculo(vehiculoActual._id, formData)
            : await vehiculoService.crearVehiculo(formData);
        if (response.success) {
            mostrarMensaje(editando ? 'Vehículo actualizado correctamente' : 'Vehículo creado correctamente');
            cerrarModal();
            cargarVehiculos();
        } else {
            mostrarMensaje(response.error || 'Error al guardar vehículo');
        }
    };

    const handleEliminar = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este vehículo?')) {
            const response = await vehiculoService.eliminarVehiculo(id);
            if (response.success) {
                mostrarMensaje('Vehículo eliminado correctamente');
                cargarVehiculos();
            } else {
                mostrarMensaje(response.error || 'Error al eliminar vehículo');
            }
        }
    };

    const abrirModal = (vehiculo?: Vehiculo) => {
        if (vehiculo) {
            setEditando(true);
            setVehiculoActual(vehiculo);
            setFormData({
                nombre: vehiculo.nombre,
                tipo: vehiculo.tipo,
                horometroInicial: vehiculo.horometroInicial,
                horometroFinal: vehiculo.horometroFinal || 0,
                noEconomico: vehiculo.noEconomico,
                proyectos: Array.isArray(vehiculo.proyectos) ? vehiculo.proyectos.map(p => typeof p === 'string' ? p : p._id) : [],
            });
        } else {
            setEditando(false);
            setVehiculoActual(null);
            setFormData({
                nombre: '',
                tipo: 'Camioneta',
                horometroInicial: 0,
                horometroFinal: 0,
                noEconomico: '',
                proyectos: [],
            });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setEditando(false);
        setVehiculoActual(null);
    };

    const mostrarMensaje = (texto: string) => {
        setAlertMessage(texto);
        setTimeout(() => setAlertMessage(''), 5000);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando vehículos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {alertMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {alertMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">🚙 Gestión de Vehículos</h2>
                    <button
                        onClick={() => abrirModal()}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                        ➕ Nuevo Vehículo
                    </button>
                </div>

                {vehiculos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚗</div>
                        <p className="text-gray-600 text-lg">No hay vehículos registrados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Económico</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horómetro Inicial</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horómetro Final</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {vehiculos.map(vehiculo => (
                                    <tr key={vehiculo._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{vehiculo.nombre}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {vehiculo.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{vehiculo.noEconomico}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{vehiculo.horometroInicial.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {vehiculo.horometroFinal ? vehiculo.horometroFinal.toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => abrirModal(vehiculo)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(vehiculo._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editando ? '✏️ Editar Vehículo' : '➕ Nuevo Vehículo'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                                        placeholder="Ej: Excavadora CAT 320"
                                    />
                                </div>
                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                    <select
                                        required
                                        value={formData.tipo}
                                        onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="Camioneta">Camioneta</option>
                                        <option value="Camión">Camión</option>
                                        <option value="Maquinaria">Maquinaria</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                {/* No. Económico */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Económico *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.noEconomico}
                                        onChange={e => setFormData({ ...formData, noEconomico: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                                        placeholder="No. Económico"
                                    />
                                </div>
                                {/* Horómetro Inicial */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Horómetro Inicial *{editando && <span className="text-xs text-gray-500"> (Se actualiza automáticamente desde reportes)</span>}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.horometroInicial}
                                        onChange={e => setFormData({ ...formData, horometroInicial: Number(e.target.value) })}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${editando ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-orange-500'}`}
                                        placeholder="0"
                                    />
                                </div>
                                {/* Horómetro Final */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Horómetro Final *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.horometroFinal}
                                        readOnly={editando}
                                        onChange={e => setFormData({ ...formData, horometroFinal: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="0"
                                    />
                                </div>
                                {/* Proyectos Asignados */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proyectos Asignados</label>
                                    <select
                                        multiple
                                        value={formData.proyectos}
                                        onChange={e => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData({ ...formData, proyectos: selected });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 h-32"
                                    >
                                        {proyectos.map(proyecto => (
                                            <option key={proyecto._id} value={proyecto._id}>
                                                {proyecto.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples proyectos
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    {editando ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionVehiculos;
