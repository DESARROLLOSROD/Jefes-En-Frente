import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Proyecto, AuthContextType } from '../types/auth';
import { authService } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedProyecto = localStorage.getItem('proyecto');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          if (savedProyecto) {
            setProyecto(JSON.parse(savedProyecto));
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('proyecto');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const resultado = await authService.login(email, password);
      if (resultado.success && resultado.data) {
        const { token, user } = resultado.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);

        // Auto-seleccionar proyecto si el usuario tiene solo 1 asignado
        // Los admin siempre pueden elegir
        if (user.proyectos && user.proyectos.length === 1 && user.rol !== 'admin') {
          const proyectoUnico = user.proyectos[0];
          setProyecto(proyectoUnico);
          localStorage.setItem('proyecto', JSON.stringify(proyectoUnico));
        }

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('proyecto');
    setUser(null);
    setProyecto(null);
  };

  const seleccionarProyecto = (proyectoSeleccionado: Proyecto) => {
    setProyecto(proyectoSeleccionado);
    localStorage.setItem('proyecto', JSON.stringify(proyectoSeleccionado));
  };

  const value: AuthContextType = {
    user,
    proyecto,
    login,
    logout,
    seleccionarProyecto,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};