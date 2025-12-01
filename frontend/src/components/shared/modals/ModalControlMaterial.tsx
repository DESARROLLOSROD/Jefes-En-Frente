import React, { useState, useEffect } from 'react';
import { ControlMaterial } from '../../../types/reporte';
import AutocompleteInput from '../AutocompleteInput';
import { MATERIALES, UNIDADES_MEDIDA } from '../../../constants/reporteConstants';

interface ModalControlMaterialProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: ControlMaterial) => void;
  materialInicial?: ControlMaterial | null;
  title?: string;
}

const ModalControlMaterial: React.FC<ModalControlMaterialProps> = ({
  isOpen,
  onClose,
  onSave,
  materialInicial,
  title = 'Agregar Control de Material'
}) => {
  const [formData, setFormData] = useState<ControlMaterial>({
    material: '',
    unidad: '',
    cantidad: '',
    zona: '',
    elevacion: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (materialInicial) {
      setFormData(materialInicial);
    } else {
      setFormData({
        material: '',
        unidad: '',
        cantidad: '',
        zona: '',
        elevacion: ''
      });
    }
    setErrors({});
  }, [materialInicial, isOpen]);

  const handleChange = (campo: keyof ControlMaterial, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    if (errors[campo]) {
      setErrors(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.material.trim()) {
      newErrors.material = 'El material es requerido';
    }
    if (!formData.unidad.trim()) {
      newErrors.unidad = 'La unidad es requerida';
    }
    if (!formData.cantidad.trim() || Number(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    if (!formData.zona.trim()) {
      newErrors.zona = 'La zona es requerida';
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
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg">
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
            <div className="md:col-span-2">
              <AutocompleteInput
                label="Material"
                value={formData.material}
                onChange={(value) => handleChange('material', value)}
                options={MATERIALES}
                placeholder="Seleccione o escriba el material..."
                required
              />
              {errors.material && (
                <p className="text-red-500 text-xs mt-1">{errors.material}</p>
              )}
            </div>

            {/* Unidad */}
            <div>
              <AutocompleteInput
                label="Unidad"
                value={formData.unidad}
                onChange={(value) => handleChange('unidad', value)}
                options={UNIDADES_MEDIDA}
                placeholder="Seleccione unidad..."
                required
              />
              {errors.unidad && (
                <p className="text-red-500 text-xs mt-1">{errors.unidad}</p>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cantidad}
                onChange={(e) => handleChange('cantidad', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                min="0"
              />
              {errors.cantidad && (
                <p className="text-red-500 text-xs mt-1">{errors.cantidad}</p>
              )}
            </div>

            {/* Zona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zona}
                onChange={(e) => handleChange('zona', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: Zona A, Tramo 1..."
              />
              {errors.zona && (
                <p className="text-red-500 text-xs mt-1">{errors.zona}</p>
              )}
            </div>

            {/* Elevación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elevación
              </label>
              <input
                type="text"
                value={formData.elevacion}
                onChange={(e) => handleChange('elevacion', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 100.50 m"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalControlMaterial;
