"use server";

import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/shared/lib/supabase/server";
import type {
  BudgetFilters,
  CreateBudgetData,
  UpdateBudgetData,
  BudgetResult,
  BudgetWithClient,
  BudgetItem,
  BudgetDetails,
  BudgetCalculation,
  AddBudgetItemData,
  UpdateBudgetItemData,
} from "../types";
import {
  DEFAULT_CALCULATION,
  DEFAULT_DETAILS,
  DEFAULT_PAYMENT_TERMS,
} from "../constants/defaults";
import {
  calculateItemTotal,
  recalculateItemsTotal,
} from "../utils/calculations";

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * List budgets with optional filters
 */
export async function listBudgets(
  filters: BudgetFilters = {}
): Promise<BudgetResult<BudgetWithClient[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.serviceType) {
    query = query.eq("service_type", filters.serviceType);
  }
  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }
  if (filters.search) {
    query = query.or(
      `code.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  // Apply pagination
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as BudgetWithClient[], error: null };
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(
  id: string
): Promise<BudgetResult<BudgetWithClient>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as BudgetWithClient, error: null };
}

/**
 * Create a new budget
 */
export async function createBudget(
  data: CreateBudgetData
): Promise<BudgetResult<BudgetWithClient>> {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  // If clientName is provided but not clientId, create a new client
  let clientId = data.clientId || null;
  if (!clientId && data.clientName) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        organization_id: profile.organization_id,
        name: data.clientName,
      })
      .select("id")
      .single();

    if (clientError) {
      return {
        data: null,
        error: { message: clientError.message, code: clientError.code },
      };
    }
    clientId = newClient.id;
  }

  // Generate budget code
  const { data: code, error: codeError } = await supabase.rpc(
    "generate_budget_code",
    { org_id: profile.organization_id }
  );

  if (codeError) {
    return {
      data: null,
      error: { message: codeError.message, code: codeError.code },
    };
  }

  // Merge provided data with defaults
  const details: BudgetDetails = {
    ...DEFAULT_DETAILS,
    ...data.details,
    items: data.details?.items || [],
  };

  const calculation: BudgetCalculation = {
    ...DEFAULT_CALCULATION,
    ...data.calculation,
    multipliers: {
      ...DEFAULT_CALCULATION.multipliers,
      ...data.calculation?.multipliers,
    },
  };

  const paymentTerms = {
    ...DEFAULT_PAYMENT_TERMS,
    ...data.paymentTerms,
  };

  // Prepare insert data
  const insertData = {
    organization_id: profile.organization_id,
    code: code || `PROP-${Date.now()}`,
    client_id: clientId,
    service_type: data.serviceType,
    status: "draft",
    details: details as unknown as Record<string, unknown>,
    calculation: calculation as unknown as Record<string, unknown>,
    payment_terms: paymentTerms as unknown as Record<string, unknown>,
    scope: data.scope || null,
    notes: data.projectName ? `Projeto: ${data.projectName}` : (data.notes || null),
    created_by: profile.id,
  };

  const { data: budget, error: insertError } = await supabase
    .from("budgets")
    .insert(insertData)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (insertError) {
    return {
      data: null,
      error: { message: insertError.message, code: insertError.code },
    };
  }

  return { data: budget as BudgetWithClient, error: null };
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  data: UpdateBudgetData
): Promise<BudgetResult<BudgetWithClient>> {
  const supabase = await createClient();

  // First, get existing budget to merge JSONB fields
  const { data: existing, error: fetchError } = await supabase
    .from("budgets")
    .select("details, calculation, payment_terms")
    .eq("id", id)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.clientId !== undefined) {
    updateData.client_id = data.clientId;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }
  if (data.scope !== undefined) {
    updateData.scope = data.scope;
  }

  // Merge JSONB fields
  if (data.details !== undefined) {
    const existingDetails = (existing?.details as Record<string, unknown>) || {};
    updateData.details = {
      ...existingDetails,
      ...data.details,
    };
  }
  if (data.calculation !== undefined) {
    const existingCalc = (existing?.calculation as Record<string, unknown>) || {};
    const existingMultipliers = (existingCalc.multipliers as Record<string, unknown>) || {};
    updateData.calculation = {
      ...existingCalc,
      ...data.calculation,
      multipliers: {
        ...existingMultipliers,
        ...data.calculation?.multipliers,
      },
    };
  }
  if (data.paymentTerms !== undefined) {
    const existingTerms = (existing?.payment_terms as Record<string, unknown>) || {};
    updateData.payment_terms = {
      ...existingTerms,
      ...data.paymentTerms,
    };
  }

  const { data: budget, error } = await supabase
    .from("budgets")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: budget as BudgetWithClient, error: null };
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<BudgetResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Count budgets (for pagination metadata)
 */
export async function countBudgets(
  filters: Omit<BudgetFilters, "limit" | "offset"> = {}
): Promise<BudgetResult<number>> {
  const supabase = await createClient();

  let query = supabase
    .from("budgets")
    .select("id", { count: "exact", head: true });

  // Apply same filters as listBudgets
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.serviceType) {
    query = query.eq("service_type", filters.serviceType);
  }
  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }
  if (filters.search) {
    query = query.or(
      `code.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { count, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: count || 0, error: null };
}

// ============================================================================
// Item Management
// ============================================================================

/**
 * Add an item to a budget
 */
export async function addBudgetItem(
  budgetId: string,
  itemData: AddBudgetItemData
): Promise<BudgetResult<BudgetWithClient>> {
  const supabase = await createClient();

  // Get current budget
  const { data: budget, error: fetchError } = await supabase
    .from("budgets")
    .select("details, calculation")
    .eq("id", budgetId)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  // Build new item
  const newItem: BudgetItem = {
    id: uuidv4(),
    fornecedor: itemData.fornecedor,
    descricao: itemData.descricao,
    quantidade: itemData.quantidade,
    unidade: itemData.unidade || "Qt.",
    valorProduto: itemData.valorProduto,
    valorInstalacao: itemData.valorInstalacao || 0,
    valorFrete: itemData.valorFrete || 0,
    valorExtras: itemData.valorExtras || 0,
    valorCompleto: 0, // Will be calculated below
    link: itemData.link,
    subcategoria: itemData.subcategoria,
    ambiente: itemData.ambiente,
    category: itemData.category,
  };

  // Calculate item total
  newItem.valorCompleto = calculateItemTotal(newItem);

  // Get existing items and add new one
  const details = (budget?.details as BudgetDetails) || DEFAULT_DETAILS;
  const existingItems = details.items || [];
  const updatedItems = [...existingItems, newItem];

  // Recalculate items total
  const itemsTotal = recalculateItemsTotal(updatedItems);

  // Update budget
  const updatedDetails = {
    ...details,
    items: updatedItems,
  };

  const calculation = (budget?.calculation as BudgetCalculation) || DEFAULT_CALCULATION;
  const updatedCalculation = {
    ...calculation,
    items_total: itemsTotal,
  };

  const { data: updatedBudget, error: updateError } = await supabase
    .from("budgets")
    .update({
      details: updatedDetails as unknown as Record<string, unknown>,
      calculation: updatedCalculation as unknown as Record<string, unknown>,
    })
    .eq("id", budgetId)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  return { data: updatedBudget as BudgetWithClient, error: null };
}

/**
 * Update an item in a budget
 */
export async function updateBudgetItem(
  budgetId: string,
  itemData: UpdateBudgetItemData
): Promise<BudgetResult<BudgetWithClient>> {
  const supabase = await createClient();

  // Get current budget
  const { data: budget, error: fetchError } = await supabase
    .from("budgets")
    .select("details, calculation")
    .eq("id", budgetId)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  // Get existing items
  const details = (budget?.details as BudgetDetails) || DEFAULT_DETAILS;
  const existingItems = details.items || [];

  // Find and update the item
  const itemIndex = existingItems.findIndex((item) => item.id === itemData.id);

  if (itemIndex === -1) {
    return {
      data: null,
      error: { message: "Item não encontrado", code: "NOT_FOUND" },
    };
  }

  // Merge existing item with updates
  const existingItem = existingItems[itemIndex];
  const updatedItem: BudgetItem = {
    ...existingItem,
    fornecedor: itemData.fornecedor ?? existingItem.fornecedor,
    descricao: itemData.descricao ?? existingItem.descricao,
    quantidade: itemData.quantidade ?? existingItem.quantidade,
    unidade: itemData.unidade ?? existingItem.unidade,
    valorProduto: itemData.valorProduto ?? existingItem.valorProduto,
    valorInstalacao: itemData.valorInstalacao ?? existingItem.valorInstalacao,
    valorFrete: itemData.valorFrete ?? existingItem.valorFrete,
    valorExtras: itemData.valorExtras ?? existingItem.valorExtras,
    link: itemData.link ?? existingItem.link,
    subcategoria: itemData.subcategoria ?? existingItem.subcategoria,
    ambiente: itemData.ambiente ?? existingItem.ambiente,
    category: itemData.category ?? existingItem.category,
    valorCompleto: 0, // Will be recalculated
  };

  // Recalculate item total
  updatedItem.valorCompleto = calculateItemTotal(updatedItem);

  // Update items array
  const updatedItems = [...existingItems];
  updatedItems[itemIndex] = updatedItem;

  // Recalculate items total
  const itemsTotal = recalculateItemsTotal(updatedItems);

  // Update budget
  const updatedDetails = {
    ...details,
    items: updatedItems,
  };

  const calculation = (budget?.calculation as BudgetCalculation) || DEFAULT_CALCULATION;
  const updatedCalculation = {
    ...calculation,
    items_total: itemsTotal,
  };

  const { data: updatedBudget, error: updateError } = await supabase
    .from("budgets")
    .update({
      details: updatedDetails as unknown as Record<string, unknown>,
      calculation: updatedCalculation as unknown as Record<string, unknown>,
    })
    .eq("id", budgetId)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  return { data: updatedBudget as BudgetWithClient, error: null };
}

/**
 * Remove an item from a budget
 */
export async function removeBudgetItem(
  budgetId: string,
  itemId: string
): Promise<BudgetResult<BudgetWithClient>> {
  const supabase = await createClient();

  // Get current budget
  const { data: budget, error: fetchError } = await supabase
    .from("budgets")
    .select("details, calculation")
    .eq("id", budgetId)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: fetchError.message, code: fetchError.code },
    };
  }

  // Get existing items
  const details = (budget?.details as BudgetDetails) || DEFAULT_DETAILS;
  const existingItems = details.items || [];

  // Find and remove the item
  const itemIndex = existingItems.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return {
      data: null,
      error: { message: "Item não encontrado", code: "NOT_FOUND" },
    };
  }

  // Remove item
  const updatedItems = existingItems.filter((item) => item.id !== itemId);

  // Recalculate items total
  const itemsTotal = recalculateItemsTotal(updatedItems);

  // Update budget
  const updatedDetails = {
    ...details,
    items: updatedItems,
  };

  const calculation = (budget?.calculation as BudgetCalculation) || DEFAULT_CALCULATION;
  const updatedCalculation = {
    ...calculation,
    items_total: itemsTotal,
  };

  const { data: updatedBudget, error: updateError } = await supabase
    .from("budgets")
    .update({
      details: updatedDetails as unknown as Record<string, unknown>,
      calculation: updatedCalculation as unknown as Record<string, unknown>,
    })
    .eq("id", budgetId)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  return { data: updatedBudget as BudgetWithClient, error: null };
}
