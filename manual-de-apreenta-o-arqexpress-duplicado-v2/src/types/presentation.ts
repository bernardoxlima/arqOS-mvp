export interface ImageData {
  id: string;
  file?: File; // Optional - not available when loaded from localStorage
  preview: string; // Base64 data URL for persistence
}

export interface ClientData {
  clientName: string;
  projectCode: string;
  phone: string;
  address: string;
  cepBairro: string;
  cpf: string;
  architect: string;
  startDate: string;
}

// Categorias com cores para orçamento
export type ItemCategory = 
  | 'mobiliario'      // Azul marinho - móveis soltos
  | 'marcenaria'      // Amarelo - marcenaria
  | 'marmoraria'      // Marrom - marmoraria
  | 'iluminacao'      // Laranja - iluminação
  | 'decoracao'       // Roxo - decoração
  | 'cortinas'        // Rosa - cortinas e persianas
  | 'materiais'       // Verde - revestimentos
  | 'eletrica'        // Vermelho - elétrica
  | 'hidraulica'      // Azul - hidráulica
  | 'maoDeObra'       // Cinza - mão de obra
  | 'acabamentos'     // Roxo claro - acabamentos
  | 'outros';         // Bordô - outros itens

export interface CategoryConfig {
  id: ItemCategory;
  label: string;
  color: string;       // Cor hex para o PPTX
  bgColor: string;     // Tailwind bg class
  textColor: string;   // Tailwind text class
  showInLayout: boolean; // Se aparece na planta com bolinhas
}

// Categorias que aparecem no LAYOUT (Tela 1 - com posição na planta)
export const LAYOUT_CATEGORIES: CategoryConfig[] = [
  { id: 'mobiliario', label: 'Mobiliário', color: '1E3A5F', bgColor: 'bg-[#1E3A5F]', textColor: 'text-white', showInLayout: true },
  { id: 'marcenaria', label: 'Marcenaria', color: 'F59E0B', bgColor: 'bg-yellow-500', textColor: 'text-white', showInLayout: true },
  { id: 'marmoraria', label: 'Marmoraria', color: '8B4513', bgColor: 'bg-[#8B4513]', textColor: 'text-white', showInLayout: true },
  { id: 'iluminacao', label: 'Iluminação', color: 'F97316', bgColor: 'bg-orange-500', textColor: 'text-white', showInLayout: true },
  { id: 'decoracao', label: 'Decoração', color: '8B5CF6', bgColor: 'bg-violet-500', textColor: 'text-white', showInLayout: true },
  { id: 'cortinas', label: 'Cortinas', color: 'EC4899', bgColor: 'bg-pink-500', textColor: 'text-white', showInLayout: true },
];

// Categorias que aparecem na TELA COMPLEMENTAR (Tela 2 - sem posição na planta)
export const COMPLEMENTARY_CATEGORIES: CategoryConfig[] = [
  { id: 'materiais', label: 'Materiais e Revestimentos', color: '10B981', bgColor: 'bg-emerald-500', textColor: 'text-white', showInLayout: false },
  { id: 'eletrica', label: 'Elétrica', color: 'EF4444', bgColor: 'bg-red-500', textColor: 'text-white', showInLayout: false },
  { id: 'hidraulica', label: 'Hidráulica', color: '3B82F6', bgColor: 'bg-blue-500', textColor: 'text-white', showInLayout: false },
  { id: 'maoDeObra', label: 'Mão de Obra', color: '6B7280', bgColor: 'bg-gray-500', textColor: 'text-white', showInLayout: false },
  { id: 'acabamentos', label: 'Acabamentos', color: 'A855F7', bgColor: 'bg-purple-500', textColor: 'text-white', showInLayout: false },
  { id: 'outros', label: 'Outros Itens', color: '800020', bgColor: 'bg-[#800020]', textColor: 'text-white', showInLayout: false },
];

// Todas as categorias (para orçamento e lista de compras)
export const ITEM_CATEGORIES: CategoryConfig[] = [
  { id: 'mobiliario', label: 'Mobiliário', color: '1E3A5F', bgColor: 'bg-[#1E3A5F]', textColor: 'text-white', showInLayout: true },
  { id: 'marcenaria', label: 'Marcenaria', color: 'F59E0B', bgColor: 'bg-yellow-500', textColor: 'text-white', showInLayout: true },
  { id: 'marmoraria', label: 'Marmoraria', color: '8B4513', bgColor: 'bg-[#8B4513]', textColor: 'text-white', showInLayout: true },
  { id: 'iluminacao', label: 'Iluminação', color: 'F97316', bgColor: 'bg-orange-500', textColor: 'text-white', showInLayout: true },
  { id: 'decoracao', label: 'Decoração', color: '8B5CF6', bgColor: 'bg-violet-500', textColor: 'text-white', showInLayout: true },
  { id: 'cortinas', label: 'Cortinas', color: 'EC4899', bgColor: 'bg-pink-500', textColor: 'text-white', showInLayout: true },
  { id: 'materiais', label: 'Materiais e Revestimentos', color: '10B981', bgColor: 'bg-emerald-500', textColor: 'text-white', showInLayout: false },
  { id: 'eletrica', label: 'Elétrica', color: 'EF4444', bgColor: 'bg-red-500', textColor: 'text-white', showInLayout: false },
  { id: 'hidraulica', label: 'Hidráulica', color: '3B82F6', bgColor: 'bg-blue-500', textColor: 'text-white', showInLayout: false },
  { id: 'maoDeObra', label: 'Mão de Obra', color: '6B7280', bgColor: 'bg-gray-500', textColor: 'text-white', showInLayout: false },
  { id: 'acabamentos', label: 'Acabamentos', color: 'A855F7', bgColor: 'bg-purple-500', textColor: 'text-white', showInLayout: false },
  { id: 'outros', label: 'Outros Itens', color: '800020', bgColor: 'bg-[#800020]', textColor: 'text-white', showInLayout: false },
];

export interface FloorPlanItem {
  number: number;
  name: string;
  ambiente: string;
  category: ItemCategory;
  // Budget-related fields (optional, filled during creation)
  quantidade?: number;
  unidade?: string;
  valorProduto?: number;
  fornecedor?: string;
  link?: string;
  imagem?: string; // base64 or URL
}

export interface FloorPlanLayoutData {
  originalImage: string | null;
  items: FloorPlanItem[];
}

// Itens complementares (sem posição na planta)
export interface ComplementaryItemsData {
  items: FloorPlanItem[];
}

export interface PresentationData {
  projectName: string;
  projectPhase: string;
  clientData: ClientData;
  photosBefore: ImageData[];
  moodboard: ImageData[];
  references: ImageData[];
  floorPlan: ImageData[];
  floorPlanLayout: FloorPlanLayoutData;
  complementaryItems: ComplementaryItemsData;
  renders: ImageData[];
}

export type UploadSection = 'photosBefore' | 'moodboard' | 'references' | 'floorPlan' | 'renders';

export interface SectionConfig {
  id: UploadSection;
  title: string;
  subtitle: string;
  icon: string;
  maxFiles: number;
  required?: boolean;
}
