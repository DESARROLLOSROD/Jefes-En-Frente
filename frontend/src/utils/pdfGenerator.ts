import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../Logo.png"; // AJUSTA la ruta
import { ReporteActividades } from "../types/reporte";
import { prepararDatosReporte } from "./reportGenerator";

// Función auxiliar para dibujar el mapa con pines
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
            // Configurar tamaño del canvas
            canvas.width = img.width;
            canvas.height = img.height;

            // Dibujar el mapa
            ctx.drawImage(img, 0, 0);

            // Tamaño base del pin
            const pinSize = Math.max(img.width, img.height) * 0.03; // Reducido un poco para múltiples pines

            pines.forEach(pin => {
                // Calcular posición del pin en píxeles
                const pinXPx = (pin.pinX / 100) * img.width;
                const pinYPx = (pin.pinY / 100) * img.height;

                // Dibujar el pin
                ctx.beginPath();
                ctx.arc(pinXPx, pinYPx, pinSize, 0, Math.PI * 2);
                ctx.fillStyle = pin.color || '#EF4444'; // Color personalizado o rojo por defecto
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = pinSize * 0.2;
                ctx.stroke();

                // Círculo blanco interior
                ctx.beginPath();
                ctx.arc(pinXPx, pinYPx, pinSize * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                // Dibujar etiqueta si existe
                if (pin.etiqueta) {
                    ctx.font = `bold ${pinSize}px Arial`;
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = pinSize * 0.1;
                    ctx.textAlign = 'center';

                    // Contorno del texto para legibilidad
                    ctx.strokeText(pin.etiqueta, pinXPx, pinYPx - pinSize * 1.5);
                    ctx.fillText(pin.etiqueta, pinXPx, pinYPx - pinSize * 1.5);
                }
            });

            // Convertir canvas a base64
            const resultado = canvas.toDataURL('image/png').split(',')[1];
            resolve(resultado);
        };
        img.onerror = () => reject(new Error('Error al cargar la imagen del mapa'));
        img.src = `data:${mapaContentType};base64,${mapaBase64}`;
    });
};

export const generarPDFReporte = async (
    reporte: ReporteActividades,
    nombreProyecto: string,
    proyectoMapa?: { imagen: { data: string; contentType: string }; width: number; height: number }
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
        ["Zona de Trabajo:", typeof reporte.zonaTrabajo === 'string' ? reporte.zonaTrabajo : (reporte.zonaTrabajo?.zonaNombre || 'N/A')],
        ["Sección de Trabajo:", typeof reporte.seccionTrabajo === 'string' ? reporte.seccionTrabajo : (reporte.seccionTrabajo?.seccionNombre || 'N/A')],
        ["Jefe de Frente:", reporte.jefeFrente],
        ["Sobrestante:", reporte.sobrestante],
    ];

    infoItems.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK);
        doc.text(label, 15, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY);
        const valorTexto = typeof value === 'string' ? value : (value || 'N/A');
        doc.text(valorTexto.toString().toUpperCase() || "-", 60, yPosition);

        yPosition += 7;
    });

    yPosition += 5;

    // ------------------------------------------------
    // SECCIÓN DE MAPA CON PINES
    // ------------------------------------------------
    // Determinar qué pines dibujar
    let pinesParaDibujar: Array<{ pinX: number; pinY: number; etiqueta?: string; color?: string }> = [];

    if (reporte.pinesMapa && reporte.pinesMapa.length > 0) {
        pinesParaDibujar = reporte.pinesMapa;
    } else if (reporte.ubicacionMapa?.colocado) {
        pinesParaDibujar = [{
            pinX: reporte.ubicacionMapa.pinX,
            pinY: reporte.ubicacionMapa.pinY
        }];
    }

    if (proyectoMapa?.imagen?.data && pinesParaDibujar.length > 0) {
        if (yPosition > 180) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK);
        doc.text("UBICACIÓN EN MAPA DEL PROYECTO", 15, yPosition);

        yPosition += 5;

        try {
            const mapaConPines = await dibujarMapaConPines(
                proyectoMapa.imagen.data,
                proyectoMapa.imagen.contentType,
                pinesParaDibujar
            );

            // Calcular dimensiones para el PDF manteniendo el aspect ratio
            const maxWidth = pageWidth - 30;
            const maxHeight = 80;
            const aspectRatio = proyectoMapa.width / proyectoMapa.height;

            let imgWidth = maxWidth;
            let imgHeight = imgWidth / aspectRatio;

            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = imgHeight * aspectRatio;
            }

            doc.addImage(mapaConPines, 'PNG', 15, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;

            // Agregar texto de zona y sección debajo del mapa
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(DARK);
            const zonaTexto = `ZONA: ${reporte.zonaTrabajo?.zonaNombre || 'N/A'}`;
            const seccionTexto = `SECCIÓN: ${reporte.seccionTrabajo?.seccionNombre || 'N/A'}`;
            doc.text(`${zonaTexto} | ${seccionTexto}`, 15, yPosition);

            yPosition += 10;
        } catch (error) {
            console.error('Error al generar mapa con pines:', error);
        }
    }

    // ------------------------------------------------
    // FUNCIÓN PARA GENERAR TABLAS CORPORATIVAS
    // ------------------------------------------------
    const renderTable = (title: string, head: string[][], body: any[][]) => {
        if (yPosition > 240) {
            doc.addPage();
            addFooter();
            yPosition = 20;
        }

        // --- Custom Header Styling (Restoring Legacy Look) ---
        // Blue/Purple background rectangle
        doc.setFillColor(76, 78, 201); // #4C4EC9
        doc.rect(15, yPosition, pageWidth - 30, 8, 'F');

        // White text for title
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);

        // Centering text vertically in the 8-unit high rectangle
        doc.text(title.toUpperCase(), 18, yPosition + 5.5);

        yPosition += 8; // Move position below the header

        if (body.length === 0) {
            // "Sin registros" styling
            yPosition += 5; // Spacing before text
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(GRAY); // Gray color for placeholder

            // Centering "Sin registros" horizontally
            doc.text("Sin registros", pageWidth / 2, yPosition, { align: "center" });

            yPosition += 10; // Spacing after
            return;
        }

        doc.setTextColor(DARK); // Reset text color for table

        autoTable(doc, {
            startY: yPosition,
            head,
            body,
            theme: "grid",
            headStyles: {
                fillColor: [76, 78, 201], // Matches header color #4C4EC9
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: 'center' // Center header text
            },
            alternateRowStyles: {
                fillColor: [245, 245, 250] // Very light blue/gray for alternates
            },
            styles: {
                fontSize: 8, // Slightly smaller font for better fit
                textColor: DARK,
                cellPadding: 3,
                halign: 'center' // Default center alignment for data
            },
            columnStyles: {
                0: { halign: 'center' }, // Specific alignments if needed
                1: { halign: 'left' }    // Material/Description usually left-aligned
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
                // Ensure yPosition is updated correctly after autoTable
                if (data.cursor) {
                    yPosition = data.cursor.y + 10;
                }
            }
        });

        // Manually update yPosition as well just in case
        yPosition = (doc as any).lastAutoTable.finalY + 15;
    };

    // ------------------------------------------------
    // TABLAS
    // ------------------------------------------------
    const datos = prepararDatosReporte(reporte);

    renderTable(
        "CONTROL DE ACARREOS",
        [["#", "Material", "No. Viaje", "Capacidad", "Vol. Suelto", "Capa", "Elevación", "Origen", "Destino"]],
        datos.controlAcarreo
    );

    renderTable(
        "CONTROL DE MATERIAL",
        [["Material", "Unidad", "Cantidad", "Zona", "Elevación"]],
        datos.controlMaterial
    );

    renderTable(
        "CONTROL DE AGUA",
        [["No. Económico", "Viaje", "Capacidad", "Volumen", "Origen", "Destino"]],
        datos.controlAgua
    );

    renderTable(
        "CONTROL DE MAQUINARIA",
        [["Tipo", "No. Econ.", "Hor. Inicial", "Hor. Final", "Horas", "Operador", "Actividad"]],
        datos.controlMaquinaria
    );

    // @ts-ignore
    if (datos.controlPersonal && datos.controlPersonal.length) {
        renderTable(
            "CONTROL DE PERSONAL",
            [["Personal", "Cargo", "Actividad", "Horas", "Observaciones"]],
            // @ts-ignore
            datos.controlPersonal
        );
    }

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
