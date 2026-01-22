/**
 * Delivery Schedule PDF Generator
 * Creates professional delivery timeline PDFs based on service type
 */

import { jsPDF } from "jspdf";
import type {
  ScheduleInput,
  ScheduleResult,
  ScheduleTimelineItem,
  ScheduleServiceType,
  ScheduleModality,
  GenerationResult,
} from "../types";

// Constants
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  primary: [30, 30, 30] as [number, number, number], // Almost black
  secondary: [107, 114, 128] as [number, number, number], // Gray
  accent: [16, 185, 129] as [number, number, number], // Green
  text: [55, 65, 81] as [number, number, number], // Dark gray
  lightText: [156, 163, 175] as [number, number, number], // Light gray
  border: [229, 231, 235] as [number, number, number], // Very light gray
  background: [249, 250, 251] as [number, number, number], // Almost white
  white: [255, 255, 255] as [number, number, number],
  milestoneBackground: [240, 240, 240] as [number, number, number],
};

const WEEKDAYS = [
  "DOMINGO",
  "SEGUNDA",
  "TERÇA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SÁBADO",
];

const SERVICE_LABELS: Record<ScheduleServiceType, string> = {
  decorexpress: "DECOR EXPRESS",
  projetexpress: "PROJET EXPRESS",
  produzexpress: "PRODUZ EXPRESS",
  consultexpress: "CONSULT EXPRESS",
};

const SERVICE_MEETINGS: Record<ScheduleServiceType, string> = {
  decorexpress: "3-4",
  projetexpress: "5+",
  produzexpress: "1-2",
  consultexpress: "1",
};

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add business days to a date (skip weekends)
 */
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++;
    }
  }
  return result;
}

/**
 * Format date as DD/MM
 */
function formatDateShort(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/**
 * Generate timeline based on service type
 */
export function generateScheduleTimeline(
  input: ScheduleInput
): ScheduleResult {
  const { serviceType, modality, environments, startDate } = input;
  const start = new Date(startDate);
  const items: ScheduleTimelineItem[] = [];

  const createItem = (
    date: Date,
    title: string,
    description: string,
    milestone = false
  ): ScheduleTimelineItem => ({
    date,
    dateFormatted: formatDateShort(date),
    weekday: WEEKDAYS[date.getDay()],
    title,
    description,
    milestone,
  });

  switch (serviceType) {
    case "consultexpress": {
      const questionario = addBusinessDays(start, 2);
      const reuniao = addDays(questionario, 7);
      const entregaFinal = addDays(reuniao, 7);

      items.push(
        createItem(start, "INÍCIO DA CONSULTORIA", "Pagamento confirmado", true),
        createItem(
          questionario,
          "PRAZO: QUESTIONÁRIO PRÉ-BRIEFING",
          "Envio do formulário preenchido"
        ),
        createItem(
          reuniao,
          "REUNIÃO DE CONSULTORIA",
          modality === "presencial" ? "Presencial" : "Online",
          true
        ),
        createItem(
          entregaFinal,
          "ENTREGA DO MATERIAL",
          "Material adicional (se contratado)",
          true
        )
      );
      break;
    }

    case "produzexpress": {
      const questionario = addBusinessDays(start, 2);
      const briefing = addDays(questionario, 5);
      const diasProducao = environments >= 3 ? 15 : 10;
      const producao = addDays(briefing, diasProducao);

      items.push(
        createItem(start, "INÍCIO DO SERVIÇO", "Pagamento confirmado", true),
        createItem(
          questionario,
          "PRAZO: QUESTIONÁRIO PRÉ-BRIEFING",
          "Envio do formulário preenchido"
        ),
        createItem(
          briefing,
          "REUNIÃO DE BRIEFING",
          "Alinhamento do que será feito",
          true
        ),
        createItem(producao, "DIA DE PRODUÇÃO", "Ambiente finalizado!", true)
      );
      break;
    }

    case "decorexpress": {
      const questionario = addBusinessDays(start, 2);
      const medicao =
        modality === "presencial"
          ? addDays(questionario, 5)
          : addBusinessDays(questionario, 3);
      const briefing = addDays(medicao, 3);
      const projeto3d = addBusinessDays(
        briefing,
        modality === "presencial" ? 21 : 15
      );
      const apresentacao = addDays(projeto3d, 2);
      const ajustes = addBusinessDays(apresentacao, 5);
      const entregaFinal = addDays(ajustes, 2);

      items.push(
        createItem(start, "INÍCIO DO PROJETO", "Pagamento confirmado", true),
        createItem(
          questionario,
          "PRAZO: QUESTIONÁRIO PRÉ-BRIEFING",
          "Envio do formulário preenchido"
        ),
        createItem(
          medicao,
          modality === "presencial"
            ? "VISITA TÉCNICA + MEDIÇÃO"
            : "PRAZO: ENVIO DAS MEDIDAS",
          modality === "presencial" ? "Presencial no local" : "Cliente envia medidas",
          modality === "presencial"
        ),
        createItem(
          briefing,
          "REUNIÃO DE BRIEFING",
          "Alinhamento de expectativas",
          true
        ),
        createItem(
          projeto3d,
          "PROJETO 3D PRONTO",
          "Desenvolvimento concluído",
          true
        ),
        createItem(
          apresentacao,
          "REUNIÃO DE APRESENTAÇÃO",
          "Apresentação do projeto 3D"
        ),
        createItem(ajustes, "PRAZO: AJUSTES", "Até 2 rodadas inclusos"),
        createItem(
          entregaFinal,
          "ENTREGA FINAL",
          "Projeto + Manual + Lista de Compras",
          true
        )
      );
      break;
    }

    case "projetexpress": {
      const questionario = addBusinessDays(start, 2);
      const medicao = addDays(questionario, 5);
      const briefing = addDays(medicao, 3);
      const projeto3d = addBusinessDays(briefing, 28);
      const apresentacao3d = addDays(projeto3d, 2);
      const executivo = addBusinessDays(apresentacao3d, 25);
      const entregaExecutivo = addDays(executivo, 2);
      const entregaFinal = addDays(entregaExecutivo, 5);

      items.push(
        createItem(start, "INÍCIO DO PROJETO", "Pagamento confirmado", true),
        createItem(
          questionario,
          "PRAZO: QUESTIONÁRIO PRÉ-BRIEFING",
          "Envio do formulário preenchido"
        ),
        createItem(
          medicao,
          "VISITA TÉCNICA + MEDIÇÃO",
          "Presencial no local",
          true
        ),
        createItem(briefing, "REUNIÃO DE BRIEFING", "Alinhamento completo", true),
        createItem(
          projeto3d,
          "PROJETO 3D PRONTO",
          "Desenvolvimento concluído",
          true
        ),
        createItem(
          apresentacao3d,
          "REUNIÃO DE APRESENTAÇÃO 3D",
          "Apresentação e aprovação"
        ),
        createItem(
          executivo,
          "PROJETO EXECUTIVO PRONTO",
          "Todos os técnicos finalizados",
          true
        ),
        createItem(
          entregaExecutivo,
          "REUNIÃO DE ENTREGA EXECUTIVO",
          "Orientações para obra"
        ),
        createItem(
          entregaFinal,
          "ENTREGA FINAL COMPLETA",
          "3D + Executivo + Manual + ART",
          true
        )
      );
      break;
    }
  }

  const totalDays =
    items.length > 0
      ? Math.ceil(
          (items[items.length - 1].date.getTime() - items[0].date.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return {
    timeline: items,
    totalDays,
    meetingsCount: SERVICE_MEETINGS[serviceType],
    finalDeliveryDate:
      items.length > 0 ? items[items.length - 1].dateFormatted : "",
  };
}

/**
 * Generate delivery schedule PDF
 */
export async function generateSchedulePDF(
  input: ScheduleInput
): Promise<GenerationResult<Buffer>> {
  try {
    const { clientName, serviceType, modality, environments, logoUrl } = input;

    // Generate timeline
    const scheduleResult = generateScheduleTimeline(input);
    const { timeline, totalDays, meetingsCount, finalDeliveryDate } = scheduleResult;

    if (timeline.length === 0) {
      return {
        success: false,
        error: "No timeline items generated",
      };
    }

    // Convert logo if provided
    let logoData: string | undefined;
    if (logoUrl) {
      try {
        const response = await fetch(logoUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          logoData = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
        }
      } catch {
        // Continue without logo
      }
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 0;

    // ==========================================================================
    // Header (black background)
    // ==========================================================================
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, PAGE_WIDTH, 35, "F");

    // Logo or text
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", MARGIN, 12, 40, 12);
      } catch {
        doc.setFontSize(18);
        doc.setTextColor(...COLORS.white);
        doc.setFont("helvetica", "bold");
        doc.text("ARQEXPRESS", MARGIN, 22);
      }
    } else {
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.white);
      doc.setFont("helvetica", "bold");
      doc.text("ARQEXPRESS", MARGIN, 22);
    }

    // Service name
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "normal");
    doc.text(SERVICE_LABELS[serviceType], PAGE_WIDTH - MARGIN, 22, {
      align: "right",
    });

    // ==========================================================================
    // Title Section
    // ==========================================================================
    y = 50;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "normal");
    doc.text("CRONOGRAMA DE ENTREGAS", PAGE_WIDTH / 2, y, { align: "center" });

    y += 12;
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(clientName.toUpperCase(), PAGE_WIDTH / 2, y, { align: "center" });

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "normal");
    const envText = `${environments} ambiente${environments > 1 ? "s" : ""}`;
    doc.text(`${envText} • ${modality.toUpperCase()}`, PAGE_WIDTH / 2, y, {
      align: "center",
    });

    // ==========================================================================
    // Timeline
    // ==========================================================================
    y += 20;

    // Column widths
    const dateColWidth = 25;
    const titleColX = MARGIN + dateColWidth + 10;

    timeline.forEach((item, index) => {
      // Check for page break
      if (y > PAGE_HEIGHT - 40) {
        doc.addPage();
        y = 30;
      }

      const itemHeight = 18;

      // Milestone background
      if (item.milestone) {
        doc.setFillColor(...COLORS.milestoneBackground);
        doc.rect(MARGIN - 5, y - 5, CONTENT_WIDTH + 10, itemHeight, "F");
      }

      // Date
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.text(item.dateFormatted, MARGIN, y);

      // Weekday
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont("helvetica", "normal");
      doc.text(item.weekday, MARGIN, y + 5);

      // Title
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.text(item.title, titleColX, y);

      // Description
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont("helvetica", "normal");
      doc.text(item.description, titleColX, y + 5);

      // Separator line (except for last item)
      if (index < timeline.length - 1) {
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y + 12, PAGE_WIDTH - MARGIN, y + 12);
      }

      y += itemHeight + 2;
    });

    // ==========================================================================
    // Summary Footer
    // ==========================================================================
    y = Math.max(y + 10, PAGE_HEIGHT - 60);

    // Summary box
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 35, 3, 3, "F");

    y += 12;
    const colWidth = CONTENT_WIDTH / 3;

    // Total days
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text(totalDays.toString(), MARGIN + colWidth / 2, y, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("DIAS TOTAIS", MARGIN + colWidth / 2, y + 8, { align: "center" });

    // Meetings
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(meetingsCount, MARGIN + colWidth + colWidth / 2, y, {
      align: "center",
    });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("REUNIÕES", MARGIN + colWidth + colWidth / 2, y + 8, {
      align: "center",
    });

    // Final delivery
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(finalDeliveryDate, MARGIN + colWidth * 2 + colWidth / 2, y, {
      align: "center",
    });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("ENTREGA", MARGIN + colWidth * 2 + colWidth / 2, y + 8, {
      align: "center",
    });

    // ==========================================================================
    // Footer tagline
    // ==========================================================================
    y += 25;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text("ARQUITETURA, SEM COMPLICAR.", PAGE_WIDTH / 2, y, {
      align: "center",
    });

    // Generate buffer
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    const filename = `CRONOGRAMA_${SERVICE_LABELS[serviceType].replace(" ", "_")}_${clientName.toUpperCase().replace(/\s+/g, "_")}.pdf`;

    return {
      success: true,
      data: buffer,
      filename,
      mimeType: "application/pdf",
    };
  } catch (error) {
    console.error("Error generating schedule PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate PDF",
    };
  }
}
