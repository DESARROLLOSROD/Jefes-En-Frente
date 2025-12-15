import React, { useState, useEffect } from 'react';
import { ControlAcarreo, IMaterialCatalog, ICapacidadCatalog } from '../../../types/reporte';
import ModalControlAcarreo from '../../shared/modals/ModalControlAcarreo';
import ModalConfirmacion from '../../shared/modals/ModalConfirmacion';
import { materialService } from '../../../services/materialService';
import { capacidadService } from '../../../services/capacidadService';
import { origenService, IOrigen } from '../../../services/origenService';
import { destinoService, IDestino } from '../../../services/destinoService';


interface SeccionControlAcarreoProps {
  acarreos: ControlAcarreo[];
  onAcarreosChange: (acarreos: ControlAcarreo[]) => void;
}

const SeccionControlAcarreo: React.FC<SeccionControlAcarreoProps> = ({
  acarreos,
  onAcarreosChange
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [acarreoEditando, setAcarreoEditando] = useState<{
    index: number;
    data: ControlAcarreo;
  } | null>(null);

  const [listaMateriales, setListaMateriales] = useState<IMaterialCatalog[]>([]);
  const [listaCapacidades, setListaCapacidades] = useState<ICapacidadCatalog[]>([]);
  const [listaOrigenes, setListaOrigenes] = useState<IOrigen[]>([]);
  const [listaDestinos, setListaDestinos] = useState<IDestino[]>([]);

  // Estado para eliminación
  const [confirmacionOpen, setConfirmacionOpen] = useState(false);
  const [indiceEliminar, setIndiceEliminar] = useState<number | null>(null);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      // Cargar Materiales
      const responseMateriales = await materialService.obtenerMateriales();
      if (responseMateriales.success && responseMateriales.data) {
        setListaMateriales(responseMateriales.data);
      }

      // Cargar Capacidades
      const responseCapacidades = await capacidadService.obtenerCapacidades();
      if (responseCapacidades.success && responseCapacidades.data) {
        setListaCapacidades(responseCapacidades.data);
      }

      // Cargar Orígenes
      const responseOrigenes = await origenService.obtenerOrigenes();
      if (responseOrigenes.success && responseOrigenes.data) {
        setListaOrigenes(responseOrigenes.data);
      }

      // Cargar Destinos
      const responseDestinos = await destinoService.obtenerDestinos();
      if (responseDestinos.success && responseDestinos.data) {
        setListaDestinos(responseDestinos.data);
      }
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

  const handleCrearMaterial = async (nombre: string): Promise<IMaterialCatalog | null> => {
    const response = await materialService.crearMaterial({ nombre });
    if (response.success && response.data) {
      setListaMateriales(prev => [...prev, response.data!].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return response.data;
    }
    return null;
  };

  const handleCrearCapacidad = async (valor: string): Promise<ICapacidadCatalog | null> => {
    const response = await capacidadService.crearCapacidad({ valor });
    if (response.success && response.data) {
      setListaCapacidades(prev => {
        const nuevaLista = [...prev, response.data!];
        // Ordenar numéricamente
        return nuevaLista.sort((a, b) => {
          const valA = parseFloat(a.valor);
          const valB = parseFloat(b.valor);
          if (!isNaN(valA) && !isNaN(valB)) {
            return valA - valB;
          }
          return a.valor.localeCompare(b.valor);
        });
      });
      return response.data;
    }
    return null;
  };

  const handleCrearOrigen = async (nombre: string): Promise<IOrigen | null> => {
    const response = await origenService.crearOrigen({ nombre });
    if (response.success && response.data) {
      setListaOrigenes(prev => [...prev, response.data!].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return response.data;
    }
    return null;
  };

  const handleCrearDestino = async (nombre: string): Promise<IDestino | null> => {
    const response = await destinoService.crearDestino({ nombre });
    if (response.success && response.data) {
      setListaDestinos(prev => [...prev, response.data!].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return response.data;
    }
    return null;
  };

  const handleAgregarNuevo = () => {
    setAcarreoEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (index: number) => {
    setAcarreoEditando({ index, data: acarreos[index] });
    setModalOpen(true);
  };

  const handleGuardar = (acarreo: ControlAcarreo) => {
    console.log('🚀 handleGuardar llamado con:', acarreo);
    console.log('📦 Acarreos actuales:', acarreos);
    if (acarreoEditando !== null) {
      // Editando existente
      const nuevosAcarreos = [...acarreos];
      nuevosAcarreos[acarreoEditando.index] = acarreo;
      console.log('✏️ Editando acarreo en índice:', acarreoEditando.index);
      console.log('📦 Nuevos acarreos:', nuevosAcarreos);
      onAcarreosChange(nuevosAcarreos);
    } else {
      // Agregando nuevo
      // Si el primer elemento está vacío (registro inicial), reemplazarlo
      const primerElementoVacio = acarreos.length === 1 &&
        !acarreos[0].material &&
        acarreos[0].noViaje === 0;

      const nuevosAcarreos = primerElementoVacio ? [acarreo] : [...acarreos, acarreo];
      console.log('➕ Agregando nuevo acarreo');
      console.log('🔄 Primer elemento vacío:', primerElementoVacio);
      console.log('📦 Nuevos acarreos:', nuevosAcarreos);
      onAcarreosChange(nuevosAcarreos);
    }
  };

  const handleEliminarClick = (index: number) => {
    if (acarreos.length <= 1) {
      alert('DEBE HABER AL MENOS UN REGISTRO');
      return;
    }
    setIndiceEliminar(index);
    setConfirmacionOpen(true);
  };

  const confirmarEliminacion = () => {
    if (indiceEliminar !== null) {
      const nuevosAcarreos = acarreos.filter((_, i) => i !== indiceEliminar);
      onAcarreosChange(nuevosAcarreos);
      setIndiceEliminar(null);
    }
  };

  const calcularTotalVolumen = () => {
    return acarreos
      .reduce((sum, a) => sum + (parseFloat(a.volSuelto) || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">CONTROL DE ACARREOS</h3>
        <button
          type="button"
          onClick={handleAgregarNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center"
        >
          <span className="mr-2">+</span> AGREGAR ACARREO
        </button>
      </div>

      {/* Tabla responsiva */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">MATERIAL</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">NO. VIAJES</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CAPACIDAD</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">VOL. SUELTO</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CAPA</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ELEVACION</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ORIGEN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">DESTINO</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {acarreos.map((acarreo, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.material || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.noViaje || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.capacidad || '-'} M³</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">
                  {acarreo.volSuelto || '0.00'} M³
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.capaNo || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.elevacionAriza || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.capaOrigen || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.destino || '-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="text-blue-600 hover:text-blue-800 mr-3 font-semibold"
                  >
                    EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminarClick(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    disabled={acarreos.length === 1}
                  >
                    ELIMINAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                TOTAL VOLUMEN:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-blue-700">
                {calcularTotalVolumen()} M³
              </td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal Acarreo */}
      <ModalControlAcarreo
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAcarreoEditando(null);
        }}
        onSave={handleGuardar}
        acarreoInicial={acarreoEditando?.data || null}
        title={acarreoEditando !== null ? 'EDITAR CONTROL DE ACARREO' : 'AGREGAR CONTROL DE ACARREO'}
        listaMateriales={listaMateriales}
        onCrearMaterial={handleCrearMaterial}
        listaCapacidades={listaCapacidades}
        onCrearCapacidad={handleCrearCapacidad}
        listaOrigenes={listaOrigenes}
        onCrearOrigen={handleCrearOrigen}
        listaDestinos={listaDestinos}
        onCrearDestino={handleCrearDestino}
      />

      {/* Modal Confirmación */}
      <ModalConfirmacion
        isOpen={confirmacionOpen}
        onClose={() => {
          setConfirmacionOpen(false);
          setIndiceEliminar(null);
        }}
        onConfirm={confirmarEliminacion}
        title="CONFIRMAR ELIMINACIÓN"
        mensaje={
          <span>
            ¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR ESTE REGISTRO DE ACARREO?
            <br />
            <span className="text-red-600 font-semibold">ESTA ACCIÓN NO SE PUEDE DESHACER.</span>
          </span>
        }
        confirmText="ELIMINAR"
        cancelText="CANCELAR"
      />
    </div>
  );
};

export default SeccionControlAcarreo;
