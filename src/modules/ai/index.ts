/**
 * AI Module - Public Exports
 *
 * Provides AI-powered features for:
 * - Briefing generation (memorial, moodboard prompts, reference prompts)
 * - Brandbook generation
 * - Product extraction from URLs
 *
 * NOTE: For client-side components and hooks, import from '@/modules/ai/components'
 * and '@/modules/ai/hooks' directly.
 */

// Types
export type {
  BriefingGenerationType,
  BriefingInput,
  BriefingMemorialInput,
  BriefingMoodboardInput,
  BriefingReferenceInput,
  BriefingResult,
  BriefingMemorialResult,
  BriefingPromptResult,
  BrandbookAnswers,
  BrandbookIdentity,
  BrandbookDifferentials,
  BrandbookAudience,
  BrandbookValues,
  BrandbookCommunication,
  BrandbookInput,
  BrandbookResult,
  ProductExtractionInput,
  ExtractedProduct,
  ProductExtractionResult,
  AIApiResponse,
  BriefingApiResponse,
  BrandbookApiResponse,
  ProductExtractionApiResponse,
} from './types';

// Schemas
export {
  briefingTypeSchema,
  briefingMemorialInputSchema,
  briefingMoodboardInputSchema,
  briefingReferenceInputSchema,
  briefingInputSchema,
  brandbookIdentitySchema,
  brandbookDifferentialsSchema,
  brandbookAudienceSchema,
  brandbookValuesSchema,
  brandbookCommunicationSchema,
  brandbookAnswersSchema,
  brandbookInputSchema,
  productExtractionInputSchema,
  extractedProductSchema,
} from './schemas';

// Services
export {
  generateBriefing,
  generateBrandbook,
  extractProduct,
  fetchProductPage,
} from './services';

// Prompts (for testing/debugging)
export {
  getMemorialSystemPrompt,
  MOODBOARD_SYSTEM_PROMPT,
  REFERENCE_SYSTEM_PROMPT,
  getBrandbookPrompt,
  PRODUCT_EXTRACTION_SYSTEM_PROMPT,
  getProductExtractionUserPrompt,
} from './prompts';

// Constants (can be used on server-side too)
export {
  BRAND_QUESTIONS,
  BLOCK_ORDER,
  DEFAULT_BRAND_ARCHITECTURE,
  getBlockIndex,
  getBlockKey,
  isBlockCompleted,
  calculateCompletionPercentage,
} from './constants';

export type {
  QuestionType,
  BrandQuestion,
  BrandBlock,
  BrandIdentity as BrandIdentityData,
  BrandEssence,
  BrandAudience as BrandAudienceData,
  BrandMethod,
  BrandTransformation,
  BrandVision,
  BrandSynthesis,
  BrandArchitecture,
  BlockKey,
} from './constants';

// NOTE: Hooks and Components are NOT exported from this file to avoid
// bundling client-side code in server components. Import them directly:
// - Hooks: import { useBriefing, useBrandbook, useProductExtraction } from '@/modules/ai/hooks';
// - Components: import { BriefingAIModal, BrandbookWizard, ProductLinkInput } from '@/modules/ai/components';
