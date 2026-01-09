import { ReporteActividades } from '../types/reporte';
import { Vehiculo, Proyecto } from '../types/gestion';

// Prepara los datos del reporte para ser usados por los generadores de PDF y Excel
export const prepararDatosReporte = (reporte: ReporteActividades) => {
    const controlAcarreo: any[] = reporte.controlAcarreo?.length
        ? reporte.controlAcarreo.map((i, index) => [
            (index + 1).toString(),
            i.material,
            i.noViaje.toString(),
            `${i.capacidad} m³`,
            `${i.volSuelto} m³`,
            i.capaNo,
            i.elevacionAriza,
            i.capaOrigen,
            i.destino,
        ])
        : [];

    const totalVolumenAcarreo = reporte.controlAcarreo
        ?.reduce((sum, item) => sum + (parseFloat(item.volSuelto) || 0), 0)
        .toFixed(2);

    if (controlAcarreo.length > 0) {
        controlAcarreo.push([
            '',
            { content: 'TOTAL VOLUMEN:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } } as any,
            { content: `${totalVolumenAcarreo} m³`, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } } as any,
            '', '', '', ''
        ]);
    }

    const controlMaterial = reporte.controlMaterial?.length
        ? reporte.controlMaterial.map(i => [
            i.material,
            i.unidad,
            i.cantidad,
            i.zona,
            i.elevacion,
        ])
        : [];

    const controlAgua = reporte.controlAgua?.length
        ? reporte.controlAgua.map(i => [
            i.noEconomico,
            i.viaje.toString(),
            `${i.capacidad} m³`,
            `${i.volumen} m³`,
            i.origen,
            i.destino,
        ])
        : [];

    const totalVolumenAgua = reporte.controlAgua
        ?.reduce((sum, item) => sum + (parseFloat(item.volumen) || 0), 0)
        .toFixed(2);

    if (controlAgua.length > 0) {
        (controlAgua as any[]).push([
            { content: 'TOTAL VOLUMEN:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } } as any,
            { content: `${totalVolumenAgua} m³`, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } } as any,
            '', ''
        ]);
    }

    const controlMaquinaria = reporte.controlMaquinaria?.length
        ? reporte.controlMaquinaria.map(i => [
            i.tipo || '-',
            i.numeroEconomico || '-',
            i.horometroInicial?.toString() || '0',
            i.horometroFinal?.toString() || '0',
            i.horasOperacion?.toString() || '0',
            i.operador || '-',
            i.actividad || '-',
        ])
        : [];

    const controlPersonal = reporte.personalAsignado?.length
        ? reporte.personalAsignado.map(p => [
            p.personal?.nombreCompleto || 'N/A',
            p.cargo?.nombre || 'N/A',
            p.actividadRealizada || '-',
            p.horasTrabajadas.toString(),
            p.observaciones || '-'
        ])
        : [];

    return {
        controlAcarreo,
        controlMaterial,
        controlAgua,
        controlMaquinaria,
        controlPersonal
    };
};

export const prepararDatosVehiculos = (vehiculos: Vehiculo[]) => {
    return vehiculos.map(v => ({
        Nombre: v.nombre,
        Tipo: v.tipo,
        'No. Económico': v.noEconomico,
        'Horómetro Inicial': v.horometroInicial,
        'Horómetro Final': v.horometroFinal || '-',
        'Horas Operación': v.horasOperacion || '0',
        'Proyectos': Array.isArray(v.proyectos) ? v.proyectos.map((p: any) => (typeof p === 'object' && p.nombre ? p.nombre : String(p))).join(', ') : 'N/A'
    }));
};

export const prepararDatosGeneral = (reportes: ReporteActividades[], proyectos: Proyecto[]) => {
    const proyectosMap = new Map(proyectos.map(p => [p._id, p.nombre]));
    return reportes.map(r => ({
        Proyecto: proyectosMap.get(r.proyectoId) || 'N/A',
        Fecha: new Date(r.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' }),
        Turno: r.turno,
        Ubicación: r.ubicacion,
        'Zona de Trabajo': typeof r.zonaTrabajo === 'string' ? r.zonaTrabajo : (r.zonaTrabajo?.zonaNombre || 'N/A'),
        'Jefe de Frente': r.jefeFrente,
        Sobrestante: r.sobrestante,
        Observaciones: r.observaciones || ''
    }));
};
