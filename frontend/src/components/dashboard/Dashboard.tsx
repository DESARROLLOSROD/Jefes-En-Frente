import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FormularioReporte from '../reports/FormularioReporte';
import ListaReportes from '../reports/ListaReportes';
import GestionUsuarios from '../users/GestionUsuarios';
import GestionProyectos from '../projects/GestionProyectos';
import GestionVehiculos from '../vehicles/GestionVehiculos';
import { ReporteActividades } from '../../types/reporte';
import { reporteService, proyectoService } from '../../services/api';
import { generarPDFGeneral } from '../../utils/pdfGeneralGenerator';
import { Proyecto } from '../../types/gestion';
import LogoROD from '../../Logo_ROD.png';

const Dashboard: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<'formulario' | 'lista' | 'usuarios' | 'proyectos' | 'vehiculos'>('formulario');
  const [reporteEditar, setReporteEditar] = useState<ReporteActividades | null>(null);
  const { user, proyecto, logout } = useAuth();
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [mostrarModalProyectos, setMostrarModalProyectos] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  const handleLogout = () => {
    logout();
  };

  const cambiarProyecto = () => {
    localStorage.removeItem('proyecto');
    window.location.reload();
  };

  const abrirModalProyectos = async () => {
    try {
      const proyectosRes = await proyectoService.obtenerProyectos();
      if (proyectosRes.success && proyectosRes.data) {
        setProyectos(proyectosRes.data);
        setMostrarModalProyectos(true);
      } else {
        alert('ERROR AL CARGAR PROYECTOS');
      }
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      alert('ERROR AL CARGAR PROYECTOS');
    }
  };

  const handleDescargarReporteGeneral = async (proyectoId?: string) => {
    setMostrarModalProyectos(false);

    try {
      setLoadingGeneral(true);
      // 1. Obtener reportes (filtrados o todos)
      const reportesRes = await reporteService.obtenerReportes(proyectoId);

      // 2. Obtener todos los proyectos para tener sus nombres
      const proyectosRes = await proyectoService.obtenerProyectos();

      if (reportesRes.success && reportesRes.data && proyectosRes.success && proyectosRes.data) {
        // 3. Generar PDF
        generarPDFGeneral(reportesRes.data, proyectosRes.data);
      } else {
        alert('ERROR AL OBTENER LOS DATOS PARA EL REPORTE GENERAL');
      }
    } catch (error) {
      console.error('Error generando reporte general:', error);
      alert('OCURRIÓ UN ERROR AL GENERAR EL REPORTE');
    } finally {
      setLoadingGeneral(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Fixed */}
      <div
        className="fixed inset-0 z-[-20] bg-cover bg-center"
        style={{ backgroundImage: `url(${LogoROD})` }}
      ></div>
      <div className="fixed inset-0 z-[-10] bg-black bg-opacity-60"></div>

      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-xl relative z-10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-blue-200 text-2xl font-bold">🏗️ JEFES EN FRENTE</h1>
              <p className="text-blue-200 text-sm">
                {proyecto?.nombre} - {proyecto?.ubicacion}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold uppercase">{user?.nombre}</p>
                <p className="text-blue-200 text-sm uppercase">{user?.rol}</p>
              </div>

              <div className="flex space-x-2">
                {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
                  <button
                    onClick={abrirModalProyectos}
                    disabled={loadingGeneral}
                    className={`px-3 py-1 rounded text-sm ${loadingGeneral
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500'
                      }`}
                  >
                    {loadingGeneral ? '⏳ GENERANDO...' : '📊 REPORTE GENERAL'}
                  </button>
                )}
                <button
                  onClick={cambiarProyecto}
                  className="bg-orange-500 hover:bg-orange-400 px-3 py-1 rounded text-sm"
                >
                  🔄 CAMBIAR PROYECTO
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-400 px-3 py-1 rounded text-sm"
                >
                  🚪 SALIR
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white shadow-lg relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => {
                setVistaActual('formulario');
                setReporteEditar(null);
              }}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'formulario'
                ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📝 NUEVO REPORTE
            </button>
            <button
              onClick={() => setVistaActual('lista')}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'lista'
                ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📋 VER REPORTES
            </button>
            {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
              <>
                <button
                  onClick={() => setVistaActual('usuarios')}
                  className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'usuarios'
                    ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                    }`}
                >
                  👥 USUARIOS
                </button>
                <button
                  onClick={() => setVistaActual('vehiculos')}
                  className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'vehiculos'
                    ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                    }`}
                >
                  🚙 VEHÍCULOS
                </button>
              </>
            )}
            {user?.rol === 'admin' && (
              <button
                onClick={() => setVistaActual('proyectos')}
                className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'proyectos'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                  }`}
              >
                🏗️ PROYECTOS
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="container mx-auto p-4 pb-32 relative z-10">
        {vistaActual === 'formulario' && (
          <FormularioReporte
            reporteInicial={reporteEditar}
            onFinalizar={() => {
              setReporteEditar(null);
              setVistaActual('lista');
            }}
          />
        )}
        {vistaActual === 'lista' && (
          <ListaReportes
            onEditar={(reporte) => {
              setReporteEditar(reporte);
              setVistaActual('formulario');
            }}
          />
        )}
        {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
          <>
            {vistaActual === 'usuarios' && <GestionUsuarios userRol={user.rol} />}
            {vistaActual === 'vehiculos' && <GestionVehiculos userRol={user.rol} />}
          </>
        )}
        {user?.rol === 'admin' && vistaActual === 'proyectos' && <GestionProyectos />}
      </main>

      {/* Modal de Selección de Proyecto */}
      {mostrarModalProyectos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 SELECCIONAR PROYECTO</h3>
            <p className="text-gray-600 mb-6">
              ELIGE QUÉ PROYECTO DESEAS INCLUIR EN EL REPORTE GENERAL:
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <button
                onClick={() => handleDescargarReporteGeneral()}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <span className="font-semibold text-blue-800">📋 TODOS LOS PROYECTOS</span>
              </button>
              {proyectos.map((proj) => (
                <button
                  key={proj._id}
                  onClick={() => handleDescargarReporteGeneral(proj._id)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <span className="font-semibold text-gray-800">{proj.nombre}</span>
                  <br />
                  <span className="text-sm text-gray-600">{proj.ubicacion}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMostrarModalProyectos(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-40">
        <div className="container mx-auto text-center">
          <p>© 2025 DESARROLLOS ROD</p>
          <p className="text-gray-400 text-sm mt-1">
            PROYECTO: {proyecto?.nombre} | USUARIO: {user?.nombre}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
