import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';

const ProjectManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Proyectos</Text>
      <Text style={styles.subtitle}>Funcionalidad en desarrollo</Text>
      <Text style={styles.description}>
        Esta pantalla permitirá crear, editar y eliminar proyectos mineros.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default ProjectManagementScreen;
