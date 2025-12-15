import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePickerExpo from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 imágenes por fila con padding

export interface ImageItem {
  uri: string;
  name?: string;
  type?: string;
  base64?: string;
}

interface ImagePickerProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
  compressionQuality?: number;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  compressionQuality = 0.7,
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Solicitar permisos
  const requestPermissions = async (type: 'camera' | 'library') => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePickerExpo.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso Denegado',
            'Se requiere permiso para usar la cámara. Por favor habilítalo en la configuración.'
          );
          return false;
        }
      } else {
        const { status } = await ImagePickerExpo.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso Denegado',
            'Se requiere permiso para acceder a la galería. Por favor habilítalo en la configuración.'
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  // Tomar foto con la cámara
  const takePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Límite Alcanzado', `Solo puedes agregar hasta ${maxImages} imágenes.`);
      return;
    }

    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchCameraAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        quality: compressionQuality,
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: ImageItem = {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
          type: 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
        };
        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar imagen de la galería
  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Límite Alcanzado', `Solo puedes agregar hasta ${maxImages} imágenes.`);
      return;
    }

    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePickerExpo.launchImageLibraryAsync({
        mediaTypes: ImagePickerExpo.MediaTypeOptions.Images,
        quality: compressionQuality,
        allowsEditing: true,
        aspect: [4, 3],
        base64: true,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage: ImageItem = {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        };
        onImagesChange([...images, newImage]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar imagen
  const removeImage = (index: number) => {
    Alert.alert(
      'Eliminar Imagen',
      '¿Estás seguro de que deseas eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  // Mostrar opciones
  const showOptions = () => {
    Alert.alert(
      'Agregar Imagen',
      'Selecciona una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: takePhoto,
        },
        {
          text: 'Elegir de Galería',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.text }]}>
          Fotos de Evidencia
        </Text>
        <Text style={[styles.counter, { color: theme.textSecondary }]}>
          {images.length}/{maxImages}
        </Text>
      </View>

      {/* Galería de imágenes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
      >
        {/* Botón agregar */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={showOptions}
            disabled={isLoading}
          >
            <Ionicons
              name="camera"
              size={32}
              color={isLoading ? theme.textDisabled : theme.primary}
            />
            <Text style={[styles.addButtonText, { color: theme.textSecondary }]}>
              {isLoading ? 'Cargando...' : 'Agregar'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Imágenes */}
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.danger }]}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Helper text */}
      {images.length === 0 && (
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          Agrega fotos para documentar las actividades
        </Text>
      )}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  counter: {
    fontSize: 14,
  },
  gallery: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  addButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ImagePicker;
