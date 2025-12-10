import React, { useState, useEffect } from 'react';
import { ControlAcarreo, IMaterialCatalog, ICapacidadCatalog } from '../../../types/reporte';
import { Vehiculo } from '../../../types/gestion';
import AutocompleteInput from '../AutocompleteInput';
import { ORIGENES, DESTINOS } from '../../../constants/reporteConstants';
import { vehiculoService } from '../../../services/api';

interface ModalControlAcarreoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acarreo: ControlAcarreo) => void;
  acarreoInicial?: ControlAcarreo | null;
  title?: string;
  listaMateriales: IMaterialCatalog[];
  onCrearMaterial: (nombre: string) => Promise<IMaterialCatalog | null>;
  listaCapacidades: ICapacidadCatalog[];
  onCrearCapacidad: (valor: string) => Promise<ICapacidadCatalog | null>;
  proyectoId?: string;
}

const ModalControlAcarreo: React.FC<ModalControlAcarreoProps> = ({
  isOpen,
  onClose,
  onSave,
  acarreoInicial,
  title = 'AGREGAR CONTROL DE ACARREO',
  listaMateriales,
  onCrearMaterial,
  listaCapacidades,
  onCrearCapacidad,
  proyectoId
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehiculosCamion, setVehiculosCamion] = useState<Vehiculo[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);

  // Cargar vehículos tipo CAMIÓN cuando se abre el modal
  useEffect(() => {
    const cargarVehiculos = async () => {
      if (isOpen && proyectoId) {
        setLoadingVehiculos(true);
        try {
          const response = await vehiculoService.obtenerVehiculosPorProyecto(proyectoId);
          if (response.success && response.data) {
            // Filtrar solo vehículos tipo "CAMIÓN" o que contengan "CAMION" en el tipo
            const camiones = response.data.filter(v =>
              v.tipo.toUpperCase().includes('CAMION') && v.activo
            );
            setVehiculosCamion(camiones);
          }
        } catch (error) {
          console.error('Error al cargar vehículos:', error);
        } finally {
          setLoadingVehiculos(false);
        }
      }
    };

    cargarVehiculos();
  }, [isOpen, proyectoId]);

  useEffect(() => {
    if (acarreoInicial) {
      setFormData(acarreoInicial);
      // Buscar el vehículo seleccionado si existe
      const vehiculo = vehiculosCamion.find(v => v.noEconomico === acarreoInicial.capaNo);
      setVehiculoSeleccionado(vehiculo || null);
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
      setVehiculoSeleccionado(null);
    }
    setErrors({});
  }, [acarreoInicial, isOpen, vehiculosCamion]);

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

  const handleVehiculoChange = (vehiculoId: string) => {
    if (!vehiculoId) {
      setVehiculoSeleccionado(null);
      setFormData(prev => ({ ...prev, capaNo: '', capacidad: '' }));
      return;
    }

    const vehiculo = vehiculosCamion.find(v => v._id === vehiculoId);
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);

      // Usar la capacidad del vehículo directamente si está definida, o extraerla del nombre como fallback
      const capacidad = vehiculo.capacidad || vehiculo.nombre.match(/(\d+)\s*M³/i)?.[1] || '';

      setFormData(prev => ({
        ...prev,
        capaNo: vehiculo.noEconomico,
        capacidad: capacidad
      }));

      // Limpiar errores
      if (errors.capaNo) {
        setErrors(prev => ({ ...prev, capaNo: '' }));
      }
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

  const handleSubmit = async () => {
    console.log('🔵 MODAL handleSubmit llamado');

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Verificar si el material existe en la lista
        const materialNombre = formData.material.trim().toUpperCase();
        const existeMaterial = listaMateriales.some(m => m.nombre === materialNombre);

        if (!existeMaterial) {
          const confirmacion = window.confirm(`El material "${materialNombre}" no existe en el catálogo. ¿Desea agregarlo para futuros reportes?`);
          if (confirmacion) {
            await onCrearMaterial(materialNombre);
          }
        }

        // Verificar si la capacidad existe
        const capacidadValor = formData.capacidad.trim();
        const existeCapacidad = listaCapacidades.some(c => c.valor === capacidadValor);

        if (!existeCapacidad) {
          const confirmacionCap = window.confirm(`La capacidad "${capacidadValor} M³" no existe en el catálogo. ¿Desea agregarla?`);
          if (confirmacionCap) {
            await onCrearCapacidad(capacidadValor);
          }
        }

        console.log('✅ Validación pasada, llamando onSave');
        onSave(formData);
        console.log('🚪 Cerrando modal');
        onClose();
      } catch (error) {
        console.error('Error al guardar acarreo:', error);
        alert('Error al procesar el acarreo');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('❌ Validación falló');
    }
  };

  if (!isOpen) return null;

  const opcionesMateriales = listaMateriales.map(m => m.nombre);
  const opcionesCapacidades = listaCapacidades.map(c => c.valor);

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
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material */}
            <div>
              <AutocompleteInput
                label="MATERIAL"
                value={formData.material}
                onChange={(value) => handleChange('material', value)}
                options={opcionesMateriales}
                placeholder="SELECCIONE O ESCRIBA EL MATERIAL..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                * Si el material no existe, se le preguntará si desea agregarlo.
              </p>
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
                options={opcionesCapacidades}
                placeholder="SELECCIONE CAPACIDAD..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                * Si la capacidad no existe, se le preguntará si desea agregarla.
              </p>
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

            {/* Vehículo (Camión) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VEHÍCULO (CAMIÓN)
              </label>
              {loadingVehiculos ? (
                <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500">
                  Cargando vehículos...
                </div>
              ) : vehiculosCamion.length === 0 ? (
                <div className="w-full border border-yellow-300 bg-yellow-50 rounded px-3 py-2 text-yellow-700">
                  ⚠️ No hay vehículos tipo CAMIÓN registrados en este proyecto.
                  <br />
                  <span className="text-xs">Puede agregar vehículos desde la sección de Gestión de Vehículos.</span>
                </div>
              ) : (
                <select
                  value={vehiculoSeleccionado?._id || ''}
                  onChange={(e) => handleVehiculoChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">SELECCIONE UN VEHÍCULO...</option>
                  {vehiculosCamion.map(vehiculo => (
                    <option key={vehiculo._id} value={vehiculo._id}>
                      {vehiculo.noEconomico} - {vehiculo.nombre} ({vehiculo.tipo})
                    </option>
                  ))}
                </select>
              )}
              {vehiculoSeleccionado && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Vehículo seleccionado:</span> {vehiculoSeleccionado.nombre}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">No. Económico:</span> {vehiculoSeleccionado.noEconomico}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tipo:</span> {vehiculoSeleccionado.tipo}
                  </p>
                </div>
              )}
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
              disabled={isSubmitting}
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalControlAcarreo;
