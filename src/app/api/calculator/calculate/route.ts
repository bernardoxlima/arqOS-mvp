/**
 * POST /api/calculator/calculate
 * Calculate budget based on service type and input parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  calculateBudget,
  calculatorInputSchema,
  type CalculateBudgetResponse,
} from '@/modules/calculator';

export async function POST(request: NextRequest): Promise<NextResponse<CalculateBudgetResponse>> {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = calculatorInputSchema.parse(body);

    // Calculate budget
    const result = calculateBudget(validatedInput);

    return NextResponse.json({
      success: true,
      data: {
        input: validatedInput,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Handle calculation errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
