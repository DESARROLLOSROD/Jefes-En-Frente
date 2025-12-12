import { EstadisticasResponse } from '../services/estadisticas.service';

export const generarExcelEstadisticas = async (estadisticas: EstadisticasResponse, nombreProyecto?: string) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();

    // Colores corporativos
    const BLUE = '4C4EC9';
    const LIGHT_BLUE = 'E3F2FD';
    const DARK = '1A1A1A';

    // =============== HOJA 1: RESUMEN ===============
    const resumenSheet = workbook.addWorksheet('Resumen', {
        properties: { tabColor: { argb: `FF${BLUE}` } }
    });

    let currentRow = 1;

    // Título principal
    resumenSheet.mergeCells(`A${currentRow}:D${currentRow}`);
    const titleCell = resumenSheet.getCell(`A${currentRow}`);
    titleCell.value = '📊 ANÁLISIS Y ESTADÍSTICAS';
    titleCell.font = { bold: true, size: 18, color: { argb: `FF${DARK}` } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${LIGHT_BLUE}` } };
    resumenSheet.getRow(currentRow).height = 30;
    currentRow += 2;

    // Información general
    const addInfoRow = (label: string, value: string) => {
        resumenSheet.getCell(`A${currentRow}`).value = label;
        resumenSheet.getCell(`A${currentRow}`).font = { bold: true };
        resumenSheet.getCell(`B${currentRow}`).value = value;
        currentRow++;
    };

    addInfoRow('Proyecto:', nombreProyecto || 'TODOS LOS PROYECTOS');
    const fechaInicio = new Date(estadisticas.rangoFechas.inicio).toLocaleDateString('es-MX');
    const fechaFin = new Date(estadisticas.rangoFechas.fin).toLocaleDateString('es-MX');
    addInfoRow('Período:', `${fechaInicio} - ${fechaFin}`);
    addInfoRow('Total de Reportes:', estadisticas.totalReportes.toString());
    addInfoRow('Total Volumen Acarreo:', `${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`);
    addInfoRow('Total Volumen Agua:', `${estadisticas.agua.volumenTotal.toLocaleString()} m³`);
    addInfoRow('Total Horas Vehículos:', `${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`);

    // Ajustar anchos
    resumenSheet.getColumn('A').width = 25;
    resumenSheet.getColumn('B').width = 40;

    // =============== HOJA 2: CONTROL DE ACARREO ===============
    if (estadisticas.acarreo.materiales.length > 0) {
        const acarreoSheet = workbook.addWorksheet('Control de Acarreo', {
            properties: { tabColor: { argb: `FF${BLUE}` } }
        });

        currentRow = 1;

        // Título
        acarreoSheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const titleAcarreo = acarreoSheet.getCell(`A${currentRow}`);
        titleAcarreo.value = '📦 CONTROL DE ACARREO';
        titleAcarreo.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        titleAcarreo.alignment = { horizontal: 'center', vertical: 'middle' };
        titleAcarreo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        acarreoSheet.getRow(currentRow).height = 25;
        currentRow += 2;

        // Información
        acarreoSheet.getCell(`A${currentRow}`).value = 'Total Volumen:';
        acarreoSheet.getCell(`A${currentRow}`).font = { bold: true };
        acarreoSheet.getCell(`B${currentRow}`).value = `${estadisticas.acarreo.totalVolumen.toLocaleString()} m³`;
        currentRow++;
        acarreoSheet.getCell(`A${currentRow}`).value = 'Material más movido:';
        acarreoSheet.getCell(`A${currentRow}`).font = { bold: true };
        acarreoSheet.getCell(`B${currentRow}`).value = estadisticas.acarreo.materialMasMovido;
        currentRow += 2;

        // Tabla
        const headerRow = acarreoSheet.getRow(currentRow);
        headerRow.values = ['Material', 'Volumen (m³)', 'Porcentaje'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 20;
        currentRow++;

        estadisticas.acarreo.materiales.forEach((material) => {
            const row = acarreoSheet.getRow(currentRow);
            row.values = [material.nombre, material.volumen, `${material.porcentaje}%`];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        // Ajustar anchos
        acarreoSheet.getColumn('A').width = 30;
        acarreoSheet.getColumn('B').width = 20;
        acarreoSheet.getColumn('C').width = 15;
    }

    // =============== HOJA 3: CONTROL DE MATERIAL ===============
    if (estadisticas.material.materiales.length > 0) {
        const materialSheet = workbook.addWorksheet('Control de Material', {
            properties: { tabColor: { argb: `FF${BLUE}` } }
        });

        currentRow = 1;

        // Título
        materialSheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const titleMaterial = materialSheet.getCell(`A${currentRow}`);
        titleMaterial.value = '🏗️ CONTROL DE MATERIAL';
        titleMaterial.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        titleMaterial.alignment = { horizontal: 'center', vertical: 'middle' };
        titleMaterial.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        materialSheet.getRow(currentRow).height = 25;
        currentRow += 2;

        // Información
        materialSheet.getCell(`A${currentRow}`).value = 'Material más utilizado:';
        materialSheet.getCell(`A${currentRow}`).font = { bold: true };
        materialSheet.getCell(`B${currentRow}`).value = estadisticas.material.materialMasUtilizado;
        currentRow += 2;

        // Tabla
        const headerRow = materialSheet.getRow(currentRow);
        headerRow.values = ['Material', 'Cantidad', 'Unidad'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 20;
        currentRow++;

        estadisticas.material.materiales.forEach((material) => {
            const row = materialSheet.getRow(currentRow);
            row.values = [material.nombre, material.cantidad, material.unidad];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        // Ajustar anchos
        materialSheet.getColumn('A').width = 30;
        materialSheet.getColumn('B').width = 20;
        materialSheet.getColumn('C').width = 15;
    }

    // =============== HOJA 4: CONTROL DE AGUA ===============
    if (estadisticas.agua.porOrigen.length > 0) {
        const aguaSheet = workbook.addWorksheet('Control de Agua', {
            properties: { tabColor: { argb: `FF${BLUE}` } }
        });

        currentRow = 1;

        // Título
        aguaSheet.mergeCells(`A${currentRow}:C${currentRow}`);
        const titleAgua = aguaSheet.getCell(`A${currentRow}`);
        titleAgua.value = '💧 CONTROL DE AGUA';
        titleAgua.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        titleAgua.alignment = { horizontal: 'center', vertical: 'middle' };
        titleAgua.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        aguaSheet.getRow(currentRow).height = 25;
        currentRow += 2;

        // Información
        aguaSheet.getCell(`A${currentRow}`).value = 'Total Volumen:';
        aguaSheet.getCell(`A${currentRow}`).font = { bold: true };
        aguaSheet.getCell(`B${currentRow}`).value = `${estadisticas.agua.volumenTotal.toLocaleString()} m³`;
        currentRow++;
        aguaSheet.getCell(`A${currentRow}`).value = 'Origen más utilizado:';
        aguaSheet.getCell(`A${currentRow}`).font = { bold: true };
        aguaSheet.getCell(`B${currentRow}`).value = estadisticas.agua.origenMasUtilizado;
        currentRow += 2;

        // Tabla
        const headerRow = aguaSheet.getRow(currentRow);
        headerRow.values = ['Origen', 'Volumen (m³)', 'Porcentaje'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 20;
        currentRow++;

        estadisticas.agua.porOrigen.forEach((origen) => {
            const row = aguaSheet.getRow(currentRow);
            row.values = [origen.origen, origen.volumen, `${origen.porcentaje}%`];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        // Ajustar anchos
        aguaSheet.getColumn('A').width = 30;
        aguaSheet.getColumn('B').width = 20;
        aguaSheet.getColumn('C').width = 15;
    }

    // =============== HOJA 5: VEHÍCULOS ===============
    if (estadisticas.vehiculos.vehiculos.length > 0) {
        const vehiculosSheet = workbook.addWorksheet('Vehículos', {
            properties: { tabColor: { argb: `FF${BLUE}` } }
        });

        currentRow = 1;

        // Título
        vehiculosSheet.mergeCells(`A${currentRow}:D${currentRow}`);
        const titleVehiculos = vehiculosSheet.getCell(`A${currentRow}`);
        titleVehiculos.value = '🚜 VEHÍCULOS';
        titleVehiculos.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        titleVehiculos.alignment = { horizontal: 'center', vertical: 'middle' };
        titleVehiculos.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        vehiculosSheet.getRow(currentRow).height = 25;
        currentRow += 2;

        // Información
        vehiculosSheet.getCell(`A${currentRow}`).value = 'Total Horas:';
        vehiculosSheet.getCell(`A${currentRow}`).font = { bold: true };
        vehiculosSheet.getCell(`B${currentRow}`).value = `${estadisticas.vehiculos.totalHoras.toLocaleString()} hrs`;
        currentRow++;
        vehiculosSheet.getCell(`A${currentRow}`).value = 'Vehículo más utilizado:';
        vehiculosSheet.getCell(`A${currentRow}`).font = { bold: true };
        vehiculosSheet.getCell(`B${currentRow}`).value = estadisticas.vehiculos.vehiculoMasUtilizado;
        currentRow += 2;

        // Tabla
        const headerRow = vehiculosSheet.getRow(currentRow);
        headerRow.values = ['Vehículo', 'No. Económico', 'Horas', 'Porcentaje'];
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BLUE}` } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 20;
        currentRow++;

        estadisticas.vehiculos.vehiculos.forEach((vehiculo) => {
            const row = vehiculosSheet.getRow(currentRow);
            row.values = [vehiculo.nombre, vehiculo.noEconomico, vehiculo.horasOperacion, `${vehiculo.porcentaje}%`];
            row.alignment = { horizontal: 'left', vertical: 'middle' };
            currentRow++;
        });

        // Ajustar anchos
        vehiculosSheet.getColumn('A').width = 30;
        vehiculosSheet.getColumn('B').width = 20;
        vehiculosSheet.getColumn('C').width = 15;
        vehiculosSheet.getColumn('D').width = 15;
    }

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
