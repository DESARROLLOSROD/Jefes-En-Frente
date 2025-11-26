import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FormularioReporte from './FormularioReporte';
import ListaReportes from './ListaReportes';
import GestionUsuarios from './GestionUsuarios';
import GestionProyectos from './GestionProyectos';
import GestionVehiculos from './GestionVehiculos';
import { ReporteActividades } from '../types/reporte';

const Dashboard: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<'formulario' | 'lista' | 'usuarios' | 'proyectos' | 'vehiculos'>('formulario');
  const [reporteEditar, setReporteEditar] = useState<ReporteActividades | null>(null);
  const { user, proyecto, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const cambiarProyecto = () => {
    localStorage.removeItem('proyecto');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-xl">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-blue-200 text-2xl font-bold">🏗️ Jefes en Frente</h1>
              <p className="text-blue-200 text-sm">
                {proyecto?.nombre} - {proyecto?.ubicacion}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{user?.nombre}</p>
                <p className="text-blue-200 text-sm capitalize">{user?.rol}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={cambiarProyecto}
                  className="bg-orange-500 hover:bg-orange-400 px-3 py-1 rounded text-sm"
                >
                  🔄 Cambiar Proyecto
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-400 px-3 py-1 rounded text-sm"
                >
                  🚪 Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => {
                setVistaActual('formulario');
                setReporteEditar(null); // Reset edit state when clicking "Nuevo Reporte"
              }}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'formulario'
                ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📝 Nuevo Reporte
            </button>
            <button
              onClick={() => setVistaActual('lista')}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'lista'
                ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📋 Ver Reportes
            </button>
            {user?.rol === 'admin' && (
              <>
                <button
                  onClick={() => setVistaActual('usuarios')}
                  className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'usuarios'
                    ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                    }`}
                >
                  👥 Usuarios
                </button>
                <button
                  onClick={() => setVistaActual('proyectos')}
                  className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'proyectos'
                    ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                    }`}
                >
                  🏗️ Proyectos
                </button>
                <button
                  onClick={() => setVistaActual('vehiculos')}
                  className={`py-4 px-6 font-semibold text-lg transition-all duration-300 whitespace-nowrap ${vistaActual === 'vehiculos'
                    ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                    }`}
                >
                  🚙 Vehículos
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="container mx-auto p-4">
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
        {user?.rol === 'admin' && (
          <>
            {vistaActual === 'usuarios' && <GestionUsuarios />}
            {vistaActual === 'proyectos' && <GestionProyectos />}
            {vistaActual === 'vehiculos' && <GestionVehiculos />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© 2024 Jefes en Frente - Sistema de Gestión Minera</p>
          <p className="text-gray-400 text-sm mt-1">
            Proyecto: {proyecto?.nombre} | Usuario: {user?.nombre}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;