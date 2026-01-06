import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';
import { useQueryClient } from '@tanstack/react-query';
import ApiService from '../services/api';

/**
 * Hook para sincronizar la cola offline automáticamente
 */
export const useSyncQueue = () => {
  const { isOnline } = useNetwork();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const lastSyncTime = useRef<number>(0);

  // Obtener cantidad de items pendientes
  const updatePendingCount = useCallback(async () => {
    const count = await ApiService.getPendingCount();
    setPendingCount(count);
  }, []);

  // Sincronizar toda la cola
  const syncQueue = useCallback(async () => {
    // Prevenir múltiples sincronizaciones en corto tiempo (debounce de 2 segundos)
    const now = Date.now();
    if (!isOnline || isSyncing || (now - lastSyncTime.current < 2000)) {
      if (__DEV__ && now - lastSyncTime.current < 2000) {
        console.log('⚠️ Sincronización demasiado frecuente, saltando...');
      }
      return;
    }

    lastSyncTime.current = now;
    setIsSyncing(true);

    try {
      const initialCount = await ApiService.getPendingCount();

      if (initialCount === 0) {
        if (__DEV__) console.log('✅ No hay items pendientes para sincronizar');
        return;
      }

      if (__DEV__) console.log(`🔄 Sincronizando ${initialCount} items...`);

      // Procesar la cola usando el servicio
      const result = await ApiService.processOfflineQueue();

      // Invalidar queries de reportes después de sincronizar exitosamente
      if (result.success > 0) {
        queryClient.invalidateQueries({
          queryKey: ['reportes'],
          exact: false,
          refetchType: 'active'
        });

        Alert.alert(
          'Sincronización Completa',
          `${result.success} acción(es) sincronizada(s) exitosamente.${result.failed > 0 ? `\n${result.failed} acción(es) fallida(s).` : ''
          }`
        );
      } else if (result.failed > 0) {
        // Solo alertar de fallo si realmente hay algo que falló y no fue solo "no internet"
        Alert.alert(
          'Error de Sincronización',
          `No se pudieron sincronizar ${result.failed} acción(es). Se reintentará más tarde.`
        );
      }

      await updatePendingCount();
    } catch (error) {
      console.error('Error syncing queue:', error);
      Alert.alert('Error', 'No se pudo sincronizar. Intenta nuevamente más tarde.');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount, queryClient]);

  // Sincronizar automáticamente cuando hay conexión
  // Usamos un timer para evitar múltiples sincronizaciones al reconectar
  useEffect(() => {
    let syncTimer: NodeJS.Timeout | null = null;

    if (isOnline && !isSyncing) {
      // Esperar 1 segundo antes de sincronizar para evitar múltiples llamadas
      syncTimer = setTimeout(() => {
        syncQueue();
      }, 1000);
    }

    return () => {
      if (syncTimer) {
        clearTimeout(syncTimer);
      }
    };
  }, [isOnline]);

  // Actualizar contador al montar
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    syncQueue,
    isSyncing,
    pendingCount,
    updatePendingCount,
  };
};
