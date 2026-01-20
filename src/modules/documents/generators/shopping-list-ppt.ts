/**
 * Shopping List PowerPoint Generator
 * Creates a visual shopping list with item images and details
 */

import PptxGenJS from "pptxgenjs";
import type { ShoppingListPPTInput, ShoppingListItem, GenerationResult } from "../types";
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

interface GroupedItems {
  [key: string]: ShoppingListItem[];
}

/**
 * Group items by category or ambiente
 */
function groupItems(
  items: ShoppingListItem[],
  groupBy: "category" | "ambiente"
): GroupedItems {
  return items.reduce((acc, item) => {
    const key = groupBy === "category" ? item.category : item.ambiente || "Sem Ambiente";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as GroupedItems);
}

/**
 * Create an item card slide
 */
async function createItemCardSlide(
  pptx: PptxGenJS,
  items: ShoppingListItem[],
  title: string,
  options: {
    includeImages: boolean;
    includePrices: boolean;
    logoData: string | null;
  }
): Promise<void> {
  const slide = pptx.addSlide();

  // Title
  slide.addText(title, {
    x: MARGIN,
    y: MARGIN,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
  });

  if (options.logoData) {
    addLogoToSlide(slide, options.logoData, "top-right");
  }

  // Calculate card layout (2-3 columns depending on image inclusion)
  const cols = options.includeImages ? 2 : 3;
  const cardWidth = (SLIDE_WIDTH - MARGIN * 2 - 0.2 * (cols - 1)) / cols;
  const cardHeight = options.includeImages ? 2.2 : 1.2;
  const startY = 0.9;
  const maxRows = Math.floor((SLIDE_HEIGHT - startY - MARGIN) / (cardHeight + 0.1));
  const maxItems = cols * maxRows;

  // Render items (limited by available space)
  const displayItems = items.slice(0, maxItems);

  for (let i = 0; i < displayItems.length; i++) {
    const item = displayItems[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MARGIN + col * (cardWidth + 0.2);
    const y = startY + row * (cardHeight + 0.1);

    const categoryColor = item.categoryColor || CATEGORY_COLORS[item.category] || "6B7280";

    // Card background
    slide.addShape("rect", {
      x,
      y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: "F9FAFB" },
      line: { color: categoryColor, pt: 1 },
    });

    // Category indicator
    slide.addShape("rect", {
      x,
      y,
      w: 0.1,
      h: cardHeight,
      fill: { color: categoryColor },
    });

    let contentY = y + 0.1;

    // Item image (if enabled and available)
    if (options.includeImages && item.imageUrl) {
      const imageData = await imageUrlToBase64(item.imageUrl);
      if (imageData) {
        slide.addImage({
          data: imageData,
          x: x + 0.15,
          y: contentY,
          w: cardWidth - 0.3,
          h: 1.2,
          sizing: { type: "contain", w: cardWidth - 0.3, h: 1.2 },
        });
        contentY += 1.3;
      }
    }

    // Item number and name
    slide.addText(`${item.number}. ${truncateText(item.name, 30)}`, {
      x: x + 0.15,
      y: contentY,
      w: cardWidth - 0.3,
      h: 0.35,
      fontSize: 10,
      fontFace: "Arial",
      color: "1F2937",
      bold: true,
      valign: "top",
    });
    contentY += 0.35;

    // Details
    const details: string[] = [];
    if (item.quantity && item.unit) {
      details.push(`${item.quantity} ${item.unit}`);
    }
    if (item.supplier) {
      details.push(item.supplier);
    }
    if (options.includePrices && item.price) {
      details.push(formatCurrency(item.price));
    }

    if (details.length > 0) {
      slide.addText(details.join(" | "), {
        x: x + 0.15,
        y: contentY,
        w: cardWidth - 0.3,
        h: 0.3,
        fontSize: 8,
        fontFace: "Arial",
        color: "6B7280",
        valign: "top",
      });
    }
  }

  // Overflow indicator
  if (items.length > maxItems) {
    slide.addText(`+ ${items.length - maxItems} mais itens`, {
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
 * Create a list-style slide for items without images
 */
function createListSlide(
  pptx: PptxGenJS,
  items: ShoppingListItem[],
  title: string,
  options: {
    includePrices: boolean;
    logoData: string | null;
  }
): void {
  const slide = pptx.addSlide();

  // Title
  slide.addText(title, {
    x: MARGIN,
    y: MARGIN,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.5,
    fontSize: 18,
    fontFace: "Arial",
    color: "1E3A5F",
    bold: true,
  });

  if (options.logoData) {
    addLogoToSlide(slide, options.logoData, "top-right");
  }

  // Table headers
  const headers = ["#", "Item", "Qtd", "Fornecedor"];
  if (options.includePrices) headers.push("Valor");
  const colWidths = options.includePrices
    ? [0.5, 4.5, 1, 2, 1.2]
    : [0.5, 5.5, 1, 2.2];

  const tableData: PptxGenJS.TableRow[] = [];

  // Header row
  tableData.push(
    headers.map((h) => ({
      text: h,
      options: {
        bold: true,
        fill: { color: "1E3A5F" },
        color: "FFFFFF",
        fontSize: 9,
        fontFace: "Arial",
      },
    }))
  );

  // Data rows
  items.slice(0, 15).forEach((item, index) => {
    const row: PptxGenJS.TableCell[] = [
      {
        text: String(item.number),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          align: "center",
        },
      },
      {
        text: truncateText(item.name, 40),
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
        },
      },
      {
        text: item.quantity ? `${item.quantity} ${item.unit || "un"}` : "-",
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          align: "center",
        },
      },
      {
        text: item.supplier || "-",
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
        },
      },
    ];

    if (options.includePrices) {
      row.push({
        text: item.price ? formatCurrency(item.price) : "-",
        options: {
          fontSize: 9,
          fontFace: "Arial",
          color: "374151",
          align: "right",
        },
      });
    }

    // Apply category color indicator
    const categoryColor = item.categoryColor || CATEGORY_COLORS[item.category] || "6B7280";
    row[0].options = {
      ...row[0].options,
      fill: { color: categoryColor },
      color: "FFFFFF",
    };

    // Alternate row colors
    if (index % 2 === 1) {
      row.forEach((cell, i) => {
        if (i > 0) {
          cell.options = { ...cell.options, fill: { color: "F9FAFB" } };
        }
      });
    }

    tableData.push(row);
  });

  // Add table
  slide.addTable(tableData, {
    x: MARGIN,
    y: 0.9,
    w: SLIDE_WIDTH - MARGIN * 2,
    colW: colWidths,
    border: { pt: 0.5, color: "E5E7EB" },
    margin: [0.05, 0.08, 0.05, 0.08],
  });

  // Overflow indicator
  if (items.length > 15) {
    slide.addText(`+ ${items.length - 15} mais itens`, {
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
 * Generate a shopping list PowerPoint
 */
export async function generateShoppingListPPT(
  input: ShoppingListPPTInput
): Promise<GenerationResult<Buffer>> {
  try {
    const {
      clientName,
      items,
      groupByCategory = true,
      groupByAmbiente = false,
      includeImages = true,
      includePrices = false,
      logoUrl,
    } = input;

    // Convert logo to base64 if provided
    const logoData = logoUrl ? await imageUrlToBase64(logoUrl) : null;

    // Create presentation
    const pptx = createPresentation({
      title: `Lista de Compras - ${clientName}`,
      subject: "Lista de Compras",
      company: "ArqExpress",
    });

    // ==========================================================================
    // Cover Slide
    // ==========================================================================
    createCoverSlide(pptx, {
      title: "Lista de Compras",
      subtitle: clientName,
      date: new Date().toLocaleDateString("pt-BR"),
      logoData: logoData || undefined,
    });

    // ==========================================================================
    // Summary Slide
    // ==========================================================================
    const summarySlide = pptx.addSlide();

    summarySlide.addText("Resumo", {
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

    // Summary stats
    const totalItems = items.length;
    const categories = [...new Set(items.map((i) => i.category))];
    const totalValue = includePrices
      ? items.reduce((sum, item) => sum + (item.price || 0), 0)
      : 0;

    summarySlide.addText(`Total de Itens: ${totalItems}`, {
      x: MARGIN,
      y: 1.2,
      w: 4,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: "374151",
    });

    summarySlide.addText(`Categorias: ${categories.length}`, {
      x: MARGIN,
      y: 1.7,
      w: 4,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: "374151",
    });

    if (includePrices && totalValue > 0) {
      summarySlide.addText(`Valor Total: ${formatCurrency(totalValue)}`, {
        x: MARGIN,
        y: 2.2,
        w: 4,
        h: 0.4,
        fontSize: 14,
        fontFace: "Arial",
        color: "374151",
        bold: true,
      });
    }

    // Category breakdown
    let yPos = 3;
    summarySlide.addText("Por Categoria:", {
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

    const categoryGroups = groupItems(items, "category");
    Object.entries(categoryGroups).slice(0, 8).forEach(([category, catItems]) => {
      const color = CATEGORY_COLORS[category] || "6B7280";

      summarySlide.addShape("rect", {
        x: MARGIN,
        y: yPos,
        w: 0.15,
        h: 0.3,
        fill: { color },
      });

      summarySlide.addText(`${category}: ${catItems.length} itens`, {
        x: MARGIN + 0.25,
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
    // Item Slides (grouped)
    // ==========================================================================
    const groupBy = groupByAmbiente ? "ambiente" : "category";
    const grouped = groupItems(items, groupBy);

    for (const [groupName, groupItems] of Object.entries(grouped)) {
      // Section divider
      const displayName =
        groupBy === "category"
          ? groupName.charAt(0).toUpperCase() + groupName.slice(1)
          : groupName;

      createSectionSlide(pptx, displayName, {
        subtitle: `${groupItems.length} itens`,
        logoData: logoData || undefined,
      });

      // Items - use cards if images are enabled, otherwise use list
      if (includeImages) {
        // Split into slides of ~6 items
        for (let i = 0; i < groupItems.length; i += 6) {
          const slideItems = groupItems.slice(i, i + 6);
          await createItemCardSlide(pptx, slideItems, displayName, {
            includeImages,
            includePrices,
            logoData,
          });
        }
      } else {
        // Split into slides of ~15 items
        for (let i = 0; i < groupItems.length; i += 15) {
          const slideItems = groupItems.slice(i, i + 15);
          createListSlide(pptx, slideItems, displayName, {
            includePrices,
            logoData,
          });
        }
      }
    }

    // ==========================================================================
    // Final Slide
    // ==========================================================================
    createSectionSlide(pptx, "Boas Compras!", {
      subtitle: "ArqExpress",
      logoData: logoData || undefined,
    });

    // Generate buffer
    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;

    return {
      success: true,
      data: buffer,
      filename: `lista-compras-${clientName.toLowerCase().replace(/\s+/g, "-")}.pptx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
  } catch (error) {
    console.error("Error generating shopping list PPT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate shopping list",
    };
  }
}
