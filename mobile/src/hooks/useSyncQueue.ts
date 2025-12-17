import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';
import apiWithOffline from '../services/apiWithOffline';

/**
 * Hook para sincronizar la cola offline automáticamente
 */
export const useSyncQueue = () => {
  const { isOnline } = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Obtener cantidad de items pendientes
  const updatePendingCount = useCallback(async () => {
    const count = await apiWithOffline.getQueueSize();
    setPendingCount(count);
  }, []);

  // Sincronizar toda la cola
  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      const initialCount = await apiWithOffline.getQueueSize();

      if (initialCount === 0) {
        console.log('✅ No hay items pendientes para sincronizar');
        return;
      }

      console.log(`🔄 Sincronizando ${initialCount} items...`);

      // Procesar la cola usando el servicio
      const result = await apiWithOffline.processOfflineQueue();

      // Mostrar resultado
      if (result.success > 0) {
        Alert.alert(
          'Sincronización Completa',
          `${result.success} acción(es) sincronizada(s) exitosamente.${
            result.failed > 0 ? `\n${result.failed} acción(es) fallida(s).` : ''
          }`
        );
      } else if (result.failed > 0) {
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
  }, [isOnline, isSyncing, updatePendingCount]);

  // Sincronizar automáticamente cuando hay conexión
  useEffect(() => {
    if (isOnline && !isSyncing) {
      syncQueue();
    }
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
