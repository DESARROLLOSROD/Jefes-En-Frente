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
import { Picker } from '@react-native-picker/picker';
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
  PinMapa,
} from '../../types';
import { useCreateReporte } from '../../hooks/useReportes';
import { useZonesByProject } from '../../hooks/useZones';
import { useVehiculosByProyecto } from '../../hooks/useVehiculos';
import {
  useMateriales,
  useCreateMaterial,
  useOrigenes,
  useCreateOrigen,
  useDestinos,
  useCreateDestino,
  useCapacidades,
  useCreateCapacidad,
} from '../../hooks/useGlobalFields';
import ModalControlAcarreo from '../../components/modals/ModalControlAcarreo';
import ModalControlMaterial from '../../components/modals/ModalControlMaterial';
import ModalControlAgua from '../../components/modals/ModalControlAgua';
import ModalControlMaquinaria from '../../components/modals/ModalControlMaquinaria';
import MapPinSelector from '../../components/MapPinSelector';
import ProjectMap from '../../components/ProjectMap';

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

  // Hooks para datos globales sincronizados
  const { data: dbOrigenes = [] } = useOrigenes();
  const { data: dbDestinos = [] } = useDestinos();
  const { data: dbMateriales = [] } = useMateriales();
  const { data: dbCapacidades = [] } = useCapacidades();

  const createMaterialMutation = useCreateMaterial();
  const createOrigenMutation = useCreateOrigen();
  const createDestinoMutation = useCreateDestino();
  const createCapacidadMutation = useCreateCapacidad();

  const [fecha, setFecha] = useState(new Date());
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
  const [isMultiPin, setIsMultiPin] = useState(false);
  const [pinesMapa, setPinesMapa] = useState<PinMapa[]>([]);

  // Listas de la sesión (se sincronizan con DB)
  const [sessionOrigenes, setSessionOrigenes] = useState<any[]>([]);
  const [sessionDestinos, setSessionDestinos] = useState<any[]>([]);
  const [sessionMateriales, setSessionMateriales] = useState<any[]>([]);
  const [sessionCapacidades, setSessionCapacidades] = useState<any[]>([]);

  // Combinar datos de DB con los creados en la sesión actual
  const allOrigenes = [...dbOrigenes, ...sessionOrigenes];
  const allDestinos = [...dbDestinos, ...sessionDestinos];
  const allMateriales = [...dbMateriales, ...sessionMateriales];
  const allCapacidades = [...dbCapacidades, ...sessionCapacidades];

  const availableSections = zones.find(z => z._id === selectedZone)?.sections || [];

  const handleSubmit = () => {
    if (!inicioActividades || !terminoActividades) {
      Alert.alert('Error', 'Por favor completa los campos requeridos');
      return;
    }

    if (zones.length > 0 && !selectedZone) {
      Alert.alert('Error', 'Por favor selecciona una Zona');
      return;
    }

    if (selectedZone && availableSections.length > 0 && !selectedSection) {
      Alert.alert('Error', 'Por favor selecciona una Sección');
      return;
    }

    const reporte: ReporteActividades = {
      fecha,
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
      ubicacionMapa: !isMultiPin && pinX !== undefined && pinY !== undefined ? {
        pinX: pinX!,
        pinY: pinY!,
        colocado: true
      } : undefined,
      pinesMapa: isMultiPin ? pinesMapa : [],
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

    // Persistir nuevos valores en MongoDB y actualizar sesión local
    if (acarreo.material && !allMateriales.find(m => m.nombre === acarreo.material)) {
      setSessionMateriales(prev => [...prev, { _id: Date.now().toString(), nombre: acarreo.material }]);
      createMaterialMutation.mutate({ nombre: acarreo.material });
    }
    if (acarreo.origen && !allOrigenes.find(o => o.nombre === acarreo.origen)) {
      setSessionOrigenes(prev => [...prev, { _id: Date.now().toString(), nombre: acarreo.origen }]);
      createOrigenMutation.mutate({ nombre: acarreo.origen });
    }
    if (acarreo.destino && !allDestinos.find(d => d.nombre === acarreo.destino)) {
      setSessionDestinos(prev => [...prev, { _id: Date.now().toString(), nombre: acarreo.destino }]);
      createDestinoMutation.mutate({ nombre: acarreo.destino });
    }
    if (acarreo.capacidad && !allCapacidades.find(c => c.nombre === acarreo.capacidad)) {
      setSessionCapacidades(prev => [...prev, { _id: Date.now().toString(), nombre: acarreo.capacidad }]);
      createCapacidadMutation.mutate({ nombre: acarreo.capacidad });
    }
  };

  const handleAgregarMaterial = (material: ControlMaterial) => {
    setControlMaterial([...controlMaterial, material]);
    // Persistir materiales nuevos
    if (material.material && !allMateriales.find(m => m.nombre === material.material)) {
      setSessionMateriales(prev => [...prev, { _id: Date.now().toString(), nombre: material.material }]);
      createMaterialMutation.mutate({ nombre: material.material });
    }
  };

  const handleAgregarAgua = (agua: ControlAgua) => {
    setControlAgua([...controlAgua, agua]);

    // Persistir orígenes, destinos y capacidades nuevos
    if (agua.origen && !allOrigenes.find(o => o.nombre === agua.origen)) {
      setSessionOrigenes(prev => [...prev, { _id: Date.now().toString(), nombre: agua.origen }]);
      createOrigenMutation.mutate({ nombre: agua.origen });
    }
    if (agua.destino && !allDestinos.find(d => d.nombre === agua.destino)) {
      setSessionDestinos(prev => [...prev, { _id: Date.now().toString(), nombre: agua.destino }]);
      createDestinoMutation.mutate({ nombre: agua.destino });
    }
    if (agua.capacidad && !allCapacidades.find(c => c.nombre === agua.capacidad)) {
      setSessionCapacidades(prev => [...prev, { _id: Date.now().toString(), nombre: agua.capacidad }]);
      createCapacidadMutation.mutate({ nombre: agua.capacidad });
    }
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

  const handleAddMultiPin = (pin: Omit<PinMapa, 'id'>) => {
    const newPin: PinMapa = {
      ...pin,
      id: Date.now().toString(),
    };
    setPinesMapa([...pinesMapa, newPin]);
  };

  const handleRemoveMultiPin = (pinId: string) => {
    setPinesMapa(pinesMapa.filter(p => p.id !== pinId));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.section, styles.sectionOrange]}>
          <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>ZONA *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedZone}
                  onValueChange={(itemValue) => {
                    setSelectedZone(itemValue);
                    setSelectedSection(''); // Reset sección when zona changes
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="SELECCIONAR ZONA..." value="" color="#9CA3AF" />
                  {zones.map((zone) => (
                    <Picker.Item key={zone._id} label={zone.name} value={zone._id} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>SECCIÓN *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSection}
                  onValueChange={(itemValue) => setSelectedSection(itemValue)}
                  style={styles.picker}
                  enabled={!!selectedZone}
                >
                  <Picker.Item label="SELECCIONAR SECCIÓN..." value="" color="#9CA3AF" />
                  {availableSections.map((section: any) => (
                    <Picker.Item key={section.id} label={section.name} value={section.id} />
                  ))}
                </Picker>
              </View>
            </View>
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
            </View>
          </View>

          {/* Sección de Mapa - Integrada abajo de la información general */}
          {selectedProject?.mapa && (
            <View style={styles.mapContainerRefined}>
              <View style={styles.mapHeader}>
                <Text style={styles.sectionTitleSmall}>UBICACIÓN EN MAPA</Text>
                <TouchableOpacity
                  style={[styles.miniToggle, isMultiPin && styles.miniToggleActive]}
                  onPress={() => setIsMultiPin(!isMultiPin)}
                >
                  <Text style={[styles.miniToggleText, isMultiPin && styles.miniToggleTextActive]}>
                    PINES MÚLTIPLES: {isMultiPin ? 'SÍ' : 'NO'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isMultiPin ? (
                <View style={{ height: 350 }}>
                  <ProjectMap
                    proyecto={selectedProject}
                    pins={pinesMapa}
                    onPinAdd={handleAddMultiPin}
                    onPinRemove={handleRemoveMultiPin}
                    editable={true}
                    showControls={true}
                  />
                </View>
              ) : (
                <MapPinSelector
                  mapaImagen={`data:${selectedProject.mapa.imagen.contentType};base64,${selectedProject.mapa.imagen.data}`}
                  pinX={pinX}
                  pinY={pinY}
                  onPinChange={handlePinChange}
                  onPinRemove={handlePinRemove}
                />
              )}
            </View>
          )}
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


        <TouchableOpacity style={[styles.submitButton, createReporteMutation.isPending && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={createReporteMutation.isPending}>
          <Text style={styles.submitButtonText}>{createReporteMutation.isPending ? 'GUARDANDO...' : 'CREAR REPORTE'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <ModalControlAcarreo
        isOpen={showAcarreoModal}
        onClose={() => setShowAcarreoModal(false)}
        onSave={handleAgregarAcarreo}
        origenes={allOrigenes}
        destinos={allDestinos}
        materiales={allMateriales}
        capacidades={allCapacidades}
        proyectoId={selectedProject?._id}
      />

      <ModalControlMaterial
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        onSave={handleAgregarMaterial}
        materiales={allMateriales}
      />

      <ModalControlAgua
        isOpen={showAguaModal}
        onClose={() => setShowAguaModal(false)}
        onSave={handleAgregarAgua}
        vehiculos={vehiculos}
        origenes={allOrigenes}
        destinos={allDestinos}
        capacidades={allCapacidades}
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
  sectionTitleSmall: { fontSize: 14, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
  mapContainerRefined: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 12, fontSize: 14, fontWeight: '500', color: '#1F2937' },
  pickerContainer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, overflow: 'hidden' },
  picker: { height: 50, width: '100%', color: '#1F2937' },
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
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  miniToggle: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  miniToggleActive: {
    backgroundColor: '#3B82F6',
  },
  miniToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
  },
  miniToggleTextActive: {
    color: '#FFFFFF',
  },
});

export default ReportFormWebStyle;
