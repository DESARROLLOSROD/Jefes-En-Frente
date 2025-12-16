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
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>CONTROL DE MATERIAL</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ AGREGAR MATERIAL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>MATERIAL</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>UNIDAD</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>CANTIDAD</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>ZONA</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>ELEVACIÓN</Text>
            <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>ACCIONES</Text>
          </View>

          {/* Filas de datos */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                {item.material}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.unidad}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.cantidad}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.zona || '-'}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.elevacion || '-'}
              </Text>
              <View style={[styles.tableActions, { width: 80 }]}>
                <TouchableOpacity onPress={() => openEditModal(index)}>
                  <Text style={styles.actionLink}>EDITAR</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Text style={styles.actionLinkDelete}>ELIMINAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
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
    color: COLORS.dark,
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  tableCellText: {
    fontSize: 11,
    color: COLORS.dark,
  },
  tableActions: {
    flexDirection: 'column',
    gap: 4,
  },
  actionLink: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionLinkDelete: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
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
