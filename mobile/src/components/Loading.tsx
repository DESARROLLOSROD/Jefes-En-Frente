import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../constants/config';

interface LoadingProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ visible, message, fullScreen = true }) => {
  if (!visible) return null;

  const content = (
    <View style={[styles.container, !fullScreen && styles.inline]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inline: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.dark,
    textAlign: 'center',
  },
});

export default Loading;
