import React, { useState } from 'react';
import { ControlAgua } from '../../../types/reporte';
import ModalControlAgua from '../../shared/modals/ModalControlAgua';

interface SeccionControlAguaProps {
  aguas: ControlAgua[];
  onAguasChange: (aguas: ControlAgua[]) => void;
}

const SeccionControlAgua: React.FC<SeccionControlAguaProps> = ({
  aguas,
  onAguasChange
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [aguaEditando, setAguaEditando] = useState<{
    index: number;
    data: ControlAgua;
  } | null>(null);

  const handleAgregarNuevo = () => {
    setAguaEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (index: number) => {
    setAguaEditando({ index, data: aguas[index] });
    setModalOpen(true);
  };

  const handleGuardar = (agua: ControlAgua) => {
    console.log('🚀 handleGuardar AGUA llamado con:', agua);
    console.log('📦 Aguas actuales:', aguas);
    if (aguaEditando !== null) {
      const nuevasAguas = [...aguas];
      nuevasAguas[aguaEditando.index] = agua;
      console.log('✏️ Editando agua en índice:', aguaEditando.index);
      console.log('📦 Nuevas aguas:', nuevasAguas);
      onAguasChange(nuevasAguas);
    } else {
      // Si el primer elemento está vacío (registro inicial), reemplazarlo
      const primerElementoVacio = aguas.length === 1 &&
        !aguas[0].noEconomico &&
        aguas[0].viaje === 0;

      const nuevasAguas = primerElementoVacio ? [agua] : [...aguas, agua];
      console.log('➕ Agregando nueva agua');
      console.log('🔄 Primer elemento vacío:', primerElementoVacio);
      console.log('📦 Nuevas aguas:', nuevasAguas);
      onAguasChange(nuevasAguas);
    }
  };

  const handleEliminar = (index: number) => {
    if (aguas.length > 1) {
      const nuevasAguas = aguas.filter((_, i) => i !== index);
      onAguasChange(nuevasAguas);
    } else {
      alert('DEBE HABER AL MENOS UN REGISTRO');
    }
  };

  const calcularTotalVolumen = () => {
    return aguas
      .reduce((sum, a) => sum + (parseFloat(a.volumen) || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">CONTROL DE AGUA</h3>
        <button
          type="button"
          onClick={handleAgregarNuevo}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors font-semibold shadow-md flex items-center"
        >
          <span className="mr-2">+</span> AGREGAR AGUA
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-cyan-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">NO. ECONÓMICO</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">VIAJES</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CAPACIDAD</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">VOLUMEN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ORIGEN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">DESTINO</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {aguas.map((agua, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{agua.noEconomico || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.viaje || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.capacidad || '-'} M³</td>
                <td className="px-4 py-3 text-sm font-bold text-cyan-600">
                  {agua.volumen || '0.00'} M³
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.origen || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.destino || '-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="text-cyan-600 hover:text-cyan-800 mr-3 font-semibold"
                  >
                    EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    disabled={aguas.length === 1}
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
              <td className="px-4 py-3 text-sm font-bold text-cyan-700">
                {calcularTotalVolumen()} M³
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ModalControlAgua
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAguaEditando(null);
        }}
        onSave={handleGuardar}
        aguaInicial={aguaEditando?.data || null}
        title={aguaEditando !== null ? 'EDITAR CONTROL DE AGUA' : 'AGREGAR CONTROL DE AGUA'}
      />
    </div>
  );
};

export default SeccionControlAgua;
