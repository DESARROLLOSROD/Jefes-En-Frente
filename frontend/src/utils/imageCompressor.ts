/**
 * Utilidad para comprimir imágenes antes de subirlas
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

/**
 * Comprime una imagen manteniendo su aspect ratio
 * @param file - Archivo de imagen a comprimir
 * @param options - Opciones de compresión
 * @returns Promise con el resultado de la compresión
 */
export const comprimirImagen = (
  file: File,
  options: CompressOptions = {}
): Promise<{
  base64: string;
  contentType: string;
  width: number;
  height: number;
  tamanioOriginal: number;
  tamanioComprimido: number;
}> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85
    } = options;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Crear canvas para comprimir
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('NO SE PUDO CREAR CONTEXTO DE CANVAS'));
          return;
        }

        // Dibujar imagen en canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a base64 comprimido
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('NO SE PUDO COMPRIMIR LA IMAGEN'));
              return;
            }

            const readerBlob = new FileReader();
            readerBlob.onload = () => {
              const base64 = (readerBlob.result as string).split(',')[1];
              const contentType = blob.type;

              resolve({
                base64,
                contentType,
                width: Math.round(width),
                height: Math.round(height),
                tamanioOriginal: file.size,
                tamanioComprimido: blob.size
              });
            };
            readerBlob.onerror = () => reject(new Error('ERROR AL LEER BLOB COMPRIMIDO'));
            readerBlob.readAsDataURL(blob);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('ERROR AL CARGAR LA IMAGEN'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('ERROR AL LEER EL ARCHIVO'));
    reader.readAsDataURL(file);
  });
};

/**
 * Formatea el tamaño de archivo en formato legible
 */
export const formatearTamano = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Calcula el porcentaje de reducción de tamaño
 */
export const calcularReduccion = (original: number, comprimido: number): number => {
  return Math.round(((original - comprimido) / original) * 100);
};
