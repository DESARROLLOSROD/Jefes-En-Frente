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
import { COLORS, TURNOS } from '../../constants/config';
import ControlAcarreoSection from '../../components/reports/ControlAcarreoSection';
import ControlMaterialSection from '../../components/reports/ControlMaterialSection';
import ControlAguaSection from '../../components/reports/ControlAguaSection';
import ControlMaquinariaSection from '../../components/reports/ControlMaquinariaSection';
import MapPinSelector from '../../components/maps/MapPinSelector';

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
  const [terminoActividades, setTermino Actividades] = useState('');
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
    if (!selectedProject) return;

    try {
      const [zonesData, vehiculosData] = await Promise.all([
        ApiService.getZonesByProject(selectedProject._id),
        ApiService.getVehiculosByProyecto(selectedProject._id),
      ]);

      setZones(zonesData);
      setVehiculos(vehiculosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
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
        <Text style={styles.sectionTitle}>Información General</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ubicación *</Text>
          <TextInput
            style={styles.input}
            value={ubicacion}
            onChangeText={setUbicacion}
            placeholder="Ej: Zona Norte"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Turno *</Text>
          <View style={styles.radioGroup}>
            {TURNOS.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.radioButton,
                  turno === t.value && styles.radioButtonSelected,
                ]}
                onPress={() => setTurno(t.value as any)}
              >
                <Text
                  style={[
                    styles.radioText,
                    turno === t.value && styles.radioTextSelected,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Inicio (HH:MM) *</Text>
            <TextInput
              style={styles.input}
              value={inicioActividades}
              onChangeText={setInicioActividades}
              placeholder="07:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
            <Text style={styles.label}>Término (HH:MM) *</Text>
            <TextInput
              style={styles.input}
              value={terminoActividades}
              onChangeText={setTerminoActividades}
              placeholder="19:00"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Jefe de Frente</Text>
          <TextInput
            style={styles.input}
            value={jefeFrente}
            onChangeText={setJefeFrente}
            placeholder="Nombre del jefe"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sobrestante</Text>
          <TextInput
            style={styles.input}
            value={sobrestante}
            onChangeText={setSobrestante}
            placeholder="Nombre del sobrestante"
          />
        </View>

        {/* Secciones de Control */}
        <ControlAcarreoSection items={controlAcarreo} onChange={setControlAcarreo} />

        <ControlMaterialSection items={controlMaterial} onChange={setControlMaterial} />

        <ControlAguaSection items={controlAgua} onChange={setControlAgua} />

        <ControlMaquinariaSection items={controlMaquinaria} onChange={setControlMaquinaria} />

        {/* Mapa */}
        {selectedProject?.mapa && (
          <MapPinSelector
            mapaBase64={selectedProject.mapa.imagen.data}
            pin={mapPin || undefined}
            onPinChange={(x, y) => setMapPin({ pinX: x, pinY: y })}
            onPinRemove={() => setMapPin(null)}
          />
        )}

        <Text style={styles.sectionTitle}>Observaciones</Text>

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
    backgroundColor: COLORS.light,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  radioButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  radioTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
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
