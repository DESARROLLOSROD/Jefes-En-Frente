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
        alignment: { vertical: 'middle' as const, horizontal: 'left' as const, indent: 1 },
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

    // Estilo para celdas de datos (filas pares)
    const dataStyle = {
        border: {
            top: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }
        },
        alignment: { vertical: 'middle' as const }
    };

    // Estilo para filas alternas (zebra striping)
    const alternateDataStyle = {
        ...dataStyle,
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF5F5F5' } }
    };

    // Estilo para fila de total
    const totalStyle = {
        font: { bold: true, size: 11 },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFE4B5' } },
        alignment: { vertical: 'middle' as const, horizontal: 'right' as const },
        border: {
            top: { style: 'medium' as const },
            left: { style: 'thin' as const },
            bottom: { style: 'medium' as const },
            right: { style: 'thin' as const }
        }
    };

    // === INFORMACIÓN GENERAL ===
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = 'INFORMACIÓN GENERAL';
    titleRow.getCell(1).style = sectionTitleStyle;
    worksheet.mergeCells(currentRow, 1, currentRow, 9);
    titleRow.height = 30;
    currentRow++;

    // Encabezados
    const infoHeaderRow = worksheet.getRow(currentRow);
    infoHeaderRow.getCell(1).value = 'Campo';
    infoHeaderRow.getCell(2).value = 'Valor';
    infoHeaderRow.getCell(1).style = headerStyle;
    infoHeaderRow.getCell(2).style = headerStyle;
    infoHeaderRow.height = 25;
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

    infoData.forEach(([campo, valor], index) => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = campo;
        row.getCell(2).value = valor;
        row.getCell(1).style = { ...dataStyle, font: { bold: true } };
        row.getCell(2).style = index % 2 === 0 ? dataStyle : alternateDataStyle;
        row.height = 22;
        currentRow++;
    });

    currentRow += 2; // Espacio entre secciones

    // Helper function para agregar sección con tabla
    const addTableSection = (title: string, headers: string[], data: any[][], hasTotal: boolean = false) => {
        if (data.length === 0) return;

        // Título de sección
        const sectionRow = worksheet.getRow(currentRow);
        sectionRow.getCell(1).value = title;
        sectionRow.getCell(1).style = sectionTitleStyle;
        worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
        sectionRow.height = 30;
        currentRow++;

        // Encabezados
        const headerRow = worksheet.getRow(currentRow);
        headers.forEach((header, index) => {
            headerRow.getCell(index + 1).value = header;
            headerRow.getCell(index + 1).style = headerStyle;
        });
        headerRow.height = 25;
        currentRow++;

        // Datos (filtrar la fila de total si existe)
        const dataRows = hasTotal ? data.slice(0, -1) : data;
        dataRows.forEach((rowData, index) => {
            const dataRow = worksheet.getRow(currentRow);
            rowData.forEach((value, colIndex) => {
                // Limpiar valores que puedan ser objetos
                const cleanValue = typeof value === 'object' ? '' : value;
                dataRow.getCell(colIndex + 1).value = cleanValue;
                dataRow.getCell(colIndex + 1).style = index % 2 === 0 ? dataStyle : alternateDataStyle;
            });
            dataRow.height = 22;
            currentRow++;
        });

        // Agregar fila de total si existe
        if (hasTotal && data.length > 0) {
            const totalRow = worksheet.getRow(currentRow);
            const lastRow = data[data.length - 1];

            // Calcular el total de volumen
            let totalVolumen = 0;
            if (title === 'CONTROL DE ACARREO') {
                dataRows.forEach(row => {
                    const vol = parseFloat(row[4]) || 0; // Columna Vol. Suelto
                    totalVolumen += vol;
                });
                totalRow.getCell(1).value = '';
                totalRow.getCell(2).value = '';
                totalRow.getCell(3).value = '';
                totalRow.getCell(4).value = 'TOTAL VOLUMEN:';
                totalRow.getCell(5).value = `${totalVolumen.toFixed(2)} m³`;
                totalRow.getCell(4).style = totalStyle;
                totalRow.getCell(5).style = totalStyle;
            } else if (title === 'CONTROL DE AGUA') {
                dataRows.forEach(row => {
                    const vol = parseFloat(row[3]) || 0; // Columna Volumen
                    totalVolumen += vol;
                });
                totalRow.getCell(1).value = '';
                totalRow.getCell(2).value = '';
                totalRow.getCell(3).value = 'TOTAL VOLUMEN:';
                totalRow.getCell(4).value = `${totalVolumen.toFixed(2)} m³`;
                totalRow.getCell(3).style = totalStyle;
                totalRow.getCell(4).style = totalStyle;
            }

            totalRow.height = 25;
            currentRow++;
        }

        currentRow += 2; // Espacio entre secciones
    };

    // === CONTROL DE ACARREO ===
    if (datos.controlAcarreo.length) {
        addTableSection(
            'CONTROL DE ACARREO',
            ['No.', 'Material', 'No. Viaje', 'Capacidad', 'Vol. Suelto', 'Capa No.', 'Elevación Ariza', 'Capa Origen', 'Destino'],
            datos.controlAcarreo,
            true
        );
    }

    // === CONTROL DE MATERIAL ===
    if (datos.controlMaterial.length) {
        addTableSection(
            'CONTROL DE MATERIAL',
            ['Material', 'Unidad', 'Cantidad', 'Zona', 'Elevación'],
            datos.controlMaterial,
            false
        );
    }

    // === CONTROL DE AGUA ===
    if (datos.controlAgua.length) {
        addTableSection(
            'CONTROL DE AGUA',
            ['No. Económico', 'Viajes', 'Capacidad', 'Volumen', 'Origen', 'Destino'],
            datos.controlAgua,
            true
        );
    }

    // === CONTROL DE MAQUINARIA ===
    if (datos.controlMaquinaria.length) {
        addTableSection(
            'CONTROL DE MAQUINARIA',
            ['Tipo', 'No. Económico', 'H. Inicial', 'H. Final', 'H. Operación', 'Operador', 'Actividad'],
            datos.controlMaquinaria,
            false
        );
    }

    // === OBSERVACIONES ===
    if (reporte.observaciones) {
        const obsRow = worksheet.getRow(currentRow);
        obsRow.getCell(1).value = 'OBSERVACIONES';
        obsRow.getCell(1).style = sectionTitleStyle;
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        obsRow.height = 30;
        currentRow++;

        const obsDataRow = worksheet.getRow(currentRow);
        obsDataRow.getCell(1).value = reporte.observaciones;
        obsDataRow.getCell(1).style = {
            ...dataStyle,
            alignment: { wrapText: true, vertical: 'top' as const },
            fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFAFAFA' } }
        };
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        obsDataRow.height = 80;
    }

    // Configurar anchos de columna
    worksheet.columns = [
        { width: 20 },
        { width: 25 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 16 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
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
