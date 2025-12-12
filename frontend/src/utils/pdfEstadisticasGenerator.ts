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
    doc.addImage(logo, 'PNG', 10, 2.5, 20, 20);
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

    // =============== INFORMACIÓN GENERAL (4 COLUMNAS) ===============
    const colWidth = (pageWidth - 35) / 4; // 4 columnas con 5mm de espacio entre ellas (3 espacios)

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

    // Columna 3: Total Viajes Generales
    doc.setFillColor(254, 243, 199); // Amarillo claro
    doc.rect(10 + (colWidth + 5) * 2, yPos, colWidth, 15, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Viajes Generales', 15 + (colWidth + 5) * 2, yPos + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(234, 179, 8); // Amarillo oscuro
    doc.text((estadisticas.totalViajes || 0).toLocaleString(), 15 + (colWidth + 5) * 2, yPos + 12);

    // Columna 4: Material Más Movido
    doc.setFillColor(243, 232, 255);
    doc.rect(10 + (colWidth + 5) * 3, yPos, colWidth, 15, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Material Más Movido', 15 + (colWidth + 5) * 3, yPos + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PURPLE_RGB);

    // Ajustar texto largo si es necesario
    const materialTexto = estadisticas.acarreo.materialMasMovido || 'N/A';
    // Si es muy largo, cortarlo
    const textoCorto = materialTexto.length > 15 ? materialTexto.substring(0, 12) + '...' : materialTexto;

    doc.text(textoCorto, 15 + (colWidth + 5) * 3, yPos + 12);

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
        doc.text('CONTROL DE ACARREO', leftColX, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Volumen: ${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`, leftColX, yPos);
        yPos += 4;
        doc.text(`Total de Viajes: ${estadisticas.acarreo.totalViajes.toLocaleString()}`, leftColX, yPos);
        yPos += 4;
        doc.text(`Material más movido: ${estadisticas.acarreo.materialMasMovido}`, leftColX, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Material', 'Volumen (m³)', 'Viajes', '%']],
            body: estadisticas.acarreo.materiales.map(m => [
                m.nombre,
                m.volumen.toLocaleString(),
                m.viajes.toLocaleString(),
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

        yPos = (doc as any).lastAutoTable.finalY + 4;

        // Gráfica de barras
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Gráfica de distribución:', leftColX, yPos);
        yPos += 4;

        const maxVolumen = Math.max(...estadisticas.acarreo.materiales.map(m => m.volumen));
        estadisticas.acarreo.materiales.forEach((material) => {
            const barWidth = maxVolumen > 0 ? Math.max(2, (material.volumen / maxVolumen) * (colWidthHalf - 30)) : 2;

            // Barra
            doc.setFillColor(...BLUE_RGB);
            doc.rect(leftColX, yPos - 2, barWidth, 3, 'F');

            // Etiqueta
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(60, 60, 60);
            doc.text(material.nombre.substring(0, 12), leftColX + barWidth + 2, yPos);

            yPos += 4;
        });

        yPos += 2;
    }

    // === CONTROL DE AGUA ===
    if (estadisticas.agua.porOrigen.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('CONTROL DE AGUA', leftColX, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Volumen: ${estadisticas.agua.volumenTotal.toLocaleString()} m³`, leftColX, yPos);
        yPos += 4;
        doc.text(`Total de Viajes: ${estadisticas.agua.totalViajes.toLocaleString()}`, leftColX, yPos);
        yPos += 4;
        doc.text(`Origen más utilizado: ${estadisticas.agua.origenMasUtilizado}`, leftColX, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [['Origen', 'Volumen (m³)', 'Viajes', '%']],
            body: estadisticas.agua.porOrigen.map(o => [
                o.origen,
                o.volumen.toLocaleString(),
                o.viajes.toLocaleString(),
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

        yPos = (doc as any).lastAutoTable.finalY + 4;

        // Gráfica de barras
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Gráfica de distribución:', leftColX, yPos);
        yPos += 4;

        const maxVolumenAgua = Math.max(...estadisticas.agua.porOrigen.map(o => o.volumen));
        estadisticas.agua.porOrigen.forEach((origen) => {
            const barWidth = maxVolumenAgua > 0 ? Math.max(2, (origen.volumen / maxVolumenAgua) * (colWidthHalf - 30)) : 2;

            // Barra
            doc.setFillColor(139, 142, 201);
            doc.rect(leftColX, yPos - 2, barWidth, 3, 'F');

            // Etiqueta
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(60, 60, 60);
            doc.text(origen.origen.substring(0, 12), leftColX + barWidth + 2, yPos);

            yPos += 4;
        });

        yPos += 2;
    }

    // =============== COLUMNA DERECHA ===============
    let yPosRight = 55; // Empezar a la misma altura que el primer control

    // === CONTROL DE MATERIAL ===
    if (estadisticas.material.materiales.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('CONTROL DE MATERIAL', rightColX, yPosRight);
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

        yPosRight = (doc as any).lastAutoTable.finalY + 4;

        // Gráfica de barras
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Gráfica de distribución:', rightColX, yPosRight);
        yPosRight += 4;

        const maxCantidad = Math.max(...estadisticas.material.materiales.map(m => m.cantidad));
        estadisticas.material.materiales.forEach((material) => {
            const barWidth = maxCantidad > 0 ? Math.max(2, (material.cantidad / maxCantidad) * (colWidthHalf - 30)) : 2;

            // Barra
            doc.setFillColor(107, 110, 201);
            doc.rect(rightColX, yPosRight - 2, barWidth, 3, 'F');

            // Etiqueta
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(60, 60, 60);
            doc.text(material.nombre.substring(0, 12), rightColX + barWidth + 2, yPosRight);

            yPosRight += 4;
        });

        yPosRight += 2;
    }

    // === VEHÍCULOS ===
    if (estadisticas.vehiculos.vehiculos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...BLUE_RGB);
        doc.text('VEHICULOS', rightColX, yPosRight);
        yPosRight += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Horas: ${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`, rightColX, yPosRight);
        yPosRight += 4;
        doc.text(`Vehículo más utilizado: ${estadisticas.vehiculos.vehiculoMasUtilizado}`, rightColX, yPosRight);
        yPosRight += 5;

        // Tabla de distribución de horas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Distribución de Horas:', rightColX, yPosRight);
        yPosRight += 3;

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

        yPosRight = (doc as any).lastAutoTable.finalY + 4;

        // Gráfica de barras de horas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Gráfica de horas de operación:', rightColX, yPosRight);
        yPosRight += 4;

        const maxHoras = Math.max(...estadisticas.vehiculos.vehiculos.map(v => v.horasOperacion));
        estadisticas.vehiculos.vehiculos.forEach((vehiculo) => {
            const barWidth = maxHoras > 0 ? Math.max(2, (vehiculo.horasOperacion / maxHoras) * (colWidthHalf - 30)) : 2;

            // Barra
            doc.setFillColor(171, 171, 201);
            doc.rect(rightColX, yPosRight - 2, barWidth, 3, 'F');

            // Etiqueta
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(60, 60, 60);
            doc.text(vehiculo.nombre.substring(0, 12), rightColX + barWidth + 2, yPosRight);

            yPosRight += 4;
        });

        yPosRight += 4;

        // Tabla de todos los vehículos utilizados
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Vehículos Utilizados:', rightColX, yPosRight);
        yPosRight += 3;

        autoTable(doc, {
            startY: yPosRight,
            head: [['Tipo de Vehículo', 'No. Económico', 'Horas']],
            body: estadisticas.vehiculos.vehiculos.map(v => [
                v.nombre,
                v.noEconomico,
                v.horasOperacion.toLocaleString()
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [107, 110, 201],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            styles: { fontSize: 7, cellPadding: 1.5 },
            margin: { left: rightColX, right: 10 },
            tableWidth: colWidthHalf
        });

        yPosRight = (doc as any).lastAutoTable.finalY + 4;

        // Gráfica adicional de vehículos por tipo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...BLUE_RGB);
        doc.text('Gráfica de vehículos por tipo:', rightColX, yPosRight);
        yPosRight += 4;

        // Agrupar vehículos por tipo (basado en el nombre)
        const vehiculosPorTipo = estadisticas.vehiculos.vehiculos.reduce((acc, v) => {
            const tipo = v.nombre.split(' ')[0]; // Tomar la primera palabra como tipo
            if (!acc[tipo]) {
                acc[tipo] = 0;
            }
            acc[tipo]++;
            return acc;
        }, {} as Record<string, number>);

        const tiposOrdenados = Object.entries(vehiculosPorTipo).sort((a, b) => b[1] - a[1]);
        const maxCantidadTipo = Math.max(...tiposOrdenados.map(([, cantidad]) => cantidad));

        tiposOrdenados.forEach(([tipo, cantidad]) => {
            const barWidth = maxCantidadTipo > 0 ? Math.max(2, (cantidad / maxCantidadTipo) * (colWidthHalf - 30)) : 2;

            // Barra
            doc.setFillColor(139, 142, 201);
            doc.rect(rightColX, yPosRight - 2, barWidth, 3, 'F');

            // Etiqueta
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(60, 60, 60);
            doc.text(`${tipo}: ${cantidad}`, rightColX + barWidth + 2, yPosRight);

            yPosRight += 4;
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
