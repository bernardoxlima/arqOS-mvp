/**
 * AI Module - Zod Validation Schemas
 */

import { z } from 'zod';

// ============================================================================
// Briefing Schemas
// ============================================================================

export const briefingTypeSchema = z.enum(['memorial', 'moodboard', 'reference']);

export const briefingMemorialInputSchema = z.object({
  type: z.literal('memorial'),
  transcription: z.string().min(10, 'Transcrição deve ter no mínimo 10 caracteres'),
  clientName: z.string().optional(),
  projectCode: z.string().optional(),
  architectName: z.string().optional(),
});

export const briefingMoodboardInputSchema = z.object({
  type: z.literal('moodboard'),
  memorial: z.string().min(50, 'Memorial deve ter no mínimo 50 caracteres'),
});

export const briefingReferenceInputSchema = z.object({
  type: z.literal('reference'),
  memorial: z.string().min(50, 'Memorial deve ter no mínimo 50 caracteres'),
});

export const briefingInputSchema = z.discriminatedUnion('type', [
  briefingMemorialInputSchema,
  briefingMoodboardInputSchema,
  briefingReferenceInputSchema,
]);

// ============================================================================
// Brandbook Schemas
// ============================================================================

export const brandbookIdentitySchema = z.object({
  name: z.string().min(1, 'Nome do escritório é obrigatório'),
  foundingYear: z.number().int().min(1900).max(2100).optional(),
  location: z.string().optional(),
  teamSize: z.string().optional(),
});

export const brandbookDifferentialsSchema = z.object({
  mainDifferential: z.string().optional(),
  uniqueProcess: z.string().optional(),
  specialization: z.string().optional(),
});

export const brandbookAudienceSchema = z.object({
  idealClient: z.string().optional(),
  clientProfile: z.string().optional(),
  projectTypes: z.array(z.string()).optional(),
});

export const brandbookValuesSchema = z.object({
  coreValues: z.array(z.string()).optional(),
  beliefs: z.string().optional(),
  purpose: z.string().optional(),
});

export const brandbookCommunicationSchema = z.object({
  toneOfVoice: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  avoidWords: z.array(z.string()).optional(),
});

export const brandbookAnswersSchema = z.object({
  identity: brandbookIdentitySchema.optional(),
  differentials: brandbookDifferentialsSchema.optional(),
  audience: brandbookAudienceSchema.optional(),
  values: brandbookValuesSchema.optional(),
  communication: brandbookCommunicationSchema.optional(),
});

export const brandbookInputSchema = z.object({
  answers: brandbookAnswersSchema,
});

// ============================================================================
// Product Extraction Schemas
// ============================================================================

export const productExtractionInputSchema = z.object({
  url: z.string().url('URL inválida'),
  htmlContent: z.string().optional(),
});

export const extractedProductSchema = z.object({
  name: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
  supplier: z.string().optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().optional(),
  url: z.string().url(),
});

// ============================================================================
// Inferred Types
// ============================================================================

export type BriefingType = z.infer<typeof briefingTypeSchema>;
export type BriefingMemorialInputSchema = z.infer<typeof briefingMemorialInputSchema>;
export type BriefingMoodboardInputSchema = z.infer<typeof briefingMoodboardInputSchema>;
export type BriefingReferenceInputSchema = z.infer<typeof briefingReferenceInputSchema>;
export type BriefingInputSchema = z.infer<typeof briefingInputSchema>;
export type BrandbookAnswersSchema = z.infer<typeof brandbookAnswersSchema>;
export type BrandbookInputSchema = z.infer<typeof brandbookInputSchema>;
export type ProductExtractionInputSchema = z.infer<typeof productExtractionInputSchema>;
export type ExtractedProductSchema = z.infer<typeof extractedProductSchema>;
