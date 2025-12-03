import React, { useState, useEffect } from 'react';
import { proyectoService } from '../../services/api';
import { Proyecto } from '../../types/gestion';
import { useAuth } from '../../contexts/AuthContext';
import { comprimirImagen, formatearTamano, calcularReduccion } from '../../utils/imageCompressor';
import BibliotecaMapas from '../mapas/BibliotecaMapas';
import { BibliotecaMapa } from '../../services/bibliotecaMapa.service';

const GestionProyectos: React.FC = () => {
    const { actualizarProyecto } = useAuth();
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        ubicacion: '',
        descripcion: '',
        mapa: undefined as { imagen: { data: string; contentType: string }; width: number; height: number } | undefined
    });
    const [previewMapa, setPreviewMapa] = useState<string>('');
    const [comprimiendo, setComprimiendo] = useState(false);
    const [infoCompresion, setInfoCompresion] = useState<{ original: number; comprimido: number } | null>(null);
    const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);

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
            setError(response.error || 'ERROR AL CARGAR PROYECTOS');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (proyectoEditar) {
            const response = await proyectoService.actualizarProyecto(proyectoEditar._id, formData);
            if (response.success && response.data) {
                // Actualizar el proyecto en el contexto si es el proyecto actual
                actualizarProyecto(response.data);
                cargarProyectos();
                cerrarModal();
            } else {
                alert(response.error || 'ERROR AL ACTUALIZAR PROYECTO');
            }
        } else {
            const response = await proyectoService.crearProyecto(formData);
            if (response.success) {
                cargarProyectos();
                cerrarModal();
            } else {
                alert(response.error || 'ERROR AL CREAR PROYECTO');
            }
        }
    };

    const handleEliminar = async (id: string) => {
        if (window.confirm('¿ESTÁS SEGURO DE ELIMINAR ESTE PROYECTO?')) {
            const response = await proyectoService.eliminarProyecto(id);
            if (response.success) {
                cargarProyectos();
            } else {
                alert(response.error || 'ERROR AL ELIMINAR PROYECTO');
            }
        }
    };

    const abrirModal = (proyecto?: Proyecto) => {
        if (proyecto) {
            setProyectoEditar(proyecto);
            setFormData({
                nombre: proyecto.nombre,
                ubicacion: proyecto.ubicacion,
                descripcion: proyecto.descripcion,
                mapa: (proyecto as any).mapa
            });
            // Si el proyecto tiene mapa, mostrar preview
            if ((proyecto as any).mapa?.imagen?.data) {
                setPreviewMapa(`data:${(proyecto as any).mapa.imagen.contentType};base64,${(proyecto as any).mapa.imagen.data}`);
            } else {
                setPreviewMapa('');
            }
        } else {
            setProyectoEditar(null);
            setFormData({
                nombre: '',
                ubicacion: '',
                descripcion: '',
                mapa: undefined
            });
            setPreviewMapa('');
        }
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setProyectoEditar(null);
        setPreviewMapa('');
    };

    const handleMapaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (10MB máximo para archivo original)
        if (file.size > 10 * 1024 * 1024) {
            alert('LA IMAGEN NO DEBE SUPERAR 10MB');
            return;
        }

        // Validar tipo
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            alert('SOLO SE PERMITEN IMÁGENES PNG O JPG');
            return;
        }

        try {
            setComprimiendo(true);

            // Comprimir imagen automáticamente
            const resultado = await comprimirImagen(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.85
            });

            setFormData({
                ...formData,
                mapa: {
                    imagen: {
                        data: resultado.base64,
                        contentType: resultado.contentType
                    },
                    width: resultado.width,
                    height: resultado.height
                }
            });

            setPreviewMapa(`data:${resultado.contentType};base64,${resultado.base64}`);
            setInfoCompresion({
                original: resultado.tamanioOriginal,
                comprimido: resultado.tamanioComprimido
            });
        } catch (error) {
            console.error('Error al comprimir imagen:', error);
            alert('ERROR AL PROCESAR LA IMAGEN');
        } finally {
            setComprimiendo(false);
        }
    };

    const eliminarMapa = () => {
        setFormData({ ...formData, mapa: undefined });
        setPreviewMapa('');
        setInfoCompresion(null);
    };

    const seleccionarMapaBiblioteca = (mapa: BibliotecaMapa) => {
        setFormData({
            ...formData,
            mapa: {
                imagen: mapa.imagen,
                width: mapa.width,
                height: mapa.height
            }
        });
        setPreviewMapa(`data:${mapa.imagen.contentType};base64,${mapa.imagen.data}`);
        setMostrarBiblioteca(false);
    };

    if (loading) return <div className="text-center p-8">CARGANDO PROYECTOS...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">GESTIÓN DE PROYECTOS</h2>
                <button
                    onClick={() => abrirModal()}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                    + NUEVO PROYECTO
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
                                EDITAR
                            </button>
                            <button
                                onClick={() => handleEliminar(proyecto._id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                ELIMINAR
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">
                            {proyectoEditar ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    NOMBRE *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                                    className="w-full border rounded px-3 py-2 uppercase"
                                    placeholder="NOMBRE DEL PROYECTO"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    UBICACIÓN *
                                </label>
                                <input
                                    type="text"
                                    value={formData.ubicacion}
                                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value.toUpperCase() })}
                                    className="w-full border rounded px-3 py-2 uppercase"
                                    placeholder="UBICACIÓN DEL PROYECTO"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    DESCRIPCIÓN *
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                                    className="w-full border rounded px-3 py-2 uppercase"
                                    rows={3}
                                    placeholder="DESCRIPCIÓN DEL PROYECTO"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2 uppercase">
                                    MAPA DEL PROYECTO (Opcional)
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    PNG o JPG, máximo 10MB (se comprimirá automáticamente)
                                </p>
                                {comprimiendo && (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-3">
                                        COMPRIMIENDO IMAGEN...
                                    </div>
                                )}
                                {previewMapa ? (
                                    <div className="relative">
                                        <img src={previewMapa} alt="Preview mapa" className="w-full h-48 object-contain border rounded bg-gray-50" />
                                        {infoCompresion && (
                                            <div className="mt-2 text-xs text-gray-600 bg-green-50 p-2 rounded">
                                                TAMAÑO ORIGINAL: {formatearTamano(infoCompresion.original)} →
                                                COMPRIMIDO: {formatearTamano(infoCompresion.comprimido)}
                                                ({calcularReduccion(infoCompresion.original, infoCompresion.comprimido)}% REDUCIDO)
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={eliminarMapa}
                                            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                            ELIMINAR
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            onChange={handleMapaChange}
                                            className="w-full border rounded px-3 py-2 mb-2"
                                            disabled={comprimiendo}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarBiblioteca(true)}
                                            className="w-full bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
                                        >
                                            SELECCIONAR DESDE BIBLIOTECA
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                                >
                                    GUARDAR
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de biblioteca de mapas */}
            {mostrarBiblioteca && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-6xl w-full m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">SELECCIONAR MAPA DE BIBLIOTECA</h3>
                            <button
                                onClick={() => setMostrarBiblioteca(false)}
                                className="text-gray-600 hover:text-gray-800 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        <BibliotecaMapas
                            onSeleccionarMapa={seleccionarMapaBiblioteca}
                            modoSeleccion={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionProyectos;
