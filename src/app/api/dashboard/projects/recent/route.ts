import { NextRequest, NextResponse } from "next/server";
import { getRecentProjects } from "@/modules/dashboard/services/dashboard.service";
import { recentProjectsParamsSchema } from "@/modules/dashboard/schemas";

/**
 * GET /api/dashboard/projects/recent
 * Get recent projects for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams);

    // Validate params
    const parsed = recentProjectsParamsSchema.safeParse(rawParams);

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

    const result = await getRecentProjects(parsed.data.limit);

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
    console.error("Error fetching recent projects:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
