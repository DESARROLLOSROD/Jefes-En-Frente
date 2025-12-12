import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

        autoTable(doc, {
            startY: yPos,
            head: [['Material', 'Volumen (m³)', '%']],
            body: estadisticas.acarreo.materiales.map(m => [
                m.nombre,
                m.volumen.toLocaleString(),
                `${m.porcentaje}%`
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: BLUE_RGB,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            styles: { fontSize: 7, cellPadding: 1.5 },
            margin: { left: leftColX, right: pageWidth / 2 + 5 },
            tableWidth: colWidthHalf
        });

        yPos = (doc as any).lastAutoTable.finalY + 6;
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

        autoTable(doc, {
            startY: yPos,
            head: [['Origen', 'Volumen (m³)', '%']],
            body: estadisticas.agua.porOrigen.map(o => [
                o.origen,
                o.volumen.toLocaleString(),
                `${o.porcentaje}%`
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: BLUE_RGB,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            styles: { fontSize: 7, cellPadding: 1.5 },
            margin: { left: leftColX, right: pageWidth / 2 + 5 },
            tableWidth: colWidthHalf
        });

        yPos = (doc as any).lastAutoTable.finalY + 6;
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

        autoTable(doc, {
            startY: yPosRight,
            head: [['Material', 'Cantidad', 'Unidad']],
            body: estadisticas.material.materiales.map(m => [
                m.nombre,
                m.cantidad.toLocaleString(),
                m.unidad
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: BLUE_RGB,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            styles: { fontSize: 7, cellPadding: 1.5 },
            margin: { left: rightColX, right: 10 },
            tableWidth: colWidthHalf
        });

        yPosRight = (doc as any).lastAutoTable.finalY + 6;
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

        autoTable(doc, {
            startY: yPosRight,
            head: [['Vehículo', 'Horas', '%']],
            body: estadisticas.vehiculos.vehiculos.map(v => [
                v.nombre,
                v.horasOperacion.toLocaleString(),
                `${v.porcentaje}%`
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: BLUE_RGB,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            styles: { fontSize: 7, cellPadding: 1.5 },
            margin: { left: rightColX, right: 10 },
            tableWidth: colWidthHalf
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
