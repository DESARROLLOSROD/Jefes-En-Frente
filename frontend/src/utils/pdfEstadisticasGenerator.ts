import jsPDF from 'jspdf';
import logo from '../Logo.png';
import { EstadisticasResponse } from '../services/estadisticas.service';

export const generarPDFEstadisticas = (estadisticas: EstadisticasResponse, nombreProyecto?: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colores corporativos
    const BLUE_RGB: [number, number, number] = [76, 78, 201];
    const LIGHT_BLUE_RGB: [number, number, number] = [227, 242, 253];
    const GREEN_RGB: [number, number, number] = [34, 197, 94];
    const PURPLE_RGB: [number, number, number] = [168, 85, 247];

    // =============== HEADER ===============
    doc.addImage(logo, 'PNG', 10, 5, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26);
    doc.text('ANÁLISIS Y ESTADÍSTICAS', pageWidth / 2, 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('GENERADO POR JEFES EN FRENTE', pageWidth / 2, 18, { align: 'center' });

    doc.setDrawColor(76, 78, 201);
    doc.setLineWidth(0.5);
    doc.line(10, 24, pageWidth - 10, 24);

    let yPos = 30;

    // =============== INFORMACIÓN GENERAL (3 COLUMNAS) ===============
    const colWidth = (pageWidth - 30) / 3;

    // Columna 1: Período
    doc.setFillColor(...LIGHT_BLUE_RGB);
    doc.rect(10, yPos, colWidth, 15, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Período', 15, yPos + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 26);
    const fechaInicio = new Date(estadisticas.rangoFechas.inicio + 'T00:00:00').toLocaleDateString('es-MX');
    const fechaFin = new Date(estadisticas.rangoFechas.fin + 'T00:00:00').toLocaleDateString('es-MX');
    doc.text(`${fechaInicio} -`, 15, yPos + 10);
    doc.text(fechaFin, 15, yPos + 14);

    // Columna 2: Total de Reportes
    doc.setFillColor(220, 252, 231);
    doc.rect(10 + colWidth + 5, yPos, colWidth, 15, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total de Reportes', 15 + colWidth + 5, yPos + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...GREEN_RGB);
    doc.text(estadisticas.totalReportes.toString(), 15 + colWidth + 5, yPos + 12);

    // Columna 3: Material Más Movido
    doc.setFillColor(243, 232, 255);
    doc.rect(10 + (colWidth + 5) * 2, yPos, colWidth, 15, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Material Más Movido', 15 + (colWidth + 5) * 2, yPos + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PURPLE_RGB);
    doc.text(estadisticas.acarreo.materialMasMovido || 'N/A', 15 + (colWidth + 5) * 2, yPos + 12);

    yPos += 20;

    // =============== LAYOUT DE 2 COLUMNAS ===============
    const leftColX = 10;
    const rightColX = pageWidth / 2 + 2.5;
    const colWidthHalf = (pageWidth - 25) / 2;

    // =============== COLUMNA IZQUIERDA ===============

    // === CONTROL DE ACARREO ===
    if (estadisticas.acarreo.materiales.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('📦 CONTROL DE ACARREO', leftColX, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Volumen: ${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`, leftColX, yPos);
        yPos += 4;
        doc.text(`Material más movido: ${estadisticas.acarreo.materialMasMovido}`, leftColX, yPos);
        yPos += 5;

        // Gráfica de barras visual
        const maxVolumen = Math.max(...estadisticas.acarreo.materiales.map(m => m.volumen));
        estadisticas.acarreo.materiales.forEach((material) => {
            const barWidth = maxVolumen > 0 ? Math.max(1, (material.volumen / maxVolumen) * (colWidthHalf - 35)) : 1;

            // Nombre del material
            doc.setFontSize(7);
            doc.setTextColor(60, 60, 60);
            doc.text(material.nombre.substring(0, 15), leftColX, yPos);

            // Barra de color
            doc.setFillColor(...BLUE_RGB);
            doc.rect(leftColX + 30, yPos - 3, barWidth, 4, 'F');

            // Valor
            doc.setTextColor(26, 26, 26);
            doc.setFont('helvetica', 'bold');
            doc.text(`${material.volumen.toLocaleString()} m³ (${material.porcentaje}%)`, leftColX + 32 + barWidth, yPos);
            doc.setFont('helvetica', 'normal');

            yPos += 5;
        });

        yPos += 3;
    }

    // === CONTROL DE AGUA ===
    if (estadisticas.agua.porOrigen.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('💧 CONTROL DE AGUA', leftColX, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Volumen: ${estadisticas.agua.volumenTotal.toLocaleString()} m³`, leftColX, yPos);
        yPos += 4;
        doc.text(`Origen más utilizado: ${estadisticas.agua.origenMasUtilizado}`, leftColX, yPos);
        yPos += 5;

        // Gráfica de barras visual
        const maxVolumenAgua = Math.max(...estadisticas.agua.porOrigen.map(o => o.volumen));
        estadisticas.agua.porOrigen.forEach((origen) => {
            const barWidth = maxVolumenAgua > 0 ? Math.max(1, (origen.volumen / maxVolumenAgua) * (colWidthHalf - 35)) : 1;

            doc.setFontSize(7);
            doc.setTextColor(60, 60, 60);
            doc.text(origen.origen.substring(0, 18), leftColX, yPos);

            doc.setFillColor(139, 142, 201); // Color azul más claro
            doc.rect(leftColX + 30, yPos - 3, barWidth, 4, 'F');

            doc.setTextColor(26, 26, 26);
            doc.setFont('helvetica', 'bold');
            doc.text(`${origen.volumen.toLocaleString()} m³ (${origen.porcentaje}%)`, leftColX + 32 + barWidth, yPos);
            doc.setFont('helvetica', 'normal');

            yPos += 5;
        });
    }

    // =============== COLUMNA DERECHA ===============
    let yPosRight = 55; // Empezar a la misma altura que el primer control

    // === CONTROL DE MATERIAL ===
    if (estadisticas.material.materiales.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('🏗️ CONTROL DE MATERIAL', rightColX, yPosRight);
        yPosRight += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Material más utilizado: ${estadisticas.material.materialMasUtilizado}`, rightColX, yPosRight);
        yPosRight += 5;

        // Gráfica de barras visual
        const maxCantidad = Math.max(...estadisticas.material.materiales.map(m => m.cantidad));
        estadisticas.material.materiales.forEach((material) => {
            const barWidth = maxCantidad > 0 ? Math.max(1, (material.cantidad / maxCantidad) * (colWidthHalf - 35)) : 1;

            // Nombre del material
            doc.setFontSize(7);
            doc.setTextColor(60, 60, 60);
            doc.text(material.nombre.substring(0, 15), rightColX, yPosRight);

            // Barra de color
            doc.setFillColor(107, 110, 201); // Color morado medio
            doc.rect(rightColX + 30, yPosRight - 3, barWidth, 4, 'F');

            // Valor
            doc.setTextColor(26, 26, 26);
            doc.setFont('helvetica', 'bold');
            doc.text(`${material.cantidad.toLocaleString()} ${material.unidad}`, rightColX + 32 + barWidth, yPosRight);
            doc.setFont('helvetica', 'normal');

            yPosRight += 5;
        });

        yPosRight += 3;
    }

    // === VEHÍCULOS ===
    if (estadisticas.vehiculos.vehiculos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('🚜 VEHÍCULOS', rightColX, yPosRight);
        yPosRight += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Horas: ${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`, rightColX, yPosRight);
        yPosRight += 4;
        doc.text(`Vehículo más utilizado: ${estadisticas.vehiculos.vehiculoMasUtilizado}`, rightColX, yPosRight);
        yPosRight += 5;

        // Gráfica de barras visual
        const maxHoras = Math.max(...estadisticas.vehiculos.vehiculos.map(v => v.horasOperacion));
        estadisticas.vehiculos.vehiculos.forEach((vehiculo) => {
            const barWidth = maxHoras > 0 ? Math.max(1, (vehiculo.horasOperacion / maxHoras) * (colWidthHalf - 35)) : 1;

            // Nombre del vehículo
            doc.setFontSize(7);
            doc.setTextColor(60, 60, 60);
            doc.text(vehiculo.nombre.substring(0, 15), rightColX, yPosRight);

            // Barra de color
            doc.setFillColor(171, 171, 201); // Color gris-azul claro
            doc.rect(rightColX + 30, yPosRight - 3, barWidth, 4, 'F');

            // Valor
            doc.setTextColor(26, 26, 26);
            doc.setFont('helvetica', 'bold');
            doc.text(`${vehiculo.horasOperacion.toLocaleString()} hrs (${vehiculo.porcentaje}%)`, rightColX + 32 + barWidth, yPosRight);
            doc.setFont('helvetica', 'normal');

            yPosRight += 5;
        });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Proyecto: ${nombreProyecto || 'TODOS LOS PROYECTOS'}`, pageWidth / 2, 287, { align: 'center' });

    // Descargar
    const nombreArchivo = `Estadisticas_${nombreProyecto || 'Todos'}_${fechaInicio.replace(/\//g, '-')}_${fechaFin.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
};
