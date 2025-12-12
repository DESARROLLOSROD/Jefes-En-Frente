import * as XLSX from 'xlsx';
import { ReporteActividades } from '../types/reporte';
import { Vehiculo, Proyecto } from '../types/gestion';
import { prepararDatosReporte, prepararDatosVehiculos, prepararDatosGeneral } from './reportGenerator';

// Función para generar y descargar un archivo Excel a partir de un reporte
export const generarExcelReporte = (reporte: ReporteActividades, nombreProyecto: string) => {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    const datos = prepararDatosReporte(reporte);

    // Hoja de Información General
    const infoSheet = XLSX.utils.json_to_sheet([
        { Categoria: 'Fecha', Valor: new Date(reporte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }) },
        { Categoria: 'Turno', Valor: reporte.turno === 'primer' ? 'PRIMER TURNO' : 'SEGUNDO TURNO' },
        { Categoria: 'Ubicación', Valor: reporte.ubicacion },
        { Categoria: 'Zona de Trabajo', Valor: typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'N/A') },
        { Categoria: 'Sección de Trabajo', Valor: typeof reporte.seccionTrabajo === 'string' ? reporte.seccionTrabajo : (reporte.seccionTrabajo?.seccionNombre || 'N/A') },
        { Categoria: 'Jefe de Frente', Valor: reporte.jefeFrente },
        { Categoria: 'Sobrestante', Valor: reporte.sobrestante },
    ]);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info General');
    if (datos.controlAcarreo.length) {
        const acarreoSheet = XLSX.utils.json_to_sheet(datos.controlAcarreo);
        XLSX.utils.book_append_sheet(workbook, acarreoSheet, 'Control Acarreo');
    }
    if (datos.controlMaterial.length) {
        const materialSheet = XLSX.utils.json_to_sheet(datos.controlMaterial);
        XLSX.utils.book_append_sheet(workbook, materialSheet, 'Control Material');
    }
    if (datos.controlAgua.length) {
        const aguaSheet = XLSX.utils.json_to_sheet(datos.controlAgua);
        XLSX.utils.book_append_sheet(workbook, aguaSheet, 'Control Agua');
    }
    if (datos.controlMaquinaria.length) {
        const maquinariaSheet = XLSX.utils.json_to_sheet(datos.controlMaquinaria);
        XLSX.utils.book_append_sheet(workbook, maquinariaSheet, 'Control Maquinaria');
    }
    if (reporte.observaciones) {
        const observacionesSheet = XLSX.utils.json_to_sheet([{ Observaciones: reporte.observaciones }]);
        XLSX.utils.book_append_sheet(workbook, observacionesSheet, 'Observaciones');
    }

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
