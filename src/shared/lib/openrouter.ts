/**
 * OpenRouter AI Client
 *
 * Provides a unified interface to access multiple AI models via OpenRouter API.
 * Based on OpenAI SDK compatibility layer.
 */

import OpenAI from 'openai';

// OpenRouter client instance
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'ArqOS - Sistema de Arquitetura',
  },
});

// Available models for different use cases
export const AI_MODELS = {
  // Primary model for text generation (briefing, brandbook)
  TEXT_GENERATION: 'anthropic/claude-3.5-sonnet',
  // Model for image prompts (moodboard, reference)
  IMAGE_PROMPTS: 'openai/gpt-4o',
  // Model for fast tasks (extraction, simple queries)
  FAST: 'google/gemini-2.0-flash-exp',
  // Fallback model
  FALLBACK: 'google/gemini-2.0-flash-exp',
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

// Error types for AI operations
export class AIError extends Error {
  constructor(
    message: string,
    public code: 'RATE_LIMIT' | 'INSUFFICIENT_CREDITS' | 'INVALID_REQUEST' | 'API_ERROR' | 'UNKNOWN',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// Response type from OpenRouter
export interface AICompletionResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate a chat completion using OpenRouter
 */
export async function generateCompletion(params: {
  model?: AIModel;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<AICompletionResponse> {
  const {
    model = AI_MODELS.TEXT_GENERATION,
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 4096,
  } = params;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new AIError(
      'OPENROUTER_API_KEY is not configured',
      'INVALID_REQUEST',
      500
    );
  }

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    const response = await openrouter.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices?.[0]?.message?.content || '';

    return {
      content,
      model: response.model || model,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    // Handle OpenAI SDK errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        throw new AIError(
          'Limite de requisições excedido. Tente novamente em alguns minutos.',
          'RATE_LIMIT',
          429
        );
      }
      if (error.status === 402) {
        throw new AIError(
          'Créditos insuficientes. Por favor, adicione créditos à sua conta.',
          'INSUFFICIENT_CREDITS',
          402
        );
      }
      if (error.status === 400) {
        throw new AIError(
          `Requisição inválida: ${error.message}`,
          'INVALID_REQUEST',
          400
        );
      }
      throw new AIError(
        `Erro na API de IA: ${error.message}`,
        'API_ERROR',
        error.status || 500
      );
    }

    // Handle other errors
    if (error instanceof Error) {
      throw new AIError(error.message, 'UNKNOWN', 500);
    }

    throw new AIError('Erro desconhecido ao processar requisição de IA', 'UNKNOWN', 500);
  }
}

/**
 * Check if OpenRouter API key is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
