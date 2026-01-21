import React, { useState, useEffect } from 'react';
import { Personal, PersonalInput, CatCargo } from '../../types/personal';
import { cargosService } from '../../services/api';
import { proyectoService } from '../../services/api';
import { Proyecto } from '../../types/gestion';
import AutocompleteInput from '../shared/AutocompleteInput';

interface FormularioPersonalProps {
    personal?: Personal | null;
    onClose: () => void;
    onGuardar: (data: PersonalInput, id?: string) => Promise<void>;
}

const FormularioPersonal: React.FC<FormularioPersonalProps> = ({ personal, onClose, onGuardar }) => {
    const [formData, setFormData] = useState<PersonalInput>({
        nombreCompleto: '',
        cargoId: '',
        numeroEmpleado: '',
        telefono: '',
        email: '',
        fechaIngreso: '',
        activo: true,
        observaciones: '',
        fotoUrl: '',
        proyectos: []
    });

    const [cargos, setCargos] = useState<CatCargo[]>([]);
    const [cargoNombre, setCargoNombre] = useState(''); // Text input for autocomplete
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarCatalogos();
        if (personal) {
            setFormData({
                nombreCompleto: personal.nombreCompleto,
                cargoId: personal.cargoId,
                numeroEmpleado: personal.numeroEmpleado || '',
                telefono: personal.telefono || '',
                email: personal.email || '',
                fechaIngreso: personal.fechaIngreso ? new Date(personal.fechaIngreso).toISOString().split('T')[0] : '',
                activo: personal.activo,
                observaciones: personal.observaciones || '',
                fotoUrl: personal.fotoUrl || '',
                proyectos: personal.proyectos ? personal.proyectos.map((p: any) => p._id || p.id || p) : []
            });
        }
    }, [personal]);

    // Sync cargoNombre when cargos are loaded or personal is set
    useEffect(() => {
        if (personal && cargos.length > 0) {
            const cargo = cargos.find(c => c._id === personal.cargoId);
            if (cargo) setCargoNombre(cargo.nombre);
        }
    }, [personal, cargos]);

    const cargarCatalogos = async () => {
        try {
            const [resCargos, resProyectos] = await Promise.all([
                cargosService.getCargos(),
                proyectoService.obtenerProyectos()
            ]);

            if (resCargos.success && resCargos.data) {
                setCargos(resCargos.data);
            }
            if (resProyectos.success && resProyectos.data) {
                setProyectos(resProyectos.data);
            }
        } catch (err) {
            console.error("Error cargando catálogos", err);
            setError("Error al cargar cargos o proyectos");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCargoChange = (nombre: string) => {
        const nombreUpper = nombre.toUpperCase();
        setCargoNombre(nombreUpper);

        const cargo = cargos.find(c => c.nombre === nombreUpper);
        if (cargo) {
            setFormData(prev => ({ ...prev, cargoId: cargo._id }));
        } else {
            setFormData(prev => ({ ...prev, cargoId: '' })); // Reset ID if custom
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let finalCargoId = formData.cargoId;
            const nombreCargoFinal = cargoNombre.trim().toUpperCase();

            // Logic to create cargo if it doesn't exist
            if (!finalCargoId && nombreCargoFinal) {
                const existe = cargos.find(c => c.nombre === nombreCargoFinal);
                if (existe) {
                    finalCargoId = existe._id;
                } else {
                    const confirmar = window.confirm(`El cargo "${nombreCargoFinal}" no existe. ¿Desea crearlo ahora?`);
                    if (confirmar) {
                        const res = await cargosService.createCargo({ nombre: nombreCargoFinal });
                        if (res.success && res.data) {
                            finalCargoId = res.data._id;
                            setCargos(prev => [...prev, res.data!]);
                        } else {
                            throw new Error('Error al crear el cargo: ' + (res.error || 'Desconocido'));
                        }
                    } else {
                        setLoading(false);
                        return;
                    }
                }
            }

            if (!finalCargoId) {
                throw new Error('Debe seleccionar o crear un cargo válido');
            }

            // Save with valid ID
            await onGuardar({ ...formData, cargoId: finalCargoId }, personal?._id);
        } catch (err: any) {
            setError(err.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg md:max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-none">
                    <h3 className="text-xl font-bold">
                        {personal ? '✏️ EDITAR PERSONAL' : '➕ NUEVO PERSONAL'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre Completo */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">NOMBRE COMPLETO *</label>
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    required
                                    value={formData.nombreCompleto}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                    placeholder="NOMBRE COMPLETO DEL EMPLEADO"
                                />
                            </div>

                            {/* Cargo (Autocomplete) */}
                            <div>
                                <AutocompleteInput
                                    label="CARGO / PUESTO"
                                    value={cargoNombre}
                                    onChange={handleCargoChange}
                                    options={cargos.map(c => c.nombre)}
                                    placeholder="SELECCIONE O ESCRIBA..."
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    * Si el cargo no existe, se le preguntará si desea crearlo.
                                </p>
                            </div>

                            {/* Número de Empleado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NO. EMPLEADO</label>
                                <input
                                    type="text"
                                    name="numeroEmpleado"
                                    value={formData.numeroEmpleado}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                    placeholder="EJ: 12345"
                                />
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TELÉFONO</label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="EJ: 55 1234 5678"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CORREO ELECTRÓNICO</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 lowercase"
                                    placeholder="usuario@empresa.com"
                                />
                            </div>

                            {/* Fecha Ingreso */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FECHA INGRESO</label>
                                <input
                                    type="date"
                                    name="fechaIngreso"
                                    value={formData.fechaIngreso}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Activo */}
                            <div className="flex items-center mt-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-700 font-medium">ACTIVO</span>
                                </label>
                            </div>

                            {/* Proyectos Asignados */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">PROYECTOS ASIGNADOS</label>
                                <select
                                    multiple
                                    value={formData.proyectos}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData({ ...formData, proyectos: selected });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
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

                            {/* Observaciones */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">OBSERVACIONES</label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                    rows={3}
                                    placeholder="OBSERVACIONES ADICIONALES..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                            disabled={loading}
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md active:bg-blue-800 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'GUARDANDO...' : (personal ? 'ACTUALIZAR' : 'GUARDAR')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormularioPersonal;
