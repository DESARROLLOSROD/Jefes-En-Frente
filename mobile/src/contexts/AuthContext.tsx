import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Proyecto, AuthContextType } from '../types';
import ApiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al iniciar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const [storedToken, storedUser, storedProject] = await AsyncStorage.multiGet([
        'token',
        'user',
        'selectedProject',
      ]);

      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));

        if (storedProject[1]) {
          setSelectedProject(JSON.parse(storedProject[1]));
        }

        // Obtener proyectos actualizados
        try {
          // Intentar primero cargar de cache para velocidad
          const cachedProyectos = await AsyncStorage.getItem('proyectos');
          if (cachedProyectos) {
            setProyectos(JSON.parse(cachedProyectos));
          }

          const proyectosData = await ApiService.getProyectosDisponibles();
          setProyectos(proyectosData);
          // Guardar en cache
          await AsyncStorage.setItem('proyectos', JSON.stringify(proyectosData));
        } catch (error) {
          console.error('Error al obtener proyectos:', error);
          // Si falla (ej: offline), ya cargamos de cache arriba
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando login con:', email);
      console.log('🌐 URL de la API:', ApiService);

      const response = await ApiService.login(email, password);

      console.log('✅ Login exitoso');

      setToken(response.token);
      setUser(response.usuario);
      setProyectos(response.proyectos);

      // Guardar en AsyncStorage
      await AsyncStorage.multiSet([
        ['token', response.token],
        ['user', JSON.stringify(response.usuario)],
        ['proyectos', JSON.stringify(response.proyectos)],
      ]);

      // Si solo hay un proyecto, seleccionarlo automáticamente
      if (response.proyectos.length === 1) {
        selectProject(response.proyectos[0]);
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      console.error('❌ Error.message:', error.message);
      console.error('❌ Error.response:', error.response);

      throw new Error(
        error.response?.data?.message || error.message || 'Error al iniciar sesión'
      );
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'selectedProject']);
      setToken(null);
      setUser(null);
      setProyectos([]);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const selectProject = async (project: Proyecto) => {
    setSelectedProject(project);
    await AsyncStorage.setItem('selectedProject', JSON.stringify(project));
  };

  const value: AuthContextType = {
    user,
    token,
    proyectos,
    selectedProject,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    selectProject,
    checkAuth,
  };

  if (isLoading) {
    return null; // O un componente de carga
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
