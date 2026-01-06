import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ModificacionReporte, ApiResponse } from '../../types/reporte';

interface HistorialModificacionesProps {
  reporteId: string;
  onClose: () => void;
}

const HistorialModificaciones: React.FC<HistorialModificacionesProps> = ({ reporteId, onClose }) => {
  const [historial, setHistorial] = useState<ModificacionReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get<ApiResponse<ModificacionReporte[]>>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reportes/${reporteId}/historial`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success && response.data.data) {
          setHistorial(response.data.data);
        }
      } catch (err) {
        console.error('Error cargando historial:', err);
        setError('No se pudo cargar el historial de modificaciones');
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [reporteId]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearNombreCampo = (campo: string): string => {
    const nombres: { [key: string]: string } = {
      fecha: 'Fecha',
      ubicacion: 'Ubicación',
      turno: 'Turno',
      inicioActividades: 'Inicio de Actividades',
      terminoActividades: 'Término de Actividades',
      zonaTrabajo: 'Zona de Trabajo',
      seccionTrabajo: 'Sección de Trabajo',
      jefeFrente: 'Jefe en Frente',
      sobrestante: 'Sobrestante',
      controlAcarreo: 'Control de Acarreo',
      controlMaterial: 'Control de Material',
      controlAgua: 'Control de Agua',
      controlMaquinaria: 'Control de Maquinaria',
      observaciones: 'Observaciones',
      pinesMapa: 'Pins en el Mapa'
    };
    return nombres[campo] || campo;
  };

  const formatearValor = (valor: any): string => {
    if (valor === null || valor === undefined) return 'N/A';
    if (typeof valor === 'object') {
      if (Array.isArray(valor)) {
        return `${valor.length} elemento(s)`;
      }
      return JSON.stringify(valor, null, 2);
    }
    return String(valor);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Historial de Modificaciones
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">Este reporte no tiene modificaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-6">
              {historial.map((modificacion, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-600"
                >
                  {/* Header de la modificación */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {modificacion.usuarioNombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatearFecha(modificacion.fechaModificacion)}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {modificacion.cambios.length} cambio{modificacion.cambios.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Observación si existe */}
                  {modificacion.observacion && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Nota:</strong> {modificacion.observacion}
                      </p>
                    </div>
                  )}

                  {/* Cambios */}
                  <div className="space-y-3">
                    {modificacion.cambios.map((cambio, cambioIndex) => (
                      <div
                        key={cambioIndex}
                        className="bg-white dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                          {formatearNombreCampo(cambio.campo)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {/* Valor anterior */}
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                              Valor Anterior
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                              <pre className="text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                                {formatearValor(cambio.valorAnterior)}
                              </pre>
                            </div>
                          </div>
                          {/* Valor nuevo */}
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                              Valor Nuevo
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                              <pre className="text-green-700 dark:text-green-300 whitespace-pre-wrap break-words">
                                {formatearValor(cambio.valorNuevo)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialModificaciones;
