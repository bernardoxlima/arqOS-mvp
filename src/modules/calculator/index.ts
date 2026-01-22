/**
 * Calculator Module - Public Exports
 */

// Types
export type {
  EnvironmentType,
  EnvironmentSize,
  ComplexityLevel,
  FinishLevel,
  DecorComplexity,
  ProduzExpressComplexity,
  ProjectType,
  ServiceType,
  ServiceModality,
  PaymentType,
  EfficiencyRating,
  PositioningMultiplier,
  EnvironmentTypeMultiplier,
  SizeMultiplier,
  ComplexityMultiplier,
  FinishMultiplier,
  PricingTier,
  DecorPricing,
  ProduzExpressPricing,
  ProjetRange,
  ProjetPricing,
  EnvironmentConfig,
  EnvironmentDetail,
  DecorExpressInput,
  ProduzExpressInput,
  ProjetExpressInput,
  CalculatorInput,
  CalculationResult,
  PricingConfig,
  CalculateBudgetResponse,
  PricingConfigResponse,
  // New types for dynamic pricing
  AdditionalVariables,
  VariablesBreakdown,
  HourlyRateResult,
  HourlyRateConfig,
} from './types';

// Schemas
export {
  environmentTypeSchema,
  environmentSizeSchema,
  complexityLevelSchema,
  finishLevelSchema,
  decorComplexitySchema,
  produzexpressComplexitySchema,
  projectTypeSchema,
  serviceTypeSchema,
  serviceModalitySchema,
  paymentTypeSchema,
  efficiencyRatingSchema,
  environmentConfigSchema,
  decorExpressInputSchema,
  produzexpressInputSchema,
  projetExpressInputSchema,
  calculatorInputSchema,
  environmentDetailSchema,
  calculationResultSchema,
  calculateBudgetRequestSchema,
  calculateBudgetResponseSchema,
} from './schemas';

// Pricing Data
export {
  HOUR_VALUE,
  HOURS_PER_MONTH,
  POSITIONING_MULTIPLIERS,
  SURVEY_FEE,
  EXTRA_ENVIRONMENT,
  DEFAULT_MANAGEMENT_FEE,
  CASH_DISCOUNT,
  environmentTypeMultipliers,
  sizeMultipliers,
  complexityMultipliers,
  finishMultipliers,
  decorExpressPricing,
  produzexpressPricing,
  projetExpressPricing,
  defaultPricingConfig,
  getCombinedMultiplier,
  getProjetRangeByArea,
  getEfficiencyRating,
  getDefaultDiscount,
} from './pricing-data';

// Calculator Engine
export {
  calculateBudget,
  calculateHourlyRate,
  applyAdditionalVariables,
  calculateMaxHours,
  estimateHours,
  calculatePricePerM2,
  formatCurrency,
  getEfficiencyColor,
} from './calculator-engine';

// Hooks
export { useCalculator } from './hooks';
