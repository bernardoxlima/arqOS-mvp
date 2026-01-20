import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  uploadImage,
  getAllImages,
  updateImageOrder,
} from "@/modules/presentations/services/images.service";
import type { ImageSection } from "@/modules/presentations/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_SECTIONS: ImageSection[] = [
  "photos_before",
  "moodboard",
  "references",
  "floor_plan",
  "renders",
];

/**
 * POST /api/presentations/[id]/images
 * Upload an image to a presentation section
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const section = formData.get("section") as string | null;
    const displayOrder = formData.get("displayOrder") as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate section
    if (!section || !VALID_SECTIONS.includes(section as ImageSection)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Upload image
    const { data, error } = await uploadImage(
      supabase,
      id,
      section as ImageSection,
      file,
      displayOrder ? parseInt(displayOrder) : undefined
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
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/presentations/[id]/images
 * Get all images for a presentation grouped by section
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

    // Get all images
    const { data, error } = await getAllImages(supabase, id);

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
    console.error("Error getting images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/presentations/[id]/images
 * Update image order within a section
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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
    const { section, imageIds } = body;

    // Validate section
    if (!section || !VALID_SECTIONS.includes(section as ImageSection)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate imageIds
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "imageIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Update order
    const { error } = await updateImageOrder(
      supabase,
      id,
      section as ImageSection,
      imageIds
    );

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
    console.error("Error updating image order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
