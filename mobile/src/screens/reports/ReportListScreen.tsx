import React, { useState, useEffect } from 'react';
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
import ApiService from '../../services/api';
import { ReporteActividades } from '../../types';
import { COLORS } from '../../constants/config';

type ReportListNavigationProp = StackNavigationProp<RootStackParamList, 'ReportList'>;

const ReportListScreen = () => {
  const navigation = useNavigation<ReportListNavigationProp>();
  const { selectedProject } = useAuth();
  const [reportes, setReportes] = useState<ReporteActividades[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      const data = await ApiService.getReportes(selectedProject?._id);
      setReportes(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReportes();
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
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item._id! })}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportDate}>{formatDate(item.fecha)}</Text>
        <Text style={styles.reportTurno}>{item.turno} turno</Text>
      </View>
      <Text style={styles.reportLocation}>{item.ubicacion}</Text>
      <Text style={styles.reportTime}>
        {item.inicioActividades} - {item.terminoActividades}
      </Text>
      {item.jefeFrente && (
        <Text style={styles.reportDetail}>Jefe: {item.jefeFrente}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reportes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay reportes disponibles</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('ReportForm', {})}
          >
            <Text style={styles.createButtonText}>Crear Primer Reporte</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reportes}
          renderItem={renderReporte}
          keyExtractor={(item) => item._id!}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: COLORS.dark,
  },
  reportTurno: {
    fontSize: 12,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  reportLocation: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  reportDetail: {
    fontSize: 12,
    color: COLORS.secondary,
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
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportListScreen;
