import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import {
  ReporteActividades,
  ControlAcarreo,
  ControlMaterial,
  ControlAgua,
  ControlMaquinaria,
} from '../../types';
import { useCreateReporte } from '../../hooks/useReportes';
import { useZonesByProject } from '../../hooks/useZones';
import { useVehiculosByProyecto } from '../../hooks/useVehiculos';
import ModalControlAcarreo from '../../components/modals/ModalControlAcarreo';
import ModalControlMaterial from '../../components/modals/ModalControlMaterial';
import ModalControlAgua from '../../components/modals/ModalControlAgua';
import ModalControlMaquinaria from '../../components/modals/ModalControlMaquinaria';
import MapPinSelector from '../../components/MapPinSelector';

type ReportFormNavigationProp = StackNavigationProp<RootStackParamList, 'ReportForm'>;
type ReportFormRouteProp = RouteProp<RootStackParamList, 'ReportForm'>;

const ReportFormWebStyle = () => {
  const navigation = useNavigation<ReportFormNavigationProp>();
  const route = useRoute<ReportFormRouteProp>();
  const { reportId } = route.params || {};
  const { user, selectedProject } = useAuth();

  const { data: zones = [] } = useZonesByProject(selectedProject?._id);
  const { data: vehiculos = [] } = useVehiculosByProyecto(selectedProject?._id);
  const createReporteMutation = useCreateReporte();

  const [fecha, setFecha] = useState(new Date());
  const [ubicacion, setUbicacion] = useState('');
  const [turno, setTurno] = useState<'primer' | 'segundo'>('primer');
  const [inicioActividades, setInicioActividades] = useState(turno === 'primer' ? '07:00' : '19:00');
  const [terminoActividades, setTerminoActividades] = useState(turno === 'primer' ? '19:00' : '07:00');
  const [jefeFrente, setJefeFrente] = useState((user?.nombre || '').toUpperCase());
  const [sobrestante, setSobrestante] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  const [controlAcarreo, setControlAcarreo] = useState<ControlAcarreo[]>([]);
  const [controlMaterial, setControlMaterial] = useState<ControlMaterial[]>([]);
  const [controlAgua, setControlAgua] = useState<ControlAgua[]>([]);
  const [controlMaquinaria, setControlMaquinaria] = useState<ControlMaquinaria[]>([]);

  // Modales
  const [showAcarreoModal, setShowAcarreoModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAguaModal, setShowAguaModal] = useState(false);
  const [showMaquinariaModal, setShowMaquinariaModal] = useState(false);

  // Pin del mapa
  const [pinX, setPinX] = useState<number | undefined>(undefined);
  const [pinY, setPinY] = useState<number | undefined>(undefined);

  // Mock data - en producción estos vendrán de APIs
  const [origenes] = useState([
    { _id: '1', nombre: 'CANTERA NORTE' },
    { _id: '2', nombre: 'ZONA DE ACOPIO' },
  ]);
  const [destinos] = useState([
    { _id: '1', nombre: 'RELLENO SANITARIO' },
    { _id: '2', nombre: 'ZONA DE DESCARGA' },
  ]);
  const [materiales] = useState([
    { _id: '1', nombre: 'CONCRETO' },
    { _id: '2', nombre: 'ARENA' },
    { _id: '3', nombre: 'GRAVA' },
  ]);

  const handleSubmit = () => {
    if (!ubicacion || !inicioActividades || !terminoActividades) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

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
        reporte.zonaTrabajo = { zonaId: zone._id, zonaNombre: zone.name };
        if (selectedSection) {
          const section = zone.sections.find((s) => s.id === selectedSection);
          if (section) {
            reporte.seccionTrabajo = { seccionId: section.id, seccionNombre: section.name };
          }
        }
      }
    }

    createReporteMutation.mutate(reporte, { onSuccess: () => navigation.goBack() });
  };

  const handleTurnoChange = (nuevoTurno: 'primer' | 'segundo') => {
    setTurno(nuevoTurno);
    setInicioActividades(nuevoTurno === 'primer' ? '07:00' : '19:00');
    setTerminoActividades(nuevoTurno === 'primer' ? '19:00' : '07:00');
  };

  // Handlers para agregar controles
  const handleAgregarAcarreo = (acarreo: ControlAcarreo) => {
    setControlAcarreo([...controlAcarreo, acarreo]);
  };

  const handleAgregarMaterial = (material: ControlMaterial) => {
    setControlMaterial([...controlMaterial, material]);
  };

  const handleAgregarAgua = (agua: ControlAgua) => {
    setControlAgua([...controlAgua, agua]);
  };

  const handleAgregarMaquinaria = (maquinaria: ControlMaquinaria) => {
    setControlMaquinaria([...controlMaquinaria, maquinaria]);
  };

  // Handlers para el mapa
  const handlePinChange = (x: number, y: number) => {
    setPinX(x);
    setPinY(y);
  };

  const handlePinRemove = () => {
    setPinX(undefined);
    setPinY(undefined);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.section, styles.sectionOrange]}>
          <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>UBICACIÓN *</Text>
            <TextInput style={styles.input} value={ubicacion} onChangeText={(text) => setUbicacion(text.toUpperCase())} placeholder="EJ: ZONA NORTE" placeholderTextColor="#9CA3AF" autoCapitalize="characters" />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>TURNO *</Text>
            <View style={styles.turnoContainer}>
              <TouchableOpacity style={[styles.turnoButton, turno === 'primer' && styles.turnoButtonActive]} onPress={() => handleTurnoChange('primer')}>
                <Text style={[styles.turnoText, turno === 'primer' && styles.turnoTextActive]}>PRIMER TURNO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.turnoButton, turno === 'segundo' && styles.turnoButtonActive]} onPress={() => handleTurnoChange('segundo')}>
                <Text style={[styles.turnoText, turno === 'segundo' && styles.turnoTextActive]}>SEGUNDO TURNO</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>INICIO ACTIVIDADES *</Text>
              <TextInput style={styles.input} value={inicioActividades} onChangeText={setInicioActividades} placeholder="07:00" placeholderTextColor="#9CA3AF" keyboardType="numbers-and-punctuation" />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>TÉRMINO ACTIVIDADES *</Text>
              <TextInput style={styles.input} value={terminoActividades} onChangeText={setTerminoActividades} placeholder="19:00" placeholderTextColor="#9CA3AF" keyboardType="numbers-and-punctuation" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>JEFE DE FRENTE *</Text>
              <TextInput style={styles.input} value={jefeFrente} onChangeText={(text) => setJefeFrente(text.toUpperCase())} placeholder="NOMBRE DEL JEFE" placeholderTextColor="#9CA3AF" autoCapitalize="characters" />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>SOBRESTANTE</Text>
              <TextInput style={styles.input} value={sobrestante} onChangeText={(text) => setSobrestante(text.toUpperCase())} placeholder="NOMBRE DEL SOBRESTANTE" placeholderTextColor="#9CA3AF" autoCapitalize="characters" />
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionGreen]}>
          <Text style={styles.sectionTitle}>CONTROL DE ACARREO</Text>
          <View style={styles.controlInfo}><Text style={styles.controlCount}>({controlAcarreo.length} REGISTROS)</Text></View>
          <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={() => setShowAcarreoModal(true)}><Text style={styles.buttonText}>AGREGAR ACARREO</Text></TouchableOpacity>
        </View>

        <View style={[styles.section, styles.sectionRed]}>
          <Text style={styles.sectionTitle}>CONTROL DE MATERIAL</Text>
          <View style={styles.controlInfo}><Text style={styles.controlCount}>({controlMaterial.length} REGISTROS)</Text></View>
          <TouchableOpacity style={[styles.button, styles.buttonRed]} onPress={() => setShowMaterialModal(true)}><Text style={styles.buttonText}>AGREGAR MATERIAL</Text></TouchableOpacity>
        </View>

        <View style={[styles.section, styles.sectionBlue]}>
          <Text style={styles.sectionTitle}>CONTROL DE AGUA</Text>
          <View style={styles.controlInfo}><Text style={styles.controlCount}>({controlAgua.length} REGISTROS)</Text></View>
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={() => setShowAguaModal(true)}><Text style={styles.buttonText}>AGREGAR AGUA</Text></TouchableOpacity>
        </View>

        <View style={[styles.section, styles.sectionPurple]}>
          <Text style={styles.sectionTitle}>CONTROL DE MAQUINARIA</Text>
          <View style={styles.controlInfo}><Text style={styles.controlCount}>({controlMaquinaria.length} REGISTROS)</Text></View>
          <TouchableOpacity style={[styles.button, styles.buttonPurple]} onPress={() => setShowMaquinariaModal(true)}><Text style={styles.buttonText}>AGREGAR MAQUINARIA</Text></TouchableOpacity>
        </View>

        <View style={[styles.section, styles.sectionGray]}>
          <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
          <TextInput style={[styles.input, styles.textArea]} value={observaciones} onChangeText={(text) => setObservaciones(text.toUpperCase())} placeholder="OBSERVACIONES ADICIONALES..." placeholderTextColor="#9CA3AF" multiline numberOfLines={4} textAlignVertical="top" autoCapitalize="characters" />
        </View>

        {/* Sección de Mapa (si el proyecto tiene mapa) */}
        {selectedProject?.mapa && (
          <View style={[styles.section, styles.sectionGray]}>
            <Text style={styles.sectionTitle}>UBICACIÓN EN MAPA</Text>
            <MapPinSelector
              mapaImagen={`data:${selectedProject.mapa.imagen.contentType};base64,${selectedProject.mapa.imagen.data}`}
              pinX={pinX}
              pinY={pinY}
              onPinChange={handlePinChange}
              onPinRemove={handlePinRemove}
            />
          </View>
        )}

        <TouchableOpacity style={[styles.submitButton, createReporteMutation.isPending && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={createReporteMutation.isPending}>
          <Text style={styles.submitButtonText}>{createReporteMutation.isPending ? 'GUARDANDO...' : 'CREAR REPORTE'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <ModalControlAcarreo
        isOpen={showAcarreoModal}
        onClose={() => setShowAcarreoModal(false)}
        onSave={handleAgregarAcarreo}
        vehiculos={vehiculos}
        origenes={origenes}
        destinos={destinos}
        materiales={materiales}
        proyectoId={selectedProject?._id}
      />

      <ModalControlMaterial
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        onSave={handleAgregarMaterial}
        materiales={materiales}
      />

      <ModalControlAgua
        isOpen={showAguaModal}
        onClose={() => setShowAguaModal(false)}
        onSave={handleAgregarAgua}
        vehiculos={vehiculos}
        origenes={origenes}
        destinos={destinos}
      />

      <ModalControlMaquinaria
        isOpen={showMaquinariaModal}
        onClose={() => setShowMaquinariaModal(false)}
        onSave={handleAgregarMaquinaria}
        vehiculos={vehiculos}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16 },
  section: { borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2 },
  sectionOrange: { borderColor: '#FB923C', backgroundColor: '#FFF7ED' },
  sectionGreen: { borderColor: '#4ADE80', backgroundColor: '#F0FDF4' },
  sectionRed: { borderColor: '#F87171', backgroundColor: '#FEF2F2' },
  sectionBlue: { borderColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  sectionPurple: { borderColor: '#A78BFA', backgroundColor: '#F5F3FF' },
  sectionGray: { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.1)', textTransform: 'uppercase', letterSpacing: 0.5 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 12, fontSize: 14, fontWeight: '500', color: '#1F2937' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfWidth: { flex: 1 },
  turnoContainer: { flexDirection: 'row', gap: 12 },
  turnoButton: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 12, backgroundColor: '#FFFFFF', alignItems: 'center' },
  turnoButtonActive: { backgroundColor: '#FB923C', borderColor: '#FB923C' },
  turnoText: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  turnoTextActive: { color: '#FFFFFF' },
  controlInfo: { marginBottom: 12 },
  controlCount: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  button: { borderRadius: 6, padding: 12, alignItems: 'center' },
  buttonGreen: { backgroundColor: '#4ADE80' },
  buttonRed: { backgroundColor: '#F87171' },
  buttonBlue: { backgroundColor: '#60A5FA' },
  buttonPurple: { backgroundColor: '#A78BFA' },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#10B981', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});

export default ReportFormWebStyle;
