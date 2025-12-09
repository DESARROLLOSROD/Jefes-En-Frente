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
  const [tipo, setTipo] = useState('');
  const [modelo, setModelo] = useState('');
  const [noEconomico, setNoEconomico] = useState('');
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
    setTipo(item.tipo);
    setModelo(item.modelo);
    setNoEconomico(item.noEconomico);
    setOperador(item.operador);
    setActividad(item.actividad);
    setHorometroInicial(item.horometroInicial?.toString() || '');
    setHorometroFinal(item.horometroFinal?.toString() || '');
    setEditingIndex(index);
    setModalVisible(true);
  };

  const clearForm = () => {
    setTipo('');
    setModelo('');
    setNoEconomico('');
    setOperador('');
    setActividad('');
    setHorometroInicial('');
    setHorometroFinal('');
  };

  const handleSave = () => {
    if (!tipo || !noEconomico || !operador || !actividad) {
      Alert.alert('Error', 'Tipo, No. Económico, operador y actividad son requeridos');
      return;
    }

    const horometroInicialNum = horometroInicial ? parseFloat(horometroInicial) : undefined;
    const horometroFinalNum = horometroFinal ? parseFloat(horometroFinal) : undefined;

    let horasOperacion: number | undefined = undefined;
    if (horometroInicialNum !== undefined && horometroFinalNum !== undefined) {
      horasOperacion = horometroFinalNum - horometroInicialNum;
    }

    const newItem: ControlMaquinaria = {
      tipo,
      modelo,
      noEconomico,
      operador,
      actividad,
      horometroInicial: horometroInicialNum,
      horometroFinal: horometroFinalNum,
      horasOperacion,
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
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>🚜 Control de Maquinaria</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No hay registros de maquinaria</Text>
      ) : (
        items.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.tipo} - {item.noEconomico}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal(index)}>
                  <Text style={styles.editButton}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            {item.modelo && (
              <Text style={styles.cardDetail}>Modelo: {item.modelo}</Text>
            )}
            <Text style={styles.cardDetail}>Operador: {item.operador}</Text>
            <Text style={styles.cardDetail}>Actividad: {item.actividad}</Text>
            {item.horasOperacion !== undefined && (
              <Text style={styles.cardDetail}>
                Horas de Operación: {item.horasOperacion.toFixed(2)} hrs
              </Text>
            )}
          </View>
        ))
      )}

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
                <Text style={styles.label}>Tipo *</Text>
                <TextInput
                  style={styles.input}
                  value={tipo}
                  onChangeText={setTipo}
                  placeholder="Ej: Excavadora"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Modelo</Text>
                <TextInput
                  style={styles.input}
                  value={modelo}
                  onChangeText={setModelo}
                  placeholder="Ej: CAT 320"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>No. Económico *</Text>
                <TextInput
                  style={styles.input}
                  value={noEconomico}
                  onChangeText={setNoEconomico}
                  placeholder="Ej: 001"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Operador *</Text>
                <TextInput
                  style={styles.input}
                  value={operador}
                  onChangeText={setOperador}
                  placeholder="Nombre del operador"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Actividad *</Text>
                <TextInput
                  style={styles.input}
                  value={actividad}
                  onChangeText={setActividad}
                  placeholder="Descripción de la actividad"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Horómetro Inicial</Text>
                  <TextInput
                    style={styles.input}
                    value={horometroInicial}
                    onChangeText={setHorometroInicial}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.label}>Horómetro Final</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.secondary,
    fontStyle: 'italic',
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    fontSize: 18,
  },
  deleteButton: {
    fontSize: 18,
  },
  cardDetail: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 2,
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
    backgroundColor: COLORS.light,
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
    color: COLORS.primary,
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
