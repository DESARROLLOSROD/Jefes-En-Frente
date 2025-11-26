import React, { useState, useEffect } from 'react';
import { proyectoService } from '../services/api';
import { Proyecto } from '../types/gestion';

const GestionProyectos: React.FC = () => {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarProyectos();
    }, []);

    const cargarProyectos = async () => {
        setLoading(true);
        const response = await proyectoService.obtenerProyectos();
        if (response.success && response.data) {
            setProyectos(response.data);
            setError('');
        } else {
            setError(response.error || 'Error al cargar proyectos');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (proyectoEditar) {
            const response = await proyectoService.actualizarProyecto(proyectoEditar._id, formData);
            if (response.success) {
                cargarProyectos();
                cerrarModal();
            } else {
                alert(response.error || 'Error al actualizar proyecto');
            }
        } else {
            const response = await proyectoService.crearProyecto(formData);
            if (response.success) {
                cargarProyectos();
                cerrarModal();
            } else {
                alert(response.error || 'Error al crear proyecto');
            }
        }
    };

    const handleEliminar = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            const response = await proyectoService.eliminarProyecto(id);
            if (response.success) {
                cargarProyectos();
            } else {
                alert(response.error || 'Error al eliminar proyecto');
            }
        }
    };

    const abrirModal = (proyecto?: Proyecto) => {
        if (proyecto) {
            setProyectoEditar(proyecto);
            setFormData({
                nombre: proyecto.nombre,
                ubicacion: proyecto.ubicacion,
                descripcion: proyecto.descripcion
            });
        } else {
            setProyectoEditar(null);
            setFormData({
                nombre: '',
                ubicacion: '',
                descripcion: ''
            });
        }
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setProyectoEditar(null);
    };

    if (loading) return <div className="text-center p-8">Cargando proyectos...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h2>
                <button
                    onClick={() => abrirModal()}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                    + Nuevo Proyecto
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proyectos.map((proyecto) => (
                    <div key={proyecto._id} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{proyecto.nombre}</h3>
                        <p className="text-gray-600 mb-2">📍 {proyecto.ubicacion}</p>
                        <p className="text-gray-500 mb-4 text-sm">{proyecto.descripcion}</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => abrirModal(proyecto)}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleEliminar(proyecto._id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">
                            {proyectoEditar ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full border rounded px-3 py-2 uppercase"
                                    placeholder="Nombre del proyecto"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    Ubicación *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ubicacion}
                                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                                    className="w-full border rounded px-3 py-2 uppercase"
                                    placeholder="Ubicación del proyecto"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    Descripción *
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full border rounded px-3 py-2 uppercase"
                                    rows={3}
                                    placeholder="Descripción del proyecto"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionProyectos;
