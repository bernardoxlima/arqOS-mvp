import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  updateItem,
  deleteItem,
  updateItemPosition,
} from "@/modules/presentations/services/items.service";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string; itemId: string }>;
};

const categoryEnum = z.enum([
  "mobiliario", "marcenaria", "marmoraria", "iluminacao", "decoracao",
  "cortinas", "materiais", "eletrica", "hidraulica", "maoDeObra",
  "acabamentos", "outros"
]);

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: categoryEnum.optional(),
  ambiente: z.string().optional(),
  number: z.number().int().positive().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  product: z.object({
    quantidade: z.number().optional(),
    unidade: z.string().optional(),
    valorProduto: z.number().optional(),
    fornecedor: z.string().optional(),
    link: z.string().optional(),
    imagem: z.string().optional(),
  }).optional(),
  status: z.string().optional(),
});

/**
 * PATCH /api/presentations/[id]/items/[itemId]
 * Update an item
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const result = updateItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Update item
    const { data, error } = await updateItem(supabase, itemId, result.data);

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
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presentations/[id]/items/[itemId]
 * Delete an item
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete item
    const { error } = await deleteItem(supabase, itemId);

    if (error) {
      const status = error.includes("not found") ? 404 : 400;
      return NextResponse.json(
        { error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/presentations/[id]/items/[itemId]
 * Update item position on floor plan
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { itemId } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();
    const { x, y } = body;

    if (typeof x !== "number" || typeof y !== "number") {
      return NextResponse.json(
        { error: "Position x and y must be numbers" },
        { status: 400 }
      );
    }

    // Update position
    const { data, error } = await updateItemPosition(supabase, itemId, { x, y });

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
    console.error("Error updating item position:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
