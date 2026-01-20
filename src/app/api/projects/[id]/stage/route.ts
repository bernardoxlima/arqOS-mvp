import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { moveProjectToStage } from "@/modules/projects/services/kanban";
import { z } from "zod";

const moveStageSchema = z.object({
  stage: z.string().min(1, "Stage is required"),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Parse and validate request body
    const body = await request.json();
    const result = moveStageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // 2. Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Move project to new stage
    const { data, error } = await moveProjectToStage(
      supabase,
      id,
      result.data.stage
    );

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
    console.error("Error moving project stage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
