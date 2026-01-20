/**
 * Brandbook AI Service
 *
 * Handles AI generation for brandbook creation from questionnaire answers.
 */

import {
  generateCompletion,
  AI_MODELS,
} from '@/shared/lib/openrouter';
import { getBrandbookPrompt } from '../prompts';
import type { BrandbookInput, BrandbookResult } from '../types';

/**
 * Generate complete brandbook from questionnaire answers
 */
export async function generateBrandbook(
  input: BrandbookInput
): Promise<BrandbookResult> {
  const prompt = getBrandbookPrompt(input.answers);

  const response = await generateCompletion({
    model: AI_MODELS.TEXT_GENERATION,
    userPrompt: prompt,
    temperature: 0.7,
    maxTokens: 6000,
  });

  return {
    brandbook: response.content,
  };
}
