import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  addItem,
  addBulkItems,
  getItems,
  getItemsByCategory,
} from "@/modules/presentations/services/items.service";
import type { ItemCategory, ItemType } from "@/modules/presentations/types";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const categoryEnum = z.enum([
  "mobiliario", "marcenaria", "marmoraria", "iluminacao", "decoracao",
  "cortinas", "materiais", "eletrica", "hidraulica", "maoDeObra",
  "acabamentos", "outros"
]);

const itemTypeEnum = z.enum(["layout", "complementary"]);

const addItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: categoryEnum,
  itemType: itemTypeEnum,
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
});

const addBulkItemsSchema = z.object({
  items: z.array(addItemSchema).min(1, "At least one item is required"),
});

/**
 * POST /api/presentations/[id]/items
 * Add an item or bulk items to a presentation
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Parse body
    const body = await request.json();

    // Check if bulk insert
    if (body.items && Array.isArray(body.items)) {
      const result = addBulkItemsSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error.issues[0].message },
          { status: 400 }
        );
      }

      // Bulk add items
      const { data, error } = await addBulkItems(supabase, id, result.data.items);

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
    }

    // Single item insert
    const result = addItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Add item
    const { data, error } = await addItem(supabase, id, result.data);

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
    console.error("Error adding item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/presentations/[id]/items
 * Get all items for a presentation with optional filters
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType") as ItemType | null;
    const category = searchParams.get("category") as ItemCategory | null;
    const ambiente = searchParams.get("ambiente");
    const groupBy = searchParams.get("groupBy");

    // If groupBy=category, return grouped data
    if (groupBy === "category") {
      const { data, error } = await getItemsByCategory(supabase, id);

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
    }

    // Build filters
    const filters: {
      itemType?: ItemType;
      category?: ItemCategory;
      ambiente?: string;
    } = {};

    if (itemType) filters.itemType = itemType;
    if (category) filters.category = category;
    if (ambiente) filters.ambiente = ambiente;

    // Get items
    const { data, error } = await getItems(supabase, id, filters);

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
    console.error("Error getting items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
