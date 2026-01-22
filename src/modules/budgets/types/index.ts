import type { Tables, Json } from "@/shared/lib/supabase/database.types";

// Database types
export type Budget = Tables<"budgets">;

// Budget status workflow: draft → sent → approved → rejected
export type BudgetStatus = "draft" | "sent" | "approved" | "rejected";

// Service types
export type BudgetServiceType =
  | "arquitetonico"
  | "interiores"
  | "decoracao"
  | "reforma"
  | "comercial"
  | "decorexpress"
  | "producao"
  | "projetexpress";

// Unit types for items
export type UnidadeType = "Qt." | "m²" | "m" | "un" | "pç" | "cx" | "kg" | "L";

// Efficiency rating
export type EfficiencyRating = "Ótimo" | "Bom" | "Reajustar";

// Complexity levels
export type ComplexityLevel = "simples" | "padrao" | "complexo";

// Finish levels
export type FinishLevel = "simples" | "padrao" | "alto_padrao";

// Modality
export type BudgetModality = "presencial" | "online";

// Project type
export type ProjectType = "novo" | "reforma";

// Payment type
export type PaymentType = "cash" | "30_30_40" | "50_50" | "custom";

/**
 * Budget item - stored in details.items JSONB array
 */
export interface BudgetItem {
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
  ambiente?: string;
  category?: string;
}

/**
 * Budget calculation - stored in calculation JSONB
 */
export interface BudgetCalculation {
  base_price: number;
  multipliers: {
    complexity: number;
    finish: number;
  };
  extras_total: number;
  survey_fee: number;
  discount: number;
  final_price: number;
  estimated_hours: number;
  hour_rate: number;
  efficiency: EfficiencyRating | null;
  price_per_m2: number;
  items_total?: number;
}

/**
 * Budget details - stored in details JSONB
 */
export interface BudgetDetails {
  area: number;
  rooms: number;
  room_list: string[];
  complexity: ComplexityLevel;
  finish: FinishLevel;
  modality: BudgetModality;
  project_type: ProjectType;
  items?: BudgetItem[];
}

/**
 * Payment installment
 */
export interface PaymentInstallment {
  percent: number;
  description: string;
  dueDate?: string;
}

/**
 * Budget payment terms - stored in payment_terms JSONB
 */
export interface BudgetPaymentTerms {
  type: PaymentType;
  installments: PaymentInstallment[];
  validity_days: number;
  custom_terms?: string;
}

// Filters for listing budgets
export interface BudgetFilters {
  status?: BudgetStatus;
  serviceType?: BudgetServiceType;
  clientId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Partial calculation for input (allows partial multipliers)
export interface PartialBudgetCalculation {
  base_price?: number;
  multipliers?: {
    complexity?: number;
    finish?: number;
  };
  extras_total?: number;
  survey_fee?: number;
  discount?: number;
  final_price?: number;
  estimated_hours?: number;
  hour_rate?: number;
  efficiency?: EfficiencyRating | null;
  price_per_m2?: number;
  items_total?: number;
}

// Data for creating a budget
export interface CreateBudgetData {
  clientId?: string;
  clientName?: string;
  projectName?: string;
  serviceType: BudgetServiceType;
  details?: Partial<BudgetDetails>;
  calculation?: PartialBudgetCalculation;
  paymentTerms?: Partial<BudgetPaymentTerms>;
  scope?: string[];
  notes?: string;
}

// Data for updating a budget
export interface UpdateBudgetData {
  status?: BudgetStatus;
  clientId?: string | null;
  details?: Partial<BudgetDetails>;
  calculation?: PartialBudgetCalculation;
  paymentTerms?: Partial<BudgetPaymentTerms>;
  scope?: string[];
  notes?: string | null;
}

// Data for adding a budget item
export interface AddBudgetItemData {
  fornecedor: string;
  descricao: string;
  quantidade: number;
  unidade?: UnidadeType;
  valorProduto: number;
  valorInstalacao?: number;
  valorFrete?: number;
  valorExtras?: number;
  link?: string;
  subcategoria?: string;
  ambiente?: string;
  category?: string;
}

// Data for updating a budget item
export interface UpdateBudgetItemData extends Partial<AddBudgetItemData> {
  id: string;
}

// Result wrapper for CRUD operations
export interface BudgetResult<T = void> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

// Budget with expanded client data
export interface BudgetWithClient extends Budget {
  client?: {
    id: string;
    name: string;
    contact: Json;
  } | null;
}
