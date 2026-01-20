/**
 * AI Module - Public Exports
 *
 * Provides AI-powered features for:
 * - Briefing generation (memorial, moodboard prompts, reference prompts)
 * - Brandbook generation
 * - Product extraction from URLs
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
