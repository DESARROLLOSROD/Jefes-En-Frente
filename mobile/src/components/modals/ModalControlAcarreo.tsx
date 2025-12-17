import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { ControlAcarreo } from '../../types';
import { Picker } from '@react-native-picker/picker';

interface ModalControlAcarreoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (acarreo: ControlAcarreo) => void;
  acarreoInicial?: ControlAcarreo | null;
  origenes: any[];
  destinos: any[];
  materiales: any[];
  capacidades: any[];
  proyectoId?: string;
}

const ModalControlAcarreo: React.FC<ModalControlAcarreoProps> = ({
  isOpen,
  onClose,
  onSave,
  acarreoInicial,
  origenes,
  destinos,
  materiales,
  capacidades,
  proyectoId,
}) => {
  const [formData, setFormData] = useState<ControlAcarreo>({
    noEconomico: '',
    noViaje: 0,
    capacidad: '',
    volSuelto: '',
    material: '',
    origen: '',
    destino: '',
    capaNo: '',
    elevacionAriza: '',
  });

  const [isManualMaterial, setIsManualMaterial] = useState(false);
  const [manualMaterial, setManualMaterial] = useState('');
  const [isManualOrigen, setIsManualOrigen] = useState(false);
  const [manualOrigen, setManualOrigen] = useState('');
  const [isManualDestino, setIsManualDestino] = useState(false);
  const [manualDestino, setManualDestino] = useState('');
  const [isManualCapacidad, setIsManualCapacidad] = useState(false);
  const [manualCapacidad, setManualCapacidad] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (acarreoInicial) {
      setFormData(acarreoInicial);
    } else {
      setFormData({
        noEconomico: '',
        noViaje: 0,
        capacidad: '',
        volSuelto: '',
        material: '',
        origen: '',
        destino: '',
        capaNo: '',
        elevacionAriza: '',
      });
    }
    setIsManualMaterial(false);
    setManualMaterial('');
    setIsManualOrigen(false);
    setManualOrigen('');
    setIsManualDestino(false);
    setManualDestino('');
    setIsManualCapacidad(false);
    setManualCapacidad('');
    setErrors({});
  }, [acarreoInicial, isOpen]);

  // Cálculo automático: viajes × capacidad = volumen
  useEffect(() => {
    const viaje = Number(formData.noViaje);
    const capacidad = Number(formData.capacidad);

    if (!isNaN(viaje) && !isNaN(capacidad) && viaje > 0 && capacidad > 0) {
      const volumenCalculado = (viaje * capacidad).toFixed(2);
      setFormData((prev) => ({ ...prev, volSuelto: volumenCalculado }));
    } else if (viaje === 0 || capacidad === 0) {
      setFormData((prev) => ({ ...prev, volSuelto: '0.00' }));
    }
  }, [formData.noViaje, formData.capacidad]);

  const handleChange = (campo: keyof ControlAcarreo, valor: string | number) => {
    const valorFinal = typeof valor === 'string' ? valor.toUpperCase() : valor;

    if (campo === 'material') {
      if (valorFinal === '___NUEVO___') {
        setIsManualMaterial(true);
        setFormData((prev) => ({ ...prev, material: '' }));
      } else {
        setIsManualMaterial(false);
        setManualMaterial('');
        setFormData((prev) => ({ ...prev, material: valorFinal as string }));
      }
    } else if (campo === 'origen') {
      if (valorFinal === '___NUEVO___') {
        setIsManualOrigen(true);
        setFormData((prev) => ({ ...prev, origen: '' }));
      } else {
        setIsManualOrigen(false);
        setManualOrigen('');
        setFormData((prev) => ({ ...prev, origen: valorFinal as string }));
      }
    } else if (campo === 'destino') {
      if (valorFinal === '___NUEVO___') {
        setIsManualDestino(true);
        setFormData((prev) => ({ ...prev, destino: '' }));
      } else {
        setIsManualDestino(false);
        setManualDestino('');
        setFormData((prev) => ({ ...prev, destino: valorFinal as string }));
      }
    } else if (campo === 'capacidad') {
      if (valorFinal === '___NUEVO___') {
        setIsManualCapacidad(true);
        setFormData((prev) => ({ ...prev, capacidad: '' }));
      } else {
        setIsManualCapacidad(false);
        setManualCapacidad('');
        setFormData((prev) => ({ ...prev, capacidad: valorFinal as string }));
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

  const handleManualOrigenChange = (text: string) => {
    const valor = text.toUpperCase();
    setManualOrigen(valor);
    setFormData((prev) => ({ ...prev, origen: valor }));
    if (errors.origen) {
      setErrors((prev) => ({ ...prev, origen: '' }));
    }
  };

  const handleManualDestinoChange = (text: string) => {
    const valor = text.toUpperCase();
    setManualDestino(valor);
    setFormData((prev) => ({ ...prev, destino: valor }));
    if (errors.destino) {
      setErrors((prev) => ({ ...prev, destino: '' }));
    }
  };

  const handleManualCapacidadChange = (text: string) => {
    setManualCapacidad(text);
    setFormData((prev) => ({ ...prev, capacidad: text }));
    if (errors.capacidad) {
      setErrors((prev) => ({ ...prev, capacidad: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.noViaje || formData.noViaje <= 0) {
      newErrors.noViaje = 'EL NÚMERO DE VIAJES DEBE SER MAYOR A 0';
    }
    if (!formData.capacidad || Number(formData.capacidad) <= 0) {
      newErrors.capacidad = 'LA CAPACIDAD DEBE SER MAYOR A 0';
    }
    if (!formData.material.trim()) {
      newErrors.material = 'EL MATERIAL ES REQUERIDO';
    }
    if (!formData.origen.trim()) {
      newErrors.origen = 'EL ORIGEN ES REQUERIDO';
    }
    if (!formData.destino.trim()) {
      newErrors.destino = 'EL DESTINO ES REQUERIDO';
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
            <Text style={styles.headerTitle}>AGREGAR CONTROL DE ACARREO</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Fila 1: Material y No. de Viajes */}
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
                <Text style={styles.label}>NO. DE VIAJES *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.noViaje.toString()}
                  onChangeText={(text) => handleChange('noViaje', Number(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.noViaje && <Text style={styles.errorText}>{errors.noViaje}</Text>}
              </View>
            </View>

            {/* Fila 2: Capacidad y Volumen */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>CAPACIDAD (M³) *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.capacidad}
                    onValueChange={(value) => handleChange('capacidad', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="SELECCIONE CAPACIDAD..." value="" />
                    {capacidades.map((cap) => (
                      <Picker.Item key={cap._id} label={cap.etiqueta || `${cap.valor} M³`} value={cap.valor} />
                    ))}
                    <Picker.Item label="+ OTRA CAPACIDAD..." value="___NUEVO___" />
                  </Picker>
                </View>
                {isManualCapacidad && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={manualCapacidad}
                    onChangeText={handleManualCapacidadChange}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                )}
                <Text style={styles.helperText}>* Si la capacidad no existe, se le preguntará si desea agregarla.</Text>
                {errors.capacidad && <Text style={styles.errorText}>{errors.capacidad}</Text>}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>VOL. SUELTO (M³) [CALCULADO]</Text>
                <TextInput
                  style={[styles.input, styles.inputReadonly]}
                  value={formData.volSuelto}
                  editable={false}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.helperText}>FÓRMULA: NO. VIAJES × CAPACIDAD = {formData.volSuelto || '0.00'} M³</Text>
              </View>
            </View>

            {/* Fila 3: Capa y Elevación */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>CAPA</Text>
                <TextInput
                  style={styles.input}
                  value={formData.capaNo}
                  onChangeText={(text) => handleChange('capaNo', text)}
                  placeholder="INGRESE LA CAPA..."
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.helperText}>* Ingrese la capa</Text>
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>ELEVACIÓN</Text>
                <TextInput
                  style={styles.input}
                  value={formData.elevacionAriza}
                  onChangeText={(text) => handleChange('elevacionAriza', text)}
                  placeholder="EJ: 100.50 M"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Fila 4: Origen y Destino */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>ORIGEN *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.origen}
                    onValueChange={(value) => handleChange('origen', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="SELECCIONE ORIGEN..." value="" />
                    {origenes.map((org) => (
                      <Picker.Item key={org._id} label={org.nombre} value={org.nombre} />
                    ))}
                    <Picker.Item label="+ AGREGAR NUEVO ORIGEN..." value="___NUEVO___" />
                  </Picker>
                </View>
                {isManualOrigen && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={manualOrigen}
                    onChangeText={handleManualOrigenChange}
                    placeholder="NOMBRE DEL NUEVO ORIGEN..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                    autoCapitalize="characters"
                  />
                )}
                <Text style={styles.helperText}>* Si el origen no existe, se le preguntará si desea agregarlo.</Text>
                {errors.origen && <Text style={styles.errorText}>{errors.origen}</Text>}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>DESTINO *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.destino}
                    onValueChange={(value) => handleChange('destino', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="SELECCIONE DESTINO..." value="" />
                    {destinos.map((dest) => (
                      <Picker.Item key={dest._id} label={dest.nombre} value={dest.nombre} />
                    ))}
                    <Picker.Item label="+ AGREGAR NUEVO DESTINO..." value="___NUEVO___" />
                  </Picker>
                </View>
                {isManualDestino && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    value={manualDestino}
                    onChangeText={handleManualDestinoChange}
                    placeholder="NOMBRE DEL NUEVO DESTINO..."
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                    autoCapitalize="characters"
                  />
                )}
                <Text style={styles.helperText}>* Si el destino no existe, se le preguntará si desea agregarlo.</Text>
                {errors.destino && <Text style={styles.errorText}>{errors.destino}</Text>}
              </View>
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
  inputReadonly: {
    backgroundColor: '#F3F4F6',
    color: '#2563eb',
    fontWeight: '700',
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

export default ModalControlAcarreo;
