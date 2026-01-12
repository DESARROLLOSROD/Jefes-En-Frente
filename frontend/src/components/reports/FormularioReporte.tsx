import React, { useState, useEffect } from 'react';
import { ReporteActividades, ControlMaquinaria } from '../../types/reporte';
import { reporteService, vehiculoService, personalService } from '../../services/api';
import { workZoneService } from '../../services/workZone.service';
import { useAuth } from '../../contexts/AuthContext';
import { Vehiculo } from '../../types/gestion';
import { Personal } from '../../types/personal';
import { WorkZone } from '../../types/workZone.types';
import SeccionControlAcarreo from './sections/SeccionControlAcarreo';
import SeccionControlMaterial from './sections/SeccionControlMaterial';
import SeccionControlAgua from './sections/SeccionControlAgua';
import SeccionPersonal from './sections/SeccionPersonal'; // ✨ NUEVO
import MapaPinSelector from '../mapas/MapaPinSelector';
import MapaMultiplesPins from '../mapas/MapaMultiplesPins';

interface FormularioReporteProps {
  reporteInicial?: ReporteActividades | null;
  onFinalizar?: () => void;
}

const FormularioReporteNew: React.FC<FormularioReporteProps> = ({ reporteInicial, onFinalizar }) => {
  const { proyecto, user, recargarProyectoActual } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>([]);
  const [zonasDisponibles, setZonasDisponibles] = useState<WorkZone[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<WorkZone | null>(null);
  const [operadores, setOperadores] = useState<Personal[]>([]);

  const [formData, setFormData] = useState<Omit<ReporteActividades, '_id' | 'fechaCreacion'>>({
    fecha: new Date().toISOString().split('T')[0],
    ubicacion: '',
    proyectoId: '',
    usuarioId: '',
    turno: 'primer',
    inicioActividades: '07:00',
    terminoActividades: '19:00',
    zonaTrabajo: { zonaId: '', zonaNombre: '' },
    seccionTrabajo: { seccionId: '', seccionNombre: '' },
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
    ubicacionMapa: undefined,
    pinesMapa: [],
    creadoPor: user?.nombre || '',
    personalAsignado: [] // ✨ NUEVO
  });

  const [usarMultiplesPins, setUsarMultiplesPins] = useState(false);

  // Recargar proyecto al montar el componente para asegurar que tiene el mapa
  useEffect(() => {
    recargarProyectoActual();
  }, []);

  // Cargar datos si estamos editando
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
        }],
        personalAsignado: reporteInicial.personalAsignado || []
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

  // Cargar zonas del proyecto
  useEffect(() => {
    const cargarZonas = async () => {
      if (proyecto?._id) {
        try {
          const zonas = await workZoneService.getZonesByProject(proyecto._id);
          setZonasDisponibles(zonas.filter(z => z.status === 'active'));

          // Si estamos editando, establecer la zona seleccionada
          if (reporteInicial && reporteInicial.zonaTrabajo?.zonaId) {
            const zonaInicial = zonas.find(z => z._id === reporteInicial.zonaTrabajo.zonaId);
            if (zonaInicial) {
              setZonaSeleccionada(zonaInicial);
            }
          }
        } catch (error) {
          console.error('Error al cargar zonas:', error);
        }
      }
    };
    cargarZonas();
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

  // Cargar operadores (Personal con cargo que incluye "OPERADOR")
  useEffect(() => {
    const cargarOperadores = async () => {
      if (proyecto?._id) {
        try {
          const response = await personalService.getPersonal(undefined, proyecto._id);
          if (response.success && response.data) {
            // Filtrar solo los que tienen "OPERADOR" en su cargo
            const soloOperadores = response.data.filter(p =>
              p.cargo?.nombre.toUpperCase().includes('OPERADOR')
            );
            setOperadores(soloOperadores);
          }
        } catch (error) {
          console.error('Error al cargar operadores:', error);
        }
      }
    };
    cargarOperadores();
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

  const handleZonaChange = (zonaId: string) => {
    const zona = zonasDisponibles.find(z => z._id === zonaId);
    if (zona) {
      setZonaSeleccionada(zona);
      setFormData(prev => ({
        ...prev,
        zonaTrabajo: {
          zonaId: zona._id,
          zonaNombre: zona.name
        },
        seccionTrabajo: { seccionId: '', seccionNombre: '' }
      }));
    }
  };

  const handleSeccionChange = (seccionId: string) => {
    if (zonaSeleccionada) {
      const seccion = zonaSeleccionada.sections.find(s => s.id === seccionId);
      if (seccion) {
        setFormData(prev => ({
          ...prev,
          seccionTrabajo: {
            seccionId: seccion.id,
            seccionNombre: seccion.name
          }
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    console.log('📋 FORMULARIO ENVIADO');
    console.log('📦 Control de Acarreo:', formData.controlAcarreo);
    console.log('📦 Control de Material:', formData.controlMaterial);
    console.log('📦 Control de Agua:', formData.controlAgua);
    console.log('📦 Control de Maquinaria:', formData.controlMaquinaria);
    console.log('📦 FormData completo:', formData);

    // Validación de horómetros
    for (const maq of formData.controlMaquinaria) {
      if (maq.vehiculoId && maq.horometroFinal < maq.horometroInicial) {
        setMensaje(`ERROR: EL HORÓMETRO FINAL NO PUEDE SER MENOR AL INICIAL PARA EL VEHÍCULO ${maq.nombre}`);
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
        setMensaje(reporteInicial ? 'REPORTE ACTUALIZADO EXITOSAMENTE!' : 'REPORTE CREADO EXITOSAMENTE!');

        if (!reporteInicial) {
          const hoy = new Date();
          const fechaLocal =
            hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, '0') + "-" +
            String(hoy.getDate()).padStart(2, '0');

          setFormData(prev => ({
            ...prev,
            fecha: fechaLocal,
            inicioActividades: prev.turno === 'primer' ? '07:00' : '19:00',
            terminoActividades: prev.turno === 'primer' ? '19:00' : '07:00',
            observaciones: '',
            creadoPor: user?.nombre || '',
          }));
        }

        if (onFinalizar) {
          setTimeout(() => {
            onFinalizar();
          }, 1500);
        }
      } else {
        setMensaje('ERROR: ' + resultado.error);
      }
    } catch (error) {
      setMensaje('ERROR DE CONEXIÓN CON EL SERVIDOR');
    } finally {
      setLoading(false);
    }
  };

  const handleTurnoChange = (nuevoTurno: 'primer' | 'segundo') => {
    setFormData(prev => ({
      ...prev,
      turno: nuevoTurno,
      inicioActividades: nuevoTurno === 'primer' ? '07:00' : '19:00',
      terminoActividades: nuevoTurno === 'primer' ? '19:00' : '07:00'
    }));
  };

  // Funciones para control de maquinaria
  const agregarControlMaquinaria = () => {
    setFormData(prev => ({
      ...prev,
      controlMaquinaria: [
        ...prev.controlMaquinaria,
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
    }));
  };

  const actualizarControlMaquinaria = (index: number, campo: keyof ControlMaquinaria, valor: string | number) => {
    setFormData(prev => {
      const nuevaMaquinaria = [...prev.controlMaquinaria];
      nuevaMaquinaria[index] = { ...nuevaMaquinaria[index], [campo]: valor };
      return { ...prev, controlMaquinaria: nuevaMaquinaria };
    });
  };

  const eliminarControlMaquinaria = (index: number) => {
    if (formData.controlMaquinaria.length > 1) {
      setFormData(prev => ({
        ...prev,
        controlMaquinaria: prev.controlMaquinaria.filter((_, i) => i !== index)
      }));
    }
  };

  const seleccionarVehiculo = (index: number, vehiculoId: string) => {
    const vehiculo = vehiculosDisponibles.find(v => v._id === vehiculoId);
    if (vehiculo) {
      setFormData(prev => {
        const nuevaMaquinaria = [...prev.controlMaquinaria];
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
        return { ...prev, controlMaquinaria: nuevaMaquinaria };
      });
    }
  };

  const calcularHorasOperacion = (index: number, horometroFinal: number) => {
    setFormData(prev => {
      const nuevaMaquinaria = [...prev.controlMaquinaria];
      const horometroInicial = nuevaMaquinaria[index].horometroInicial;
      nuevaMaquinaria[index] = {
        ...nuevaMaquinaria[index],
        horometroFinal,
        horasOperacion: horometroFinal - horometroInicial
      };
      return { ...prev, controlMaquinaria: nuevaMaquinaria };
    });
  };

  // Funciones para manejar el pin en el mapa
  const handlePinChange = (x: number, y: number) => {
    setFormData(prev => ({
      ...prev,
      ubicacionMapa: {
        pinX: x,
        pinY: y,
        colocado: true
      }
    }));
  };

  const handlePinRemove = () => {
    setFormData(prev => ({
      ...prev,
      ubicacionMapa: undefined
    }));
  };

  const handlePinsMultiplesChange = (pins: Array<{ id: string; pinX: number; pinY: number; etiqueta: string; color?: string }>) => {
    setFormData(prev => ({
      ...prev,
      pinesMapa: pins
    }));
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
        <div className={`p-4 mb-6 rounded-lg ${mensaje.includes('EXITOSAMENTE') ? 'bg-green-100 text-green-700 border border-green-300' :
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
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
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
                <option value="primer">PRIMER TURNO (7:00 AM - 7:00 PM)</option>
                <option value="segundo">SEGUNDO TURNO (7:00 PM - 7:00 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">INICIO ACTIVIDADES</label>
              <input
                type="time"
                value={formData.inicioActividades}
                onChange={(e) => setFormData(prev => ({ ...prev, inicioActividades: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">TÉRMINO ACTIVIDADES</label>
              <input
                type="time"
                value={formData.terminoActividades}
                onChange={(e) => setFormData(prev => ({ ...prev, terminoActividades: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">ZONA DE TRABAJO</label>
              <select
                value={formData.zonaTrabajo.zonaId}
                onChange={(e) => handleZonaChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border uppercase"
                required
              >
                <option value="">SELECCIONAR ZONA</option>
                {zonasDisponibles.map((zona) => (
                  <option key={zona._id} value={zona._id}>
                    {zona.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">SECCIÓN DE TRABAJO</label>
              <select
                value={formData.seccionTrabajo.seccionId}
                onChange={(e) => handleSeccionChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border uppercase"
                required
                disabled={!zonaSeleccionada || zonaSeleccionada.sections.length === 0}
              >
                <option value="">SELECCIONAR SECCIÓN</option>
                {zonaSeleccionada?.sections.filter(s => s.status === 'active').map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">JEFE DE FRENTE</label>
              <input
                type="text"
                value={formData.jefeFrente}
                onChange={(e) => setFormData(prev => ({ ...prev, jefeFrente: e.target.value.toUpperCase() }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">SOBRESTANTE</label>
              <input
                type="text"
                value={formData.sobrestante}
                onChange={(e) => setFormData(prev => ({ ...prev, sobrestante: e.target.value.toUpperCase() }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border uppercase"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: UBICACIÓN EN MAPA */}
        {(() => {
          console.log('🗺️ Verificando si mostrar mapa:');
          console.log('- proyecto:', proyecto);
          console.log('- proyecto?.mapa:', proyecto?.mapa);
          console.log('- proyecto?.mapa?.imagen:', proyecto?.mapa?.imagen);
          console.log('- proyecto?.mapa?.imagen?.data:', proyecto?.mapa?.imagen?.data ? 'SÍ TIENE' : 'NO TIENE');
          console.log('- Condición cumplida:', !!proyecto?.mapa?.imagen?.data);
          return null;
        })()}
        {proyecto?.mapa?.imagen?.data && (
          <div className="border-2 border-blue-400 rounded-lg p-6 bg-blue-50">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-blue-800">UBICACIÓN EN MAPA DEL PROYECTO</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">MÚLTIPLES PINS:</label>
                <button
                  type="button"
                  onClick={() => setUsarMultiplesPins(!usarMultiplesPins)}
                  className={`px-3 py-1 rounded text-sm font-semibold ${usarMultiplesPins
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                    }`}
                >
                  {usarMultiplesPins ? 'ACTIVADO' : 'DESACTIVADO'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {usarMultiplesPins
                ? 'AGREGUE MÚLTIPLES PINS CON ETIQUETAS PARA MARCAR DIFERENTES UBICACIONES'
                : 'COLOQUE UN PIN EN EL MAPA PARA INDICAR DÓNDE SE REALIZÓ EL TRABAJO (OPCIONAL)'}
            </p>
            {usarMultiplesPins ? (
              <MapaMultiplesPins
                mapaImagen={`data:${proyecto.mapa.imagen.contentType};base64,${proyecto.mapa.imagen.data}`}
                pins={formData.pinesMapa || []}
                onPinsChange={handlePinsMultiplesChange}
              />
            ) : (
              <MapaPinSelector
                mapaImagen={`data:${proyecto.mapa.imagen.contentType};base64,${proyecto.mapa.imagen.data}`}
                pinX={formData.ubicacionMapa?.pinX}
                pinY={formData.ubicacionMapa?.pinY}
                onPinChange={handlePinChange}
                onPinRemove={handlePinRemove}
              />
            )}
          </div>
        )}

        {/* SECCIÓN 3: CONTROL DE ACARREOS (NUEVO COMPONENTE MODULAR) */}
        <SeccionControlAcarreo
          acarreos={formData.controlAcarreo}
          onAcarreosChange={(acarreos) => setFormData(prev => ({ ...prev, controlAcarreo: acarreos }))}
        />

        {/* SECCIÓN 3: CONTROL DE MATERIAL (NUEVO COMPONENTE MODULAR) */}
        <SeccionControlMaterial
          materiales={formData.controlMaterial}
          onMaterialesChange={(materiales) => setFormData(prev => ({ ...prev, controlMaterial: materiales }))}
        />

        {/* SECCIÓN 4: CONTROL DE AGUA (NUEVO COMPONENTE MODULAR) */}
        <SeccionControlAgua
          aguas={formData.controlAgua}
          onAguasChange={(aguas) => setFormData(prev => ({ ...prev, controlAgua: aguas }))}
          proyectoId={proyecto?._id}
        />

        {/* SECCIÓN 5: CONTROL DE PERSONAL (NUEVO) */}
        <SeccionPersonal
          personalAsignado={formData.personalAsignado || []}
          onPersonalChange={(personal) => setFormData(prev => ({ ...prev, personalAsignado: personal }))}
          proyectoId={proyecto?._id}
        />

        {/* SECCIÓN 6: CONTROL DE MAQUINARIA */}
        <div className="border-2 border-purple-400 rounded-lg p-6 bg-purple-50">
          <h3 className="text-xl font-bold mb-4 text-purple-800 border-b pb-2">CONTROL DE MAQUINARIA</h3>
          {formData.controlMaquinaria.map((maq, index) => (
            <div key={index} className="bg-white p-4 rounded-lg mb-4 shadow">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-700">MÁQUINA {index + 1}</h4>
                {formData.controlMaquinaria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarControlMaquinaria(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    ELIMINAR
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">VEHÍCULO</label>
                  <select
                    value={maq.vehiculoId}
                    onChange={(e) => seleccionarVehiculo(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  >
                    <option value="">SELECCIONE VEHÍCULO...</option>
                    {vehiculosDisponibles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.nombre} - {v.noEconomico}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HORÓMETRO INICIAL</label>
                  <input
                    type="number"
                    value={maq.horometroInicial || 0}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 font-semibold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HORÓMETRO FINAL</label>
                  <input
                    type="number"
                    value={maq.horometroFinal || 0}
                    onChange={(e) => calcularHorasOperacion(index, Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">HORAS DE OPERACIÓN</label>
                  <input
                    type="number"
                    value={maq.horasOperacion || 0}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100 font-bold text-purple-600"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">OPERADOR</label>
                  <input
                    type="text"
                    list={`operadores-list-${index}`}
                    value={maq.operador}
                    onChange={(e) => actualizarControlMaquinaria(index, 'operador', e.target.value.toUpperCase())}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border uppercase"
                    placeholder="BUSCAR OPERADOR..."
                  />
                  <datalist id={`operadores-list-${index}`}>
                    {operadores.map((op) => (
                      <option key={op._id} value={op.nombreCompleto} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ACTIVIDAD</label>
                  <input
                    type="text"
                    value={maq.actividad}
                    onChange={(e) => actualizarControlMaquinaria(index, 'actividad', e.target.value.toUpperCase())}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border uppercase"
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
            + AGREGAR MAQUINARIA
          </button>
        </div>

        {/* SECCIÓN 7: OBSERVACIONES */}
        <div className="border-2 border-gray-400 rounded-lg p-6 bg-gray-50">
          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">OBSERVACIONES</h3>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value.toUpperCase() }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-2 border uppercase"
            placeholder="ESCRIBA CUALQUIER OBSERVACIÓN ADICIONAL..."
          />
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'GUARDANDO...' : (reporteInicial ? 'ACTUALIZAR REPORTE' : 'GUARDAR REPORTE')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioReporteNew;
