/**
 * POST /api/ai/briefing
 *
 * Generate briefing-related content:
 * - type: 'memorial' - Generate structured briefing from transcription
 * - type: 'moodboard' - Generate moodboard image prompt from memorial
 * - type: 'reference' - Generate reference visual prompt from memorial
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  generateBriefing,
  briefingInputSchema,
  type BriefingApiResponse,
} from '@/modules/ai';
import { AIError } from '@/shared/lib/openrouter';

export async function POST(
  request: NextRequest
): Promise<NextResponse<BriefingApiResponse>> {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = briefingInputSchema.parse(body);

    // Generate content
    const result = await generateBriefing(validatedInput);

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
    console.error('Briefing AI error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
