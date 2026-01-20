/**
 * POST /api/ai/brandbook
 *
 * Generate complete brandbook from questionnaire answers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  generateBrandbook,
  brandbookInputSchema,
  type BrandbookApiResponse,
} from '@/modules/ai';
import { AIError } from '@/shared/lib/openrouter';

export async function POST(
  request: NextRequest
): Promise<NextResponse<BrandbookApiResponse>> {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = brandbookInputSchema.parse(body);

    // Generate brandbook
    const result = await generateBrandbook(validatedInput);

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
    console.error('Brandbook AI error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
