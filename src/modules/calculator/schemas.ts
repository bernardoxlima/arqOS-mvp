/**
 * Calculator Module Validation Schemas
 */

import { z } from 'zod';

// Base enums
export const environmentTypeSchema = z.enum(['standard', 'medium', 'high']);
export const environmentSizeSchema = z.enum(['P', 'M', 'G']);
export const complexityLevelSchema = z.enum(['simples', 'padrao', 'complexo', 'muito_complexo']);
export const finishLevelSchema = z.enum(['economico', 'padrao', 'alto_padrao', 'luxo']);
export const decorComplexitySchema = z.enum(['decor1', 'decor2', 'decor3']);
export const produzexpressComplexitySchema = z.enum(['prod1', 'prod3']);
export const projectTypeSchema = z.enum(['novo', 'reforma']);
export const serviceTypeSchema = z.enum(['decorexpress', 'produzexpress', 'projetexpress']);
export const serviceModalitySchema = z.enum(['online', 'presencial']);
export const paymentTypeSchema = z.enum(['cash', 'installments', 'custom']);
export const efficiencyRatingSchema = z.enum(['Ótimo', 'Bom', 'Reajustar']);

// Environment config
export const environmentConfigSchema = z.object({
  type: environmentTypeSchema,
  size: environmentSizeSchema,
  complexity: z.union([decorComplexitySchema, produzexpressComplexitySchema]),
});

// DecorExpress input
export const decorExpressInputSchema = z.object({
  service: z.literal('decorexpress'),
  environmentCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  complexity: decorComplexitySchema,
  finishLevel: finishLevelSchema.optional(),
  environmentsConfig: z.array(environmentConfigSchema).min(1).max(3),
  extraEnvironments: z.number().int().min(0).optional(),
  extraEnvironmentPrice: z.number().min(0).optional(),
  serviceModality: serviceModalitySchema,
  paymentType: paymentTypeSchema,
  discountPercentage: z.number().min(0).max(100).optional(),
});

// ProduzExpress input
export const produzexpressInputSchema = z.object({
  service: z.literal('produzexpress'),
  environmentCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  complexity: produzexpressComplexitySchema,
  finishLevel: finishLevelSchema.optional(),
  environmentsConfig: z.array(environmentConfigSchema).min(1).max(3),
  extraEnvironments: z.number().int().min(0).optional(),
  extraEnvironmentPrice: z.number().min(0).optional(),
  serviceModality: serviceModalitySchema,
  paymentType: paymentTypeSchema,
  discountPercentage: z.number().min(0).max(100).optional(),
});

// ProjetExpress input
export const projetExpressInputSchema = z.object({
  service: z.literal('projetexpress'),
  projectType: projectTypeSchema,
  projectArea: z.number().min(20).max(300),
  finishLevel: finishLevelSchema.optional(),
  serviceModality: serviceModalitySchema,
  paymentType: paymentTypeSchema,
  discountPercentage: z.number().min(0).max(100).optional(),
  includeManagement: z.boolean().optional(),
  managementFee: z.number().min(0).optional(),
});

// Combined calculator input
export const calculatorInputSchema = z.discriminatedUnion('service', [
  decorExpressInputSchema,
  produzexpressInputSchema,
  projetExpressInputSchema,
]);

// Environment detail (output)
export const environmentDetailSchema = z.object({
  index: z.number().int().min(0),
  type: environmentTypeSchema,
  size: environmentSizeSchema,
  typeMultiplier: z.number().positive(),
  sizeMultiplier: z.number().positive(),
  combinedMultiplier: z.number().positive(),
});

// Calculation result (output)
export const calculationResultSchema = z.object({
  basePrice: z.number().min(0),
  avgMultiplier: z.number().positive().optional(),
  environmentsDetails: z.array(environmentDetailSchema).optional(),
  priceBeforeExtras: z.number().min(0).optional(),
  extrasTotal: z.number().min(0),
  extrasHours: z.number().min(0),
  surveyFeeTotal: z.number().min(0),
  surveyFeeHours: z.number().min(0),
  managementFeeTotal: z.number().min(0).optional(),
  managementFeeHours: z.number().min(0).optional(),
  finalPrice: z.number().min(0),
  priceWithDiscount: z.number().min(0),
  discount: z.number().min(0),
  estimatedHours: z.number().min(0),
  hourRate: z.number().min(0),
  description: z.string().optional(),
  efficiency: efficiencyRatingSchema,
  pricePerM2: z.number().min(0).optional(),
});

// API request/response schemas
export const calculateBudgetRequestSchema = calculatorInputSchema;

export const calculateBudgetResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    input: calculatorInputSchema,
    result: calculationResultSchema,
    timestamp: z.string().datetime(),
  }).optional(),
  error: z.string().optional(),
});

// Types inferred from schemas
export type EnvironmentConfigInput = z.infer<typeof environmentConfigSchema>;
export type DecorExpressInputSchema = z.infer<typeof decorExpressInputSchema>;
export type ProduzExpressInputSchema = z.infer<typeof produzexpressInputSchema>;
export type ProjetExpressInputSchema = z.infer<typeof projetExpressInputSchema>;
export type CalculatorInputSchema = z.infer<typeof calculatorInputSchema>;
export type CalculationResultSchema = z.infer<typeof calculationResultSchema>;
