/**
 * Calculator Engine - Core calculation logic
 * Based on legacy/remix-of-budget-buddy PricingCalculator
 */

import type {
  CalculatorInput,
  CalculationResult,
  DecorExpressInput,
  ProduzExpressInput,
  ProjetExpressInput,
  EnvironmentDetail,
  EnvironmentType,
  EnvironmentSize,
  EfficiencyRating,
  HourlyRateConfig,
  HourlyRateResult,
  AdditionalVariables,
  VariablesBreakdown,
  FinishLevel,
} from './types';

import {
  SURVEY_FEE,
  EXTRA_ENVIRONMENT,
  DEFAULT_MANAGEMENT_FEE,
  HOURS_PER_MONTH,
  environmentTypeMultipliers,
  sizeMultipliers,
  finishMultipliers,
  decorExpressPricing,
  produzexpressPricing,
  projetExpressPricing,
  getEfficiencyRating,
  getDefaultDiscount,
} from './pricing-data';

/**
 * Calculate office hourly rate based on costs, margin, and positioning
 * Formula:
 *   CUSTO_HORA_BASE = (CUSTO_EQUIPE + CUSTO_OPERACIONAL) / 160h
 *   CUSTO_HORA_MARGEM = CUSTO_HORA_BASE × (1 + MARGEM/100)
 *   VALOR_HORA_VENDA = CUSTO_HORA_MARGEM × MULTIPLICADOR_POSICIONAMENTO
 */
export function calculateHourlyRate(config: HourlyRateConfig): HourlyRateResult {
  const teamCostPerHour = config.teamSalaries / HOURS_PER_MONTH;
  const operationalCostPerHour = config.operationalCosts / HOURS_PER_MONTH;
  const baseCost = teamCostPerHour + operationalCostPerHour;
  const withMargin = baseCost * (1 + config.margin / 100);
  const saleValue = withMargin * config.positioningMultiplier;

  return {
    baseCost: Math.round(baseCost * 100) / 100,
    withMargin: Math.round(withMargin * 100) / 100,
    saleValue: Math.round(saleValue * 100) / 100,
    breakdown: {
      teamCostPerHour: Math.round(teamCostPerHour * 100) / 100,
      operationalCostPerHour: Math.round(operationalCostPerHour * 100) / 100,
    },
  };
}

/**
 * Apply additional variables (management %, discount %, displacement fee) to price
 * Formula: PRECO_FINAL = PRECO_BASE × (1 + GERENCIAMENTO/100) × (1 - DESCONTO/100) + DESLOCAMENTO
 */
export function applyAdditionalVariables(
  basePrice: number,
  variables: AdditionalVariables
): { finalPrice: number; breakdown: VariablesBreakdown } {
  const managementPercent = variables.managementPercent || 0;
  const discountPercent = variables.discountPercent || 0;
  const displacementFee = variables.displacementFee || 0;

  const managementValue = basePrice * (managementPercent / 100);
  const withManagement = basePrice + managementValue;

  const discountValue = withManagement * (discountPercent / 100);
  const withDiscount = withManagement - discountValue;

  const finalPrice = withDiscount + displacementFee;

  return {
    finalPrice: Math.round(finalPrice * 100) / 100,
    breakdown: {
      managementPercent,
      managementValue: Math.round(managementValue * 100) / 100,
      discountPercent,
      discountValue: Math.round(discountValue * 100) / 100,
      displacementFee,
    },
  };
}

/**
 * Calculate max hours based on price and office hourly rate
 * Formula: HORAS_MAXIMAS = PRECO_COBRADO / VALOR_HORA_VENDA
 */
export function calculateMaxHours(
  price: number,
  officeHourlyRate: number
): { maxHours: number; isOverBudget: (estimatedHours: number) => boolean } {
  const maxHours = officeHourlyRate > 0 ? price / officeHourlyRate : 0;
  return {
    maxHours: Math.round(maxHours * 10) / 10, // 1 decimal place
    isOverBudget: (estimatedHours: number) => estimatedHours > maxHours,
  };
}

/**
 * Helper function to get finish multiplier value
 */
function getFinishMultiplier(finishLevel?: FinishLevel): number {
  if (!finishLevel) return 1.0;
  return finishMultipliers[finishLevel]?.multiplier ?? 1.0;
}

/**
 * Main calculator function - routes to appropriate service calculator
 */
export function calculateBudget(input: CalculatorInput): CalculationResult {
  switch (input.service) {
    case 'decorexpress':
      return calculateDecorExpress(input);
    case 'produzexpress':
      return calculateProduzExpress(input);
    case 'projetexpress':
      return calculateProjetExpress(input);
    default:
      throw new Error(`Unknown service type: ${(input as CalculatorInput).service}`);
  }
}

/**
 * Calculate environment details with multipliers
 */
function calculateEnvironmentDetails(
  environmentsConfig: Array<{ type: EnvironmentType; size: EnvironmentSize }>
): EnvironmentDetail[] {
  return environmentsConfig.map((env, index) => {
    const typeMultiplier = environmentTypeMultipliers[env.type].multiplier;
    const sizeMultiplier = sizeMultipliers[env.size].multiplier;
    return {
      index,
      type: env.type,
      size: env.size,
      typeMultiplier,
      sizeMultiplier,
      combinedMultiplier: typeMultiplier * sizeMultiplier,
    };
  });
}

/**
 * Calculate average multiplier from environment details
 */
function calculateAverageMultiplier(details: EnvironmentDetail[]): number {
  if (details.length === 0) return 1;
  const sum = details.reduce((acc, d) => acc + d.combinedMultiplier, 0);
  return sum / details.length;
}

/**
 * Calculate survey fee based on modality
 */
function getSurveyFee(modality: 'online' | 'presencial'): { price: number; hours: number } {
  return SURVEY_FEE[modality];
}

/**
 * Calculate extras (additional environments)
 */
function calculateExtras(
  extraEnvironments: number,
  customPrice?: number
): { total: number; hours: number } {
  const pricePerUnit = customPrice ?? EXTRA_ENVIRONMENT.pricePerUnit;
  return {
    total: extraEnvironments * pricePerUnit,
    hours: extraEnvironments * EXTRA_ENVIRONMENT.hoursPerUnit,
  };
}

/**
 * Calculate DecorExpress budget
 */
function calculateDecorExpress(input: DecorExpressInput): CalculationResult {
  const envCount = String(input.environmentCount);
  const pricingTier = decorExpressPricing[envCount];

  if (!pricingTier) {
    throw new Error(`Invalid environment count: ${input.environmentCount}`);
  }

  // Get base pricing based on complexity level
  const basePricing = pricingTier[input.complexity];
  if (!basePricing) {
    throw new Error(`Invalid complexity: ${input.complexity}`);
  }

  // Calculate environment details with multipliers
  const environmentsDetails = calculateEnvironmentDetails(input.environmentsConfig);
  const avgMultiplier = calculateAverageMultiplier(environmentsDetails);

  // Get finish multiplier
  const finishMult = getFinishMultiplier(input.finishLevel);

  // Calculate base price with multipliers (environment + finish)
  const basePrice = basePricing.price;
  const priceWithMultiplier = basePrice * avgMultiplier * finishMult;

  // Calculate extras (additional environments beyond the base)
  const extraCount = input.extraEnvironments ?? 0;
  const extras = calculateExtras(extraCount, input.extraEnvironmentPrice);

  // Calculate survey fee
  const surveyFee = getSurveyFee(input.serviceModality);

  // Calculate totals
  const priceBeforeExtras = priceWithMultiplier;
  const finalPrice = priceBeforeExtras + extras.total + surveyFee.price;

  // Apply discount
  const discountPercentage = input.discountPercentage ?? getDefaultDiscount(input.paymentType);
  const discount = finalPrice * (discountPercentage / 100);
  const priceWithDiscount = finalPrice - discount;

  // Calculate hours
  const baseHours = basePricing.hours;
  const estimatedHours = baseHours + extras.hours + surveyFee.hours;

  // Calculate hourly rate and efficiency
  const hourRate = priceWithDiscount / estimatedHours;
  const efficiency = getEfficiencyRating(hourRate);

  return {
    basePrice,
    avgMultiplier,
    finishMultiplier: finishMult,
    finishLevel: input.finishLevel,
    environmentsDetails,
    priceBeforeExtras,
    extrasTotal: extras.total,
    extrasHours: extras.hours,
    surveyFeeTotal: surveyFee.price,
    surveyFeeHours: surveyFee.hours,
    finalPrice,
    priceWithDiscount,
    discount,
    estimatedHours,
    hourRate: Math.round(hourRate * 100) / 100,
    description: basePricing.description,
    efficiency,
  };
}

/**
 * Calculate ProduzExpress budget
 */
function calculateProduzExpress(input: ProduzExpressInput): CalculationResult {
  const envCount = String(input.environmentCount);
  const pricingTier = produzexpressPricing[envCount];

  if (!pricingTier) {
    throw new Error(`Invalid environment count: ${input.environmentCount}`);
  }

  // Get base pricing based on complexity level
  const basePricing = pricingTier[input.complexity];
  if (!basePricing) {
    throw new Error(`Invalid complexity: ${input.complexity}`);
  }

  // Calculate environment details with multipliers
  const environmentsDetails = calculateEnvironmentDetails(input.environmentsConfig);
  const avgMultiplier = calculateAverageMultiplier(environmentsDetails);

  // Get finish multiplier
  const finishMult = getFinishMultiplier(input.finishLevel);

  // Calculate base price with multipliers (environment + finish)
  const basePrice = basePricing.price;
  const priceWithMultiplier = basePrice * avgMultiplier * finishMult;

  // Calculate extras (additional environments beyond the base)
  const extraCount = input.extraEnvironments ?? 0;
  const extras = calculateExtras(extraCount, input.extraEnvironmentPrice);

  // Calculate survey fee
  const surveyFee = getSurveyFee(input.serviceModality);

  // Calculate totals
  const priceBeforeExtras = priceWithMultiplier;
  const finalPrice = priceBeforeExtras + extras.total + surveyFee.price;

  // Apply discount
  const discountPercentage = input.discountPercentage ?? getDefaultDiscount(input.paymentType);
  const discount = finalPrice * (discountPercentage / 100);
  const priceWithDiscount = finalPrice - discount;

  // Calculate hours
  const baseHours = basePricing.hours;
  const estimatedHours = baseHours + extras.hours + surveyFee.hours;

  // Calculate hourly rate and efficiency
  const hourRate = priceWithDiscount / estimatedHours;
  const efficiency = getEfficiencyRating(hourRate);

  return {
    basePrice,
    avgMultiplier,
    finishMultiplier: finishMult,
    finishLevel: input.finishLevel,
    environmentsDetails,
    priceBeforeExtras,
    extrasTotal: extras.total,
    extrasHours: extras.hours,
    surveyFeeTotal: surveyFee.price,
    surveyFeeHours: surveyFee.hours,
    finalPrice,
    priceWithDiscount,
    discount,
    estimatedHours,
    hourRate: Math.round(hourRate * 100) / 100,
    description: basePricing.description,
    efficiency,
  };
}

/**
 * Calculate ProjetExpress budget (per m²)
 */
function calculateProjetExpress(input: ProjetExpressInput): CalculationResult {
  const pricing = projetExpressPricing[input.projectType];

  if (!pricing) {
    throw new Error(`Invalid project type: ${input.projectType}`);
  }

  // Find the appropriate range for the project area
  const range = pricing.ranges.find(
    (r) => input.projectArea >= r.min && input.projectArea < r.max
  );

  if (!range) {
    // Handle edge cases - use closest range
    const sortedRanges = [...pricing.ranges].sort((a, b) => a.min - b.min);
    const closestRange = input.projectArea < sortedRanges[0].min
      ? sortedRanges[0]
      : sortedRanges[sortedRanges.length - 1];

    if (!closestRange) {
      throw new Error(`No pricing range found for area: ${input.projectArea}m²`);
    }
  }

  const selectedRange = range ?? pricing.ranges[0];

  // Get finish multiplier
  const finishMult = getFinishMultiplier(input.finishLevel);

  // Calculate base price (price per m² × area × finish multiplier)
  const rawBasePrice = selectedRange.pricePerM2 * input.projectArea;
  const basePrice = rawBasePrice * finishMult;
  const pricePerM2 = selectedRange.pricePerM2 * finishMult;

  // Calculate survey fee
  const surveyFee = getSurveyFee(input.serviceModality);

  // Calculate management fee (optional)
  const includeManagement = input.includeManagement ?? false;
  const managementFee = includeManagement
    ? {
        price: input.managementFee ?? DEFAULT_MANAGEMENT_FEE.price,
        hours: DEFAULT_MANAGEMENT_FEE.hours,
      }
    : { price: 0, hours: 0 };

  // Calculate totals
  const finalPrice = basePrice + surveyFee.price + managementFee.price;

  // Apply discount
  const discountPercentage = input.discountPercentage ?? getDefaultDiscount(input.paymentType);
  const discount = finalPrice * (discountPercentage / 100);
  const priceWithDiscount = finalPrice - discount;

  // Calculate hours (hours per m² × area)
  const baseHours = selectedRange.hoursPerM2 * input.projectArea;
  const estimatedHours = baseHours + surveyFee.hours + managementFee.hours;

  // Calculate hourly rate and efficiency
  const hourRate = priceWithDiscount / estimatedHours;
  const efficiency = getEfficiencyRating(hourRate);

  return {
    basePrice,
    pricePerM2,
    finishMultiplier: finishMult,
    finishLevel: input.finishLevel,
    extrasTotal: 0,
    extrasHours: 0,
    surveyFeeTotal: surveyFee.price,
    surveyFeeHours: surveyFee.hours,
    managementFeeTotal: managementFee.price,
    managementFeeHours: managementFee.hours,
    finalPrice,
    priceWithDiscount,
    discount,
    estimatedHours: Math.round(estimatedHours * 100) / 100,
    hourRate: Math.round(hourRate * 100) / 100,
    description: `${pricing.name} - ${input.projectArea}m²`,
    efficiency,
  };
}

/**
 * Utility: Estimate hours for a custom configuration
 */
export function estimateHours(params: {
  service: 'decorexpress' | 'produzexpress' | 'projetexpress';
  environmentCount?: number;
  complexity?: string;
  projectArea?: number;
  projectType?: 'novo' | 'reforma';
}): number {
  if (params.service === 'projetexpress') {
    if (!params.projectArea || !params.projectType) {
      throw new Error('projectArea and projectType required for projetexpress');
    }
    const pricing = projetExpressPricing[params.projectType];
    const range = pricing.ranges.find(
      (r) => params.projectArea! >= r.min && params.projectArea! < r.max
    ) ?? pricing.ranges[0];
    return range.hoursPerM2 * params.projectArea;
  }

  // DecorExpress or ProduzExpress
  if (!params.environmentCount || !params.complexity) {
    throw new Error('environmentCount and complexity required');
  }

  const envCount = String(params.environmentCount);

  if (params.service === 'decorexpress') {
    const tier = decorExpressPricing[envCount];
    const pricing = tier?.[params.complexity as keyof typeof tier];
    return typeof pricing === 'object' && 'hours' in pricing ? pricing.hours : 0;
  }

  if (params.service === 'produzexpress') {
    const tier = produzexpressPricing[envCount];
    const pricing = tier?.[params.complexity as keyof typeof tier];
    return typeof pricing === 'object' && 'hours' in pricing ? pricing.hours : 0;
  }

  return 0;
}

/**
 * Utility: Calculate price per m² from total price and area
 */
export function calculatePricePerM2(totalPrice: number, area: number): number {
  if (area <= 0) return 0;
  return Math.round((totalPrice / area) * 100) / 100;
}

/**
 * Utility: Format currency in BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Utility: Format efficiency rating with color indicator
 */
export function getEfficiencyColor(rating: EfficiencyRating): string {
  switch (rating) {
    case 'Ótimo':
      return 'green';
    case 'Bom':
      return 'yellow';
    case 'Reajustar':
      return 'red';
    default:
      return 'gray';
  }
}
