import { NextRequest, NextResponse } from "next/server";
import { getFinanceSummary } from "@/modules/dashboard/services/dashboard.service";
import { financeSummaryParamsSchema } from "@/modules/dashboard/schemas";

/**
 * GET /api/dashboard/finance/summary
 * Get finance summary for a period (defaults to current month)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams);

    // Validate params
    const parsed = financeSummaryParamsSchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parâmetros inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await getFinanceSummary(parsed.data.startDate, parsed.data.endDate);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
