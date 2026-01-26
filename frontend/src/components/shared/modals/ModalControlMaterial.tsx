import React, { useState, useEffect } from 'react';
import { ControlMaterial, IMaterialCatalog } from '../../../types/reporte';
import AutocompleteInput from '../AutocompleteInput';
import { UNIDADES_MEDIDA } from '../../../constants/reporteConstants';

interface ModalControlMaterialProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: ControlMaterial) => void;
  materialInicial?: ControlMaterial | null;
  title?: string;
  listaMateriales: IMaterialCatalog[];
  onCrearMaterial: (nombre: string, unidad: string) => Promise<IMaterialCatalog | null>;
}

const ModalControlMaterial: React.FC<ModalControlMaterialProps> = ({
  isOpen,
  onClose,
  onSave,
  materialInicial,
  title = 'AGREGAR CONTROL DE MATERIAL',
  listaMateriales,
  onCrearMaterial
}) => {
  const [formData, setFormData] = useState<ControlMaterial>({
    material: '',
    unidad: '',
    cantidad: '',
    zona: '',
    elevacion: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Convertir a mayúsculas
    const valorFinal = valor.toUpperCase();
    setFormData(prev => ({ ...prev, [campo]: valorFinal }));
    if (errors[campo]) {
      setErrors(prev => ({ ...prev, [campo]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.material.trim()) {
      newErrors.material = 'EL MATERIAL ES REQUERIDO';
    }
    if (!formData.unidad.trim()) {
      newErrors.unidad = 'LA UNIDAD ES REQUERIDA';
    }
    if (!formData.cantidad.trim() || Number(formData.cantidad) <= 0) {
      newErrors.cantidad = 'LA CANTIDAD DEBE SER MAYOR A 0';
    }
    if (!formData.zona.trim()) {
      newErrors.zona = 'LA ZONA ES REQUERIDA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('🔵 MODAL MATERIAL handleSubmit llamado');

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Verificar si el material existe en la lista
        const materialNombre = formData.material.trim().toUpperCase();
        const existe = listaMateriales.some(m => m.nombre === materialNombre);

        if (!existe) {
          const confirmacion = window.confirm(`El material "${materialNombre}" no existe en el catálogo. ¿Desea agregarlo para futuros reportes?`);
          if (confirmacion) {
            await onCrearMaterial(materialNombre, formData.unidad);
          }
        }

        console.log('✅ Validación pasada, llamando onSave');
        onSave(formData);
        console.log('🚪 Cerrando modal');
        onClose();
      } catch (error) {
        console.error('Error al guardar material:', error);
        alert('Error al procesar el material');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('❌ Validación falló');
    }
  };

  if (!isOpen) return null;

  const opcionesMateriales = listaMateriales.map(m => m.nombre);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl font-bold"
              type="button"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material */}
            <div className="md:col-span-2">
              <AutocompleteInput
                label="MATERIAL"
                value={formData.material}
                onChange={(value) => handleChange('material', value)}
                options={opcionesMateriales}
                placeholder="SELECCIONE O ESCRIBA EL MATERIAL..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                * Si el material no existe, se le preguntará si desea agregarlo al catálogo.
              </p>
              {errors.material && (
                <p className="text-red-500 text-xs mt-1">{errors.material}</p>
              )}
            </div>

            {/* Unidad */}
            <div>
              <AutocompleteInput
                label="UNIDAD"
                value={formData.unidad}
                onChange={(value) => handleChange('unidad', value)}
                options={UNIDADES_MEDIDA}
                placeholder="SELECCIONE UNIDAD..."
                required
              />
              {errors.unidad && (
                <p className="text-red-500 text-xs mt-1">{errors.unidad}</p>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CANTIDAD <span className="text-red-500">*</span>
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
                ZONA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zona}
                onChange={(e) => handleChange('zona', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                placeholder="EJ: ZONA A, TRAMO 1..."
              />
              {errors.zona && (
                <p className="text-red-500 text-xs mt-1">{errors.zona}</p>
              )}
            </div>

            {/* Elevación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ELEVACIÓN
              </label>
              <input
                type="text"
                value={formData.elevacion}
                onChange={(e) => handleChange('elevacion', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                placeholder="EJ: 100.50 M"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              disabled={isSubmitting}
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalControlMaterial;
