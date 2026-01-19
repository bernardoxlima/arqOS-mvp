import pptxgen from "pptxgenjs";
import { BudgetItem } from "@/types/budget";
import { FloorPlanItem, ITEM_CATEGORIES, ItemCategory } from "@/types/presentation";

interface BudgetExportData {
  projectName: string;
  clientName: string;
  address?: string;
  city?: string;
  areaM2?: number;
  items: FloorPlanItem[];
  budgetItems?: BudgetItem[];
}

// Category colors mapping
const CATEGORY_COLORS: Record<ItemCategory, string> = {
  mobiliario: "1E3A5F",
  marcenaria: "F59E0B",
  marmoraria: "8B4513",
  iluminacao: "F97316",
  decoracao: "8B5CF6",
  cortinas: "EC4899",
  materiais: "10B981",
  eletrica: "EF4444",
  hidraulica: "3B82F6",
  maoDeObra: "6B7280",
  acabamentos: "A855F7",
  outros: "800020",
};

// Category labels in Portuguese
const CATEGORY_LABELS: Record<ItemCategory, string> = {
  mobiliario: "MOBILIÁRIO",
  marcenaria: "MARCENARIA",
  marmoraria: "MARMORARIA",
  iluminacao: "ILUMINAÇÃO",
  decoracao: "DECORAÇÃO",
  cortinas: "CORTINAS",
  materiais: "MATERIAIS",
  eletrica: "ELÉTRICA",
  hidraulica: "HIDRÁULICA",
  maoDeObra: "MÃO DE OBRA",
  acabamentos: "ACABAMENTOS",
  outros: "OUTROS",
};

// Category order
const CATEGORY_ORDER: ItemCategory[] = [
  "materiais",
  "marcenaria",
  "iluminacao",
  "marmoraria",
  "mobiliario",
  "decoracao",
  "eletrica",
  "hidraulica",
  "maoDeObra",
  "acabamentos",
  "outros",
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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

// 3:2 slide dimensions (in inches) - matching shopping list PPT
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 6.67;
const MARGIN = 0.4;
const LOGO_W = 1.6;
const LOGO_H = 0.33;
const LOGO_MARGIN = 0.3;

// Add logo in footer area (only if valid)
const addLogo = (slide: pptxgen.Slide, logoBase64: string | null) => {
  if (!logoBase64 || !isValidBase64(logoBase64)) return;
  
  slide.addImage({
    data: logoBase64,
    x: SLIDE_WIDTH - LOGO_W - LOGO_MARGIN,
    y: SLIDE_HEIGHT - LOGO_H - LOGO_MARGIN,
    w: LOGO_W,
    h: LOGO_H
  });
};

export const generateBudgetPPT = async (data: BudgetExportData): Promise<void> => {
  const pptx = new pptxgen();
  
  // Load logo with validation
  let logoBase64: string | null = null;
  try {
    logoBase64 = await ensureValidBase64("/logo-arqexpress.png");
  } catch (e) {
    console.error('Failed to load logo:', e);
  }
  
  // Set presentation properties
  pptx.author = "ARQEXPRESS";
  pptx.title = `Orçamento - ${data.projectName}`;
  pptx.subject = "Orçamento";
  pptx.company = "ARQEXPRESS";
  
  // Set 3:2 layout (same as shopping list)
  pptx.defineLayout({ name: "LAYOUT_3x2", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  pptx.layout = "LAYOUT_3x2";
  
  // Calculate totals
  const grandTotal = data.budgetItems?.reduce((sum, item) => sum + item.valorCompleto, 0) || 0;
  const valorM2 = data.areaM2 && data.areaM2 > 0 ? grandTotal / data.areaM2 : 0;
  
  // FIRST: Sort ALL items globally by category, then ambiente, then original number
  const allItemsSorted = [...(data.budgetItems || [])].sort((a, b) => {
    const catOrderA = CATEGORY_ORDER.indexOf(a.category as ItemCategory) !== -1 ? CATEGORY_ORDER.indexOf(a.category as ItemCategory) : 999;
    const catOrderB = CATEGORY_ORDER.indexOf(b.category as ItemCategory) !== -1 ? CATEGORY_ORDER.indexOf(b.category as ItemCategory) : 999;
    if (catOrderA !== catOrderB) return catOrderA - catOrderB;
    
    const ambienteCompare = (a.ambiente || "Geral").localeCompare(b.ambiente || "Geral");
    if (ambienteCompare !== 0) return ambienteCompare;
    
    return a.number - b.number;
  });
  
  // SECOND: Renumber ALL items sequentially to avoid duplicates
  const renumberedItems = allItemsSorted.map((item, index) => ({
    ...item,
    number: index + 1
  }));
  
  // Group renumbered items by category
  const groupedByCategory: Record<string, BudgetItem[]> = {};
  renumberedItems.forEach(item => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });
  
  // ========== SLIDE 1: COVER ==========
  const coverSlide = pptx.addSlide();
  
  // Title "ORÇAMENTO" with underline
  coverSlide.addText("ORÇAMENTO", {
    x: MARGIN, y: 0.4, w: 5, h: 0.6,
    fontSize: 28, bold: true, color: "1E3A5F", fontFace: "Montserrat"
  });
  
  coverSlide.addShape("line", {
    x: MARGIN, y: 1.0, w: 2.5, h: 0,
    line: { color: "1E3A5F", width: 3 }
  });
  
  // Project name
  coverSlide.addText(data.projectName.toUpperCase(), {
    x: MARGIN, y: 1.2, w: 6, h: 0.45,
    fontSize: 16, bold: false, color: "333333", fontFace: "Montserrat"
  });
  
  // Client info section
  const infoStartY = 1.9;
  
  coverSlide.addText("CLIENTE", {
    x: MARGIN, y: infoStartY, w: 2, h: 0.3,
    fontSize: 10, bold: true, color: "999999", fontFace: "Montserrat"
  });
  
  coverSlide.addText(data.clientName || "-", {
    x: MARGIN, y: infoStartY + 0.28, w: 4, h: 0.35,
    fontSize: 12, color: "333333", fontFace: "Montserrat"
  });
  
  if (data.address) {
    coverSlide.addText("ENDEREÇO", {
      x: MARGIN, y: infoStartY + 0.75, w: 2, h: 0.3,
      fontSize: 10, bold: true, color: "999999", fontFace: "Montserrat"
    });
    
    coverSlide.addText(data.address, {
      x: MARGIN, y: infoStartY + 1.03, w: 4, h: 0.35,
      fontSize: 12, color: "333333", fontFace: "Montserrat"
    });
  }
  
  if (data.city) {
    const cityY = data.address ? infoStartY + 1.5 : infoStartY + 0.75;
    coverSlide.addText("CIDADE", {
      x: MARGIN, y: cityY, w: 2, h: 0.3,
      fontSize: 10, bold: true, color: "999999", fontFace: "Montserrat"
    });
    
    coverSlide.addText(data.city, {
      x: MARGIN, y: cityY + 0.28, w: 4, h: 0.35,
      fontSize: 12, color: "333333", fontFace: "Montserrat"
    });
  }
  
  // Summary box on the right
  const boxX = 5.8;
  const boxY = 1.5;
  const boxW = 3.8;
  const boxH = 3.2;
  
  coverSlide.addShape("rect", {
    x: boxX, y: boxY, w: boxW, h: boxH,
    fill: { color: "F8F9FA" },
    line: { color: "E5E7EB", width: 1 }
  });
  
  coverSlide.addText("RESUMO", {
    x: boxX + 0.3, y: boxY + 0.25, w: boxW - 0.6, h: 0.35,
    fontSize: 12, bold: true, color: "1E3A5F", fontFace: "Montserrat"
  });
  
  // Divider line
  coverSlide.addShape("line", {
    x: boxX + 0.3, y: boxY + 0.65, w: boxW - 0.6, h: 0,
    line: { color: "E5E7EB", width: 1 }
  });
  
  if (data.areaM2) {
    coverSlide.addText("ÁREA", {
      x: boxX + 0.3, y: boxY + 0.85, w: 1.5, h: 0.3,
      fontSize: 9, color: "999999", fontFace: "Montserrat"
    });
    
    coverSlide.addText(`${data.areaM2} m²`, {
      x: boxX + 0.3, y: boxY + 1.1, w: boxW - 0.6, h: 0.35,
      fontSize: 14, bold: true, color: "333333", fontFace: "Montserrat"
    });
  }
  
  coverSlide.addText("VALOR/M²", {
    x: boxX + 0.3, y: boxY + 1.55, w: 1.5, h: 0.3,
    fontSize: 9, color: "999999", fontFace: "Montserrat"
  });
  
  coverSlide.addText(formatCurrency(valorM2), {
    x: boxX + 0.3, y: boxY + 1.8, w: boxW - 0.6, h: 0.35,
    fontSize: 14, bold: true, color: "333333", fontFace: "Montserrat"
  });
  
  coverSlide.addText("TOTAL GERAL", {
    x: boxX + 0.3, y: boxY + 2.25, w: 2, h: 0.3,
    fontSize: 9, color: "999999", fontFace: "Montserrat"
  });
  
  coverSlide.addText(formatCurrency(grandTotal), {
    x: boxX + 0.3, y: boxY + 2.5, w: boxW - 0.6, h: 0.45,
    fontSize: 20, bold: true, color: "1E3A5F", fontFace: "Montserrat"
  });
  
  // Date at bottom
  coverSlide.addText(new Date().toLocaleDateString("pt-BR"), {
    x: MARGIN, y: SLIDE_HEIGHT - 0.7, w: 3, h: 0.3,
    fontSize: 10, color: "999999", fontFace: "Montserrat"
  });
  
  addLogo(coverSlide, logoBase64);
  
  // ========== SLIDE 2: SUMMARY BY CATEGORY ==========
  const summarySlide = pptx.addSlide();
  
  // Title
  summarySlide.addText("RESUMO POR CATEGORIA", {
    x: MARGIN, y: 0.3, w: 5, h: 0.5,
    fontSize: 20, bold: true, color: "1E3A5F", fontFace: "Montserrat"
  });
  
  summarySlide.addShape("line", {
    x: MARGIN, y: 0.82, w: 3.5, h: 0,
    line: { color: "1E3A5F", width: 3 }
  });
  
  // Table header
  const tableTop = 1.2;
  
  summarySlide.addShape("rect", {
    x: MARGIN, y: tableTop, w: SLIDE_WIDTH - MARGIN * 2, h: 0.4,
    fill: { color: "F3F4F6" }
  });
  
  summarySlide.addText("CATEGORIA", {
    x: MARGIN + 0.5, y: tableTop + 0.08, w: 3, h: 0.28,
    fontSize: 9, bold: true, color: "6B7280", fontFace: "Montserrat"
  });
  
  summarySlide.addText("ITENS", {
    x: 5, y: tableTop + 0.08, w: 1.5, h: 0.28,
    fontSize: 9, bold: true, color: "6B7280", fontFace: "Montserrat", align: "center"
  });
  
  summarySlide.addText("VALOR", {
    x: 7, y: tableTop + 0.08, w: 2.2, h: 0.28,
    fontSize: 9, bold: true, color: "6B7280", fontFace: "Montserrat", align: "right"
  });
  
  // Category rows
  let rowY = tableTop + 0.45;
  const rowHeight = 0.38;
  
  for (const catId of CATEGORY_ORDER) {
    const items = groupedByCategory[catId];
    if (!items || items.length === 0) continue;
    
    const catTotal = items.reduce((sum, item) => sum + item.valorCompleto, 0);
    const catColor = CATEGORY_COLORS[catId];
    const catLabel = CATEGORY_LABELS[catId];
    
    // Color indicator circle
    summarySlide.addShape("ellipse", {
      x: MARGIN + 0.1, y: rowY + 0.08, w: 0.22, h: 0.22,
      fill: { color: catColor }
    });
    
    // Category name
    summarySlide.addText(catLabel, {
      x: MARGIN + 0.45, y: rowY + 0.05, w: 3, h: 0.28,
      fontSize: 10, color: "333333", fontFace: "Montserrat"
    });
    
    // Item count
    summarySlide.addText(String(items.length), {
      x: 5, y: rowY + 0.05, w: 1.5, h: 0.28,
      fontSize: 10, color: "666666", fontFace: "Montserrat", align: "center"
    });
    
    // Value
    summarySlide.addText(formatCurrency(catTotal), {
      x: 7, y: rowY + 0.05, w: 2.2, h: 0.28,
      fontSize: 10, bold: true, color: "333333", fontFace: "Montserrat", align: "right"
    });
    
    // Separator line
    summarySlide.addShape("line", {
      x: MARGIN, y: rowY + rowHeight - 0.02, w: SLIDE_WIDTH - MARGIN * 2, h: 0,
      line: { color: "E5E7EB", width: 0.5 }
    });
    
    rowY += rowHeight;
  }
  
  // Total row
  rowY += 0.15;
  
  summarySlide.addShape("rect", {
    x: MARGIN, y: rowY, w: SLIDE_WIDTH - MARGIN * 2, h: 0.5,
    fill: { color: "1E3A5F" }
  });
  
  summarySlide.addText("TOTAL GERAL", {
    x: MARGIN + 0.3, y: rowY + 0.1, w: 3, h: 0.32,
    fontSize: 12, bold: true, color: "FFFFFF", fontFace: "Montserrat"
  });
  
  summarySlide.addText(formatCurrency(grandTotal), {
    x: 7, y: rowY + 0.1, w: 2.2, h: 0.32,
    fontSize: 14, bold: true, color: "FFFFFF", fontFace: "Montserrat", align: "right"
  });
  
  addLogo(summarySlide, logoBase64);
  
  // ========== SLIDES 3+: DETAIL BY CATEGORY ==========
  for (const catId of CATEGORY_ORDER) {
    const items = groupedByCategory[catId];
    if (!items || items.length === 0) continue;
    
    const catColor = CATEGORY_COLORS[catId];
    const catLabel = CATEGORY_LABELS[catId];
    const catTotal = items.reduce((sum, item) => sum + item.valorCompleto, 0);
    
    // Create slides for this category (max 10 items per slide)
    const itemsPerSlide = 10;
    const numSlides = Math.ceil(items.length / itemsPerSlide);
    
    for (let slideIdx = 0; slideIdx < numSlides; slideIdx++) {
      const slide = pptx.addSlide();
      const slideItems = items.slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide);
      
      // Category header with colored circle
      slide.addShape("ellipse", {
        x: MARGIN, y: 0.35, w: 0.35, h: 0.35,
        fill: { color: catColor }
      });
      
      slide.addText(catLabel, {
        x: MARGIN + 0.5, y: 0.3, w: 4, h: 0.45,
        fontSize: 20, bold: true, color: "1E3A5F", fontFace: "Montserrat"
      });
      
      // Category total on right
      slide.addText(formatCurrency(catTotal), {
        x: 6.5, y: 0.35, w: 3, h: 0.35,
        fontSize: 16, bold: true, color: "1E3A5F", fontFace: "Montserrat", align: "right"
      });
      
      slide.addShape("line", {
        x: MARGIN, y: 0.82, w: SLIDE_WIDTH - MARGIN * 2, h: 0,
        line: { color: "E5E7EB", width: 1 }
      });
      
      // Table header
      const tblTop = 1.0;
      
      slide.addShape("rect", {
        x: MARGIN, y: tblTop, w: SLIDE_WIDTH - MARGIN * 2, h: 0.35,
        fill: { color: "F8F9FA" }
      });
      
      // Header columns - simplified
      slide.addText("#", {
        x: MARGIN + 0.1, y: tblTop + 0.06, w: 0.4, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat", align: "center"
      });
      
      slide.addText("ITEM", {
        x: MARGIN + 0.55, y: tblTop + 0.06, w: 2.5, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat"
      });
      
      slide.addText("AMBIENTE", {
        x: 3.2, y: tblTop + 0.06, w: 1.5, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat"
      });
      
      slide.addText("QTD", {
        x: 4.8, y: tblTop + 0.06, w: 0.6, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat", align: "center"
      });
      
      slide.addText("PRODUTO", {
        x: 5.5, y: tblTop + 0.06, w: 1.2, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat", align: "right"
      });
      
      slide.addText("INST.", {
        x: 6.8, y: tblTop + 0.06, w: 1, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat", align: "right"
      });
      
      slide.addText("FRETE", {
        x: 7.9, y: tblTop + 0.06, w: 0.9, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat", align: "right"
      });
      
      slide.addText("TOTAL", {
        x: 8.9, y: tblTop + 0.06, w: 1.2, h: 0.25,
        fontSize: 8, bold: true, color: "6B7280", fontFace: "Montserrat", align: "right"
      });
      
      // Item rows
      let itemY = tblTop + 0.4;
      const itemRowHeight = 0.42;
      
      slideItems.forEach((item, idx) => {
        // Alternating background
        if (idx % 2 === 0) {
          slide.addShape("rect", {
            x: MARGIN, y: itemY, w: SLIDE_WIDTH - MARGIN * 2, h: itemRowHeight,
            fill: { color: "FAFAFA" }
          });
        }
        
        // Number circle - dynamic size for 2+ digits
        const numDigits = String(item.number).length;
        const circleSize = numDigits >= 3 ? 0.34 : 0.28;
        const numFontSize = numDigits >= 3 ? 7 : numDigits >= 2 ? 8 : 9;
        
        slide.addShape("ellipse", {
          x: MARGIN + 0.12, y: itemY + 0.07, w: circleSize, h: circleSize,
          fill: { color: catColor }
        });
        
        slide.addText(String(item.number), {
          x: MARGIN + 0.12, y: itemY + 0.07, w: circleSize, h: circleSize,
          fontSize: numFontSize, bold: true, color: "FFFFFF", fontFace: "Montserrat", align: "center", valign: "middle"
        });
        
        // Item name
        const displayName = item.name.length > 28 ? item.name.substring(0, 28) + "..." : item.name;
        slide.addText(displayName.toUpperCase(), {
          x: MARGIN + 0.55, y: itemY + 0.1, w: 2.5, h: 0.25,
          fontSize: 9, color: "333333", fontFace: "Montserrat"
        });
        
        // Ambiente
        const ambiente = item.ambiente.length > 14 ? item.ambiente.substring(0, 14) + "..." : item.ambiente;
        slide.addText(ambiente, {
          x: 3.2, y: itemY + 0.1, w: 1.5, h: 0.25,
          fontSize: 8, color: "666666", fontFace: "Montserrat"
        });
        
        // Qtd
        slide.addText(String(item.quantidade), {
          x: 4.8, y: itemY + 0.1, w: 0.6, h: 0.25,
          fontSize: 9, color: "333333", fontFace: "Montserrat", align: "center"
        });
        
        // Produto
        slide.addText(item.valorProduto > 0 ? formatCurrency(item.valorProduto) : "-", {
          x: 5.5, y: itemY + 0.1, w: 1.2, h: 0.25,
          fontSize: 8, color: "333333", fontFace: "Montserrat", align: "right"
        });
        
        // Instalação
        slide.addText(item.valorInstalacao > 0 ? formatCurrency(item.valorInstalacao) : "-", {
          x: 6.8, y: itemY + 0.1, w: 1, h: 0.25,
          fontSize: 8, color: "333333", fontFace: "Montserrat", align: "right"
        });
        
        // Frete
        slide.addText(item.valorFrete > 0 ? formatCurrency(item.valorFrete) : "-", {
          x: 7.9, y: itemY + 0.1, w: 0.9, h: 0.25,
          fontSize: 8, color: "333333", fontFace: "Montserrat", align: "right"
        });
        
        // Total
        slide.addText(formatCurrency(item.valorCompleto), {
          x: 8.9, y: itemY + 0.1, w: 1.2, h: 0.25,
          fontSize: 10, bold: true, color: "1E3A5F", fontFace: "Montserrat", align: "right"
        });
        
        itemY += itemRowHeight;
      });
      
      // Page indicator
      if (numSlides > 1) {
        slide.addText(`${slideIdx + 1}/${numSlides}`, {
          x: MARGIN, y: SLIDE_HEIGHT - 0.6, w: 1, h: 0.25,
          fontSize: 9, color: "999999", fontFace: "Montserrat"
        });
      }
      
      addLogo(slide, logoBase64);
    }
  }
  
  // ========== FINAL SLIDE: Logo Only ==========
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
  
  // Generate and download
  const safeName = data.projectName
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 30);
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `ORCAMENTO_${safeName}_${timestamp}.pptx`;
  
  await pptx.writeFile({ fileName: filename });
};
