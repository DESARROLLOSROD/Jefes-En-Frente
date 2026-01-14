import * as ImageManipulator from 'expo-image-manipulator';
import { logger } from './logger';

/**
 * Configuración de compresión de imágenes
 */
const COMPRESSION_CONFIG = {
  // Calidad de compresión (0-1)
  quality: 0.7,

  // Ancho máximo en píxeles
  maxWidth: 1920,

  // Alto máximo en píxeles
  maxHeight: 1920,

  // Tamaño máximo del archivo en bytes (5MB)
  maxFileSize: 5 * 1024 * 1024,
};

/**
 * Comprime una imagen para reducir su tamaño manteniendo calidad aceptable
 *
 * @param uri - URI de la imagen original
 * @param options - Opciones de compresión personalizadas
 * @returns URI de la imagen comprimida
 */
export const compressImage = async (
  uri: string,
  options?: Partial<typeof COMPRESSION_CONFIG>
): Promise<string> => {
  try {
    const config = { ...COMPRESSION_CONFIG, ...options };

    logger.info(`🖼️ Comprimiendo imagen: ${uri}`);

    // Obtener dimensiones de la imagen original
    const imageInfo = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // Calcular factor de escala si la imagen es muy grande
    const scaleActions: ImageManipulator.Action[] = [];

    if (imageInfo.width > config.maxWidth || imageInfo.height > config.maxHeight) {
      const widthRatio = config.maxWidth / imageInfo.width;
      const heightRatio = config.maxHeight / imageInfo.height;
      const scaleFactor = Math.min(widthRatio, heightRatio);

      scaleActions.push({
        resize: {
          width: Math.floor(imageInfo.width * scaleFactor),
          height: Math.floor(imageInfo.height * scaleFactor),
        },
      });

      logger.debug(`📐 Escalando imagen: ${imageInfo.width}x${imageInfo.height} -> ${Math.floor(imageInfo.width * scaleFactor)}x${Math.floor(imageInfo.height * scaleFactor)}`);
    }

    // Comprimir imagen
    const result = await ImageManipulator.manipulateAsync(
      uri,
      scaleActions,
      {
        compress: config.quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    logger.info(`✅ Imagen comprimida: ${result.uri}`);
    logger.debug(`📊 Dimensiones finales: ${result.width}x${result.height}`);

    return result.uri;
  } catch (error) {
    logger.error('❌ Error comprimiendo imagen:', error);
    // Si falla la compresión, devolver la URI original
    return uri;
  }
};

/**
 * Comprime múltiples imágenes en paralelo
 *
 * @param uris - Array de URIs de imágenes
 * @param options - Opciones de compresión
 * @returns Array de URIs comprimidas
 */
export const compressImages = async (
  uris: string[],
  options?: Partial<typeof COMPRESSION_CONFIG>
): Promise<string[]> => {
  try {
    logger.info(`🖼️ Comprimiendo ${uris.length} imágenes...`);

    const compressedUris = await Promise.all(
      uris.map(uri => compressImage(uri, options))
    );

    logger.info(`✅ ${compressedUris.length} imágenes comprimidas`);
    return compressedUris;
  } catch (error) {
    logger.error('❌ Error comprimiendo imágenes:', error);
    return uris; // Devolver URIs originales si falla
  }
};

/**
 * Convierte una imagen a base64 comprimida
 *
 * @param uri - URI de la imagen
 * @param options - Opciones de compresión
 * @returns String base64 de la imagen comprimida
 */
export const imageToBase64Compressed = async (
  uri: string,
  options?: Partial<typeof COMPRESSION_CONFIG>
): Promise<string> => {
  try {
    // Primero comprimir la imagen
    const compressedUri = await compressImage(uri, options);

    // Leer el archivo como base64
    const base64 = await fetch(compressedUri)
      .then(res => res.blob())
      .then(blob => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remover el prefijo "data:image/jpeg;base64,"
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });

    logger.debug(`📦 Imagen convertida a base64 (tamaño: ${Math.round(base64.length / 1024)}KB)`);
    return base64;
  } catch (error) {
    logger.error('❌ Error convirtiendo imagen a base64:', error);
    throw error;
  }
};

/**
 * Estima el tamaño de una imagen base64
 *
 * @param base64 - String base64
 * @returns Tamaño estimado en bytes
 */
export const estimateBase64Size = (base64: string): number => {
  // Cada carácter base64 representa 6 bits
  // El tamaño real es aproximadamente 3/4 del tamaño del string
  const sizeInBytes = (base64.length * 3) / 4;
  return Math.round(sizeInBytes);
};

/**
 * Formatea el tamaño de archivo para mostrar al usuario
 *
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default {
  compressImage,
  compressImages,
  imageToBase64Compressed,
  estimateBase64Size,
  formatFileSize,
};
