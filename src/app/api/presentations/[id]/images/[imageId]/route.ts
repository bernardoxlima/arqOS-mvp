import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { deleteImage } from "@/modules/presentations/services/images.service";

type RouteContext = {
  params: Promise<{ id: string; imageId: string }>;
};

/**
 * DELETE /api/presentations/[id]/images/[imageId]
 * Delete an image from a presentation
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { imageId } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete image
    const { error } = await deleteImage(supabase, imageId);

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
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
