/**
 * Constants Index
 * Re-exports all onboarding constants
 */

export * from './office-sizes';
export * from './roles';
export * from './cost-fields';
export * from './services';

// Wizard steps configuration
export const WIZARD_STEPS = [
  { id: 1, name: 'Tamanho', description: 'Tamanho do escritório' },
  { id: 2, name: 'Nome', description: 'Nome do escritório' },
  { id: 3, name: 'Equipe', description: 'Membros da equipe' },
  { id: 4, name: 'Custos', description: 'Custos fixos mensais' },
  { id: 5, name: 'Serviços', description: 'Serviços oferecidos' },
  { id: 6, name: 'Margem', description: 'Margem de lucro' },
] as const;

export const TOTAL_STEPS = WIZARD_STEPS.length;

// Default margin value
export const DEFAULT_MARGIN = 30;
export const MIN_MARGIN = 10;
export const MAX_MARGIN = 100;
