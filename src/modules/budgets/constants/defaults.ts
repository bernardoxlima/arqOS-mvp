import type {
  BudgetCalculation,
  BudgetDetails,
  BudgetPaymentTerms,
  PaymentInstallment,
} from "../types";

/**
 * Default calculation values for a new budget
 */
export const DEFAULT_CALCULATION: BudgetCalculation = {
  base_price: 0,
  multipliers: {
    complexity: 1.0,
    finish: 1.0,
  },
  extras_total: 0,
  survey_fee: 0,
  discount: 0,
  final_price: 0,
  estimated_hours: 0,
  hour_rate: 0,
  efficiency: null,
  price_per_m2: 0,
  items_total: 0,
};

/**
 * Default details values for a new budget
 */
export const DEFAULT_DETAILS: BudgetDetails = {
  area: 0,
  rooms: 0,
  room_list: [],
  complexity: "padrao",
  finish: "padrao",
  modality: "presencial",
  project_type: "novo",
  items: [],
};

/**
 * Pre-defined payment installments
 */
export const PAYMENT_INSTALLMENTS: Record<string, PaymentInstallment[]> = {
  cash: [{ percent: 100, description: "Pagamento à vista" }],
  "30_30_40": [
    { percent: 30, description: "Assinatura do contrato" },
    { percent: 30, description: "Entrega do anteprojeto" },
    { percent: 40, description: "Entrega do projeto final" },
  ],
  "50_50": [
    { percent: 50, description: "Assinatura do contrato" },
    { percent: 50, description: "Entrega do projeto" },
  ],
  custom: [],
};

/**
 * Default payment terms for a new budget
 */
export const DEFAULT_PAYMENT_TERMS: BudgetPaymentTerms = {
  type: "30_30_40",
  installments: PAYMENT_INSTALLMENTS["30_30_40"],
  validity_days: 15,
};

/**
 * Default validity days for proposals
 */
export const DEFAULT_VALIDITY_DAYS = 15;

/**
 * Complexity multipliers
 */
export const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  simples: 0.8,
  padrao: 1.0,
  complexo: 1.5,
};

/**
 * Finish multipliers
 */
export const FINISH_MULTIPLIERS: Record<string, number> = {
  simples: 0.9,
  padrao: 1.0,
  alto_padrao: 1.4,
};

/**
 * Efficiency thresholds (hour_rate based)
 * Used to determine if a budget is profitable
 */
export const EFFICIENCY_THRESHOLDS = {
  optimal_min: 150, // >= R$150/h is "Ótimo"
  good_min: 100, // >= R$100/h is "Bom"
  // < R$100/h is "Reajustar"
};

/**
 * Get efficiency rating based on hour rate
 */
export function getEfficiencyRating(hourRate: number): "Ótimo" | "Bom" | "Reajustar" {
  if (hourRate >= EFFICIENCY_THRESHOLDS.optimal_min) return "Ótimo";
  if (hourRate >= EFFICIENCY_THRESHOLDS.good_min) return "Bom";
  return "Reajustar";
}

/**
 * Service type display names
 */
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  arquitetonico: "Projeto Arquitetônico",
  interiores: "Design de Interiores",
  decoracao: "Decoração",
  reforma: "Reforma",
  comercial: "Projeto Comercial",
  decorexpress: "DecorExpress",
  producao: "Produção",
  projetexpress: "ProjetExpress",
};

/**
 * Status display names
 */
export const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

/**
 * Unit type display names
 */
export const UNIT_LABELS: Record<string, string> = {
  "Qt.": "Quantidade",
  "m²": "Metro quadrado",
  m: "Metro linear",
  un: "Unidade",
  pç: "Peça",
  cx: "Caixa",
  kg: "Quilograma",
  L: "Litro",
};
