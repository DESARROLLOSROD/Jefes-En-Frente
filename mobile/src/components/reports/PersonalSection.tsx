import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { PersonalReporte, Personal, Cargo } from '../../types';
import { COLORS, THEME } from '../../constants/config';
import Picker from '../common/Picker';
import ApiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  items: PersonalReporte[];
  onChange: (items: PersonalReporte[]) => void;
}

const PersonalSection: React.FC<Props> = ({ items, onChange }) => {
  const { selectedProject } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [personalId, setPersonalId] = useState('');
  const [cargoId, setCargoId] = useState('');
  const [actividadRealizada, setActividadRealizada] = useState('');
  const [horasTrabajadas, setHorasTrabajadas] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      const [personalData, cargosData] = await Promise.all([
        ApiService.getPersonal(undefined, selectedProject?._id),
        ApiService.getCargos()
      ]);
      setPersonal(personalData);
      setCargos(cargosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    clearForm();
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setPersonalId(item.personalId);
    setCargoId(item.cargoId || '');
    setActividadRealizada(item.actividadRealizada || '');
    setHorasTrabajadas(item.horasTrabajadas?.toString() || '');
    setObservaciones(item.observaciones || '');
    setEditingIndex(index);
    setModalVisible(true);
  };

  const clearForm = () => {
    setPersonalId('');
    setCargoId('');
    setActividadRealizada('');
    setHorasTrabajadas('');
    setObservaciones('');
  };

  const handleSave = () => {
    if (!personalId) {
      Alert.alert('Error', 'Debes seleccionar un personal');
      return;
    }

    // Verificar que no esté duplicado
    if (editingIndex === null) {
      const exists = items.some(item => item.personalId === personalId);
      if (exists) {
        Alert.alert('Error', 'Este personal ya está agregado al reporte');
        return;
      }
    }

    // Obtener el cargo del personal si no se seleccionó uno específico
    const selectedPersonal = personal.find(p => p._id === personalId);
    const finalCargoId = cargoId || selectedPersonal?.cargoId || '';

    const newItem: PersonalReporte = {
      personalId,
      cargoId: finalCargoId,
      actividadRealizada: actividadRealizada || undefined,
      horasTrabajadas: horasTrabajadas ? parseFloat(horasTrabajadas) : undefined,
      observaciones: observaciones || undefined,
    };

    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = newItem;
      onChange(newItems);
    } else {
      onChange([...items, newItem]);
    }

    setModalVisible(false);
    clearForm();
  };

  const handleDelete = (index: number) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar este registro de personal?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newItems = items.filter((_, i) => i !== index);
            onChange(newItems);
          },
        },
      ]
    );
  };

  const getPersonalNombre = (personalId: string) => {
    const p = personal.find(item => item._id === personalId);
    return p?.nombreCompleto || 'Desconocido';
  };

  const getCargoNombre = (cargoId?: string) => {
    if (!cargoId) return '';
    const cargo = cargos.find(c => c._id === cargoId);
    return cargo?.nombre || '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personal Asignado</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No hay personal asignado</Text>
      ) : (
        items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{getPersonalNombre(item.personalId)}</Text>
              {item.cargoId && (
                <Text style={styles.itemDetail}>Cargo: {getCargoNombre(item.cargoId)}</Text>
              )}
              {item.actividadRealizada && (
                <Text style={styles.itemDetail}>Actividad: {item.actividadRealizada}</Text>
              )}
              {item.horasTrabajadas !== undefined && (
                <Text style={styles.itemDetail}>Horas: {item.horasTrabajadas}</Text>
              )}
              {item.observaciones && (
                <Text style={styles.itemDetail}>Obs: {item.observaciones}</Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => openEditModal(index)}>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Modal para agregar/editar */}
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
                {editingIndex !== null ? 'Editar Personal' : 'Agregar Personal'}
              </Text>

              <Text style={styles.label}>Personal *</Text>
              <Picker
                selectedValue={personalId}
                onValueChange={setPersonalId}
                items={[
                  { label: 'Selecciona un personal', value: '' },
                  ...personal.map(p => ({
                    label: `${p.nombreCompleto} - ${p.cargo?.nombre || 'Sin cargo'}`,
                    value: p._id
                  }))
                ]}
              />

              <Text style={styles.label}>Cargo (opcional)</Text>
              <Picker
                selectedValue={cargoId}
                onValueChange={setCargoId}
                items={[
                  { label: 'Usar cargo del personal', value: '' },
                  ...cargos.map(c => ({ label: c.nombre, value: c._id }))
                ]}
              />

              <Text style={styles.label}>Actividad Realizada</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={actividadRealizada}
                onChangeText={setActividadRealizada}
                placeholder="Ej: Levantamiento topográfico"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Horas Trabajadas</Text>
              <TextInput
                style={styles.input}
                value={horasTrabajadas}
                onChangeText={setHorasTrabajadas}
                placeholder="Ej: 8"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder="Notas adicionales"
                multiline
                numberOfLines={2}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    clearForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
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
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    padding: 20,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemActions: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  editText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalSection;
