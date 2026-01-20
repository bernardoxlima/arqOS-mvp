/**
 * POST /api/ai/extract-product
 *
 * Extract product information from URL using AI.
 *
 * Request body:
 * - url: string (required) - Product page URL
 * - htmlContent: string (optional) - Pre-fetched HTML content
 *
 * If htmlContent is not provided, the server will fetch the page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  extractProduct,
  fetchProductPage,
  productExtractionInputSchema,
  type ProductExtractionApiResponse,
} from '@/modules/ai';
import { AIError } from '@/shared/lib/openrouter';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProductExtractionApiResponse>> {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = productExtractionInputSchema.parse(body);

    // Fetch HTML if not provided
    let htmlContent = validatedInput.htmlContent;
    if (!htmlContent) {
      try {
        htmlContent = await fetchProductPage(validatedInput.url);
      } catch (fetchError) {
        // Continue without HTML content - AI will try to infer from URL
        console.warn('Could not fetch product page:', fetchError);
      }
    }

    // Extract product information
    const result = await extractProduct({
      url: validatedInput.url,
      htmlContent,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro de validação: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Handle AI errors
    if (error instanceof AIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.statusCode }
      );
    }

    // Handle other errors
    console.error('Product extraction AI error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
