/**
 * Cost Fields Constants
 * Defines the fixed cost fields for the setup wizard
 */

import type { CostField, OfficeCosts } from '../types';

export const COST_FIELDS: CostField[] = [
  {
    key: 'rent',
    label: 'Aluguel',
    placeholder: 'Ex: 3000',
  },
  {
    key: 'utilities',
    label: 'Contas (luz, água, gás)',
    placeholder: 'Ex: 500',
  },
  {
    key: 'software',
    label: 'Softwares e Assinaturas',
    placeholder: 'Ex: 800',
  },
  {
    key: 'marketing',
    label: 'Marketing e Publicidade',
    placeholder: 'Ex: 1000',
  },
  {
    key: 'accountant',
    label: 'Contador',
    placeholder: 'Ex: 500',
  },
  {
    key: 'internet',
    label: 'Internet e Telefone',
    placeholder: 'Ex: 200',
  },
  {
    key: 'others',
    label: 'Outros Custos Fixos',
    placeholder: 'Ex: 300',
  },
];

/**
 * Default costs (all zero)
 */
export const DEFAULT_COSTS: OfficeCosts = {
  rent: 0,
  utilities: 0,
  software: 0,
  marketing: 0,
  accountant: 0,
  internet: 0,
  others: 0,
};

/**
 * Calculate total monthly costs
 */
export function calculateTotalCosts(costs: OfficeCosts): number {
  return Object.values(costs).reduce((sum, value) => sum + (value || 0), 0);
}

/**
 * Format currency value (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
