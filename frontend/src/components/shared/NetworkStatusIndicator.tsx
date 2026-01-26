import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../contexts/NetworkContext';
import { offlineQueue, QueuedRequest } from '../../utils/offlineQueue';

interface NetworkStatusIndicatorProps {
  showAlways?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showAlways = false
}) => {
  const { isOnline, isInternetReachable } = useNetwork();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);

  // Suscribirse a cambios en la cola
  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((queue: QueuedRequest[]) => {
      setPendingCount(queue.length);
    });

    return unsubscribe;
  }, []);

  // Mostrar/ocultar banner según estado
  useEffect(() => {
    if (!isOnline || !isInternetReachable) {
      setShowBanner(true);
    } else if (pendingCount === 0 && !showAlways) {
      // Ocultar después de un delay si todo está sincronizado
      const timeout = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, isInternetReachable, pendingCount, showAlways]);

  // Escuchar eventos de sincronización
  useEffect(() => {
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = (e: CustomEvent) => {
      setIsSyncing(false);
      setSyncResult(e.detail);
      setTimeout(() => setSyncResult(null), 5000);
    };

    window.addEventListener('offline-sync-start', handleSyncStart as EventListener);
    window.addEventListener('offline-sync-complete', handleSyncComplete as EventListener);

    return () => {
      window.removeEventListener('offline-sync-start', handleSyncStart as EventListener);
      window.removeEventListener('offline-sync-complete', handleSyncComplete as EventListener);
    };
  }, []);

  // Forzar sincronización manual
  const handleManualSync = async () => {
    if (pendingCount === 0 || isSyncing) return;
    setIsSyncing(true);
    await offlineQueue.processQueue();
    setIsSyncing(false);
  };

  // Si está online y no hay nada pendiente, no mostrar (a menos que showAlways)
  if (!showBanner && !showAlways) {
    return null;
  }

  const isOffline = !isOnline || isInternetReachable === false;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 rounded-lg shadow-lg transition-all duration-300 ${
        isOffline
          ? 'bg-yellow-500 dark:bg-yellow-600'
          : syncResult
            ? syncResult.failed > 0
              ? 'bg-orange-500 dark:bg-orange-600'
              : 'bg-green-500 dark:bg-green-600'
            : pendingCount > 0
              ? 'bg-blue-500 dark:bg-blue-600'
              : 'bg-green-500 dark:bg-green-600'
      }`}
    >
      <div className="p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          {/* Icono de estado */}
          {isOffline ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
              />
            </svg>
          ) : isSyncing ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : pendingCount > 0 ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}

          {/* Texto de estado */}
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {isOffline
                ? 'Sin conexion'
                : isSyncing
                  ? 'Sincronizando...'
                  : syncResult
                    ? `Sincronizado: ${syncResult.success} exitosos${syncResult.failed > 0 ? `, ${syncResult.failed} fallidos` : ''}`
                    : pendingCount > 0
                      ? `${pendingCount} cambio${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''}`
                      : 'Conectado'
              }
            </span>
            {isOffline && pendingCount > 0 && (
              <span className="text-xs opacity-90">
                {pendingCount} cambio{pendingCount !== 1 ? 's' : ''} guardado{pendingCount !== 1 ? 's' : ''} localmente
              </span>
            )}
          </div>
        </div>

        {/* Boton de sincronizacion manual */}
        {!isOffline && pendingCount > 0 && !isSyncing && (
          <button
            onClick={handleManualSync}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
          >
            Sincronizar
          </button>
        )}

        {/* Boton cerrar */}
        {!isOffline && pendingCount === 0 && (
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusIndicator;
