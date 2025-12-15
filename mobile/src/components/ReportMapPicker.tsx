import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { PinMapa } from '../types';
import ProjectMap from './ProjectMap';

interface ReportMapPickerProps {
  pins: PinMapa[];
  onPinsChange: (pins: PinMapa[]) => void;
}

const ReportMapPicker: React.FC<ReportMapPickerProps> = ({ pins, onPinsChange }) => {
  const { theme } = useTheme();
  const { selectedProject } = useAuth();
  const [showMapModal, setShowMapModal] = useState(false);

  if (!selectedProject || !selectedProject.mapa) {
    return null;
  }

  const handleAddPin = (pin: Omit<PinMapa, 'id'>) => {
    const newPin: PinMapa = {
      ...pin,
      id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    onPinsChange([...pins, newPin]);
  };

  const handleRemovePin = (pinId: string) => {
    onPinsChange(pins.filter((p) => p.id !== pinId));
  };

  return (
    <>
      {/* Botón para abrir el mapa */}
      <TouchableOpacity
        style={[styles.mapButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setShowMapModal(true)}
      >
        <View style={styles.mapButtonContent}>
          <Ionicons name="map" size={24} color={theme.primary} />
          <View style={styles.mapButtonText}>
            <Text style={[styles.mapButtonTitle, { color: theme.text }]}>
              Ubicación en el Mapa
            </Text>
            <Text style={[styles.mapButtonSubtitle, { color: theme.textSecondary }]}>
              {pins.length > 0
                ? `${pins.length} pin(es) colocado(s)`
                : 'Toca para agregar ubicaciones'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Lista de pins */}
      {pins.length > 0 && (
        <View style={[styles.pinsContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.pinsTitle, { color: theme.text }]}>Ubicaciones marcadas:</Text>
          {pins.map((pin, index) => (
            <View
              key={pin.id}
              style={[styles.pinItem, { borderBottomColor: theme.border }]}
            >
              <View style={styles.pinInfo}>
                <View style={[styles.pinDot, { backgroundColor: pin.color }]} />
                <Text style={[styles.pinLabel, { color: theme.text }]}>{pin.etiqueta}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemovePin(pin.id)}>
                <Ionicons name="close-circle" size={20} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Modal del mapa */}
      <Modal visible={showMapModal} animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Header del modal */}
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Ubicación del Trabajo
            </Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Instrucciones */}
          <View style={[styles.instructions, { backgroundColor: theme.info }]}>
            <Ionicons name="information-circle" size={20} color={theme.white} />
            <Text style={[styles.instructionsText, { color: theme.white }]}>
              Agrega uno o más pins para marcar las ubicaciones donde se realizó el trabajo
            </Text>
          </View>

          {/* Mapa */}
          <View style={styles.mapContainer}>
            <ProjectMap
              proyecto={selectedProject}
              pins={pins}
              onPinAdd={handleAddPin}
              onPinRemove={handleRemovePin}
              editable={true}
              showControls={true}
            />
          </View>

          {/* Botón Listo */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowMapModal(false)}
            >
              <Ionicons name="checkmark-circle" size={20} color={theme.white} />
              <Text style={[styles.doneButtonText, { color: theme.white }]}>Listo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  mapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  mapButtonText: {
    flex: 1,
  },
  mapButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mapButtonSubtitle: {
    fontSize: 14,
  },
  pinsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pinsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  pinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pinLabel: {
    fontSize: 14,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  mapContainer: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportMapPicker;
