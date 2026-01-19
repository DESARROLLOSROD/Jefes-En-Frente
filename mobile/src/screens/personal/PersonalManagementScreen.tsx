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
import { Personal, Cargo } from '../../types';
import { COLORS } from '../../constants/config';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Picker from '../../components/common/Picker';

const PersonalManagementScreen = () => {
  const { selectedProject, user } = useAuth();
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState<Personal | null>(null);
  const [filterCargo, setFilterCargo] = useState<string>('');

  // Form state
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cargoId, setCargoId] = useState('');
  const [numeroEmpleado, setNumeroEmpleado] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      await Promise.all([loadPersonal(), loadCargos()]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPersonal = async () => {
    try {
      const params: any = {};
      if (filterCargo) params.cargo = filterCargo;
      if (selectedProject) params.proyecto = selectedProject._id;

      const data = await ApiService.getPersonal(params.cargo, params.proyecto);
      setPersonal(data);
    } catch (error) {
      console.error('Error al cargar personal:', error);
      Alert.alert('Error', 'No se pudo cargar el personal');
    }
  };

  const loadCargos = async () => {
    try {
      const data = await ApiService.getCargos();
      setCargos(data);
    } catch (error) {
      console.error('Error al cargar cargos:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openModal = (item?: Personal) => {
    if (item) {
      setEditingPersonal(item);
      setNombreCompleto(item.nombreCompleto);
      setCargoId(item.cargoId);
      setNumeroEmpleado(item.numeroEmpleado || '');
      setTelefono(item.telefono || '');
      setEmail(item.email || '');
      setObservaciones(item.observaciones || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingPersonal(null);
    setNombreCompleto('');
    setCargoId('');
    setNumeroEmpleado('');
    setTelefono('');
    setEmail('');
    setObservaciones('');
  };

  const handleSave = async () => {
    if (!nombreCompleto || !cargoId) {
      Alert.alert('Error', 'Por favor completa el nombre y el cargo');
      return;
    }

    // Validar que solo admin y supervisor puedan crear/editar
    if (user?.rol !== 'admin' && user?.rol !== 'supervisor') {
      Alert.alert('Error', 'No tienes permisos para realizar esta acción');
      return;
    }

    setSaving(true);
    try {
      const personalData: Partial<Personal> = {
        nombreCompleto,
        cargoId,
        numeroEmpleado: numeroEmpleado || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        observaciones: observaciones || undefined,
        proyectos: selectedProject ? [selectedProject._id] : [],
      };

      if (editingPersonal) {
        await ApiService.updatePersonal(editingPersonal._id, personalData);
        Alert.alert('Éxito', 'Personal actualizado correctamente');
      } else {
        await ApiService.createPersonal(personalData);
        Alert.alert('Éxito', 'Personal creado correctamente');
      }

      setModalVisible(false);
      loadPersonal();
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el personal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Personal) => {
    if (user?.rol !== 'admin') {
      Alert.alert('Error', 'Solo los administradores pueden eliminar personal');
      return;
    }

    Alert.alert(
      'Eliminar Personal',
      `¿Estás seguro de eliminar a ${item.nombreCompleto}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deletePersonal(item._id);
              Alert.alert('Éxito', 'Personal eliminado correctamente');
              loadPersonal();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el personal');
            }
          },
        },
      ]
    );
  };

  const getCargoNombre = (cargoId: string) => {
    const cargo = cargos.find(c => c._id === cargoId);
    return cargo?.nombre || 'Sin cargo';
  };

  const renderPersonal = ({ item }: { item: Personal }) => (
    <Card>
      <View style={styles.personalHeader}>
        <View style={styles.flex1}>
          <Text style={styles.personalName}>{item.nombreCompleto}</Text>
          <Text style={styles.personalDetail}>
            Cargo: {item.cargo?.nombre || getCargoNombre(item.cargoId)}
          </Text>
          {item.numeroEmpleado && (
            <Text style={styles.personalDetail}>No. Empleado: {item.numeroEmpleado}</Text>
          )}
          {item.telefono && (
            <Text style={styles.personalDetail}>Tel: {item.telefono}</Text>
          )}
          {item.email && (
            <Text style={styles.personalDetail}>Email: {item.email}</Text>
          )}
          <Text style={[styles.status, item.activo ? styles.statusActive : styles.statusInactive]}>
            {item.activo ? '● Activo' : '● Inactivo'}
          </Text>
        </View>
        <View style={styles.actions}>
          {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openModal(item)}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              {user?.rol === 'admin' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.actionButtonText}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Personal</Text>
        {(user?.rol === 'admin' || user?.rol === 'supervisor') && (
          <Button title="+ Agregar" onPress={() => openModal()} />
        )}
      </View>

      {/* Filtro por cargo */}
      {cargos.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por cargo:</Text>
          <Picker
            label=""
            value={filterCargo}
            onChange={(value) => {
              setFilterCargo(value);
              setTimeout(() => loadPersonal(), 100);
            }}
            placeholder="Todos"
            options={cargos.map(c => ({ label: c.nombre, value: c._id }))}
          />
        </View>
      )}

      <FlatList
        data={personal}
        renderItem={renderPersonal}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay personal registrado</Text>
          </View>
        }
      />

      {/* Modal para agregar/editar personal */}
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
                {editingPersonal ? 'Editar Personal' : 'Agregar Personal'}
              </Text>

              <Input
                label="Nombre Completo *"
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
                placeholder="Ej: Juan Pérez López"
              />

              <Picker
                label="Cargo *"
                value={cargoId}
                onChange={setCargoId}
                placeholder="Selecciona un cargo"
                options={cargos.map(c => ({ label: c.nombre, value: c._id }))}
              />

              <Input
                label="Número de Empleado"
                value={numeroEmpleado}
                onChangeText={setNumeroEmpleado}
                placeholder="Ej: EMP001"
              />

              <Input
                label="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Ej: 6141234567"
                keyboardType="phone-pad"
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Ej: juan@empresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Observaciones"
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Notas adicionales"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
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
                  title={saving ? 'Guardando...' : 'Guardar'}
                  onPress={handleSave}
                  disabled={saving}
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
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  personalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  personalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  personalDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statusActive: {
    color: COLORS.success,
  },
  statusInactive: {
    color: COLORS.error,
  },
  actions: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default PersonalManagementScreen;
