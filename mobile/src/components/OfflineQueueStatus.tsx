import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { COLORS } from '../constants/config';

/**
 * Componente que muestra el estado de la cola offline y permite sincronización manual
 */
const OfflineQueueStatus: React.FC = () => {
  const { isSyncing, pendingCount, syncQueue } = useSyncQueue();

  // No mostrar nada si no hay items pendientes
  if (pendingCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color={COLORS.warning} />
        <Text style={styles.text}>
          {pendingCount} acción{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''} de sincronizar
        </Text>
      </View>

      <TouchableOpacity
        style={styles.syncButton}
        onPress={syncQueue}
        disabled={isSyncing}
        activeOpacity={0.7}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="sync" size={16} color={COLORS.white} />
            <Text style={styles.syncText}>Sincronizar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  text: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '600',
    flex: 1,
  },
  syncButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 100,
    justifyContent: 'center',
  },
  syncText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default OfflineQueueStatus;
