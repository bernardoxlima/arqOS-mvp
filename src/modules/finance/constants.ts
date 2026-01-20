/**
 * Finance Module Constants
 * Category colors, labels, and configuration
 */

// Category labels for income (Portuguese)
export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  projeto: 'Projetos',
  fixo: 'Fixo',
  variavel: 'Variável',
};

// Category labels for expenses (Portuguese)
export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  operacional: 'Operacional',
  material: 'Material',
  pessoal: 'Pessoal',
  marketing: 'Marketing',
  outros: 'Outros',
};

// Category colors for charts and visualizations
export const CATEGORY_COLORS = {
  // Income categories
  projeto: '#10b981', // emerald-500
  fixo: '#6366f1', // indigo-500
  variavel: '#f59e0b', // amber-500

  // Expense categories
  operacional: '#ef4444', // red-500
  material: '#f97316', // orange-500
  pessoal: '#8b5cf6', // violet-500
  marketing: '#ec4899', // pink-500
  outros: '#6b7280', // gray-500
} as const;

// Chart colors for income vs expenses
export const CHART_COLORS = {
  income: '#10b981', // emerald-500
  expenses: '#ef4444', // red-500
  balance: '#3b82f6', // blue-500
  paid: '#10b981', // emerald-500
  pending: '#f59e0b', // amber-500
  overdue: '#ef4444', // red-500
} as const;

// Period presets for filter
export interface PeriodPreset {
  label: string;
  value: string;
  getRange: () => { startDate: string; endDate: string };
}

const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const PERIOD_PRESETS: PeriodPreset[] = [
  {
    label: 'Este Mês',
    value: 'this-month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end) };
    },
  },
  {
    label: 'Mês Anterior',
    value: 'last-month',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end) };
    },
  },
  {
    label: 'Últimos 3 Meses',
    value: 'last-3-months',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end) };
    },
  },
  {
    label: 'Este Ano',
    value: 'this-year',
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end) };
    },
  },
  {
    label: 'Personalizado',
    value: 'custom',
    getRange: () => {
      // For custom, we return current month as default
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatDateISO(start), endDate: formatDateISO(end) };
    },
  },
];
