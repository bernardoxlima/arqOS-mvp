/**
 * Briefing AI Service
 *
 * Handles AI generation for briefing-related tasks:
 * - Memorial generation from transcription
 * - Moodboard prompt generation
 * - Reference visual prompt generation
 */

import {
  generateCompletion,
  AI_MODELS,
  AIError,
} from '@/shared/lib/openrouter';
import {
  getMemorialSystemPrompt,
  MOODBOARD_SYSTEM_PROMPT,
  REFERENCE_SYSTEM_PROMPT,
} from '../prompts';
import type {
  BriefingInput,
  BriefingResult,
  BriefingMemorialInput,
  BriefingMoodboardInput,
  BriefingReferenceInput,
} from '../types';

/**
 * Generate memorial from transcription
 */
async function generateMemorial(
  input: BriefingMemorialInput
): Promise<BriefingResult> {
  const systemPrompt = getMemorialSystemPrompt({
    clientName: input.clientName,
    projectCode: input.projectCode,
    architectName: input.architectName,
  });

  const response = await generateCompletion({
    model: AI_MODELS.TEXT_GENERATION,
    systemPrompt,
    userPrompt: `Transcrição do briefing/reunião:\n\n${input.transcription}`,
    temperature: 0.7,
    maxTokens: 4096,
  });

  return {
    type: 'memorial',
    memorial: response.content,
  };
}

/**
 * Generate moodboard prompt from memorial
 */
async function generateMoodboardPrompt(
  input: BriefingMoodboardInput
): Promise<BriefingResult> {
  const response = await generateCompletion({
    model: AI_MODELS.IMAGE_PROMPTS,
    systemPrompt: MOODBOARD_SYSTEM_PROMPT,
    userPrompt: `Memorial de Briefing:\n\n${input.memorial}`,
    temperature: 0.8,
    maxTokens: 1024,
  });

  return {
    type: 'moodboard',
    prompt: response.content,
  };
}

/**
 * Generate reference visual prompt from memorial
 */
async function generateReferencePrompt(
  input: BriefingReferenceInput
): Promise<BriefingResult> {
  const response = await generateCompletion({
    model: AI_MODELS.IMAGE_PROMPTS,
    systemPrompt: REFERENCE_SYSTEM_PROMPT,
    userPrompt: `Memorial de Briefing:\n\n${input.memorial}`,
    temperature: 0.8,
    maxTokens: 1024,
  });

  return {
    type: 'reference',
    prompt: response.content,
  };
}

/**
 * Main briefing service function
 * Routes to appropriate generator based on input type
 */
export async function generateBriefing(
  input: BriefingInput
): Promise<BriefingResult> {
  switch (input.type) {
    case 'memorial':
      return generateMemorial(input);
    case 'moodboard':
      return generateMoodboardPrompt(input);
    case 'reference':
      return generateReferencePrompt(input);
    default:
      throw new AIError(
        `Tipo de briefing inválido: ${(input as BriefingInput).type}`,
        'INVALID_REQUEST',
        400
      );
  }
}
