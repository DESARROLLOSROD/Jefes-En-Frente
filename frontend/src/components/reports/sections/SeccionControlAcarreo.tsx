import React, { useState } from 'react';
import { ControlAcarreo } from '../../../types/reporte';
import ModalControlAcarreo from '../../shared/modals/ModalControlAcarreo';

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

  const handleEliminar = (index: number) => {
    if (acarreos.length > 1) {
      const nuevosAcarreos = acarreos.filter((_, i) => i !== index);
      onAcarreosChange(nuevosAcarreos);
    } else {
      alert('DEBE HABER AL MENOS UN REGISTRO');
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
                    onClick={() => handleEliminar(index)}
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
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal */}
      <ModalControlAcarreo
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAcarreoEditando(null);
        }}
        onSave={handleGuardar}
        acarreoInicial={acarreoEditando?.data || null}
        title={acarreoEditando !== null ? 'EDITAR CONTROL DE ACARREO' : 'AGREGAR CONTROL DE ACARREO'}
      />
    </div>
  );
};

export default SeccionControlAcarreo;
