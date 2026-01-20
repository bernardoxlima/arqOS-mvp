/**
 * PowerPoint Generation Helpers
 * Shared utilities for creating PowerPoint presentations
 */

import PptxGenJS from "pptxgenjs";
import { PPT_CONSTANTS, type ImagePosition, type TextStyle } from "../types";

const { SLIDE_WIDTH, SLIDE_HEIGHT, MARGIN, LOGO_WIDTH, LOGO_HEIGHT } = PPT_CONSTANTS;

// =============================================================================
// Presentation Setup
// =============================================================================

export function createPresentation(options?: {
  title?: string;
  author?: string;
  company?: string;
  subject?: string;
}): PptxGenJS {
  const pptx = new PptxGenJS();

  // Set presentation properties
  if (options?.title) pptx.title = options.title;
  if (options?.author) pptx.author = options.author;
  if (options?.company) pptx.company = options.company;
  if (options?.subject) pptx.subject = options.subject;

  // Set slide size (3:2 aspect ratio)
  pptx.defineLayout({
    name: "CUSTOM",
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
  });
  pptx.layout = "CUSTOM";

  return pptx;
}

// =============================================================================
// Image Helpers
// =============================================================================

/**
 * Calculate image position to fit within bounds while maintaining aspect ratio
 */
export function fitImageInBounds(
  imageWidth: number,
  imageHeight: number,
  boundsWidth: number,
  boundsHeight: number,
  boundsX: number = 0,
  boundsY: number = 0,
  centerHorizontal: boolean = true,
  centerVertical: boolean = true
): ImagePosition {
  const imageAspect = imageWidth / imageHeight;
  const boundsAspect = boundsWidth / boundsHeight;

  let w: number, h: number;

  if (imageAspect > boundsAspect) {
    // Image is wider than bounds - fit to width
    w = boundsWidth;
    h = boundsWidth / imageAspect;
  } else {
    // Image is taller than bounds - fit to height
    h = boundsHeight;
    w = boundsHeight * imageAspect;
  }

  let x = boundsX;
  let y = boundsY;

  if (centerHorizontal) {
    x = boundsX + (boundsWidth - w) / 2;
  }
  if (centerVertical) {
    y = boundsY + (boundsHeight - h) / 2;
  }

  return { x, y, w, h };
}

/**
 * Calculate grid layout for multiple images
 */
export function calculateImageGrid(
  imageCount: number,
  areaWidth: number,
  areaHeight: number,
  areaX: number = 0,
  areaY: number = 0,
  gap: number = 0.1
): ImagePosition[] {
  const positions: ImagePosition[] = [];

  if (imageCount === 0) return positions;

  // Determine grid dimensions
  let cols: number, rows: number;

  if (imageCount === 1) {
    cols = 1;
    rows = 1;
  } else if (imageCount === 2) {
    cols = 2;
    rows = 1;
  } else if (imageCount <= 4) {
    cols = 2;
    rows = 2;
  } else if (imageCount <= 6) {
    cols = 3;
    rows = 2;
  } else if (imageCount <= 9) {
    cols = 3;
    rows = 3;
  } else {
    cols = 4;
    rows = Math.ceil(imageCount / 4);
  }

  const cellWidth = (areaWidth - gap * (cols - 1)) / cols;
  const cellHeight = (areaHeight - gap * (rows - 1)) / rows;

  for (let i = 0; i < imageCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    positions.push({
      x: areaX + col * (cellWidth + gap),
      y: areaY + row * (cellHeight + gap),
      w: cellWidth,
      h: cellHeight,
    });
  }

  return positions;
}

/**
 * Convert image URL to base64 data
 */
export async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";

    return `data:${contentType};base64,${base64}`;
  } catch {
    console.error("Failed to convert image to base64:", url);
    return null;
  }
}

/**
 * Get image dimensions from base64 or URL
 */
export async function getImageDimensions(
  source: string
): Promise<{ width: number; height: number } | null> {
  // For server-side, we'd need to use a library like sharp or probe-image-size
  // For now, return default dimensions
  return { width: 1920, height: 1080 };
}

// =============================================================================
// Slide Creation Helpers
// =============================================================================

/**
 * Add logo to slide
 */
export function addLogoToSlide(
  slide: PptxGenJS.Slide,
  logoData: string,
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" = "top-left"
): void {
  let x: number, y: number;

  switch (position) {
    case "top-left":
      x = MARGIN;
      y = MARGIN;
      break;
    case "top-right":
      x = SLIDE_WIDTH - MARGIN - LOGO_WIDTH;
      y = MARGIN;
      break;
    case "bottom-left":
      x = MARGIN;
      y = SLIDE_HEIGHT - MARGIN - LOGO_HEIGHT;
      break;
    case "bottom-right":
      x = SLIDE_WIDTH - MARGIN - LOGO_WIDTH;
      y = SLIDE_HEIGHT - MARGIN - LOGO_HEIGHT;
      break;
  }

  slide.addImage({
    data: logoData,
    x,
    y,
    w: LOGO_WIDTH,
    h: LOGO_HEIGHT,
  });
}

/**
 * Create a cover slide
 */
export function createCoverSlide(
  pptx: PptxGenJS,
  options: {
    title: string;
    subtitle?: string;
    date?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    logoData?: string;
  }
): PptxGenJS.Slide {
  const slide = pptx.addSlide();

  // Background
  if (options.backgroundImage) {
    slide.addImage({
      data: options.backgroundImage,
      x: 0,
      y: 0,
      w: SLIDE_WIDTH,
      h: SLIDE_HEIGHT,
    });
    // Add overlay for text readability
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: SLIDE_WIDTH,
      h: SLIDE_HEIGHT,
      fill: { color: "000000", transparency: 40 },
    });
  } else if (options.backgroundColor) {
    slide.background = { color: options.backgroundColor };
  }

  // Logo
  if (options.logoData) {
    addLogoToSlide(slide, options.logoData, "top-left");
  }

  // Title
  slide.addText(options.title, {
    x: MARGIN,
    y: SLIDE_HEIGHT / 2 - 0.5,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.8,
    fontSize: 36,
    fontFace: "Arial",
    color: options.backgroundImage ? "FFFFFF" : "1E3A5F",
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  if (options.subtitle) {
    slide.addText(options.subtitle, {
      x: MARGIN,
      y: SLIDE_HEIGHT / 2 + 0.4,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.5,
      fontSize: 18,
      fontFace: "Arial",
      color: options.backgroundImage ? "FFFFFF" : "6B7280",
      align: "center",
      valign: "middle",
    });
  }

  // Date
  if (options.date) {
    slide.addText(options.date, {
      x: MARGIN,
      y: SLIDE_HEIGHT - MARGIN - 0.4,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.3,
      fontSize: 12,
      fontFace: "Arial",
      color: options.backgroundImage ? "FFFFFF" : "9CA3AF",
      align: "center",
      valign: "bottom",
    });
  }

  return slide;
}

/**
 * Create a section title slide
 */
export function createSectionSlide(
  pptx: PptxGenJS,
  title: string,
  options?: {
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    logoData?: string;
  }
): PptxGenJS.Slide {
  const slide = pptx.addSlide();

  if (options?.backgroundColor) {
    slide.background = { color: options.backgroundColor };
  }

  if (options?.logoData) {
    addLogoToSlide(slide, options.logoData, "top-left");
  }

  slide.addText(title, {
    x: MARGIN,
    y: SLIDE_HEIGHT / 2 - 0.4,
    w: SLIDE_WIDTH - MARGIN * 2,
    h: 0.8,
    fontSize: 32,
    fontFace: "Arial",
    color: options?.textColor || "1E3A5F",
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (options?.subtitle) {
    slide.addText(options.subtitle, {
      x: MARGIN,
      y: SLIDE_HEIGHT / 2 + 0.5,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.4,
      fontSize: 16,
      fontFace: "Arial",
      color: options?.textColor ? options.textColor : "6B7280",
      align: "center",
      valign: "middle",
    });
  }

  return slide;
}

/**
 * Create a slide with a single full-bleed image
 */
export function createFullImageSlide(
  pptx: PptxGenJS,
  imageData: string,
  options?: {
    title?: string;
    logoData?: string;
  }
): PptxGenJS.Slide {
  const slide = pptx.addSlide();

  // Full image
  slide.addImage({
    data: imageData,
    x: 0,
    y: options?.title ? 0.6 : 0,
    w: SLIDE_WIDTH,
    h: options?.title ? SLIDE_HEIGHT - 0.6 : SLIDE_HEIGHT,
    sizing: { type: "contain", w: SLIDE_WIDTH, h: options?.title ? SLIDE_HEIGHT - 0.6 : SLIDE_HEIGHT },
  });

  // Title bar
  if (options?.title) {
    slide.addShape("rect", {
      x: 0,
      y: 0,
      w: SLIDE_WIDTH,
      h: 0.6,
      fill: { color: "FFFFFF" },
    });
    slide.addText(options.title, {
      x: MARGIN,
      y: 0.1,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: "1E3A5F",
      bold: true,
      align: "left",
      valign: "middle",
    });
  }

  if (options?.logoData) {
    addLogoToSlide(slide, options.logoData, "top-right");
  }

  return slide;
}

/**
 * Create a slide with image grid
 */
export function createImageGridSlide(
  pptx: PptxGenJS,
  images: string[],
  options?: {
    title?: string;
    logoData?: string;
    gap?: number;
  }
): PptxGenJS.Slide {
  const slide = pptx.addSlide();
  const hasTitle = !!options?.title;
  const contentY = hasTitle ? 0.8 : MARGIN;
  const contentHeight = SLIDE_HEIGHT - contentY - MARGIN;

  // Title
  if (options?.title) {
    slide.addText(options.title, {
      x: MARGIN,
      y: MARGIN,
      w: SLIDE_WIDTH - MARGIN * 2,
      h: 0.5,
      fontSize: 18,
      fontFace: "Arial",
      color: "1E3A5F",
      bold: true,
      align: "left",
      valign: "middle",
    });
  }

  if (options?.logoData) {
    addLogoToSlide(slide, options.logoData, "top-right");
  }

  // Calculate grid positions
  const positions = calculateImageGrid(
    images.length,
    SLIDE_WIDTH - MARGIN * 2,
    contentHeight,
    MARGIN,
    contentY,
    options?.gap || 0.1
  );

  // Add images
  images.forEach((imageData, index) => {
    if (positions[index]) {
      const pos = positions[index];
      slide.addImage({
        data: imageData,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        sizing: { type: "contain", w: pos.w, h: pos.h },
      });
    }
  });

  return slide;
}

// =============================================================================
// Table Helpers
// =============================================================================

export interface TableColumn {
  header: string;
  width: number;
  align?: "left" | "center" | "right";
}

export interface TableRow {
  values: string[];
  bold?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Create a table slide
 */
export function createTableSlide(
  pptx: PptxGenJS,
  title: string,
  columns: TableColumn[],
  rows: TableRow[],
  options?: {
    logoData?: string;
    headerColor?: string;
    alternateRowColors?: boolean;
  }
): PptxGenJS.Slide {
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
    align: "left",
    valign: "middle",
  });

  if (options?.logoData) {
    addLogoToSlide(slide, options.logoData, "top-right");
  }

  // Build table data
  const tableData: PptxGenJS.TableRow[] = [];

  // Header row
  const headerRow: PptxGenJS.TableCell[] = columns.map((col) => ({
    text: col.header,
    options: {
      bold: true,
      fill: { color: options?.headerColor || "1E3A5F" },
      color: "FFFFFF",
      align: col.align || "left",
      fontSize: 10,
      fontFace: "Arial",
    },
  }));
  tableData.push(headerRow);

  // Data rows
  rows.forEach((row, rowIndex) => {
    const dataRow: PptxGenJS.TableCell[] = row.values.map((value, colIndex) => ({
      text: value,
      options: {
        bold: row.bold,
        fill: {
          color:
            row.backgroundColor ||
            (options?.alternateRowColors && rowIndex % 2 === 1 ? "F3F4F6" : "FFFFFF"),
        },
        color: row.textColor || "374151",
        align: columns[colIndex]?.align || "left",
        fontSize: 9,
        fontFace: "Arial",
      },
    }));
    tableData.push(dataRow);
  });

  // Add table
  slide.addTable(tableData, {
    x: MARGIN,
    y: 0.9,
    w: SLIDE_WIDTH - MARGIN * 2,
    colW: columns.map((col) => col.width),
    border: { pt: 0.5, color: "E5E7EB" },
    margin: [0.05, 0.1, 0.05, 0.1],
  });

  return slide;
}

// =============================================================================
// Text Helpers
// =============================================================================

/**
 * Format currency value
 */
export function formatCurrency(value: number, locale: string = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format date
 */
export function formatDate(date: Date | string, locale: string = "pt-BR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Truncate text to fit in a given width (approximate)
 */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars - 3) + "...";
}
