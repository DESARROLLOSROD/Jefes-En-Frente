import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../Logo.png';
import { EstadisticasResponse } from '../services/estadisticas.service';

export const generarPDFEstadisticas = (estadisticas: EstadisticasResponse, nombreProyecto?: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colores corporativos
    const BLUE_RGB: [number, number, number] = [76, 78, 201];
    const BLUE = "rgb(76, 78, 201)";
    const DARK = "rgb(26,26,26)";
    const GRAY = "rgb(80,80,80)";

    // Header corporativo
    doc.addImage(logo, 'PNG', 13, 8, 32, 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(DARK);
    doc.text('ANÁLISIS Y ESTADÍSTICAS', pageWidth / 1.80, 21, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(GRAY);
    doc.text('GENERADO POR JEFES EN FRENTE', pageWidth / 1.80, 30, { align: 'center' });

    // Línea corporativa
    doc.setDrawColor(BLUE);
    doc.setLineWidth(1.5);
    doc.line(10, 42, pageWidth - 10, 42);

    // Footer function
    const addFooter = () => {
        const pageNumber = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(GRAY);
        doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    let yPosition = 50;

    // Información del reporte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(DARK);
    doc.text('Proyecto:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(nombreProyecto || 'TODOS LOS PROYECTOS', 45, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Período:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    const fechaInicio = new Date(estadisticas.rangoFechas.inicio).toLocaleDateString('es-MX');
    const fechaFin = new Date(estadisticas.rangoFechas.fin).toLocaleDateString('es-MX');
    doc.text(`${fechaInicio} - ${fechaFin}`, 45, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Total de Reportes:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(estadisticas.totalReportes.toString(), 60, yPosition);

    yPosition += 12;

    // =============== CONTROL DE ACARREO ===============
    if (estadisticas.acarreo.materiales.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(BLUE);
        doc.text('📦 CONTROL DE ACARREO', 15, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(`Total Volumen: ${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`, 15, yPosition);
        yPosition += 5;
        doc.text(`Material más movido: ${estadisticas.acarreo.materialMasMovido}`, 15, yPosition);
        yPosition += 8;

        autoTable(doc, {
            startY: yPosition,
            head: [['Material', 'Volumen (m³)', 'Porcentaje']],
            body: estadisticas.acarreo.materiales.map(m => [
                m.nombre,
                m.volumen.toLocaleString(),
                `${m.porcentaje}%`
            ]),
            theme: 'grid',
            headStyles: { fillColor: BLUE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 12;

        // Verificar si necesitamos nueva página
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }
    }

    // =============== CONTROL DE MATERIAL ===============
    if (estadisticas.material.materiales.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(BLUE);
        doc.text('🏗️ CONTROL DE MATERIAL', 15, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(`Material más utilizado: ${estadisticas.material.materialMasUtilizado}`, 15, yPosition);
        yPosition += 8;

        autoTable(doc, {
            startY: yPosition,
            head: [['Material', 'Cantidad', 'Unidad']],
            body: estadisticas.material.materiales.map(m => [
                m.nombre,
                m.cantidad.toLocaleString(),
                m.unidad
            ]),
            theme: 'grid',
            headStyles: { fillColor: BLUE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 12;

        if (yPosition > pageHeight - 60) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }
    }

    // =============== CONTROL DE AGUA ===============
    if (estadisticas.agua.porOrigen.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(BLUE);
        doc.text('💧 CONTROL DE AGUA', 15, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(`Total Volumen: ${estadisticas.agua.volumenTotal.toLocaleString()} m³`, 15, yPosition);
        yPosition += 5;
        doc.text(`Origen más utilizado: ${estadisticas.agua.origenMasUtilizado}`, 15, yPosition);
        yPosition += 8;

        autoTable(doc, {
            startY: yPosition,
            head: [['Origen', 'Volumen (m³)', 'Porcentaje']],
            body: estadisticas.agua.porOrigen.map(o => [
                o.origen,
                o.volumen.toLocaleString(),
                `${o.porcentaje}%`
            ]),
            theme: 'grid',
            headStyles: { fillColor: BLUE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 12;

        if (yPosition > pageHeight - 60) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }
    }

    // =============== VEHÍCULOS ===============
    if (estadisticas.vehiculos.vehiculos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(BLUE);
        doc.text('🚜 VEHÍCULOS', 15, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(DARK);
        doc.text(`Total Horas: ${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`, 15, yPosition);
        yPosition += 5;
        doc.text(`Vehículo más utilizado: ${estadisticas.vehiculos.vehiculoMasUtilizado}`, 15, yPosition);
        yPosition += 8;

        autoTable(doc, {
            startY: yPosition,
            head: [['Vehículo', 'No. Económico', 'Horas', 'Porcentaje']],
            body: estadisticas.vehiculos.vehiculos.map(v => [
                v.nombre,
                v.noEconomico,
                v.horasOperacion.toLocaleString(),
                `${v.porcentaje}%`
            ]),
            theme: 'grid',
            headStyles: { fillColor: BLUE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 12;
    }

    // Footer final
    addFooter();

    // Descargar
    const nombreArchivo = `Estadisticas_${nombreProyecto || 'Todos'}_${fechaInicio.replace(/\//g, '-')}_${fechaFin.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
};
