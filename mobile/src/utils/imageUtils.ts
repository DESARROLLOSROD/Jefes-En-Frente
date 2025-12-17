import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export interface CompressedImage {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  fileSize: number; // en bytes
}

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  compressFormat?: 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  compressFormat: 'jpeg',
};

/**
 * Comprime una imagen y la convierte a base64
 */
export async function compressImage(
  imageUri: string,
  options: ImageCompressionOptions = {}
): Promise<CompressedImage> {
  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    console.log('📸 Comprimiendo imagen...');
    console.log('URI original:', imageUri);

    // Obtener dimensiones originales
    const imageInfo = await FileSystem.getInfoAsync(imageUri);
    const originalSize = (imageInfo as any).size || 0;
    console.log(`📊 Tamaño original: ${(originalSize / 1024).toFixed(2)} KB`);

    // Comprimir imagen
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: opts.maxWidth,
            height: opts.maxHeight,
          },
        },
      ],
      {
        compress: opts.quality,
        format: opts.compressFormat === 'jpeg'
          ? ImageManipulator.SaveFormat.JPEG
          : ImageManipulator.SaveFormat.PNG,
        base64: true,
      }
    );

    // Obtener tamaño final
    const finalInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
    const finalSize = (finalInfo as any).size || 0;
    const compressionRatio = ((1 - finalSize / originalSize) * 100).toFixed(2);

    console.log(`📊 Tamaño final: ${(finalSize / 1024).toFixed(2)} KB`);
    console.log(`✅ Compresión: ${compressionRatio}%`);

    return {
      uri: manipulatedImage.uri,
      base64: manipulatedImage.base64,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      fileSize: finalSize,
    };
  } catch (error) {
    console.error('❌ Error comprimiendo imagen:', error);
    throw error;
  }
}

/**
 * Selecciona una imagen de la galería y la comprime
 */
export async function pickAndCompressImage(
  options: ImageCompressionOptions = {}
): Promise<CompressedImage | null> {
  try {
    // Solicitar permisos
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error('Se requiere permiso para acceder a la galería');
    }

    // Seleccionar imagen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // Calidad máxima para después comprimir nosotros
    });

    if (result.canceled) {
      return null;
    }

    // Comprimir la imagen seleccionada
    return await compressImage(result.assets[0].uri, options);
  } catch (error) {
    console.error('❌ Error seleccionando imagen:', error);
    throw error;
  }
}

/**
 * Captura una foto con la cámara y la comprime
 */
export async function captureAndCompressImage(
  options: ImageCompressionOptions = {}
): Promise<CompressedImage | null> {
  try {
    // Solicitar permisos de cámara
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error('Se requiere permiso para acceder a la cámara');
    }

    // Capturar foto
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    // Comprimir la foto capturada
    return await compressImage(result.assets[0].uri, options);
  } catch (error) {
    console.error('❌ Error capturando foto:', error);
    throw error;
  }
}

/**
 * Crea una miniatura de una imagen
 */
export async function createThumbnail(
  imageUri: string,
  size: number = 200
): Promise<CompressedImage> {
  return await compressImage(imageUri, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    compressFormat: 'jpeg',
  });
}

/**
 * Convierte una imagen URI a base64
 */
export async function imageUriToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('❌ Error convirtiendo a base64:', error);
    throw error;
  }
}

/**
 * Calcula el tamaño de una imagen en KB
 */
export async function getImageSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return (info as any).size || 0;
  } catch (error) {
    console.error('❌ Error obteniendo tamaño:', error);
    return 0;
  }
}

/**
 * Verifica si una imagen excede un tamaño máximo
 */
export async function isImageTooLarge(uri: string, maxSizeKB: number = 5000): Promise<boolean> {
  const sizeBytes = await getImageSize(uri);
  const sizeKB = sizeBytes / 1024;
  return sizeKB > maxSizeKB;
}

export default {
  compressImage,
  pickAndCompressImage,
  captureAndCompressImage,
  createThumbnail,
  imageUriToBase64,
  getImageSize,
  isImageTooLarge,
};
