import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ApiService from '../../services/api';
import { ReporteActividades, Proyecto } from '../../types';
import { COLORS } from '../../constants/config';
import MapPinSelector from '../../components/maps/MapPinSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from '../../utils/toast';

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;
type ReportDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ReportDetail'>;

const ReportDetailScreen = () => {
  const route = useRoute<ReportDetailRouteProp>();
  const navigation = useNavigation<ReportDetailNavigationProp>();
  const { selectedProject, user } = useAuth();
  const { theme } = useTheme();
  const [reporte, setReporte] = useState<ReporteActividades | null>(null);
  const [loading, setLoading] = useState(true);

  // Permisos: Admin y Supervisor pueden editar/borrar
  const canManage = user?.rol === 'admin' || user?.rol === 'supervisor';

  useEffect(() => {
    loadReporte();
  }, []);

  const loadReporte = async () => {
    try {
      const data = await ApiService.getReporteById(route.params.reportId);
      setReporte(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      toast.error('No se pudo cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!reporte?._id) return;
    navigation.navigate('ReportForm', { reportId: reporte._id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Reporte',
      '¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await ApiService.deleteReporte(reporte!._id!);
              toast.success('Reporte eliminado con éxito');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar:', error);
              toast.error('No se pudo eliminar el reporte');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDownloadPDF = async () => {
    if (!reporte) return;

    try {
      toast.info('Generando PDF...');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
              .title { color: #2563eb; font-size: 24px; margin-bottom: 5px; }
              .subtitle { font-size: 14px; color: #666; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; background: #f1f5f9; padding: 8px; border-radius: 4px; margin-bottom: 15px; color: #1e40af; }
              .row { display: flex; flex-direction: row; margin-bottom: 10px; }
              .label { font-weight: bold; width: 140px; color: #475569; }
              .value { flex: 1; }
              .observaciones { background: #f8fafc; padding: 15px; border-radius: 8px; font-style: italic; font-size: 14px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">REPORTE DIARIO DE ACTIVIDADES</div>
              <div class="subtitle">Proyecto: ${selectedProject?.nombre || 'N/A'}</div>
            </div>

            <div class="section">
              <div class="section-title">Información General</div>
              <div class="row"><div class="label">Fecha:</div><div class="value">${new Date(reporte.fecha).toLocaleDateString()}</div></div>
              <div class="row"><div class="label">Turno:</div><div class="value">${reporte.turno}</div></div>
              <div class="row"><div class="label">Ubicación:</div><div class="value">${reporte.zonaTrabajo?.zonaNombre || reporte.ubicacion || 'N/A'}</div></div>
              <div class="row"><div class="label">Horario:</div><div class="value">${reporte.inicioActividades} - ${reporte.terminoActividades}</div></div>
            </div>

            <div class="section">
              <div class="section-title">Personal Responsable</div>
              <div class="row"><div class="label">Jefe de Frente:</div><div class="value">${reporte.jefeFrente || 'N/A'}</div></div>
              <div class="row"><div class="label">Sobrestante:</div><div class="value">${reporte.sobrestante || 'N/A'}</div></div>
            </div>

            ${reporte.observaciones ? `
            <div class="section">
              <div class="section-title">Observaciones</div>
              <div class="observaciones">${reporte.observaciones}</div>
            </div>
            ` : ''}

            <div class="footer">
              Generado desde App Jefes en Frente - ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      toast.success('PDF generado con éxito');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('No se pudo generar el PDF');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!reporte) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.danger }]}>No se pudo cargar el reporte</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>Información General</Text>
            <TouchableOpacity onPress={handleDownloadPDF} style={styles.pdfIcon}>
              <Ionicons name="document-text" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <InfoRow label="Fecha" value={new Date(reporte.fecha).toLocaleDateString()} theme={theme} />
          <InfoRow
            label="Ubicación"
            value={reporte.zonaTrabajo?.zonaNombre || reporte.ubicacion}
            theme={theme}
          />
          {reporte.seccionTrabajo && (
            <InfoRow label="Sección" value={reporte.seccionTrabajo.seccionNombre} theme={theme} />
          )}
          <InfoRow label="Turno" value={reporte.turno} theme={theme} />
          <InfoRow label="Horario" value={`${reporte.inicioActividades} - ${reporte.terminoActividades}`} theme={theme} />

          {(reporte.jefeFrente || reporte.sobrestante) && (
            <>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>Personal</Text>
              {reporte.jefeFrente && <InfoRow label="Jefe de Frente" value={reporte.jefeFrente} theme={theme} />}
              {reporte.sobrestante && <InfoRow label="Sobrestante" value={reporte.sobrestante} theme={theme} />}
            </>
          )}

          {/* Mapa con ubicación */}
          {reporte.ubicacionMapa && selectedProject?.mapa && (
            <View style={styles.mapSection}>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>Ubicación en Mapa</Text>
              <View style={[styles.mapContainer, { borderColor: theme.border }]}>
                <MapPinSelector
                  mapaBase64={selectedProject.mapa.imagen.data}
                  pin={{
                    pinX: reporte.ubicacionMapa.pinX,
                    pinY: reporte.ubicacionMapa.pinY,
                  }}
                  onPinChange={() => { }}
                  onPinRemove={() => { }}
                  readOnly={true}
                />
              </View>
            </View>
          )}

          {reporte.observaciones && (
            <>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>Observaciones</Text>
              <View style={[styles.observacionesContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.observaciones, { color: theme.text }]}>{reporte.observaciones}</Text>
              </View>
            </>
          )}
        </View>

        {/* Acciones Administrativas */}
        {canManage && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton, { backgroundColor: theme.primary }]}
              onPress={handleEdit}
            >
              <Ionicons name="create" size={20} color={theme.white} />
              <Text style={[styles.actionButtonText, { color: theme.white }]}>Editar Reporte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, { backgroundColor: 'transparent', borderColor: theme.danger }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color={theme.danger} />
              <Text style={[styles.actionButtonText, { color: theme.danger }]}>Eliminar Reporte</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <View style={[styles.infoRow, { borderBottomColor: theme.divider }]}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}:</Text>
    <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pdfIcon: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    width: 120,
  },
  value: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  mapSection: {
    marginTop: 8,
  },
  mapContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
  },
  observacionesContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  observaciones: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  editButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButton: {
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportDetailScreen;

export default ReportDetailScreen;
