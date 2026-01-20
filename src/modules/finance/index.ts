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
} from './components';

// Hooks
export { useFinanceSummary } from './hooks/use-finance-summary';

// Constants
export {
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  CATEGORY_COLORS,
  CHART_COLORS,
  PERIOD_PRESETS,
  type PeriodPreset,
} from './constants';
