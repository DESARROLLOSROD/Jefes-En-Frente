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
    if (aguaEditando !== null) {
      const nuevasAguas = [...aguas];
      nuevasAguas[aguaEditando.index] = agua;
      onAguasChange(nuevasAguas);
    } else {
      onAguasChange([...aguas, agua]);
    }
  };

  const handleEliminar = (index: number) => {
    if (aguas.length > 1) {
      const nuevasAguas = aguas.filter((_, i) => i !== index);
      onAguasChange(nuevasAguas);
    } else {
      alert('Debe haber al menos un registro');
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
        <h3 className="text-xl font-bold text-gray-800">Control de Agua</h3>
        <button
          type="button"
          onClick={handleAgregarNuevo}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors font-semibold shadow-md flex items-center"
        >
          <span className="mr-2">+</span> Agregar Agua
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-cyan-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No. Económico</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Viajes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Capacidad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Volumen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Origen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destino</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {aguas.map((agua, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{agua.noEconomico || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.viaje || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.capacidad || '-'} m³</td>
                <td className="px-4 py-3 text-sm font-bold text-cyan-600">
                  {agua.volumen || '0.00'} m³
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.origen || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{agua.destino || '-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="text-cyan-600 hover:text-cyan-800 mr-3 font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    disabled={aguas.length === 1}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                Total Volumen:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-cyan-700">
                {calcularTotalVolumen()} m³
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
        title={aguaEditando !== null ? 'Editar Control de Agua' : 'Agregar Control de Agua'}
      />
    </div>
  );
};

export default SeccionControlAgua;
