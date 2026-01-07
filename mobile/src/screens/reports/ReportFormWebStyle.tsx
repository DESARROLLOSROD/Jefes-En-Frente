import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

    const reporte: any = {
      fecha,
      proyectoId: selectedProject!._id,
      usuarioId: user!._id,
      turno,
      inicioActividades,
      terminoActividades,
      jefeFrente,
      sobrestante,
      observaciones,
      controlAcarreo: controlAcarreo.filter(a => a.material && (Number(a.noViaje) > 0 || Number(a.capacidad) > 0)),
      controlMaterial: controlMaterial.filter(m => m.material && Number(m.cantidad) > 0),
      controlAgua: controlAgua.filter(a => a.noEconomico && (Number(a.viaje) > 0 || Number(a.capacidad) > 0)),
      controlMaquinaria: controlMaquinaria.filter(m => m.tipo && (Number(m.horasOperacion) > 0 || (m.horometroFinal !== undefined && m.horometroFinal > 0))),
      ubicacionMapa: !isMultiPin && pinX !== undefined && pinY !== undefined ? {
        pinX: pinX!,
        pinY: pinY!,
        colocado: true
      } : undefined,
      pinesMapa: isMultiPin ? pinesMapa : [],
      ubicacion: selectedProject?.nombre?.toUpperCase() || 'GENERAL',
      offlineId: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    if (__DEV__) {
      console.log('🚀 Enviando Reporte:', {
        ubicacion: reporte.ubicacion,
        zona: reporte.zonaTrabajo?.zonaNombre,
        seccion: reporte.seccionTrabajo?.seccionNombre,
        capacidadesAcarreo: reporte.controlAcarreo.map((a: any) => a.capacidad),
      });
    }

    setIsSubmitting(true);
    createReporteMutation.mutate(reporte, {
      onSuccess: () => {
        setIsSubmitting(false);
        navigation.goBack();
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        // Si el error es por offline, ya se encoló, así que cerramos el formulario
        if (error.isOffline) {
          navigation.goBack();
        }
      }
    });
  };

  const handleTurnoChange = (nuevoTurno: 'primer' | 'segundo') => {
    setTurno(nuevoTurno);
    setInicioActividades(nuevoTurno === 'primer' ? '07:00' : '19:00');
    setTerminoActividades(nuevoTurno === 'primer' ? '19:00' : '07:00');
  };

  const onDateChange = (selectedDate: Date) => {
    setFecha(selectedDate);
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
    if (acarreo.capacidad && !allCapacidades.find(c => (c.valor === acarreo.capacidad || c.nombre === acarreo.capacidad))) {
      console.log('📦 Guardando nueva capacidad (Acarreo):', acarreo.capacidad);
      setSessionCapacidades(prev => [...prev, { _id: Date.now().toString(), valor: acarreo.capacidad }]);
      createCapacidadMutation.mutate({ valor: acarreo.capacidad });
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
    if (agua.capacidad && !allCapacidades.find(c => (c.valor === agua.capacidad || c.nombre === agua.capacidad))) {
      console.log('📦 Guardando nueva capacidad (Agua):', agua.capacidad);
      setSessionCapacidades(prev => [...prev, { _id: Date.now().toString(), valor: agua.capacidad }]);
      createCapacidadMutation.mutate({ valor: agua.capacidad });
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
          <View style={[styles.section, styles.sectionOrange]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
              <Text style={{ fontSize: 10, color: '#FB923C', fontWeight: 'bold' }}>v1.0.1-MODAL-DATE-V2</Text>
            </View>

            {/* Fila 1: Fecha y Turno (2 columnas) */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>FECHA *</Text>
                <TouchableOpacity
                  style={[styles.inputSmall, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.inputTextSelected}>
                    {fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                  <MaterialCommunityIcons name="calendar-month" size={20} color="#FB923C" />
                </TouchableOpacity>

                {showDatePicker && (
                  <ModalDatePicker
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    selectedDate={fecha}
                    onSelect={onDateChange}
                  />
                )}
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>TURNO *</Text>
                <View style={styles.turnoContainer}>
                  <TouchableOpacity
                    style={[
                      styles.turnoButton,
                      turno === 'primer' && styles.turnoButtonActive,
                    ]}
                    onPress={() => handleTurnoChange('primer')}
                  >
                    <Text
                      style={[
                        styles.turnoText,
                        turno === 'primer' && styles.turnoTextActive,
                      ]}
                    >
                      1ER TURNO
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.turnoButton,
                      turno === 'segundo' && styles.turnoButtonActive,
                    ]}
                    onPress={() => handleTurnoChange('segundo')}
                  >
                    <Text
                      style={[
                        styles.turnoText,
                        turno === 'segundo' && styles.turnoTextActive,
                      ]}
                    >
                      2DO TURNO
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Fila 2: Inicio y Término (2 columnas) */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>INICIO *</Text>
                <TextInput style={styles.inputSmall} value={inicioActividades} onChangeText={setInicioActividades} placeholder="07:00" placeholderTextColor="#9CA3AF" />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>TÉRMINO *</Text>
                <TextInput style={styles.inputSmall} value={terminoActividades} onChangeText={setTerminoActividades} placeholder="19:00" placeholderTextColor="#9CA3AF" />
              </View>
            </View>

            {/* Fila 2: Zona y Sección (2 columnas) */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>ZONA DE TRABAJO *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowZoneModal(true)}
                >
                  <Text style={selectedZone ? styles.selectButtonTextSelected : styles.selectButtonTextPlaceholder}>
                    {selectedZone ? zones.find(z => z._id === selectedZone)?.name : 'SELECCIONAR ZONA...'}
                  </Text>
                  <Text style={styles.selectButtonIcon}>▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>SECCIÓN DE TRABAJO *</Text>
                <TouchableOpacity
                  style={[styles.selectButton, !selectedZone && styles.selectButtonDisabled]}
                  onPress={() => selectedZone && setShowSectionModal(true)}
                  disabled={!selectedZone}
                >
                  <Text style={selectedSection ? styles.selectButtonTextSelected : styles.selectButtonTextPlaceholder}>
                    {selectedSection ? availableSections.find((s: any) => s.id === selectedSection)?.name : 'SELECCIONAR SECCIÓN...'}
                  </Text>
                  <Text style={styles.selectButtonIcon}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Fila 3: Jefe y Sobrestante (2 columnas) */}
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

          {/* SECCIÓN 2: UBICACIÓN EN MAPA (Sección Azul separada) */}
          {selectedProject?.mapa && (
            <View style={[styles.section, styles.sectionMapBlue]}>
              <View style={styles.mapHeaderRefined}>
                <Text style={styles.mapTitleMain}>UBICACIÓN EN MAPA DEL PROYECTO</Text>
                <View style={styles.multiPinToggleRow}>
                  <Text style={styles.miniToggleLabel}>MÚLTIPLES PINES: </Text>
                  <TouchableOpacity
                    style={[styles.miniToggleLarge, isMultiPin && styles.miniToggleActive]}
                    onPress={() => setIsMultiPin(!isMultiPin)}
                  >
                    <Text style={[styles.miniToggleText, isMultiPin && styles.miniToggleTextActive]}>
                      {isMultiPin ? 'ACTIVADO' : 'DESACTIVADO'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.mapInstructionUpper}>COLOQUE UN PIN EN EL MAPA PARA INDICAR DÓNDE SE REALIZÓ EL TRABAJO (OPCIONAL)</Text>

              <View style={styles.mapFrame}>
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
              <Text style={styles.mapInstructionLower}>CLICK EN EL MAPA PARA COLOCAR EL PIN</Text>
            </View>
          )}


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



          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'GUARDANDO...' : 'GUARDAR REPORTE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Selección de Zona */}
        <Modal visible={showZoneModal} animationType="slide" transparent onRequestClose={() => setShowZoneModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>SELECCIONAR ZONA</Text>
                <TouchableOpacity onPress={() => setShowZoneModal(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={zones}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedZone(item._id);
                      setSelectedSection('');
                      setShowZoneModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {selectedZone === item._id && <Text style={styles.modalItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Selección de Sección */}
        <Modal visible={showSectionModal} animationType="slide" transparent onRequestClose={() => setShowSectionModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>SELECCIONAR SECCIÓN</Text>
                <TouchableOpacity onPress={() => setShowSectionModal(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableSections}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedSection(item.id);
                      setShowSectionModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {selectedSection === item.id && <Text style={styles.modalItemCheck}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16 },
  section: { borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2 },
  sectionOrange: { borderColor: '#2563eb', backgroundColor: '#FFF7ED' }, // Cambiado a azul para diagnóstico
  sectionGreen: { borderColor: '#4ADE80', backgroundColor: '#F0FDF4' },
  sectionRed: { borderColor: '#F87171', backgroundColor: '#FEF2F2' },
  sectionBlue: { borderColor: '#60A5FA', backgroundColor: '#EFF6FF' },
  sectionPurple: { borderColor: '#A78BFA', backgroundColor: '#F5F3FF' },
  sectionGray: { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
  sectionMapBlue: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF', padding: 0, overflow: 'hidden' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#9A3412', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1.5, borderBottomColor: '#FDE6D2', textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitleSmall: { fontSize: 14, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
  mapTitleMain: { fontSize: 16, fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' },
  mapContainerRefined: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DEE2E6', borderRadius: 8, padding: 14, fontSize: 16, fontWeight: '700', color: '#1F2937' },
  inputSmall: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DEE2E6', borderRadius: 8, padding: 10, fontSize: 15, fontWeight: '700', color: '#1F2937', height: 48, justifyContent: 'center' },
  inputTextSelected: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  inputDisabled: { backgroundColor: '#EDF2F7', borderWidth: 1.5, borderColor: '#DEE2E6', borderRadius: 8, padding: 10, height: 48, justifyContent: 'center' },
  inputTextDisabled: { fontSize: 15, fontWeight: '700', color: '#718096' },
  pickerContainer: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DEE2E6', borderRadius: 8, overflow: 'hidden' },
  picker: { height: 50, width: '100%', color: '#1F2937' },
  pickerSmall: { height: 48, width: '100%', color: '#1F2937' },
  row: { flexDirection: 'row', marginBottom: 16, marginHorizontal: -6 },
  halfWidth: { flex: 1, marginHorizontal: 6 },
  quarterWidth: { flex: 1 },
  turnoContainer: { flexDirection: 'row', marginHorizontal: -6 },
  turnoButton: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, padding: 12, backgroundColor: '#FFFFFF', alignItems: 'center', marginHorizontal: 6 },
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
  mapHeaderRefined: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(30,64,175,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,64,175,0.1)',
  },
  multiPinToggleRow: { flexDirection: 'row', alignItems: 'center' },
  miniToggleLabel: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  miniToggleLarge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  miniToggleActive: {
    backgroundColor: '#3B82F6',
  },
  miniToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  miniToggleTextActive: {
    color: '#FFFFFF',
  },
  mapInstructionUpper: { fontSize: 11, fontWeight: '600', color: '#64748B', paddingHorizontal: 16, paddingTop: 12, textTransform: 'uppercase' },
  mapInstructionLower: { fontSize: 11, fontWeight: '600', color: '#64748B', padding: 12, textTransform: 'uppercase', textAlign: 'center' },
  mapFrame: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#FFFFFF', marginVertical: 8 },
  // Estilos para selectores personalizados
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  selectButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  selectButtonTextSelected: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  selectButtonTextPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  selectButtonIcon: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  // Estilos para modales de selección
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
  },
  modalCloseButton: {
    fontSize: 28,
    fontWeight: '300',
    color: '#6B7280',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalItemCheck: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
});

// --- COMPONENTE SELECTOR DE FECHA PERSONALIZADO (JS ONLY) ---
const ModalDatePicker = ({ visible, onClose, selectedDate, onSelect }: any) => {
  const [day, setDay] = useState(selectedDate.getDate().toString());
  const [month, setMonth] = useState(selectedDate.getMonth().toString());
  const [year, setYear] = useState(selectedDate.getFullYear().toString());

  const days = Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString().padStart(2, '0'), value: (i + 1).toString() }));
  const months = [
    { label: 'Enero', value: '0' }, { label: 'Febrero', value: '1' }, { label: 'Marzo', value: '2' },
    { label: 'Abril', value: '3' }, { label: 'Mayo', value: '4' }, { label: 'Junio', value: '5' },
    { label: 'Julio', value: '6' }, { label: 'Agosto', value: '7' }, { label: 'Septiembre', value: '8' },
    { label: 'Octubre', value: '9' }, { label: 'Noviembre', value: '10' }, { label: 'Diciembre', value: '11' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({ label: (currentYear - i).toString(), value: (currentYear - i).toString() }));

  const handleConfirm = () => {
    const newDate = new Date(parseInt(year), parseInt(month), parseInt(day));
    onSelect(newDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SELECCIONAR FECHA</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.modalCloseButton}>✕</Text></TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DÍA</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={day} onValueChange={(v) => setDay(v)} style={styles.pickerSmall}>
                  {days.map(d => <Picker.Item key={d.value} label={d.label} value={d.value} />)}
                </Picker>
              </View>
            </View>
            <View style={{ flex: 2, marginHorizontal: 10 }}>
              <Text style={styles.label}>MES</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={month} onValueChange={(v) => setMonth(v)} style={styles.pickerSmall}>
                  {months.map(m => <Picker.Item key={m.value} label={m.label} value={m.value} />)}
                </Picker>
              </View>
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.label}>AÑO</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={year} onValueChange={(v) => setYear(v)} style={styles.pickerSmall}>
                  {years.map(y => <Picker.Item key={y.value} label={y.label} value={y.value} />)}
                </Picker>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { margin: 20, backgroundColor: '#FB923C' }]}
            onPress={handleConfirm}
          >
            <Text style={styles.submitButtonText}>CONFIRMAR FECHA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReportFormWebStyle;
