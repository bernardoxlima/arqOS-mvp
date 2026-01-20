/**
 * Budget PowerPoint Generator
 * Creates a professional budget presentation with category summaries and detailed items
 */

import PptxGenJS from "pptxgenjs";
import type { BudgetPPTInput, BudgetCategory, BudgetItem, GenerationResult } from "../types";
import { PPT_CONSTANTS, CATEGORY_COLORS } from "../types";
import {
  createPresentation,
  createCoverSlide,
  createSectionSlide,
  imageUrlToBase64,
  formatCurrency,
  truncateText,
  addLogoToSlide,
} from "../utils/pptx-helpers";

const { SLIDE_WIDTH, SLIDE_HEIGHT, MARGIN } = PPT_CONSTANTS;

/**
 * Create a category summary slide
 */
function createCategorySummarySlide(
  pptx: PptxGenJS,
  categories: BudgetCategory[],
  grandTotal: number,
  logoData: string | null
): void {
  const slide = pptx.addSlide();

  // Title
  slide.addText("Resumo por Categoria", {
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
    addLogoToSlide(slide, logoData, "top-right");
  }

  // Category bars
  const maxSubtotal = Math.max(...categories.map((c) => c.subtotal));
  const barMaxWidth = 6;
  let yPos = 1.2;

  categories.forEach((category) => {
    const barWidth = (category.subtotal / maxSubtotal) * barMaxWidth;
    const color = category.color || CATEGORY_COLORS[category.name] || "6B7280";
    const percentage = ((category.subtotal / grandTotal) * 100).toFixed(1);

    // Category name
    slide.addText(category.name.charAt(0).toUpperCase() + category.name.slice(1), {
      x: MARGIN,
      y: yPos,
      w: 2,
      h: 0.35,
      fontSize: 10,
      fontFace: "Arial",
      color: "374151",
      valign: "middle",
    });

    // Bar
    slide.addShape("rect", {
      x: 2.5,
      y: yPos + 0.05,
      w: barWidth,
      h: 0.25,
      fill: { color },
    });

    // Value and percentage
    slide.addText(`${formatCurrency(category.subtotal)} (${percentage}%)`, {
      x: 2.5 + barWidth + 0.1,
      y: yPos,
      w: 2.5,
      h: 0.35,
      fontSize: 9,
      fontFace: "Arial",
      color: "6B7280",
      valign: "middle",
    });

    yPos += 0.45;
  });

  // Grand total
  yPos += 0.3;
  slide.addShape("line", {
    x: MARGIN,
    y: yPos,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0,
    line: { color: "E5E7EB", pt: 1 },
  });

  yPos += 0.2;
  slide.addText("TOTAL GERAL", {
    x: MARGIN,
    y: yPos,
    w: 3,
    h: 0.5,
    fontSize: 14,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
    valign: "middle",
  });

  slide.addText(formatCurrency(grandTotal), {
    x: 5,
    y: yPos,
    w: 4,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
    valign: "middle",
    align: "right",
  });
}

/**
 * Create a budget table slide for a category
 */
function createBudgetTableSlide(
  pptx: PptxGenJS,
  category: BudgetCategory,
  items: BudgetItem[],
  options: {
    includeSuppliers: boolean;
    logoData: string | null;
    pageNumber?: number;
    totalPages?: number;
  }
): void {
  const slide = pptx.addSlide();
  const categoryColor = category.color || CATEGORY_COLORS[category.name] || "6B7280";
  const displayName = category.name.charAt(0).toUpperCase() + category.name.slice(1);

  // Title with category color indicator
  slide.addShape("rect", {
    x: MARGIN,
    y: MARGIN,
    w: 0.15,
    h: 0.5,
    fill: { color: categoryColor },
  });

  slide.addText(displayName, {
    x: MARGIN + 0.25,
    y: MARGIN,
    w: SLIDE_WIDTH - MARGIN * 2 - 0.25,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
  });

  if (options.logoData) {
    addLogoToSlide(slide, options.logoData, "top-right");
  }

  // Page indicator
  if (options.pageNumber && options.totalPages && options.totalPages > 1) {
    slide.addText(`${options.pageNumber}/${options.totalPages}`, {
      x: SLIDE_WIDTH - MARGIN - 0.5,
      y: MARGIN,
      w: 0.5,
      h: 0.4,
      fontSize: 10,
      fontFace: "Arial",
      color: "9CA3AF",
      align: "right",
    });
  }

  // Table
  const headers = options.includeSuppliers
    ? ["Item", "Qtd", "Un.", "Valor Un.", "Fornecedor", "Total"]
    : ["Item", "Qtd", "Unidade", "Valor Unitário", "Total"];

  const colWidths = options.includeSuppliers
    ? [3.2, 0.7, 0.7, 1.2, 1.8, 1.4]
    : [4.2, 0.9, 1, 1.5, 1.6];

  const tableData: PptxGenJS.TableRow[] = [];

  // Header row
  tableData.push(
    headers.map((h) => ({
      text: h,
      options: {
        bold: true,
        fill: { color: categoryColor },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
        align: h === "Item" || h === "Fornecedor" ? "left" : ("center" as const),
      },
    }))
  );

  // Data rows
  items.forEach((item, index) => {
    const row: PptxGenJS.TableCell[] = [
      {
        text: truncateText(item.name, 35),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          fill: { color: index % 2 === 0 ? "FFFFFF" : "F9FAFB" },
        },
      },
      {
        text: String(item.quantity),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          align: "center",
          fill: { color: index % 2 === 0 ? "FFFFFF" : "F9FAFB" },
        },
      },
      {
        text: item.unit,
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          align: "center",
          fill: { color: index % 2 === 0 ? "FFFFFF" : "F9FAFB" },
        },
      },
      {
        text: formatCurrency(item.unitPrice),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          align: "right",
          fill: { color: index % 2 === 0 ? "FFFFFF" : "F9FAFB" },
        },
      },
    ];

    if (options.includeSuppliers) {
      row.push({
        text: item.supplier || "-",
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "6B7280",
          fill: { color: index % 2 === 0 ? "FFFFFF" : "F9FAFB" },
        },
      });
    }

    row.push({
      text: formatCurrency(item.totalPrice),
      options: {
        fontSize: 9,
        fontFace: "Arial",
        color: "374151",
        bold: true,
        align: "right",
        fill: { color: index % 2 === 0 ? "FFFFFF" : "F9FAFB" },
      },
    });

    tableData.push(row);
  });

  // Subtotal row
  const subtotalRow: PptxGenJS.TableCell[] = [
    {
      text: "Subtotal",
      options: {
        bold: true,
        fontSize: 10,
        fontFace: "Arial",
        color: "1E3A5F",
        fill: { color: "E5E7EB" },
        colspan: options.includeSuppliers ? 5 : 4,
      },
    },
    {
      text: formatCurrency(category.subtotal),
      options: {
        bold: true,
        fontSize: 10,
        fontFace: "Arial",
        color: "1E3A5F",
        align: "right",
        fill: { color: "E5E7EB" },
      },
    },
  ];
  tableData.push(subtotalRow);

  // Add table
  slide.addTable(tableData, {
    x: MARGIN,
    y: 0.9,
    w: SLIDE_WIDTH - MARGIN * 2,
    colW: colWidths,
    border: { pt: 0.5, color: "E5E7EB" },
    margin: [0.05, 0.08, 0.05, 0.08],
  });
}

/**
 * Create a grand total slide
 */
function createTotalSlide(
  pptx: PptxGenJS,
  categories: BudgetCategory[],
  grandTotal: number,
  logoData: string | null
): void {
  const slide = pptx.addSlide();

  if (logoData) {
    addLogoToSlide(slide, logoData, "top-left");
  }

  // Title
  slide.addText("Total do Orçamento", {
    x: MARGIN,
    y: 1.5,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.6,
    fontSize: 28,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
    align: "center",
  });

  // Grand total value
  slide.addText(formatCurrency(grandTotal), {
    x: MARGIN,
    y: 2.3,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.8,
    fontSize: 48,
    fontFace: "Arial",
    color: "10B981",
    bold: true,
    align: "center",
  });

  // Category breakdown (mini)
  let xPos = MARGIN;
  const boxWidth = (SLIDE_WIDTH - MARGIN * 2 - 0.2 * (categories.length - 1)) / Math.min(categories.length, 4);

  categories.slice(0, 4).forEach((category) => {
    const color = category.color || CATEGORY_COLORS[category.name] || "6B7280";
    const percentage = ((category.subtotal / grandTotal) * 100).toFixed(0);

    slide.addShape("rect", {
      x: xPos,
      y: 3.5,
      w: boxWidth,
      h: 1,
      fill: { color: "F9FAFB" },
      line: { color, pt: 2 },
    });

    slide.addText(category.name.charAt(0).toUpperCase() + category.name.slice(1), {
      x: xPos,
      y: 3.6,
      w: boxWidth,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: "6B7280",
      align: "center",
    });

    slide.addText(`${percentage}%`, {
      x: xPos,
      y: 3.95,
      w: boxWidth,
      h: 0.4,
      fontSize: 18,
      fontFace: "Arial",
      color,
      bold: true,
      align: "center",
    });

    xPos += boxWidth + 0.2;
  });

  // Items count
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  slide.addText(`${totalItems} itens em ${categories.length} categorias`, {
    x: MARGIN,
    y: SLIDE_HEIGHT - MARGIN - 0.5,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.4,
    fontSize: 12,
    fontFace: "Arial",
    color: "9CA3AF",
    align: "center",
  });
}

/**
 * Generate a budget PowerPoint
 */
export async function generateBudgetPPT(
  input: BudgetPPTInput
): Promise<GenerationResult<Buffer>> {
  try {
    const {
      clientName,
      projectName,
      categories,
      grandTotal,
      includeSuppliers = true,
      includeCategorySummary = true,
      logoUrl,
    } = input;

    // Convert logo to base64 if provided
    const logoData = logoUrl ? await imageUrlToBase64(logoUrl) : null;

    // Create presentation
    const pptx = createPresentation({
      title: `Orçamento - ${clientName}`,
      subject: projectName || "Orçamento",
      company: "ArqExpress",
    });

    // ==========================================================================
    // Cover Slide
    // ==========================================================================
    createCoverSlide(pptx, {
      title: "Orçamento",
      subtitle: `${clientName}${projectName ? ` - ${projectName}` : ""}`,
      date: new Date().toLocaleDateString("pt-BR"),
      logoData: logoData || undefined,
      backgroundColor: "1E3A5F",
    });

    // ==========================================================================
    // Category Summary
    // ==========================================================================
    if (includeCategorySummary && categories.length > 0) {
      createCategorySummarySlide(pptx, categories, grandTotal, logoData);
    }

    // ==========================================================================
    // Category Detail Slides
    // ==========================================================================
    for (const category of categories) {
      // Section divider
      createSectionSlide(pptx, category.name.charAt(0).toUpperCase() + category.name.slice(1), {
        subtitle: `${category.items.length} itens | ${formatCurrency(category.subtotal)}`,
        backgroundColor: category.color || CATEGORY_COLORS[category.name] || "6B7280",
        textColor: "FFFFFF",
        logoData: logoData || undefined,
      });

      // Split items into pages of 12
      const itemsPerPage = 12;
      const totalPages = Math.ceil(category.items.length / itemsPerPage);

      for (let i = 0; i < category.items.length; i += itemsPerPage) {
        const pageItems = category.items.slice(i, i + itemsPerPage);
        const pageNumber = Math.floor(i / itemsPerPage) + 1;

        createBudgetTableSlide(
          pptx,
          category,
          pageItems,
          {
            includeSuppliers,
            logoData,
            pageNumber,
            totalPages,
          }
        );
      }
    }

    // ==========================================================================
    // Grand Total Slide
    // ==========================================================================
    createTotalSlide(pptx, categories, grandTotal, logoData);

    // ==========================================================================
    // Final Slide
    // ==========================================================================
    createSectionSlide(pptx, "Obrigado!", {
      subtitle: "ArqExpress - Orçamentos profissionais",
      logoData: logoData || undefined,
    });

    // Generate buffer
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    return {
      success: true,
      data: buffer,
      filename: `orcamento-${clientName.toLowerCase().replace(/\s+/g, "-")}.pptx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
  } catch (error) {
    console.error("Error generating budget PPT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate budget",
    };
  }
}
