import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { ControlMaquinaria } from '../../types';
import { Picker } from '@react-native-picker/picker';

interface ModalControlMaquinariaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (maquinaria: ControlMaquinaria) => void;
  maquinariaInicial?: ControlMaquinaria | null;
  vehiculos: any[];
}

const ModalControlMaquinaria: React.FC<ModalControlMaquinariaProps> = ({
  isOpen,
  onClose,
  onSave,
  maquinariaInicial,
  vehiculos,
}) => {
  const [formData, setFormData] = useState<ControlMaquinaria>({
    vehiculoId: '',
    nombre: '',
    tipo: '',
    numeroEconomico: '',
    horometroInicial: 0,
    horometroFinal: 0,
    horasOperacion: 0,
    operador: '',
    actividad: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);

  useEffect(() => {
    if (maquinariaInicial) {
      setFormData(maquinariaInicial);
      const vehiculo = vehiculos.find((v) => v._id === maquinariaInicial.vehiculoId);
      setSelectedVehiculo(vehiculo || null);
    } else {
      setFormData({
        vehiculoId: '',
        nombre: '',
        tipo: '',
        numeroEconomico: '',
        horometroInicial: 0,
        horometroFinal: 0,
        horasOperacion: 0,
        operador: '',
        actividad: '',
      });
      setSelectedVehiculo(null);
    }
    setErrors({});
  }, [maquinariaInicial, isOpen]);

  // Cálculo automático: horómetro final - horómetro inicial = horas de operación
  useEffect(() => {
    const inicial = Number(formData.horometroInicial);
    const final = Number(formData.horometroFinal);

    if (!isNaN(inicial) && !isNaN(final) && final >= inicial) {
      const horas = final - inicial;
      setFormData((prev) => ({ ...prev, horasOperacion: horas }));
    }
  }, [formData.horometroInicial, formData.horometroFinal]);

  const handleChange = (campo: keyof ControlMaquinaria, valor: string | number) => {
    const valorFinal = typeof valor === 'string' ? valor.toUpperCase() : valor;
    setFormData((prev) => ({ ...prev, [campo]: valorFinal }));
    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  const handleVehiculoChange = (vehiculoId: string) => {
    if (!vehiculoId) {
      setSelectedVehiculo(null);
      setFormData((prev) => ({
        ...prev,
        vehiculoId: '',
        nombre: '',
        tipo: '',
        numeroEconomico: '',
        horometroInicial: 0,
        horometroFinal: 0,
      }));
      return;
    }

    const vehiculo = vehiculos.find((v) => v._id === vehiculoId);
    if (vehiculo) {
      setSelectedVehiculo(vehiculo);
      setFormData((prev) => ({
        ...prev,
        vehiculoId: vehiculo._id,
        nombre: vehiculo.nombre,
        tipo: vehiculo.tipo,
        numeroEconomico: vehiculo.noEconomico,
        horometroInicial: vehiculo.horometroInicial || 0,
        horometroFinal: vehiculo.horometroFinal || vehiculo.horometroInicial || 0,
      }));
      if (errors.vehiculoId) {
        setErrors((prev) => ({ ...prev, vehiculoId: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.vehiculoId) {
      newErrors.vehiculoId = 'EL VEHÍCULO ES REQUERIDO';
    }
    if (formData.horometroFinal < formData.horometroInicial) {
      newErrors.horometroFinal = 'EL HORÓMETRO FINAL DEBE SER MAYOR AL INICIAL';
    }
    if (!formData.operador.trim()) {
      newErrors.operador = 'EL OPERADOR ES REQUERIDO';
    }
    if (!formData.actividad.trim()) {
      newErrors.actividad = 'LA ACTIVIDAD ES REQUERIDA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const vehiculosMaquinaria = vehiculos.filter(
    (v) =>
      (v.tipo.toUpperCase().includes('MAQUINARIA') ||
        v.tipo.toUpperCase().includes('EXCAVADORA') ||
        v.tipo.toUpperCase().includes('CARGADOR') ||
        v.tipo.toUpperCase().includes('GRÚA') ||
        v.tipo.toUpperCase().includes('RETROEXCAVADORA') ||
        v.tipo.toUpperCase().includes('MOTONIVELADORA')) &&
      v.activo
  );

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AGREGAR CONTROL DE MAQUINARIA</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Selección de Vehículo/Maquinaria */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>VEHÍCULO/MAQUINARIA *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedVehiculo?._id || ''}
                  onValueChange={handleVehiculoChange}
                  style={styles.picker}
                >
                  <Picker.Item label="SELECCIONE MAQUINARIA..." value="" />
                  {vehiculosMaquinaria.map((vehiculo) => (
                    <Picker.Item
                      key={vehiculo._id}
                      label={`${vehiculo.noEconomico} - ${vehiculo.nombre} (${vehiculo.tipo})`}
                      value={vehiculo._id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.vehiculoId && <Text style={styles.errorText}>{errors.vehiculoId}</Text>}
            </View>

            {selectedVehiculo && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>NOMBRE:</Text> {selectedVehiculo.nombre}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>TIPO:</Text> {selectedVehiculo.tipo}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>NO. ECONÓMICO:</Text> {selectedVehiculo.noEconomico}
                </Text>
              </View>
            )}

            {/* Horómetro Inicial */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>HORÓMETRO INICIAL</Text>
              <TextInput
                style={styles.input}
                value={formData.horometroInicial.toString()}
                onChangeText={(text) => handleChange('horometroInicial', Number(text))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Horómetro Final */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>HORÓMETRO FINAL *</Text>
              <TextInput
                style={styles.input}
                value={formData.horometroFinal.toString()}
                onChangeText={(text) => handleChange('horometroFinal', Number(text))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              {errors.horometroFinal && <Text style={styles.errorText}>{errors.horometroFinal}</Text>}
            </View>

            {/* Horas de Operación (Calculado) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>HORAS DE OPERACIÓN [CALCULADO]</Text>
              <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={formData.horasOperacion.toString()}
                editable={false}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helperText}>
                FÓRMULA: HORÓMETRO FINAL - HORÓMETRO INICIAL = {formData.horasOperacion} HRS
              </Text>
            </View>

            {/* Operador */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>OPERADOR *</Text>
              <TextInput
                style={styles.input}
                value={formData.operador}
                onChangeText={(text) => handleChange('operador', text)}
                placeholder="NOMBRE DEL OPERADOR"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
              {errors.operador && <Text style={styles.errorText}>{errors.operador}</Text>}
            </View>

            {/* Actividad */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ACTIVIDAD *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.actividad}
                onChangeText={(text) => handleChange('actividad', text)}
                placeholder="DESCRIPCIÓN DE LA ACTIVIDAD..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="characters"
              />
              {errors.actividad && <Text style={styles.errorText}>{errors.actividad}</Text>}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>GUARDAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#A78BFA',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  inputReadonly: {
    backgroundColor: '#F3F4F6',
    color: '#A78BFA',
    fontWeight: '700',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
  },
  picker: {
    height: 50,
  },
  infoBox: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#A78BFA',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: '700',
    color: '#6D28D9',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  saveButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default ModalControlMaquinaria;
