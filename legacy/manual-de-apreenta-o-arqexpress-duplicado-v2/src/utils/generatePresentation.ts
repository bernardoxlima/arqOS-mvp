import PptxGenJS from "pptxgenjs";
import { PresentationData, FloorPlanItem, ITEM_CATEGORIES, ItemCategory } from "@/types/presentation";

// Helper to get category color
const getCategoryColor = (categoryId: ItemCategory): string => {
  return ITEM_CATEGORIES.find(c => c.id === categoryId)?.color || "000000";
};

// Helper to get category label
const getCategoryLabel = (categoryId: ItemCategory): string => {
  return ITEM_CATEGORIES.find(c => c.id === categoryId)?.label || "";
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Convert ImageData to base64 - handles File, URL string, or base64 string
const imageDataToBase64 = async (imageData: { file?: File; preview?: string }): Promise<string> => {
  // If preview is already base64, return it directly
  if (imageData.preview && imageData.preview.startsWith('data:')) {
    return imageData.preview;
  }
  
  // If file is a valid File object, convert it
  if (imageData.file && imageData.file instanceof File) {
    return fileToBase64(imageData.file);
  }
  
  // If preview is a URL, fetch and convert
  if (imageData.preview && (imageData.preview.startsWith('http') || imageData.preview.startsWith('/'))) {
    return urlToBase64(imageData.preview);
  }
  
  // Fallback: try to use preview as-is or throw error
  if (imageData.preview) {
    return imageData.preview;
  }
  
  throw new Error('No valid image data found');
};

// Fetch and convert URL to base64
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        if (result && result.startsWith('data:')) {
          resolve(result);
        } else {
          reject(new Error('Invalid base64 format'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Error converting URL to base64:', error);
    throw error;
  }
};

// Check if a string is valid base64 with header
const isValidBase64 = (str: string): boolean => {
  return str && typeof str === 'string' && str.startsWith('data:image');
};

// Ensure image has valid base64 format
const ensureValidBase64 = async (imageData: string): Promise<string | null> => {
  if (!imageData) return null;
  
  if (isValidBase64(imageData)) {
    return imageData;
  }
  
  if (imageData.startsWith('http://') || imageData.startsWith('https://') || imageData.startsWith('/')) {
    try {
      return await urlToBase64(imageData);
    } catch (e) {
      console.error('Failed to convert URL to base64:', e);
      return null;
    }
  }
  
  if (imageData.length > 100 && !imageData.includes(' ')) {
    return 'data:image/png;base64,' + imageData;
  }
  
  return null;
};

// Get image dimensions from base64
const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = base64;
  });
};

// Calculate dimensions to fit image in area while preserving aspect ratio (contain)
const fitImageInArea = (
  imgWidth: number,
  imgHeight: number,
  areaWidth: number,
  areaHeight: number,
  areaX: number,
  areaY: number
): { x: number; y: number; w: number; h: number } => {
  const imgRatio = imgWidth / imgHeight;
  const areaRatio = areaWidth / areaHeight;
  
  let finalW: number;
  let finalH: number;
  
  if (imgRatio > areaRatio) {
    // Image is wider than area - fit by width
    finalW = areaWidth;
    finalH = areaWidth / imgRatio;
  } else {
    // Image is taller than area - fit by height
    finalH = areaHeight;
    finalW = areaHeight * imgRatio;
  }
  
  // Center in area
  const x = areaX + (areaWidth - finalW) / 2;
  const y = areaY + (areaHeight - finalH) / 2;
  
  return { x, y, w: finalW, h: finalH };
};

// Calculate dimensions to cover area while preserving aspect ratio (cover - crop excess)
const coverImageInArea = (
  imgWidth: number,
  imgHeight: number,
  areaWidth: number,
  areaHeight: number
): { w: number; h: number } => {
  const imgRatio = imgWidth / imgHeight;
  const areaRatio = areaWidth / areaHeight;
  
  let finalW: number;
  let finalH: number;
  
  if (imgRatio > areaRatio) {
    // Image is wider - fit by height, width will overflow
    finalH = areaHeight;
    finalW = areaHeight * imgRatio;
  } else {
    // Image is taller - fit by width, height will overflow
    finalW = areaWidth;
    finalH = areaWidth / imgRatio;
  }
  
  return { w: finalW, h: finalH };
};

// 3:2 slide dimensions (in inches)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 6.67;

// Logo dimensions (fixed aspect ratio ~4.88:1)
const LOGO_W = 1.6;
const LOGO_H = 0.33;

// Margins and spacing
const MARGIN = 0.4;
const LOGO_MARGIN = 0.3;
const TITLE_HEIGHT = 1.0; // Space for title + underline
const FOOTER_HEIGHT = 0.6; // Space reserved for logo at bottom

// Add logo in footer area (bottom right, within safe margin)
const addLogo = (slide: PptxGenJS.Slide, logoBase64: string | null) => {
  if (!logoBase64 || !isValidBase64(logoBase64)) return;
  
  slide.addImage({
    data: logoBase64,
    x: SLIDE_WIDTH - LOGO_W - LOGO_MARGIN,
    y: SLIDE_HEIGHT - LOGO_H - LOGO_MARGIN,
    w: LOGO_W,
    h: LOGO_H
  });
};

// Add logo overlay for fullscreen images (no background)
const addLogoOverlay = (slide: PptxGenJS.Slide, logoBase64: string | null) => {
  if (!logoBase64 || !isValidBase64(logoBase64)) return;
  
  slide.addImage({
    data: logoBase64,
    x: SLIDE_WIDTH - LOGO_W - LOGO_MARGIN,
    y: SLIDE_HEIGHT - LOGO_H - LOGO_MARGIN,
    w: LOGO_W,
    h: LOGO_H
  });
};

// Add title with underline
const addSectionTitle = (slide: PptxGenJS.Slide, title: string) => {
  slide.addText(title, {
    x: MARGIN, y: 0.3, w: 5, h: 0.5,
    fontSize: 28, bold: true, color: "000000", fontFace: "Montserrat"
  });
  slide.addShape("line", {
    x: MARGIN, y: 0.85, w: 4, h: 0,
    line: { color: "000000", width: 2 }
  });
};

// Add image preserving aspect ratio (no distortion)
const addImagePreserved = async (
  slide: PptxGenJS.Slide,
  base64: string,
  areaX: number,
  areaY: number,
  areaW: number,
  areaH: number
) => {
  const dims = await getImageDimensions(base64);
  const pos = fitImageInArea(dims.width, dims.height, areaW, areaH, areaX, areaY);
  
  slide.addImage({
    data: base64,
    x: pos.x,
    y: pos.y,
    w: pos.w,
    h: pos.h
  });
};

// Calculate content area for slides with title (excludes title area and footer for logo)
const getContentArea = () => ({
  x: MARGIN,
  y: TITLE_HEIGHT,
  w: SLIDE_WIDTH - (MARGIN * 2),
  h: SLIDE_HEIGHT - TITLE_HEIGHT - FOOTER_HEIGHT
});

export const generatePresentation = async (data: PresentationData): Promise<void> => {
  const pptx = new PptxGenJS();
  
  // Load logo with validation
  let logoBase64: string | null = null;
  try {
    logoBase64 = await ensureValidBase64("/logo-arqexpress.png");
  } catch (e) {
    console.error('Failed to load logo:', e);
  }
  
  // Set presentation properties
  pptx.author = "ARQEXPRESS";
  pptx.title = data.projectName;
  pptx.subject = "Apresentação de Projeto de Arquitetura";
  pptx.company = "ARQEXPRESS";
  
  // Set 3:2 layout
  pptx.defineLayout({ name: "LAYOUT_3x2", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  pptx.layout = "LAYOUT_3x2";

  // =====================
  // Slide 1: Cover with Logo (new elegant layout)
  // =====================
  const slideCover = pptx.addSlide();
  
  // Top decorative line
  const lineWidth = 1.5;
  slideCover.addShape("line", {
    x: (SLIDE_WIDTH - lineWidth) / 2, y: 1.8, w: lineWidth, h: 0,
    line: { color: "000000", width: 1 }
  });
  
  // Logo centered (only if valid)
  const coverLogoW = 3.5;
  const coverLogoH = 0.72;
  if (logoBase64 && isValidBase64(logoBase64)) {
    slideCover.addImage({
      data: logoBase64,
      x: (SLIDE_WIDTH - coverLogoW) / 2,
      y: 2.3,
      w: coverLogoW,
      h: coverLogoH
    });
  } else {
    slideCover.addText("ARQEXPRESS", {
      x: (SLIDE_WIDTH - coverLogoW) / 2,
      y: 2.3,
      w: coverLogoW,
      h: coverLogoH,
      fontSize: 28,
      bold: true,
      color: "333333",
      align: "center",
      valign: "middle",
      fontFace: "Montserrat"
    });
  }
  
  // Project Phase (e.g., "ENTREGA FINAL") - with letter spacing
  slideCover.addText(data.projectPhase.toUpperCase(), {
    x: 0, y: 3.3, w: "100%", h: 0.6,
    fontSize: 22, bold: false, align: "center", color: "000000", fontFace: "Montserrat",
    charSpacing: 8
  });
  
  // Project Name (client name)
  slideCover.addText(data.projectName, {
    x: 0, y: 3.9, w: "100%", h: 0.5,
    fontSize: 16, bold: false, align: "center", color: "666666", fontFace: "Montserrat"
  });
  
  // Bottom decorative line
  slideCover.addShape("line", {
    x: (SLIDE_WIDTH - lineWidth) / 2, y: 4.7, w: lineWidth, h: 0,
    line: { color: "000000", width: 1 }
  });

  // =====================
  // Slide 2: Project Intro with Client Data
  // =====================
  if (data.renders.length > 0) {
    const slideIntro = pptx.addSlide();
    const client = data.clientData;
    
    // Left side - Client name (big, bold)
    slideIntro.addText(client.clientName.toUpperCase() || "NOME DO CLIENTE", {
      x: MARGIN, y: 0.35, w: 4.5, h: 0.5,
      fontSize: 24, bold: true, color: "000000", fontFace: "Montserrat"
    });
    
    // Project code
    slideIntro.addText(client.projectCode || "", {
      x: MARGIN, y: 0.8, w: 4.5, h: 0.3,
      fontSize: 11, bold: false, color: "666666", fontFace: "Montserrat"
    });
    
    // Project name (environment)
    slideIntro.addText(data.projectName.toUpperCase(), {
      x: MARGIN, y: 1.2, w: 4.5, h: 0.4,
      fontSize: 16, bold: true, color: "000000", fontFace: "Montserrat"
    });
    
    // Client data fields
    const clientFields = [
      `Nome: ${client.clientName || ""}`,
      `Telefone: ${client.phone || ""}`,
      `Endereço: ${client.address || ""}`,
      `CEP/BAIRRO: ${client.cepBairro || ""}`,
      `CPF: ${client.cpf || ""}`,
      `Arquiteta Responsável: ${client.architect || ""}`,
      `Data de Início: ${client.startDate || ""}`
    ].join("\n");
    
    slideIntro.addText(clientFields, {
      x: MARGIN, y: 1.7, w: 4.5, h: 2.2,
      fontSize: 10, color: "000000", fontFace: "Montserrat", lineSpacing: 18
    });
    
    // Divider line
    slideIntro.addShape("line", {
      x: MARGIN, y: 4.0, w: 4.3, h: 0,
      line: { color: "CCCCCC", width: 0.5 }
    });
    
    // Project phases list with current phase in bold
    const phases = [
      "APRESENTAÇÃO DE PROJETO",
      "REVISÃO DE PROJETO",
      "MANUAL DE DETALHAMENTO",
      "ENTREGA FINAL"
    ];
    
    const phaseMapping: Record<string, string> = {
      "Apresentação de Projeto": "APRESENTAÇÃO DE PROJETO",
      "Revisão de Projeto": "REVISÃO DE PROJETO",
      "Manual de Detalhamento": "MANUAL DE DETALHAMENTO",
      "Entrega Final": "ENTREGA FINAL"
    };
    
    const currentPhaseText = phaseMapping[data.projectPhase] || data.projectPhase.toUpperCase();
    
    let phaseY = 4.2;
    phases.forEach((phase) => {
      const isCurrentPhase = phase === currentPhaseText;
      slideIntro.addText(`•  ${phase}`, {
        x: MARGIN, y: phaseY, w: 4.5, h: 0.25,
        fontSize: 9, 
        bold: isCurrentPhase, 
        color: isCurrentPhase ? "000000" : "999999", 
        fontFace: "Montserrat"
      });
      phaseY += 0.28;
    });
    
    // Right side - First render with border
    const rightAreaX = 5.1;
    const rightAreaY = 0.35;
    const rightAreaW = 4.5;
    const rightAreaH = 5.4;
    
    const base64 = await imageDataToBase64(data.renders[0]);
    slideIntro.addShape("rect", {
      x: rightAreaX - 0.05, y: rightAreaY - 0.05, 
      w: rightAreaW + 0.1, h: rightAreaH + 0.1,
      line: { color: "000000", width: 2 },
      fill: { type: "solid", color: "FFFFFF" }
    });
    await addImagePreserved(slideIntro, base64, rightAreaX, rightAreaY, rightAreaW, rightAreaH);
    
    addLogo(slideIntro, logoBase64);
  }

  // =====================
  // Slide 3: Before Photos
  // =====================
  if (data.photosBefore.length > 0) {
    const slideBefore = pptx.addSlide();
    addSectionTitle(slideBefore, "FOTO ANTES");
    
    const content = getContentArea();
    const count = Math.min(data.photosBefore.length, 4);
    const gap = 0.15;
    
    let positions: { x: number; y: number; w: number; h: number }[];
    
    if (count === 1) {
      positions = [{ x: content.x, y: content.y, w: content.w, h: content.h }];
    } else if (count === 2) {
      const colW = (content.w - gap) / 2;
      positions = [
        { x: content.x, y: content.y, w: colW, h: content.h },
        { x: content.x + colW + gap, y: content.y, w: colW, h: content.h }
      ];
    } else if (count === 3) {
      const colW = (content.w - gap * 2) / 3;
      positions = [
        { x: content.x, y: content.y, w: colW, h: content.h },
        { x: content.x + colW + gap, y: content.y, w: colW, h: content.h },
        { x: content.x + (colW + gap) * 2, y: content.y, w: colW, h: content.h }
      ];
    } else {
      // 4 images in 2x2 grid
      const colW = (content.w - gap) / 2;
      const rowH = (content.h - gap) / 2;
      positions = [
        { x: content.x, y: content.y, w: colW, h: rowH },
        { x: content.x + colW + gap, y: content.y, w: colW, h: rowH },
        { x: content.x, y: content.y + rowH + gap, w: colW, h: rowH },
        { x: content.x + colW + gap, y: content.y + rowH + gap, w: colW, h: rowH }
      ];
    }
    
    for (let i = 0; i < count; i++) {
      const base64 = await imageDataToBase64(data.photosBefore[i]);
      const pos = positions[i];
      await addImagePreserved(slideBefore, base64, pos.x, pos.y, pos.w, pos.h);
    }
    
    addLogo(slideBefore, logoBase64);
  }

  // =====================
  // Slide 4: Moodboard (single image, maximized)
  // =====================
  if (data.moodboard.length > 0) {
    const slideMood = pptx.addSlide();
    addSectionTitle(slideMood, "MOODBOARD");
    
    const content = getContentArea();
    const base64 = await imageDataToBase64(data.moodboard[0]);
    await addImagePreserved(slideMood, base64, content.x, content.y, content.w, content.h);
    
    addLogo(slideMood, logoBase64);
  }

  // =====================
  // Slides: References (3 per slide)
  // =====================
  if (data.references.length > 0) {
    const refsPerSlide = 3;
    const totalRefSlides = Math.ceil(data.references.length / refsPerSlide);
    
    for (let slideIdx = 0; slideIdx < totalRefSlides; slideIdx++) {
      const slideRef = pptx.addSlide();
      addSectionTitle(slideRef, "REFERÊNCIAS");
      
      const content = getContentArea();
      const gap = 0.15;
      const colW = (content.w - gap * 2) / 3;
      
      const positions = [
        { x: content.x, y: content.y, w: colW, h: content.h },
        { x: content.x + colW + gap, y: content.y, w: colW, h: content.h },
        { x: content.x + (colW + gap) * 2, y: content.y, w: colW, h: content.h }
      ];
      
      const startIdx = slideIdx * refsPerSlide;
      const endIdx = Math.min(startIdx + refsPerSlide, data.references.length);
      
      for (let i = startIdx; i < endIdx; i++) {
        const base64 = await imageDataToBase64(data.references[i]);
        const pos = positions[i - startIdx];
        await addImagePreserved(slideRef, base64, pos.x, pos.y, pos.w, pos.h);
      }
      
      addLogo(slideRef, logoBase64);
    }
  }
  // Floor Plan section removed - now only using Layout de Projeto

  // =====================
  // Slide(s): LAYOUT DE PROJETO - Clean professional layout
  // =====================
  const layoutImage = data.floorPlanLayout?.originalImage;
  const layoutItems = data.floorPlanLayout?.items || [];
    
  if (layoutImage && layoutItems.length > 0) {
    const slideLayout = pptx.addSlide();
    
    // Title "LAYOUT DE PROJETO" - bold, clean
    slideLayout.addText("LAYOUT DE PROJETO", {
      x: MARGIN, y: 0.35, w: 5, h: 0.45,
      fontSize: 22, bold: true, color: "000000", fontFace: "Arial"
    });
    
    // Underline
    slideLayout.addShape("line", {
      x: MARGIN, y: 0.85, w: 1.2, h: 0,
      line: { color: "F59E0B", width: 3 }
    });
    
    // Content area
    const contentY = 1.1;
    const contentH = SLIDE_HEIGHT - contentY - FOOTER_HEIGHT - 0.2;
    
    // Image area (left side - 70% width)
    const imageAreaW = (SLIDE_WIDTH - MARGIN * 2) * 0.68;
    const legendAreaX = MARGIN + imageAreaW + 0.4;
    const legendAreaW = SLIDE_WIDTH - legendAreaX - MARGIN;
    
    // Add the floor plan image
    await addImagePreserved(slideLayout, layoutImage, MARGIN, contentY, imageAreaW, contentH);
    
    // Legend title
    slideLayout.addText("LEGENDA", {
      x: legendAreaX, y: contentY, w: legendAreaW, h: 0.35,
      fontSize: 12, bold: true, color: "000000", fontFace: "Arial"
    });
    
    // Legend items - compact list with colored circles
    const itemHeight = 0.28;
    const legendStartY = contentY + 0.5;
    const maxLegendItems = Math.min(layoutItems.length, Math.floor((contentH - 0.5) / itemHeight));
    
    for (let i = 0; i < maxLegendItems; i++) {
      const item = layoutItems[i];
      const itemY = legendStartY + (i * itemHeight);
      const categoryColor = getCategoryColor(item.category);
      
      // Colored circle with number
      const circleSize = 0.22;
      slideLayout.addShape("ellipse", {
        x: legendAreaX, y: itemY, w: circleSize, h: circleSize,
        fill: { type: "solid", color: categoryColor }
      });
      
      slideLayout.addText(String(item.number), {
        x: legendAreaX, y: itemY, w: circleSize, h: circleSize,
        fontSize: 8, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: "Arial"
      });
      
      // Item name - lowercase for elegance
      slideLayout.addText(item.name.toLowerCase(), {
        x: legendAreaX + circleSize + 0.12, y: itemY, w: legendAreaW - circleSize - 0.15, h: circleSize,
        fontSize: 9, color: "333333", fontFace: "Arial", valign: "middle"
      });
    }
    
    // If more items exist
    if (layoutItems.length > maxLegendItems) {
      const moreY = legendStartY + (maxLegendItems * itemHeight);
      slideLayout.addText(`+${layoutItems.length - maxLegendItems} mais itens...`, {
        x: legendAreaX, y: moreY, w: legendAreaW, h: 0.2,
        fontSize: 7, color: "999999", fontFace: "Arial", italic: true
      });
    }
    
    addLogo(slideLayout, logoBase64);
  }

  // =====================
  // Slide: PLANTA BAIXA (imagem limpa, sem marcações)
  // =====================
  if (data.floorPlan && data.floorPlan.length > 0) {
    const slideFloorPlan = pptx.addSlide();
    
    addSectionTitle(slideFloorPlan, "PLANTA BAIXA");
    
    const content = getContentArea();
    const base64 = await imageDataToBase64(data.floorPlan[0]);
    await addImagePreserved(slideFloorPlan, base64, content.x, content.y, content.w, content.h);
    
    addLogo(slideFloorPlan, logoBase64);
  }

  // =====================
  // Render Slides (fullscreen - always preserve aspect ratio, no distortion)
  // =====================
  for (let i = 0; i < data.renders.length; i++) {
    const slideRender = pptx.addSlide();
    
    const base64 = await imageDataToBase64(data.renders[i]);
    
    // Always use contain to preserve aspect ratio - no cropping, no distortion
    await addImagePreserved(slideRender, base64, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT - FOOTER_HEIGHT);
    addLogo(slideRender, logoBase64);
  }

  // =====================
  // Slide(s): LISTA DE COMPRAS - All items in order with ambiente column
  // =====================
  const floorPlanItems = data.floorPlanLayout?.items || [];
  const complementaryItems = data.complementaryItems?.items || [];
  const allItems = [...floorPlanItems, ...complementaryItems];
  
  const ITEMS_PER_PAGE = 10;
  const categoryOrder: ItemCategory[] = ['mobiliario', 'marcenaria', 'marmoraria', 'decoracao', 'iluminacao', 'materiais', 'eletrica', 'hidraulica', 'maoDeObra', 'outros'];
  
  if (allItems.length > 0) {
    // Sort all items by number (sequential order)
    const sortedItems = [...allItems].sort((a, b) => a.number - b.number);
    
    // Split into pages of 10 items each
    const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
    
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const slideCompras = pptx.addSlide();
      
      // Title "LISTA DE COMPRAS"
      const pageLabel = totalPages > 1 ? ` (${pageIdx + 1}/${totalPages})` : '';
      slideCompras.addText(`LISTA DE COMPRAS${pageLabel}`, {
        x: MARGIN, y: 0.35, w: 6, h: 0.5,
        fontSize: 24, bold: true, color: "000000", fontFace: "Arial"
      });
      
      // Yellow underline
      slideCompras.addShape("line", {
        x: MARGIN, y: 0.9, w: 2.5, h: 0,
        line: { color: "F59E0B", width: 3 }
      });
      
      // Get items for this page
      const startIdx = pageIdx * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, sortedItems.length);
      const pageItems = sortedItems.slice(startIdx, endIdx);
      
      // Render items in a clean vertical list
      let yPos = 1.2;
      const itemHeight = 0.45;
      
      for (const item of pageItems) {
        const catColor = getCategoryColor(item.category);
        const circleSize = 0.35;
        
        // Colored circle with number - larger for 2-digit numbers
        slideCompras.addShape("ellipse", {
          x: MARGIN, y: yPos, w: circleSize, h: circleSize,
          fill: { type: "solid", color: catColor }
        });
        
        // Number - smaller font to fit 2 digits
        slideCompras.addText(String(item.number), {
          x: MARGIN, y: yPos, w: circleSize, h: circleSize,
          fontSize: item.number >= 10 ? 10 : 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: "Arial"
        });
        
        // Item name - uppercase, bold
        slideCompras.addText(item.name.toUpperCase(), {
          x: MARGIN + circleSize + 0.2, y: yPos, w: 4.5, h: circleSize,
          fontSize: 12, bold: true, color: "000000", fontFace: "Arial", valign: "middle"
        });
        
        // Ambiente - right aligned, gray
        slideCompras.addText(item.ambiente, {
          x: 6.5, y: yPos, w: 3, h: circleSize,
          fontSize: 11, color: "666666", fontFace: "Arial", valign: "middle"
        });
        
        yPos += itemHeight;
      }
      
      // Category legend at bottom - show categories used on this page
      const legendY = SLIDE_HEIGHT - FOOTER_HEIGHT - 0.35;
      let legendX = MARGIN;
      const legendItemW = 1.1;
      
      // Get unique categories from page items
      const usedCategories = [...new Set(pageItems.map(i => i.category))];
      
      for (const catId of categoryOrder) {
        if (!usedCategories.includes(catId)) continue;
        
        const catColor = getCategoryColor(catId);
        const catLabel = getCategoryLabel(catId);
        
        // Small colored square
        slideCompras.addShape("rect", {
          x: legendX, y: legendY, w: 0.14, h: 0.14,
          fill: { type: "solid", color: catColor }
        });
        
        // Category name
        slideCompras.addText(catLabel, {
          x: legendX + 0.18, y: legendY - 0.02, w: legendItemW - 0.22, h: 0.2,
          fontSize: 7, color: "666666", fontFace: "Arial", valign: "middle"
        });
        
        legendX += legendItemW;
      }
      
      addLogo(slideCompras, logoBase64);
    }
  }

  // =====================
  // Final Slide: Logo Only
  // =====================
  const slideEnd = pptx.addSlide();
  const endLogoW = 4;
  const endLogoH = 0.82;
  
  if (logoBase64 && isValidBase64(logoBase64)) {
    slideEnd.addImage({
      data: logoBase64,
      x: (SLIDE_WIDTH - endLogoW) / 2,
      y: (SLIDE_HEIGHT - endLogoH) / 2,
      w: endLogoW,
      h: endLogoH
    });
  } else {
    slideEnd.addText("ARQEXPRESS", {
      x: (SLIDE_WIDTH - endLogoW) / 2,
      y: (SLIDE_HEIGHT - 1) / 2,
      w: endLogoW,
      h: 1,
      fontSize: 28,
      bold: true,
      color: "333333",
      align: "center",
      valign: "middle",
      fontFace: "Montserrat"
    });
  }

  // Generate filename
  const safeName = data.projectName
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `ArqExpress_${safeName}_${timestamp}`;

  // Download PPTX only
  await pptx.writeFile({ fileName: filename });
};