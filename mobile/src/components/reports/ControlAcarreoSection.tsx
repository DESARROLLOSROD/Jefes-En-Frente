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
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>CONTROL DE ACARREOS</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ AGREGAR ACARREO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>MATERIAL</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>NO. VIAJES</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>CAPACIDAD</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>VOL. SUELTO</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2, textAlign: 'center' }]}>CAPA</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>ELEVACIÓN</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>ORIGEN</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>DESTINO</Text>
            <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>ACCIONES</Text>
          </View>

          {/* Filas de datos */}
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                {item.material}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.noViaje}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.capacidad} M³
              </Text>
              <Text style={[styles.tableCellText, styles.blueText, { flex: 1.5, textAlign: 'center' }]}>
                {item.volSuelto} M³
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.2, textAlign: 'center' }]}>
                {item.capaNo || '-'}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.elevacionAriza || '-'}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.capaOrigen || '-'}
              </Text>
              <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>
                {item.destino || '-'}
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

          {/* Fila de totales */}
          <View style={styles.tableFooter}>
            <Text style={[styles.tableFooterText, { flex: 5 }]}>TOTAL VOLUMEN:</Text>
            <Text style={[styles.tableFooterValue, { flex: 1.5, textAlign: 'center' }]}>
              {calcularTotal()} M³
            </Text>
            <View style={{ flex: 6.7 }} />
          </View>
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
                <Text style={styles.label}>Elevación</Text>
                <TextInput
                  style={styles.input}
                  value={elevacionAriza}
                  onChangeText={setElevacionAriza}
                  placeholder="Ej: 1500 msnm"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Origen</Text>
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
    backgroundColor: COLORS.primary,
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
  blueText: {
    color: COLORS.primary,
    fontWeight: '600',
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
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableFooterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.dark,
  },
  tableFooterValue: {
    fontSize: 12,
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
