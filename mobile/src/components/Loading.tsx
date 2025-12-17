import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ visible, message, fullScreen = true }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  const content = (
    <View style={[styles.container, !fullScreen && styles.inline, fullScreen && { backgroundColor: theme.overlay }]}>
      <View style={[styles.content, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        {message && <Text style={[styles.message, { color: theme.text }]}>{message}</Text>}
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
  },
  inline: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  content: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Loading;
