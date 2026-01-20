import type { Tables } from "@/shared/lib/supabase/database.types";

// Database types
export type Presentation = Tables<"presentations">;
export type PresentationImage = Tables<"presentation_images">;
export type PresentationItem = Tables<"presentation_items">;

// Presentation status
export type PresentationStatus = "draft" | "in_progress" | "review" | "approved" | "archived";

// Presentation phase (from legacy)
export type PresentationPhase =
  | "Entrega Final"
  | "Proposta Inicial"
  | "Revisão 1"
  | "Revisão 2"
  | "Revisão 3";

// Image sections (from legacy)
export type ImageSection =
  | "photos_before"
  | "moodboard"
  | "references"
  | "floor_plan"
  | "renders";

// Image limits per section (from schema comment)
export const IMAGE_SECTION_LIMITS: Record<ImageSection, number> = {
  photos_before: 4,
  moodboard: 1,
  references: 6,
  floor_plan: 1,
  renders: 10,
};

// Item categories (from legacy)
export type ItemCategory =
  | "mobiliario"
  | "marcenaria"
  | "marmoraria"
  | "iluminacao"
  | "decoracao"
  | "cortinas"
  | "materiais"
  | "eletrica"
  | "hidraulica"
  | "maoDeObra"
  | "acabamentos"
  | "outros";

// Item type (layout = with position, complementary = without)
export type ItemType = "layout" | "complementary";

// Client data stored in presentations.client_data JSONB
export interface ClientData {
  clientName: string;
  projectCode?: string;
  phone?: string;
  address?: string;
  cepBairro?: string;
  cpf?: string;
  architect?: string;
  startDate?: string;
}

// Presentation settings stored in presentations.settings JSONB
export interface PresentationSettings {
  showPrices?: boolean;
  showSuppliers?: boolean;
  exportFormat?: "pptx" | "pdf";
  theme?: string;
}

// Position on floor plan (for layout items)
export interface ItemPosition {
  x: number;
  y: number;
}

// Product details stored in presentation_items.product JSONB
export interface ProductDetails {
  quantidade?: number;
  unidade?: string;
  valorProduto?: number;
  fornecedor?: string;
  link?: string;
  imagem?: string;
}

// Image metadata stored in presentation_images.metadata JSONB
export interface ImageMetadata {
  width?: number;
  height?: number;
  mimeType?: string;
  originalName?: string;
}

// ============================================
// Input types for API/Service functions
// ============================================

export interface CreatePresentationInput {
  name: string;
  projectId?: string;
  phase?: PresentationPhase;
  clientData?: ClientData;
  settings?: PresentationSettings;
}

export interface UpdatePresentationInput {
  name?: string;
  status?: PresentationStatus;
  phase?: PresentationPhase;
  clientData?: ClientData;
  settings?: PresentationSettings;
}

export interface UploadImageInput {
  section: ImageSection;
  file: File;
  displayOrder?: number;
}

export interface AddItemInput {
  name: string;
  category: ItemCategory;
  itemType: ItemType;
  ambiente?: string;
  number?: number; // Auto-generated if not provided
  position?: ItemPosition;
  product?: ProductDetails;
}

export interface UpdateItemInput {
  name?: string;
  category?: ItemCategory;
  ambiente?: string;
  number?: number;
  position?: ItemPosition;
  product?: ProductDetails;
  status?: string;
}

// ============================================
// Response types
// ============================================

export interface PresentationWithRelations extends Presentation {
  images: PresentationImage[];
  items: PresentationItem[];
}

export interface PresentationSummary {
  id: string;
  name: string;
  code: string | null;
  status: string;
  phase: string;
  imageCount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

// Service result type
export interface ServiceResult<T = void> {
  data?: T;
  error?: string;
}

// ============================================
// Category configuration (from legacy)
// ============================================

export interface CategoryConfig {
  id: ItemCategory;
  label: string;
  shortLabel: string;
  color: string; // Hex without # for PPTX
  bgColor: string; // Tailwind class
  textColor: string;
  group: "layout" | "complementary" | "both";
  order: number;
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  { id: "marcenaria", label: "Marcenaria", shortLabel: "MARC", color: "F59E0B", bgColor: "bg-yellow-500", textColor: "text-white", group: "layout", order: 1 },
  { id: "marmoraria", label: "Marmoraria", shortLabel: "MARM", color: "8B4513", bgColor: "bg-[#8B4513]", textColor: "text-white", group: "layout", order: 2 },
  { id: "mobiliario", label: "Mobiliário", shortLabel: "MOB", color: "1E3A5F", bgColor: "bg-[#1E3A5F]", textColor: "text-white", group: "layout", order: 3 },
  { id: "iluminacao", label: "Iluminação", shortLabel: "ILUM", color: "F97316", bgColor: "bg-orange-500", textColor: "text-white", group: "both", order: 4 },
  { id: "decoracao", label: "Decoração", shortLabel: "DEC", color: "8B5CF6", bgColor: "bg-violet-500", textColor: "text-white", group: "layout", order: 5 },
  { id: "cortinas", label: "Cortinas", shortLabel: "CORT", color: "EC4899", bgColor: "bg-pink-500", textColor: "text-white", group: "layout", order: 6 },
  { id: "materiais", label: "Materiais e Revestimentos", shortLabel: "MAT", color: "10B981", bgColor: "bg-emerald-500", textColor: "text-white", group: "complementary", order: 7 },
  { id: "eletrica", label: "Elétrica", shortLabel: "ELE", color: "EF4444", bgColor: "bg-red-500", textColor: "text-white", group: "complementary", order: 8 },
  { id: "hidraulica", label: "Hidráulica", shortLabel: "HID", color: "3B82F6", bgColor: "bg-blue-500", textColor: "text-white", group: "complementary", order: 9 },
  { id: "maoDeObra", label: "Mão de Obra", shortLabel: "MDO", color: "6B7280", bgColor: "bg-gray-500", textColor: "text-white", group: "complementary", order: 10 },
  { id: "acabamentos", label: "Acabamentos", shortLabel: "ACAB", color: "A855F7", bgColor: "bg-purple-500", textColor: "text-white", group: "complementary", order: 11 },
  { id: "outros", label: "Outros Itens", shortLabel: "OUT", color: "800020", bgColor: "bg-[#800020]", textColor: "text-white", group: "complementary", order: 12 },
];

// Helper functions
export function getCategoryConfig(id: ItemCategory): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find(c => c.id === id);
}

export function getLayoutCategories(): CategoryConfig[] {
  return CATEGORY_CONFIGS.filter(c => c.group === "layout" || c.group === "both").sort((a, b) => a.order - b.order);
}

export function getComplementaryCategories(): CategoryConfig[] {
  return CATEGORY_CONFIGS.filter(c => c.group === "complementary" || c.group === "both").sort((a, b) => a.order - b.order);
}
