import * as XLSX from 'xlsx';
import { ReporteActividades } from '../types/reporte';
import { Vehiculo, Proyecto } from '../types/gestion';
import { prepararDatosReporte, prepararDatosVehiculos, prepararDatosGeneral } from './reportGenerator';

// Función para generar y descargar un archivo Excel a partir de un reporte
export const generarExcelReporte = (reporte: ReporteActividades) => {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    const datos = prepararDatosReporte(reporte);

    // Crear array para una sola hoja con todas las secciones
    const allData: any[] = [];

    // === INFORMACIÓN GENERAL ===
    allData.push(['INFORMACIÓN GENERAL', '', '', '', '', '', '', '', '']); // Título principal
    allData.push(['Campo', 'Valor', '', '', '', '', '', '', '']);
    allData.push(['Fecha', new Date(reporte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }), '', '', '', '', '', '', '']);
    allData.push(['Turno', reporte.turno === 'primer' ? 'PRIMER TURNO' : 'SEGUNDO TURNO', '', '', '', '', '', '', '']);
    allData.push(['Ubicación', reporte.ubicacion, '', '', '', '', '', '', '']);
    allData.push(['Zona de Trabajo', typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'N/A'), '', '', '', '', '', '', '']);
    allData.push(['Sección de Trabajo', typeof reporte.seccionTrabajo === 'string' ? reporte.seccionTrabajo : (reporte.seccionTrabajo?.seccionNombre || 'N/A'), '', '', '', '', '', '', '']);
    allData.push(['Jefe de Frente', reporte.jefeFrente, '', '', '', '', '', '', '']);
    allData.push(['Sobrestante', reporte.sobrestante, '', '', '', '', '', '', '']);
    allData.push(['', '', '', '', '', '', '', '', '']); // Línea en blanco

    // === CONTROL DE ACARREO ===
    if (datos.controlAcarreo.length) {
        allData.push(['CONTROL DE ACARREO', '', '', '', '', '', '', '', '']);
        allData.push(['No.', 'Material', 'No. Viaje', 'Capacidad', 'Vol. Suelto', 'Capa No.', 'Elevación Ariza', 'Capa Origen', 'Destino']);
        datos.controlAcarreo.forEach((row: any) => {
            allData.push(row);
        });
        allData.push(['', '', '', '', '', '', '', '', '']); // Línea en blanco
    }

    // === CONTROL DE MATERIAL ===
    if (datos.controlMaterial.length) {
        allData.push(['CONTROL DE MATERIAL', '', '', '', '', '', '', '', '']);
        allData.push(['Material', 'Unidad', 'Cantidad', 'Zona', 'Elevación', '', '', '', '']);
        datos.controlMaterial.forEach((row: any) => {
            allData.push([...row, '', '', '', '']); // Rellenar columnas vacías
        });
        allData.push(['', '', '', '', '', '', '', '', '']); // Línea en blanco
    }

    // === CONTROL DE AGUA ===
    if (datos.controlAgua.length) {
        allData.push(['CONTROL DE AGUA', '', '', '', '', '', '', '', '']);
        allData.push(['No. Económico', 'Viajes', 'Capacidad', 'Volumen', 'Origen', 'Destino', '', '', '']);
        datos.controlAgua.forEach((row: any) => {
            allData.push([...row, '', '', '']); // Rellenar columnas vacías
        });
        allData.push(['', '', '', '', '', '', '', '', '']); // Línea en blanco
    }

    // === CONTROL DE MAQUINARIA ===
    if (datos.controlMaquinaria.length) {
        allData.push(['CONTROL DE MAQUINARIA', '', '', '', '', '', '', '', '']);
        allData.push(['Tipo', 'No. Económico', 'H. Inicial', 'H. Final', 'H. Operación', 'Operador', 'Actividad', '', '']);
        datos.controlMaquinaria.forEach((row: any) => {
            allData.push([...row, '', '']); // Rellenar columnas vacías
        });
        allData.push(['', '', '', '', '', '', '', '', '']); // Línea en blanco
    }

    // === OBSERVACIONES ===
    if (reporte.observaciones) {
        allData.push(['OBSERVACIONES', '', '', '', '', '', '', '', '']);
        allData.push([reporte.observaciones, '', '', '', '', '', '', '', '']);
    }

    // Crear la hoja única
    const worksheet = XLSX.utils.aoa_to_sheet(allData);

    // Configurar anchos de columna para mejor visualización
    const columnWidths = [
        { wch: 15 },  // Columna A
        { wch: 20 },  // Columna B
        { wch: 12 },  // Columna C
        { wch: 12 },  // Columna D
        { wch: 12 },  // Columna E
        { wch: 12 },  // Columna F
        { wch: 15 },  // Columna G
        { wch: 15 },  // Columna H
        { wch: 15 }   // Columna I
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Completo');

    const fechaArchivo = new Date(reporte.fecha).toISOString().split('T')[0];
    const zonaNombre = typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'Zona');
    const zona = zonaNombre.replace(/\s+/g, '_').substring(0, 20);
    const filename = `Reporte_${fechaArchivo}_${zona}.xlsx`;

    XLSX.writeFile(workbook, filename);
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
