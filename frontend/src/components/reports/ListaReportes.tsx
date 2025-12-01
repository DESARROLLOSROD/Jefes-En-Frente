import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ReporteActividades } from '../../types/reporte';
import { reporteService } from '../../services/api';
import { generarPDFReporte } from '../../utils/pdfGenerator';

interface ListaReportesProps {
  onEditar: (reporte: ReporteActividades) => void;
}

const ListaReportes: React.FC<ListaReportesProps> = ({ onEditar }) => {
  const [reportes, setReportes] = useState<ReporteActividades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { proyecto, user } = useAuth();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [reporteEliminar, setReporteEliminar] = useState<ReporteActividades | null>(null);

  // Load reports when project changes
  useEffect(() => {
    cargarReportes();
  }, [proyecto]);


  const formatFecha = (iso: string) => {
    const f = iso.slice(0, 10); // 2025-11-27
    const [yyyy, mm, dd] = f.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const cargarReportes = async () => {
    if (!proyecto?._id) {
      setError('No hay proyecto seleccionado');
      setLoading(false);
      return;
    }
    try {
      const resultado = await reporteService.obtenerReportes(proyecto._id);
      if (resultado.success && resultado.data) {
        setReportes(resultado.data);
        setError('');
      } else {
        setError('Error al cargar reportes: ' + (resultado.error || 'Desconocido'));
      }
    } catch (e) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarClick = (reporte: ReporteActividades) => {
    setReporteEliminar(reporte);
    setMostrarConfirmacion(true);
  };

  const mostrarMensaje = (texto: string) => {
    setAlertMessage(texto);
    setTimeout(() => setAlertMessage(''), 5000);
  };

  const handleConfirmarEliminar = async () => {
    if (!reporteEliminar) return;

    const response = await reporteService.eliminarReporte(reporteEliminar._id!);

    if (response.success) {
      mostrarMensaje('Reporte eliminado correctamente');
      setMostrarConfirmacion(false);
      setReporteEliminar(null);
      cargarReportes();
    } else {
      mostrarMensaje(response.error || 'Error al eliminar reporte');
    }
  };

  const handleDescargarPDF = (reporte: ReporteActividades) => {
    try {
      generarPDFReporte(reporte, proyecto?.nombre || 'Proyecto');
      mostrarMensaje('PDF generado correctamente');
    } catch (error) {
      mostrarMensaje('Error al generar PDF');
      console.error('Error generando PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
          <strong>Error:</strong> {error}
        </div>
        <button onClick={cargarReportes} className="mt-4 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Internal alert */}
      {alertMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded max-w-md mx-auto mb-4">
          {alertMessage}
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📋 Reportes de {proyecto?.nombre}</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {reportes.length} reporte{reportes.length !== 1 ? 's' : ''}
          </span>
        </div>
        {reportes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg mb-4">No hay reportes registrados aún</p>
            <p className="text-gray-500 mb-6">Crea tu primer reporte en la pestaña "Nuevo Reporte"</p>
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 inline-block">
              <p className="text-orange-800 font-medium">💡 Los reportes aparecerán aquí después de crearlos</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona de Trabajo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jefe de Frente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.map(reporte => (
                  <tr key={reporte._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                      {formatFecha(reporte.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reporte.turno === 'primer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {reporte.turno === 'primer' ? '🕖 Primer Turno' : '🕗 Segundo Turno'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 uppercase">{reporte.zonaTrabajo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{reporte.jefeFrente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Botones de acción */}
                      <button
                        className="text-green-600 hover:text-green-900 mr-3 font-semibold"
                        onClick={() => handleDescargarPDF(reporte)}
                        title="Descargar PDF"
                      >
                        📄 PDF
                      </button>
                      {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                        <>
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3 font-semibold"
                            onClick={() => onEditar(reporte)}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 mr-3"
                            onClick={() => handleEliminarClick(reporte)}
                          >
                            🗑️ Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {mostrarConfirmacion && reporteEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el reporte <strong>{reporteEliminar.zonaTrabajo}</strong>?
              <br />
              <span className="text-red-600 font-semibold">Esta acción es PERMANENTE y no se puede deshacer.</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setMostrarConfirmacion(false);
                  setReporteEliminar(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaReportes;