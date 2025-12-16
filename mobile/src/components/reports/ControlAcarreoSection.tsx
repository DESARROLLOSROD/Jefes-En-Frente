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
import { ControlAcarreo } from '../../types';
import { COLORS } from '../../constants/config';

interface Props {
  items: ControlAcarreo[];
  onChange: (items: ControlAcarreo[]) => void;
}

const ControlAcarreoSection: React.FC<Props> = ({ items, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state
  const [material, setMaterial] = useState('');
  const [noViaje, setNoViaje] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [capaNo, setCapaNo] = useState('');
  const [elevacionAriza, setElevacionAriza] = useState('');
  const [capaOrigen, setCapaOrigen] = useState('');
  const [destino, setDestino] = useState('');

  const openAddModal = () => {
    clearForm();
    setEditingIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setMaterial(item.material);
    setNoViaje(item.noViaje.toString());
    setCapacidad(item.capacidad);
    setCapaNo(item.capaNo);
    setElevacionAriza(item.elevacionAriza);
    setCapaOrigen(item.capaOrigen);
    setDestino(item.destino);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const clearForm = () => {
    setMaterial('');
    setNoViaje('');
    setCapacidad('');
    setCapaNo('');
    setElevacionAriza('');
    setCapaOrigen('');
    setDestino('');
  };

  const handleSave = () => {
    if (!material || !noViaje || !capacidad) {
      Alert.alert('Error', 'Material, número de viaje y capacidad son requeridos');
      return;
    }

    const noViajeNum = parseInt(noViaje);
    const capacidadNum = parseFloat(capacidad);
    const volSuelto = (noViajeNum * capacidadNum).toFixed(2);

    const newItem: ControlAcarreo = {
      material,
      noViaje: noViajeNum,
      capacidad,
      volSuelto,
      capaNo,
      elevacionAriza,
      capaOrigen,
      destino,
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
      '¿Eliminar este registro de acarreo?',
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

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.volSuelto || '0'), 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Control de Acarreo ({items.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ AGREGAR ACARREO</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay registros. Presiona "AGREGAR ACARREO" para comenzar.</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>MATERIAL</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>VIAJES</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>CAP. (m³)</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>VOL. (m³)</Text>
            <Text style={[styles.tableHeaderText, { width: 60 }]}></Text>
          </View>

          {/* Filas de datos */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                {item.material}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.noViaje}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.capacidad}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center' }]}>
                {item.volSuelto}
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
            <Text style={[styles.tableFooterText, { flex: 4 }]}>TOTAL VOLUMEN:</Text>
            <Text style={[styles.tableFooterValue, { flex: 1, textAlign: 'center' }]}>
              {calcularTotal()} m³
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
                {editingIndex !== null ? 'Editar' : 'Agregar'} Acarreo
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Material *</Text>
                <TextInput
                  style={styles.input}
                  value={material}
                  onChangeText={setMaterial}
                  placeholder="Ej: Tepetate"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>No. Viaje *</Text>
                  <TextInput
                    style={styles.input}
                    value={noViaje}
                    onChangeText={setNoViaje}
                    placeholder="0"
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.label}>Capacidad (m³) *</Text>
                  <TextInput
                    style={styles.input}
                    value={capacidad}
                    onChangeText={setCapacidad}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Capa No.</Text>
                <TextInput
                  style={styles.input}
                  value={capaNo}
                  onChangeText={setCapaNo}
                  placeholder="Ej: Capa 1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Elevación Ariza</Text>
                <TextInput
                  style={styles.input}
                  value={elevacionAriza}
                  onChangeText={setElevacionAriza}
                  placeholder="Ej: 1500 msnm"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Capa Origen</Text>
                <TextInput
                  style={styles.input}
                  value={capaOrigen}
                  onChangeText={setCapaOrigen}
                  placeholder="Ej: Capa Base"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Destino</Text>
                <TextInput
                  style={styles.input}
                  value={destino}
                  onChangeText={setDestino}
                  placeholder="Ej: Zona de descarga"
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

export default ControlAcarreoSection;
