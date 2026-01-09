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

    useEffect(() => {
        if (dataInicial) {
            setFormData(dataInicial);
        } else {
            setFormData({
                personalId: '',
                cargoId: '',
                actividadRealizada: '',
                horasTrabajadas: 0,
                observaciones: ''
            });
        }
    }, [dataInicial, isOpen]);

    const handlePersonalChange = (id: string) => {
        const persona = personalDisponibles.find(p => p._id === id);
        setFormData(prev => ({
            ...prev,
            personalId: id,
            cargoId: persona?.cargoId || prev.cargoId
        }));
    };

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
                        {/* Personal Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PERSONAL *</label>
                            <select
                                value={formData.personalId}
                                onChange={(e) => handlePersonalChange(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                            >
                                <option value="">SELECCIONE PERSONAL</option>
                                {personalDisponibles.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.nombreCompleto}
                                    </option>
                                ))}
                            </select>
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

                        {/* Botones - Dentro del scroll o fuera? Mejor fuera (Footer fijo) o al final del scroll.
                            En este caso, si queremos que esté siempre visible, movemos a un div externo.
                            Si lo dejamos aquí, scrolleará con el contenido.
                            Viendo el otro modal, el footer está fijo. Hagamos footer fijo aquí también.
                        */}
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
                        onClick={handleSubmit} // Submit trigger form? No, button is outside form. Must change logic.
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md"
                    >
                        GUARDAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalReportePersonal;
