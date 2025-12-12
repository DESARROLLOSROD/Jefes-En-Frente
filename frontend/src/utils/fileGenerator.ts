import * as XLSX from 'xlsx';
import { ReporteActividades } from '../types/reporte';
import { Vehiculo, Proyecto } from '../types/gestion';
import { prepararDatosReporte, prepararDatosVehiculos, prepararDatosGeneral } from './reportGenerator';

// Función para generar y descargar un archivo Excel a partir de un reporte con formato profesional
export const generarExcelReporte = async (reporte: ReporteActividades) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Completo', {
        properties: { tabColor: { argb: 'FF4C4EC9' } }
    });

    const datos = prepararDatosReporte(reporte);
    let currentRow = 1;

    // Estilo para títulos de sección
    const sectionTitleStyle = {
        font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF4C4EC9' } },
        alignment: { vertical: 'middle' as const, horizontal: 'left' as const },
        border: {
            top: { style: 'thin' as const },
            left: { style: 'thin' as const },
            bottom: { style: 'thin' as const },
            right: { style: 'thin' as const }
        }
    };

    // Estilo para encabezados de tabla
    const headerStyle = {
        font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF6B6EC9' } },
        alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
        border: {
            top: { style: 'thin' as const },
            left: { style: 'thin' as const },
            bottom: { style: 'thin' as const },
            right: { style: 'thin' as const }
        }
    };

    // Estilo para celdas de datos
    const dataStyle = {
        border: {
            top: { style: 'thin' as const, color: { argb: 'FFD3D3D3' } },
            left: { style: 'thin' as const, color: { argb: 'FFD3D3D3' } },
            bottom: { style: 'thin' as const, color: { argb: 'FFD3D3D3' } },
            right: { style: 'thin' as const, color: { argb: 'FFD3D3D3' } }
        }
    };

    // === INFORMACIÓN GENERAL ===
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = 'INFORMACIÓN GENERAL';
    titleRow.getCell(1).style = sectionTitleStyle;
    worksheet.mergeCells(currentRow, 1, currentRow, 9);
    titleRow.height = 25;
    currentRow++;

    // Encabezados
    const infoHeaderRow = worksheet.getRow(currentRow);
    infoHeaderRow.getCell(1).value = 'Campo';
    infoHeaderRow.getCell(2).value = 'Valor';
    infoHeaderRow.getCell(1).style = headerStyle;
    infoHeaderRow.getCell(2).style = headerStyle;
    currentRow++;

    // Datos de información general
    const infoData = [
        ['Fecha', new Date(reporte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' })],
        ['Turno', reporte.turno === 'primer' ? 'PRIMER TURNO' : 'SEGUNDO TURNO'],
        ['Ubicación', reporte.ubicacion],
        ['Zona de Trabajo', typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'N/A')],
        ['Sección de Trabajo', typeof reporte.seccionTrabajo === 'string' ? reporte.seccionTrabajo : (reporte.seccionTrabajo?.seccionNombre || 'N/A')],
        ['Jefe de Frente', reporte.jefeFrente],
        ['Sobrestante', reporte.sobrestante]
    ];

    infoData.forEach(([campo, valor]) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = campo;
        row.getCell(2).value = valor;
        row.getCell(1).style = { ...dataStyle, font: { bold: true } };
        row.getCell(2).style = dataStyle;
        currentRow++;
    });

    currentRow++; // Espacio

    // Helper function para agregar sección con tabla
    const addTableSection = (title: string, headers: string[], data: any[][]) => {
        if (data.length === 0) return;

        // Título de sección
        const sectionRow = worksheet.getRow(currentRow);
        sectionRow.getCell(1).value = title;
        sectionRow.getCell(1).style = sectionTitleStyle;
        worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
        sectionRow.height = 25;
        currentRow++;

        // Encabezados
        const headerRow = worksheet.getRow(currentRow);
        headers.forEach((header, index) => {
            headerRow.getCell(index + 1).value = header;
            headerRow.getCell(index + 1).style = headerStyle;
        });
        currentRow++;

        // Datos
        data.forEach(rowData => {
            const dataRow = worksheet.getRow(currentRow);
            rowData.forEach((value, index) => {
                dataRow.getCell(index + 1).value = value;
                dataRow.getCell(index + 1).style = dataStyle;
            });
            currentRow++;
        });

        currentRow++; // Espacio
    };

    // === CONTROL DE ACARREO ===
    if (datos.controlAcarreo.length) {
        addTableSection(
            'CONTROL DE ACARREO',
            ['No.', 'Material', 'No. Viaje', 'Capacidad', 'Vol. Suelto', 'Capa No.', 'Elevación Ariza', 'Capa Origen', 'Destino'],
            datos.controlAcarreo
        );
    }

    // === CONTROL DE MATERIAL ===
    if (datos.controlMaterial.length) {
        addTableSection(
            'CONTROL DE MATERIAL',
            ['Material', 'Unidad', 'Cantidad', 'Zona', 'Elevación'],
            datos.controlMaterial
        );
    }

    // === CONTROL DE AGUA ===
    if (datos.controlAgua.length) {
        addTableSection(
            'CONTROL DE AGUA',
            ['No. Económico', 'Viajes', 'Capacidad', 'Volumen', 'Origen', 'Destino'],
            datos.controlAgua
        );
    }

    // === CONTROL DE MAQUINARIA ===
    if (datos.controlMaquinaria.length) {
        addTableSection(
            'CONTROL DE MAQUINARIA',
            ['Tipo', 'No. Económico', 'H. Inicial', 'H. Final', 'H. Operación', 'Operador', 'Actividad'],
            datos.controlMaquinaria
        );
    }

    // === OBSERVACIONES ===
    if (reporte.observaciones) {
        const obsRow = worksheet.getRow(currentRow);
        obsRow.getCell(1).value = 'OBSERVACIONES';
        obsRow.getCell(1).style = sectionTitleStyle;
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        obsRow.height = 25;
        currentRow++;

        const obsDataRow = worksheet.getRow(currentRow);
        obsDataRow.getCell(1).value = reporte.observaciones;
        obsDataRow.getCell(1).style = { ...dataStyle, alignment: { wrapText: true, vertical: 'top' as const } };
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        obsDataRow.height = 60;
    }

    // Configurar anchos de columna
    worksheet.columns = [
        { width: 18 },
        { width: 22 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 14 },
        { width: 18 },
        { width: 18 },
        { width: 18 }
    ];

    // Generar y descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fechaArchivo = new Date(reporte.fecha).toISOString().split('T')[0];
    const zonaNombre = typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'Zona');
    const zona = zonaNombre.replace(/\s+/g, '_').substring(0, 20);
    const filename = `Reporte_${fechaArchivo}_${zona}.xlsx`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

// Función para generar y descargar un archivo Excel a partir de una lista de vehículos
export const generarExcelVehiculos = (vehiculos: Vehiculo[]) => {
    const workbook = XLSX.utils.book_new();
    const datos = prepararDatosVehiculos(vehiculos);
    const vehiculosSheet = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(workbook, vehiculosSheet, 'Vehículos');
    XLSX.writeFile(workbook, 'Reporte_Vehiculos.xlsx');
};

// Función para generar y descargar un archivo Excel a partir de un reporte general
export const generarExcelGeneral = (reportes: ReporteActividades[], proyectos: Proyecto[]) => {
    const workbook = XLSX.utils.book_new();
    const datos = prepararDatosGeneral(reportes, proyectos);
    const reportesSheet = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(workbook, reportesSheet, 'Reporte General');
    XLSX.writeFile(workbook, 'Reporte_General.xlsx');
};
