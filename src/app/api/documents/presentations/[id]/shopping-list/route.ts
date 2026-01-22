import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getPresentationById, getItems } from "@/modules/presentations";
import { CATEGORY_COLORS } from "@/modules/documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ClientDataJson {
  name?: string;
  clientName?: string;
}

interface ProductJson {
  quantidade?: number;
  unidade?: string;
  valorProduto?: number;
  fornecedor?: string;
  link?: string;
  imagem?: string;
}

/**
 * POST /api/documents/presentations/[id]/shopping-list
 * Generate a shopping list PowerPoint
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

    // Get presentation data
    const { data: presentation, error: presError } = await getPresentationById(supabase, id);

    if (presError || !presentation) {
      return NextResponse.json(
        { error: presError || "Presentation not found" },
        { status: 404 }
      );
    }

    // Get all items
    const { data: items, error: itemsError } = await getItems(supabase, id, {});

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError },
        { status: 400 }
      );
    }

    // Parse body options
    const body = await request.json().catch(() => ({}));

    // Cast client_data
    const clientData = (presentation.client_data || {}) as ClientDataJson;

    // Transform items to expected format
    const shoppingItems = (items || []).map((item) => {
      const product = (item.product || {}) as ProductJson;
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        categoryColor: CATEGORY_COLORS[item.category] || "6B7280",
        ambiente: item.ambiente || undefined,
        number: item.number || 0,
        quantity: product.quantidade,
        unit: product.unidade,
        price: product.valorProduto,
        supplier: product.fornecedor,
        link: product.link,
        imageUrl: product.imagem,
      };
    });

    // Dynamic import for performance (lazy load heavy library)
    const { generateShoppingListPPT } = await import("@/modules/documents");

    // Generate PPT
    const result = await generateShoppingListPPT({
      presentationId: id,
      clientName: clientData.name || clientData.clientName || "Cliente",
      items: shoppingItems,
      groupByCategory: body.groupByCategory ?? true,
      groupByAmbiente: body.groupByAmbiente ?? false,
      includeImages: body.includeImages ?? true,
      includePrices: body.includePrices ?? false,
      logoUrl: body.logoUrl,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate shopping list" },
        { status: 500 }
      );
    }

    // Return the file
    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": result.mimeType || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating shopping list PPT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
