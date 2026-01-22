import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createPresentation, listPresentations } from "@/modules/presentations/services/presentations.service";
import { z } from "zod";

const createPresentationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  projectId: z.string().uuid().optional(),
  phase: z.enum(["apresentacao", "revisao", "manual", "entrega"]).optional(),
  clientData: z.object({
    clientName: z.string(),
    projectCode: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    cepBairro: z.string().optional(),
    cpf: z.string().optional(),
    architect: z.string().optional(),
    startDate: z.string().optional(),
  }).optional(),
  settings: z.object({
    showPrices: z.boolean().optional(),
    showSuppliers: z.boolean().optional(),
    exportFormat: z.enum(["pptx", "pdf"]).optional(),
    theme: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/presentations
 * Create a new presentation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = createPresentationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user's profile
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

    // Create presentation
    const { data, error } = await createPresentation(
      supabase,
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
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/presentations
 * List presentations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      projectId: searchParams.get("projectId") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };

    // List presentations
    const { data, error } = await listPresentations(supabase, filters);

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
    console.error("Error listing presentations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
