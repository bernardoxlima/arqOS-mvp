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
  ProducaoComplexity,
  ProjectType,
  ServiceType,
  ServiceModality,
  PaymentType,
  EfficiencyRating,
  EnvironmentTypeMultiplier,
  SizeMultiplier,
  ComplexityMultiplier,
  FinishMultiplier,
  PricingTier,
  DecorPricing,
  ProducaoPricing,
  ProjetRange,
  ProjetPricing,
  EnvironmentConfig,
  EnvironmentDetail,
  DecorExpressInput,
  ProducaoInput,
  ProjetExpressInput,
  CalculatorInput,
  CalculationResult,
  PricingConfig,
  CalculateBudgetResponse,
  PricingConfigResponse,
} from './types';

// Schemas
export {
  environmentTypeSchema,
  environmentSizeSchema,
  complexityLevelSchema,
  finishLevelSchema,
  decorComplexitySchema,
  producaoComplexitySchema,
  projectTypeSchema,
  serviceTypeSchema,
  serviceModalitySchema,
  paymentTypeSchema,
  efficiencyRatingSchema,
  environmentConfigSchema,
  decorExpressInputSchema,
  producaoInputSchema,
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
  SURVEY_FEE,
  EXTRA_ENVIRONMENT,
  DEFAULT_MANAGEMENT_FEE,
  CASH_DISCOUNT,
  environmentTypeMultipliers,
  sizeMultipliers,
  complexityMultipliers,
  finishMultipliers,
  decorExpressPricing,
  producaoPricing,
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
  estimateHours,
  calculatePricePerM2,
  formatCurrency,
  getEfficiencyColor,
} from './calculator-engine';

// Hooks
export { useCalculator } from './hooks';
