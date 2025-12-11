import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../Logo.png"; // AJUSTA la ruta
import { ReporteActividades } from "../types/reporte";

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
            [["Material", "No. Viaje", "Capacidad", "Vol. Suelto", "No.Economico", "Elevación", "Origen", "Destino"]],
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
