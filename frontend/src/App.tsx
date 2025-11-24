import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SeleccionarProyecto from './components/SeleccionarProyecto';
import Dashboard from './components/Dashboard';
import './App.css';

const App: React.FC = () => {
  const { user, proyecto, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!proyecto) {
    return <SeleccionarProyecto />;
  }

  return <Dashboard />;
};

export default App;