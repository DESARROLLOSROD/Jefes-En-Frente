import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface NetworkState {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  effectiveType: string | null;
}

interface NetworkContextType extends NetworkState {
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    isInternetReachable: null,
    connectionType: 'unknown',
    effectiveType: null
  });

  // Verificar conectividad real haciendo un ping al servidor
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        isInternetReachable: false
      }));
      return false;
    }

    try {
      // Intentar hacer un request pequeño - primero al API, luego fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Intentar con el API del proyecto
      let isReachable = false;
      try {
        const response = await fetch('/api/proyectos', {
          method: 'HEAD',
          signal: controller.signal,
          credentials: 'include'
        });
        isReachable = response.ok || response.status === 401; // 401 significa que el server responde
      } catch {
        // Si falla el API, verificar con un recurso publico
        try {
          const fallbackResponse = await fetch('/manifest.json', {
            method: 'HEAD',
            signal: controller.signal
          });
          isReachable = fallbackResponse.ok;
        } catch {
          isReachable = false;
        }
      }

      clearTimeout(timeoutId);

      setNetworkState(prev => ({
        ...prev,
        isInternetReachable: isReachable
      }));

      return isReachable;
    } catch {
      setNetworkState(prev => ({
        ...prev,
        isInternetReachable: navigator.onLine // Fallback a navigator.onLine
      }));
      return navigator.onLine;
    }
  }, []);

  // Obtener información de conexión
  const updateConnectionInfo = useCallback(() => {
    const connection = (navigator as any).connection ||
                       (navigator as any).mozConnection ||
                       (navigator as any).webkitConnection;

    if (connection) {
      setNetworkState(prev => ({
        ...prev,
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || null
      }));
    }
  }, []);

  // Manejar cambios de estado online/offline
  useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({ ...prev, isOnline: true }));
      checkConnection();
      // Disparar evento para sincronización
      window.dispatchEvent(new CustomEvent('network-online'));
    };

    const handleOffline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        isInternetReachable: false
      }));
      window.dispatchEvent(new CustomEvent('network-offline'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para cambios en la conexión
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
    }

    // Check inicial
    updateConnectionInfo();
    if (navigator.onLine) {
      checkConnection();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, [checkConnection, updateConnectionInfo]);

  // Check periódico de conectividad (cada 30 segundos si está online)
  useEffect(() => {
    if (!networkState.isOnline) return;

    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => clearInterval(interval);
  }, [networkState.isOnline, checkConnection]);

  const value: NetworkContextType = {
    ...networkState,
    checkConnection
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork debe ser usado dentro de un NetworkProvider');
  }
  return context;
};
