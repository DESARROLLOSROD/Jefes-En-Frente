import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../contexts/NetworkContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSyncQueue } from '../hooks/useSyncQueue';

const NetworkStatus: React.FC = () => {
  const { isOnline } = useNetwork();
  const { theme } = useTheme();
  const { pendingCount, isSyncing, syncQueue } = useSyncQueue();
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  // Mostrar banner cuando está offline o hay items pendientes
  useEffect(() => {
    const shouldShow = !isOnline || pendingCount > 0;

    if (shouldShow && !visible) {
      setVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && visible) {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isOnline, pendingCount]);

  if (!visible) return null;

  const backgroundColor = isOnline ? theme.warning : theme.danger;
  const icon = isOnline ? 'cloud-upload' : 'cloud-offline';
  const message = isOnline
    ? `${pendingCount} acción(es) pendiente(s) de sincronizar`
    : 'Sin conexión a internet';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={20} color={theme.white} />
        <Text style={[styles.text, { color: theme.white }]} numberOfLines={1}>
          {message}
        </Text>
      </View>

      {isOnline && pendingCount > 0 && (
        <TouchableOpacity
          onPress={syncQueue}
          disabled={isSyncing}
          style={styles.syncButton}
        >
          <Ionicons
            name={isSyncing ? 'reload' : 'sync'}
            size={20}
            color={theme.white}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingTop: 48, // Para status bar
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  syncButton: {
    padding: 4,
  },
});

export default NetworkStatus;
