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
import { Vehiculo, TipoVehiculo } from '../../types';
import { COLORS, TIPOS_VEHICULO } from '../../constants/config';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

const VehicleManagementEnhanced = () => {
  const { selectedProject } = useAuth();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehiculo | null>(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoVehiculo>('Camioneta');
  const [noEconomico, setNoEconomico] = useState('');
  const [horometroInicial, setHorometroInicial] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      const data = selectedProject
        ? await ApiService.getVehiculosByProyecto(selectedProject._id)
        : await ApiService.getVehiculos();
      setVehiculos(data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVehiculos();
  };

  const openModal = (vehicle?: Vehiculo) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setNombre(vehicle.nombre);
      setTipo(vehicle.tipo);
      setNoEconomico(vehicle.noEconomico);
      setHorometroInicial(vehicle.horometroInicial.toString());
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setNombre('');
    setTipo('Camioneta');
    setNoEconomico('');
    setHorometroInicial('0');
  };

  const handleSave = async () => {
    if (!nombre || !noEconomico) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const vehiculoData: Partial<Vehiculo> = {
        nombre,
        tipo,
        noEconomico: noEconomico.toUpperCase(),
        horometroInicial: parseFloat(horometroInicial) || 0,
        proyectos: selectedProject ? [selectedProject._id] : [],
      };

      if (editingVehicle) {
        await ApiService.updateVehiculo(editingVehicle._id, vehiculoData);
        Alert.alert('Éxito', 'Vehículo actualizado correctamente');
      } else {
        await ApiService.createVehiculo(vehiculoData);
        Alert.alert('Éxito', 'Vehículo creado correctamente');
      }

      setModalVisible(false);
      loadVehiculos();
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar el vehículo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (vehicle: Vehiculo) => {
    Alert.alert(
      'Eliminar Vehículo',
      `¿Estás seguro de eliminar el vehículo ${vehicle.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteVehiculo(vehicle._id);
              Alert.alert('Éxito', 'Vehículo eliminado correctamente');
              loadVehiculos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el vehículo');
            }
          },
        },
      ]
    );
  };

  const renderVehicle = ({ item }: { item: Vehiculo }) => (
    <Card>
      <View style={styles.vehicleHeader}>
        <View style={styles.flex1}>
          <Text style={styles.vehicleName}>{item.nombre}</Text>
          <Text style={styles.vehicleDetail}>Tipo: {item.tipo}</Text>
          <Text style={styles.vehicleDetail}>No. Económico: {item.noEconomico}</Text>
          <Text style={styles.vehicleDetail}>
            Horómetro: {item.horometroFinal || item.horometroInicial} hrs
          </Text>
          <Text style={styles.vehicleDetail}>
            Horas de Operación: {item.horasOperacion} hrs
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openModal(item)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando vehículos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vehiculos}
        renderItem={renderVehicle}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay vehículos registrados</Text>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>

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
                {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </Text>

              <Input
                label="Nombre del Vehículo"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Volvo FH16"
                required
              />

              <Text style={styles.label}>Tipo de Vehículo *</Text>
              <View style={styles.typeGrid}>
                {TIPOS_VEHICULO.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeButton,
                      tipo === t && styles.typeButtonSelected,
                    ]}
                    onPress={() => setTipo(t as TipoVehiculo)}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        tipo === t && styles.typeTextSelected,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Número Económico"
                value={noEconomico}
                onChangeText={setNoEconomico}
                placeholder="Ej: VH-001"
                autoCapitalize="characters"
                required
              />

              <Input
                label="Horómetro Inicial"
                value={horometroInicial}
                onChangeText={setHorometroInicial}
                placeholder="0"
                keyboardType="numeric"
                required
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  variant="secondary"
                  style={styles.modalButton}
                />
                <Button
                  title={editingVehicle ? 'Actualizar' : 'Crear'}
                  onPress={handleSave}
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
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  vehicleDetail: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  actions: {
    justifyContent: 'space-between',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  typeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  typeTextSelected: {
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

export default VehicleManagementEnhanced;
