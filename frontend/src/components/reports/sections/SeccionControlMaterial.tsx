import React, { useState, useEffect } from 'react';
import { ControlMaterial, IMaterialCatalog } from '../../../types/reporte';
import ModalControlMaterial from '../../shared/modals/ModalControlMaterial';
import { materialService } from '../../../services/materialService';

interface SeccionControlMaterialProps {
  materiales: ControlMaterial[];
  onMaterialesChange: (materiales: ControlMaterial[]) => void;
}

const SeccionControlMaterial: React.FC<SeccionControlMaterialProps> = ({
  materiales,
  onMaterialesChange
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [materialEditando, setMaterialEditando] = useState<{
    index: number;
    data: ControlMaterial;
  } | null>(null);

  const [listaMateriales, setListaMateriales] = useState<IMaterialCatalog[]>([]);

  useEffect(() => {
    cargarMateriales();
  }, []);

  const cargarMateriales = async () => {
    try {
      const response = await materialService.obtenerMateriales();
      if (response.success && response.data) {
        setListaMateriales(response.data);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
    }
  };

  const handleCrearMaterial = async (nombre: string, unidad: string): Promise<IMaterialCatalog | null> => {
    const response = await materialService.crearMaterial({ nombre, unidad });
    if (response.success && response.data) {
      setListaMateriales(prev => [...prev, response.data!].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return response.data;
    }
    return null;
  };

  const handleAgregarNuevo = () => {
    setMaterialEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (index: number) => {
    setMaterialEditando({ index, data: materiales[index] });
    setModalOpen(true);
  };

  const handleGuardar = (material: ControlMaterial) => {
    console.log('🚀 handleGuardar llamado con:', material);
    console.log('📦 Materiales actuales:', materiales);
    if (materialEditando !== null) {
      const nuevosMateriales = [...materiales];
      nuevosMateriales[materialEditando.index] = material;
      console.log('✏️ Editando material en índice:', materialEditando.index);
      console.log('📦 Nuevos materiales:', nuevosMateriales);
      onMaterialesChange(nuevosMateriales);
    } else {
      // Si el primer elemento está vacío (registro inicial), reemplazarlo
      const primerElementoVacio = materiales.length === 1 &&
        !materiales[0].material &&
        !materiales[0].cantidad;

      const nuevosMateriales = primerElementoVacio ? [material] : [...materiales, material];
      console.log('➕ Agregando nuevo material');
      console.log('🔄 Primer elemento vacío:', primerElementoVacio);
      console.log('📦 Nuevos materiales:', nuevosMateriales);
      onMaterialesChange(nuevosMateriales);
    }
  };

  const handleEliminar = (index: number) => {
    if (materiales.length > 1) {
      const nuevosMateriales = materiales.filter((_, i) => i !== index);
      onMaterialesChange(nuevosMateriales);
    } else {
      alert('DEBE HABER AL MENOS UN REGISTRO');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">CONTROL DE MATERIAL</h3>
        <button
          type="button"
          onClick={handleAgregarNuevo}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center"
        >
          <span className="mr-2">+</span> AGREGAR MATERIAL
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">MATERIAL</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">UNIDAD</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CANTIDAD</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ZONA</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ELEVACIÓN</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {materiales.map((material, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{material.material || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{material.unidad || '-'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{material.cantidad || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{material.zona || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{material.elevacion || '-'}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="text-green-600 hover:text-green-800 mr-3 font-semibold"
                  >
                    EDITAR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(index)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                    disabled={materiales.length === 1}
                  >
                    ELIMINAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalControlMaterial
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setMaterialEditando(null);
        }}
        onSave={handleGuardar}
        materialInicial={materialEditando?.data || null}
        title={materialEditando !== null ? 'EDITAR CONTROL DE MATERIAL' : 'AGREGAR CONTROL DE MATERIAL'}
        listaMateriales={listaMateriales}
        onCrearMaterial={handleCrearMaterial}
      />
    </div>
  );
};

export default SeccionControlMaterial;
