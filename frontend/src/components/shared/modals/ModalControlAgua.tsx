import React, { useState, useEffect } from 'react';
import { ControlAgua } from '../../../types/reporte';
import AutocompleteInput from '../AutocompleteInput';
import { ORIGENES, DESTINOS, CAPACIDADES_CAMION } from '../../../constants/reporteConstants';

interface ModalControlAguaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agua: ControlAgua) => void;
  aguaInicial?: ControlAgua | null;
  title?: string;
}

const ModalControlAgua: React.FC<ModalControlAguaProps> = ({
  isOpen,
  onClose,
  onSave,
  aguaInicial,
  title = 'AGREGAR CONTROL DE AGUA'
}) => {
  const [formData, setFormData] = useState<ControlAgua>({
    noEconomico: '',
    viaje: 0,
    capacidad: '',
    volumen: '',
    origen: '',
    destino: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (aguaInicial) {
      setFormData(aguaInicial);
    } else {
      setFormData({
        noEconomico: '',
        viaje: 0,
        capacidad: '',
        volumen: '',
        origen: '',
        destino: ''
      });
    }
    setErrors({});
  }, [aguaInicial, isOpen]);

  // Cálculo automático reactivo: Viajes × Capacidad = Volumen
  useEffect(() => {
    const viaje = Number(formData.viaje);
    const capacidad = Number(formData.capacidad);

    if (!isNaN(viaje) && !isNaN(capacidad) && viaje > 0 && capacidad > 0) {
      const volumenCalculado = (viaje * capacidad).toFixed(2);
      setFormData(prev => ({ ...prev, volumen: volumenCalculado }));
    } else if (viaje === 0 || capacidad === 0) {
      setFormData(prev => ({ ...prev, volumen: '0.00' }));
    }
  }, [formData.viaje, formData.capacidad]);

  const handleChange = (campo: keyof ControlAgua, valor: string | number) => {
    // Convertir a mayúsculas si es texto
    const valorFinal = typeof valor === 'string' ? valor.toUpperCase() : valor;
    setFormData(prev => ({ ...prev, [campo]: valorFinal }));
    if (errors[campo]) {
      setErrors(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.noEconomico.trim()) {
      newErrors.noEconomico = 'EL NÚMERO ECONÓMICO ES REQUERIDO';
    }
    if (!formData.viaje || formData.viaje <= 0) {
      newErrors.viaje = 'EL NÚMERO DE VIAJES DEBE SER MAYOR A 0';
    }
    if (!formData.capacidad || Number(formData.capacidad) <= 0) {
      newErrors.capacidad = 'LA CAPACIDAD DEBE SER MAYOR A 0';
    }
    if (!formData.origen.trim()) {
      newErrors.origen = 'EL ORIGEN ES REQUERIDO';
    }
    if (!formData.destino.trim()) {
      newErrors.destino = 'EL DESTINO ES REQUERIDO';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('🔵 MODAL AGUA handleSubmit llamado');
    console.log('📝 FormData del modal:', formData);

    if (validateForm()) {
      console.log('✅ Validación pasada, llamando onSave');
      onSave(formData);
      console.log('🚪 Cerrando modal');
      onClose();
    } else {
      console.log('❌ Validación falló');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl font-bold"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* No. Económico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NO. ECONÓMICO <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.noEconomico}
                onChange={(e) => handleChange('noEconomico', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
                placeholder="EJ: 001, A-123..."
              />
              {errors.noEconomico && (
                <p className="text-red-500 text-xs mt-1">{errors.noEconomico}</p>
              )}
            </div>

            {/* Número de Viajes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NO. DE VIAJES <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.viaje}
                onChange={(e) => handleChange('viaje', Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="0"
                min="0"
              />
              {errors.viaje && (
                <p className="text-red-500 text-xs mt-1">{errors.viaje}</p>
              )}
            </div>

            {/* Capacidad */}
            <div>
              <AutocompleteInput
                label="CAPACIDAD (M³)"
                value={formData.capacidad}
                onChange={(value) => handleChange('capacidad', value)}
                options={CAPACIDADES_CAMION}
                placeholder="SELECCIONE CAPACIDAD..."
                required
              />
              {errors.capacidad && (
                <p className="text-red-500 text-xs mt-1">{errors.capacidad}</p>
              )}
            </div>

            {/* Volumen (Calculado automáticamente) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VOLUMEN (M³) <span className="text-cyan-500 text-xs">(CALCULADO)</span>
              </label>
              <input
                type="text"
                value={formData.volumen}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed font-bold text-cyan-600"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                FÓRMULA: NO. VIAJES × CAPACIDAD = {formData.volumen || '0.00'} M³
              </p>
            </div>

            {/* Origen */}
            <div>
              <AutocompleteInput
                label="ORIGEN"
                value={formData.origen}
                onChange={(value) => handleChange('origen', value)}
                options={ORIGENES}
                placeholder="SELECCIONE O ESCRIBA EL ORIGEN..."
                required
              />
              {errors.origen && (
                <p className="text-red-500 text-xs mt-1">{errors.origen}</p>
              )}
            </div>

            {/* Destino */}
            <div>
              <AutocompleteInput
                label="DESTINO"
                value={formData.destino}
                onChange={(value) => handleChange('destino', value)}
                options={DESTINOS}
                placeholder="SELECCIONE O ESCRIBA EL DESTINO..."
                required
              />
              {errors.destino && (
                <p className="text-red-500 text-xs mt-1">{errors.destino}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold shadow-md"
            >
              GUARDAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalControlAgua;
