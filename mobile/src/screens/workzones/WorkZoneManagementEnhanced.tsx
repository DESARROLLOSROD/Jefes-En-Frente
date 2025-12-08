import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import { WorkZone, Section, WorkZoneStatus } from '../../types';
import { COLORS } from '../../constants/config';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

const WorkZoneManagementEnhanced = () => {
  const { selectedProject } = useAuth();
  const [zones, setZones] = useState<WorkZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState<WorkZone | null>(null);
  const [selectedZoneForSection, setSelectedZoneForSection] = useState<WorkZone | null>(null);

  // Form state for zones
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [status, setStatus] = useState<WorkZoneStatus>('active');
  const [saving, setSaving] = useState(false);

  // Form state for sections
  const [sectionNombre, setSectionNombre] = useState('');
  const [sectionDescripcion, setSectionDescripcion] = useState('');
  const [sectionStatus, setSectionStatus] = useState<WorkZoneStatus>('active');

  const statuses: WorkZoneStatus[] = ['active', 'inactive', 'completed'];

  useEffect(() => {
    if (selectedProject) {
      loadZones();
    }
  }, [selectedProject]);

  const loadZones = async () => {
    if (!selectedProject) return;

    try {
      const data = await ApiService.getZonesByProject(selectedProject._id);
      setZones(data);
    } catch (error) {
      console.error('Error al cargar zonas:', error);
      Alert.alert('Error', 'No se pudieron cargar las zonas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadZones();
  };

  const openZoneModal = (zone?: WorkZone) => {
    if (zone) {
      setEditingZone(zone);
      setNombre(zone.name);
      setDescripcion(zone.description);
      setStatus(zone.status);
    } else {
      resetZoneForm();
    }
    setModalVisible(true);
  };

  const resetZoneForm = () => {
    setEditingZone(null);
    setNombre('');
    setDescripcion('');
    setStatus('active');
  };

  const handleSaveZone = async () => {
    if (!nombre || !selectedProject) {
      Alert.alert('Error', 'Por favor completa el nombre de la zona');
      return;
    }

    setSaving(true);
    try {
      const zoneData: Partial<WorkZone> = {
        projectId: selectedProject._id,
        name: nombre,
        description: descripcion,
        status,
        sections: editingZone?.sections || [],
      };

      if (editingZone) {
        await ApiService.updateZone(editingZone._id, zoneData);
        Alert.alert('Éxito', 'Zona actualizada correctamente');
      } else {
        await ApiService.createZone(zoneData);
        Alert.alert('Éxito', 'Zona creada correctamente');
      }

      setModalVisible(false);
      loadZones();
      resetZoneForm();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar la zona');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = (zone: WorkZone) => {
    Alert.alert(
      'Eliminar Zona',
      `¿Estás seguro de eliminar la zona ${zone.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteZone(zone._id);
              Alert.alert('Éxito', 'Zona eliminada correctamente');
              loadZones();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la zona');
            }
          },
        },
      ]
    );
  };

  const openSectionModal = (zone: WorkZone) => {
    setSelectedZoneForSection(zone);
    setSectionNombre('');
    setSectionDescripcion('');
    setSectionStatus('active');
    setSectionModalVisible(true);
  };

  const handleSaveSection = async () => {
    if (!sectionNombre || !selectedZoneForSection) {
      Alert.alert('Error', 'Por favor completa el nombre de la sección');
      return;
    }

    setSaving(true);
    try {
      const sectionData = {
        name: sectionNombre,
        description: sectionDescripcion,
        status: sectionStatus,
      };

      await ApiService.addSection(selectedZoneForSection._id, sectionData);
      Alert.alert('Éxito', 'Sección agregada correctamente');

      setSectionModalVisible(false);
      loadZones();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo agregar la sección');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: WorkZoneStatus) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'inactive':
        return COLORS.secondary;
      case 'completed':
        return COLORS.info;
    }
  };

  const getStatusLabel = (status: WorkZoneStatus) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'inactive':
        return 'Inactiva';
      case 'completed':
        return 'Completada';
    }
  };

  const renderZone = ({ item }: { item: WorkZone }) => (
    <Card>
      <View style={styles.zoneHeader}>
        <View style={styles.flex1}>
          <Text style={styles.zoneName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.zoneDescription}>{item.description}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
          <Text style={styles.zoneDetail}>
            Secciones: {item.sections.length}
          </Text>

          {/* Secciones */}
          {item.sections.length > 0 && (
            <View style={styles.sectionsContainer}>
              <Text style={styles.sectionsTitle}>Secciones:</Text>
              {item.sections.map((section) => (
                <View key={section.id} style={styles.sectionItem}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  <View style={[styles.sectionStatusBadge, { backgroundColor: getStatusColor(section.status) }]}>
                    <Text style={styles.sectionStatusText}>{getStatusLabel(section.status)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addSectionButton}
            onPress={() => openSectionModal(item)}
          >
            <Text style={styles.addSectionText}>+ Agregar Sección</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openZoneModal(item)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteZone(item)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (!selectedProject) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Selecciona un proyecto</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando zonas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={zones}
        renderItem={renderZone}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay zonas registradas</Text>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => openZoneModal()}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Zonas */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingZone ? 'Editar Zona' : 'Nueva Zona'}
              </Text>

              <Input
                label="Nombre de la Zona"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Zona Norte"
                required
              />

              <Input
                label="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción de la zona..."
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Estado</Text>
              <View style={styles.statusGrid}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      status === s && styles.statusButtonSelected,
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        status === s && styles.statusButtonTextSelected,
                      ]}
                    >
                      {getStatusLabel(s)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setModalVisible(false);
                    resetZoneForm();
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title={editingZone ? 'Actualizar' : 'Crear'}
                  onPress={handleSaveZone}
                  loading={saving}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para Secciones */}
      <Modal
        visible={sectionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Agregar Sección</Text>

              <Input
                label="Nombre de la Sección"
                value={sectionNombre}
                onChangeText={setSectionNombre}
                placeholder="Ej: Sección A"
                required
              />

              <Input
                label="Descripción"
                value={sectionDescripcion}
                onChangeText={setSectionDescripcion}
                placeholder="Descripción de la sección..."
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Estado</Text>
              <View style={styles.statusGrid}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusButton,
                      sectionStatus === s && styles.statusButtonSelected,
                    ]}
                    onPress={() => setSectionStatus(s)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        sectionStatus === s && styles.statusButtonTextSelected,
                      ]}
                    >
                      {getStatusLabel(s)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setSectionModalVisible(false)}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title="Agregar"
                  onPress={handleSaveSection}
                  loading={saving}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  listContainer: {
    padding: 16,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  zoneDescription: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  zoneDetail: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
  },
  sectionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '30',
  },
  sectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sectionName: {
    fontSize: 13,
    color: COLORS.dark,
  },
  sectionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectionStatusText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  addSectionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addSectionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actions: {
    justifyContent: 'flex-start',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  statusButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  statusButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
});

export default WorkZoneManagementEnhanced;
