/**
 * Finance Module Constants
 * Category colors, labels, and configuration
 */

import type { ExpenseCategory } from './types';

// Category labels for income (Portuguese)
export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  projeto: 'Projetos',
  fixo: 'Fixo',
  variavel: 'Variável',
};

// Category labels for expenses (Portuguese) - legacy format
export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  fixo: 'Custos Fixos',
  variavel: 'Custos Variáveis',
  salario: 'Salários',
  imposto: 'Impostos',
};

// Expense categories with full configuration
export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  fixo: {
    label: 'Custos Fixos',
    description: 'Aluguel, contas, assinaturas mensais',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  variavel: {
    label: 'Custos Variáveis',
    description: 'Materiais, serviços, ferramentas',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  salario: {
    label: 'Salários',
    description: 'Folha de pagamento, benefícios',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  imposto: {
    label: 'Impostos',
    description: 'ISS, IRPJ, CSLL, outros tributos',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

// Category colors for charts and visualizations
export const CATEGORY_COLORS = {
  // Income categories
  projeto: '#10b981', // emerald-500
  // Shared categories (income/expense)
  fixo: '#3b82f6', // blue-500
  variavel: '#f97316', // orange-500
  // Expense-only categories
  salario: '#8b5cf6', // violet-500
  imposto: '#ef4444', // red-500
} as const;

// Expense category colors for charts (hex values)
export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fixo: '#3b82f6', // blue-500
  variavel: '#f97316', // orange-500
  salario: '#8b5cf6', // violet-500
  imposto: '#ef4444', // red-500
};

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
