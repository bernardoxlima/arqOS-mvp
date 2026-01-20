import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getPresentationById, getAllImages } from "@/modules/presentations";
import { generatePresentationPPT } from "@/modules/documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ClientDataJson {
  name?: string;
  clientName?: string;
  address?: string;
  project_type?: string;
  projectType?: string;
  ambiente?: string;
  phone?: string;
}

/**
 * POST /api/documents/presentations/[id]/ppt
 * Generate a presentation PowerPoint
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

    // Get all images
    const { data: imagesBySection, error: imgError } = await getAllImages(supabase, id);

    if (imgError) {
      return NextResponse.json(
        { error: imgError },
        { status: 400 }
      );
    }

    // Parse body options
    const body = await request.json().catch(() => ({}));

    // Transform images to expected format
    const images = Object.entries(imagesBySection || {}).map(([section, imgs]) => ({
      section: section as "photos_before" | "moodboard" | "references" | "floor_plan" | "renders",
      images: (imgs as Array<{ id: string; image_url: string; display_order: number; metadata?: Record<string, unknown> }>).map((img) => ({
        id: img.id,
        url: img.image_url,
        displayOrder: img.display_order,
        metadata: img.metadata,
      })),
    }));

    // Cast client_data to expected type
    const clientData = (presentation.client_data || {}) as ClientDataJson;

    // Generate PPT
    const result = await generatePresentationPPT({
      presentationId: id,
      clientData: {
        clientName: clientData.name || clientData.clientName || "Cliente",
        clientAddress: clientData.address,
        projectType: clientData.project_type || clientData.projectType,
        ambiente: clientData.ambiente,
        date: presentation.created_at || undefined,
      },
      images,
      includePhotosBefore: body.includePhotosBefore ?? true,
      includeMoodboard: body.includeMoodboard ?? true,
      includeReferences: body.includeReferences ?? true,
      includeFloorPlan: body.includeFloorPlan ?? true,
      includeRenders: body.includeRenders ?? true,
      logoUrl: body.logoUrl,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate presentation" },
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
    console.error("Error generating presentation PPT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
