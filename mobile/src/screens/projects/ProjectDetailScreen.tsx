import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Proyecto } from '../../types';
import ProjectMap from '../../components/ProjectMap';

interface ProjectDetailScreenProps {
  route: {
    params: {
      proyecto: Proyecto;
    };
  };
  navigation: any;
}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({ route, navigation }) => {
  const { proyecto } = route.params;
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {proyecto.nombre}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Información del Proyecto */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Nombre</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{proyecto.nombre}</Text>
            </View>
          </View>

          {proyecto.ubicacion && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Ubicación</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {proyecto.ubicacion}
                </Text>
              </View>
            </View>
          )}

          {proyecto.descripcion && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Descripción
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {proyecto.descripcion}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons
              name={proyecto.activo ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={proyecto.activo ? theme.success : theme.danger}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Estado</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: proyecto.activo ? theme.success : theme.danger },
                ]}
              >
                {proyecto.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Mapa del Proyecto */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Ionicons name="map" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mapa del Proyecto
            </Text>
          </View>

          <View style={styles.mapWrapper}>
            <ProjectMap
              proyecto={proyecto}
              editable={false}
              showControls={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 12,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  mapSection: {
    marginBottom: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapWrapper: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default ProjectDetailScreen;
