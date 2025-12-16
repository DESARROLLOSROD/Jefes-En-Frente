import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import {
  ReporteActividades,
  WorkZone,
  Vehiculo,
  ControlAcarreo,
  ControlMaterial,
  ControlAgua,
  ControlMaquinaria,
} from '../../types';
import { COLORS, TURNOS, THEME } from '../../constants/config';
import ControlAcarreoSection from '../../components/reports/ControlAcarreoSection';
import ControlMaterialSection from '../../components/reports/ControlMaterialSection';
import ControlAguaSection from '../../components/reports/ControlAguaSection';
import ControlMaquinariaSection from '../../components/reports/ControlMaquinariaSection';
import MapPinSelector from '../../components/maps/MapPinSelector';
import Picker from '../../components/common/Picker';
import Section from '../../components/Section';

type ReportFormNavigationProp = StackNavigationProp<RootStackParamList, 'ReportForm'>;
type ReportFormRouteProp = RouteProp<RootStackParamList, 'ReportForm'>;

const ReportFormScreen = () => {
  const navigation = useNavigation<ReportFormNavigationProp>();
  const route = useRoute<ReportFormRouteProp>();
  const { user, selectedProject } = useAuth();

  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<WorkZone[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  // Estado del formulario
  const [fecha, setFecha] = useState(new Date());
  const [ubicacion, setUbicacion] = useState('');
  const [turno, setTurno] = useState<'primer' | 'segundo'>('primer');
  const [inicioActividades, setInicioActividades] = useState('');
  const [terminoActividades, setTerminoActividades] = useState('');
  const [jefeFrente, setJefeFrente] = useState(user?.nombre || '');
  const [sobrestante, setSobrestante] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Estados para controles
  const [controlAcarreo, setControlAcarreo] = useState<ControlAcarreo[]>([]);
  const [controlMaterial, setControlMaterial] = useState<ControlMaterial[]>([]);
  const [controlAgua, setControlAgua] = useState<ControlAgua[]>([]);
  const [controlMaquinaria, setControlMaquinaria] = useState<ControlMaquinaria[]>([]);

  // Estado para mapa
  const [mapPin, setMapPin] = useState<{ pinX: number; pinY: number } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (!selectedProject) {
      console.log('❌ No hay proyecto seleccionado');
      return;
    }

    try {
      console.log('📡 Cargando datos para proyecto:', selectedProject.nombre);
      const [zonesData, vehiculosData] = await Promise.all([
        ApiService.getZonesByProject(selectedProject._id),
        ApiService.getVehiculosByProyecto(selectedProject._id),
      ]);

      console.log('✅ Zonas cargadas:', zonesData.length);
      console.log('✅ Vehículos cargados:', vehiculosData.length);
      console.log('🗺️ Proyecto tiene mapa:', !!selectedProject.mapa);

      setZones(zonesData);
      setVehiculos(vehiculosData);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    }
  };

  const handleSubmit = async () => {
    if (!ubicacion || !inicioActividades || !terminoActividades) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const reporte: ReporteActividades = {
        fecha,
        ubicacion,
        proyectoId: selectedProject!._id,
        usuarioId: user!._id,
        turno,
        inicioActividades,
        terminoActividades,
        jefeFrente,
        sobrestante,
        observaciones,
        controlAcarreo,
        controlMaterial,
        controlAgua,
        controlMaquinaria,
        pinesMapa: [],
      };

      // Agregar ubicación del mapa si existe
      if (mapPin) {
        reporte.ubicacionMapa = {
          pinX: mapPin.pinX,
          pinY: mapPin.pinY,
          colocado: true,
        };
      }

      if (selectedZone) {
        const zone = zones.find((z) => z._id === selectedZone);
        if (zone) {
          reporte.zonaTrabajo = {
            zonaId: zone._id,
            zonaNombre: zone.name,
          };

          if (selectedSection) {
            const section = zone.sections.find((s) => s.id === selectedSection);
            if (section) {
              reporte.seccionTrabajo = {
                seccionId: section.id,
                seccionNombre: section.name,
              };
            }
          }
        }
      }

      await ApiService.createReporte(reporte);
      Alert.alert('Éxito', 'Reporte creado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error al crear reporte:', error);
      Alert.alert('Error', 'No se pudo crear el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {selectedProject && (
          <View style={styles.projectHeader}>
            <Text style={styles.projectTitle}>REPORTE DE ACTIVIDADES</Text>
            <Text style={styles.projectSubtitle}>GENERAL CONTRACTOR</Text>
            <Text style={styles.projectLocation}>
              UBICACIÓN: {selectedProject.ubicacion || selectedProject.nombre}
            </Text>
          </View>
        )}

        <Section variant="orange" title="INFORMACIÓN GENERAL">
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>FECHA</Text>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateText}>
                  {fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>TURNO</Text>
              <View style={styles.turnoButtonGroup}>
                {TURNOS.map((t, index) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.turnoButton,
                      index === 0 ? styles.turnoButtonFirst : styles.turnoButtonLast,
                      turno === t.value && styles.turnoButtonSelected,
                    ]}
                    onPress={() => setTurno(t.value as any)}
                  >
                    <Text
                      style={[
                        styles.turnoText,
                        turno === t.value && styles.turnoTextSelected,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>INICIO (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={inicioActividades}
                onChangeText={setInicioActividades}
                placeholder="07:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>TÉRMINO (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={terminoActividades}
                onChangeText={setTerminoActividades}
                placeholder="19:00"
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ZONA DE TRABAJO</Text>
            <TextInput
              style={styles.input}
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholder="Ej: Zona Norte"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>JEFE DE FRENTE</Text>
              <TextInput
                style={styles.input}
                value={jefeFrente}
                onChangeText={setJefeFrente}
                placeholder="Nombre del jefe"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>SOBRESTANTE</Text>
              <TextInput
                style={styles.input}
                value={sobrestante}
                onChangeText={setSobrestante}
                placeholder="Nombre del sobrestante"
              />
            </View>
          </View>
        </Section>

        {/* Mapa del Proyecto */}
        {selectedProject?.mapa && (
          <Section variant="blue" title="UBICACIÓN EN MAPA DEL PROYECTO">
            <MapPinSelector
              mapaBase64={selectedProject.mapa.imagen.data}
              pin={mapPin || undefined}
              onPinChange={(x, y) => setMapPin({ pinX: x, pinY: y })}
              onPinRemove={() => setMapPin(null)}
            />
          </Section>
        )}

        {zones.length > 0 && (
          <Section variant="purple" title="DETALLE DE ZONA">
            <View style={styles.infoCard}>
              <Picker
                label="Zona de Trabajo"
                value={selectedZone}
                options={zones.map((z) => ({ label: z.name, value: z._id }))}
                onChange={setSelectedZone}
                placeholder="Seleccionar zona..."
              />

              {selectedZone && (zones.find((z) => z._id === selectedZone)?.sections.length ?? 0) > 0 && (
                <Picker
                  label="Sección"
                  value={selectedSection}
                  options={
                    zones
                      .find((z) => z._id === selectedZone)
                      ?.sections.map((s) => ({ label: s.name, value: s.id })) || []
                  }
                  onChange={setSelectedSection}
                  placeholder="Seleccionar sección..."
                />
              )}
            </View>
          </Section>
        )}

        {/* Secciones de Control */}
        <Section variant="green" title="CONTROL DE ACARREO">
          <ControlAcarreoSection items={controlAcarreo} onChange={setControlAcarreo} />
        </Section>
        <Section variant="green" title="CONTROL DE MATERIAL EXTENDIDO">
          <ControlMaterialSection items={controlMaterial} onChange={setControlMaterial} />
        </Section>
        <Section variant="green" title="CONTROL DE AGUA">
          <ControlAguaSection items={controlAgua} onChange={setControlAgua} />
        </Section>
        <Section variant="green" title="CONTROL DE MAQUINARIA">
          <ControlMaquinariaSection items={controlMaquinaria} onChange={setControlMaquinaria} />
        </Section>

        <Section title="OBSERVACIONES">
          <View style={styles.inputGroup}>
            <TextInput
            style={[styles.input, styles.textArea]}
            value={observaciones}
            onChangeText={setObservaciones}
            placeholder="Observaciones adicionales..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          </View>
        </Section>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Crear Reporte</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  projectHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  projectSubtitle: {
    fontSize: 16,
    color: THEME.colors.text,
    marginTop: 4,
  },
  projectLocation: {
    fontSize: 14,
    color: THEME.colors.text,
    marginTop: 8,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'transparent',
    padding: 0,
    borderWidth: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME.colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 16,
  },
  dateDisplay: {
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: THEME.colors.text,
  },
  turnoButtonGroup: {
    flexDirection: 'row',
  },
  turnoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  turnoButtonFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0.5,
  },
  turnoButtonLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0.5,
  },
  turnoButtonSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  turnoText: {
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '600',
  },
  turnoTextSelected: {
    color: THEME.colors.white,
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: THEME.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  note: {
    fontSize: 12,
    color: COLORS.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default ReportFormScreen;
