/**
 * Calculator Module Types
 * Based on legacy/remix-of-budget-buddy pricing logic
 */

// Environment Types
export type EnvironmentType = 'standard' | 'medium' | 'high';
export type EnvironmentSize = 'P' | 'M' | 'G';
export type ComplexityLevel = 'simples' | 'padrao' | 'complexo' | 'muito_complexo';
export type FinishLevel = 'economico' | 'padrao' | 'alto_padrao' | 'luxo';
export type DecorComplexity = 'decor1' | 'decor2' | 'decor3';
export type ProduzExpressComplexity = 'prod1' | 'prod3';
export type ProjectType = 'novo' | 'reforma';
export type ServiceType = 'decorexpress' | 'produzexpress' | 'projetexpress';
export type ServiceModality = 'online' | 'presencial';
export type PaymentType = 'cash' | 'installments' | 'custom';
export type EfficiencyRating = 'Ótimo' | 'Bom' | 'Reajustar';
export type PositioningMultiplier = 'iniciante' | 'estruturado' | 'bem_posicionado' | 'premium' | 'ultra_premium';

// Multiplier Configurations
export interface EnvironmentTypeMultiplier {
  name: string;
  shortName: string;
  multiplier: number;
}

export interface SizeMultiplier {
  name: string;
  multiplier: number;
  description: string;
}

export interface ComplexityMultiplier {
  name: string;
  multiplier: number;
  description: string;
}

export interface FinishMultiplier {
  name: string;
  multiplier: number;
  description: string;
}

// Pricing Structures
export interface PricingTier {
  price: number;
  hours: number;
  description: string;
}

export interface DecorPricing {
  name: string;
  baseRange: string;
  decor1: PricingTier;
  decor2: PricingTier;
  decor3: PricingTier;
}

export interface ProduzExpressPricing {
  name: string;
  baseRange: string;
  prod1: PricingTier;
  prod3: PricingTier;
}

export interface ProjetRange {
  min: number;
  max: number;
  pricePerM2: number;
  hoursPerM2: number;
}

export interface ProjetPricing {
  name: string;
  ranges: ProjetRange[];
}

// Additional Variables for pricing calculations
export interface AdditionalVariables {
  managementPercent?: number;  // 0-15% additional for project management
  discountPercent?: number;    // 0-15% discount
  displacementFee?: number;    // Fixed value in R$ for travel/displacement
}

// Variables breakdown in result
export interface VariablesBreakdown {
  managementPercent: number;
  managementValue: number;
  discountPercent: number;
  discountValue: number;
  displacementFee: number;
}

// Hourly rate calculation result
export interface HourlyRateResult {
  baseCost: number;           // Base cost per hour (salaries + operational / hours)
  withMargin: number;         // With margin (MHV - Minimum Viable Hour)
  saleValue: number;          // Final sale value per hour (with positioning multiplier)
  breakdown: {
    teamCostPerHour: number;
    operationalCostPerHour: number;
  };
}

// Configuration for calculating hourly rate
export interface HourlyRateConfig {
  teamSalaries: number;
  operationalCosts: number;
  margin: number;
  positioningMultiplier: number;
}

// Environment Configuration
export interface EnvironmentConfig {
  type: EnvironmentType;
  size: EnvironmentSize;
  complexity: DecorComplexity | ProduzExpressComplexity;
}

export interface EnvironmentDetail {
  index: number;
  type: EnvironmentType;
  size: EnvironmentSize;
  typeMultiplier: number;
  sizeMultiplier: number;
  combinedMultiplier: number;
}

// Service Details (Input)
export interface DecorExpressInput {
  service: 'decorexpress';
  environmentCount: 1 | 2 | 3;
  complexity: DecorComplexity;
  finishLevel?: FinishLevel;
  environmentsConfig: EnvironmentConfig[];
  extraEnvironments?: number;
  extraEnvironmentPrice?: number;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  discountPercentage?: number;
}

export interface ProduzExpressInput {
  service: 'produzexpress';
  environmentCount: 1 | 2 | 3;
  complexity: ProduzExpressComplexity;
  finishLevel?: FinishLevel;
  environmentsConfig: EnvironmentConfig[];
  extraEnvironments?: number;
  extraEnvironmentPrice?: number;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  discountPercentage?: number;
}

export interface ProjetExpressInput {
  service: 'projetexpress';
  projectType: ProjectType;
  projectArea: number;
  finishLevel?: FinishLevel;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  discountPercentage?: number;
  includeManagement?: boolean;
  managementFee?: number;
}

export type CalculatorInput = DecorExpressInput | ProduzExpressInput | ProjetExpressInput;

// Calculation Result (Output)
export interface CalculationResult {
  basePrice: number;
  avgMultiplier?: number;
  finishMultiplier?: number;
  environmentsDetails?: EnvironmentDetail[];
  priceBeforeExtras?: number;
  extrasTotal: number;
  extrasHours: number;
  surveyFeeTotal: number;
  surveyFeeHours: number;
  managementFeeTotal?: number;
  managementFeeHours?: number;
  finalPrice: number;
  priceWithDiscount: number;
  discount: number;
  estimatedHours: number;
  hourRate: number;
  description?: string;
  efficiency: EfficiencyRating;
  pricePerM2?: number;
  finishLevel?: FinishLevel;
  // New fields for additional variables
  variablesBreakdown?: VariablesBreakdown;
  // New fields for max hours calculation
  maxHours?: number;           // Maximum hours to avoid loss (finalPrice / officeHourlyRate)
  hourlyRateUsed?: number;     // Office hourly rate used in calculation
  isOverBudget?: boolean;      // True if estimatedHours > maxHours
}

// Full Pricing Configuration
export interface PricingConfig {
  hourValue: number;
  surveyFee: {
    presencial: { price: number; hours: number };
    online: { price: number; hours: number };
  };
  extraEnvironment: {
    pricePerUnit: number;
    hoursPerUnit: number;
  };
  defaultManagementFee: {
    price: number;
    hours: number;
  };
  cashDiscount: {
    min: number;
    max: number;
    default: number;
  };
  environmentTypeMultipliers: Record<EnvironmentType, EnvironmentTypeMultiplier>;
  sizeMultipliers: Record<EnvironmentSize, SizeMultiplier>;
  complexityMultipliers: Record<ComplexityLevel, ComplexityMultiplier>;
  finishMultipliers: Record<FinishLevel, FinishMultiplier>;
  decorExpressPricing: Record<string, DecorPricing>;
  produzexpressPricing: Record<string, ProduzExpressPricing>;
  projetExpressPricing: Record<ProjectType, ProjetPricing>;
}

// API Response Types
export interface CalculateBudgetResponse {
  success: boolean;
  data?: {
    input: CalculatorInput;
    result: CalculationResult;
    timestamp: string;
  };
  error?: string;
}

export interface PricingConfigResponse {
  success: boolean;
  data?: PricingConfig;
  error?: string;
}
