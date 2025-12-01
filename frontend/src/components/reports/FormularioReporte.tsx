import React, { useState, useEffect } from 'react';
import { ReporteActividades, ControlMaquinaria } from '../../types/reporte';
import { reporteService, vehiculoService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Vehiculo } from '../../types/gestion';
import SeccionControlAcarreo from './sections/SeccionControlAcarreo';
import SeccionControlMaterial from './sections/SeccionControlMaterial';
import SeccionControlAgua from './sections/SeccionControlAgua';

interface FormularioReporteProps {
  reporteInicial?: ReporteActividades | null;
  onFinalizar?: () => void;
}

const FormularioReporteNew: React.FC<FormularioReporteProps> = ({ reporteInicial, onFinalizar }) => {
  const { proyecto, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>([]);

  const [formData, setFormData] = useState<Omit<ReporteActividades, '_id' | 'fechaCreacion'>>({
    fecha: new Date().toISOString().split('T')[0],
    ubicacion: '',
    proyectoId: '',
    usuarioId: '',
    turno: 'primer',
    inicioActividades: '07:00',
    terminoActividades: '19:00',
    zonaTrabajo: '',
    seccionTrabajo: '',
    jefeFrente: '',
    sobrestante: '',
    controlAcarreo: [
      { material: '', noViaje: 0, capacidad: '', volSuelto: '', capaNo: '', elevacionAriza: '', capaOrigen: '', destino: '' }
    ],
    controlMaterial: [
      { material: '', unidad: '', cantidad: '', zona: '', elevacion: '' }
    ],
    controlAgua: [
      { noEconomico: '', viaje: 0, capacidad: '', volumen: '', origen: '', destino: '' }
    ],
    controlMaquinaria: [
      {
        vehiculoId: '',
        nombre: '',
        tipo: '',
        numeroEconomico: '',
        horometroInicial: 0,
        horometroFinal: 0,
        horasOperacion: 0,
        operador: '',
        actividad: ''
      }
    ],
    observaciones: '',
    creadoPor: user?.nombre || ''
  });

  // Cargar datos si estamos editando
  useEffect(() => {
    if (reporteInicial) {
      const datosCargados = {
        ...reporteInicial,
        controlAcarreo: reporteInicial.controlAcarreo?.length > 0 ? reporteInicial.controlAcarreo : [{ material: '', noViaje: 0, capacidad: '', volSuelto: '', capaNo: '', elevacionAriza: '', capaOrigen: '', destino: '' }],
        controlMaterial: reporteInicial.controlMaterial?.length > 0 ? reporteInicial.controlMaterial : [{ material: '', unidad: '', cantidad: '', zona: '', elevacion: '' }],
        controlAgua: reporteInicial.controlAgua?.length > 0 ? reporteInicial.controlAgua : [{ noEconomico: '', viaje: 0, capacidad: '', volumen: '', origen: '', destino: '' }],
        controlMaquinaria: reporteInicial.controlMaquinaria?.length > 0 ? reporteInicial.controlMaquinaria : [{
          vehiculoId: '',
          nombre: '',
          tipo: '',
          numeroEconomico: '',
          horometroInicial: 0,
          horometroFinal: 0,
          horasOperacion: 0,
          operador: '',
          actividad: ''
        }]
      };

      const { _id, fechaCreacion, ...restoDatos } = datosCargados;
      setFormData(restoDatos);
    }
  }, [reporteInicial]);

  // Actualizar ubicación y proyectoId
  useEffect(() => {
    if (proyecto && !reporteInicial) {
      setFormData(prev => ({
        ...prev,
        ubicacion: proyecto.ubicacion,
        proyectoId: proyecto._id || ''
      }));
    }
  }, [proyecto, reporteInicial]);

  // Cargar vehículos del proyecto
  useEffect(() => {
    const cargarVehiculos = async () => {
      if (proyecto?._id) {
        const response = await vehiculoService.obtenerVehiculosPorProyecto(proyecto._id);
        if (response.success && response.data) {
          setVehiculosDisponibles(response.data);
        }
      }
    };
    cargarVehiculos();
  }, [proyecto]);

  // Actualizar usuarioId
  useEffect(() => {
    if (user && !reporteInicial) {
      setFormData(prev => ({
        ...prev,
        usuarioId: user._id || '',
        creadoPor: user.nombre
      }));
    }
  }, [user, reporteInicial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    // Validación de horómetros
    for (const maq of formData.controlMaquinaria) {
      if (maq.vehiculoId && maq.horometroFinal < maq.horometroInicial) {
        setMensaje(`Error: El horómetro final no puede ser menor al inicial para el vehículo ${maq.nombre}`);
        setLoading(false);
        return;
      }
    }

    try {
      let resultado;
      if (reporteInicial && reporteInicial._id) {
        resultado = await reporteService.actualizarReporte(reporteInicial._id, formData);
      } else {
        resultado = await reporteService.crearReporte(formData);
      }

      if (resultado.success) {
        setMensaje(reporteInicial ? 'Reporte actualizado exitosamente!' : 'Reporte creado exitosamente!');

        if (!reporteInicial) {
          const hoy = new Date();
          const fechaLocal =
            hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, '0') + "-" +
            String(hoy.getDate()).padStart(2, '0');

          setFormData({
            ...formData,
            fecha: fechaLocal,
            inicioActividades: formData.turno === 'primer' ? '07:00' : '19:00',
            terminoActividades: formData.turno === 'primer' ? '19:00' : '07:00',
            observaciones: '',
            creadoPor: user?.nombre || '',
          });
        }

        if (onFinalizar) {
          setTimeout(() => {
            onFinalizar();
          }, 1500);
        }
      } else {
        setMensaje('Error: ' + resultado.error);
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleTurnoChange = (nuevoTurno: 'primer' | 'segundo') => {
    setFormData({
      ...formData,
      turno: nuevoTurno,
      inicioActividades: nuevoTurno === 'primer' ? '07:00' : '19:00',
      terminoActividades: nuevoTurno === 'primer' ? '19:00' : '07:00'
    });
  };

  // Funciones para control de maquinaria
  const agregarControlMaquinaria = () => {
    setFormData({
      ...formData,
      controlMaquinaria: [
        ...formData.controlMaquinaria,
        {
          vehiculoId: '',
          nombre: '',
          tipo: '',
          numeroEconomico: '',
          horometroInicial: 0,
          horometroFinal: 0,
          horasOperacion: 0,
          operador: '',
          actividad: ''
        }
      ]
    });
  };

  const actualizarControlMaquinaria = (index: number, campo: keyof ControlMaquinaria, valor: string | number) => {
    const nuevaMaquinaria = [...formData.controlMaquinaria];
    nuevaMaquinaria[index] = { ...nuevaMaquinaria[index], [campo]: valor };
    setFormData({ ...formData, controlMaquinaria: nuevaMaquinaria });
  };

  const eliminarControlMaquinaria = (index: number) => {
    if (formData.controlMaquinaria.length > 1) {
      const nuevaMaquinaria = formData.controlMaquinaria.filter((_, i) => i !== index);
      setFormData({ ...formData, controlMaquinaria: nuevaMaquinaria });
    }
  };

  const seleccionarVehiculo = (index: number, vehiculoId: string) => {
    const vehiculo = vehiculosDisponibles.find(v => v._id === vehiculoId);
    if (vehiculo) {
      const nuevaMaquinaria = [...formData.controlMaquinaria];
      nuevaMaquinaria[index] = {
        ...nuevaMaquinaria[index],
        vehiculoId: vehiculo._id,
        nombre: vehiculo.nombre,
        tipo: vehiculo.tipo,
        numeroEconomico: vehiculo.noEconomico,
        horometroInicial: vehiculo.horometroInicial,
        horometroFinal: vehiculo.horometroFinal || vehiculo.horometroInicial,
        horasOperacion: 0
      };
      setFormData({ ...formData, controlMaquinaria: nuevaMaquinaria });
    }
  };

  const calcularHorasOperacion = (index: number, horometroFinal: number) => {
    const nuevaMaquinaria = [...formData.controlMaquinaria];
    const horometroInicial = nuevaMaquinaria[index].horometroInicial;
    nuevaMaquinaria[index] = {
      ...nuevaMaquinaria[index],
      horometroFinal,
      horasOperacion: horometroFinal - horometroInicial
    };
    setFormData({ ...formData, controlMaquinaria: nuevaMaquinaria });
  };

  return (
    <div className="max-w-7xl mx-auto bg-white/50 p-6 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {reporteInicial ? 'EDITAR REPORTE DE ACTIVIDADES' : 'REPORTE DE ACTIVIDADES'}
        </h1>
        <p className="text-lg text-gray-900 mt-2">GENERAL CONTRACTOR</p>
        <p className="text-gray-900">UBICACIÓN: {proyecto?.nombre}</p>
      </div>

      {mensaje && (
        <div className={`p-4 mb-6 rounded-lg ${mensaje.includes('exitosamente') ? 'bg-green-100 text-green-700 border border-green-300' :
          'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
        <div className="border-2 border-orange-400 rounded-lg p-6 bg-orange-50">
          <h3 className="text-xl font-bold mb-4 text-orange-800 border-b pb-2">INFORMACIÓN GENERAL</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">FECHA</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">TURNO</label>
              <select
                value={formData.turno}
                onChange={(e) => handleTurnoChange(e.target.value as 'primer' | 'segundo')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
              >
                <option value="primer">Primer Turno (7:00 AM - 7:00 PM)</option>
                <option value="segundo">Segundo Turno (7:00 PM - 7:00 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">INICIO ACTIVIDADES</label>
              <input
                type="time"
                value={formData.inicioActividades}
                onChange={(e) => setFormData({ ...formData, inicioActividades: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">TÉRMINO ACTIVIDADES</label>
              <input
                type="time"
                value={formData.terminoActividades}
                onChange={(e) => setFormData({ ...formData, terminoActividades: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">ZONA DE TRABAJO</label>
              <input
                type="text"
                value={formData.zonaTrabajo}
                onChange={(e) => setFormData({ ...formData, zonaTrabajo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">SECCIÓN DE TRABAJO</label>
              <input
                type="text"
                value={formData.seccionTrabajo}
                onChange={(e) => setFormData({ ...formData, seccionTrabajo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">JEFE DE FRENTE</label>
              <input
                type="text"
                value={formData.jefeFrente}
                onChange={(e) => setFormData({ ...formData, jefeFrente: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">SOBRESTANTE</label>
              <input
                type="text"
                value={formData.sobrestante}
                onChange={(e) => setFormData({ ...formData, sobrestante: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CONTROL DE ACARREOS (NUEVO COMPONENTE MODULAR) */}
        <SeccionControlAcarreo
          acarreos={formData.controlAcarreo}
          onAcarreosChange={(acarreos) => setFormData({ ...formData, controlAcarreo: acarreos })}
        />

        {/* SECCIÓN 3: CONTROL DE MATERIAL (NUEVO COMPONENTE MODULAR) */}
        <SeccionControlMaterial
          materiales={formData.controlMaterial}
          onMaterialesChange={(materiales) => setFormData({ ...formData, controlMaterial: materiales })}
        />

        {/* SECCIÓN 4: CONTROL DE AGUA (NUEVO COMPONENTE MODULAR) */}
        <SeccionControlAgua
          aguas={formData.controlAgua}
          onAguasChange={(aguas) => setFormData({ ...formData, controlAgua: aguas })}
        />

        {/* SECCIÓN 5: CONTROL DE MAQUINARIA */}
        <div className="border-2 border-purple-400 rounded-lg p-6 bg-purple-50">
          <h3 className="text-xl font-bold mb-4 text-purple-800 border-b pb-2">CONTROL DE MAQUINARIA</h3>
          {formData.controlMaquinaria.map((maq, index) => (
            <div key={index} className="bg-white p-4 rounded-lg mb-4 shadow">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-700">Máquina {index + 1}</h4>
                {formData.controlMaquinaria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarControlMaquinaria(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehículo</label>
                  <select
                    value={maq.vehiculoId}
                    onChange={(e) => seleccionarVehiculo(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  >
                    <option value="">Seleccione vehículo...</option>
                    {vehiculosDisponibles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.nombre} - {v.noEconomico}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horómetro Inicial</label>
                  <input
                    type="number"
                    value={maq.horometroInicial || 0}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 font-semibold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horómetro Final</label>
                  <input
                    type="number"
                    value={maq.horometroFinal || 0}
                    onChange={(e) => calcularHorasOperacion(index, Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horas de Operación</label>
                  <input
                    type="number"
                    value={maq.horasOperacion || 0}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 font-bold text-purple-600"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operador</label>
                  <input
                    type="text"
                    value={maq.operador}
                    onChange={(e) => actualizarControlMaquinaria(index, 'operador', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Actividad</label>
                  <input
                    type="text"
                    value={maq.actividad}
                    onChange={(e) => actualizarControlMaquinaria(index, 'actividad', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={agregarControlMaquinaria}
            className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            + Agregar Maquinaria
          </button>
        </div>

        {/* SECCIÓN 6: OBSERVACIONES */}
        <div className="border-2 border-gray-400 rounded-lg p-6 bg-gray-50">
          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">OBSERVACIONES</h3>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2 border"
            placeholder="Escriba cualquier observación adicional..."
          />
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (reporteInicial ? 'ACTUALIZAR REPORTE' : 'GUARDAR REPORTE')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioReporteNew;
