import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Proyecto } from '../../types/auth';
import { authService } from '../../services/auth';
import LogoROD from '../../Logo_ROD.png';

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
          setError('ERROR AL CARGAR PROYECTOS');
        }
      } catch (err) {
        setError('ERROR DE CONEXIÓN');
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
          <p className="mt-4 text-gray-600">CARGANDO PROYECTOS...</p>
        </div>
      </div>
    );
  }

  // Configuracion debug para Capacitor
  console.log('🔍 SeleccionarProyecto Debug:', {
    userRole: user?.rol,
    userName: user?.nombre,
    totalProyectosAPI: proyectos.length,
    userProyectosCount: user?.proyectos?.length || 0,
    userProyectosIDs: user?.proyectos?.map(p => p._id)
  });

  // Filtrar proyectos según el rol del usuario
  const proyectosFiltrados = user?.rol === 'admin'
    ? proyectos
    : proyectos.filter(p => {
      const hasProject = user?.proyectos.some(up => up._id === p._id);
      if (!hasProject && proyectos.length > 0) {
        // Log para ver por qué falló la comparación en el primer item si hay fallo
        // console.log(`Comparando API project ${p._id} con User projects`, user?.proyectos?.map(up => up._id));
      }
      return hasProject;
    });

  console.log('🔍 Proyectos Filtrados:', proyectosFiltrados.length);

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${LogoROD})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="max-w-4xl w-full space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-orange-600">🏗️</h1>
          <h2 className="text-3xl font-extrabold text-white">
            SELECCIONAR PROYECTO
          </h2>
          <p className="mt-2 text-sm text-gray-200">
            HOLA, {user?.nombre}. {user?.rol === 'admin'
              ? 'SELECCIONA EL PROYECTO EN EL QUE TRABAJARÁS HOY.'
              : 'SELECCIONA UNO DE TUS PROYECTOS ASIGNADOS.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {proyectosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">NO TIENES PROYECTOS ASIGNADOS</p>
            <p className="text-gray-500 text-sm mt-2">CONTACTA AL ADMINISTRADOR PARA QUE TE ASIGNE PROYECTOS</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {proyectosFiltrados.map((proyectoItem) => (
              <div
                key={proyectoItem._id}
                className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${proyecto?._id === proyectoItem._id
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
                      ✅ SELECCIONADO
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-gray-300">
            UNA VEZ SELECCIONADO EL PROYECTO, PODRÁS COMENZAR A CREAR REPORTES.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeleccionarProyecto;
