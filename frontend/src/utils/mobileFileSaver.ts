
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Guarda un archivo en el dispositivo (Móvil) o descarga en navegador (Web)
 * @param fileName Nombre del archivo con extensión
 * @param dataBlob Blob o base64 data
 * @param mimeType Tipo MIME del archivo
 */
export const saveFile = async (
    fileName: string,
    dataBlob: Blob | string,
    mimeType: string
): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
        try {
            // Convertir Blob a Base64 si es necesario
            let base64Data: string;

            if (dataBlob instanceof Blob) {
                base64Data = await blobToBase64(dataBlob);
            } else {
                base64Data = dataBlob;
            }

            // Eliminar prefijo data:xxx;base64, si existe
            if (base64Data.includes(',')) {
                base64Data = base64Data.split(',')[1];
            }

            // Guardar archivo en documentos
            const result = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true
            });

            console.log('Archivo guardado en:', result.uri);

            // Intentar abrir el archivo (opcional, requiere plugin adicional para mejor experiencia)
            // Por ahora solo notificamos
            alert(`Archivo guardado en Documentos: ${fileName}`);

        } catch (error) {
            console.error('Error guardando archivo en móvil:', error);
            alert('Error al guardar el archivo en el dispositivo');
        }
    } else {
        // Lógica Web (Browser)
        const blob = dataBlob instanceof Blob
            ? dataBlob
            : base64ToBlob(dataBlob, mimeType);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};
