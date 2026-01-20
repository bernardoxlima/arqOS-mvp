/**
 * PDF Proposal Generator
 * Creates professional commercial proposals in PDF format
 */

import { jsPDF } from "jspdf";
import type { PDFProposalInput, GenerationResult } from "../types";

// Constants
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  primary: [30, 58, 95] as [number, number, number], // #1E3A5F
  secondary: [107, 114, 128] as [number, number, number], // #6B7280
  accent: [16, 185, 129] as [number, number, number], // #10B981
  text: [55, 65, 81] as [number, number, number], // #374151
  lightText: [156, 163, 175] as [number, number, number], // #9CA3AF
  border: [229, 231, 235] as [number, number, number], // #E5E7EB
  background: [249, 250, 251] as [number, number, number], // #F9FAFB
};

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format date
 */
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Add header to page
 */
function addHeader(doc: jsPDF, logoData?: string): void {
  // Logo placeholder (if provided)
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", MARGIN, 15, 40, 12);
    } catch {
      // Fallback to text
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.text("ArqExpress", MARGIN, 22);
    }
  } else {
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("ArqExpress", MARGIN, 22);
  }

  // Header line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 30, PAGE_WIDTH - MARGIN, 30);
}

/**
 * Add footer to page
 */
function addFooter(doc: jsPDF, pageNumber: number, totalPages: number): void {
  const y = PAGE_HEIGHT - 15;

  // Footer line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y - 5, PAGE_WIDTH - MARGIN, y - 5);

  // Page number
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.setFont("helvetica", "normal");
  doc.text(`Página ${pageNumber} de ${totalPages}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  // Company info
  doc.text("ArqExpress - Transformando espaços", MARGIN, y);
}

/**
 * Check if we need a new page and add one if necessary
 */
function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  neededSpace: number,
  logoData?: string
): number {
  if (currentY + neededSpace > PAGE_HEIGHT - 30) {
    doc.addPage();
    addHeader(doc, logoData);
    return 45; // Reset Y position after header
  }
  return currentY;
}

/**
 * Generate a commercial proposal PDF
 */
export async function generateProposalPDF(
  input: PDFProposalInput
): Promise<GenerationResult<Buffer>> {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      projectType,
      projectDescription,
      serviceType,
      totalValue,
      paymentTerms,
      validUntil,
      sections = [],
      includeTerms = true,
      logoUrl,
    } = input;

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

    let y = 40;

    // ==========================================================================
    // Page 1: Cover / Header
    // ==========================================================================
    addHeader(doc, logoData);

    // Title
    y = 50;
    doc.setFontSize(28);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("PROPOSTA COMERCIAL", PAGE_WIDTH / 2, y, { align: "center" });

    // Proposal info
    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${formatDate(new Date())}`, PAGE_WIDTH / 2, y, {
      align: "center",
    });

    if (validUntil) {
      y += 7;
      doc.text(`Válido até: ${formatDate(validUntil)}`, PAGE_WIDTH / 2, y, {
        align: "center",
      });
    }

    // ==========================================================================
    // Client Information
    // ==========================================================================
    y += 20;
    doc.setFillColor(...COLORS.background);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 50, 3, 3, "F");

    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Cliente", MARGIN + 10, y);

    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "normal");

    const clientInfo = [
      { label: "Nome", value: clientName },
      clientEmail && { label: "E-mail", value: clientEmail },
      clientPhone && { label: "Telefone", value: clientPhone },
      clientAddress && { label: "Endereço", value: clientAddress },
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    clientInfo.forEach((info) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${info.label}:`, MARGIN + 10, y);
      doc.setFont("helvetica", "normal");
      doc.text(info.value, MARGIN + 40, y);
      y += 7;
    });

    // ==========================================================================
    // Project Information
    // ==========================================================================
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text("Sobre o Projeto", MARGIN, y);

    y += 10;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);

    // Project type
    doc.setFont("helvetica", "bold");
    doc.text("Tipo de Projeto:", MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(projectType, MARGIN + 40, y);

    // Service type
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Serviço:", MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(serviceType, MARGIN + 40, y);

    // Description
    if (projectDescription) {
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Descrição:", MARGIN, y);
      y += 7;
      doc.setFont("helvetica", "normal");

      const descLines = doc.splitTextToSize(projectDescription, CONTENT_WIDTH);
      doc.text(descLines, MARGIN, y);
      y += descLines.length * 6;
    }

    // ==========================================================================
    // Custom Sections
    // ==========================================================================
    for (const section of sections) {
      y = checkPageBreak(doc, y, 40, logoData);

      y += 15;
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, MARGIN, y);

      y += 8;
      doc.setDrawColor(...COLORS.border);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.text);
      doc.setFont("helvetica", "normal");

      const contentLines = doc.splitTextToSize(section.content, CONTENT_WIDTH);
      doc.text(contentLines, MARGIN, y);
      y += contentLines.length * 6;

      // Section items
      if (section.items && section.items.length > 0) {
        y += 5;
        section.items.forEach((item) => {
          y = checkPageBreak(doc, y, 10, logoData);
          doc.setFont("helvetica", "bold");
          doc.text(`• ${item.label}:`, MARGIN + 5, y);
          doc.setFont("helvetica", "normal");
          doc.text(item.value, MARGIN + 50, y);
          y += 7;
        });
      }
    }

    // ==========================================================================
    // Investment / Value
    // ==========================================================================
    y = checkPageBreak(doc, y, 60, logoData);

    y += 20;
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 40, 3, 3, "F");

    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.text("INVESTIMENTO", PAGE_WIDTH / 2, y, { align: "center" });

    y += 15;
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(totalValue), PAGE_WIDTH / 2, y, { align: "center" });

    // ==========================================================================
    // Payment Terms
    // ==========================================================================
    if (paymentTerms) {
      y += 30;
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.text);
      doc.setFont("helvetica", "bold");
      doc.text("Condições de Pagamento:", MARGIN, y);

      y += 8;
      doc.setFont("helvetica", "normal");
      const paymentLines = doc.splitTextToSize(paymentTerms, CONTENT_WIDTH);
      doc.text(paymentLines, MARGIN, y);
      y += paymentLines.length * 6;
    }

    // ==========================================================================
    // Terms and Conditions
    // ==========================================================================
    if (includeTerms) {
      y = checkPageBreak(doc, y, 80, logoData);

      y += 15;
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.primary);
      doc.setFont("helvetica", "bold");
      doc.text("Termos e Condições", MARGIN, y);

      y += 8;
      doc.setDrawColor(...COLORS.border);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont("helvetica", "normal");

      const terms = [
        "1. Esta proposta tem validade de 30 dias a partir da data de emissão.",
        "2. Os valores apresentados estão sujeitos a alteração mediante análise técnica detalhada.",
        "3. O início dos trabalhos está condicionado à aprovação formal desta proposta e pagamento inicial.",
        "4. Alterações no escopo poderão impactar prazos e valores acordados.",
        "5. Imagens e materiais de referência são ilustrativos e podem sofrer variações.",
        "6. Os direitos autorais do projeto pertencem à ArqExpress até quitação total.",
      ];

      terms.forEach((term) => {
        y = checkPageBreak(doc, y, 10, logoData);
        const termLines = doc.splitTextToSize(term, CONTENT_WIDTH);
        doc.text(termLines, MARGIN, y);
        y += termLines.length * 5 + 3;
      });
    }

    // ==========================================================================
    // Signature Area
    // ==========================================================================
    y = checkPageBreak(doc, y, 50, logoData);

    y += 25;
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.text("Aceito os termos desta proposta:", MARGIN, y);

    y += 20;

    // Client signature
    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, y, MARGIN + 70, y);
    doc.setFontSize(10);
    doc.text(clientName, MARGIN, y + 5);
    doc.setTextColor(...COLORS.secondary);
    doc.text("Cliente", MARGIN, y + 10);

    // Company signature
    doc.setDrawColor(...COLORS.border);
    doc.line(PAGE_WIDTH - MARGIN - 70, y, PAGE_WIDTH - MARGIN, y);
    doc.setTextColor(...COLORS.text);
    doc.text("ArqExpress", PAGE_WIDTH - MARGIN - 70, y + 5);
    doc.setTextColor(...COLORS.secondary);
    doc.text("Contratada", PAGE_WIDTH - MARGIN - 70, y + 10);

    // Date
    y += 20;
    doc.setTextColor(...COLORS.text);
    doc.text(`Local e Data: __________________________________, ___/___/______`, MARGIN, y);

    // ==========================================================================
    // Add footers to all pages
    // ==========================================================================
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(doc, i, totalPages);
    }

    // Generate buffer
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      data: buffer,
      filename: `proposta-${clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      mimeType: "application/pdf",
    };
  } catch (error) {
    console.error("Error generating proposal PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate PDF",
    };
  }
}
