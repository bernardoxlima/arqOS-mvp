'use server';

import { createClient } from '@/shared/lib/supabase/server';
import type {
  Expense,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseCategory,
  ExpenseListResult,
} from '../types';

// Result type for service operations
interface ServiceResult<T = null> {
  data: T | null;
  error: { message: string; code: string } | null;
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * List expenses with optional filters
 */
export async function listExpenses(
  filters: ExpenseFilters = {}
): Promise<ServiceResult<ExpenseListResult>> {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const { data: profile, error: profileError } = await supabase.rpc(
    'get_current_profile'
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || 'Usuário não autenticado',
        code: 'UNAUTHENTICATED',
      },
    };
  }

  let query = supabase
    .from('finance_records')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .eq('type', 'expense')
    .order('date', { ascending: false });

  // Apply filters
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  // Calculate totals by category
  const expenses = (data || []) as Expense[];
  const byCategory: Record<ExpenseCategory, number> = {
    fixo: 0,
    variavel: 0,
    salario: 0,
    imposto: 0,
  };

  let totalValue = 0;

  for (const expense of expenses) {
    totalValue += expense.value;
    if (expense.category && expense.category in byCategory) {
      byCategory[expense.category as ExpenseCategory] += expense.value;
    }
  }

  return {
    data: {
      expenses,
      totalCount: expenses.length,
      totalValue,
      byCategory,
    },
    error: null,
  };
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(
  id: string
): Promise<ServiceResult<Expense>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('finance_records')
    .select('*')
    .eq('id', id)
    .eq('type', 'expense')
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as Expense, error: null };
}

/**
 * Create a new expense
 */
export async function createExpense(
  data: CreateExpenseData
): Promise<ServiceResult<Expense>> {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const { data: profile, error: profileError } = await supabase.rpc(
    'get_current_profile'
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || 'Usuário não autenticado',
        code: 'UNAUTHENTICATED',
      },
    };
  }

  // Prepare insert data
  const today = new Date().toISOString().split('T')[0];
  const insertData = {
    organization_id: profile.organization_id,
    type: 'expense' as const,
    category: data.category,
    description: data.description,
    value: data.value,
    date: data.date || today,
    due_date: data.due_date || null,
    status: data.status || 'pending',
    metadata: {
      client: null,
      project_code: null,
      payment_method: null,
      receipt_url: null,
    },
  };

  const { data: expense, error: insertError } = await supabase
    .from('finance_records')
    .insert(insertData)
    .select('*')
    .single();

  if (insertError) {
    return {
      data: null,
      error: { message: insertError.message, code: insertError.code },
    };
  }

  return { data: expense as Expense, error: null };
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: string,
  data: UpdateExpenseData
): Promise<ServiceResult<Expense>> {
  const supabase = await createClient();

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};

  if (data.category !== undefined) {
    updateData.category = data.category;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.value !== undefined) {
    updateData.value = data.value;
  }
  if (data.date !== undefined) {
    updateData.date = data.date;
  }
  if (data.due_date !== undefined) {
    updateData.due_date = data.due_date;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  const { data: expense, error } = await supabase
    .from('finance_records')
    .update(updateData)
    .eq('id', id)
    .eq('type', 'expense')
    .select('*')
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: expense as Expense, error: null };
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<ServiceResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('finance_records')
    .delete()
    .eq('id', id)
    .eq('type', 'expense');

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Get expenses summary by category for a period
 */
export async function getExpensesSummary(
  startDate?: string,
  endDate?: string
): Promise<ServiceResult<Record<ExpenseCategory, number>>> {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const { data: profile, error: profileError } = await supabase.rpc(
    'get_current_profile'
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || 'Usuário não autenticado',
        code: 'UNAUTHENTICATED',
      },
    };
  }

  let query = supabase
    .from('finance_records')
    .select('category, value')
    .eq('organization_id', profile.organization_id)
    .eq('type', 'expense');

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  // Aggregate by category
  const byCategory: Record<ExpenseCategory, number> = {
    fixo: 0,
    variavel: 0,
    salario: 0,
    imposto: 0,
  };

  for (const record of data || []) {
    const category = record.category as ExpenseCategory;
    if (category && category in byCategory) {
      byCategory[category] += record.value || 0;
    }
  }

  return { data: byCategory, error: null };
}
