import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReporteActividades } from '../types/reporte';
import { Proyecto } from '../types/gestion';

export const generarPDFGeneral = (reportes: ReporteActividades[], proyectos: Proyecto[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header Principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE GENERAL DE ACTIVIDADES', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const fechaHoy = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
    doc.text(`Generado el: ${fechaHoy}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Agrupar reportes por proyecto
    const reportesPorProyecto: { [key: string]: ReporteActividades[] } = {};

    reportes.forEach(reporte => {
        if (!reportesPorProyecto[reporte.proyectoId]) {
            reportesPorProyecto[reporte.proyectoId] = [];
        }
        reportesPorProyecto[reporte.proyectoId].push(reporte);
    });

    // Iterar sobre cada proyecto
    Object.keys(reportesPorProyecto).forEach((proyectoId, index) => {
        const proyecto = proyectos.find(p => p._id === proyectoId);
        const nombreProyecto = proyecto ? proyecto.nombre : 'Proyecto Desconocido';
        const reportesDelProyecto = reportesPorProyecto[proyectoId];

        // Nueva página para cada proyecto (excepto el primero si hay espacio)
        if (index > 0) {
            doc.addPage();
            yPosition = 20;
        }

        // Título del Proyecto
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 140, 0); // Naranja
        doc.text(`PROYECTO: ${nombreProyecto.toUpperCase()}`, 15, yPosition);
        doc.setTextColor(0, 0, 0); // Reset color
        yPosition += 10;

        // Tabla de Reportes del Proyecto
        const tableBody = reportesDelProyecto.map(reporte => {
            const fecha = new Date(reporte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' });
            return [
                fecha,
                reporte.turno === 'primer' ? '1ER' : '2DO',
                reporte.zonaTrabajo.toUpperCase(),
                reporte.seccionTrabajo ? reporte.seccionTrabajo.toUpperCase() : '-',
                reporte.jefeFrente.toUpperCase(),
                reporte.controlMaquinaria?.length || 0,
                reporte.controlAcarreo?.length || 0
            ];
        });

        autoTable(doc, {
            startY: yPosition,
            head: [['Fecha', 'Turno', 'Zona', 'Sección', 'Jefe Frente', 'Maq.', 'Acarreos']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, // Azul
            styles: { fontSize: 10, cellPadding: 3 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
    });

    // Descargar
    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`Reporte_General_${fechaArchivo}.pdf`);
};
