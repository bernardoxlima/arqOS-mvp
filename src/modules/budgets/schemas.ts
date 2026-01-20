import { z } from "zod";

// Budget status enum
const budgetStatusEnum = z.enum(["draft", "sent", "approved", "rejected"]);

// Service types enum
const budgetServiceTypeEnum = z.enum([
  "arquitetonico",
  "interiores",
  "decoracao",
  "reforma",
  "comercial",
  "decorexpress",
  "producao",
  "projetexpress",
]);

// Unit types enum
const unidadeTypeEnum = z.enum(["Qt.", "m²", "m", "un", "pç", "cx", "kg", "L"]);

// Complexity enum
const complexityEnum = z.enum(["simples", "padrao", "complexo"]);

// Finish enum
const finishEnum = z.enum(["simples", "padrao", "alto_padrao"]);

// Modality enum
const modalityEnum = z.enum(["presencial", "online"]);

// Project type enum
const projectTypeEnum = z.enum(["novo", "reforma"]);

// Payment type enum
const paymentTypeEnum = z.enum(["cash", "30_30_40", "50_50", "custom"]);

// Efficiency rating enum
const efficiencyRatingEnum = z.enum(["Ótimo", "Bom", "Reajustar"]);

/**
 * Payment installment schema
 */
const paymentInstallmentSchema = z.object({
  percent: z.number().min(0).max(100),
  description: z.string().min(1, "Descrição é obrigatória"),
  dueDate: z.string().optional(),
});

/**
 * Budget calculation schema
 */
const budgetCalculationSchema = z.object({
  base_price: z.number().min(0).optional(),
  multipliers: z
    .object({
      complexity: z.number().min(0).optional(),
      finish: z.number().min(0).optional(),
    })
    .optional(),
  extras_total: z.number().min(0).optional(),
  survey_fee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  final_price: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  hour_rate: z.number().min(0).optional(),
  efficiency: efficiencyRatingEnum.nullable().optional(),
  price_per_m2: z.number().min(0).optional(),
  items_total: z.number().min(0).optional(),
});

/**
 * Budget details schema
 */
const budgetDetailsSchema = z.object({
  area: z.number().min(0).optional(),
  rooms: z.number().int().min(0).optional(),
  room_list: z.array(z.string()).optional(),
  complexity: complexityEnum.optional(),
  finish: finishEnum.optional(),
  modality: modalityEnum.optional(),
  project_type: projectTypeEnum.optional(),
  items: z.array(z.any()).optional(), // Items are validated separately
});

/**
 * Budget payment terms schema
 */
const budgetPaymentTermsSchema = z.object({
  type: paymentTypeEnum.optional(),
  installments: z.array(paymentInstallmentSchema).optional(),
  validity_days: z.number().int().min(1).optional(),
  custom_terms: z.string().optional(),
});

/**
 * Schema for creating a new budget
 */
export const createBudgetSchema = z.object({
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido").optional(),
  serviceType: budgetServiceTypeEnum,
  details: budgetDetailsSchema.optional(),
  calculation: budgetCalculationSchema.optional(),
  paymentTerms: budgetPaymentTermsSchema.optional(),
  scope: z.array(z.string().min(1, "Item do escopo não pode ser vazio")).optional(),
  notes: z.string().max(2000, "Notas não podem exceder 2000 caracteres").optional(),
});

export type CreateBudgetSchemaType = z.infer<typeof createBudgetSchema>;

/**
 * Schema for updating an existing budget
 */
export const updateBudgetSchema = z.object({
  status: budgetStatusEnum.optional(),
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido").nullable().optional(),
  details: budgetDetailsSchema.optional(),
  calculation: budgetCalculationSchema.optional(),
  paymentTerms: budgetPaymentTermsSchema.optional(),
  scope: z.array(z.string().min(1, "Item do escopo não pode ser vazio")).optional(),
  notes: z.string().max(2000, "Notas não podem exceder 2000 caracteres").nullable().optional(),
});

export type UpdateBudgetSchemaType = z.infer<typeof updateBudgetSchema>;

/**
 * Schema for budget filters (query params)
 */
export const budgetFiltersSchema = z.object({
  status: budgetStatusEnum.optional(),
  serviceType: budgetServiceTypeEnum.optional(),
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido").optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().min(1, "Limite mínimo é 1").max(100, "Limite máximo é 100").default(20),
  offset: z.coerce.number().min(0, "Offset mínimo é 0").default(0),
});

export type BudgetFiltersSchemaType = z.infer<typeof budgetFiltersSchema>;

/**
 * Schema for adding a budget item
 */
export const addBudgetItemSchema = z.object({
  fornecedor: z.string().min(1, "Fornecedor é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que zero"),
  unidade: unidadeTypeEnum.default("Qt."),
  valorProduto: z.number().min(0, "Valor do produto deve ser positivo"),
  valorInstalacao: z.number().min(0).default(0),
  valorFrete: z.number().min(0).default(0),
  valorExtras: z.number().min(0).default(0),
  link: z.string().url("Link deve ser uma URL válida").optional().or(z.literal("")),
  subcategoria: z.string().optional(),
  ambiente: z.string().optional(),
  category: z.string().optional(),
});

export type AddBudgetItemSchemaType = z.infer<typeof addBudgetItemSchema>;

/**
 * Schema for updating a budget item
 */
export const updateBudgetItemSchema = z.object({
  id: z.string().uuid("ID do item deve ser um UUID válido"),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório").optional(),
  descricao: z.string().min(1, "Descrição é obrigatória").optional(),
  quantidade: z.number().min(0.01, "Quantidade deve ser maior que zero").optional(),
  unidade: unidadeTypeEnum.optional(),
  valorProduto: z.number().min(0, "Valor do produto deve ser positivo").optional(),
  valorInstalacao: z.number().min(0).optional(),
  valorFrete: z.number().min(0).optional(),
  valorExtras: z.number().min(0).optional(),
  link: z.string().url("Link deve ser uma URL válida").optional().or(z.literal("")),
  subcategoria: z.string().optional(),
  ambiente: z.string().optional(),
  category: z.string().optional(),
});

export type UpdateBudgetItemSchemaType = z.infer<typeof updateBudgetItemSchema>;

/**
 * Schema for UUID param validation
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export type UUIDParamSchemaType = z.infer<typeof uuidParamSchema>;

/**
 * Schema for item ID query param
 */
export const itemIdSchema = z.object({
  itemId: z.string().uuid("ID do item deve ser um UUID válido"),
});

export type ItemIdSchemaType = z.infer<typeof itemIdSchema>;
