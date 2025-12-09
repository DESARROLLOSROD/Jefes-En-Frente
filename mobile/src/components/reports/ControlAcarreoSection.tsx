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
  const [viajes, setViajes] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [capa, setCapa] = useState('');
  const [elevacion, setElevacion] = useState('');
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
    setViajes(item.viajes.toString());
    setCapacidad(item.capacidad.toString());
    setCapa(item.capa);
    setElevacion(item.elevacion);
    setCapaOrigen(item.capaOrigen);
    setDestino(item.destino);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const clearForm = () => {
    setMaterial('');
    setViajes('');
    setCapacidad('');
    setCapa('');
    setElevacion('');
    setCapaOrigen('');
    setDestino('');
  };

  const handleSave = () => {
    if (!material || !viajes || !capacidad) {
      Alert.alert('Error', 'Material, viajes y capacidad son requeridos');
      return;
    }

    const viajesNum = parseInt(viajes);
    const capacidadNum = parseFloat(capacidad);

    const newItem: ControlAcarreo = {
      material,
      viajes: viajesNum,
      capacidad: capacidadNum,
      volumenSuelto: viajesNum * capacidadNum,
      capa,
      elevacion,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>🚛 Control de Acarreo</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No hay registros de acarreo</Text>
      ) : (
        items.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.material}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal(index)}>
                  <Text style={styles.editButton}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardDetail}>
              Viajes: {item.viajes} | Capacidad: {item.capacidad} m³
            </Text>
            <Text style={styles.cardDetail}>
              Volumen: {item.volumenSuelto.toFixed(2)} m³
            </Text>
            {item.destino && (
              <Text style={styles.cardDetail}>Destino: {item.destino}</Text>
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
                  <Text style={styles.label}>Viajes *</Text>
                  <TextInput
                    style={styles.input}
                    value={viajes}
                    onChangeText={setViajes}
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
                <Text style={styles.label}>Capa</Text>
                <TextInput
                  style={styles.input}
                  value={capa}
                  onChangeText={setCapa}
                  placeholder="Ej: Capa 1"
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
