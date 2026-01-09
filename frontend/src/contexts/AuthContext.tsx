import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Proyecto, AuthContextType } from '../types/auth';
import { authService } from '../services/auth';
import { proyectoService } from '../services/api';

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

  // Inactivity timeout - 15 minutes (900,000 milliseconds)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      inactivityTimer = setTimeout(() => {
        // Auto logout after 15 minutes of inactivity
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Track user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

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

  const actualizarProyecto = (proyectoActualizado: Proyecto) => {
    // Si el proyecto actualizado es el proyecto actual, actualizarlo
    if (proyecto && proyecto._id === proyectoActualizado._id) {
      setProyecto(proyectoActualizado);
      localStorage.setItem('proyecto', JSON.stringify(proyectoActualizado));
    }

    // También actualizar en la lista de proyectos del usuario
    if (user) {
      const usuarioActualizado = {
        ...user,
        proyectos: user.proyectos.map(p =>
          p._id === proyectoActualizado._id ? proyectoActualizado : p
        )
      };
      setUser(usuarioActualizado);
      localStorage.setItem('user', JSON.stringify(usuarioActualizado));
    }
  };

  const recargarProyectoActual = async () => {
    if (!proyecto || !proyecto._id) {
      console.log('No hay proyecto seleccionado o no tiene ID');
      return;
    }

    console.log('Recargando proyecto con ID:', proyecto._id);

    try {
      const response = await proyectoService.obtenerProyectoPorId(proyecto._id);

      console.log('Respuesta de recargar proyecto:', response);

      if (response.success && response.data) {
        console.log('Proyecto recargado exitosamente. Tiene mapa:', !!response.data.mapa);

        // Actualizar estado
        setProyecto(response.data);

        // Guardar en localStorage SIN el mapa para evitar QuotaExceededError
        const { mapa, ...proyectoLigero } = response.data;
        try {
          localStorage.setItem('proyecto', JSON.stringify(proyectoLigero));
        } catch (e) {
          console.warn('No se pudo guardar proyecto en localStorage (posiblemente muy grande):', e);
        }

        // También actualizar en la lista de proyectos del usuario
        if (user) {
          const usuarioActualizado = {
            ...user,
            proyectos: user.proyectos.map(p =>
              p._id === response.data!._id ? response.data! : p
            )
          };
          setUser(usuarioActualizado);

          // Guardar usuario limpio
          try {
            // Limpiar proyectos del usuario también si tienen mapas
            const usuarioParaGuardar = {
              ...usuarioActualizado,
              proyectos: usuarioActualizado.proyectos.map(p => {
                const { mapa, ...pLigero } = p;
                return pLigero;
              })
            };
            localStorage.setItem('user', JSON.stringify(usuarioParaGuardar));
          } catch (e) {
            console.warn('Error guardando usuario en localStorage:', e);
          }
        }
      } else {
        console.error('Error al recargar proyecto:', response.error);
      }
    } catch (error) {
      console.error('Error al recargar proyecto:', error);
    }
  };

  const value: AuthContextType = {
    user,
    proyecto,
    login,
    logout,
    seleccionarProyecto,
    actualizarProyecto,
    recargarProyectoActual,
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