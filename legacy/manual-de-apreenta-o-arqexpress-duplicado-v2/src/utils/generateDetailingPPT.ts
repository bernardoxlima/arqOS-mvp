import PptxGenJS from "pptxgenjs";
import { FloorPlanItem } from "@/types/presentation";
import { CATEGORY_ORDER, getCategoryColor as getColorFromConfig, CATEGORY_DEFINITIONS } from "@/config/categories";

// Get category color for PPT (hex without #)
const getCategoryColor = (categoryId: string): string => {
  return getColorFromConfig(categoryId as any) || "6B7280";
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
        // Ensure it has the proper data: prefix
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

// Convert image to valid base64 format
const ensureValidBase64 = async (imageData: string): Promise<string | null> => {
  if (!imageData) return null;
  
  // Already valid base64
  if (isValidBase64(imageData)) {
    return imageData;
  }
  
  // URL - need to fetch and convert
  if (imageData.startsWith('http://') || imageData.startsWith('https://') || imageData.startsWith('/')) {
    try {
      return await urlToBase64(imageData);
    } catch (e) {
      console.error('Failed to convert URL to base64:', e);
      return null;
    }
  }
  
  // Raw base64 without header - try to add header
  if (imageData.length > 100 && !imageData.includes(' ')) {
    // Try to determine image type from base64
    const header = 'data:image/png;base64,';
    return header + imageData;
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

// Calculate dimensions to fit image in area while preserving aspect ratio
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
    finalW = areaWidth;
    finalH = areaWidth / imgRatio;
  } else {
    finalH = areaHeight;
    finalW = areaHeight * imgRatio;
  }
  
  const x = areaX + (areaWidth - finalW) / 2;
  const y = areaY + (areaHeight - finalH) / 2;
  
  return { x, y, w: finalW, h: finalH };
};

// 3:2 slide dimensions (in inches)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 6.67;
const MARGIN = 0.3;
const LOGO_W = 1.6;
const LOGO_H = 0.33;
const LOGO_MARGIN = 0.3;

// Add logo in footer area (only if valid)
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

// Add image preserving aspect ratio
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

interface DetailingData {
  projectName: string;
  floorPlanImage: string | null;
  items: FloorPlanItem[];
}

export const generateDetailingPPT = async (data: DetailingData): Promise<void> => {
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
  pptx.title = `Detalhamento Técnico - ${data.projectName}`;
  pptx.subject = "Detalhamento Técnico";
  pptx.company = "ARQEXPRESS";
  
  // Set 3:2 layout
  pptx.defineLayout({ name: "LAYOUT_3x2", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  pptx.layout = "LAYOUT_3x2";

  // Sort ALL items globally by category, then ambiente, then number
  const allItemsSorted = [...data.items].sort((a, b) => {
    const catOrderA = CATEGORY_ORDER.indexOf(a.category) !== -1 ? CATEGORY_ORDER.indexOf(a.category) : 999;
    const catOrderB = CATEGORY_ORDER.indexOf(b.category) !== -1 ? CATEGORY_ORDER.indexOf(b.category) : 999;
    if (catOrderA !== catOrderB) return catOrderA - catOrderB;
    
    const ambienteCompare = (a.ambiente || "Geral").localeCompare(b.ambiente || "Geral");
    if (ambienteCompare !== 0) return ambienteCompare;
    
    return a.number - b.number;
  });
  
  // Renumber ALL items sequentially to avoid duplicates
  const renumberedItems = allItemsSorted.map((item, index) => ({
    ...item,
    number: index + 1
  }));

  // Group renumbered items by category
  const itemsByCategory: Record<string, FloorPlanItem[]> = {};
  
  renumberedItems.forEach(item => {
    const category = item.category || 'outros';
    if (!itemsByCategory[category]) {
      itemsByCategory[category] = [];
    }
    itemsByCategory[category].push(item);
  });
  
  // Sort categories by CATEGORY_ORDER
  const sortedCategories = CATEGORY_ORDER.filter(cat => itemsByCategory[cat] && itemsByCategory[cat].length > 0);
  
  // Process floor plan image once with validation
  let floorPlanBase64: string | null = null;
  if (data.floorPlanImage) {
    floorPlanBase64 = await ensureValidBase64(data.floorPlanImage);
  }
  
  // ===== Create one slide per category =====
  for (const categoryId of sortedCategories) {
    const categoryItems = itemsByCategory[categoryId];
    const categoryDef = CATEGORY_DEFINITIONS.find(c => c.id === categoryId);
    const categoryLabel = categoryDef?.label || categoryId.toUpperCase();
    const categoryColor = getCategoryColor(categoryId);
    
    // Sort items within category by ambiente
    categoryItems.sort((a, b) => {
      const ambienteCompare = (a.ambiente || "Geral").localeCompare(b.ambiente || "Geral");
      if (ambienteCompare !== 0) return ambienteCompare;
      return a.number - b.number;
    });
    
    // Calculate items per slide - max ~18 items per slide
    const ITEMS_PER_SLIDE = 18;
    const totalSlides = Math.max(1, Math.ceil(categoryItems.length / ITEMS_PER_SLIDE));
    
    for (let slideIdx = 0; slideIdx < totalSlides; slideIdx++) {
      const slide = pptx.addSlide();
      
      // ===== Header Section =====
      // Category title with category color
      slide.addText(categoryLabel.toUpperCase(), {
        x: MARGIN, y: 0.2, w: 4, h: 0.4,
        fontSize: 18, bold: true, color: categoryColor, fontFace: "Montserrat"
      });
      
      slide.addShape("line", {
        x: MARGIN, y: 0.6, w: 2.5, h: 0,
        line: { color: categoryColor, width: 3 }
      });
      
      // Subtitle with page number if multiple slides
      const subtitle = totalSlides > 1 
        ? `DETALHAMENTO TÉCNICO - PÁGINA ${slideIdx + 1} DE ${totalSlides}` 
        : "DETALHAMENTO TÉCNICO";
      slide.addText(subtitle, {
        x: MARGIN, y: 0.7, w: 4, h: 0.3,
        fontSize: 10, bold: false, color: "666666", fontFace: "Montserrat"
      });
      
      // ===== Left Side: Floor Plan (60% of width) =====
      const floorPlanAreaX = MARGIN;
      const floorPlanAreaY = 1.1;
      const floorPlanAreaW = 5.8;
      const floorPlanAreaH = 4.8;
      
      // Background box for floor plan area
      slide.addShape("rect", {
        x: floorPlanAreaX, y: floorPlanAreaY, w: floorPlanAreaW, h: floorPlanAreaH,
        fill: { type: "solid", color: "F8F9FA" },
        line: { color: "E5E7EB", width: 1 }
      });
      
      if (floorPlanBase64) {
        await addImagePreserved(
          slide,
          floorPlanBase64,
          floorPlanAreaX + 0.1,
          floorPlanAreaY + 0.1,
          floorPlanAreaW - 0.2,
          floorPlanAreaH - 0.2
        );
      } else {
        // Placeholder text if no floor plan
        slide.addText("PLANTA BAIXA\nNão disponível", {
          x: floorPlanAreaX, y: floorPlanAreaY, w: floorPlanAreaW, h: floorPlanAreaH,
          fontSize: 14, color: "999999", align: "center", valign: "middle", fontFace: "Montserrat"
        });
      }
      
      // Legend indicator
      slide.addText("LEGENDA", {
        x: floorPlanAreaX, y: floorPlanAreaY + floorPlanAreaH + 0.05, w: 1, h: 0.2,
        fontSize: 8, bold: true, color: categoryColor, fontFace: "Montserrat"
      });
      
      // ===== Right Side: Item List (40% of width) =====
      const listAreaX = 6.3;
      const listAreaY = 1.1;
      const listAreaW = SLIDE_WIDTH - listAreaX - MARGIN;
      
      // Header for item list
      slide.addText("ITENS DA CATEGORIA", {
        x: listAreaX, y: listAreaY - 0.1, w: listAreaW, h: 0.25,
        fontSize: 9, bold: true, color: categoryColor, fontFace: "Montserrat"
      });
      
      // Item list
      const startItemIdx = slideIdx * ITEMS_PER_SLIDE;
      const endItemIdx = Math.min(startItemIdx + ITEMS_PER_SLIDE, categoryItems.length);
      
      let currentAmbiente = "";
      let adjustedY = listAreaY + 0.25;
      const itemHeight = 0.24;
      
      for (let i = startItemIdx; i < endItemIdx; i++) {
        const item = categoryItems[i];
        
        // Add ambiente header if changed
        if (item.ambiente !== currentAmbiente) {
          currentAmbiente = item.ambiente;
          
          // Ambiente header
          slide.addText(currentAmbiente.toUpperCase(), {
            x: listAreaX, y: adjustedY, w: listAreaW, h: 0.2,
            fontSize: 7, bold: true, color: "888888", fontFace: "Montserrat"
          });
          adjustedY += 0.22;
        }
        
        if (adjustedY > SLIDE_HEIGHT - 0.9) break;
        
        // Dynamic sizing based on number of digits
        const numDigits = String(item.number).length;
        const circleSize = numDigits >= 3 ? 0.3 : 0.26;
        const numFontSize = numDigits >= 3 ? 7 : numDigits >= 2 ? 8 : 9;
        
        // Colored circle with number
        slide.addShape("ellipse", {
          x: listAreaX, y: adjustedY, w: circleSize, h: circleSize,
          fill: { type: "solid", color: categoryColor }
        });
        
        slide.addText(String(item.number), {
          x: listAreaX, y: adjustedY, w: circleSize, h: circleSize,
          fontSize: numFontSize, bold: true, color: "FFFFFF", 
          align: "center", valign: "middle", fontFace: "Montserrat"
        });
        
        // Item name
        slide.addText(item.name.toUpperCase(), {
          x: listAreaX + circleSize + 0.08, y: adjustedY, w: listAreaW - circleSize - 0.1, h: circleSize,
          fontSize: 8, bold: false, color: "333333", fontFace: "Montserrat", valign: "middle"
        });
        
        adjustedY += itemHeight;
      }
      
      // Item count summary
      const itemCountText = `${categoryItems.length} ${categoryItems.length === 1 ? 'item' : 'itens'}`;
      slide.addText(itemCountText, {
        x: listAreaX, y: SLIDE_HEIGHT - 0.8, w: listAreaW, h: 0.2,
        fontSize: 8, bold: false, color: "666666", fontFace: "Montserrat"
      });
      
      addLogo(slide, logoBase64);
    }
  }

  // ===== Final Slide: Logo Only =====
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
      fontSize: 24,
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
  const filename = `ArqExpress_Detalhamento_${safeName}_${timestamp}`;

  // Download PPTX
  await pptx.writeFile({ fileName: filename });
};
