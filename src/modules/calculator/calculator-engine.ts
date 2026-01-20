/**
 * Calculator Engine - Core calculation logic
 * Based on legacy/remix-of-budget-buddy PricingCalculator
 */

import type {
  CalculatorInput,
  CalculationResult,
  DecorExpressInput,
  ProducaoInput,
  ProjetExpressInput,
  EnvironmentDetail,
  EnvironmentType,
  EnvironmentSize,
  EfficiencyRating,
} from './types';

import {
  SURVEY_FEE,
  EXTRA_ENVIRONMENT,
  DEFAULT_MANAGEMENT_FEE,
  environmentTypeMultipliers,
  sizeMultipliers,
  decorExpressPricing,
  producaoPricing,
  projetExpressPricing,
  getEfficiencyRating,
  getDefaultDiscount,
} from './pricing-data';

/**
 * Main calculator function - routes to appropriate service calculator
 */
export function calculateBudget(input: CalculatorInput): CalculationResult {
  switch (input.service) {
    case 'decorexpress':
      return calculateDecorExpress(input);
    case 'producao':
      return calculateProducao(input);
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

  // Calculate base price with multiplier
  const basePrice = basePricing.price;
  const priceWithMultiplier = basePrice * avgMultiplier;

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
 * Calculate Producao budget
 */
function calculateProducao(input: ProducaoInput): CalculationResult {
  const envCount = String(input.environmentCount);
  const pricingTier = producaoPricing[envCount];

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

  // Calculate base price with multiplier
  const basePrice = basePricing.price;
  const priceWithMultiplier = basePrice * avgMultiplier;

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

  // Calculate base price (price per m² × area)
  const basePrice = selectedRange.pricePerM2 * input.projectArea;
  const pricePerM2 = selectedRange.pricePerM2;

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
  service: 'decorexpress' | 'producao' | 'projetexpress';
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

  // DecorExpress or Producao
  if (!params.environmentCount || !params.complexity) {
    throw new Error('environmentCount and complexity required');
  }

  const envCount = String(params.environmentCount);

  if (params.service === 'decorexpress') {
    const tier = decorExpressPricing[envCount];
    const pricing = tier?.[params.complexity as keyof typeof tier];
    return typeof pricing === 'object' && 'hours' in pricing ? pricing.hours : 0;
  }

  if (params.service === 'producao') {
    const tier = producaoPricing[envCount];
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
