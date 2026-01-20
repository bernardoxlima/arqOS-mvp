import { NextResponse } from "next/server";
import { getDashboardStats } from "@/modules/dashboard/services/dashboard.service";

/**
 * GET /api/dashboard/stats
 * Get combined dashboard statistics
 */
export async function GET() {
  try {
    const result = await getDashboardStats();

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
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
