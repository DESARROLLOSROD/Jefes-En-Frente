import type ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { ReporteActividades } from '../types/reporte';
import { Vehiculo, Proyecto } from '../types/gestion';
import { prepararDatosReporte, prepararDatosVehiculos } from './reportGenerator';

// Función auxiliar para dibujar el mapa con pines (reutilizada del PDF)
const dibujarMapaConPines = (
    mapaBase64: string,
    mapaContentType: string,
    pines: Array<{ pinX: number; pinY: number; etiqueta?: string; color?: string }>
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('No se pudo crear el contexto del canvas'));
            return;
        }

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const pinSize = Math.max(img.width, img.height) * 0.03;

            pines.forEach(pin => {
                const pinXPx = (pin.pinX / 100) * img.width;
                const pinYPx = (pin.pinY / 100) * img.height;

                ctx.beginPath();
                ctx.arc(pinXPx, pinYPx, pinSize, 0, Math.PI * 2);
                ctx.fillStyle = pin.color || '#EF4444';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = pinSize * 0.2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(pinXPx, pinYPx, pinSize * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                if (pin.etiqueta) {
                    ctx.font = `bold ${pinSize}px Arial`;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = pinSize * 0.1;
                    ctx.textAlign = 'center';
                    ctx.strokeText(pin.etiqueta, pinXPx, pinYPx - pinSize * 1.5);
                    ctx.fillText(pin.etiqueta, pinXPx, pinYPx - pinSize * 1.5);
                }
            });

            const resultado = canvas.toDataURL('image/png').split(',')[1];
            resolve(resultado);
        };
        img.onerror = () => reject(new Error('Error al cargar la imagen del mapa'));
        img.src = `data:${mapaContentType};base64,${mapaBase64}`;
    });
};

// Función para generar y descargar un archivo Excel a partir de un reporte con formato profesional
export const generarExcelReporte = async (
    reporte: ReporteActividades,
    proyectoMapa?: { imagen: { data: string; contentType: string }; width: number; height: number }
) => {
    const ExcelJS = (await import('exceljs')).default;
    const { generatePieChartImage } = await import('./chartGenerator');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Diario', {
        properties: { tabColor: { argb: 'FF4C4EC9' } }
    });

    const datos = prepararDatosReporte(reporte);
    let currentRow = 1;

    // Colores corporativos
    const BLUE = '4C4EC9';

    // === TÍTULO PRINCIPAL ===
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    const mainTitle = worksheet.getCell(`A${currentRow}`);
    mainTitle.value = 'REPORTE DIARIO DE ACTIVIDADES';
    mainTitle.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    mainTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
    mainTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(currentRow).height = 40;
    currentRow++;

    // Estilo para títulos de sección (más moderno)
    const sectionTitleStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 12, color: { argb: 'FF1F2937' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } },
        alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
        border: {
            bottom: { style: 'medium', color: { argb: `FF${BLUE}` } }
        }
    };

    // Estilo para encabezados de tabla
    const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B6EC9' } },
        alignment: { vertical: 'middle', horizontal: 'center' },
        border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    };

    const dataStyle: Partial<ExcelJS.Style> = {
        border: {
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        },
        alignment: { vertical: 'middle', horizontal: 'left' }
    };

    // === INFORMACIÓN GENERAL ===
    const infoTitleRow = worksheet.getRow(currentRow);
    infoTitleRow.getCell(1).value = '📋 INFORMACIÓN GENERAL';
    infoTitleRow.getCell(1).style = sectionTitleStyle;
    worksheet.mergeCells(currentRow, 1, currentRow, 9);
    currentRow += 1;

    // Grid de información general (2 columnas)
    const infoData = [
        ['Fecha', new Date(reporte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }), 'Turno', reporte.turno === 'primer' ? 'PRIMER TURNO' : 'SEGUNDO TURNO'],
        ['Jefe de Frente', reporte.jefeFrente, 'Sobrestante', reporte.sobrestante],
        ['Zona', typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'N/A'), 'Sección', typeof reporte.seccionTrabajo === 'string' ? reporte.seccionTrabajo : (reporte.seccionTrabajo?.seccionNombre || 'N/A')],
        ['Ubicación', reporte.ubicacion, '', '']
    ];

    infoData.forEach(rowData => {
        const row = worksheet.getRow(currentRow);
        row.getCell(1).value = rowData[0];
        row.getCell(2).value = rowData[1];
        row.getCell(4).value = rowData[2];
        row.getCell(5).value = rowData[3];

        row.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF4B5563' } };
        row.getCell(4).font = { bold: true, size: 10, color: { argb: 'FF4B5563' } };
        row.getCell(2).font = { size: 10 };
        row.getCell(5).font = { size: 10 };

        worksheet.mergeCells(currentRow, 2, currentRow, 3);
        worksheet.mergeCells(currentRow, 5, currentRow, 9);

        row.height = 20;
        currentRow++;
    });

    currentRow += 2;

    // === RESUMEN VISUAL (Gráficas si hay datos) ===
    if (reporte.controlAcarreo && reporte.controlAcarreo.length > 0) {
        // Agrupar por material
        const acarreoPorMaterial = reporte.controlAcarreo.reduce((acc: any, item) => {
            acc[item.material] = (acc[item.material] || 0) + (parseFloat(item.volSuelto) || 0);
            return acc;
        }, {});

        const chartData = Object.entries(acarreoPorMaterial).map(([label, value]) => ({ label, value: value as number }));

        if (chartData.length > 0) {
            const pieChart = generatePieChartImage(chartData, 500, 300, 'Distribución de Volumen por Material (Acarreo)');
            const imgId = workbook.addImage({ base64: pieChart, extension: 'png' });

            worksheet.getRow(currentRow).getCell(1).value = '📊 RESUMEN DE ACARREO';
            worksheet.getRow(currentRow).getCell(1).style = sectionTitleStyle as any;
            worksheet.mergeCells(currentRow, 1, currentRow, 9);
            currentRow++;

            worksheet.addImage(imgId, {
                tl: { col: 0, row: currentRow },
                ext: { width: 450, height: 250 }
            });
            currentRow += 18; // Espacio para la gráfica
        }
    }

    // === MAPA DEL PROYECTO ===
    let pinesParaDibujar: Array<{ pinX: number; pinY: number; etiqueta?: string; color?: string }> = [];
    if (reporte.pinesMapa && reporte.pinesMapa.length > 0) {
        pinesParaDibujar = reporte.pinesMapa;
    } else if (reporte.ubicacionMapa?.colocado) {
        pinesParaDibujar = [{ pinX: reporte.ubicacionMapa.pinX, pinY: reporte.ubicacionMapa.pinY }];
    }

    if (proyectoMapa?.imagen?.data && pinesParaDibujar.length > 0) {
        try {
            const mapaConPines = await dibujarMapaConPines(
                proyectoMapa.imagen.data,
                proyectoMapa.imagen.contentType,
                pinesParaDibujar
            );

            worksheet.getRow(currentRow).getCell(1).value = '📍 UBICACIÓN EN MAPA';
            worksheet.getRow(currentRow).getCell(1).style = sectionTitleStyle as any;
            worksheet.mergeCells(currentRow, 1, currentRow, 9);
            currentRow++;

            const imageId = workbook.addImage({ base64: mapaConPines, extension: 'png' });
            const aspectRatio = proyectoMapa.width / proyectoMapa.height;
            const imageWidth = 450;
            const imageHeight = imageWidth / aspectRatio;

            worksheet.addImage(imageId, {
                tl: { col: 0, row: currentRow },
                ext: { width: imageWidth, height: imageHeight }
            });

            const rowsNeeded = Math.ceil(imageHeight / 20);
            currentRow += rowsNeeded + 2;

        } catch (error) {
            console.error('Error al agregar mapa al Excel:', error);
        }
    }

    // Helper function para agregar tablas
    const addTableSection = (title: string, icon: string, headers: string[], dataRows: any[][], hasTotal: boolean = false) => {
        if (dataRows.length === 0) return;

        worksheet.getRow(currentRow).getCell(1).value = `${icon} ${title}`;
        worksheet.getRow(currentRow).getCell(1).style = sectionTitleStyle as any;
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        currentRow++;

        const headerRow = worksheet.getRow(currentRow);
        headers.forEach((h, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = h;
            cell.style = headerStyle as any;
        });
        headerRow.height = 25;
        currentRow++;

        // Filtrar la fila de total si se pasó desde prepararDatosReporte (que a veces lo hace)
        const cleanData = dataRows.filter(r => !r.some(v => typeof v === 'object' && v.content));

        cleanData.forEach((rowData, index) => {
            const row = worksheet.getRow(currentRow);
            rowData.forEach((val, i) => {
                row.getCell(i + 1).value = val;
                row.getCell(i + 1).style = dataStyle as any;
                if (index % 2 === 1) {
                    row.getCell(i + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                }
            });
            row.height = 20;
            currentRow++;
        });

        if (hasTotal) {
            const totalRow = worksheet.getRow(currentRow);
            let totalVal = 0;
            let label = 'TOTAL VOLUMEN:';
            let colIndex = 0;

            if (title.includes('ACARREO')) {
                totalVal = cleanData.reduce((acc, r) => acc + (parseFloat(r[4]) || 0), 0);
                colIndex = 5;
            } else if (title.includes('AGUA')) {
                totalVal = cleanData.reduce((acc, r) => acc + (parseFloat(r[3]) || 0), 0);
                colIndex = 4;
            }

            if (colIndex > 0) {
                totalRow.getCell(colIndex - 1).value = label;
                totalRow.getCell(colIndex - 1).font = { bold: true };
                totalRow.getCell(colIndex).value = `${totalVal.toFixed(2)} m³`;
                totalRow.getCell(colIndex).font = { bold: true, color: { argb: `FF${BLUE}` } };
                totalRow.height = 25;
                currentRow++;
            }
        }

        currentRow += 2;
    };

    // Tablas de datos
    addTableSection('CONTROL DE ACARREO', '📦', ['No.', 'Material', 'No. Viaje', 'Capacidad', 'Vol. Suelto', 'Capa No.', 'Elevación', 'Capa Origen', 'Destino'], datos.controlAcarreo, true);
    addTableSection('CONTROL DE MATERIAL', '🏗️', ['Material', 'Unidad', 'Cantidad', 'Zona', 'Elevación'], datos.controlMaterial);
    addTableSection('CONTROL DE AGUA', '💧', ['Económico', 'Viajes', 'Capacidad', 'Volumen', 'Origen', 'Destino'], datos.controlAgua, true);
    addTableSection('CONTROL DE MAQUINARIA', '🚜', ['Tipo', 'Económico', 'H. Inicio', 'H. Fin', 'H. Oper.', 'Operador', 'Actividad'], datos.controlMaquinaria);

    // @ts-ignore
    addTableSection('CONTROL DE PERSONAL', '👷', ['Personal', 'Cargo', 'Actividad', 'Horas', 'Observaciones'], datos.controlPersonal || []);

    // === OBSERVACIONES ===
    if (reporte.observaciones) {
        worksheet.getRow(currentRow).getCell(1).value = '📝 OBSERVACIONES';
        worksheet.getRow(currentRow).getCell(1).style = sectionTitleStyle as any;
        worksheet.mergeCells(currentRow, 1, currentRow, 9);
        currentRow++;

        worksheet.mergeCells(currentRow, 1, currentRow + 3, 9);
        const obsCell = worksheet.getCell(currentRow, 1);
        obsCell.value = reporte.observaciones;
        obsCell.alignment = { wrapText: true, vertical: 'top' };
        currentRow += 4;
    }

    // Configurar anchos
    worksheet.columns = [
        { width: 12 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 12 },
        { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fechaArchivo = new Date(reporte.fecha).toISOString().split('T')[0];
    const zona = (typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'Zona')).substring(0, 15).replace(/\s+/g, '_');
    const filename = `Reporte_${fechaArchivo}_${zona}.xlsx`;

    const { saveFile } = await import('./mobileFileSaver');
    await saveFile(filename, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

// Función para generar y descargar un archivo Excel a partir de una lista de vehículos
export const generarExcelVehiculos = (vehiculos: Vehiculo[]) => {
    const workbook = XLSX.utils.book_new();
    const datos = prepararDatosVehiculos(vehiculos);
    const vehiculosSheet = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(workbook, vehiculosSheet, 'Vehículos');
    XLSX.writeFile(workbook, 'Reporte_Vehiculos.xlsx');
};

// Función para generar y descargar un archivo Excel a partir de un reporte general (Multi-Hoja)
export const generarExcelGeneral = async (reportes: ReporteActividades[], proyectos: Proyecto[]) => {
    const ExcelJS = (await import('exceljs')).default;
    const { generatePieChartImage } = await import('./chartGenerator');

    const workbook = new ExcelJS.Workbook();
    const proyectosMap = new Map(proyectos.map(p => [p._id, p.nombre]));

    // Colores corporativos
    const BLUE = '4C4EC9';
    const AMBER = 'D97706';
    const CYAN = '0284C7';

    // Estilos comunes
    const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: `FF${BLUE}` } },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const }
    };

    // 1. HOJA DE RESUMEN
    const summarySheet = workbook.addWorksheet('Resumen General', { properties: { tabColor: { argb: `FF${BLUE}` } } });
    let sRow = 1;

    summarySheet.mergeCells('A1:E1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = '📊 RESUMEN GENERAL DE OPERACIONES';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 40;
    sRow += 2;

    // KPIs Rápidos
    const totalReportes = reportes.length;
    const totalVolAcarreo = reportes.reduce((acc, r) => acc + (r.controlAcarreo?.reduce((s, i) => s + (parseFloat(i.volSuelto) || 0), 0) || 0), 0);
    // Removed unused totalVolAgua
    const totalHorasMaq = reportes.reduce((acc, r) => acc + (r.controlMaquinaria?.reduce((s, i) => s + (i.horasOperacion || 0), 0) || 0), 0);
    const totalHorasPersonal = reportes.reduce((acc, r) => acc + (r.personalAsignado?.reduce((s, p) => s + (p.horasTrabajadas || 0), 0) || 0), 0);

    const kpis = [
        ['Total Reportes', totalReportes, 'docs'],
        ['Volumen Acarreo', `${totalVolAcarreo.toLocaleString()} m³`, 'truck'],
        ['Horas Maquinaria', `${totalHorasMaq.toLocaleString()} hrs`, 'tool'],
        ['Horas Personal', `${totalHorasPersonal.toLocaleString()} hrs`, 'user']
    ];

    kpis.forEach((kpi) => {
        const row = summarySheet.getRow(sRow);
        row.getCell(1).value = kpi[0];
        row.getCell(2).value = kpi[1];
        row.getCell(1).font = { bold: true, color: { argb: 'FF4B5563' } };
        row.getCell(2).font = { bold: true, size: 12, color: { argb: `FF${BLUE}` } };
        sRow++;
    });

    // Gráfica de distribución de materiales en el resumen
    const materialesGlobal = reportes.reduce((acc: any, r) => {
        r.controlAcarreo?.forEach(i => {
            acc[i.material] = (acc[i.material] || 0) + (parseFloat(i.volSuelto) || 0);
        });
        return acc;
    }, {});

    const chartData = Object.entries(materialesGlobal).map(([label, value]) => ({ label, value: value as number })).sort((a, b) => b.value - a.value).slice(0, 8);

    if (chartData.length > 0) {
        const pieChart = generatePieChartImage(chartData, 500, 350, 'Distribución Global de Materiales (Acarreo)');
        const imgId = workbook.addImage({ base64: pieChart, extension: 'png' });
        summarySheet.addImage(imgId, {
            tl: { col: 0, row: sRow + 1 },
            ext: { width: 450, height: 300 }
        });
    }

    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 25;

    // 2. HOJA DE ACARREO DETALLADO
    const acarreoReports = reportes.filter(r => r.controlAcarreo && r.controlAcarreo.length > 0);
    if (acarreoReports.length > 0) {
        const sheet = workbook.addWorksheet('Acarreo Detallado');
        sheet.getRow(1).values = ['Proyecto', 'Fecha', 'Turno', 'Zona', 'Material', 'Viaje No.', 'Capacidad', 'Vol. Suelto', 'Origen', 'Destino'];
        sheet.getRow(1).eachCell(c => { c.style = headerStyle as any; });
        sheet.getRow(1).height = 25;

        let rowIdx = 2;
        acarreoReports.forEach(r => {
            r.controlAcarreo?.forEach(i => {
                sheet.getRow(rowIdx).values = [
                    proyectosMap.get(r.proyectoId) || 'N/A',
                    new Date(r.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }),
                    r.turno.toUpperCase(),
                    typeof r.zonaTrabajo === 'string' ? r.zonaTrabajo : (r.zonaTrabajo?.zonaNombre || 'N/A'),
                    i.material,
                    i.noViaje,
                    i.capacidad,
                    i.volSuelto,
                    i.capaOrigen,
                    i.destino
                ];
                rowIdx++;
            });
        });
        sheet.columns.forEach(col => col.width = 18);
    }

    // 3. HOJA DE AGUA DETALLADO
    const aguaReports = reportes.filter(r => r.controlAgua && r.controlAgua.length > 0);
    if (aguaReports.length > 0) {
        const sheet = workbook.addWorksheet('Agua Detallado', { properties: { tabColor: { argb: `FF${CYAN}` } } });
        sheet.getRow(1).values = ['Proyecto', 'Fecha', 'Turno', 'Económico', 'Viaje', 'Capacidad', 'Volumen', 'Origen', 'Destino'];
        sheet.getRow(1).eachCell(c => { c.style = headerStyle as any; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }; });

        let rowIdx = 2;
        aguaReports.forEach(r => {
            r.controlAgua?.forEach(i => {
                sheet.getRow(rowIdx).values = [
                    proyectosMap.get(r.proyectoId) || 'N/A',
                    new Date(r.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }),
                    r.turno.toUpperCase(),
                    i.noEconomico,
                    i.viaje,
                    i.capacidad,
                    i.volumen,
                    i.origen,
                    i.destino
                ];
                rowIdx++;
            });
        });
        sheet.columns.forEach(col => col.width = 18);
    }

    // 4. HOJA DE MAQUINARIA DETALLADO
    const maqReports = reportes.filter(r => r.controlMaquinaria && r.controlMaquinaria.length > 0);
    if (maqReports.length > 0) {
        const sheet = workbook.addWorksheet('Maquinaria Detallado', { properties: { tabColor: { argb: `FF${AMBER}` } } });
        sheet.getRow(1).values = ['Proyecto', 'Fecha', 'Tipo', 'Económico', 'H. Inicio', 'H. Fin', 'H. Oper.', 'Operador', 'Actividad'];
        sheet.getRow(1).eachCell(c => { c.style = headerStyle as any; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }; });

        let rowIdx = 2;
        maqReports.forEach(r => {
            r.controlMaquinaria?.forEach(i => {
                sheet.getRow(rowIdx).values = [
                    proyectosMap.get(r.proyectoId) || 'N/A',
                    new Date(r.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }),
                    i.tipo || '-',
                    i.numeroEconomico || '-',
                    i.horometroInicial,
                    i.horometroFinal,
                    i.horasOperacion,
                    i.operador,
                    i.actividad
                ];
                rowIdx++;
            });
        });
        sheet.columns.forEach(col => col.width = 18);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `Reporte_General_Consolidado_${new Date().toISOString().split('T')[0]}.xlsx`;

    const { saveFile } = await import('./mobileFileSaver');
    await saveFile(filename, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};
