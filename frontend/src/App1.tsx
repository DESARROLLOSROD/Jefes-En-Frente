import React, { useState } from 'react';
import FormularioReporte from './components/reports/FormularioReporte';
import './App.css';

const App: React.FC = () => {
  const [vistaActual, setVistaActual] = useState<'formulario' | 'lista'>('formulario');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <header className="bg-orange-600 text-white p-6 shadow-xl">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">🏗️ Jefes en Frente</h1>
          <p className="text-orange-200 text-lg">Sistema de Reportes Mineros</p>
          <p className="text-orange-300 text-sm mt-1">DESARROLLOS ROD</p>
        </div>
      </header>

      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setVistaActual('formulario')}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 ${vistaActual === 'formulario'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📝 Nuevo Reporte
            </button>
            <button
              onClick={() => setVistaActual('lista')}
              className={`py-4 px-6 font-semibold text-lg transition-all duration-300 ${vistaActual === 'lista'
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-25'
                }`}
            >
              📋 Ver Reportes
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        {vistaActual === 'formulario' ? (
          <FormularioReporte />
        ) : (
          <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-orange-100">
            <h2 className="text-4xl font-bold mb-6 text-gray-800 text-center">📋 Lista de Reportes</h2>
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                Aquí se mostrarán todos los reportes guardados
              </p>
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 inline-block">
                <p className="text-blue-800 font-medium">
                  📊 Los reportes aparecerán después de guardarlos
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-lg">© 2024 Jefes en Frente - Sistema de Gestión Minera</p>
        </div>
      </footer>
    </div>
  );
};

export default App;