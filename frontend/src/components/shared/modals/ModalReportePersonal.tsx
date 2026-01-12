import React, { useState, useEffect } from 'react';
import { Personal, CatCargo, ReportePersonal } from '../../../types/personal';

interface ModalReportePersonalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ReportePersonal) => void;
    dataInicial: ReportePersonal | null;
    personalDisponibles: Personal[];
    cargosDisponibles: CatCargo[];
}

const ModalReportePersonal: React.FC<ModalReportePersonalProps> = ({
    isOpen,
    onClose,
    onSave,
    dataInicial,
    personalDisponibles,
    cargosDisponibles
}) => {
    const [formData, setFormData] = useState<ReportePersonal>({
        personalId: '',
        cargoId: '',
        actividadRealizada: '',
        horasTrabajadas: 0,
        observaciones: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (dataInicial) {
            setFormData(dataInicial);
            const personalSeleccionado = personalDisponibles.find(p => p._id === dataInicial.personalId);
            setSearchTerm(personalSeleccionado ? personalSeleccionado.nombreCompleto : '');
        } else {
            setFormData({
                personalId: '',
                cargoId: '',
                actividadRealizada: '',
                horasTrabajadas: 0,
                observaciones: ''
            });
            setSearchTerm('');
        }
        setShowSuggestions(false);
    }, [dataInicial, isOpen, personalDisponibles]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setSearchTerm(value);
        setShowSuggestions(true);
        // Reset personalId if user modifies the search, forcing them to select a valid option
        setFormData(prev => ({ ...prev, personalId: '', cargoId: '' }));
    };

    const handleSelectPersonal = (personal: Personal) => {
        setSearchTerm(personal.nombreCompleto);
        const cargoIdToUse = personal.cargoId || personal.cargo?._id || '';
        setFormData(prev => ({
            ...prev,
            personalId: personal._id,
            cargoId: cargoIdToUse
        }));
        setShowSuggestions(false);
    };

    const filteredPersonal = personalDisponibles.filter(p =>
        p.nombreCompleto.toUpperCase().includes(searchTerm)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-6 border-b bg-green-50 rounded-t-lg flex-none">
                    <h3 className="text-xl font-bold text-green-800">
                        {dataInicial ? '✏️ EDITAR PERSONAL' : '➕ ASIGNAR PERSONAL'}
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Personal Selection - Searchable */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PERSONAL *
                                {formData.personalId && (
                                    <span className="ml-2 text-green-600 text-xs">✓ SELECCIONADO</span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="BUSCAR PERSONAL..."
                                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 uppercase ${
                                        formData.personalId
                                            ? 'border-green-500 bg-green-50 focus:ring-green-500'
                                            : 'border-gray-300 focus:ring-green-500'
                                    }`}
                                    autoComplete="off"
                                />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    🔍
                                </span>
                            </div>
                            {showSuggestions && searchTerm && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                    {filteredPersonal.length > 0 ? (
                                        filteredPersonal.map(p => (
                                            <li
                                                key={p._id}
                                                onClick={() => handleSelectPersonal(p)}
                                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm border-b last:border-b-0 uppercase"
                                            >
                                                <div className="font-semibold">{p.nombreCompleto}</div>
                                                {p.cargo && (
                                                    <div className="text-xs text-gray-500">{p.cargo.nombre}</div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-gray-500 text-sm">NO SE ENCONTRARON RESULTADOS</li>
                                    )}
                                </ul>
                            )}
                            {!formData.personalId && searchTerm && <div className="text-red-500 text-xs mt-1">SELECCIONE UNA PERSONA DE LA LISTA</div>}
                        </div>

                        {/* Cargo Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CARGO / PUESTO *</label>
                            <select
                                value={formData.cargoId}
                                onChange={(e) => setFormData({ ...formData, cargoId: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                            >
                                <option value="">SELECCIONE CARGO</option>
                                {cargosDisponibles.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Actividad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ACTIVIDAD REALIZADA</label>
                            <input
                                type="text"
                                value={formData.actividadRealizada}
                                onChange={(e) => setFormData({ ...formData, actividadRealizada: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                                placeholder="EJ: SUPERVISIÓN DE OBRA"
                            />
                        </div>

                        {/* Horas Trabajadas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">HORAS TRABAJADAS</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.horasTrabajadas}
                                onChange={(e) => setFormData({ ...formData, horasTrabajadas: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="0"
                            />
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OBSERVACIONES</label>
                            <input
                                type="text"
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                                placeholder="OBSERVACIONES..."
                            />
                        </div>

                    </form>
                </div>

                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg flex-none">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                        CANCELAR
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!formData.personalId || !formData.cargoId}
                        className={`px-4 py-2 rounded-lg font-semibold shadow-md text-white ${(!formData.personalId || !formData.cargoId)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        GUARDAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalReportePersonal;
