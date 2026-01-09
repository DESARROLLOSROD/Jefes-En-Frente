import React, { useState, useEffect } from 'react';
import { ReportePersonal, Personal, CatCargo } from '../../../types/personal';
import { personalService, cargosService } from '../../../services/api';
import ModalReportePersonal from '../../shared/modals/ModalReportePersonal';
import ModalConfirmacion from '../../shared/modals/ModalConfirmacion';

interface SeccionPersonalProps {
    personalAsignado: ReportePersonal[];
    onPersonalChange: (data: ReportePersonal[]) => void;
    proyectoId?: string;
}

const SeccionPersonal: React.FC<SeccionPersonalProps> = ({
    personalAsignado,
    onPersonalChange,
    proyectoId
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
    const [personalDisponibles, setPersonalDisponibles] = useState<Personal[]>([]);
    const [cargosDisponibles, setCargosDisponibles] = useState<CatCargo[]>([]);

    // Eliminación
    const [confirmacionOpen, setConfirmacionOpen] = useState(false);
    const [indiceEliminar, setIndiceEliminar] = useState<number | null>(null);

    useEffect(() => {
        cargarCatalogos();
    }, [proyectoId]);

    const cargarCatalogos = async () => {
        try {
            // Cargar cargos
            const resCargos = await cargosService.getCargos();
            if (resCargos.success && resCargos.data) {
                setCargosDisponibles(resCargos.data);
            }

            // Cargar personal (filtrado por proyecto si existe)
            const resPersonal = await personalService.getPersonal(undefined, proyectoId);
            if (resPersonal.success && resPersonal.data) {
                setPersonalDisponibles(resPersonal.data.filter(p => p.activo));
            }
        } catch (error) {
            console.error("Error cargando catálogos de personal", error);
        }
    };

    const handleAgregar = () => {
        setEditandoIndex(null);
        setModalOpen(true);
    };

    const handleEditar = (index: number) => {
        setEditandoIndex(index);
        setModalOpen(true);
    };

    const handleGuardar = (data: ReportePersonal) => {
        const nuevosDatos = [...(personalAsignado || [])];

        // Populate UI fields explicitly for immediate feedback
        const persona = personalDisponibles.find(p => p._id === data.personalId);
        const cargo = cargosDisponibles.find(c => c._id === data.cargoId);

        const dataConDetalles = {
            ...data,
            personal: persona,
            cargo: cargo
        };

        if (editandoIndex !== null) {
            nuevosDatos[editandoIndex] = dataConDetalles;
        } else {
            nuevosDatos.push(dataConDetalles);
        }

        onPersonalChange(nuevosDatos);
    };

    const handleEliminarClick = (index: number) => {
        setIndiceEliminar(index);
        setConfirmacionOpen(true);
    };

    const confirmarEliminacion = () => {
        if (indiceEliminar !== null) {
            const nuevosDatos = personalAsignado.filter((_, i) => i !== indiceEliminar);
            onPersonalChange(nuevosDatos);
            setIndiceEliminar(null);
            setConfirmacionOpen(false);
        }
    };

    const getNombrePersonal = (id: string, obj?: Personal) => {
        if (obj) return obj.nombreCompleto;
        return personalDisponibles.find(p => p._id === id)?.nombreCompleto || 'Cargando...';
    };

    const getNombreCargo = (id?: string, obj?: CatCargo) => {
        if (!id) return '-';
        if (obj) return obj.nombre;
        return cargosDisponibles.find(c => c._id === id)?.nombre || '-';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">CONTROL DE PERSONAL</h3>
                <button
                    type="button"
                    onClick={handleAgregar}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center"
                >
                    <span className="mr-2">+</span> ASIGNAR PERSONAL
                </button>
            </div>

            {/* Tabla Responsive */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-green-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PERSONAL</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CARGO</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ACTIVIDAD</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">HORAS</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {(!personalAsignado || personalAsignado.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                    NO HAY PERSONAL ASIGNADO A ESTE REPORTE
                                </td>
                            </tr>
                        ) : (
                            personalAsignado.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {getNombrePersonal(item.personalId, item.personal)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                            {getNombreCargo(item.cargoId, item.cargo)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 uppercase">
                                        {item.actividadRealizada || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-700">
                                        {item.horasTrabajadas} H
                                    </td>
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
                                        >
                                            ELIMINAR
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ModalReportePersonal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleGuardar}
                dataInicial={editandoIndex !== null ? personalAsignado[editandoIndex] : null}
                personalDisponibles={personalDisponibles}
                cargosDisponibles={cargosDisponibles}
            />

            <ModalConfirmacion
                isOpen={confirmacionOpen}
                onClose={() => setConfirmacionOpen(false)}
                onConfirm={confirmarEliminacion}
                title="CONFIRMAR ELIMINACIÓN"
                mensaje={<span>¿ESTÁS SEGURO DE QUITAR A ESTE PERSONAL DEL REPORTE?</span>}
                confirmText="QUITAR"
                cancelText="CANCELAR"
            />
        </div>
    );
};

export default SeccionPersonal;
