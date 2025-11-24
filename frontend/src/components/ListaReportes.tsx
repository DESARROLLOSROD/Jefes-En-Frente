import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ReporteActividades } from '../types/reporte';
import { reporteService } from '../services/api';

const ListaReportes: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteActividades[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { proyecto, user } = useAuth();

  useEffect(() => {
    console.log('🔍 Cargando reportes...', { 
      proyectoId: proyecto?._id, 
      usuarioId: user?._id 
    });
    cargarReportes();
  }, [proyecto]);

  const cargarReportes = async () => {
    try {
      console.log('📡 Llamando a reporteService.obtenerReportes()');
      const resultado = await reporteService.obtenerReportes();
      console.log('📦 Respuesta del backend:', resultado);
      
      if (resultado.success && resultado.data) {
        console.log(`📊 ${resultado.data.length} reportes recibidos`);
        setReportes(resultado.data);
      } else {
        console.error('❌ Error del backend:', resultado.error);
        setError('Error al cargar reportes: ' + resultado.error);
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Cargando reportes...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
        <strong>Error:</strong> {error}
      </div>
      <button 
        onClick={cargarReportes}
        className="mt-4 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
      >
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Reportes de {proyecto?.nombre}
          </h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {reportes.length} reporte{reportes.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {reportes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg mb-4">
              No hay reportes registrados aún
            </p>
            <p className="text-gray-500 mb-6">
              Crea tu primer reporte en la pestaña "Nuevo Reporte"
            </p>
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 inline-block">
              <p className="text-orange-800 font-medium">
                💡 Los reportes aparecerán aquí después de crearlos
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona de Trabajo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jefe de Frente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.map((reporte) => (
                  <tr key={reporte._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reporte.fecha).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reporte.turno === 'primer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {reporte.turno === 'primer' ? '🕖 Primer Turno' : '🕗 Segundo Turno'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reporte.zonaTrabajo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reporte.jefeFrente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        👁️ Ver
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        📄 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaReportes;