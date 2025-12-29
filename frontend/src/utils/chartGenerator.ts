/**
 * Utilidad para generar imágenes de gráficas (Pie, Bar) usando Canvas.
 * Estas imágenes se insertan en los archivos de Excel generados con exceljs.
 */

interface ChartDataItem {
    label: string;
    value: number;
    color?: string;
}

const DEFAULT_COLORS = [
    '#4C4EC9', '#22C55E', '#A855F7', '#F59E0B', '#EF4444',
    '#06B6D4', '#EC4899', '#8B5CF6', '#10B981', '#F97316'
];

/**
 * Genera una gráfica de pastel (Pie Chart) y devuelve un Base64.
 */
export const generatePieChartImage = (
    data: ChartDataItem[],
    width: number = 400,
    height: number = 300,
    title?: string
): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (data.length === 0) return canvas.toDataURL('image/png').split(',')[1];

    const total = data.reduce((acc, item) => acc + item.value, 0);
    const centerX = width * 0.35;
    const centerY = height * 0.5 + (title ? 10 : 0);
    const radius = Math.min(width, height) * 0.35;

    // Dibujar título
    if (title) {
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#1F2937';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 25);
    }

    // Dibujar rebanadas
    let currentAngle = -0.5 * Math.PI;
    data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Borde blanco entre rebanadas
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        currentAngle += sliceAngle;
    });

    // Dibujar leyenda
    const legendX = width * 0.65;
    let legendY = height * 0.25;
    const itemHeight = 20;

    ctx.textAlign = 'left';
    ctx.font = '12px Arial';

    data.slice(0, 10).forEach((item, index) => { // Limitar a los 10 principales para no desbordar
        const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const percentage = ((item.value / total) * 100).toFixed(1);

        // Cuadradito de color
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY, 12, 12);

        // Texto
        ctx.fillStyle = '#4B5563';
        const label = item.label.length > 20 ? item.label.substring(0, 17) + '...' : item.label;
        ctx.fillText(`${label} (${percentage}%)`, legendX + 20, legendY + 10);

        legendY += itemHeight;
    });

    return canvas.toDataURL('image/png').split(',')[1];
};

/**
 * Genera una gráfica de barras (Bar Chart) y devuelve un Base64.
 */
export const generateBarChartImage = (
    data: ChartDataItem[],
    width: number = 600,
    height: number = 300,
    title?: string
): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (data.length === 0) return canvas.toDataURL('image/png').split(',')[1];

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1; // 10% de margen arriba

    // Dibujar título
    if (title) {
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#1F2937';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 25);
    }

    const barWidth = (chartWidth / data.length) * 0.7;
    const groupWidth = chartWidth / data.length;

    // Ejes
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Líneas de cuadrícula horizontales
    ctx.textAlign = 'right';
    ctx.font = '10px Arial';
    ctx.fillStyle = '#9CA3AF';
    for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i * chartHeight / 5);
        const val = (i * maxVal / 5).toFixed(0);

        ctx.fillText(val, padding - 10, y + 3);

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.strokeStyle = '#F3F4F6';
        ctx.stroke();
    }

    // Dibujar barras
    data.forEach((item, index) => {
        const x = padding + (index * groupWidth) + (groupWidth - barWidth) / 2;
        const barHeight = (item.value / maxVal) * chartHeight;
        const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

        ctx.fillStyle = color;
        ctx.fillRect(x, height - padding - barHeight, barWidth, barHeight);

        // Etiqueta abajo
        ctx.fillStyle = '#4B5563';
        ctx.textAlign = 'center';
        ctx.font = '10px Arial';
        const label = item.label.length > 10 ? item.label.substring(0, 8) + '..' : item.label;
        ctx.fillText(label, x + barWidth / 2, height - padding + 15);

        // Valor arriba de la barra
        ctx.fillText(item.value.toString(), x + barWidth / 2, height - padding - barHeight - 5);
    });

    return canvas.toDataURL('image/png').split(',')[1];
};
