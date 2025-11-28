import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReporteActividades } from '../types/reporte';

export const generarPDFReporte = (reporte: ReporteActividades, nombreProyecto: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE ACTIVIDADES DIARIAS', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(nombreProyecto.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Report Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const fecha = new Date(reporte.fecha).toLocaleDateString('UTC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    doc.text(`Fecha: `, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(fecha, 35, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text(`Turno: `, 120, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.turno === 'primer' ? 'PRIMER TURNO' : 'SEGUNDO TURNO', 140, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Ubicación: `, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.ubicacion ? reporte.ubicacion.toUpperCase() : '', 40, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Zona de Trabajo: `, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.zonaTrabajo ? reporte.zonaTrabajo.toUpperCase() : '', 50, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Sección de Trabajo: `, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.seccionTrabajo ? reporte.seccionTrabajo.toUpperCase() : '', 50, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Jefe de Frente: `, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.jefeFrente ? reporte.jefeFrente.toUpperCase() : '', 50, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text(`Sobrestante: `, 120, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reporte.sobrestante ? reporte.sobrestante.toUpperCase() : '', 150, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Horario: `, 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reporte.inicioActividades || ''} - ${reporte.terminoActividades || ''}`, 35, yPosition);

    yPosition += 12;

    // Control de Acarreos
    if (reporte.controlAcarreo && reporte.controlAcarreo.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTROL DE ACARREOS', 15, yPosition);
        yPosition += 5;

        autoTable(doc, {
            startY: yPosition,
            head: [['Material', 'No. Viaje', 'Capacidad', 'Vol. Suelto', 'Capa No.', 'Elev. Ariza', 'Origen', 'Destino']],
            body: reporte.controlAcarreo.map(item => [
                item.material.toUpperCase(),
                item.noViaje,
                item.capacidad,
                item.volSuelto,
                item.capaNo,
                item.elevacionAriza,
                item.capaOrigen.toUpperCase(),
                item.destino.toUpperCase()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 140, 0], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Control de Material
    if (reporte.controlMaterial && reporte.controlMaterial.length > 0) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTROL DE MATERIAL', 15, yPosition);
        yPosition += 5;

        autoTable(doc, {
            startY: yPosition,
            head: [['Material', 'Unidad', 'Cantidad', 'Zona', 'Elevación']],
            body: reporte.controlMaterial.map(item => [
                item.material.toUpperCase(),
                item.unidad.toUpperCase(),
                item.cantidad,
                item.zona.toUpperCase(),
                item.elevacion
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 140, 0], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Control de Agua
    if (reporte.controlAgua && reporte.controlAgua.length > 0) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTROL DE AGUA', 15, yPosition);
        yPosition += 5;

        autoTable(doc, {
            startY: yPosition,
            head: [['No. Económico', 'Viaje', 'Capacidad', 'Volumen', 'Origen', 'Destino']],
            body: reporte.controlAgua.map(item => [
                item.noEconomico.toUpperCase(),
                item.viaje,
                item.capacidad,
                item.volumen,
                item.origen.toUpperCase(),
                item.destino.toUpperCase()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 140, 0], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Control de Maquinaria
    if (reporte.controlMaquinaria && reporte.controlMaquinaria.length > 0) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTROL DE MAQUINARIA', 15, yPosition);
        yPosition += 5;

        autoTable(doc, {
            startY: yPosition,
            head: [['Tipo', 'No. Económico', 'Horómetro Inicial', 'Horómetro Final', 'Horas', 'Operador', 'Actividad']],
            body: reporte.controlMaquinaria.map(item => [
                item.tipo.toUpperCase(),
                item.numeroEconomico.toUpperCase(),
                item.horometroInicial || '-',
                item.horometroFinal || '-',
                item.horasOperacion || 0,
                item.operador.toUpperCase(),
                item.actividad.toUpperCase()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 140, 0], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: 15, right: 15 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Observaciones
    if (reporte.observaciones) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES', 15, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitObservaciones = doc.splitTextToSize(reporte.observaciones.toUpperCase(), pageWidth - 30);
        doc.text(splitObservaciones, 15, yPosition);
    }

    // Generate filename
    const fechaArchivo = new Date(reporte.fecha).toISOString().split('T')[0];
    const zona = reporte.zonaTrabajo.replace(/\s+/g, '_').substring(0, 20);
    const filename = `Reporte_${fechaArchivo}_${zona}.pdf`;

    // Download
    doc.save(filename);
};
