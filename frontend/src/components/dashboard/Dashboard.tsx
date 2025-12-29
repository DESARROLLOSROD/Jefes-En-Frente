import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FormularioReporte from '../reports/FormularioReporte';
import ListaReportes from '../reports/ListaReportes';
import GestionUsuarios from '../users/GestionUsuarios';
import GestionProyectos from '../projects/GestionProyectos';
import GestionVehiculos from '../vehicles/GestionVehiculos';
import { WorkZoneManager } from '../WorkZones';
import { EstadisticasReporte } from '../reports/EstadisticasReporte';
import { ReporteActividades } from '../../types/reporte';
import { reporteService, proyectoService } from '../../services/api';
import { obtenerEstadisticas, EstadisticasResponse } from '../../services/estadisticas.service';
import { generarPDFEstadisticas } from '../../utils/pdfEstadisticasGenerator';
import { generarExcelEstadisticas } from '../../utils/excelEstadisticasGenerator';
import { Proyecto } from '../../types/gestion';
import LogoROD from '../../Logo_ROD.png';

const Dashboard: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<'formulario' | 'lista' | 'usuarios' | 'proyectos' | 'vehiculos' | 'zonas' | 'estadisticas'>('formulario');
  const [reporteEditar, setReporteEditar] = useState<ReporteActividades | null>(null);
  const { user, proyecto, logout } = useAuth();
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [mostrarModalProyectos, setMostrarModalProyectos] = useState(false);
  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string | undefined>(undefined);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Cargar proyectos cuando se entra a la vista de estadísticas
  useEffect(() => {
    const cargarProyectos = async () => {
      if (vistaActual === 'estadisticas' && proyectos.length === 0) {
        try {
          const proyectosRes = await proyectoService.obtenerProyectos();
          if (proyectosRes.success && proyectosRes.data) {
            setProyectos(proyectosRes.data);
          }
        } catch (error) {
          console.error('Error cargando proyectos:', error);
        }
      }
    };

    cargarProyectos();
  }, [vistaActual]);

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

  const handleDescargarReporteGeneral = async (formato: 'pdf' | 'excel' | 'consolidado') => {
    setMostrarModalFormato(false);

    // Verificar que haya fechas seleccionadas
    if (!fechaInicio || !fechaFin) {
      alert('POR FAVOR SELECCIONA UN RANGO DE FECHAS EN LA VISTA DE ESTADÍSTICAS');
      setVistaActual('estadisticas');
      return;
    }

    try {
      setLoadingGeneral(true);

      // Obtener nombre del proyecto seleccionado
      let nombreProyecto: string | undefined = undefined;
      if (proyectoSeleccionado && proyectos.length > 0) {
        const proyectoEncontrado = proyectos.find(p => p._id === proyectoSeleccionado);
        nombreProyecto = proyectoEncontrado?.nombre;
      }

      // 1. Caso: Consolidado Detallado (Excel multi-hoja con todos los reportes)
      if (formato === 'consolidado') {
        const { generarExcelGeneral } = await import('../../utils/fileGenerator');

        // Obtener todos los reportes (o por proyecto)
        const res = await reporteService.obtenerReportes(proyectoSeleccionado);
        if (res.success && res.data) {
          // Filtrar por fecha
          const reportsFiltered = res.data.filter((r: ReporteActividades) => {
            const f = new Date(r.fecha);
            return f >= new Date(fechaInicio) && f <= new Date(fechaFin + 'T23:59:59');
          });

          if (reportsFiltered.length === 0) {
            alert('NO SE ENCONTRARON REPORTES EN ESTE RANGO DE FECHAS');
            return;
          }

          await generarExcelGeneral(reportsFiltered, proyectos);
        } else {
          alert('ERROR AL OBTENER REPORTES PARA EL CONSOLIDADO');
        }
        return;
      }

      // 2. Caso: Estadísticas (PDF o Excel de KPIs)
      const idsProyectos = proyectoSeleccionado || 'todos';
      const stats = await obtenerEstadisticas(idsProyectos, fechaInicio, fechaFin);

      // Generar el archivo según el formato
      if (formato === 'pdf') {
        generarPDFEstadisticas(stats, nombreProyecto);
      } else {
        await generarExcelEstadisticas(stats, nombreProyecto);
      }
    } catch (error) {
      console.error('Error generando reporte general:', error);
      alert('OCURRIÓ UN ERROR AL GENERAR EL REPORTE');
    } finally {
      setLoadingGeneral(false);
    }
  };

  const handleCargarEstadisticas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('POR FAVOR SELECCIONA UN RANGO DE FECHAS');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('LA FECHA DE INICIO DEBE SER ANTERIOR A LA FECHA FIN');
      return;
    }

    try {
      setLoadingEstadisticas(true);

      const idsProyectos = proyectoSeleccionado || 'todos';
      const stats = await obtenerEstadisticas(idsProyectos, fechaInicio, fechaFin);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      alert('ERROR AL CARGAR ESTADÍSTICAS');
    } finally {
      setLoadingEstadisticas(false);
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
            <button
              onClick={() => setVistaActual('zonas')}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'zonas'
                ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📍 ZONAS DE TRABAJO
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

                <button
                  onClick={() => setVistaActual('estadisticas')}
                  className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'estadisticas'
                    ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                    }`}
                >
                  📊 ESTADÍSTICAS
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
        {vistaActual === 'zonas' && proyecto && proyecto._id && (
          <WorkZoneManager
            projectId={proyecto._id}
            isAdmin={user?.rol === 'admin' || user?.rol === 'supervisor'}
          />
        )}
        {vistaActual === 'estadisticas' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📊 ANÁLISIS Y ESTADÍSTICAS
            </h2>

            {/* Selector de rango de fechas y proyectos */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proyecto
                  </label>
                  <select
                    value={proyectoSeleccionado || 'todos'}
                    onChange={(e) => setProyectoSeleccionado(e.target.value === 'todos' ? undefined : e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">TODOS LOS PROYECTOS</option>
                    {proyectos.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCargarEstadisticas}
                disabled={loadingEstadisticas}
                className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white ${loadingEstadisticas
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {loadingEstadisticas ? '⏳ CARGANDO...' : '📊 GENERAR ESTADÍSTICAS'}
              </button>
            </div>
            {/* Mostrar estadísticas */}
            {estadisticas && <EstadisticasReporte estadisticas={estadisticas} />}

            {!estadisticas && !loadingEstadisticas && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Selecciona un rango de fechas y genera las estadísticas</p>
              </div>
            )}
          </div>
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
                onClick={() => { setProyectoSeleccionado(undefined); setMostrarModalProyectos(false); setMostrarModalFormato(true); }}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <span className="font-semibold text-blue-800">📋 TODOS LOS PROYECTOS</span>
              </button>
              {proyectos.map((proj) => (
                <button
                  key={proj._id}
                  onClick={() => { setProyectoSeleccionado(proj._id); setMostrarModalProyectos(false); setMostrarModalFormato(true); }}
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

      {mostrarModalFormato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📂 SELECCIONAR FORMATO</h3>
            <p className="text-gray-600 mb-6">
              ELIGE EL FORMATO EN EL QUE DESEAS EXPORTAR EL REPORTE:
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDescargarReporteGeneral('pdf')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
              >
                <span className="mr-2">📄</span> PDF ESTADÍSTICAS
              </button>
              <button
                onClick={() => handleDescargarReporteGeneral('excel')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
              >
                <span className="mr-2">📊</span> EXCEL ESTADÍSTICAS
              </button>
              <button
                onClick={() => handleDescargarReporteGeneral('consolidado')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
              >
                <span className="mr-2">📋</span> EXCEL CONSOLIDADO DE REPORTES
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMostrarModalFormato(false)}
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
