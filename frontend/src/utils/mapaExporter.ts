/**
 * Utilidad para exportar mapas con pins como imágenes
 */

interface Pin {
  id: string;
  pinX: number;
  pinY: number;
  etiqueta: string;
  color?: string;
}

/**
 * Dibuja un pin en el canvas
 */
const dibujarPin = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string = '#EF4444',
  etiqueta?: string
) => {
  // Escala del pin (ajustada para que se vea bien)
  const scale = 1.5;

  // Dibujar el pin (forma de lágrima)
  ctx.save();
  ctx.translate(x, y - 42 * scale); // Posicionar en la punta del pin

  // Cuerpo del pin
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(16 * scale, 16 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Triángulo inferior
  ctx.beginPath();
  ctx.moveTo(16 * scale, 32 * scale);
  ctx.lineTo(16 * scale, 42 * scale);
  ctx.lineTo(16 * scale, 32 * scale);
  ctx.fill();

  // Círculo blanco interior
  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.arc(16 * scale, 15 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Borde del pin
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(16 * scale, 16 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // Dibujar etiqueta si existe
  if (etiqueta) {
    ctx.save();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    const medida = ctx.measureText(etiqueta);
    const etiquetaX = x - medida.width / 2;
    const etiquetaY = y - 50 * scale;

    // Fondo blanco para la etiqueta
    ctx.fillStyle = 'white';
    ctx.fillRect(etiquetaX - 5, etiquetaY - 16, medida.width + 10, 20);

    // Borde de la etiqueta
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(etiquetaX - 5, etiquetaY - 16, medida.width + 10, 20);

    // Texto de la etiqueta
    ctx.fillStyle = 'black';
    ctx.fillText(etiqueta, etiquetaX, etiquetaY);

    ctx.restore();
  }
};

/**
 * Exporta el mapa con pins como imagen PNG
 */
export const exportarMapaConPins = async (
  mapaImagenBase64: string,
  pins: Pin[],
  nombreArchivo: string = 'mapa-con-pins.png'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Crear canvas con el tamaño de la imagen
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('NO SE PUDO CREAR CONTEXTO DE CANVAS'));
        return;
      }

      // Dibujar imagen de fondo
      ctx.drawImage(img, 0, 0);

      // Dibujar cada pin
      pins.forEach(pin => {
        const x = (pin.pinX / 100) * canvas.width;
        const y = (pin.pinY / 100) * canvas.height;
        dibujarPin(ctx, x, y, pin.color || '#EF4444', pin.etiqueta);
      });

      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('NO SE PUDO GENERAR LA IMAGEN'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resolve();
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('ERROR AL CARGAR LA IMAGEN DEL MAPA'));
    img.src = mapaImagenBase64;
  });
};

/**
 * Exporta solo el mapa con un pin único
 */
export const exportarMapaConPinUnico = async (
  mapaImagenBase64: string,
  pinX: number,
  pinY: number,
  nombreArchivo: string = 'mapa-con-pin.png'
): Promise<void> => {
  return exportarMapaConPins(
    mapaImagenBase64,
    [{ id: '1', pinX, pinY, etiqueta: '', color: '#EF4444' }],
    nombreArchivo
  );
};
