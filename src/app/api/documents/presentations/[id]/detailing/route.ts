import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getPresentationById, getItems } from "@/modules/presentations";
import { CATEGORY_COLORS } from "@/modules/documents";
import type { TechnicalItem } from "@/modules/documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ClientDataJson {
  name?: string;
  clientName?: string;
  project_type?: string;
  projectType?: string;
}

interface ProductJson {
  imagem?: string;
}

/**
 * POST /api/documents/presentations/[id]/detailing
 * Generate a technical detailing PowerPoint
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

    // Get all items (layout items typically have technical details)
    const { data: items, error: itemsError } = await getItems(supabase, id, {
      itemType: "layout",
    });

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

    // Transform items to technical format
    const technicalItems: TechnicalItem[] = (items || []).map((item) => {
      const product = (item.product || {}) as ProductJson;
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        categoryColor: CATEGORY_COLORS[item.category] || "6B7280",
        ambiente: item.ambiente || "Geral",
        number: item.number || 0,
        dimensions: undefined,
        material: undefined,
        finish: undefined,
        observations: undefined,
        imageUrl: product.imagem,
      };
    });

    // Dynamic import for performance (lazy load heavy library)
    const { generateTechnicalDetailingPPT } = await import("@/modules/documents");

    // Generate PPT
    const result = await generateTechnicalDetailingPPT({
      presentationId: id,
      clientName: clientData.name || clientData.clientName || "Cliente",
      projectName: clientData.project_type || clientData.projectType,
      items: technicalItems,
      groupByAmbiente: body.groupByAmbiente ?? true,
      includeDrawings: body.includeDrawings ?? true,
      logoUrl: body.logoUrl,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate detailing" },
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
    console.error("Error generating technical detailing PPT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
