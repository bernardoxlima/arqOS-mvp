import { ItemCategory, FloorPlanItem } from './presentation';

// Tipos de unidade disponíveis
export type UnidadeType = 'Qt.' | 'm²' | 'm' | 'un' | 'pç' | 'cx' | 'kg' | 'L';

// Item de orçamento com informações de preço
export interface BudgetItem extends FloorPlanItem {
  id: string;
  fornecedor: string;
  descricao: string;
  quantidade: number;
  unidade: UnidadeType;
  valorProduto: number;
  valorInstalacao: number;
  valorFrete: number;
  valorExtras: number;
  valorCompleto: number;
  link?: string;
  subcategoria?: string;
  imagem?: string;
}

// Informações da obra para orçamento
export interface ObraInfo {
  obra: string;
  cliente: string;
  endereco: string;
  cidade: string;
  areaM2: number;
  valorM2: number;
}

// Dados do orçamento completo
export interface BudgetData {
  obraInfo: ObraInfo;
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

// Cores das categorias para o orçamento
export const BUDGET_CATEGORY_COLORS: Record<ItemCategory, string> = {
  mobiliario: '90EE90',      // Verde claro - MOBILIAR
  marcenaria: '90EE90',      // Verde claro - MOBILIAR
  marmoraria: 'D3D3D3',      // Cinza - MARMORARIA
  iluminacao: '87CEEB',      // Azul claro - ILUMINAÇÃO
  decoracao: 'F0E68C',       // Amarelo - DECOR
  cortinas: 'FFB6C1',        // Rosa claro - CORTINAS
  materiais: 'FFFF00',       // Amarelo - MATERIALIZAR
  eletrica: 'FFC0CB',        // Rosa - MÃO DE OBRA
  hidraulica: 'ADD8E6',      // Azul - LOUÇAS E METAIS
  maoDeObra: 'FFC0CB',       // Rosa - MÃO DE OBRA
  acabamentos: 'E6E6FA',     // Lavanda - ACABAMENTOS
  outros: 'FFA500',          // Laranja - OUTROS
};

// Subcategorias por categoria
export const SUBCATEGORIAS: Partial<Record<ItemCategory, string[]>> = {
  materiais: ['PISO', 'PAREDE', 'RODAPÉ', 'SOLEIRA'],
  mobiliario: ['MOBILIÁRIO SOLTO'],
  marcenaria: ['MARCENARIA - MÓVEIS FIXOS'],
  maoDeObra: ['ELETRICISTA', 'PINTOR', 'PEDREIRO', 'GESSEIRO', 'LIMPEZA PÓS OBRA'],
};

// Unidades disponíveis
export const UNIDADES: UnidadeType[] = ['Qt.', 'm²', 'm', 'un', 'pç', 'cx', 'kg', 'L'];
