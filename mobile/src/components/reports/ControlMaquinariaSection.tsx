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
    if (!nombre || !tipo || !numeroEconomico || !operador || !actividad || !horometroInicial || !horometroFinal) {
      Alert.alert('Error', 'Todos los campos son requeridos');
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

  const calcularTotalHoras = () => {
    return items.reduce((sum, item) => sum + item.horasOperacion, 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Control de Maquinaria ({items.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ AGREGAR MAQUINARIA</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay registros. Presiona "AGREGAR MAQUINARIA" para comenzar.</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>MÁQUINA</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>NO. ECON.</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>OPERADOR</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>HRS</Text>
            <Text style={[styles.tableHeaderText, { width: 60 }]}></Text>
          </View>

          {/* Filas de datos */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                {item.nombre}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.numeroEconomico}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
                {item.operador}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.horasOperacion.toFixed(1)}
              </Text>
              <View style={[styles.tableActions, { width: 60 }]}>
                <TouchableOpacity onPress={() => openEditModal(index)}>
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Fila de totales */}
          <View style={styles.tableFooter}>
            <Text style={[styles.tableFooterText, { flex: 4 }]}>TOTAL HORAS:</Text>
            <Text style={[styles.tableFooterValue, { flex: 1, textAlign: 'center' }]}>
              {calcularTotalHoras()} hrs
            </Text>
            <View style={{ width: 60 }} />
          </View>
        </View>
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
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Excavadora CAT 320"
                />
              </View>

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
                <Text style={styles.label}>Número Económico *</Text>
                <TextInput
                  style={styles.input}
                  value={numeroEconomico}
                  onChangeText={setNumeroEconomico}
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
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  addButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderStyle: 'dashed',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.secondary,
    fontSize: 14,
  },
  tableContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gray,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 13,
    color: COLORS.dark,
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
    padding: 4,
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 0.5,
  },
  tableFooterValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
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
