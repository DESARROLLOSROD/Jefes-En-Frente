import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Proyecto } from '../types/auth';
import { authService } from '../services/auth';

const SeleccionarProyecto: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, seleccionarProyecto, proyecto } = useAuth();

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const resultado = await authService.obtenerProyectos();
        if (resultado.success && resultado.data) {
          setProyectos(resultado.data);
        } else {
          setError('Error al cargar proyectos');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, []);

  const handleSeleccionarProyecto = (proyecto: Proyecto) => {
    seleccionarProyecto(proyecto);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">🏗️</h1>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Seleccionar Proyecto
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hola, {user?.nombre}. Selecciona el proyecto en el que trabajarás hoy.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {proyectos.map((proyectoItem) => (
            <div
              key={proyectoItem._id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                proyecto?._id === proyectoItem._id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => handleSeleccionarProyecto(proyectoItem)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {proyectoItem.nombre}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                📍 {proyectoItem.ubicacion}
              </p>
              <p className="text-xs text-gray-500">
                {proyectoItem.descripcion}
              </p>
              {proyecto?._id === proyectoItem._id && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    ✅ Seleccionado
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Una vez seleccionado el proyecto, podrás comenzar a crear reportes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeleccionarProyecto;