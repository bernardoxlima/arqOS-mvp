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
const MARGIN = 0.4;
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

interface ShoppingListData {
  projectName: string;
  items: FloorPlanItem[];
}

export const generateShoppingListPPT = async (data: ShoppingListData): Promise<void> => {
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
  pptx.title = `Lista de Compras - ${data.projectName}`;
  pptx.subject = "Lista de Compras";
  pptx.company = "ARQEXPRESS";
  
  // Set 3:2 layout
  pptx.defineLayout({ name: "LAYOUT_3x2", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  pptx.layout = "LAYOUT_3x2";

  // FIRST: Sort ALL items globally by category, then ambiente, then original number
  const allItemsSorted = [...data.items].sort((a, b) => {
    const catOrderA = CATEGORY_ORDER.indexOf(a.category) !== -1 ? CATEGORY_ORDER.indexOf(a.category) : 999;
    const catOrderB = CATEGORY_ORDER.indexOf(b.category) !== -1 ? CATEGORY_ORDER.indexOf(b.category) : 999;
    if (catOrderA !== catOrderB) return catOrderA - catOrderB;
    
    const ambienteCompare = (a.ambiente || "Geral").localeCompare(b.ambiente || "Geral");
    if (ambienteCompare !== 0) return ambienteCompare;
    
    return a.number - b.number;
  });
  
  // SECOND: Renumber ALL items sequentially (1, 2, 3, ...) to avoid duplicates
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
  
  // Process each category - one section per category
  for (const categoryId of sortedCategories) {
    const categoryItems = itemsByCategory[categoryId];
    const categoryDef = CATEGORY_DEFINITIONS.find(c => c.id === categoryId);
    const categoryLabel = categoryDef?.label || categoryId.toUpperCase();
    const categoryColor = getCategoryColor(categoryId);
    
    // Sort items within category by ambiente (numbers are already sequential)
    categoryItems.sort((a, b) => {
      const ambienteCompare = (a.ambiente || "Geral").localeCompare(b.ambiente || "Geral");
      if (ambienteCompare !== 0) return ambienteCompare;
      return a.number - b.number;
    });
    
    // Items with photos - 3 per slide on the right side
    const itemsWithPhotos = categoryItems.filter(item => item.imagem || item.link);
    const PHOTOS_PER_SLIDE = 3;
    const ITEMS_PER_SLIDE = 15;
    
    // Calculate how many slides we need
    const totalSlides = Math.max(1, Math.ceil(Math.max(categoryItems.length / ITEMS_PER_SLIDE, itemsWithPhotos.length / PHOTOS_PER_SLIDE)));
    
    for (let slideIdx = 0; slideIdx < totalSlides; slideIdx++) {
      const slide = pptx.addSlide();
      
      // ===== Header Section =====
      // Category title with category color
      slide.addText(categoryLabel.toUpperCase(), {
        x: MARGIN, y: 0.25, w: 4, h: 0.4,
        fontSize: 20, bold: true, color: categoryColor, fontFace: "Montserrat"
      });
      
      slide.addShape("line", {
        x: MARGIN, y: 0.68, w: 3, h: 0,
        line: { color: categoryColor, width: 3 }
      });
      
      // Subtitle with page number if multiple slides
      const subtitle = totalSlides > 1 ? `PÁGINA ${slideIdx + 1} DE ${totalSlides}` : "LISTA DE COMPRAS";
      slide.addText(subtitle, {
        x: MARGIN, y: 0.8, w: 4, h: 0.35,
        fontSize: 12, bold: false, color: "666666", fontFace: "Montserrat"
      });
      
      // ===== Left Side: Item List =====
      const listStartY = 1.25;
      const listWidth = 4;
      const itemHeight = 0.28;
      
      const startItemIdx = slideIdx * ITEMS_PER_SLIDE;
      const endItemIdx = Math.min(startItemIdx + ITEMS_PER_SLIDE, categoryItems.length);
      
      let currentAmbiente = "";
      let adjustedY = listStartY;
      
      for (let i = startItemIdx; i < endItemIdx; i++) {
        const item = categoryItems[i];
        
        // Add ambiente header if changed
        if (item.ambiente !== currentAmbiente) {
          currentAmbiente = item.ambiente;
          
          // Ambiente header
          slide.addText(currentAmbiente.toUpperCase(), {
            x: MARGIN, y: adjustedY, w: listWidth, h: 0.22,
            fontSize: 8, bold: true, color: "999999", fontFace: "Montserrat"
          });
          adjustedY += 0.25;
        }
        
        if (adjustedY > SLIDE_HEIGHT - 0.8) break; // Stop if we run out of space
        
        // Dynamic circle size based on number of digits
        const numDigits = String(item.number).length;
        const circleSize = numDigits >= 3 ? 0.38 : 0.32;
        // Dynamic font size: smaller for 2+ digits to prevent text breaking
        const numFontSize = numDigits >= 3 ? 8 : numDigits >= 2 ? 9 : 11;
        
        // Colored circle with number - using category color
        slide.addShape("ellipse", {
          x: MARGIN, y: adjustedY - 0.02, w: circleSize, h: circleSize,
          fill: { type: "solid", color: categoryColor }
        });
        
        slide.addText(String(item.number), {
          x: MARGIN, y: adjustedY - 0.02, w: circleSize, h: circleSize,
          fontSize: numFontSize, bold: true, color: "FFFFFF", 
          align: "center", valign: "middle", fontFace: "Montserrat"
        });
        
        // Item name
        slide.addText(item.name.toUpperCase(), {
          x: MARGIN + circleSize + 0.1, y: adjustedY, w: listWidth - circleSize - 0.15, h: circleSize,
          fontSize: 10, bold: false, color: "000000", fontFace: "Montserrat", valign: "middle"
        });
        
        adjustedY += itemHeight;
      }
      
      // ===== Right Side: Product Photos =====
      const photosStartX = 4.7;
      const photoAreaWidth = SLIDE_WIDTH - photosStartX - MARGIN;
      const photoStartY = 0.9;
      const photoEndY = SLIDE_HEIGHT - 0.8;
      const photoAreaHeight = (photoEndY - photoStartY) / PHOTOS_PER_SLIDE;
      
      const startPhotoIdx = slideIdx * PHOTOS_PER_SLIDE;
      const endPhotoIdx = Math.min(startPhotoIdx + PHOTOS_PER_SLIDE, itemsWithPhotos.length);
      
      for (let i = startPhotoIdx; i < endPhotoIdx; i++) {
        const item = itemsWithPhotos[i];
        const photoSlotIdx = i - startPhotoIdx;
        const slotY = photoStartY + (photoSlotIdx * photoAreaHeight);
        
        // Photo container dimensions
        const singlePhotoX = photosStartX;
        const singlePhotoW = photoAreaWidth * 0.45;
        const singlePhotoH = photoAreaHeight * 0.6;
        
        // Number badge on photo - using category color
        // Dynamic badge size and font based on number of digits
        const photoNumDigits = String(item.number).length;
        const badgeSize = photoNumDigits >= 3 ? 0.42 : 0.36;
        const badgeFontSize = photoNumDigits >= 3 ? 9 : photoNumDigits >= 2 ? 10 : 12;
        
        slide.addShape("ellipse", {
          x: singlePhotoX, y: slotY, w: badgeSize, h: badgeSize,
          fill: { type: "solid", color: categoryColor }
        });
        
        slide.addText(String(item.number), {
          x: singlePhotoX, y: slotY, w: badgeSize, h: badgeSize,
          fontSize: badgeFontSize, bold: true, color: "FFFFFF", 
          align: "center", valign: "middle", fontFace: "Montserrat"
        });
        
        // Product image
        if (item.imagem) {
          try {
            const imageBase64 = await ensureValidBase64(item.imagem);
            if (imageBase64) {
              await addImagePreserved(
                slide, 
                imageBase64, 
                singlePhotoX + 0.35, 
                slotY, 
                singlePhotoW, 
                singlePhotoH
              );
            } else {
              // Show placeholder if image conversion failed
              slide.addText("Imagem\nindisponível", {
                x: singlePhotoX + 0.35, y: slotY, w: singlePhotoW, h: singlePhotoH,
                fontSize: 8, color: "999999", align: "center", valign: "middle", fontFace: "Montserrat"
              });
            }
          } catch (e) {
            // If image fails, show placeholder text
            slide.addText("Imagem\nindisponível", {
              x: singlePhotoX + 0.35, y: slotY, w: singlePhotoW, h: singlePhotoH,
              fontSize: 8, color: "999999", align: "center", valign: "middle", fontFace: "Montserrat"
            });
          }
        }
        
        // Product name below image
        slide.addText(item.name.toUpperCase(), {
          x: singlePhotoX, y: slotY + singlePhotoH + 0.05, w: singlePhotoW + 0.35, h: 0.25,
          fontSize: 8, bold: true, color: "000000", fontFace: "Montserrat"
        });
        
        // Link below name (if exists)
        if (item.link) {
          const displayLink = item.link.length > 50 ? item.link.substring(0, 50) + "..." : item.link;
          slide.addText(displayLink, {
            x: singlePhotoX, y: slotY + singlePhotoH + 0.28, w: singlePhotoW + 0.35, h: 0.2,
            fontSize: 6, color: "0066CC", fontFace: "Montserrat",
            hyperlink: { url: item.link }
          });
        }
      }
      
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
  const filename = `ArqExpress_ListaCompras_${safeName}_${timestamp}`;

  // Download PPTX
  await pptx.writeFile({ fileName: filename });
};
