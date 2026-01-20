import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { addTimeEntry } from "@/modules/projects/services/kanban";
import { z } from "zod";

const timeEntrySchema = z.object({
  stage: z.string().min(1, "Stage is required"),
  hours: z.number().positive("Hours must be positive").max(24, "Hours cannot exceed 24"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Parse and validate request body
    const body = await request.json();
    const result = timeEntrySchema.safeParse(body);

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

    // 3. Get current user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // 4. Add time entry
    const { data, error } = await addTimeEntry(
      supabase,
      id,
      result.data,
      profile.id
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
    console.error("Error adding time entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
