import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ApiService from '../../services/api';
import { ReporteActividades } from '../../types';
import { COLORS } from '../../constants/config';

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

const ReportDetailScreen = () => {
  const route = useRoute<ReportDetailRouteProp>();
  const [reporte, setReporte] = useState<ReporteActividades | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReporte();
  }, []);

  const loadReporte = async () => {
    try {
      const data = await ApiService.getReporteById(route.params.reportId);
      setReporte(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!reporte) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se pudo cargar el reporte</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Información General</Text>
        <InfoRow label="Fecha" value={new Date(reporte.fecha).toLocaleDateString()} />
        <InfoRow label="Ubicación" value={reporte.ubicacion} />
        <InfoRow label="Turno" value={reporte.turno} />
        <InfoRow label="Horario" value={`${reporte.inicioActividades} - ${reporte.terminoActividades}`} />

        {reporte.jefeFrente && (
          <>
            <Text style={styles.title}>Personal</Text>
            <InfoRow label="Jefe de Frente" value={reporte.jefeFrente} />
            {reporte.sobrestante && <InfoRow label="Sobrestante" value={reporte.sobrestante} />}
          </>
        )}

        {reporte.observaciones && (
          <>
            <Text style={styles.title}>Observaciones</Text>
            <Text style={styles.observaciones}>{reporte.observaciones}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '30',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    width: 120,
  },
  value: {
    fontSize: 14,
    color: COLORS.dark,
    flex: 1,
  },
  observaciones: {
    fontSize: 14,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
  },
});

export default ReportDetailScreen;
