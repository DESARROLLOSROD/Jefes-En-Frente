import React, { useState } from 'react';
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
import { ControlMaquinaria } from '../../types';
import { COLORS } from '../../constants/config';

interface Props {
  items: ControlMaquinaria[];
  onChange: (items: ControlMaquinaria[]) => void;
}

const ControlMaquinariaSection: React.FC<Props> = ({ items, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [numeroEconomico, setNumeroEconomico] = useState('');
  const [operador, setOperador] = useState('');
  const [actividad, setActividad] = useState('');
  const [horometroInicial, setHorometroInicial] = useState('');
  const [horometroFinal, setHorometroFinal] = useState('');

  const openAddModal = () => {
    clearForm();
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setNombre(item.nombre);
    setTipo(item.tipo);
    setNumeroEconomico(item.numeroEconomico);
    setOperador(item.operador);
    setActividad(item.actividad);
    setHorometroInicial(item.horometroInicial.toString());
    setHorometroFinal(item.horometroFinal.toString());
    setEditingIndex(index);
    setModalVisible(true);
  };

  const clearForm = () => {
    setNombre('');
    setTipo('');
    setNumeroEconomico('');
    setOperador('');
    setActividad('');
    setHorometroInicial('');
    setHorometroFinal('');
  };

  const handleSave = () => {
    if (!nombre || !numeroEconomico || !horometroInicial || !horometroFinal) {
      Alert.alert('Error', 'Vehículo, horómetro inicial y final son requeridos');
      return;
    }

    const horometroInicialNum = parseFloat(horometroInicial);
    const horometroFinalNum = parseFloat(horometroFinal);
    const horasOperacion = horometroFinalNum - horometroInicialNum;

    const newItem: ControlMaquinaria = {
      nombre,
      tipo,
      numeroEconomico,
      horometroInicial: horometroInicialNum,
      horometroFinal: horometroFinalNum,
      horasOperacion,
      operador,
      actividad,
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
      '¿Eliminar este registro de maquinaria?',
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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>CONTROL DE MAQUINARIA</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ AGREGAR MAQUINARIA</Text>
          </TouchableOpacity>
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.machineCard}>
            <View style={styles.machineHeader}>
              <Text style={styles.machineTitle}>MAQUINA {index + 1}</Text>
              <View style={styles.machineActions}>
                <TouchableOpacity onPress={() => openEditModal(index)} style={styles.editButton}>
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.machineBody}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>VEHÍCULO</Text>
                <Text style={styles.fieldValue}>{item.nombre || item.numeroEconomico}</Text>
              </View>

              <View style={styles.fieldRow}>
                <View style={[styles.field, styles.flexField]}>
                  <Text style={styles.fieldLabel}>HORÓMETRO INICIAL</Text>
                  <Text style={styles.fieldValue}>{item.horometroInicial}</Text>
                </View>

                <View style={[styles.field, styles.flexField]}>
                  <Text style={styles.fieldLabel}>HORÓMETRO FINAL</Text>
                  <Text style={styles.fieldValue}>{item.horometroFinal}</Text>
                </View>
              </View>

              <View style={styles.fieldRow}>
                <View style={[styles.field, styles.flexField]}>
                  <Text style={styles.fieldLabel}>HORAS DE OPERACIÓN</Text>
                  <Text style={styles.fieldValue}>{item.horasOperacion.toFixed(2)} hrs</Text>
                </View>

                <View style={[styles.field, styles.flexField]}>
                  <Text style={styles.fieldLabel}>OPERADOR</Text>
                  <Text style={styles.fieldValue}>{item.operador || '-'}</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>ACTIVIDAD</Text>
                <Text style={styles.fieldValue}>{item.actividad || '-'}</Text>
              </View>
            </View>
          </View>
        ))}
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
                {editingIndex !== null ? 'Editar' : 'Agregar'} Maquinaria
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehículo *</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Excavadora CAT 320"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número Económico</Text>
                <TextInput
                  style={styles.input}
                  value={numeroEconomico}
                  onChangeText={setNumeroEconomico}
                  placeholder="Ej: 001"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Horómetro Inicial *</Text>
                  <TextInput
                    style={styles.input}
                    value={horometroInicial}
                    onChangeText={setHorometroInicial}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.label}>Horómetro Final *</Text>
                  <TextInput
                    style={styles.input}
                    value={horometroFinal}
                    onChangeText={setHorometroFinal}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {horometroInicial && horometroFinal && (
                <View style={styles.calculatedField}>
                  <Text style={styles.calculatedLabel}>Horas de Operación:</Text>
                  <Text style={styles.calculatedValue}>
                    {(parseFloat(horometroFinal) - parseFloat(horometroInicial)).toFixed(2)} hrs
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Operador</Text>
                <TextInput
                  style={styles.input}
                  value={operador}
                  onChangeText={setOperador}
                  placeholder="Nombre del operador"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Actividad</Text>
                <TextInput
                  style={styles.input}
                  value={actividad}
                  onChangeText={setActividad}
                  placeholder="Descripción de la actividad"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                  <Text style={styles.buttonText}>Guardar</Text>
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#e9d5ff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#581c87',
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  machineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  machineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
  },
  machineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    marginRight: 4,
  },
  editText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  machineBody: {
    padding: 12,
  },
  field: {
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 13,
    color: COLORS.dark,
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 20,
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
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
  calculatedField: {
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculatedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  calculatedValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  buttonSecondaryText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ControlMaquinariaSection;
