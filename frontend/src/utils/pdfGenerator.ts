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

    const ORANGE = "rgb(255, 140, 0)";
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
        const pageNumber = doc.internal.getNumberOfPages();

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
        ["Zona de Trabajo:", reporte.zonaTrabajo],
        ["Sección de Trabajo:", reporte.seccionTrabajo],
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
    if (reporte.controlAcarreo?.length)
        renderTable(
            "CONTROL DE ACARREOS",
            [["Material", "No. Viaje", "Capacidad", "Vol. Suelto", "Capa", "Ariza", "Origen", "Destino"]],
            reporte.controlAcarreo.map((i) => [
                i.material,
                i.noViaje,
                i.capacidad,
                i.volSuelto,
                i.capaNo,
                i.elevacionAriza,
                i.capaOrigen,
                i.destino,
            ])
        );

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

    if (reporte.controlAgua?.length)
        renderTable(
            "CONTROL DE AGUA",
            [["No. Económico", "Viaje", "Capacidad", "Volumen", "Origen", "Destino"]],
            reporte.controlAgua.map((i) => [
                i.noEconomico,
                i.viaje,
                i.capacidad,
                i.volumen,
                i.origen,
                i.destino,
            ])
        );

    if (reporte.controlMaquinaria?.length)
        renderTable(
            "CONTROL DE MAQUINARIA",
            [["Tipo", "No. Económico", "Horómetro Inicial", "Horómetro Final", "Horas", "Operador", "Actividad"]],
            reporte.controlMaquinaria.map((i) => [
                i.tipo,
                i.numeroEconomico,
                i.horometroInicial,
                i.horometroFinal,
                i.horasOperacion,
                i.operador,
                i.actividad,
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
    const zona = reporte.zonaTrabajo.replace(/\s+/g, "_").substring(0, 20);
    const filename = `Reporte_${fechaArchivo}_${zona}.pdf`;

    doc.save(filename);
};
