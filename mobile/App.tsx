import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkStatus from './src/components/NetworkStatus';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Reintentar 2 veces en caso de error
      staleTime: 5 * 60 * 1000, // 5 minutos por defecto
      gcTime: 10 * 60 * 1000, // Mantener en cache 10 minutos
      refetchOnWindowFocus: false, // No refetch al volver a la app
      refetchOnReconnect: false, // No refetch automático al reconectar (lo maneja useSyncQueue)
      refetchOnMount: false, // No refetch al montar si los datos están frescos
    },
    mutations: {
      retry: 1, // Reintentar 1 vez las mutaciones
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <AppNavigator />
            <NetworkStatus />
            <Toast />
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
