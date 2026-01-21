/**
 * Calculator Module - Default Pricing Data
 * Based on legacy/remix-of-budget-buddy pricing configuration
 */

import type {
  PricingConfig,
  EnvironmentTypeMultiplier,
  SizeMultiplier,
  ComplexityMultiplier,
  FinishMultiplier,
  DecorPricing,
  ProducaoPricing,
  ProjetPricing,
  EnvironmentType,
  EnvironmentSize,
  ComplexityLevel,
  FinishLevel,
  ProjectType,
  PositioningMultiplier,
} from './types';

// Base hour value for calculations (fallback if not configured)
export const HOUR_VALUE = 200;

// Standard working hours per month
export const HOURS_PER_MONTH = 160;

// Positioning multipliers - determines sale price based on market position
export const POSITIONING_MULTIPLIERS: Record<PositioningMultiplier, {
  value: number;
  label: string;
  description: string;
}> = {
  iniciante: {
    value: 1.0,
    label: 'Iniciante',
    description: 'Apenas cobre custos + margem',
  },
  estruturado: {
    value: 1.5,
    label: 'Estruturado',
    description: 'Escritório com processos definidos',
  },
  bem_posicionado: {
    value: 2.0,
    label: 'Bem Posicionado (Recomendado)',
    description: 'Reconhecimento no mercado',
  },
  premium: {
    value: 2.5,
    label: 'Premium',
    description: 'Marca estabelecida',
  },
  ultra_premium: {
    value: 3.0,
    label: 'Ultra Premium',
    description: 'Alto luxo, alta demanda',
  },
};

// Survey fee configuration
export const SURVEY_FEE = {
  presencial: { price: 1000, hours: 4 },
  online: { price: 0, hours: 0 },
} as const;

// Extra environment pricing
export const EXTRA_ENVIRONMENT = {
  pricePerUnit: 1200,
  hoursPerUnit: 8,
} as const;

// Default management fee for ProjetExpress
export const DEFAULT_MANAGEMENT_FEE = {
  price: 1500,
  hours: 8,
} as const;

// Cash discount configuration
export const CASH_DISCOUNT = {
  min: 5,
  max: 15,
  default: 10,
} as const;

// Environment type multipliers (complexity by room type)
export const environmentTypeMultipliers: Record<EnvironmentType, EnvironmentTypeMultiplier> = {
  standard: {
    name: 'Sala, Quarto, Home Office',
    shortName: 'Sala/Quarto/Home Office',
    multiplier: 1.0,
  },
  medium: {
    name: 'Cozinha, Banheiro, Lavanderia',
    shortName: 'Cozinha/Banheiro/Lavanderia',
    multiplier: 1.25,
  },
  high: {
    name: 'Outros Ambientes (Complexidade)',
    shortName: 'Outros (Complexidade)',
    multiplier: 1.4,
  },
};

// Size multipliers (P, M, G)
export const sizeMultipliers: Record<EnvironmentSize, SizeMultiplier> = {
  P: { name: 'P - Pequeno', multiplier: 1.0, description: 'Até 15m²' },
  M: { name: 'M - Médio', multiplier: 1.1, description: '15m² a 30m²' },
  G: { name: 'G - Grande', multiplier: 1.15, description: 'Acima de 30m²' },
};

// Complexity multipliers (for hour estimation)
export const complexityMultipliers: Record<ComplexityLevel, ComplexityMultiplier> = {
  simples: {
    name: 'Simples',
    multiplier: 0.8,
    description: '-20% horas (projeto simplificado)',
  },
  padrao: {
    name: 'Padrão',
    multiplier: 1.0,
    description: 'Base (projeto padrão)',
  },
  complexo: {
    name: 'Complexo',
    multiplier: 1.3,
    description: '+30% horas (detalhes adicionais)',
  },
  muito_complexo: {
    name: 'Muito Complexo',
    multiplier: 1.5,
    description: '+50% horas (alta complexidade)',
  },
};

// Finish multipliers (for price adjustment)
export const finishMultipliers: Record<FinishLevel, FinishMultiplier> = {
  economico: {
    name: 'Econômico',
    multiplier: 0.9,
    description: '-10% valor (acabamento econômico)',
  },
  padrao: {
    name: 'Padrão',
    multiplier: 1.0,
    description: 'Base (acabamento padrão)',
  },
  alto_padrao: {
    name: 'Alto Padrão',
    multiplier: 1.2,
    description: '+20% valor (acabamento premium)',
  },
  luxo: {
    name: 'Luxo',
    multiplier: 1.4,
    description: '+40% valor (acabamento luxo)',
  },
};

// DecorExpress pricing by number of environments
export const decorExpressPricing: Record<string, DecorPricing> = {
  '1': {
    name: '1 Ambiente',
    baseRange: 'R$ 1.600 - 2.400',
    decor1: { price: 1600, hours: 8, description: 'Decoração Simples' },
    decor2: { price: 2000, hours: 10, description: 'Decoração + Marcenaria/Iluminação' },
    decor3: { price: 2400, hours: 12, description: 'Decoração + Civil + Marcenaria + Iluminação' },
  },
  '2': {
    name: '2 Ambientes',
    baseRange: 'R$ 2.900 - 4.000',
    decor1: { price: 2900, hours: 14.5, description: 'Decoração Simples' },
    decor2: { price: 3450, hours: 17.25, description: 'Decoração + Marcenaria/Iluminação' },
    decor3: { price: 4000, hours: 20, description: 'Decoração + Civil + Marcenaria + Iluminação' },
  },
  '3': {
    name: '3 Ambientes',
    baseRange: 'R$ 4.000 - 5.600',
    decor1: { price: 4000, hours: 20, description: 'Decoração Simples' },
    decor2: { price: 4800, hours: 24, description: 'Decoração + Marcenaria/Iluminação' },
    decor3: { price: 5600, hours: 28, description: 'Decoração + Civil + Marcenaria + Iluminação' },
  },
};

// Producao pricing by number of environments
export const producaoPricing: Record<string, ProducaoPricing> = {
  '1': {
    name: '1 Ambiente',
    baseRange: 'R$ 1.600 - 2.400',
    prod1: { price: 1600, hours: 8, description: 'Produção Simples' },
    prod3: { price: 2400, hours: 12, description: 'Produção Completa' },
  },
  '2': {
    name: '2 Ambientes',
    baseRange: 'R$ 2.900 - 4.000',
    prod1: { price: 2900, hours: 14.5, description: 'Produção Simples' },
    prod3: { price: 4000, hours: 20, description: 'Produção Completa' },
  },
  '3': {
    name: '3 Ambientes',
    baseRange: 'R$ 4.000 - 5.600',
    prod1: { price: 4000, hours: 20, description: 'Produção Simples' },
    prod3: { price: 5600, hours: 28, description: 'Produção Completa' },
  },
};

// ProjetExpress pricing by project type and area
export const projetExpressPricing: Record<ProjectType, ProjetPricing> = {
  novo: {
    name: 'Apartamento NOVO',
    ranges: [
      { min: 20, max: 50, pricePerM2: 150, hoursPerM2: 1.5 },
      { min: 50, max: 100, pricePerM2: 145, hoursPerM2: 1.45 },
      { min: 100, max: 150, pricePerM2: 135, hoursPerM2: 1.35 },
      { min: 150, max: 200, pricePerM2: 125, hoursPerM2: 1.25 },
      { min: 200, max: 300, pricePerM2: 120, hoursPerM2: 1.2 },
    ],
  },
  reforma: {
    name: 'Apartamento REFORMA',
    ranges: [
      { min: 20, max: 50, pricePerM2: 180, hoursPerM2: 1.8 },
      { min: 50, max: 100, pricePerM2: 160, hoursPerM2: 1.6 },
      { min: 100, max: 150, pricePerM2: 150, hoursPerM2: 1.5 },
      { min: 150, max: 200, pricePerM2: 140, hoursPerM2: 1.4 },
      { min: 200, max: 300, pricePerM2: 130, hoursPerM2: 1.3 },
    ],
  },
};

// Complete pricing configuration object
export const defaultPricingConfig: PricingConfig = {
  hourValue: HOUR_VALUE,
  surveyFee: SURVEY_FEE,
  extraEnvironment: EXTRA_ENVIRONMENT,
  defaultManagementFee: DEFAULT_MANAGEMENT_FEE,
  cashDiscount: CASH_DISCOUNT,
  environmentTypeMultipliers,
  sizeMultipliers,
  complexityMultipliers,
  finishMultipliers,
  decorExpressPricing,
  producaoPricing,
  projetExpressPricing,
};

// Helper function to get combined multiplier for an environment
export function getCombinedMultiplier(
  type: EnvironmentType,
  size: EnvironmentSize
): number {
  const typeMultiplier = environmentTypeMultipliers[type].multiplier;
  const sizeMultiplier = sizeMultipliers[size].multiplier;
  return typeMultiplier * sizeMultiplier;
}

// Helper function to get ProjetExpress range by area
export function getProjetRangeByArea(
  projectType: ProjectType,
  area: number
): ProjetPricing['ranges'][0] | null {
  const pricing = projetExpressPricing[projectType];
  const range = pricing.ranges.find((r) => area >= r.min && area < r.max);
  return range || null;
}

// Helper function to calculate efficiency rating
export function getEfficiencyRating(hourRate: number): 'Ótimo' | 'Bom' | 'Reajustar' {
  if (hourRate >= HOUR_VALUE) return 'Ótimo';
  if (hourRate >= HOUR_VALUE * 0.9) return 'Bom';
  return 'Reajustar';
}

// Helper to get discount percentage based on payment type
export function getDefaultDiscount(paymentType: 'cash' | 'installments' | 'custom'): number {
  if (paymentType === 'cash') return CASH_DISCOUNT.default;
  return 0;
}
