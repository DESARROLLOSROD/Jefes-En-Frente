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
    if (acarreoEditando !== null) {
      // Editando existente
      const nuevosAcarreos = [...acarreos];
      nuevosAcarreos[acarreoEditando.index] = acarreo;
      onAcarreosChange(nuevosAcarreos);
    } else {
      // Agregando nuevo
      onAcarreosChange([...acarreos, acarreo]);
    }
  };

  const handleEliminar = (index: number) => {
    if (acarreos.length > 1) {
      const nuevosAcarreos = acarreos.filter((_, i) => i !== index);
      onAcarreosChange(nuevosAcarreos);
    } else {
      alert('Debe haber al menos un registro');
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
        <h3 className="text-xl font-bold text-gray-800">Control de Acarreos</h3>
        <button
          type="button"
          onClick={handleAgregarNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center"
        >
          <span className="mr-2">+</span> Agregar Acarreo
        </button>
      </div>

      {/* Tabla responsiva */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Material</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No. Viajes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Capacidad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vol. Suelto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Origen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destino</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {acarreos.map((acarreo, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.material || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.noViaje || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.capacidad || '-'} m³</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-600">
                  {acarreo.volSuelto || '0.00'} m³
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.capaOrigen || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{acarreo.destino || '-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="text-blue-600 hover:text-blue-800 mr-3 font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    disabled={acarreos.length === 1}
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
              <td className="px-4 py-3 text-sm font-bold text-blue-700">
                {calcularTotalVolumen()} m³
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
        title={acarreoEditando !== null ? 'Editar Control de Acarreo' : 'Agregar Control de Acarreo'}
      />
    </div>
  );
};

export default SeccionControlAcarreo;
