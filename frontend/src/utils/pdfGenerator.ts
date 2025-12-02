import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../logo.png"; // AJUSTA la ruta
import { ReporteActividades } from "../types/reporte";

export const generarPDFReporte = (
    reporte: ReporteActividades,
    nombreProyecto: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const ORANGE = "rgb(76, 78, 201)";
    const DARK = "rgb(26,26,26)";
    const GRAY = "rgb(80,80,80)";

    let yPosition = 55;

    // ------------------------------------------------
    // HEADER CORPORATIVO
    // ------------------------------------------------
    doc.addImage(logo, "PNG", 13, 8, 32, 32);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(DARK);
    doc.text("REPORTE DE ACTIVIDADES DIARIAS", pageWidth / 1.80, 21, {
        align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(GRAY);
    doc.text(nombreProyecto.toUpperCase(), pageWidth / 2, 30, {
        align: "center",
    });

    // Línea corporativa
    doc.setDrawColor(ORANGE);
    doc.setLineWidth(1.5);
    doc.line(10, 42, pageWidth - 10, 42);

    // ------------------------------------------------
    // FOOTER CORPORATIVO (número de página)
    // ------------------------------------------------
    const addFooter = () => {
        const pageNumber = (doc as any).internal.getNumberOfPages();

        doc.setFontSize(9);
        doc.setTextColor(GRAY);
        doc.text(
            `Página ${pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
    };

    addFooter();

    // ------------------------------------------------
    // INFORMACIÓN GENERAL
    // ------------------------------------------------
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK);

    const fecha = new Date(reporte.fecha).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });

    doc.text("Fecha:", 15, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY);
    doc.text(fecha, 45, yPosition);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK);
    doc.text("Turno:", 120, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY);
    doc.text(
        reporte.turno === "primer" ? "PRIMER TURNO" : "SEGUNDO TURNO",
        150,
        yPosition
    );

    yPosition += 8;

    const infoItems = [
        ["Ubicación:", reporte.ubicacion],
        ["Zona de Trabajo:", reporte.zonaTrabajo?.zonaNombre || reporte.zonaTrabajo || 'N/A'],
        ["Sección de Trabajo:", reporte.seccionTrabajo?.seccionNombre || reporte.seccionTrabajo || 'N/A'],
        ["Jefe de Frente:", reporte.jefeFrente],
        ["Sobrestante:", reporte.sobrestante],
    ];

    infoItems.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK);
        doc.text(label, 15, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY);
        doc.text(value?.toString().toUpperCase() || "-", 60, yPosition);

        yPosition += 7;
    });

    yPosition += 5;

    // ------------------------------------------------
    // FUNCIÓN PARA GENERAR TABLAS CORPORATIVAS
    // ------------------------------------------------
    const renderTable = (title: string, head: string[][], body: any[][]) => {
        if (yPosition > 240) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK);
        doc.text(title, 15, yPosition);

        yPosition += 5;

        autoTable(doc, {
            startY: yPosition,
            head,
            body,
            theme: "grid",
            headStyles: {
                fillColor: ORANGE,
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: {
                fontSize: 9,
                textColor: DARK,
                cellPadding: 3,

            },
            margin: { left: 15, right: 15 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
    };

    // ------------------------------------------------
    // TABLAS
    // ------------------------------------------------
    if (reporte.controlAcarreo?.length) {
        // Calcular totales
        const totalVolumenAcarreo = reporte.controlAcarreo
            .reduce((sum, item) => sum + (parseFloat(item.volSuelto) || 0), 0)
            .toFixed(2);

        const bodyAcarreo: any[] = reporte.controlAcarreo.map((i) => [
            i.material,
            i.noViaje.toString(),
            `${i.capacidad} m³`,
            `${i.volSuelto} m³`,
            i.capaNo,
            i.elevacionAriza,
            i.capaOrigen,
            i.destino,
        ]);

        // Agregar fila de total
        bodyAcarreo.push([
            { content: 'TOTAL VOLUMEN:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
            { content: `${totalVolumenAcarreo} m³`, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } },
            '', '', '', ''
        ]);

        renderTable(
            "CONTROL DE ACARREOS",
            [["Material", "No. Viaje", "Capacidad", "Vol. Suelto", "Capa", "Elevación", "Origen", "Destino"]],
            bodyAcarreo
        );
    }

    if (reporte.controlMaterial?.length)
        renderTable(
            "CONTROL DE MATERIAL",
            [["Material", "Unidad", "Cantidad", "Zona", "Elevación"]],
            reporte.controlMaterial.map((i) => [
                i.material,
                i.unidad,
                i.cantidad,
                i.zona,
                i.elevacion,
            ])
        );

    if (reporte.controlAgua?.length) {
        const totalVolumenAgua = reporte.controlAgua
            .reduce((sum, item) => sum + (parseFloat(item.volumen) || 0), 0)
            .toFixed(2);

        const bodyAgua: any[] = reporte.controlAgua.map((i) => [
            i.noEconomico,
            i.viaje.toString(),
            `${i.capacidad} m³`,
            `${i.volumen} m³`,
            i.origen,
            i.destino,
        ]);

        bodyAgua.push([
            { content: 'TOTAL VOLUMEN:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
            { content: `${totalVolumenAgua} m³`, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } },
            '', ''
        ]);

        renderTable(
            "CONTROL DE AGUA",
            [["No. Económico", "Viaje", "Capacidad", "Volumen", "Origen", "Destino"]],
            bodyAgua
        );
    }

    if (reporte.controlMaquinaria?.length)
        renderTable(
            "CONTROL DE MAQUINARIA",
            [["Tipo", "No. Económico", "Horómetro Inicial", "Horómetro Final", "Horas", "Operador", "Actividad"]],
            reporte.controlMaquinaria.map((i) => [
                i.tipo || '-',
                i.numeroEconomico || '-',
                i.horometroInicial?.toString() || '0',
                i.horometroFinal?.toString() || '0',
                i.horasOperacion?.toString() || '0',
                i.operador || '-',
                i.actividad || '-',
            ])
        );

    // ------------------------------------------------
    // OBSERVACIONES
    // ------------------------------------------------
    if (reporte.observaciones) {
        if (yPosition > 240) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK);
        doc.setFontSize(13);
        doc.text("OBSERVACIONES", 15, yPosition);

        yPosition += 8;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY);
        doc.setFontSize(10);

        const textLines = doc.splitTextToSize(
            reporte.observaciones,
            pageWidth - 30
        );

        doc.text(textLines, 15, yPosition);
    }

    // ------------------------------------------------
    // GUARDAR ARCHIVO
    // ------------------------------------------------
    const fechaArchivo = new Date(reporte.fecha).toISOString().split("T")[0];
    const zonaNombre = typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'Zona');
    const zona = zonaNombre.replace(/\s+/g, "_").substring(0, 20);
    const filename = `Reporte_${fechaArchivo}_${zona}.pdf`;

    doc.save(filename);
};
