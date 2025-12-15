import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Proyecto } from '../../types';

const ProjectSelectionScreen = ({ navigation }: any) => {
  const { proyectos, selectProject, logout } = useAuth();
  const { theme } = useTheme();

  const handleSelectProject = (project: Proyecto) => {
    selectProject(project);
  };

  const handleProjectPress = (project: Proyecto) => {
    Alert.alert(
      project.nombre,
      'Selecciona una opción',
      [
        {
          text: 'Ver Detalles y Mapa',
          onPress: () => navigation.navigate('ProjectDetail', { proyecto: project }),
        },
        {
          text: 'Seleccionar Proyecto',
          onPress: () => handleSelectProject(project),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Proyecto }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: theme.surface }]}
      onPress={() => handleProjectPress(item)}
    >
      <View style={styles.projectHeader}>
        <Ionicons name="business" size={24} color={theme.primary} />
        {item.mapa && (
          <View style={[styles.mapBadge, { backgroundColor: theme.success }]}>
            <Ionicons name="map" size={12} color={theme.white} />
          </View>
        )}
      </View>
      <Text style={[styles.projectName, { color: theme.text }]}>{item.nombre}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.projectLocation, { color: theme.textSecondary }]}>
          {item.ubicacion}
        </Text>
      </View>
      {item.descripcion && (
        <Text style={[styles.projectDescription, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Selecciona un Proyecto</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={16} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {proyectos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color={theme.textDisabled} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mapBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  projectLocation: {
    fontSize: 14,
    flex: 1,
  },
  projectDescription: {
    fontSize: 14,
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
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProjectSelectionScreen;
