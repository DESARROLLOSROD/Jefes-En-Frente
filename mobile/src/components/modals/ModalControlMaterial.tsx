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
import { ControlMaterial } from '../../types';
import { Picker } from '@react-native-picker/picker';

const UNIDADES_MEDIDA = ['M³', 'M²', 'ML', 'KG', 'TON', 'PZA', 'LT', 'OTRO'];

interface ModalControlMaterialProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: ControlMaterial) => void;
  materialInicial?: ControlMaterial | null;
  materiales: any[];
}

const ModalControlMaterial: React.FC<ModalControlMaterialProps> = ({
  isOpen,
  onClose,
  onSave,
  materialInicial,
  materiales,
}) => {
  const [formData, setFormData] = useState<ControlMaterial>({
    material: '',
    unidad: '',
    cantidad: '',
    zona: '',
    elevacion: '',
  });

  const [isManualMaterial, setIsManualMaterial] = useState(false);
  const [manualMaterial, setManualMaterial] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (materialInicial) {
      setFormData(materialInicial);
    } else {
      setFormData({
        material: '',
        unidad: '',
        cantidad: '',
        zona: '',
        elevacion: '',
      });
    }
    setIsManualMaterial(false);
    setManualMaterial('');
    setErrors({});
  }, [materialInicial, isOpen]);

  const handleChange = (campo: keyof ControlMaterial, valor: string) => {
    const valorFinal = valor.toUpperCase();

    if (campo === 'material') {
      if (valorFinal === '___NUEVO___') {
        setIsManualMaterial(true);
        setFormData((prev) => ({ ...prev, material: '' }));
      } else {
        setIsManualMaterial(false);
        setManualMaterial('');
        setFormData((prev) => ({ ...prev, material: valorFinal }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [campo]: valorFinal }));
    }

    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  const handleManualMaterialChange = (text: string) => {
    const valor = text.toUpperCase();
    setManualMaterial(valor);
    setFormData((prev) => ({ ...prev, material: valor }));
    if (errors.material) {
      setErrors((prev) => ({ ...prev, material: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.material.trim()) {
      newErrors.material = 'EL MATERIAL ES REQUERIDO';
    }
    if (!formData.unidad.trim()) {
      newErrors.unidad = 'LA UNIDAD ES REQUERIDA';
    }
    if (!formData.cantidad.trim() || Number(formData.cantidad) <= 0) {
      newErrors.cantidad = 'LA CANTIDAD DEBE SER MAYOR A 0';
    }
    if (!formData.zona.trim()) {
      newErrors.zona = 'LA ZONA ES REQUERIDA';
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

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AGREGAR CONTROL DE MATERIAL</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Fila 1: Material y Unidad */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>MATERIAL *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.material}
                    onValueChange={(value) => handleChange('material', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="SELECCIONE MATERIAL..." value="" />
                    {materiales.map((mat) => (
                      <Picker.Item key={mat._id} label={mat.nombre} value={mat.nombre} />
                    ))}
                    <Picker.Item label="+ AGREGAR NUEVO MATERIAL..." value="___NUEVO___" />
                  </Picker>
                </View>
                {isManualMaterial && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={manualMaterial}
                    onChangeText={handleManualMaterialChange}
                    placeholder="NOMBRE DEL NUEVO MATERIAL..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                    autoCapitalize="characters"
                  />
                )}
                <Text style={styles.helperText}>* Si el material no existe, se le preguntará si desea agregarlo.</Text>
                {errors.material && <Text style={styles.errorText}>{errors.material}</Text>}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>UNIDAD *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.unidad}
                    onValueChange={(value) => handleChange('unidad', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="SELECCIONE UNIDAD..." value="" />
                    {UNIDADES_MEDIDA.map((unidad) => (
                      <Picker.Item key={unidad} label={unidad} value={unidad} />
                    ))}
                  </Picker>
                </View>
                {errors.unidad && <Text style={styles.errorText}>{errors.unidad}</Text>}
              </View>
            </View>

            {/* Fila 2: Cantidad y Zona */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>CANTIDAD *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cantidad}
                  onChangeText={(text) => handleChange('cantidad', text)}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.cantidad && <Text style={styles.errorText}>{errors.cantidad}</Text>}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>ZONA *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zona}
                  onChangeText={(text) => handleChange('zona', text)}
                  placeholder="EJ: ZONA A, TRAMO 1..."
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
                <Text style={styles.helperText}>* Ingrese la zona</Text>
                {errors.zona && <Text style={styles.errorText}>{errors.zona}</Text>}
              </View>
            </View>

            {/* Fila 3: Elevación */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>ELEVACIÓN</Text>
                <TextInput
                  style={styles.input}
                  value={formData.elevacion}
                  onChangeText={(text) => handleChange('elevacion', text)}
                  placeholder="EJ: 100.50 M"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfWidth} />
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
    backgroundColor: '#2563eb',
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
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
    backgroundColor: '#2563eb',
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

export default ModalControlMaterial;
