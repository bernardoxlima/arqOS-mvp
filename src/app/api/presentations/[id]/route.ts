import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  getPresentationById,
  updatePresentation,
  deletePresentation,
} from "@/modules/presentations/services/presentations.service";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updatePresentationSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["draft", "in_progress", "review", "approved", "archived"]).optional(),
  phase: z.enum(["Entrega Final", "Proposta Inicial", "Revisão 1", "Revisão 2", "Revisão 3"]).optional(),
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
 * GET /api/presentations/[id]
 * Get a presentation by ID with all relations
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get presentation
    const { data, error } = await getPresentationById(supabase, id);

    if (error) {
      const status = error.includes("not found") ? 404 : 400;
      return NextResponse.json(
        { error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error getting presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/presentations/[id]
 * Update a presentation
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const result = updatePresentationSchema.safeParse(body);

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

    // Update presentation
    const { data, error } = await updatePresentation(supabase, id, result.data);

    if (error) {
      const status = error.includes("not found") ? 404 : 400;
      return NextResponse.json(
        { error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presentations/[id]
 * Delete a presentation
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete presentation
    const { error } = await deletePresentation(supabase, id);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
