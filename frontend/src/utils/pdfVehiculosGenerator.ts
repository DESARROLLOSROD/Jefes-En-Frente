import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehiculo } from '../types/gestion';

export const generarPDFVehiculos = (vehiculos: Vehiculo[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header Principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE PARQUE VEHICULAR', pageWidth / 2, yPosition, { align: 'center' });

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

    // Tabla de Vehículos
    const tableBody = vehiculos.map(vehiculo => {
        // Formatear proyectos
        let proyectosStr = 'Sin asignar';
        if (Array.isArray(vehiculo.proyectos) && vehiculo.proyectos.length > 0) {
            proyectosStr = vehiculo.proyectos
                .map((p: any) => (typeof p === 'object' && p.nombre ? p.nombre : 'Proyecto'))
                .join(', ');
        }

        return [
            vehiculo.nombre.toUpperCase(),
            vehiculo.tipo.toUpperCase(),
            vehiculo.noEconomico.toUpperCase(),
            vehiculo.horometroInicial.toLocaleString(),
            vehiculo.horometroFinal ? vehiculo.horometroFinal.toLocaleString() : '-',
            vehiculo.horasOperacion ? vehiculo.horasOperacion.toLocaleString() : '0',
            proyectosStr.toUpperCase()
        ];
    });

    autoTable(doc, {
        startY: yPosition,
        head: [['Nombre', 'Tipo', 'No. Económico', 'H. Inicial', 'H. Final', 'H. Operación', 'Proyectos']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [230, 126, 34], textColor: 255, fontStyle: 'bold' }, // Naranja (matching theme)
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 10, right: 10 }
    });

    // Descargar
    const fechaArchivo = new Date().toISOString().split('T')[0];
    doc.save(`Reporte_Vehiculos_${fechaArchivo}.pdf`);
};
