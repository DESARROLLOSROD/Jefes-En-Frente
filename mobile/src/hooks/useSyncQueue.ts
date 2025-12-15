import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';
import offlineQueue, { QueueItem } from '../utils/offlineQueue';
import api from '../services/api';

export const useSyncQueue = () => {
  const { isOnline } = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Obtener cantidad de items pendientes
  const updatePendingCount = useCallback(async () => {
    const count = await offlineQueue.getQueueSize();
    setPendingCount(count);
  }, []);

  // Procesar un item de la cola
  const processQueueItem = async (item: QueueItem): Promise<boolean> => {
    try {
      console.log('🔄 Procesando item:', item.type);

      // Ejecutar la petición según el método
      switch (item.method) {
        case 'POST':
          await api[item.endpoint.split('/')[1]].create?.(item.data);
          break;
        case 'PUT':
          const id = item.endpoint.split('/').pop();
          await api[item.endpoint.split('/')[1]].update?.(id, item.data);
          break;
        case 'DELETE':
          const deleteId = item.endpoint.split('/').pop();
          await api[item.endpoint.split('/')[1]].delete?.(deleteId);
          break;
        default:
          console.warn('Método no soportado:', item.method);
          return false;
      }

      // Si tuvo éxito, eliminar de la cola
      await offlineQueue.removeFromQueue(item.id);
      console.log('✅ Item sincronizado:', item.type);
      return true;
    } catch (error: any) {
      console.error('❌ Error procesando item:', error.message);

      // Incrementar contador de reintentos
      await offlineQueue.incrementRetry(item.id);

      // Si ha fallado muchas veces, eliminar
      if (item.retryCount >= 3) {
        await offlineQueue.removeFromQueue(item.id);
        console.log('⚠️ Item eliminado después de 3 intentos');
      }

      return false;
    }
  };

  // Sincronizar toda la cola
  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      const queue = await offlineQueue.getQueue();

      if (queue.length === 0) {
        console.log('✅ No hay items pendientes para sincronizar');
        return;
      }

      console.log(`🔄 Sincronizando ${queue.length} items...`);

      let successCount = 0;
      let failCount = 0;

      // Procesar items uno por uno
      for (const item of queue) {
        const success = await processQueueItem(item);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      // Mostrar resultado
      if (successCount > 0) {
        Alert.alert(
          'Sincronización Completa',
          `${successCount} acción(es) sincronizada(s) exitosamente.${
            failCount > 0 ? `\n${failCount} acción(es) fallida(s).` : ''
          }`
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
