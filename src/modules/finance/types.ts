/**
 * Finance Module Types
 * Types for expense management
 */

// Expense-specific category (subset of FinanceCategory for expenses)
export type ExpenseCategory = 'fixo' | 'variavel' | 'salario' | 'imposto';

// Expense is just a FinanceRecord with type='expense'
export interface Expense {
  id: string;
  organization_id: string;
  category: ExpenseCategory;
  description: string;
  value: number;
  date: string;
  due_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  installment: string | null;
  metadata: {
    client: string | null;
    project_code: string | null;
    payment_method: string | null;
    receipt_url: string | null;
  };
  created_at: string;
}

// Filters for listing expenses
export interface ExpenseFilters {
  category?: ExpenseCategory | 'all';
  status?: 'pending' | 'paid' | 'overdue' | 'all';
  startDate?: string;
  endDate?: string;
}

// Create expense data
export interface CreateExpenseData {
  category: ExpenseCategory;
  description: string;
  value: number;
  date?: string;
  due_date?: string;
  status?: 'pending' | 'paid';
}

// Update expense data
export interface UpdateExpenseData {
  category?: ExpenseCategory;
  description?: string;
  value?: number;
  date?: string;
  due_date?: string | null;
  status?: 'pending' | 'paid' | 'overdue';
}

// Summary by category
export interface ExpenseCategorySummary {
  category: ExpenseCategory;
  label: string;
  total: number;
  count: number;
  color: string;
}

// Expense list result
export interface ExpenseListResult {
  expenses: Expense[];
  totalCount: number;
  totalValue: number;
  byCategory: Record<ExpenseCategory, number>;
}
