import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { ReporteActividades } from '../../types';
import { useReportes } from '../../hooks/useReportes';
import { useTheme } from '../../contexts/ThemeContext';

type ReportListNavigationProp = StackNavigationProp<RootStackParamList, 'ReportList'>;

const ReportListScreen = () => {
  const navigation = useNavigation<ReportListNavigationProp>();
  const { selectedProject } = useAuth();
  const { theme } = useTheme();

  // Usar React Query hook
  const { data: reportes = [], isLoading, isRefetching, refetch } = useReportes(selectedProject?._id);

  const onRefresh = () => {
    refetch();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderReporte = ({ item }: { item: ReporteActividades }) => (
    <TouchableOpacity
      style={[styles.reportCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item._id! })}
    >
      <View style={styles.reportHeader}>
        <Text style={[styles.reportDate, { color: theme.text }]}>{formatDate(item.fecha)}</Text>
        <Text style={[styles.reportTurno, { backgroundColor: theme.primary, color: theme.white }]}>{item.turno} turno</Text>
      </View>
      <Text style={[styles.reportLocation, { color: theme.textSecondary }]}>{item.ubicacion}</Text>
      <Text style={[styles.reportTime, { color: theme.textSecondary }]}>
        {item.inicioActividades} - {item.terminoActividades}
      </Text>
      {item.jefeFrente && (
        <Text style={[styles.reportDetail, { color: theme.textSecondary }]}>Jefe: {item.jefeFrente}</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {reportes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {selectedProject
              ? `No hay reportes para el proyecto "${selectedProject.nombre}"`
              : 'No hay reportes disponibles'}
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('ReportForm', {})}
          >
            <Text style={[styles.createButtonText, { color: theme.white }]}>Crear Primer Reporte</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reportes}
          renderItem={renderReporte}
          keyExtractor={(item) => item._id!}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  reportCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportTurno: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'capitalize',
    overflow: 'hidden', // Fix for text shadow on android
  },
  reportLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  reportDetail: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportListScreen;
