/**
 * Document Generation Types
 * Types for PowerPoint, Excel, PDF, and Word document generation
 */

// =============================================================================
// PowerPoint Types
// =============================================================================

export interface SlideConfig {
  width: number;
  height: number;
  margin: number;
}

export interface LogoConfig {
  width: number;
  height: number;
  path?: string;
  data?: string;
}

export interface ImagePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextStyle {
  fontFace?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
}

// =============================================================================
// Presentation PPT Types
// =============================================================================

export interface PresentationSlideData {
  clientName: string;
  clientAddress?: string;
  projectType?: string;
  ambiente?: string;
  date?: string;
}

export interface PresentationImageData {
  section: "photos_before" | "moodboard" | "references" | "floor_plan" | "renders";
  images: Array<{
    id: string;
    url: string;
    displayOrder: number;
    metadata?: {
      width?: number;
      height?: number;
      aspectRatio?: number;
    };
  }>;
}

export interface PresentationPPTInput {
  presentationId: string;
  clientData: PresentationSlideData;
  images: PresentationImageData[];
  includePhotosBefore?: boolean;
  includeMoodboard?: boolean;
  includeReferences?: boolean;
  includeFloorPlan?: boolean;
  includeRenders?: boolean;
  logoUrl?: string;
}

// =============================================================================
// Shopping List PPT Types
// =============================================================================

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  ambiente?: string;
  number: number;
  quantity?: number;
  unit?: string;
  price?: number;
  supplier?: string;
  link?: string;
  imageUrl?: string;
}

export interface ShoppingListPPTInput {
  presentationId: string;
  clientName: string;
  items: ShoppingListItem[];
  groupByCategory?: boolean;
  groupByAmbiente?: boolean;
  includeImages?: boolean;
  includePrices?: boolean;
  logoUrl?: string;
}

// =============================================================================
// Budget PPT Types
// =============================================================================

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  ambiente?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  observations?: string;
}

export interface BudgetCategory {
  name: string;
  color: string;
  items: BudgetItem[];
  subtotal: number;
}

export interface BudgetPPTInput {
  presentationId: string;
  clientName: string;
  projectName?: string;
  items: BudgetItem[];
  categories: BudgetCategory[];
  grandTotal: number;
  includeSuppliers?: boolean;
  includeCategorySummary?: boolean;
  logoUrl?: string;
}

// =============================================================================
// Technical Detailing PPT Types
// =============================================================================

export interface TechnicalItem {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  ambiente: string;
  number: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  material?: string;
  finish?: string;
  observations?: string;
  imageUrl?: string;
  technicalDrawingUrl?: string;
}

export interface TechnicalDetailingPPTInput {
  presentationId: string;
  clientName: string;
  projectName?: string;
  items: TechnicalItem[];
  groupByAmbiente?: boolean;
  includeDrawings?: boolean;
  logoUrl?: string;
}

// =============================================================================
// Excel Budget Types
// =============================================================================

export interface ExcelBudgetInput {
  presentationId: string;
  clientName: string;
  projectName?: string;
  items: BudgetItem[];
  categories: BudgetCategory[];
  grandTotal: number;
  includeFormulas?: boolean;
  includeCharts?: boolean;
}

export interface ExcelColumn {
  header: string;
  key: string;
  width: number;
  format?: "text" | "number" | "currency" | "percent";
}

// =============================================================================
// PDF Proposal Types
// =============================================================================

export interface ProposalSection {
  title: string;
  content: string;
  items?: Array<{
    label: string;
    value: string;
  }>;
}

export interface PDFProposalInput {
  proposalId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  projectType: string;
  projectDescription?: string;
  serviceType: string;
  totalValue: number;
  paymentTerms?: string;
  validUntil?: string;
  sections?: ProposalSection[];
  includeTerms?: boolean;
  logoUrl?: string;
}

// =============================================================================
// Word Proposal Types
// =============================================================================

export interface WordProposalInput extends PDFProposalInput {
  templateStyle?: "formal" | "modern" | "minimal";
  includeSignatureLine?: boolean;
  headerText?: string;
  footerText?: string;
}

// =============================================================================
// Common Types
// =============================================================================

export interface GenerationResult<T = Buffer> {
  success: boolean;
  data?: T;
  filename?: string;
  mimeType?: string;
  error?: string;
}

export type DocumentFormat = "pptx" | "xlsx" | "pdf" | "docx";

export interface DocumentMetadata {
  title: string;
  author?: string;
  subject?: string;
  company?: string;
  createdAt: Date;
}

// Category colors mapping (consistent with presentations module)
export const CATEGORY_COLORS: Record<string, string> = {
  mobiliario: "1E3A5F",
  marcenaria: "F59E0B",
  marmoraria: "8B4513",
  iluminacao: "FBBF24",
  decoracao: "EC4899",
  cortinas: "8B5CF6",
  materiais: "6B7280",
  eletrica: "3B82F6",
  hidraulica: "06B6D4",
  maoDeObra: "10B981",
  acabamentos: "F97316",
  outros: "9CA3AF",
};

// PPT Constants (3:2 aspect ratio)
export const PPT_CONSTANTS = {
  SLIDE_WIDTH: 10,
  SLIDE_HEIGHT: 6.67,
  MARGIN: 0.4,
  LOGO_WIDTH: 1.6,
  LOGO_HEIGHT: 0.33,
  TITLE_FONT_SIZE: 24,
  SUBTITLE_FONT_SIZE: 14,
  BODY_FONT_SIZE: 11,
  DEFAULT_FONT: "Arial",
};
