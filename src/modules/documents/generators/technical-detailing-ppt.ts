/**
 * Technical Detailing PowerPoint Generator
 * Creates detailed technical specifications for items with dimensions, materials, and drawings
 */

import PptxGenJS from "pptxgenjs";
import type { TechnicalDetailingPPTInput, TechnicalItem, GenerationResult } from "../types";
import { PPT_CONSTANTS, CATEGORY_COLORS } from "../types";
import {
  createPresentation,
  createCoverSlide,
  createSectionSlide,
  imageUrlToBase64,
  truncateText,
  addLogoToSlide,
} from "../utils/pptx-helpers";

const { SLIDE_WIDTH, SLIDE_HEIGHT, MARGIN } = PPT_CONSTANTS;

interface GroupedTechnicalItems {
  [ambiente: string]: TechnicalItem[];
}

/**
 * Group items by ambiente
 */
function groupByAmbiente(items: TechnicalItem[]): GroupedTechnicalItems {
  return items.reduce((acc, item) => {
    const key = item.ambiente || "Geral";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as GroupedTechnicalItems);
}

/**
 * Format dimensions string
 */
function formatDimensions(dimensions?: {
  width?: number;
  height?: number;
  depth?: number;
}): string {
  if (!dimensions) return "-";

  const parts: string[] = [];
  if (dimensions.width) parts.push(`L: ${dimensions.width}cm`);
  if (dimensions.height) parts.push(`A: ${dimensions.height}cm`);
  if (dimensions.depth) parts.push(`P: ${dimensions.depth}cm`);

  return parts.length > 0 ? parts.join(" x ") : "-";
}

/**
 * Create a technical item detail slide
 */
async function createItemDetailSlide(
  pptx: PptxGenJS,
  item: TechnicalItem,
  logoData: string | null
): Promise<void> {
  const slide = pptx.addSlide();
  const categoryColor = item.categoryColor || CATEGORY_COLORS[item.category] || "6B7280";

  // Header with category indicator
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: 0.8,
    fill: { color: categoryColor },
  });

  slide.addText(`${item.number}. ${item.name}`, {
    x: MARGIN,
    y: 0.15,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.5,
    fontSize: 20,
    fontFace: "Arial",
    color: "FFFFFF",
    bold: true,
  });

  if (logoData) {
    slide.addImage({
      data: logoData,
      x: SLIDE_WIDTH - MARGIN - 1.6,
      y: 0.23,
      w: 1.4,
      h: 0.29,
    });
  }

  // Layout: Image on left (if available), specs on right
  const hasImage = !!item.imageUrl;
  const hasDrawing = !!item.technicalDrawingUrl;
  const specX = hasImage || hasDrawing ? 5.2 : MARGIN;
  const specWidth = hasImage || hasDrawing ? 4.4 : SLIDE_WIDTH - MARGIN * 2;

  // Image area (left side)
  if (hasImage || hasDrawing) {
    const imageAreaWidth = 4.6;
    const imageAreaHeight = 5.2;
    const imageY = 1;

    // Background for image area
    slide.addShape("rect", {
      x: MARGIN,
      y: imageY,
      w: imageAreaWidth,
      h: imageAreaHeight,
      fill: { color: "F9FAFB" },
      line: { color: "E5E7EB", pt: 1 },
    });

    // Main image
    if (item.imageUrl) {
      const imageData = await imageUrlToBase64(item.imageUrl);
      if (imageData) {
        const imgHeight = hasDrawing ? imageAreaHeight * 0.55 : imageAreaHeight - 0.2;
        slide.addImage({
          data: imageData,
          x: MARGIN + 0.1,
          y: imageY + 0.1,
          w: imageAreaWidth - 0.2,
          h: imgHeight,
          sizing: { type: "contain", w: imageAreaWidth - 0.2, h: imgHeight },
        });
      }
    }

    // Technical drawing (below main image)
    if (item.technicalDrawingUrl) {
      const drawingData = await imageUrlToBase64(item.technicalDrawingUrl);
      if (drawingData) {
        const drawingY = item.imageUrl ? imageY + imageAreaHeight * 0.55 + 0.2 : imageY + 0.1;
        const drawingHeight = item.imageUrl ? imageAreaHeight * 0.4 : imageAreaHeight - 0.2;

        // Drawing label
        slide.addText("Desenho Técnico", {
          x: MARGIN + 0.1,
          y: drawingY - 0.3,
          w: imageAreaWidth - 0.2,
          h: 0.25,
          fontSize: 8,
          fontFace: "Arial",
          color: "6B7280",
        });

        slide.addImage({
          data: drawingData,
          x: MARGIN + 0.1,
          y: drawingY,
          w: imageAreaWidth - 0.2,
          h: drawingHeight,
          sizing: { type: "contain", w: imageAreaWidth - 0.2, h: drawingHeight },
        });
      }
    }
  }

  // Specifications area (right side or full width)
  let specY = 1;

  // Category badge
  slide.addShape("rect", {
    x: specX,
    y: specY,
    w: 1.8,
    h: 0.35,
    fill: { color: categoryColor },
  });
  slide.addText(item.category.charAt(0).toUpperCase() + item.category.slice(1), {
    x: specX,
    y: specY,
    w: 1.8,
    h: 0.35,
    fontSize: 9,
    fontFace: "Arial",
    color: "FFFFFF",
    align: "center",
    valign: "middle",
  });

  // Ambiente badge
  slide.addShape("rect", {
    x: specX + 2,
    y: specY,
    w: 1.8,
    h: 0.35,
    fill: { color: "F3F4F6" },
    line: { color: "D1D5DB", pt: 1 },
  });
  slide.addText(item.ambiente, {
    x: specX + 2,
    y: specY,
    w: 1.8,
    h: 0.35,
    fontSize: 9,
    fontFace: "Arial",
    color: "374151",
    align: "center",
    valign: "middle",
  });

  specY += 0.6;

  // Specifications list
  const specs = [
    { label: "Dimensões", value: formatDimensions(item.dimensions) },
    { label: "Material", value: item.material || "-" },
    { label: "Acabamento", value: item.finish || "-" },
  ];

  specs.forEach((spec) => {
    slide.addText(spec.label, {
      x: specX,
      y: specY,
      w: specWidth,
      h: 0.35,
      fontSize: 10,
      fontFace: "Arial",
      color: "6B7280",
      bold: true,
    });
    specY += 0.35;

    slide.addText(spec.value, {
      x: specX,
      y: specY,
      w: specWidth,
      h: 0.4,
      fontSize: 12,
      fontFace: "Arial",
      color: "1F2937",
    });
    specY += 0.5;
  });

  // Observations
  if (item.observations) {
    specY += 0.2;
    slide.addText("Observações", {
      x: specX,
      y: specY,
      w: specWidth,
      h: 0.35,
      fontSize: 10,
      fontFace: "Arial",
      color: "6B7280",
      bold: true,
    });
    specY += 0.35;

    slide.addShape("rect", {
      x: specX,
      y: specY,
      w: specWidth,
      h: 1.5,
      fill: { color: "FFFBEB" },
      line: { color: "FCD34D", pt: 1 },
    });

    slide.addText(item.observations, {
      x: specX + 0.1,
      y: specY + 0.1,
      w: specWidth - 0.2,
      h: 1.3,
      fontSize: 10,
      fontFace: "Arial",
      color: "92400E",
      valign: "top",
    });
  }
}

/**
 * Create a summary table slide for an ambiente
 */
function createAmbienteSummarySlide(
  pptx: PptxGenJS,
  ambiente: string,
  items: TechnicalItem[],
  logoData: string | null
): void {
  const slide = pptx.addSlide();

  // Title
  slide.addText(ambiente, {
    x: MARGIN,
    y: MARGIN,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.5,
    fontSize: 20,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
  });

  slide.addText(`${items.length} itens`, {
    x: MARGIN,
    y: MARGIN + 0.5,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.3,
    fontSize: 12,
    fontFace: "Arial",
    color: "6B7280",
  });

  if (logoData) {
    addLogoToSlide(slide, logoData, "top-right");
  }

  // Table
  const tableData: PptxGenJS.TableRow[] = [];

  // Header
  tableData.push([
    {
      text: "#",
      options: {
        bold: true,
        fill: { color: "1E3A5F" },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
        align: "center",
      },
    },
    {
      text: "Item",
      options: {
        bold: true,
        fill: { color: "1E3A5F" },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
      },
    },
    {
      text: "Categoria",
      options: {
        bold: true,
        fill: { color: "1E3A5F" },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
        align: "center",
      },
    },
    {
      text: "Dimensões",
      options: {
        bold: true,
        fill: { color: "1E3A5F" },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
        align: "center",
      },
    },
    {
      text: "Material",
      options: {
        bold: true,
        fill: { color: "1E3A5F" },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
        align: "center",
      },
    },
  ]);

  // Data rows
  items.slice(0, 12).forEach((item, index) => {
    const categoryColor = item.categoryColor || CATEGORY_COLORS[item.category] || "6B7280";
    const bgColor = index % 2 === 0 ? "FFFFFF" : "F9FAFB";

    tableData.push([
      {
        text: String(item.number),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "FFFFFF",
          fill: { color: categoryColor },
          align: "center",
        },
      },
      {
        text: truncateText(item.name, 30),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          fill: { color: bgColor },
        },
      },
      {
        text: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        options: {
          fontSize: 8,
          fontFace: "Arial",
          color: "6B7280",
          fill: { color: bgColor },
          align: "center",
        },
      },
      {
        text: formatDimensions(item.dimensions),
        options: {
          fontSize: 8,
          fontFace: "Arial",
          color: "374151",
          fill: { color: bgColor },
          align: "center",
        },
      },
      {
        text: item.material || "-",
        options: {
          fontSize: 8,
          fontFace: "Arial",
          color: "374151",
          fill: { color: bgColor },
          align: "center",
        },
      },
    ]);
  });

  slide.addTable(tableData, {
    x: MARGIN,
    y: 1.2,
    w: SLIDE_WIDTH - MARGIN * 2,
    colW: [0.6, 3.5, 1.5, 2, 1.6],
    border: { pt: 0.5, color: "E5E7EB" },
    margin: [0.05, 0.08, 0.05, 0.08],
  });

  if (items.length > 12) {
    slide.addText(`+ ${items.length - 12} mais itens`, {
      x: MARGIN,
      y: SLIDE_HEIGHT - MARGIN - 0.3,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.3,
      fontSize: 10,
      fontFace: "Arial",
      color: "9CA3AF",
      italic: true,
      align: "right",
    });
  }
}

/**
 * Generate a technical detailing PowerPoint
 */
export async function generateTechnicalDetailingPPT(
  input: TechnicalDetailingPPTInput
): Promise<GenerationResult<Buffer>> {
  try {
    const {
      clientName,
      projectName,
      items,
      groupByAmbiente: shouldGroup = true,
      includeDrawings = true,
      logoUrl,
    } = input;

    // Convert logo to base64 if provided
    const logoData = logoUrl ? await imageUrlToBase64(logoUrl) : null;

    // Create presentation
    const pptx = createPresentation({
      title: `Detalhamento Técnico - ${clientName}`,
      subject: projectName || "Detalhamento Técnico",
      company: "ArqExpress",
    });

    // ==========================================================================
    // Cover Slide
    // ==========================================================================
    createCoverSlide(pptx, {
      title: "Detalhamento Técnico",
      subtitle: `${clientName}${projectName ? ` - ${projectName}` : ""}`,
      date: new Date().toLocaleDateString("pt-BR"),
      logoData: logoData || undefined,
    });

    // ==========================================================================
    // Summary Slide
    // ==========================================================================
    const summarySlide = pptx.addSlide();

    summarySlide.addText("Resumo do Projeto", {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.5,
      fontSize: 24,
      fontFace: "Arial",
      color: "1E3A5F",
      bold: true,
    });

    if (logoData) {
      addLogoToSlide(summarySlide, logoData, "top-right");
    }

    const grouped = groupByAmbiente(items);
    const ambientes = Object.keys(grouped);
    const categories = [...new Set(items.map((i) => i.category))];

    summarySlide.addText(`Total de Itens: ${items.length}`, {
      x: MARGIN,
      y: 1.2,
      w: 4,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: "374151",
    });

    summarySlide.addText(`Ambientes: ${ambientes.length}`, {
      x: MARGIN,
      y: 1.7,
      w: 4,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: "374151",
    });

    summarySlide.addText(`Categorias: ${categories.length}`, {
      x: MARGIN,
      y: 2.2,
      w: 4,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: "374151",
    });

    // Ambientes list
    let yPos = 3;
    summarySlide.addText("Por Ambiente:", {
      x: MARGIN,
      y: yPos,
      w: 4,
      h: 0.4,
      fontSize: 12,
      fontFace: "Arial",
      color: "6B7280",
      bold: true,
    });
    yPos += 0.5;

    ambientes.slice(0, 8).forEach((ambiente) => {
      summarySlide.addText(`• ${ambiente}: ${grouped[ambiente].length} itens`, {
        x: MARGIN + 0.2,
        y: yPos,
        w: 4,
        h: 0.3,
        fontSize: 10,
        fontFace: "Arial",
        color: "374151",
      });
      yPos += 0.35;
    });

    // ==========================================================================
    // Grouped by Ambiente (if enabled)
    // ==========================================================================
    if (shouldGroup) {
      for (const [ambiente, ambienteItems] of Object.entries(grouped)) {
        // Section divider
        createSectionSlide(pptx, ambiente, {
          subtitle: `${ambienteItems.length} itens`,
          logoData: logoData || undefined,
        });

        // Summary table for ambiente
        createAmbienteSummarySlide(pptx, ambiente, ambienteItems, logoData);

        // Detail slides for each item
        for (const item of ambienteItems) {
          await createItemDetailSlide(pptx, item, logoData);
        }
      }
    } else {
      // All items without grouping
      createSectionSlide(pptx, "Itens do Projeto", {
        subtitle: `${items.length} itens`,
        logoData: logoData || undefined,
      });

      for (const item of items) {
        await createItemDetailSlide(pptx, item, logoData);
      }
    }

    // ==========================================================================
    // Final Slide
    // ==========================================================================
    createSectionSlide(pptx, "Detalhamento Completo", {
      subtitle: "ArqExpress - Projetos precisos",
      logoData: logoData || undefined,
    });

    // Generate buffer
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    return {
      success: true,
      data: buffer,
      filename: `detalhamento-${clientName.toLowerCase().replace(/\s+/g, "-")}.pptx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
  } catch (error) {
    console.error("Error generating technical detailing PPT:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate technical detailing",
    };
  }
}
