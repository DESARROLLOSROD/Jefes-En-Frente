import type ExcelJS from 'exceljs';
import { EstadisticasResponse } from '../services/estadisticas.service';
import { generatePieChartImage } from './chartGenerator';

export const generarExcelEstadisticas = async (estadisticas: EstadisticasResponse, nombreProyecto?: string) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();

    // Colores corporativos
    const BLUE = '4C4EC9';
    const PURPLE = 'A855F7';
    const GRAY = '646464';

    // =============== UNA SOLA HOJA: ESTADÍSTICAS ===============
    const sheet = workbook.addWorksheet('Estadísticas', {
        properties: { tabColor: { argb: `FF${BLUE}` } }
    });

    let currentRow = 1;

    // =============== TÍTULO PRINCIPAL ===============
    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const titleCell = sheet.getCell(`A${currentRow}`);
    titleCell.value = '📊 ANÁLISIS Y ESTADÍSTICAS DE OPERACIÓN';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
    sheet.getRow(currentRow).height = 40;
    currentRow++;

    sheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const subtitleCell = sheet.getCell(`A${currentRow}`);
    subtitleCell.value = `PROYECTO: ${nombreProyecto || 'TODOS LOS PROYECTOS'} | GENERADO POR JEFES EN FRENTE`;
    subtitleCell.font = { size: 11, bold: true, color: { argb: `FF${GRAY}` } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(currentRow).height = 25;
    currentRow += 2;

    // =============== INFORMACIÓN GENERAL (KPIs) ===============
    const fechaInicio = new Date(estadisticas.rangoFechas.inicio + 'T00:00:00').toLocaleDateString('es-MX');
    const fechaFin = new Date(estadisticas.rangoFechas.fin + 'T00:00:00').toLocaleDateString('es-MX');

    // Estilo común para KPIs
    const kpiLabelStyle: Partial<ExcelJS.Style> = {
        font: { size: 10, color: { argb: `FF${GRAY}` } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
    };

    const kpiValueStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 16 },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
    };

    // Fila de etiquetas
    sheet.mergeCells(`A${currentRow}:B${currentRow}`);
    sheet.mergeCells(`C${currentRow}:D${currentRow}`);
    sheet.mergeCells(`E${currentRow}:F${currentRow}`);
    sheet.mergeCells(`G${currentRow}:H${currentRow}`);

    sheet.getCell(`A${currentRow}`).value = 'Período';
    sheet.getCell(`C${currentRow}`).value = 'Total de Reportes';
    sheet.getCell(`E${currentRow}`).value = 'Total Viajes';
    sheet.getCell(`G${currentRow}`).value = 'Material Más Movido';

    [`A${currentRow}`, `C${currentRow}`, `E${currentRow}`, `G${currentRow}`].forEach(c => {
        sheet.getCell(c).style = kpiLabelStyle;
    });
    currentRow++;

    // Fila de valores
    sheet.mergeCells(`A${currentRow}:B${currentRow}`);
    sheet.mergeCells(`C${currentRow}:D${currentRow}`);
    sheet.mergeCells(`E${currentRow}:F${currentRow}`);
    sheet.mergeCells(`G${currentRow}:H${currentRow}`);

    sheet.getCell(`A${currentRow}`).value = `${fechaInicio} - ${fechaFin}`;
    sheet.getCell(`C${currentRow}`).value = estadisticas.totalReportes;
    sheet.getCell(`E${currentRow}`).value = estadisticas.totalViajes || 0;
    sheet.getCell(`G${currentRow}`).value = estadisticas.acarreo.materialMasMovido || 'N/A';

    [`A${currentRow}`, `C${currentRow}`, `E${currentRow}`, `G${currentRow}`].forEach(c => {
        sheet.getCell(c).style = kpiValueStyle;
    });
    sheet.getCell(`C${currentRow}`).font = { ...kpiValueStyle.font, color: { argb: `FF${BLUE}` } };
    sheet.getCell(`E${currentRow}`).font = { ...kpiValueStyle.font, color: { argb: 'FFF59E0B' } };
    sheet.getCell(`G${currentRow}`).font = { ...kpiValueStyle.font, size: 12, color: { argb: `FF${PURPLE}` } };

    sheet.getRow(currentRow - 1).height = 20;
    sheet.getRow(currentRow).height = 30;
    currentRow += 3;

    // =============== GRÁFICAS Y TABLAS POR SECCIÓN ===============

    // 1. CONTROL DE ACARREO
    if (estadisticas.acarreo.materiales.length > 0) {
        sheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const acarreoHeader = sheet.getCell(`A${currentRow}`);
        acarreoHeader.value = '📦 CONTROL DE ACARREO (RESUMEN DE VOLUMEN)';
        acarreoHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        acarreoHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        acarreoHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        currentRow++;

        // Subtítulos
        sheet.getCell(`A${currentRow}`).value = `Total Volumen: ${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`;
        sheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: `FF${GRAY}` } };
        currentRow += 2;

        // Tabla a la izquierda
        const startTableRow = currentRow;
        const headers = ['Material', 'Volumen (m³)', 'Viajes', 'Porcentaje'];
        headers.forEach((h, i) => {
            const cell = sheet.getCell(currentRow, i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B6EC9' } };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        estadisticas.acarreo.materiales.forEach(m => {
            sheet.getRow(currentRow).values = [m.nombre, m.volumen, m.viajes, `${m.porcentaje}%`];
            sheet.getRow(currentRow).alignment = { horizontal: 'left' };
            currentRow++;
        });

        // Gráfica a la derecha (Base64)
        const chartData = estadisticas.acarreo.materiales.map(m => ({ label: m.nombre, value: m.volumen }));
        const pieChart = generatePieChartImage(chartData, 400, 300, 'Distribución por Material');
        const imgId = workbook.addImage({ base64: pieChart, extension: 'png' });
        sheet.addImage(imgId, {
            tl: { col: 4, row: startTableRow - 1 },
            ext: { width: 400, height: 250 }
        });

        currentRow = Math.max(currentRow, startTableRow + 13); // Asegurar espacio para la imagen
        currentRow += 2;
    }

    // 2. CONTROL DE AGUA
    if (estadisticas.agua.porOrigen.length > 0) {
        sheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const aguaHeader = sheet.getCell(`A${currentRow}`);
        aguaHeader.value = '💧 CONTROL DE AGUA (RESUMEN POR ORIGEN)';
        aguaHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        aguaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }; // Cyan-600
        aguaHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        currentRow++;

        sheet.getCell(`A${currentRow}`).value = `Total Volumen: ${estadisticas.agua.volumenTotal.toLocaleString()} m³`;
        sheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: `FF${GRAY}` } };
        currentRow += 2;

        const startTableRow = currentRow;
        const headers = ['Origen', 'Volumen (m³)', 'Viajes', 'Porcentaje'];
        headers.forEach((h, i) => {
            const cell = sheet.getCell(currentRow, i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF38BDF8' } };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        estadisticas.agua.porOrigen.forEach(o => {
            sheet.getRow(currentRow).values = [o.origen, o.volumen, o.viajes, `${o.porcentaje}%`];
            currentRow++;
        });

        // Gráfica
        const chartData = estadisticas.agua.porOrigen.map(o => ({ label: o.origen, value: o.volumen }));
        const pieChart = generatePieChartImage(chartData, 400, 300, 'Distribución por Origen de Agua');
        const imgId = workbook.addImage({ base64: pieChart, extension: 'png' });
        sheet.addImage(imgId, {
            tl: { col: 4, row: startTableRow - 1 },
            ext: { width: 400, height: 250 }
        });

        currentRow = Math.max(currentRow, startTableRow + 13);
        currentRow += 2;
    }

    // 3. VEHÍCULOS / MAQUINARIA
    if (estadisticas.vehiculos.vehiculos.length > 0) {
        sheet.mergeCells(`A${currentRow}:H${currentRow}`);
        const vehHeader = sheet.getCell(`A${currentRow}`);
        vehHeader.value = '🚜 USO DE MAQUINARIA (HORAS)';
        vehHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        vehHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }; // Amber-600
        vehHeader.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        currentRow++;

        sheet.getCell(`A${currentRow}`).value = `Total Horas Operación: ${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`;
        sheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: `FF${GRAY}` } };
        currentRow += 2;

        const startTableRow = currentRow;
        const headers = ['Maquinaria', 'Económico', 'Horas', 'Porcentaje'];
        headers.forEach((h, i) => {
            const cell = sheet.getCell(currentRow, i + 1);
            cell.value = h;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBBF24' } };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        estadisticas.vehiculos.vehiculos.forEach(v => {
            sheet.getRow(currentRow).values = [v.nombre, v.noEconomico, v.horasOperacion, `${v.porcentaje}%`];
            currentRow++;
        });

        // Gráfica
        const chartData = estadisticas.vehiculos.vehiculos.map(v => ({ label: `${v.nombre} (${v.noEconomico})`, value: v.horasOperacion }));
        const pieChart = generatePieChartImage(chartData, 400, 300, 'Uso de Maquinaria por Horas');
        const imgId = workbook.addImage({ base64: pieChart, extension: 'png' });
        sheet.addImage(imgId, {
            tl: { col: 4, row: startTableRow - 1 },
            ext: { width: 400, height: 250 }
        });

        currentRow = Math.max(currentRow, startTableRow + 13);
        currentRow += 2;
    }

    // Ajustar anchos de columnas
    sheet.getColumn('A').width = 30;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 15;
    sheet.getColumn('F').width = 15;
    sheet.getColumn('G').width = 20;
    sheet.getColumn('H').width = 20;

    // Descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nombreArchivo = `Estadisticas_${nombreProyecto || 'Global'}_${fechaInicio.replace(/\//g, '-')}_${fechaFin.replace(/\//g, '-')}.xlsx`;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
};
