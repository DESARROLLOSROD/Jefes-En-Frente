import React, { useState, useEffect } from 'react';
import { ControlAgua } from '../../../types/reporte';
import { Vehiculo } from '../../../types/gestion';
import AutocompleteInput from '../AutocompleteInput';
import { IOrigen } from '../../../services/origenService';
import { IDestino } from '../../../services/destinoService';
import { vehiculoService } from '../../../services/api';

interface ModalControlAguaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agua: ControlAgua) => void;
  aguaInicial?: ControlAgua | null;
  title?: string;
  proyectoId?: string;
  listaOrigenes: IOrigen[];
  onCrearOrigen: (nombre: string) => Promise<IOrigen | null>;
  listaDestinos: IDestino[];
  onCrearDestino: (nombre: string) => Promise<IDestino | null>;
}

const ModalControlAgua: React.FC<ModalControlAguaProps> = ({
  isOpen,
  onClose,
  onSave,
  aguaInicial,
  title = 'AGREGAR CONTROL DE AGUA',
  proyectoId,
  listaOrigenes,
  onCrearOrigen,
  listaDestinos,
  onCrearDestino
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
  const [vehiculosPipa, setVehiculosPipa] = useState<Vehiculo[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);

  // Cargar vehículos tipo Pipa cuando se abre el modal
  useEffect(() => {
    const cargarVehiculos = async () => {
      if (isOpen && proyectoId) {
        setLoadingVehiculos(true);
        try {
          const response = await vehiculoService.obtenerVehiculosPorProyecto(proyectoId);
          if (response.success && response.data) {
            // Filtrar solo vehículos tipo "PIPA" o que contengan "PIPA" en el tipo
            const pipas = response.data.filter(v =>
              v.tipo.toUpperCase().includes('PIPA') && v.activo
            );
            setVehiculosPipa(pipas);
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
    if (aguaInicial) {
      setFormData(aguaInicial);
      // Buscar el vehículo seleccionado si existe
      const vehiculo = vehiculosPipa.find(v => v.noEconomico === aguaInicial.noEconomico);
      setVehiculoSeleccionado(vehiculo || null);
    } else {
      setFormData({
        noEconomico: '',
        viaje: 0,
        capacidad: '',
        volumen: '',
        origen: '',
        destino: ''
      });
      setVehiculoSeleccionado(null);
    }
    setErrors({});
  }, [aguaInicial, isOpen, vehiculosPipa]);

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

  const handleVehiculoChange = (vehiculoId: string) => {
    if (!vehiculoId) {
      setVehiculoSeleccionado(null);
      setFormData(prev => ({ ...prev, noEconomico: '', capacidad: '' }));
      return;
    }

    const vehiculo = vehiculosPipa.find(v => v._id === vehiculoId);
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);

      // Usar la capacidad del vehículo directamente si está definida, o extraerla del nombre como fallback
      const capacidad = vehiculo.capacidad || vehiculo.nombre.match(/(\d+)\s*M³/i)?.[1] || '';

      setFormData(prev => ({
        ...prev,
        noEconomico: vehiculo.noEconomico,
        capacidad: capacidad
      }));

      // Limpiar errores
      if (errors.noEconomico) {
        setErrors(prev => ({ ...prev, noEconomico: '' }));
      }
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

  const handleSubmit = async () => {
    console.log('🔵 MODAL AGUA handleSubmit llamado');
    console.log('📝 FormData del modal:', formData);

    if (validateForm()) {
      try {
        // Verificar si el origen existe en la lista
        const origenNombre = formData.origen.trim().toUpperCase();
        const existeOrigen = listaOrigenes.some(o => o.nombre === origenNombre);

        if (!existeOrigen && origenNombre) {
          const confirmacion = window.confirm(`El origen "${origenNombre}" no existe en el catálogo. ¿Desea agregarlo para futuros reportes?`);
          if (confirmacion) {
            await onCrearOrigen(origenNombre);
          }
        }

        // Verificar si el destino existe en la lista
        const destinoNombre = formData.destino.trim().toUpperCase();
        const existeDestino = listaDestinos.some(d => d.nombre === destinoNombre);

        if (!existeDestino && destinoNombre) {
          const confirmacion = window.confirm(`El destino "${destinoNombre}" no existe en el catálogo. ¿Desea agregarlo para futuros reportes?`);
          if (confirmacion) {
            await onCrearDestino(destinoNombre);
          }
        }

        console.log('✅ Validación pasada, llamando onSave');
        onSave(formData);
        console.log('🚪 Cerrando modal');
        onClose();
      } catch (error) {
        console.error('Error al guardar control de agua:', error);
        alert('Error al procesar el control de agua');
      }
    } else {
      console.log('❌ Validación falló');
    }
  };

  if (!isOpen) return null;

  const opcionesOrigenes = listaOrigenes.map(o => o.nombre);
  const opcionesDestinos = listaDestinos.map(d => d.nombre);

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
            {/* Selección de Vehículo (Pipa) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VEHÍCULO (PIPA) <span className="text-red-500">*</span>
              </label>
              {loadingVehiculos ? (
                <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-500">
                  Cargando vehículos...
                </div>
              ) : vehiculosPipa.length === 0 ? (
                <div className="w-full border border-yellow-300 bg-yellow-50 rounded px-3 py-2 text-yellow-700">
                  ⚠️ No hay vehículos tipo PIPA registrados en este proyecto.
                  <br />
                  <span className="text-xs">Puede agregar vehículos desde la sección de Gestión de Vehículos.</span>
                </div>
              ) : (
                <select
                  value={vehiculoSeleccionado?._id || ''}
                  onChange={(e) => handleVehiculoChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">SELECCIONE UN VEHÍCULO...</option>
                  {vehiculosPipa.map(vehiculo => (
                    <option key={vehiculo._id} value={vehiculo._id}>
                      {vehiculo.noEconomico} - {vehiculo.nombre} ({vehiculo.tipo})
                    </option>
                  ))}
                </select>
              )}
              {errors.noEconomico && (
                <p className="text-red-500 text-xs mt-1">{errors.noEconomico}</p>
              )}
              {vehiculoSeleccionado && (
                <div className="mt-2 p-3 bg-cyan-50 border border-cyan-200 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Vehículo seleccionado:</span> {vehiculoSeleccionado.nombre.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">No. Económico:</span> {vehiculoSeleccionado.noEconomico.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tipo:</span> {vehiculoSeleccionado.tipo.toUpperCase()}
                  </p>
                </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAPACIDAD (M³) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => handleChange('capacidad', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
              {vehiculoSeleccionado && vehiculoSeleccionado.capacidad && (
                <p className="text-xs text-green-600 mt-1 font-semibold">
                  ✓ Capacidad obtenida del vehículo (puede modificarla si lo necesita)
                </p>
              )}
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
                options={opcionesOrigenes}
                placeholder="SELECCIONE O ESCRIBA EL ORIGEN..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                * Si el origen no existe, se le preguntará si desea agregarlo.
              </p>
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
                options={opcionesDestinos}
                placeholder="SELECCIONE O ESCRIBA EL DESTINO..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                * Si el destino no existe, se le preguntará si desea agregarlo.
              </p>
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
