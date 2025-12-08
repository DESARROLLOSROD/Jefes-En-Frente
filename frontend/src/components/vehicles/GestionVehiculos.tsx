import React, { useState, useEffect } from 'react';
import { vehiculoService, proyectoService } from '../../services/api';
import { Vehiculo, Proyecto } from '../../types/gestion';
import { generarPDFVehiculos } from '../../utils/pdfVehiculosGenerator';
import ModalConfirmacion from '../shared/modals/ModalConfirmacion';

interface GestionVehiculosProps {
    userRol?: 'admin' | 'supervisor' | 'operador';
}

const GestionVehiculos: React.FC<GestionVehiculosProps> = ({ userRol = 'admin' }) => {
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
        horasOperacion: 0,
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
            setError(response.error || 'ERROR AL CARGAR VEHÍCULOS');
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
            mostrarMensaje(editando ? 'VEHÍCULO ACTUALIZADO CORRECTAMENTE' : 'VEHÍCULO CREADO CORRECTAMENTE');
            cerrarModal();
            cargarVehiculos();
        } else {
            mostrarMensaje(response.error || 'ERROR AL GUARDAR VEHÍCULO');
        }
    };

    const [confirmacionOpen, setConfirmacionOpen] = useState(false);
    const [vehiculoEliminar, setVehiculoEliminar] = useState<string | null>(null);

    const handleEliminarClick = (id: string) => {
        setVehiculoEliminar(id);
        setConfirmacionOpen(true);
    };

    const handleConfirmarEliminar = async () => {
        if (!vehiculoEliminar) return;

        const response = await vehiculoService.eliminarVehiculo(vehiculoEliminar);
        if (response.success) {
            mostrarMensaje('VEHÍCULO ELIMINADO CORRECTAMENTE');
            cargarVehiculos();
        } else {
            mostrarMensaje(response.error || 'ERROR AL ELIMINAR VEHÍCULO');
        }
        setConfirmacionOpen(false);
        setVehiculoEliminar(null);
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
                horasOperacion: vehiculo.horasOperacion || 0,
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
                horasOperacion: 0,
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
                <p className="mt-2 text-gray-600">CARGANDO VEHÍCULOS...</p>
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
                    <strong>ERROR:</strong> {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">🚙 GESTIÓN DE VEHÍCULOS</h2>
                    <button
                        onClick={() => abrirModal()}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                        ➕ NUEVO VEHÍCULO
                    </button>
                    <button
                        onClick={() => generarPDFVehiculos(vehiculos)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold ml-2"
                    >
                        📄 REPORTE PDF
                    </button>
                </div>

                {vehiculos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚗</div>
                        <p className="text-gray-600 text-lg">NO HAY VEHÍCULOS REGISTRADOS</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NOMBRE</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIPO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NO. ECONÓMICO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HORÓMETRO INICIAL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HORÓMETRO FINAL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HORAS OPERACIÓN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PROYECTOS</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACCIONES</th>
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
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {vehiculo.horasOperacion ? vehiculo.horasOperacion.toLocaleString() : '0'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {Array.isArray(vehiculo.proyectos) && vehiculo.proyectos.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {vehiculo.proyectos.map((p: any, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            {typeof p === 'object' && p.nombre ? p.nombre : 'PROYECTO'}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">SIN ASIGNAR</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            {userRol === 'admin' && (
                                                <>
                                                    <button
                                                        onClick={() => abrirModal(vehiculo)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        ✏️ EDITAR
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarClick(vehiculo._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        🗑️ ELIMINAR
                                                    </button>
                                                </>
                                            )}
                                            {userRol === 'supervisor' && (
                                                <span className="text-gray-400 text-sm italic">SOLO LECTURA</span>
                                            )}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {editando ? '✏️ EDITAR VEHÍCULO' : '➕ NUEVO VEHÍCULO'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NOMBRE *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                                        placeholder="EJ: EXCAVADORA CAT 320"
                                    />
                                </div>
                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">TIPO *</label>
                                    <select
                                        required
                                        value={formData.tipo}
                                        onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="Camioneta">CAMIONETA</option>
                                        <option value="Camión">CAMIÓN</option>
                                        <option value="Maquinaria">MAQUINARIA</option>
                                        <option value="Otro">OTRO</option>
                                    </select>
                                </div>
                                {/* No. Económico */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NO. ECONÓMICO *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.noEconomico}
                                        onChange={e => setFormData({ ...formData, noEconomico: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                                        placeholder="NO. ECONÓMICO"
                                    />
                                </div>
                                {/* Horómetro Inicial */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        HORÓMETRO INICIAL *{editando && <span className="text-xs text-gray-500"> (SE ACTUALIZA AUTOMÁTICAMENTE DESDE REPORTES)</span>}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.horometroInicial}
                                        readOnly={editando}
                                        onChange={e => setFormData({ ...formData, horometroInicial: Number(e.target.value) })}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${editando ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-orange-500'}`}
                                        placeholder="0"
                                    />
                                </div>
                                {/* Horómetro Final */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">HORÓMETRO FINAL *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.horometroFinal}
                                        onChange={e => setFormData({ ...formData, horometroFinal: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                        placeholder="0"
                                    />
                                </div>
                                {/* Horas de Operación */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">HORAS DE OPERACIÓN</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.horasOperacion}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        placeholder="0"
                                    />
                                </div>
                                {/* Proyectos Asignados */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PROYECTOS ASIGNADOS</label>
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
                                        MANTÉN PRESIONADO CTRL (WINDOWS) O CMD (MAC) PARA SELECCIONAR MÚLTIPLES PROYECTOS
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                >
                                    {editando ? 'ACTUALIZAR' : 'CREAR'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ModalConfirmacion
                isOpen={confirmacionOpen}
                onClose={() => {
                    setConfirmacionOpen(false);
                    setVehiculoEliminar(null);
                }}
                onConfirm={handleConfirmarEliminar}
                title="CONFIRMAR ELIMINACIÓN DE VEHÍCULO"
                mensaje={
                    <span>
                        ¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR ESTE VEHÍCULO?
                        <br />
                        <span className="text-red-600 font-semibold">ESTA ACCIÓN NO SE PUEDE DESHACER.</span>
                    </span>
                }
                confirmText="ELIMINAR"
                cancelText="CANCELAR"
            />
        </div>
    );
};

export default GestionVehiculos;
