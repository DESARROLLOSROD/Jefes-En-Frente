import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
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
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

type ReportFormNavigationProp = StackNavigationProp<RootStackParamList, 'ReportForm'>;
type ReportFormRouteProp = RouteProp<RootStackParamList, 'ReportForm'>;

const ReportFormEnhanced = () => {
  const navigation = useNavigation<ReportFormNavigationProp>();
  const route = useRoute<ReportFormRouteProp>();
  const { user, selectedProject } = useAuth();

  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<WorkZone[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  // Estado del formulario básico
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

  // Controles
  const [controlAcarreo, setControlAcarreo] = useState<ControlAcarreo[]>([]);
  const [controlMaterial, setControlMaterial] = useState<ControlMaterial[]>([]);
  const [controlAgua, setControlAgua] = useState<ControlAgua[]>([]);
  const [controlMaquinaria, setControlMaquinaria] = useState<ControlMaquinaria[]>([]);

  // Modales
  const [showAcarreoModal, setShowAcarreoModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAguaModal, setShowAguaModal] = useState(false);
  const [showMaquinariaModal, setShowMaquinariaModal] = useState(false);

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

  // Agregar control de acarreo
  const addAcarreo = (data: ControlAcarreo) => {
    setControlAcarreo([...controlAcarreo, data]);
    setShowAcarreoModal(false);
  };

  // Agregar control de material
  const addMaterial = (data: ControlMaterial) => {
    setControlMaterial([...controlMaterial, data]);
    setShowMaterialModal(false);
  };

  // Agregar control de agua
  const addAgua = (data: ControlAgua) => {
    setControlAgua([...controlAgua, data]);
    setShowAguaModal(false);
  };

  // Agregar control de maquinaria
  const addMaquinaria = (data: ControlMaquinaria) => {
    setControlMaquinaria([...controlMaquinaria, data]);
    setShowMaquinariaModal(false);
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
        <Card>
          <Text style={styles.sectionTitle}>Información General</Text>

          <Input
            label="Ubicación"
            value={ubicacion}
            onChangeText={setUbicacion}
            placeholder="Ej: Zona Norte"
            required
          />

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

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Inicio (HH:MM)"
                value={inicioActividades}
                onChangeText={setInicioActividades}
                placeholder="07:00"
                keyboardType="numbers-and-punctuation"
                required
              />
            </View>

            <View style={[styles.flex1, styles.marginLeft]}>
              <Input
                label="Término (HH:MM)"
                value={terminoActividades}
                onChangeText={setTerminoActividades}
                placeholder="19:00"
                keyboardType="numbers-and-punctuation"
                required
              />
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Personal</Text>

          <Input
            label="Jefe de Frente"
            value={jefeFrente}
            onChangeText={setJefeFrente}
            placeholder="Nombre del jefe"
          />

          <Input
            label="Sobrestante"
            value={sobrestante}
            onChangeText={setSobrestante}
            placeholder="Nombre del sobrestante"
          />
        </Card>

        {/* Controles */}
        <Card>
          <Text style={styles.sectionTitle}>Controles de Actividad</Text>

          <ControlSection
            title="Control de Acarreo"
            count={controlAcarreo.length}
            onAdd={() => setShowAcarreoModal(true)}
          />

          <ControlSection
            title="Control de Material"
            count={controlMaterial.length}
            onAdd={() => setShowMaterialModal(true)}
          />

          <ControlSection
            title="Control de Agua"
            count={controlAgua.length}
            onAdd={() => setShowAguaModal(true)}
          />

          <ControlSection
            title="Control de Maquinaria"
            count={controlMaquinaria.length}
            onAdd={() => setShowMaquinariaModal(true)}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Observaciones</Text>

          <Input
            value={observaciones}
            onChangeText={setObservaciones}
            placeholder="Observaciones adicionales..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </Card>

        <Button
          title="Crear Reporte"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Modales para agregar controles - implementar según necesidad */}
    </ScrollView>
  );
};

const ControlSection = ({
  title,
  count,
  onAdd,
}: {
  title: string;
  count: number;
  onAdd: () => void;
}) => (
  <View style={styles.controlSection}>
    <View style={styles.controlHeader}>
      <Text style={styles.controlTitle}>{title}</Text>
      <Text style={styles.controlCount}>({count})</Text>
    </View>
    <Button
      title="Agregar"
      onPress={onAdd}
      variant="secondary"
      style={styles.addButton}
    />
  </View>
);

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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
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
    marginBottom: 16,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  controlSection: {
    marginBottom: 16,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  controlCount: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  addButton: {
    paddingVertical: 8,
  },
});

export default ReportFormEnhanced;
