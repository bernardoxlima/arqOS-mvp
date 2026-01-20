import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/supabase/database.types";
import type {
  CreatePresentationInput,
  UpdatePresentationInput,
  PresentationWithRelations,
  PresentationSummary,
  ServiceResult,
} from "../types";

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Create a new presentation
 */
export async function createPresentation(
  supabase: SupabaseClientType,
  input: CreatePresentationInput,
  profileId: string
): Promise<ServiceResult<PresentationWithRelations>> {
  // Get profile to get organization_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    return { error: profileError?.message || "Profile not found" };
  }

  // Generate presentation code
  const { data: code, error: codeError } = await supabase.rpc(
    "generate_presentation_code",
    { org_id: profile.organization_id }
  );

  if (codeError) {
    return { error: codeError.message };
  }

  // Prepare insert data
  const insertData = {
    organization_id: profile.organization_id,
    name: input.name,
    code: code || `APRES-${Date.now()}`,
    project_id: input.projectId || null,
    phase: input.phase || "Entrega Final",
    status: "draft",
    client_data: (input.clientData || null) as unknown as Json,
    settings: (input.settings || null) as unknown as Json,
    created_by: profileId,
  };

  // Insert presentation
  const { data: presentation, error: insertError } = await supabase
    .from("presentations")
    .insert(insertData)
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Return with empty relations
  return {
    data: {
      ...presentation,
      images: [],
      items: [],
    } as PresentationWithRelations,
  };
}

/**
 * Get a presentation by ID with all relations
 */
export async function getPresentationById(
  supabase: SupabaseClientType,
  id: string
): Promise<ServiceResult<PresentationWithRelations>> {
  // Get presentation
  const { data: presentation, error: presentationError } = await supabase
    .from("presentations")
    .select("*")
    .eq("id", id)
    .single();

  if (presentationError || !presentation) {
    return { error: presentationError?.message || "Presentation not found" };
  }

  // Get images
  const { data: images, error: imagesError } = await supabase
    .from("presentation_images")
    .select("*")
    .eq("presentation_id", id)
    .order("section")
    .order("display_order");

  if (imagesError) {
    return { error: imagesError.message };
  }

  // Get items
  const { data: items, error: itemsError } = await supabase
    .from("presentation_items")
    .select("*")
    .eq("presentation_id", id)
    .order("category")
    .order("number");

  if (itemsError) {
    return { error: itemsError.message };
  }

  return {
    data: {
      ...presentation,
      images: images || [],
      items: items || [],
    } as PresentationWithRelations,
  };
}

/**
 * Update a presentation
 */
export async function updatePresentation(
  supabase: SupabaseClientType,
  id: string,
  input: UpdatePresentationInput
): Promise<ServiceResult<PresentationWithRelations>> {
  // Build update object
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
  }
  if (input.phase !== undefined) {
    updateData.phase = input.phase;
  }
  if (input.clientData !== undefined) {
    updateData.client_data = input.clientData as unknown as Json;
  }
  if (input.settings !== undefined) {
    updateData.settings = input.settings as unknown as Json;
  }

  // Update presentation
  const { data: presentation, error: updateError } = await supabase
    .from("presentations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return { error: updateError.message };
  }

  // Return full presentation with relations
  return getPresentationById(supabase, id);
}

/**
 * Delete a presentation (and all related images/items via cascade)
 */
export async function deletePresentation(
  supabase: SupabaseClientType,
  id: string
): Promise<ServiceResult> {
  // First, delete all images from storage
  const { data: images } = await supabase
    .from("presentation_images")
    .select("image_url, thumbnail_url")
    .eq("presentation_id", id);

  if (images && images.length > 0) {
    const filePaths = images.flatMap(img => {
      const paths: string[] = [];
      if (img.image_url) {
        // Extract path from URL
        const match = img.image_url.match(/presentation-images\/(.+)/);
        if (match) paths.push(match[1]);
      }
      if (img.thumbnail_url) {
        const match = img.thumbnail_url.match(/presentation-images\/(.+)/);
        if (match) paths.push(match[1]);
      }
      return paths;
    });

    if (filePaths.length > 0) {
      await supabase.storage.from("presentation-images").remove(filePaths);
    }
  }

  // Delete presentation (images and items will cascade)
  const { error } = await supabase
    .from("presentations")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { data: undefined };
}

/**
 * List presentations with pagination
 */
export async function listPresentations(
  supabase: SupabaseClientType,
  filters: {
    projectId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ServiceResult<{ presentations: PresentationSummary[]; total: number }>> {
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  // Build query
  let query = supabase
    .from("presentations")
    .select(`
      id,
      name,
      code,
      status,
      phase,
      created_at,
      updated_at,
      presentation_images(id),
      presentation_items(id)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (filters.projectId) {
    query = query.eq("project_id", filters.projectId);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return { error: error.message };
  }

  // Transform to summary format
  const presentations: PresentationSummary[] = (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    status: p.status,
    phase: p.phase,
    imageCount: Array.isArray(p.presentation_images) ? p.presentation_images.length : 0,
    itemCount: Array.isArray(p.presentation_items) ? p.presentation_items.length : 0,
    createdAt: p.created_at || "",
    updatedAt: p.updated_at || "",
  }));

  return {
    data: {
      presentations,
      total: count || 0,
    },
  };
}

/**
 * Get presentation progress (images and items per section)
 */
export async function getPresentationProgress(
  supabase: SupabaseClientType,
  id: string
): Promise<ServiceResult<Record<string, unknown>>> {
  // Use the database function
  const { data, error } = await supabase.rpc("calculate_presentation_progress", {
    pres_id: id,
  });

  if (error) {
    return { error: error.message };
  }

  return { data: data as Record<string, unknown> };
}
