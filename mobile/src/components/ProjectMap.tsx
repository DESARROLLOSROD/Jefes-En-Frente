import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Proyecto, PinMapa } from '../types';

const { width, height } = Dimensions.get('window');

interface ProjectMapProps {
  proyecto: Proyecto;
  pins?: PinMapa[];
  onPinAdd?: (pin: Omit<PinMapa, 'id'>) => void;
  onPinRemove?: (pinId: string) => void;
  editable?: boolean;
  showControls?: boolean;
}

const ProjectMap: React.FC<ProjectMapProps> = ({
  proyecto,
  pins = [],
  onPinAdd,
  onPinRemove,
  editable = false,
  showControls = true,
}) => {
  const { theme } = useTheme();
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Obtener la imagen del mapa
  const getMapImageUri = () => {
    if (!proyecto.mapa?.imagen) return null;
    const { data, contentType } = proyecto.mapa.imagen;
    return `data:${contentType};base64,${data}`;
  };

  const mapImageUri = getMapImageUri();

  // Manejar el layout del mapa
  const handleMapLayout = (event: any) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setMapDimensions({ width: layoutWidth, height: layoutHeight });
  };

  // Manejar toque en el mapa para colocar pin
  const handleMapPress = (event: any) => {
    if (!editable || !isPlacingPin) return;

    const { locationX, locationY } = event.nativeEvent;

    // Calcular las coordenadas relativas (0-100%)
    const pinX = (locationX / mapDimensions.width) * 100;
    const pinY = (locationY / mapDimensions.height) * 100;

    // Solicitar etiqueta para el pin
    Alert.prompt(
      'Nuevo Pin',
      'Ingresa una etiqueta para este pin:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Guardar',
          onPress: (etiqueta) => {
            if (etiqueta && onPinAdd) {
              const newPin: Omit<PinMapa, 'id'> = {
                pinX,
                pinY,
                etiqueta: etiqueta.trim(),
                color: theme.primary,
              };
              onPinAdd(newPin);
              setIsPlacingPin(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Manejar selección de pin
  const handlePinPress = (pin: PinMapa) => {
    if (!editable) return;

    setSelectedPin(pin.id);

    Alert.alert(
      pin.etiqueta,
      'Opciones del pin',
      [
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (onPinRemove) {
              onPinRemove(pin.id);
            }
            setSelectedPin(null);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setSelectedPin(null),
        },
      ]
    );
  };

  // Renderizar pin
  const renderPin = (pin: PinMapa) => {
    const pinLeft = (pin.pinX / 100) * mapDimensions.width;
    const pinTop = (pin.pinY / 100) * mapDimensions.height;

    const isSelected = selectedPin === pin.id;

    return (
      <TouchableOpacity
        key={pin.id}
        style={[
          styles.pin,
          {
            left: pinLeft - 15,
            top: pinTop - 30,
            backgroundColor: pin.color,
            borderColor: isSelected ? theme.warning : theme.white,
            borderWidth: isSelected ? 3 : 2,
          },
        ]}
        onPress={() => handlePinPress(pin)}
        disabled={!editable}
      >
        <Ionicons name="location" size={24} color={theme.white} />
        {pin.etiqueta && (
          <View
            style={[
              styles.pinLabel,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.pinLabelText, { color: theme.text }]} numberOfLines={1}>
              {pin.etiqueta}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Si no hay mapa
  if (!mapImageUri) {
    return (
      <View style={[styles.noMapContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="map-outline" size={64} color={theme.textDisabled} />
        <Text style={[styles.noMapText, { color: theme.textSecondary }]}>
          Este proyecto no tiene un mapa configurado
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Controles superiores */}
      {showControls && editable && (
        <View style={[styles.controls, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isPlacingPin ? theme.primary : theme.background,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setIsPlacingPin(!isPlacingPin)}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color={isPlacingPin ? theme.white : theme.primary}
            />
            <Text
              style={[
                styles.controlButtonText,
                { color: isPlacingPin ? theme.white : theme.primary },
              ]}
            >
              {isPlacingPin ? 'Cancelar' : 'Agregar Pin'}
            </Text>
          </TouchableOpacity>

          {pins.length > 0 && (
            <View style={styles.pinCounter}>
              <Ionicons name="location" size={16} color={theme.textSecondary} />
              <Text style={[styles.pinCounterText, { color: theme.textSecondary }]}>
                {pins.length} pin(es)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Ayuda cuando está en modo colocar pin */}
      {isPlacingPin && (
        <View style={[styles.helpBanner, { backgroundColor: theme.info }]}>
          <Ionicons name="information-circle" size={20} color={theme.white} />
          <Text style={[styles.helpText, { color: theme.white }]}>
            Toca en el mapa para colocar un pin
          </Text>
        </View>
      )}

      {/* Mapa con imagen */}
      <TouchableOpacity
        style={[styles.mapContainer, { borderColor: theme.border }]}
        onLayout={handleMapLayout}
        onPress={handleMapPress}
        activeOpacity={isPlacingPin ? 0.7 : 1}
        disabled={!editable}
      >
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Cargando mapa...
            </Text>
          </View>
        )}

        <Image
          source={{ uri: mapImageUri }}
          style={styles.mapImage}
          resizeMode="contain"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />

        {/* Pins sobre el mapa */}
        {!imageLoading && mapDimensions.width > 0 && pins.map(renderPin)}

        {/* Cursor de colocar pin */}
        {isPlacingPin && (
          <View style={styles.cursorOverlay} pointerEvents="none">
            <Ionicons name="add-circle" size={32} color={theme.primary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Info del proyecto */}
      <View style={[styles.projectInfo, { backgroundColor: theme.surface }]}>
        <Ionicons name="business" size={16} color={theme.textSecondary} />
        <Text style={[styles.projectName, { color: theme.text }]} numberOfLines={1}>
          {proyecto.nombre}
        </Text>
        {proyecto.ubicacion && (
          <>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.projectLocation, { color: theme.textSecondary }]} numberOfLines={1}>
              {proyecto.ubicacion}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pinCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinCounterText: {
    fontSize: 14,
  },
  helpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  pin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinLabel: {
    position: 'absolute',
    top: 32,
    minWidth: 60,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  pinLabelText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  cursorOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  projectLocation: {
    fontSize: 12,
    flex: 1,
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 8,
  },
  noMapText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProjectMap;
