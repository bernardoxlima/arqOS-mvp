/**
 * Finance Module
 * Export all finance-related functionality
 */

// Components
export {
  FinanceSummaryCards,
  FinancePeriodFilter,
  FinanceChart,
  FinanceCategoryBreakdown,
  FinanceProjectsTable,
  FinanceSkeleton,
  // Expense components
  ExpenseSummaryCards,
  ExpenseForm,
  ExpensesTable,
  ExpenseEditModal,
  ExpenseCategoryFilter,
} from './components';

// Hooks
export { useFinanceSummary } from './hooks/use-finance-summary';
export { useExpenses } from './hooks/use-expenses';

// Types
export type {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseCategorySummary,
  ExpenseListResult,
} from './types';

// Schemas
export {
  createExpenseSchema,
  updateExpenseSchema,
  expenseFiltersSchema,
  expenseCategorySchema,
  expenseStatusSchema,
  expenseIdSchema,
} from './schemas';

// Constants
export {
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  CATEGORY_COLORS,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  CHART_COLORS,
  PERIOD_PRESETS,
  type PeriodPreset,
} from './constants';
