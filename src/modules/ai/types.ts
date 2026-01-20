/**
 * AI Module - TypeScript Types
 */

// ============================================================================
// Briefing Types
// ============================================================================

export type BriefingGenerationType = 'memorial' | 'moodboard' | 'reference';

export interface BriefingMemorialInput {
  type: 'memorial';
  transcription: string;
  clientName?: string;
  projectCode?: string;
  architectName?: string;
}

export interface BriefingMoodboardInput {
  type: 'moodboard';
  memorial: string;
}

export interface BriefingReferenceInput {
  type: 'reference';
  memorial: string;
}

export type BriefingInput =
  | BriefingMemorialInput
  | BriefingMoodboardInput
  | BriefingReferenceInput;

export interface BriefingMemorialResult {
  type: 'memorial';
  memorial: string;
}

export interface BriefingPromptResult {
  type: 'moodboard' | 'reference';
  prompt: string;
}

export type BriefingResult = BriefingMemorialResult | BriefingPromptResult;

// ============================================================================
// Brandbook Types
// ============================================================================

export interface BrandbookIdentity {
  name: string;
  foundingYear?: number;
  location?: string;
  teamSize?: string;
}

export interface BrandbookDifferentials {
  mainDifferential?: string;
  uniqueProcess?: string;
  specialization?: string;
}

export interface BrandbookAudience {
  idealClient?: string;
  clientProfile?: string;
  projectTypes?: string[];
}

export interface BrandbookValues {
  coreValues?: string[];
  beliefs?: string;
  purpose?: string;
}

export interface BrandbookCommunication {
  toneOfVoice?: string;
  keywords?: string[];
  avoidWords?: string[];
}

export interface BrandbookAnswers {
  identity?: BrandbookIdentity;
  differentials?: BrandbookDifferentials;
  audience?: BrandbookAudience;
  values?: BrandbookValues;
  communication?: BrandbookCommunication;
}

export interface BrandbookInput {
  answers: BrandbookAnswers;
}

export interface BrandbookResult {
  brandbook: string;
}

// ============================================================================
// Product Extraction Types
// ============================================================================

export interface ProductExtractionInput {
  url: string;
  htmlContent?: string;
}

export interface ExtractedProduct {
  name: string;
  price?: number;
  currency?: string;
  supplier?: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  dimensions?: string;
  material?: string;
  color?: string;
  sku?: string;
  url: string;
}

export interface ProductExtractionResult {
  success: boolean;
  product?: ExtractedProduct;
  error?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AIApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type BriefingApiResponse = AIApiResponse<BriefingResult>;
export type BrandbookApiResponse = AIApiResponse<BrandbookResult>;
export type ProductExtractionApiResponse = AIApiResponse<ProductExtractionResult>;
