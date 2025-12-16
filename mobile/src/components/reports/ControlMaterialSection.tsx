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
import { ControlMaterial } from '../../types';
import { COLORS } from '../../constants/config';

interface Props {
  items: ControlMaterial[];
  onChange: (items: ControlMaterial[]) => void;
}

const ControlMaterialSection: React.FC<Props> = ({ items, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state
  const [material, setMaterial] = useState('');
  const [unidad, setUnidad] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [zona, setZona] = useState('');
  const [elevacion, setElevacion] = useState('');

  const openAddModal = () => {
    clearForm();
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setMaterial(item.material);
    setUnidad(item.unidad);
    setCantidad(item.cantidad);
    setZona(item.zona);
    setElevacion(item.elevacion);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const clearForm = () => {
    setMaterial('');
    setUnidad('');
    setCantidad('');
    setZona('');
    setElevacion('');
  };

  const handleSave = () => {
    if (!material || !unidad || !cantidad) {
      Alert.alert('Error', 'Material, unidad y cantidad son requeridos');
      return;
    }

    const newItem: ControlMaterial = {
      material,
      unidad,
      cantidad,
      zona,
      elevacion,
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
      '¿Eliminar este registro de material?',
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
        <Text style={styles.sectionTitle}>Control de Material ({items.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ AGREGAR MATERIAL</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay registros. Presiona "AGREGAR MATERIAL" para comenzar.</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>MATERIAL</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>CANTIDAD</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>UNIDAD</Text>
            <Text style={[styles.tableHeaderText, { width: 60 }]}></Text>
          </View>

          {/* Filas de datos */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                {item.material}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.cantidad}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.unidad}
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
            <Text style={[styles.tableFooterText, { flex: 4 }]}>TOTAL REGISTROS: {items.length}</Text>
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
                {editingIndex !== null ? 'Editar' : 'Agregar'} Material
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Material *</Text>
                <TextInput
                  style={styles.input}
                  value={material}
                  onChangeText={setMaterial}
                  placeholder="Ej: Cemento"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Unidad *</Text>
                  <TextInput
                    style={styles.input}
                    value={unidad}
                    onChangeText={setUnidad}
                    placeholder="Ej: kg, m³, ton"
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.label}>Cantidad *</Text>
                  <TextInput
                    style={styles.input}
                    value={cantidad}
                    onChangeText={setCantidad}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Zona</Text>
                <TextInput
                  style={styles.input}
                  value={zona}
                  onChangeText={setZona}
                  placeholder="Ej: Zona A"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Elevación</Text>
                <TextInput
                  style={styles.input}
                  value={elevacion}
                  onChangeText={setElevacion}
                  placeholder="Ej: 1500 msnm"
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
    backgroundColor: '#4CAF50',
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

export default ControlMaterialSection;
