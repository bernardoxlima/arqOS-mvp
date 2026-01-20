import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/supabase/database.types";
import type {
  ImageSection,
  ImageMetadata,
  PresentationImage,
  ServiceResult,
} from "../types";
import { IMAGE_SECTION_LIMITS } from "../types";

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Upload an image to a presentation section
 */
export async function uploadImage(
  supabase: SupabaseClientType,
  presentationId: string,
  section: ImageSection,
  file: File,
  displayOrder?: number
): Promise<ServiceResult<PresentationImage>> {
  // 1. Get presentation to verify it exists and get organization_id
  const { data: presentation, error: presError } = await supabase
    .from("presentations")
    .select("id, organization_id")
    .eq("id", presentationId)
    .single();

  if (presError || !presentation) {
    return { error: presError?.message || "Presentation not found" };
  }

  // 2. Check section limit
  const { count, error: countError } = await supabase
    .from("presentation_images")
    .select("id", { count: "exact", head: true })
    .eq("presentation_id", presentationId)
    .eq("section", section);

  if (countError) {
    return { error: countError.message };
  }

  const limit = IMAGE_SECTION_LIMITS[section];
  if ((count || 0) >= limit) {
    return { error: `Section ${section} already has maximum ${limit} images` };
  }

  // 3. Generate unique file path
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${presentationId}/${section}/${Date.now()}.${fileExt}`;

  // 4. Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("presentation-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // 5. Get public URL
  const { data: urlData } = supabase.storage
    .from("presentation-images")
    .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;

  // 6. Determine display order
  let order = displayOrder;
  if (order === undefined) {
    const { data: lastImage } = await supabase
      .from("presentation_images")
      .select("display_order")
      .eq("presentation_id", presentationId)
      .eq("section", section)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    order = (lastImage?.display_order || 0) + 1;
  }

  // 7. Create metadata
  const metadata: ImageMetadata = {
    mimeType: file.type,
    originalName: file.name,
  };

  // 8. Insert image record
  const { data: image, error: insertError } = await supabase
    .from("presentation_images")
    .insert({
      presentation_id: presentationId,
      organization_id: presentation.organization_id,
      section,
      image_url: imageUrl,
      filename: file.name,
      file_size: file.size,
      display_order: order,
      metadata: metadata as unknown as Json,
    })
    .select()
    .single();

  if (insertError) {
    // Clean up uploaded file
    await supabase.storage.from("presentation-images").remove([fileName]);
    return { error: insertError.message };
  }

  return { data: image };
}

/**
 * Delete an image from a presentation
 */
export async function deleteImage(
  supabase: SupabaseClientType,
  imageId: string
): Promise<ServiceResult> {
  // 1. Get image to get file path
  const { data: image, error: fetchError } = await supabase
    .from("presentation_images")
    .select("image_url, thumbnail_url")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return { error: fetchError?.message || "Image not found" };
  }

  // 2. Extract file paths from URLs
  const filesToDelete: string[] = [];

  if (image.image_url) {
    const match = image.image_url.match(/presentation-images\/(.+)/);
    if (match) filesToDelete.push(match[1]);
  }

  if (image.thumbnail_url) {
    const match = image.thumbnail_url.match(/presentation-images\/(.+)/);
    if (match) filesToDelete.push(match[1]);
  }

  // 3. Delete from storage
  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("presentation-images")
      .remove(filesToDelete);

    if (storageError) {
      console.error("Failed to delete files from storage:", storageError);
      // Continue with database deletion even if storage fails
    }
  }

  // 4. Delete from database
  const { error: deleteError } = await supabase
    .from("presentation_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  return { data: undefined };
}

/**
 * Update image order within a section
 */
export async function updateImageOrder(
  supabase: SupabaseClientType,
  presentationId: string,
  section: ImageSection,
  imageIds: string[]
): Promise<ServiceResult> {
  // Update each image's display_order based on position in array
  const updates = imageIds.map((id, index) =>
    supabase
      .from("presentation_images")
      .update({ display_order: index + 1 })
      .eq("id", id)
      .eq("presentation_id", presentationId)
      .eq("section", section)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    return { error: errors[0].error?.message || "Failed to update image order" };
  }

  return { data: undefined };
}

/**
 * Get images by section
 */
export async function getImagesBySection(
  supabase: SupabaseClientType,
  presentationId: string,
  section: ImageSection
): Promise<ServiceResult<PresentationImage[]>> {
  const { data, error } = await supabase
    .from("presentation_images")
    .select("*")
    .eq("presentation_id", presentationId)
    .eq("section", section)
    .order("display_order");

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

/**
 * Get all images grouped by section
 */
export async function getAllImages(
  supabase: SupabaseClientType,
  presentationId: string
): Promise<ServiceResult<Record<ImageSection, PresentationImage[]>>> {
  const { data, error } = await supabase
    .from("presentation_images")
    .select("*")
    .eq("presentation_id", presentationId)
    .order("section")
    .order("display_order");

  if (error) {
    return { error: error.message };
  }

  // Group by section
  const grouped: Record<ImageSection, PresentationImage[]> = {
    photos_before: [],
    moodboard: [],
    references: [],
    floor_plan: [],
    renders: [],
  };

  (data || []).forEach(img => {
    const section = img.section as ImageSection;
    if (grouped[section]) {
      grouped[section].push(img);
    }
  });

  return { data: grouped };
}

/**
 * Check if section has reached its limit
 */
export async function isSectionFull(
  supabase: SupabaseClientType,
  presentationId: string,
  section: ImageSection
): Promise<ServiceResult<boolean>> {
  const { count, error } = await supabase
    .from("presentation_images")
    .select("id", { count: "exact", head: true })
    .eq("presentation_id", presentationId)
    .eq("section", section);

  if (error) {
    return { error: error.message };
  }

  const limit = IMAGE_SECTION_LIMITS[section];
  return { data: (count || 0) >= limit };
}
