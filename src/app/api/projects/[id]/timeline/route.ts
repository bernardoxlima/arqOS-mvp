import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getProjectTimeline } from "@/modules/projects/services/kanban";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/[id]/timeline
 * Returns the project timeline with stage changes and time entries
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get project timeline
    const { data, error } = await getProjectTimeline(supabase, id);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error getting project timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
