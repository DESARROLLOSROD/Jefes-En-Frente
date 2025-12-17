import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

interface MapPinSelectorProps {
  mapaImagen: string; // Base64 o URL de la imagen
  pinX?: number; // Porcentaje 0-100
  pinY?: number; // Porcentaje 0-100
  onPinChange: (x: number, y: number) => void;
  onPinRemove: () => void;
  readOnly?: boolean;
}

const MapPinSelector: React.FC<MapPinSelectorProps> = ({
  mapaImagen,
  pinX,
  pinY,
  onPinChange,
  onPinRemove,
  readOnly = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = (event: any) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
    setImageSize({ width: imgWidth, height: imgHeight });
  };

  const handlePress = (event: any) => {
    if (readOnly) return;

    const { locationX, locationY } = event.nativeEvent;
    const containerWidth = width - 32;
    const aspectRatio = imageSize.width / imageSize.height;
    const containerHeight = containerWidth / aspectRatio;

    // Calcular posición en porcentaje
    const x = (locationX / (containerWidth * zoom)) * 100;
    const y = (locationY / (containerHeight * zoom)) * 100;

    onPinChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
  };

  const handleZoomIn = () => {
    setZoom(Math.min(3, zoom + 0.5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(1, zoom - 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const containerWidth = width - 32;
  const aspectRatio = imageSize.width / imageSize.height || 1;
  const containerHeight = containerWidth / aspectRatio;

  return (
    <View style={styles.container}>
      {/* Controles de zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
        <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
        {zoom > 1 && (
          <TouchableOpacity onPress={resetZoom} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>⟲</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contenedor del mapa con scroll para zoom */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableOpacity
            activeOpacity={readOnly ? 1 : 0.9}
            onPress={handlePress}
            style={[
              styles.imageContainer,
              {
                width: containerWidth * zoom,
                height: containerHeight * zoom,
              },
            ]}
          >
            <Image
              source={{ uri: mapaImagen }}
              style={styles.image}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />

            {/* Pin */}
            {pinX !== undefined && pinY !== undefined && (
              <View
                style={[
                  styles.pin,
                  {
                    left: `${pinX}%`,
                    top: `${pinY}%`,
                  },
                ]}
              >
                <View style={styles.pinIcon}>
                  <View style={styles.pinCircle} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>

      {/* Información y controles */}
      <View style={styles.footer}>
        <View style={styles.infoContainer}>
          {pinX !== undefined && pinY !== undefined ? (
            <Text style={styles.infoText}>
              PIN COLOCADO: X={pinX.toFixed(1)}%, Y={pinY.toFixed(1)}%
            </Text>
          ) : (
            <Text style={styles.infoText}>TOCA EL MAPA PARA COLOCAR EL PIN</Text>
          )}
          {zoom > 1 && (
            <Text style={styles.zoomInfoText}>ZOOM: {zoom.toFixed(1)}x | DESPLAZA PARA MOVER</Text>
          )}
        </View>
        {!readOnly && pinX !== undefined && pinY !== undefined && (
          <TouchableOpacity onPress={onPinRemove} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>ELIMINAR PIN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  zoomButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  zoomButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  zoomText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginVertical: 4,
  },
  resetButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  imageContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pin: {
    position: 'absolute',
    width: 32,
    height: 42,
    marginLeft: -16,
    marginTop: -42,
  },
  pinIcon: {
    width: 32,
    height: 42,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    top: 8,
    left: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  footer: {
    marginTop: 12,
    flexDirection: 'column',
    gap: 8,
  },
  infoContainer: {
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  zoomInfoText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default MapPinSelector;
