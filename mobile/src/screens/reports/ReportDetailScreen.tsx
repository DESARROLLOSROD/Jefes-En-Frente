import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import ApiService from '../../services/api';
import { ReporteActividades } from '../../types';
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
      const html = generatePDFHTML(reporte, selectedProject?.nombre || 'N/A');
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
        {/* Header principal con iconos */}
        <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.headerIcons}>
            <MaterialCommunityIcons name="hard-hat" size={36} color={theme.primary} />
            <MaterialCommunityIcons name="safety-goggles" size={36} color={theme.primary} />
          </View>
          <Text style={[styles.mainTitle, { color: theme.text }]}>REPORTE DE ACTIVIDADES DIARIAS</Text>
          <Text style={[styles.projectName, { color: theme.primary }]}>
            {selectedProject?.nombre || 'N/A'}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.primary }]} />
        </View>

        {/* Información General */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Fecha:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {new Date(reporte.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Turno:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{reporte.turno}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Ubicación:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {reporte.zonaTrabajo?.zonaNombre || reporte.ubicacion}
              {reporte.seccionTrabajo ? ` - ${reporte.seccionTrabajo.seccionNombre}` : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Zona de Trabajo:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {reporte.zonaTrabajo?.zonaNombre || 'N/A'}
            </Text>
          </View>

          {reporte.seccionTrabajo && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Sección de Trabajo:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {reporte.seccionTrabajo.seccionNombre}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Jefe de Frente:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {reporte.jefeFrente || '-'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Sobrestante:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {reporte.sobrestante || '-'}
            </Text>
          </View>
        </View>

        {/* Mapa */}
        {reporte.ubicacionMapa && selectedProject?.mapa && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>UBICACIÓN EN MAPA DEL PROYECTO</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              ZONA: {reporte.zonaTrabajo?.zonaNombre || 'N/A'} | SECCIÓN: {reporte.seccionTrabajo?.seccionNombre || 'N/A'}
            </Text>
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

        {/* Control de Acarreos */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>CONTROL DE ACARREOS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableContainer}>
              <View style={[styles.tableHeader, { backgroundColor: theme.primary }]}>
                <Text style={[styles.tableHeaderText, styles.colNum]}>#</Text>
                <Text style={[styles.tableHeaderText, styles.colMaterial]}>Material</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>No. Viaje</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Capacidad</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Vol. Suelto</Text>
                <Text style={[styles.tableHeaderText, styles.colSmall]}>Capa</Text>
                <Text style={[styles.tableHeaderText, styles.colSmall]}>Elevación</Text>
                <Text style={[styles.tableHeaderText, styles.colSmall]}>Origen</Text>
                <Text style={[styles.tableHeaderText, styles.colSmall]}>Destino</Text>
              </View>
              {reporte.controlAcarreo && reporte.controlAcarreo.length > 0 ? (
                <>
                  {reporte.controlAcarreo.map((item: any, index: number) => (
                    <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                      <Text style={[styles.tableCell, styles.colNum, { color: theme.text }]}>{index + 1}</Text>
                      <Text style={[styles.tableCell, styles.colMaterial, { color: theme.text }]}>{item.material || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.noViaje || 0}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.capacidad || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.volSuelto || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.capa || '-'}</Text>
                      <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.elevacion || '-'}</Text>
                      <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.origen || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.destino || 'N/A'}</Text>
                    </View>
                  ))}
                  <View style={[styles.tableTotalRow, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.tableTotalLabel, { color: theme.text }]}>TOTAL VOLUMEN:</Text>
                    <Text style={[styles.tableTotalValue, { color: theme.text }]}>
                      {reporte.controlAcarreo.reduce((sum: number, item: any) => {
                        const vol = parseFloat(String(item.volSuelto).replace(/[^\d.]/g, '')) || 0;
                        return sum + vol;
                      }, 0).toFixed(2)} m³
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyRow}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin registros</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Control de Material */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>CONTROL DE MATERIAL</Text>
          <View style={styles.tableContainer}>
            <View style={[styles.tableHeader, { backgroundColor: theme.primary }]}>
              <Text style={[styles.tableHeaderText, styles.colMaterial]}>Material</Text>
              <Text style={[styles.tableHeaderText, styles.colSmall]}>Unidad</Text>
              <Text style={[styles.tableHeaderText, styles.colSmall]}>Cantidad</Text>
              <Text style={[styles.tableHeaderText, styles.colMedium]}>Zona</Text>
              <Text style={[styles.tableHeaderText, styles.colSmall]}>Elevación</Text>
            </View>
            {reporte.controlMaterial && reporte.controlMaterial.length > 0 ? (
              reporte.controlMaterial.map((item: any, index: number) => (
                <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.tableCell, styles.colMaterial, { color: theme.text }]}>{item.material || 'N/A'}</Text>
                  <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.unidad || 'N/A'}</Text>
                  <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.cantidad || 0}</Text>
                  <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.zona || '-'}</Text>
                  <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.elevacion || '-'}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyRow}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin registros</Text>
              </View>
            )}
          </View>
        </View>

        {/* Control de Agua */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>CONTROL DE AGUA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableContainer}>
              <View style={[styles.tableHeader, { backgroundColor: theme.primary }]}>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>No. Económico</Text>
                <Text style={[styles.tableHeaderText, styles.colSmall]}>Viaje</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Capacidad</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Volumen</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Origen</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Destino</Text>
              </View>
              {reporte.controlAgua && reporte.controlAgua.length > 0 ? (
                <>
                  {reporte.controlAgua.map((item: any, index: number) => (
                    <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.noEconomico || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.viaje || 0}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.capacidad || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.volumen || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.origen || 'N/A'}</Text>
                      <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.destino || 'N/A'}</Text>
                    </View>
                  ))}
                  <View style={[styles.tableTotalRow, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.tableTotalLabel, { color: theme.text }]}>TOTAL VOLUMEN:</Text>
                    <Text style={[styles.tableTotalValue, { color: theme.text }]}>
                      {reporte.controlAgua.reduce((sum: number, item: any) => {
                        const vol = parseFloat(String(item.volumen).replace(/[^\d.]/g, '')) || 0;
                        return sum + vol;
                      }, 0).toFixed(2)} m³
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyRow}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin registros</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Control de Maquinaria */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>CONTROL DE MAQUINARIA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableContainer}>
              <View style={[styles.tableHeader, { backgroundColor: theme.primary }]}>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Tipo</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>No. Económico</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Horómetro Inicial</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Horómetro Final</Text>
                <Text style={[styles.tableHeaderText, styles.colSmall]}>Horas</Text>
                <Text style={[styles.tableHeaderText, styles.colMedium]}>Operador</Text>
                <Text style={[styles.tableHeaderText, styles.colLarge]}>Actividad</Text>
              </View>
              {reporte.controlMaquinaria && reporte.controlMaquinaria.length > 0 ? (
                reporte.controlMaquinaria.map((item: any, index: number) => (
                  <View key={index} style={[styles.tableRow, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.tipo || 'N/A'}</Text>
                    <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.numeroEconomico || item.nombre || 'N/A'}</Text>
                    <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.horometroInicial || 0}</Text>
                    <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.horometroFinal || 0}</Text>
                    <Text style={[styles.tableCell, styles.colSmall, { color: theme.text }]}>{item.horasOperacion || 0}</Text>
                    <Text style={[styles.tableCell, styles.colMedium, { color: theme.text }]}>{item.operador || 'N/A'}</Text>
                    <Text style={[styles.tableCell, styles.colLarge, { color: theme.text }]}>{item.actividad || 'N/A'}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyRow}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin registros</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Observaciones */}
        {reporte.observaciones && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>OBSERVACIONES</Text>
            <View style={[styles.observacionesContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.observaciones, { color: theme.text }]}>{reporte.observaciones}</Text>
            </View>
          </View>
        )}

        {/* Botón de PDF */}
        <TouchableOpacity onPress={handleDownloadPDF} style={[styles.pdfButton, { backgroundColor: theme.primary }]}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.pdfButtonText}>Descargar PDF</Text>
        </TouchableOpacity>

        {/* Acciones Administrativas */}
        {canManage && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton, { backgroundColor: theme.primary }]}
              onPress={handleEdit}
            >
              <Ionicons name="create" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Editar Reporte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, { borderColor: theme.danger }]}
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

const generatePDFHTML = (reporte: ReporteActividades, projectName: string) => {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #4F46E5; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
          .project { color: #4F46E5; font-size: 16px; font-weight: bold; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          .section-title { font-size: 14px; font-weight: bold; background: #4F46E5; color: white; padding: 8px; margin-bottom: 10px; }
          .info-row { display: flex; margin-bottom: 5px; font-size: 12px; }
          .info-label { font-weight: bold; width: 150px; }
          .info-value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #4F46E5; color: white; padding: 8px; text-align: left; font-weight: bold; }
          td { border: 1px solid #ddd; padding: 6px; }
          tr:nth-child(even) { background: #f9fafb; }
          .total-row { background: #e0e7ff !important; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">REPORTE DE ACTIVIDADES DIARIAS</div>
          <div class="project">${projectName}</div>
        </div>

        <div class="section">
          <div class="info-row">
            <div class="info-label">Fecha:</div>
            <div class="info-value">${new Date(reporte.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div class="info-label" style="margin-left: 20px;">Turno:</div>
            <div class="info-value">${reporte.turno}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Ubicación:</div>
            <div class="info-value">${reporte.zonaTrabajo?.zonaNombre || reporte.ubicacion}${reporte.seccionTrabajo ? ` - ${reporte.seccionTrabajo.seccionNombre}` : ''}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Jefe de Frente:</div>
            <div class="info-value">${reporte.jefeFrente || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Sobrestante:</div>
            <div class="info-value">${reporte.sobrestante || '-'}</div>
          </div>
        </div>

        ${reporte.controlAcarreo && reporte.controlAcarreo.length > 0 ? `
          <div class="section">
            <div class="section-title">CONTROL DE ACARREOS</div>
            <table>
              <tr>
                <th>#</th><th>Material</th><th>No. Viaje</th><th>Capacidad</th><th>Vol. Suelto</th>
                <th>Capa</th><th>Elevación</th><th>Origen</th><th>Destino</th>
              </tr>
              ${reporte.controlAcarreo.map((item: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.material || 'N/A'}</td>
                  <td>${item.noViaje || 0}</td>
                  <td>${item.capacidad || 'N/A'}</td>
                  <td>${item.volSuelto || 'N/A'}</td>
                  <td>${item.capa || '-'}</td>
                  <td>${item.elevacion || '-'}</td>
                  <td>${item.origen || 'N/A'}</td>
                  <td>${item.destino || 'N/A'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4">TOTAL VOLUMEN:</td>
                <td colspan="5">${reporte.controlAcarreo.reduce((sum: number, item: any) => sum + (parseFloat(String(item.volSuelto).replace(/[^\d.]/g, '')) || 0), 0).toFixed(2)} m³</td>
              </tr>
            </table>
          </div>
        ` : '<div class="section"><div class="section-title">CONTROL DE ACARREOS</div><p>Sin registros</p></div>'}

        ${reporte.controlMaterial && reporte.controlMaterial.length > 0 ? `
          <div class="section">
            <div class="section-title">CONTROL DE MATERIAL</div>
            <table>
              <tr><th>Material</th><th>Unidad</th><th>Cantidad</th><th>Zona</th><th>Elevación</th></tr>
              ${reporte.controlMaterial.map((item: any) => `
                <tr>
                  <td>${item.material || 'N/A'}</td>
                  <td>${item.unidad || 'N/A'}</td>
                  <td>${item.cantidad || 0}</td>
                  <td>${item.zona || '-'}</td>
                  <td>${item.elevacion || '-'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}

        ${reporte.controlAgua && reporte.controlAgua.length > 0 ? `
          <div class="section">
            <div class="section-title">CONTROL DE AGUA</div>
            <table>
              <tr><th>No. Económico</th><th>Viaje</th><th>Capacidad</th><th>Volumen</th><th>Origen</th><th>Destino</th></tr>
              ${reporte.controlAgua.map((item: any) => `
                <tr>
                  <td>${item.noEconomico || 'N/A'}</td>
                  <td>${item.viaje || 0}</td>
                  <td>${item.capacidad || 'N/A'}</td>
                  <td>${item.volumen || 'N/A'}</td>
                  <td>${item.origen || 'N/A'}</td>
                  <td>${item.destino || 'N/A'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">TOTAL VOLUMEN:</td>
                <td colspan="3">${reporte.controlAgua.reduce((sum: number, item: any) => sum + (parseFloat(String(item.volumen).replace(/[^\d.]/g, '')) || 0), 0).toFixed(2)} m³</td>
              </tr>
            </table>
          </div>
        ` : ''}

        ${reporte.controlMaquinaria && reporte.controlMaquinaria.length > 0 ? `
          <div class="section">
            <div class="section-title">CONTROL DE MAQUINARIA</div>
            <table>
              <tr><th>Tipo</th><th>No. Econ.</th><th>Hor. Inicial</th><th>Hor. Final</th><th>Horas</th><th>Operador</th><th>Actividad</th></tr>
              ${reporte.controlMaquinaria.map((item: any) => `
                <tr>
                  <td>${item.tipo || 'N/A'}</td>
                  <td>${item.numeroEconomico || item.nombre || 'N/A'}</td>
                  <td>${item.horometroInicial || 0}</td>
                  <td>${item.horometroFinal || 0}</td>
                  <td>${item.horasOperacion || 0}</td>
                  <td>${item.operador || 'N/A'}</td>
                  <td>${item.actividad || 'N/A'}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        ` : ''}

        ${reporte.observaciones ? `
          <div class="section">
            <div class="section-title">OBSERVACIONES</div>
            <p style="padding: 10px; background: #f9fafb; border-radius: 5px;">${reporte.observaciones}</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
          Generado: ${new Date().toLocaleString('es-ES')}
        </div>
      </body>
    </html>
  `;
};

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
  headerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 3,
    borderRadius: 2,
    marginTop: 8,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '400',
  },
  mapContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
    height: 300,
  },
  tableContainer: {
    marginTop: 8,
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 11,
    textAlign: 'center',
  },
  tableTotalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  colNum: {
    width: 40,
  },
  colSmall: {
    width: 70,
  },
  colMedium: {
    width: 100,
  },
  colMaterial: {
    width: 120,
  },
  colLarge: {
    width: 150,
  },
  observacionesContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  observaciones: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsContainer: {
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
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportDetailScreen;
