import React, { useState, useEffect } from 'react';
import { ReporteActividades, ControlAcarreo, ControlAgua, ControlMaquinaria, ControlMaterial } from '../types/reporte';
import { reporteService, vehiculoService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Vehiculo } from '../types/gestion';

const FormularioReporte: React.FC = () => {
  const { proyecto, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>([]);

  // Estado inicial sin proyecto/user
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
    mediciones: {
      lupoBSeccion1_1: '',
      lupoBSeccion2: '',
      lupoBSeccion3: '',
      emparinado: ''
    },
    seccion2: {
      plantaIncorporacion: 'Planta Incorporación de la Sección 3.1',
      datos: [
        { daj: 'daj=4.80 ton', valores: ['', '', '', ''] },
        { daj: 'daj=380 ton', valores: ['', '', '', ''] }
      ]
    },
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

  // Actualizar ubicación y proyectoId cuando cambia el proyecto
  useEffect(() => {
    if (proyecto) {
      setFormData(prev => ({
        ...prev,
        ubicacion: proyecto.ubicacion,
        proyectoId: proyecto._id || ''
      }));
    }
  }, [proyecto]);

  // Cargar vehículos del proyecto actual
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

  // Actualizar usuarioId cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        usuarioId: user._id || '',
        creadoPor: user.nombre
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      const resultado = await reporteService.crearReporte(formData);
      if (resultado.success) {
        setMensaje('✅ Reporte creado exitosamente!');
        // Limpiar formulario pero mantener estructura
        setFormData({
          ...formData,
          fecha: new Date().toISOString().split('T')[0],
          inicioActividades: formData.turno === 'primer' ? '07:00' : '19:00',
          terminoActividades: formData.turno === 'primer' ? '19:00' : '07:00',
          observaciones: '',
          creadoPor: '',
        });
      } else {
        setMensaje('❌ Error al crear reporte: ' + resultado.error);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar horarios según el turno seleccionado
  const handleTurnoChange = (nuevoTurno: 'primer' | 'segundo') => {
    setFormData({
      ...formData,
      turno: nuevoTurno,
      inicioActividades: nuevoTurno === 'primer' ? '07:00' : '19:00',
      terminoActividades: nuevoTurno === 'primer' ? '19:00' : '07:00'
    });
  };

  // Funciones para control de acarreos
  const agregarControlAcarreo = () => {
    setFormData({
      ...formData,
      controlAcarreo: [
        ...formData.controlAcarreo,
        { material: '', noViaje: 0, capacidad: '', volSuelto: '', capaNo: '', elevacionAriza: '', capaOrigen: '', destino: '' }
      ]
    });
  };

  const actualizarControlAcarreo = (index: number, campo: keyof ControlAcarreo, valor: string | number) => {
    const nuevosAcarreos = [...formData.controlAcarreo];
    nuevosAcarreos[index] = { ...nuevosAcarreos[index], [campo]: valor };
    setFormData({ ...formData, controlAcarreo: nuevosAcarreos });
  };

  const eliminarControlAcarreo = (index: number) => {
    if (formData.controlAcarreo.length > 1) {
      const nuevosAcarreos = formData.controlAcarreo.filter((_, i) => i !== index);
      setFormData({ ...formData, controlAcarreo: nuevosAcarreos });
    }
  };

  // Functions for Control Material
  const agregarControlMaterial = () => {
    setFormData({
      ...formData,
      controlMaterial: [
        ...formData.controlMaterial,
        { material: '', unidad: '', cantidad: '', zona: '', elevacion: '' }
      ]
    });
  };

  const actualizarControlMaterial = (index: number, campo: keyof ControlMaterial, valor: string) => {
    const nuevosMateriales = [...formData.controlMaterial];
    nuevosMateriales[index] = { ...nuevosMateriales[index], [campo]: valor };
    setFormData({ ...formData, controlMaterial: nuevosMateriales });
  };

  const eliminarControlMaterial = (index: number) => {
    if (formData.controlMaterial.length > 1) {
      const nuevosMateriales = formData.controlMaterial.filter((_, i) => i !== index);
      setFormData({ ...formData, controlMaterial: nuevosMateriales });
    }
  };

  // Funciones para control de agua
  const agregarControlAgua = () => {
    setFormData({
      ...formData,
      controlAgua: [
        ...formData.controlAgua,
        { noEconomico: '', viaje: 0, capacidad: '', volumen: '', origen: '', destino: '' }
      ]
    });
  };

  const actualizarControlAgua = (index: number, campo: keyof ControlAgua, valor: string | number) => {
    const nuevosAgua = [...formData.controlAgua];
    nuevosAgua[index] = { ...nuevosAgua[index], [campo]: valor };
    setFormData({ ...formData, controlAgua: nuevosAgua });
  };

  const eliminarControlAgua = (index: number) => {
    if (formData.controlAgua.length > 1) {
      const nuevosAgua = formData.controlAgua.filter((_, i) => i !== index);
      setFormData({ ...formData, controlAgua: nuevosAgua });
    }
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

  // Función para manejar la selección de vehículo
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
        horasOperacion: 0 // Se calculará al cambiar horometroFinal
      };
      setFormData({ ...formData, controlMaquinaria: nuevaMaquinaria });
    }
  };

  // Función para calcular horas de operación
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
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">REPORTE DE ACTIVIDADES</h1>
        <p className="text-lg text-gray-600 mt-2">GENERAL CONTRACTOR</p>
        <p className="text-gray-700">UBICACIÓN : {proyecto?.nombre} </p>
      </div>

      {mensaje && (
        <div className={`p-4 mb-6 rounded-lg ${mensaje.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' :
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
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">TERMINO ACTIVIDADES</label>
              <input
                type="time"
                value={formData.terminoActividades}
                onChange={(e) => setFormData({ ...formData, terminoActividades: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: ZONA Y PERSONAL */}
        <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
          <h3 className="text-xl font-bold mb-4 text-blue-800 border-b pb-2">ZONA DE TRABAJO Y PERSONAL</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">ZONA DE TRABAJO</label>
              <input
                type="text"
                value={formData.zonaTrabajo}
                onChange={(e) => setFormData({ ...formData, zonaTrabajo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="Zona principal de trabajo"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">SECCIÓN DE TRABAJO</label>
              <input
                type="text"
                value={formData.seccionTrabajo}
                onChange={(e) => setFormData({ ...formData, seccionTrabajo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="Sección específica (Ej: Sección 3.1)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">JEFE DE FRENTE</label>
              <input
                type="text"
                value={formData.jefeFrente}
                onChange={(e) => setFormData({ ...formData, jefeFrente: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="Puma Bauda"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">SOBRESTANTE</label>
              <input
                type="text"
                value={formData.sobrestante}
                onChange={(e) => setFormData({ ...formData, sobrestante: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                placeholder="Librarino de lopes"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: CONTROL DE ACARREOS */}
        <div className="border-2 border-red-400 rounded-lg p-6 bg-red-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-800 border-b pb-2">CONTROL DE ACARREOS</h3>
            <button
              type="button"
              onClick={agregarControlAcarreo}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 font-semibold"
            >
              + Agregar Fila
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-red-300">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">MATERIAL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">No. VIAJE</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">CAPACIDAD</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">VOL. SUELTO</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">CAPA No.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">ELEVACION ARIZA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">CAPA ORIGEN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">DESTINO</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-red-800 uppercase border border-red-300">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.controlAcarreo.map((acarreo, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.material}
                        onChange={(e) => actualizarControlAcarreo(index, 'material', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Material"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="number"
                        value={acarreo.noViaje}
                        onChange={(e) => actualizarControlAcarreo(index, 'noViaje', parseInt(e.target.value) || 0)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.capacidad}
                        onChange={(e) => actualizarControlAcarreo(index, 'capacidad', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Capacidad"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.volSuelto}
                        onChange={(e) => actualizarControlAcarreo(index, 'volSuelto', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Vol. Suelto"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.capaNo}
                        onChange={(e) => actualizarControlAcarreo(index, 'capaNo', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Capa No."
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.elevacionAriza}
                        onChange={(e) => actualizarControlAcarreo(index, 'elevacionAriza', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Elevación"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.capaOrigen}
                        onChange={(e) => actualizarControlAcarreo(index, 'capaOrigen', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Origen"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <input
                        type="text"
                        value={acarreo.destino}
                        onChange={(e) => actualizarControlAcarreo(index, 'destino', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Destino"
                      />
                    </td>
                    <td className="px-4 py-2 border border-red-200">
                      <button
                        type="button"
                        onClick={() => eliminarControlAcarreo(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold bg-red-100 px-2 py-1 rounded"
                        disabled={formData.controlAcarreo.length === 1}
                      >
                        {formData.controlAcarreo.length === 1 ? '—' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECCIÓN 5: CONTROL DE MATERIAL */}
        <div className="border-2 border-green-400 rounded-lg p-6 bg-green-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-800 border-b pb-2">CONTROL DE MATERIAL</h3>
            <button type="button" onClick={agregarControlMaterial} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-semibold">+ Agregar Fila</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-green-300">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase border border-green-300">MATERIAL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase border border-green-300">UNIDAD</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase border border-green-300">CANTIDAD</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase border border-green-300">ZONA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase border border-green-300">ELEVACIÓN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-green-800 uppercase border border-green-300">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.controlMaterial.map((mat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-green-200"><input type="text" value={mat.material} onChange={(e) => actualizarControlMaterial(index, 'material', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-1" placeholder="Material" /></td>
                    <td className="px-4 py-2 border border-green-200"><input type="text" value={mat.unidad} onChange={(e) => actualizarControlMaterial(index, 'unidad', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-1" placeholder="Unidad" /></td>
                    <td className="px-4 py-2 border border-green-200"><input type="text" value={mat.cantidad} onChange={(e) => actualizarControlMaterial(index, 'cantidad', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-1" placeholder="Cantidad" /></td>
                    <td className="px-4 py-2 border border-green-200"><input type="text" value={mat.zona} onChange={(e) => actualizarControlMaterial(index, 'zona', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-1" placeholder="Zona" /></td>
                    <td className="px-4 py-2 border border-green-200"><input type="text" value={mat.elevacion} onChange={(e) => actualizarControlMaterial(index, 'elevacion', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-1" placeholder="Elevación" /></td>
                    <td className="px-4 py-2 border border-green-200"><button type="button" onClick={() => eliminarControlMaterial(index)} className="text-green-600 hover:text-green-800 text-sm font-semibold bg-green-100 px-2 py-1 rounded" disabled={formData.controlMaterial.length === 1}>{formData.controlMaterial.length === 1 ? '—' : 'Eliminar'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECCIÓN 6: CONTROL DE AGUA */}
        <div className="border-2 border-cyan-400 rounded-lg p-6 bg-cyan-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-800 border-b pb-2">CONTROL DE AGUA</h3>
            <button
              type="button"
              onClick={agregarControlAgua}
              className="bg-cyan-600 text-white px-4 py-2 rounded text-sm hover:bg-cyan-700 font-semibold"
            >
              + Agregar Fila
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden border border-cyan-300">
              <thead className="bg-cyan-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">No. ECONÓMICO</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">VIAJE</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">CAPACIDAD</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">VOLUMEN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">ORIGEN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">DESTINO</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-800 uppercase border border-cyan-300">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.controlAgua.map((agua, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-cyan-200">
                      <input
                        type="text"
                        value={agua.noEconomico}
                        onChange={(e) => actualizarControlAgua(index, 'noEconomico', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="No. Económico"
                      />
                    </td>
                    <td className="px-4 py-2 border border-cyan-200">
                      <input
                        type="number"
                        value={agua.viaje}
                        onChange={(e) => actualizarControlAgua(index, 'viaje', parseInt(e.target.value) || 0)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-2 border border-cyan-200">
                      <input
                        type="text"
                        value={agua.capacidad}
                        onChange={(e) => actualizarControlAgua(index, 'capacidad', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Capacidad"
                      />
                    </td>
                    <td className="px-4 py-2 border border-cyan-200">
                      <input
                        type="text"
                        value={agua.volumen}
                        onChange={(e) => actualizarControlAgua(index, 'volumen', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Volumen"
                      />
                    </td>
                    <td className="px-4 py-2 border border-cyan-200">
                      <input
                        type="text"
                        value={agua.origen}
                        onChange={(e) => actualizarControlAgua(index, 'origen', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Origen"
                      />
                    </td>
                    <td className="px-4 py-2 border border-cyan-200">
                      <input
                        type="text"
                        value={agua.destino}
                        onChange={(e) => actualizarControlAgua(index, 'destino', e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-1"
                        placeholder="Destino"
                      />
                    </td>
                    <td className="px-4 py-2 border border-cyan-200">
                      <button
                        type="button"
                        onClick={() => eliminarControlAgua(index)}
                        className="text-cyan-600 hover:text-cyan-800 text-sm font-semibold bg-cyan-100 px-2 py-1 rounded"
                        disabled={formData.controlAgua.length === 1}
                      >
                        {formData.controlAgua.length === 1 ? '—' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECCIÓN 7: CONTROL DE MAQUINARIA */}
        <div className="border-2 border-indigo-400 rounded-lg p-6 bg-indigo-50">
          <h3 className="text-xl font-bold mb-4 text-indigo-800 border-b pb-2">CONTROL DE MAQUINARIA</h3>
          <div className="space-y-4">
            {formData.controlMaquinaria.map((maquinaria, index) => (
              <div key={index} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-blue-800">Equipo #{index + 1}</h4>
                  {formData.controlMaquinaria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarControlMaquinaria(index)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✖ Eliminar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de Vehículo */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700">VEHÍCULO *</label>
                    <select
                      required
                      value={maquinaria.vehiculoId || ''}
                      onChange={(e) => seleccionarVehiculo(index, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    >
                      <option value="">Seleccione un vehículo...</option>
                      {vehiculosDisponibles.map(vehiculo => (
                        <option key={vehiculo._id} value={vehiculo._id}>
                          {vehiculo.nombre} - {vehiculo.noEconomico} ({vehiculo.tipo})
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Campos Auto-completados (solo lectura) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700">TIPO</label>
                    <input
                      type="text"
                      value={maquinaria.tipo}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">NOMBRE</label>
                    <input
                      type="text"
                      value={maquinaria.nombre}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">NO. ECONÓMICO</label>
                    <input
                      type="text"
                      value={maquinaria.numeroEconomico}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">HORÓMETRO INICIAL</label>
                    <input
                      type="number"
                      value={maquinaria.horometroInicial}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
                    />
                  </div>
                  {/* Horómetro Final - Editable */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700">HORÓMETRO FINAL *</label>
                    <input
                      type="number"
                      required
                      min={maquinaria.horometroInicial}
                      value={maquinaria.horometroFinal}
                      onChange={(e) => calcularHorasOperacion(index, Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                  </div>
                  {/* Horas de Operación - Calculado automáticamente */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700">HORAS DE OPERACIÓN</label>
                    <input
                      type="number"
                      value={maquinaria.horasOperacion}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-green-100 shadow-sm p-2 border font-bold text-green-700"
                    />
                  </div>
                  {/* Campos Editables */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700">OPERADOR *</label>
                    <input
                      type="text"
                      required
                      value={maquinaria.operador}
                      onChange={(e) => actualizarControlMaquinaria(index, 'operador', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700">ACTIVIDAD *</label>
                    <textarea
                      required
                      value={maquinaria.actividad}
                      onChange={(e) => actualizarControlMaquinaria(index, 'actividad', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={agregarControlMaquinaria}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 font-bold"
            >
              ➕ Agregar Equipo
            </button>
          </div>
        </div>

        {/* SECCIÓN 8: OBSERVACIONES */}
        <div className="border-2 border-yellow-400 rounded-lg p-6 bg-yellow-50">
          <h3 className="text-xl font-bold mb-4 text-yellow-800 border-b pb-2">OBSERVACIONES</h3>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 p-3 border"
            placeholder="Ej: Intemperismo: No lo conoce por tiempo para tener el actividades de 7.00 cca a los 9.30 cm."
          />
          <div className="mt-2 text-sm text-gray-600">
            <p>📝 <strong>Ejemplos de observaciones comunes:</strong></p>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>Condiciones climáticas durante el turno</li>
              <li>Incidentes o imprevistos en la operación</li>
              <li>Estado del equipo y maquinaria</li>
              <li>Observaciones de seguridad</li>
              <li>Comentarios sobre el personal</li>
            </ul>
          </div>
        </div>

        {/* SECCIÓN 9: CREADO POR */}
        <div className="border-2 border-gray-400 rounded-lg p-6 bg-gray-50">
          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">REGISTRADO POR</h3>
          <input
            type="text"
            value={formData.creadoPor}
            onChange={(e) => setFormData({ ...formData, creadoPor: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2 border"
            placeholder="Nombre de quien registra el reporte"
            required
          />
          <p className="text-sm text-gray-600 mt-2">
            💡 Este campo es obligatorio para identificar quién generó el reporte.
          </p>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white px-12 py-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 text-lg font-bold text-xl"
          >
            {loading ? '⏳ GUARDANDO REPORTE...' : '💾 GUARDAR REPORTE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioReporte;