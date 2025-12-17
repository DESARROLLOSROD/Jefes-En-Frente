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
  vehiculos: any[];
  origenes: any[];
  destinos: any[];
  materiales: any[];
  proyectoId?: string;
}

const ModalControlAcarreo: React.FC<ModalControlAcarreoProps> = ({
  isOpen,
  onClose,
  onSave,
  acarreoInicial,
  vehiculos,
  origenes,
  destinos,
  materiales,
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);

  useEffect(() => {
    if (acarreoInicial) {
      setFormData(acarreoInicial);
      const vehiculo = vehiculos.find((v) => v.noEconomico === acarreoInicial.noEconomico);
      setSelectedVehiculo(vehiculo || null);
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
      setSelectedVehiculo(null);
    }
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
    setFormData((prev) => ({ ...prev, [campo]: valorFinal }));
    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: '' }));
    }
  };

  const handleVehiculoChange = (vehiculoId: string) => {
    if (!vehiculoId) {
      setSelectedVehiculo(null);
      setFormData((prev) => ({ ...prev, noEconomico: '', capacidad: '' }));
      return;
    }

    const vehiculo = vehiculos.find((v) => v._id === vehiculoId);
    if (vehiculo) {
      setSelectedVehiculo(vehiculo);
      const capacidad = vehiculo.capacidad || vehiculo.nombre.match(/(\d+)\s*M³/i)?.[1] || '';
      setFormData((prev) => ({
        ...prev,
        noEconomico: vehiculo.noEconomico,
        capacidad: capacidad,
      }));
      if (errors.noEconomico) {
        setErrors((prev) => ({ ...prev, noEconomico: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.noEconomico.trim()) {
      newErrors.noEconomico = 'EL NÚMERO ECONÓMICO ES REQUERIDO';
    }
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
            {/* Selección de Vehículo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>VEHÍCULO (CAMIÓN) *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedVehiculo?._id || ''}
                  onValueChange={handleVehiculoChange}
                  style={styles.picker}
                >
                  <Picker.Item label="SELECCIONE UN VEHÍCULO..." value="" />
                  {vehiculos
                    .filter((v) => v.tipo.toUpperCase().includes('CAMIÓN') && v.activo)
                    .map((vehiculo) => (
                      <Picker.Item
                        key={vehiculo._id}
                        label={`${vehiculo.noEconomico} - ${vehiculo.nombre}`}
                        value={vehiculo._id}
                      />
                    ))}
                </Picker>
              </View>
              {errors.noEconomico && <Text style={styles.errorText}>{errors.noEconomico}</Text>}
            </View>

            {/* Número de Viajes */}
            <View style={styles.formGroup}>
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

            {/* Capacidad */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>CAPACIDAD (M³) *</Text>
              <TextInput
                style={styles.input}
                value={formData.capacidad}
                onChangeText={(text) => handleChange('capacidad', text)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
              />
              {errors.capacidad && <Text style={styles.errorText}>{errors.capacidad}</Text>}
            </View>

            {/* Volumen (Calculado) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>VOLUMEN (M³) [CALCULADO]</Text>
              <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={formData.volSuelto}
                editable={false}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.helperText}>
                FÓRMULA: NO. VIAJES × CAPACIDAD = {formData.volSuelto || '0.00'} M³
              </Text>
            </View>

            {/* Material */}
            <View style={styles.formGroup}>
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
                </Picker>
              </View>
              {errors.material && <Text style={styles.errorText}>{errors.material}</Text>}
            </View>

            {/* Capa y Elevación (Lado a lado) */}
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

            {/* Origen */}
            <View style={styles.formGroup}>
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
                </Picker>
              </View>
              {errors.origen && <Text style={styles.errorText}>{errors.origen}</Text>}
            </View>

            {/* Destino */}
            <View style={styles.formGroup}>
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
                </Picker>
              </View>
              {errors.destino && <Text style={styles.errorText}>{errors.destino}</Text>}
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
    backgroundColor: '#4ADE80',
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
    color: '#4ADE80',
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
    backgroundColor: '#4ADE80',
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
