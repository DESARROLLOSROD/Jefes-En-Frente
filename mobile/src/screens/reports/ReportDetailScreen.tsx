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

            ${reporte.controlAcarreo && reporte.controlAcarreo.length > 0 ? `
            <div class="section">
              <div class="section-title">Control de Acarreo (${reporte.controlAcarreo.length} registros)</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Material</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">No. Viajes</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Capacidad</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Vol. Suelto</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Origen</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Destino</th>
                  </tr>
                </thead>
                <tbody>
                  ${reporte.controlAcarreo.map(item => `
                    <tr>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.material || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.noViaje || 0}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.capacidad || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.volSuelto || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.origen || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.destino || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${reporte.controlMaterial && reporte.controlMaterial.length > 0 ? `
            <div class="section">
              <div class="section-title">Control de Material (${reporte.controlMaterial.length} registros)</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Material</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Cantidad</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  ${reporte.controlMaterial.map(item => `
                    <tr>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.material || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.cantidad || 0}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.unidad || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${reporte.controlAgua && reporte.controlAgua.length > 0 ? `
            <div class="section">
              <div class="section-title">Control de Agua (${reporte.controlAgua.length} registros)</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Vehículo</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">No. Viajes</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Capacidad</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Origen</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Destino</th>
                  </tr>
                </thead>
                <tbody>
                  ${reporte.controlAgua.map(item => `
                    <tr>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.noEconomico || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.viaje || 0}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.capacidad || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.origen || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.destino || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${reporte.controlMaquinaria && reporte.controlMaquinaria.length > 0 ? `
            <div class="section">
              <div class="section-title">Control de Maquinaria (${reporte.controlMaquinaria.length} registros)</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Vehículo</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Horario</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">Horas Trabajadas</th>
                    <th style="border: 1px solid #e2e8f0; padding: 6px; text-align: left;">Actividad</th>
                  </tr>
                </thead>
                <tbody>
                  ${reporte.controlMaquinaria.map(item => `
                    <tr>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.numeroEconomico || item.nombre || 'N/A'}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.horometroInicial || 0} - ${item.horometroFinal || 0}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px; text-align: center;">${item.horasOperacion || 0}</td>
                      <td style="border: 1px solid #e2e8f0; padding: 6px;">${item.actividad || 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

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
          <InfoRow label="Turno" value={reporte.turno} theme={theme} />
          <InfoRow
            label="Ubicación"
            value={reporte.zonaTrabajo?.zonaNombre || reporte.ubicacion}
            theme={theme}
          />
          {reporte.seccionTrabajo && (
            <InfoRow label="Sección" value={reporte.seccionTrabajo.seccionNombre} theme={theme} />
          )}
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

          {/* Control de Acarreo */}
          {reporte.controlAcarreo && reporte.controlAcarreo.length > 0 && (
            <>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>
                Control de Acarreo ({reporte.controlAcarreo.length} registros)
              </Text>
              {reporte.controlAcarreo.map((item, index) => (
                <View key={index} style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <InfoRow label="Material" value={item.material || 'N/A'} theme={theme} />
                  <InfoRow label="No. Viajes" value={String(item.noViaje || 0)} theme={theme} />
                  <InfoRow label="Capacidad" value={item.capacidad || 'N/A'} theme={theme} />
                  <InfoRow label="Vol. Suelto" value={item.volSuelto || 'N/A'} theme={theme} />
                  <InfoRow label="Origen" value={item.origen || 'N/A'} theme={theme} />
                  <InfoRow label="Destino" value={item.destino || 'N/A'} theme={theme} />
                </View>
              ))}
            </>
          )}

          {/* Control de Material */}
          {reporte.controlMaterial && reporte.controlMaterial.length > 0 && (
            <>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>
                Control de Material ({reporte.controlMaterial.length} registros)
              </Text>
              {reporte.controlMaterial.map((item, index) => (
                <View key={index} style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <InfoRow label="Material" value={item.material || 'N/A'} theme={theme} />
                  <InfoRow label="Cantidad" value={String(item.cantidad || 0)} theme={theme} />
                  <InfoRow label="Unidad" value={item.unidad || 'N/A'} theme={theme} />
                </View>
              ))}
            </>
          )}

          {/* Control de Agua */}
          {reporte.controlAgua && reporte.controlAgua.length > 0 && (
            <>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>
                Control de Agua ({reporte.controlAgua.length} registros)
              </Text>
              {reporte.controlAgua.map((item, index) => (
                <View key={index} style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <InfoRow label="Vehículo" value={item.noEconomico || 'N/A'} theme={theme} />
                  <InfoRow label="No. Viajes" value={String(item.viaje || 0)} theme={theme} />
                  <InfoRow label="Capacidad" value={item.capacidad || 'N/A'} theme={theme} />
                  <InfoRow label="Volumen" value={item.volumen || 'N/A'} theme={theme} />
                  <InfoRow label="Origen" value={item.origen || 'N/A'} theme={theme} />
                  <InfoRow label="Destino" value={item.destino || 'N/A'} theme={theme} />
                </View>
              ))}
            </>
          )}

          {/* Control de Maquinaria */}
          {reporte.controlMaquinaria && reporte.controlMaquinaria.length > 0 && (
            <>
              <Text style={[styles.title, { color: theme.primary, marginTop: 24 }]}>
                Control de Maquinaria ({reporte.controlMaquinaria.length} registros)
              </Text>
              {reporte.controlMaquinaria.map((item, index) => (
                <View key={index} style={[styles.controlCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <InfoRow label="Vehículo" value={item.numeroEconomico || item.nombre || 'N/A'} theme={theme} />
                  <InfoRow label="Tipo" value={item.tipo || 'N/A'} theme={theme} />
                  <InfoRow label="Horómetro Inicial" value={String(item.horometroInicial || 0)} theme={theme} />
                  <InfoRow label="Horómetro Final" value={String(item.horometroFinal || 0)} theme={theme} />
                  <InfoRow label="Horas Operación" value={String(item.horasOperacion || 0)} theme={theme} />
                  <InfoRow label="Operador" value={item.operador || 'N/A'} theme={theme} />
                  <InfoRow label="Actividad" value={item.actividad || 'N/A'} theme={theme} />
                </View>
              ))}
            </>
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
  controlCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 8,
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
