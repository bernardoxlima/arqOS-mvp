import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { addCustomStage, getProjectStages } from "@/modules/projects/services/kanban";
import { z } from "zod";

const stageColorSchema = z.enum([
  "purple", "blue", "cyan", "green", "yellow",
  "orange", "pink", "gray", "emerald"
]);

const addStageSchema = z.object({
  stage: z.object({
    id: z.string().min(1, "Stage ID is required"),
    name: z.string().min(1, "Stage name is required"),
    color: stageColorSchema,
    description: z.string().optional(),
  }),
  position: z.number().int().nonnegative().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/projects/[id]/stages
 * Returns the workflow stages for a project
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

    // 2. Get project stages
    const { data, error } = await getProjectStages(supabase, id);

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
    console.error("Error getting project stages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/stages
 * Adds a custom stage to the project workflow
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Parse and validate request body
    const body = await request.json();
    const result = addStageSchema.safeParse(body);

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

    // 3. Add custom stage
    const { data, error } = await addCustomStage(
      supabase,
      id,
      result.data.stage,
      result.data.position
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
    console.error("Error adding custom stage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
