/**
 * GET /api/calculator/config
 * Get current pricing configuration
 */

import { NextResponse } from 'next/server';
import {
  defaultPricingConfig,
  type PricingConfigResponse,
} from '@/modules/calculator';

export async function GET(): Promise<NextResponse<PricingConfigResponse>> {
  try {
    return NextResponse.json({
      success: true,
      data: defaultPricingConfig,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
