import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../Logo.png'; // corporate logo
import { ReporteActividades } from '../types/reporte';
import { Proyecto } from '../types/gestion';

export const generarPDFGeneral = (reportes: ReporteActividades[], proyectos: Proyecto[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Define corporate colors
    const ORANGE_RGB: [number, number, number] = [76, 78, 201]; // for autoTable fillColor
    const ORANGE = "rgb(76, 78, 201)"; // for setDrawColor/setTextColor
    const DARK = "rgb(26,26,26)";
    const GRAY = "rgb(80,80,80)";

    // Header corporativo
    doc.addImage(logo, 'PNG', 13, 8, 32, 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(DARK);
    doc.text('REPORTE GENERAL DE ACTIVIDADES', pageWidth / 1.80, 21, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(GRAY);
    doc.text('GENERADO POR JEFES EN FRENTE', pageWidth / 1.80, 30, { align: 'center' });
    // Línea corporativa
    doc.setDrawColor(ORANGE);
    doc.setLineWidth(1.5);
    doc.line(10, 42, pageWidth - 10, 42);

    // Footer corporativo
    const addFooter = () => {
        const pageNumber = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(GRAY);
        doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };
    addFooter();

    let yPosition = 55; // start after header

    // Fecha de generación
    const fechaHoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(DARK);
    doc.text('Fecha de generación:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(GRAY);
    doc.text(fechaHoy, 70, yPosition);
    yPosition += 10;

    // Agrupar reportes por proyecto
    const reportesPorProyecto: { [key: string]: ReporteActividades[] } = {};
    reportes.forEach(reporte => {
        if (!reportesPorProyecto[reporte.proyectoId]) {
            reportesPorProyecto[reporte.proyectoId] = [];
        }
        reportesPorProyecto[reporte.proyectoId].push(reporte);
    });

    // Iterar proyectos
    Object.keys(reportesPorProyecto).forEach((proyectoId, index) => {
        const proyecto = proyectos.find(p => p._id === proyectoId);
        const nombreProyecto = proyecto ? proyecto.nombre : 'Proyecto Desconocido';
        const reportesDelProyecto = reportesPorProyecto[proyectoId];

        // Nueva página si no es el primero y hay espacio limitado
        if (index > 0) {
            doc.addPage();
            addFooter();
            yPosition = 55;
        }

        // Título del proyecto
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 140, 0); // naranja
        doc.text(`PROYECTO: ${nombreProyecto.toUpperCase()}`, 15, yPosition);
        doc.setTextColor(DARK);
        yPosition += 10;

        // Tabla de reportes del proyecto
        const tableBody = reportesDelProyecto.map(reporte => {
            const fecha = new Date(reporte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' });
            const zonaTexto = typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'N/A');
            const seccionTexto = typeof reporte.seccionTrabajo === 'string' ? reporte.seccionTrabajo : (reporte.seccionTrabajo?.seccionNombre || '-');
            return [
                fecha,
                reporte.turno === 'primer' ? '1ER' : '2DO',
                zonaTexto.toUpperCase(),
                seccionTexto.toUpperCase(),
                reporte.jefeFrente.toUpperCase(),
                reporte.controlMaquinaria?.length || 0,
                reporte.controlAcarreo?.length || 0,
            ];
        });

        autoTable(doc, {
            startY: yPosition,
            head: [['Fecha', 'Turno', 'Zona', 'Sección', 'Jefe Frente', 'Maq.', 'Acarreos']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: ORANGE_RGB, textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { fontSize: 9, textColor: DARK, cellPadding: 3 },
            margin: { left: 15, right: 15 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
    });

    // Guardar archivo
    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`Reporte_General_${fechaArchivo}.pdf`);
};
