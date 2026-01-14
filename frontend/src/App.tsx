import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import SeleccionarProyecto from './components/projects/SeleccionarProyecto';
import Dashboard from './components/dashboard/Dashboard';

const App: React.FC = () => {
  const { user, loading, proyecto } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
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