import React, { useState, useEffect } from 'react';
import { ControlAcarreo } from '../../../types/reporte';
import AutocompleteInput from '../AutocompleteInput';
import { MATERIALES, ORIGENES, DESTINOS, CAPACIDADES_CAMION } from '../../../constants/reporteConstants';

interface ModalControlAcarreoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acarreo: ControlAcarreo) => void;
  acarreoInicial?: ControlAcarreo | null;
  title?: string;
}

const ModalControlAcarreo: React.FC<ModalControlAcarreoProps> = ({
  isOpen,
  onClose,
  onSave,
  acarreoInicial,
  title = 'AGREGAR CONTROL DE ACARREO'
}) => {
  const [formData, setFormData] = useState<ControlAcarreo>({
    material: '',
    noViaje: 0,
    capacidad: '',
    volSuelto: '',
    capaNo: '',
    elevacionAriza: '',
    capaOrigen: '',
    destino: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (acarreoInicial) {
      setFormData(acarreoInicial);
    } else {
      // Reset form when modal opens without initial data
      setFormData({
        material: '',
        noViaje: 0,
        capacidad: '',
        volSuelto: '',
        capaNo: '',
        elevacionAriza: '',
        capaOrigen: '',
        destino: ''
      });
    }
    setErrors({});
  }, [acarreoInicial, isOpen]);

  // Cálculo automático reactivo: No. Viajes × Capacidad = Volumen Suelto
  useEffect(() => {
    const noViaje = Number(formData.noViaje);
    const capacidad = Number(formData.capacidad);

    if (!isNaN(noViaje) && !isNaN(capacidad) && noViaje > 0 && capacidad > 0) {
      const volumenCalculado = (noViaje * capacidad).toFixed(2);
      setFormData(prev => ({ ...prev, volSuelto: volumenCalculado }));
    } else if (noViaje === 0 || capacidad === 0) {
      setFormData(prev => ({ ...prev, volSuelto: '0.00' }));
    }
  }, [formData.noViaje, formData.capacidad]);

  const handleChange = (campo: keyof ControlAcarreo, valor: string | number) => {
    // Convertir a mayúsculas si es texto
    const valorFinal = typeof valor === 'string' ? valor.toUpperCase() : valor;
    setFormData(prev => ({ ...prev, [campo]: valorFinal }));
    // Limpiar error del campo al modificarlo
    if (errors[campo]) {
      setErrors(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.material.trim()) {
      newErrors.material = 'EL MATERIAL ES REQUERIDO';
    }
    if (!formData.noViaje || formData.noViaje <= 0) {
      newErrors.noViaje = 'EL NÚMERO DE VIAJES DEBE SER MAYOR A 0';
    }
    if (!formData.capacidad || Number(formData.capacidad) <= 0) {
      newErrors.capacidad = 'LA CAPACIDAD DEBE SER MAYOR A 0';
    }
    if (!formData.capaOrigen.trim()) {
      newErrors.capaOrigen = 'EL ORIGEN ES REQUERIDO';
    }
    if (!formData.destino.trim()) {
      newErrors.destino = 'EL DESTINO ES REQUERIDO';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material */}
            <div>
              <AutocompleteInput
                label="MATERIAL"
                value={formData.material}
                onChange={(value) => handleChange('material', value)}
                options={MATERIALES}
                placeholder="SELECCIONE O ESCRIBA EL MATERIAL..."
                required
              />
              {errors.material && (
                <p className="text-red-500 text-xs mt-1">{errors.material}</p>
              )}
            </div>

            {/* Número de Viajes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NO. DE VIAJES <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.noViaje}
                onChange={(e) => handleChange('noViaje', Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
              {errors.noViaje && (
                <p className="text-red-500 text-xs mt-1">{errors.noViaje}</p>
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

            {/* Volumen Suelto (Calculado automáticamente) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VOL. SUELTO (M³) <span className="text-blue-500 text-xs">(CALCULADO)</span>
              </label>
              <input
                type="text"
                value={formData.volSuelto}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed font-bold text-blue-600"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                FÓRMULA: NO. VIAJES × CAPACIDAD = {formData.volSuelto || '0.00'} M³
              </p>
            </div>

            {/* Capa No. */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAPA NO.
              </label>
              <input
                type="text"
                value={formData.capaNo}
                onChange={(e) => handleChange('capaNo', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="EJ: CAPA 1, CAPA 2..."
              />
            </div>

            {/* Elevación Ariza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ELEVACIÓN
              </label>
              <input
                type="text"
                value={formData.elevacionAriza}
                onChange={(e) => handleChange('elevacionAriza', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="EJ: 100.50 M"
              />
            </div>

            {/* Origen */}
            <div>
              <AutocompleteInput
                label="ORIGEN"
                value={formData.capaOrigen}
                onChange={(value) => handleChange('capaOrigen', value)}
                options={ORIGENES}
                placeholder="SELECCIONE O ESCRIBA EL ORIGEN..."
                required
              />
              {errors.capaOrigen && (
                <p className="text-red-500 text-xs mt-1">{errors.capaOrigen}</p>
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
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalControlAcarreo;
