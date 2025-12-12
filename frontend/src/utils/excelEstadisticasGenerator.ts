import { EstadisticasResponse } from '../services/estadisticas.service';

export const generarExcelEstadisticas = async (estadisticas: EstadisticasResponse, nombreProyecto?: string) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();

    // Colores corporativos
    const BLUE = '4C4EC9';
    const LIGHT_BLUE = 'E3F2FD';
    const GREEN = '22C55E';
    const LIGHT_GREEN = 'DCFCE7';
    const PURPLE = 'A855F7';
    const LIGHT_PURPLE = 'F3E8FF';
    const GRAY = '646464';

    // =============== UNA SOLA HOJA: ESTADÍSTICAS ===============
    const sheet = workbook.addWorksheet('Estadísticas', {
        properties: { tabColor: { argb: `FF${BLUE}` } }
    });

    let currentRow = 1;

    // =============== TÍTULO PRINCIPAL ===============
    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const titleCell = sheet.getCell(`A${currentRow}`);
    titleCell.value = '📊 ANÁLISIS Y ESTADÍSTICAS';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FF1A1A1A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_BLUE}` } };
    sheet.getRow(currentRow).height = 30;
    currentRow++;

    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const subtitleCell = sheet.getCell(`A${currentRow}`);
    subtitleCell.value = 'GENERADO POR JEFES EN FRENTE';
    subtitleCell.font = { size: 10, color: { argb: `FF${GRAY}` } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow += 2;

    // =============== INFORMACIÓN GENERAL (4 COLUMNAS) ===============
    const fechaInicio = new Date(estadisticas.rangoFechas.inicio + 'T00:00:00').toLocaleDateString('es-MX');
    const fechaFin = new Date(estadisticas.rangoFechas.fin + 'T00:00:00').toLocaleDateString('es-MX');

    // Columna 1: Período
    sheet.mergeCells(`A${currentRow}:B${currentRow + 1}`);
    const periodCell = sheet.getCell(`A${currentRow}`);
    periodCell.value = 'Período';
    periodCell.font = { bold: false, size: 10, color: { argb: `FF${GRAY}` } };
    periodCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_BLUE}` } };
    periodCell.alignment = { horizontal: 'left', vertical: 'top' };

    const periodValueCell = sheet.getCell(`A${currentRow + 1}`);
    periodValueCell.value = `${fechaInicio} - ${fechaFin}`;
    periodValueCell.font = { bold: true, size: 11 };
    periodValueCell.alignment = { horizontal: 'left', vertical: 'bottom' };

    // Columna 2: Total de Reportes
    sheet.mergeCells(`C${currentRow}:D${currentRow + 1}`);
    const reportesCell = sheet.getCell(`C${currentRow}`);
    reportesCell.value = 'Total de Reportes';
    reportesCell.font = { bold: false, size: 10, color: { argb: `FF${GRAY}` } };
    reportesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_GREEN}` } };
    reportesCell.alignment = { horizontal: 'left', vertical: 'top' };

    const reportesValueCell = sheet.getCell(`C${currentRow + 1}`);
    reportesValueCell.value = estadisticas.totalReportes;
    reportesValueCell.font = { bold: true, size: 16, color: { argb: `FF${GREEN}` } };
    reportesValueCell.alignment = { horizontal: 'left', vertical: 'bottom' };

    // Columna 3: Total Viajes Generales
    sheet.mergeCells(`E${currentRow}:F${currentRow + 1}`);
    const viajesCell = sheet.getCell(`E${currentRow}`);
    viajesCell.value = 'Total Viajes Generales';
    viajesCell.font = { bold: false, size: 10, color: { argb: `FF${GRAY}` } };
    viajesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } }; // Light Yellow
    viajesCell.alignment = { horizontal: 'left', vertical: 'top' };

    const viajesValueCell = sheet.getCell(`E${currentRow + 1}`);
    viajesValueCell.value = estadisticas.totalViajes || 0;
    viajesValueCell.font = { bold: true, size: 16, color: { argb: 'FFF59E0B' } }; // Yellow
    viajesValueCell.alignment = { horizontal: 'left', vertical: 'bottom' };

    // Columna 4: Material Más Movido
    sheet.mergeCells(`G${currentRow}:H${currentRow + 1}`);
    const materialCell = sheet.getCell(`G${currentRow}`);
    materialCell.value = 'Material Más Movido';
    materialCell.font = { bold: false, size: 10, color: { argb: `FF${GRAY}` } };
    materialCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_PURPLE}` } };
    materialCell.alignment = { horizontal: 'left', vertical: 'top' };

    const materialValueCell = sheet.getCell(`G${currentRow + 1}`);
    materialValueCell.value = estadisticas.acarreo.materialMasMovido || 'N/A';
    materialValueCell.font = { bold: true, size: 11, color: { argb: `FF${PURPLE}` } };
    materialValueCell.alignment = { horizontal: 'left', vertical: 'bottom' };

    sheet.getRow(currentRow).height = 20;
    sheet.getRow(currentRow + 1).height = 20;
    currentRow += 3;

    // =============== SECCIÓN: CONTROL DE ACARREO ===============
    if (estadisticas.acarreo.materiales.length > 0) {
        sheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const acarreoTitle = sheet.getCell(`A${currentRow}`);
        acarreoTitle.value = '📦 CONTROL DE ACARREO';
        acarreoTitle.font = { bold: true, size: 12, color: { argb: `FF${BLUE}` } };
        acarreoTitle.alignment = { horizontal: 'left', vertical: 'middle' };
        currentRow++;

        sheet.getCell(`A${currentRow}`).value = `Total Volumen: ${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`;
        sheet.getCell(`A${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;
        sheet.getCell(`A${currentRow}`).value = `Material más movido: ${estadisticas.acarreo.materialMasMovido}`;
        sheet.getCell(`A${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;

        // Tabla de acarreo
        const acarreoHeaderRow = sheet.getRow(currentRow);
        acarreoHeaderRow.values = ['Material', 'Volumen (m³)', 'Viajes', 'Porcentaje'];
        acarreoHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        acarreoHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        acarreoHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        acarreoHeaderRow.height = 20;
        currentRow++;

        estadisticas.acarreo.materiales.forEach((material) => {
            const row = sheet.getRow(currentRow);
            row.values = [material.nombre, material.volumen, material.viajes, `${material.porcentaje}%`];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        currentRow++;
    }

    // =============== SECCIÓN: CONTROL DE MATERIAL ===============
    if (estadisticas.material.materiales.length > 0) {
        sheet.mergeCells(`D${currentRow}:G${currentRow}`);
        const materialTitle = sheet.getCell(`D${currentRow}`);
        materialTitle.value = '🏗️ CONTROL DE MATERIAL';
        materialTitle.font = { bold: true, size: 12, color: { argb: `FF${BLUE}` } };
        materialTitle.alignment = { horizontal: 'left', vertical: 'middle' };
        currentRow++;

        sheet.getCell(`D${currentRow}`).value = `Material más utilizado: ${estadisticas.material.materialMasUtilizado}`;
        sheet.getCell(`D${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;

        // Tabla de material
        const materialHeaderRow = sheet.getRow(currentRow);
        materialHeaderRow.values = [undefined, undefined, undefined, 'Material', 'Cantidad', 'Unidad'];
        materialHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        materialHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        materialHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        materialHeaderRow.height = 20;
        currentRow++;

        estadisticas.material.materiales.forEach((material) => {
            const row = sheet.getRow(currentRow);
            row.values = [undefined, undefined, undefined, material.nombre, material.cantidad, material.unidad];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        currentRow++;
    }

    // Ajustar a la posición correcta después de ambas secciones
    currentRow = Math.max(currentRow, sheet.rowCount) + 1;

    // =============== SECCIÓN: CONTROL DE AGUA ===============
    if (estadisticas.agua.porOrigen.length > 0) {
        sheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const aguaTitle = sheet.getCell(`A${currentRow}`);
        aguaTitle.value = '💧 CONTROL DE AGUA';
        aguaTitle.font = { bold: true, size: 12, color: { argb: `FF${BLUE}` } };
        aguaTitle.alignment = { horizontal: 'left', vertical: 'middle' };
        currentRow++;

        sheet.getCell(`A${currentRow}`).value = `Total Volumen: ${estadisticas.agua.volumenTotal.toLocaleString()} m³`;
        sheet.getCell(`A${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;
        sheet.getCell(`A${currentRow}`).value = `Origen más utilizado: ${estadisticas.agua.origenMasUtilizado}`;
        sheet.getCell(`A${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;

        // Tabla de agua
        const aguaHeaderRow = sheet.getRow(currentRow);
        aguaHeaderRow.values = ['Origen', 'Volumen (m³)', 'Viajes', 'Porcentaje'];
        aguaHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        aguaHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        aguaHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        aguaHeaderRow.height = 20;
        currentRow++;

        estadisticas.agua.porOrigen.forEach((origen) => {
            const row = sheet.getRow(currentRow);
            row.values = [origen.origen, origen.volumen, origen.viajes, `${origen.porcentaje}%`];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        currentRow++;
    }

    // =============== SECCIÓN: VEHÍCULOS ===============
    if (estadisticas.vehiculos.vehiculos.length > 0) {
        sheet.mergeCells(`D${currentRow}:G${currentRow}`);
        const vehiculosTitle = sheet.getCell(`D${currentRow}`);
        vehiculosTitle.value = '🚜 VEHÍCULOS';
        vehiculosTitle.font = { bold: true, size: 12, color: { argb: `FF${BLUE}` } };
        vehiculosTitle.alignment = { horizontal: 'left', vertical: 'middle' };
        currentRow++;

        sheet.getCell(`D${currentRow}`).value = `Total Horas: ${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`;
        sheet.getCell(`D${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;
        sheet.getCell(`D${currentRow}`).value = `Vehículo más utilizado: ${estadisticas.vehiculos.vehiculoMasUtilizado}`;
        sheet.getCell(`D${currentRow}`).font = { size: 10, color: { argb: `FF${GRAY}` } };
        currentRow++;

        // Tabla de vehículos
        const vehiculosHeaderRow = sheet.getRow(currentRow);
        vehiculosHeaderRow.values = [undefined, undefined, undefined, 'Vehículo', 'Horas', 'Porcentaje'];
        vehiculosHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        vehiculosHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        vehiculosHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        vehiculosHeaderRow.height = 20;
        currentRow++;

        estadisticas.vehiculos.vehiculos.forEach((vehiculo) => {
            const row = sheet.getRow(currentRow);
            row.values = [undefined, undefined, undefined, vehiculo.nombre, vehiculo.horasOperacion, `${vehiculo.porcentaje}%`];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });
    }

    // Ajustar anchos de columnas
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 25;
    sheet.getColumn('E').width = 15;
    sheet.getColumn('F').width = 15;

    // Descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nombreArchivo = `Estadisticas_${nombreProyecto || 'Todos'}_${fechaInicio.replace(/\//g, '-')}_${fechaFin.replace(/\//g, '-')}.xlsx`;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
};
