/**
 * Product Extraction AI Service
 *
 * Handles AI-powered extraction of product information from URLs/HTML.
 */

import {
  generateCompletion,
  AI_MODELS,
  AIError,
} from '@/shared/lib/openrouter';
import {
  PRODUCT_EXTRACTION_SYSTEM_PROMPT,
  getProductExtractionUserPrompt,
} from '../prompts';
import type {
  ProductExtractionInput,
  ProductExtractionResult,
  ExtractedProduct,
} from '../types';

/**
 * Extract product information from URL or HTML content
 */
export async function extractProduct(
  input: ProductExtractionInput
): Promise<ProductExtractionResult> {
  const userPrompt = getProductExtractionUserPrompt({
    url: input.url,
    htmlContent: input.htmlContent,
  });

  const response = await generateCompletion({
    model: AI_MODELS.FAST,
    systemPrompt: PRODUCT_EXTRACTION_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
    maxTokens: 1024,
  });

  try {
    // Parse the JSON response
    const content = response.content.trim();

    // Try to extract JSON from the response
    let jsonContent = content;

    // Handle markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonContent);

    // Check for extraction error
    if (parsed.error) {
      return {
        success: false,
        error: parsed.error,
      };
    }

    // Validate required field
    if (!parsed.name) {
      return {
        success: false,
        error: 'Nome do produto não encontrado',
      };
    }

    // Build the product object
    const product: ExtractedProduct = {
      name: parsed.name,
      url: input.url,
    };

    // Add optional fields if present
    if (typeof parsed.price === 'number') product.price = parsed.price;
    if (parsed.currency) product.currency = parsed.currency;
    if (parsed.supplier) product.supplier = parsed.supplier;
    if (parsed.imageUrl) product.imageUrl = parsed.imageUrl;
    if (parsed.description) product.description = parsed.description;
    if (parsed.category) product.category = parsed.category;
    if (parsed.dimensions) product.dimensions = parsed.dimensions;
    if (parsed.material) product.material = parsed.material;
    if (parsed.color) product.color = parsed.color;
    if (parsed.sku) product.sku = parsed.sku;

    return {
      success: true,
      product,
    };
  } catch {
    // JSON parsing failed
    return {
      success: false,
      error: 'Não foi possível processar a resposta da IA',
    };
  }
}

/**
 * Fetch HTML content from URL (server-side only)
 * Note: This should be called from API routes, not client-side
 */
export async function fetchProductPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new AIError(
        `Não foi possível acessar a URL: ${response.status}`,
        'INVALID_REQUEST',
        400
      );
    }

    const html = await response.text();
    return html;
  } catch (error) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      'Erro ao acessar a URL do produto',
      'INVALID_REQUEST',
      400
    );
  }
}
