import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Alert,
} from 'react-native';
import { PinMapa } from '../../types';
import { COLORS, PIN_COLORS } from '../../constants/config';

interface Props {
  mapaBase64?: string;
  pin?: { pinX: number; pinY: number };
  onPinChange: (x: number, y: number) => void;
  onPinRemove: () => void;
  readOnly?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const MAP_SIZE = screenWidth - 32; // 16px padding on each side

const MapPinSelector: React.FC<Props> = ({
  mapaBase64,
  pin,
  onPinChange,
  onPinRemove,
  readOnly = false,
}) => {
  const [imageSize, setImageSize] = useState({ width: MAP_SIZE, height: MAP_SIZE });

  const handleMapPress = (event: any) => {
    if (readOnly) return;

    const { locationX, locationY } = event.nativeEvent;

    // Convert to percentage (0-100)
    const pinX = (locationX / imageSize.width) * 100;
    const pinY = (locationY / imageSize.height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, pinX));
    const clampedY = Math.max(0, Math.min(100, pinY));

    onPinChange(clampedX, clampedY);
  };

  const handleRemovePin = () => {
    Alert.alert(
      'Eliminar Pin',
      '¿Deseas eliminar el pin del mapa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onPinRemove },
      ]
    );
  };

  if (!mapaBase64) {
    return (
      <View style={styles.noMapContainer}>
        <Text style={styles.noMapText}>
          🗺️ Este proyecto no tiene un mapa configurado
        </Text>
      </View>
    );
  }

  const imageUri = mapaBase64.startsWith('data:')
    ? mapaBase64
    : `data:image/png;base64,${mapaBase64}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Ubicación en el Mapa</Text>
        {pin && !readOnly && (
          <TouchableOpacity style={styles.removeButton} onPress={handleRemovePin}>
            <Text style={styles.removeButtonText}>Quitar Pin</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mapContainer}>
        <TouchableOpacity
          activeOpacity={readOnly ? 1 : 0.8}
          onPress={handleMapPress}
          disabled={readOnly}
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.mapImage, { width: imageSize.width, height: imageSize.height }]}
            resizeMode="contain"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              const aspectRatio = width / height;
              const newHeight = MAP_SIZE / aspectRatio;
              setImageSize({ width: MAP_SIZE, height: newHeight });
            }}
          />

          {pin && (
            <View
              style={[
                styles.pin,
                {
                  left: (pin.pinX / 100) * imageSize.width - 15,
                  top: (pin.pinY / 100) * imageSize.height - 30,
                },
              ]}
            >
              <View style={styles.pinHead} />
              <View style={styles.pinPoint} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!readOnly && (
        <Text style={styles.hint}>
          {pin
            ? 'Toca el mapa para mover el pin'
            : 'Toca el mapa para colocar un pin'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  removeButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  mapImage: {
    alignSelf: 'center',
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
  },
  pinHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pinPoint: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.danger,
    marginTop: -3,
  },
  hint: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noMapContainer: {
    backgroundColor: COLORS.light,
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  noMapText: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});

export default MapPinSelector;
