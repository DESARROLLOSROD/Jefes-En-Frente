import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Proyecto } from '../../types';
import { COLORS } from '../../constants/config';

const ProjectSelectionScreen = () => {
  const { proyectos, selectProject, logout } = useAuth();

  const handleSelectProject = (project: Proyecto) => {
    selectProject(project);
  };

  const renderProject = ({ item }: { item: Proyecto }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => handleSelectProject(item)}
    >
      <Text style={styles.projectName}>{item.nombre}</Text>
      <Text style={styles.projectLocation}>{item.ubicacion}</Text>
      {item.descripcion && (
        <Text style={styles.projectDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona un Proyecto</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {proyectos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No tienes proyectos asignados. Contacta al administrador.
          </Text>
        </View>
      ) : (
        <FlatList
          data={proyectos}
          renderItem={renderProject}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});

export default ProjectSelectionScreen;
