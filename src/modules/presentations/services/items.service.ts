import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/supabase/database.types";
import type {
  AddItemInput,
  UpdateItemInput,
  ItemCategory,
  ItemType,
  PresentationItem,
  ServiceResult,
} from "../types";

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Add an item to a presentation
 */
export async function addItem(
  supabase: SupabaseClientType,
  presentationId: string,
  input: AddItemInput
): Promise<ServiceResult<PresentationItem>> {
  // 1. Get presentation to verify it exists and get organization_id
  const { data: presentation, error: presError } = await supabase
    .from("presentations")
    .select("id, organization_id")
    .eq("id", presentationId)
    .single();

  if (presError || !presentation) {
    return { error: presError?.message || "Presentation not found" };
  }

  // 2. Determine item number (auto-increment within presentation)
  let itemNumber = input.number;
  if (itemNumber === undefined) {
    const { data: lastItem } = await supabase
      .from("presentation_items")
      .select("number")
      .eq("presentation_id", presentationId)
      .order("number", { ascending: false })
      .limit(1)
      .single();

    itemNumber = (lastItem?.number || 0) + 1;
  }

  // 3. Insert item
  const { data: item, error: insertError } = await supabase
    .from("presentation_items")
    .insert({
      presentation_id: presentationId,
      organization_id: presentation.organization_id,
      name: input.name,
      number: itemNumber,
      category: input.category,
      item_type: input.itemType,
      ambiente: input.ambiente || null,
      position: input.position ? (input.position as unknown as Json) : null,
      product: input.product ? (input.product as unknown as Json) : null,
      status: "active",
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  return { data: item };
}

/**
 * Update an item
 */
export async function updateItem(
  supabase: SupabaseClientType,
  itemId: string,
  input: UpdateItemInput
): Promise<ServiceResult<PresentationItem>> {
  // Build update object
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.category !== undefined) {
    updateData.category = input.category;
  }
  if (input.ambiente !== undefined) {
    updateData.ambiente = input.ambiente;
  }
  if (input.number !== undefined) {
    updateData.number = input.number;
  }
  if (input.position !== undefined) {
    updateData.position = input.position as unknown as Json;
  }
  if (input.product !== undefined) {
    updateData.product = input.product as unknown as Json;
  }
  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  // Update item
  const { data: item, error: updateError } = await supabase
    .from("presentation_items")
    .update(updateData)
    .eq("id", itemId)
    .select()
    .single();

  if (updateError) {
    return { error: updateError.message };
  }

  return { data: item };
}

/**
 * Delete an item
 */
export async function deleteItem(
  supabase: SupabaseClientType,
  itemId: string
): Promise<ServiceResult> {
  const { error } = await supabase
    .from("presentation_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  return { data: undefined };
}

/**
 * Get all items for a presentation
 */
export async function getItems(
  supabase: SupabaseClientType,
  presentationId: string,
  filters?: {
    itemType?: ItemType;
    category?: ItemCategory;
    ambiente?: string;
  }
): Promise<ServiceResult<PresentationItem[]>> {
  let query = supabase
    .from("presentation_items")
    .select("*")
    .eq("presentation_id", presentationId)
    .order("category")
    .order("number");

  if (filters?.itemType) {
    query = query.eq("item_type", filters.itemType);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.ambiente) {
    query = query.eq("ambiente", filters.ambiente);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

/**
 * Get layout items (items with position on floor plan)
 */
export async function getLayoutItems(
  supabase: SupabaseClientType,
  presentationId: string
): Promise<ServiceResult<PresentationItem[]>> {
  return getItems(supabase, presentationId, { itemType: "layout" });
}

/**
 * Get complementary items (items without position)
 */
export async function getComplementaryItems(
  supabase: SupabaseClientType,
  presentationId: string
): Promise<ServiceResult<PresentationItem[]>> {
  return getItems(supabase, presentationId, { itemType: "complementary" });
}

/**
 * Get items grouped by category
 */
export async function getItemsByCategory(
  supabase: SupabaseClientType,
  presentationId: string
): Promise<ServiceResult<Record<ItemCategory, PresentationItem[]>>> {
  const { data, error } = await getItems(supabase, presentationId);

  if (error) {
    return { error };
  }

  // Group by category
  const grouped: Record<string, PresentationItem[]> = {};

  (data || []).forEach(item => {
    const category = item.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return { data: grouped as Record<ItemCategory, PresentationItem[]> };
}

/**
 * Get items grouped by ambiente
 */
export async function getItemsByAmbiente(
  supabase: SupabaseClientType,
  presentationId: string
): Promise<ServiceResult<Record<string, PresentationItem[]>>> {
  const { data, error } = await getItems(supabase, presentationId);

  if (error) {
    return { error };
  }

  // Group by ambiente
  const grouped: Record<string, PresentationItem[]> = {
    "Sem ambiente": [],
  };

  (data || []).forEach(item => {
    const ambiente = item.ambiente || "Sem ambiente";
    if (!grouped[ambiente]) {
      grouped[ambiente] = [];
    }
    grouped[ambiente].push(item);
  });

  return { data: grouped };
}

/**
 * Bulk add items to a presentation
 */
export async function addBulkItems(
  supabase: SupabaseClientType,
  presentationId: string,
  items: AddItemInput[]
): Promise<ServiceResult<PresentationItem[]>> {
  // 1. Get presentation to verify it exists and get organization_id
  const { data: presentation, error: presError } = await supabase
    .from("presentations")
    .select("id, organization_id")
    .eq("id", presentationId)
    .single();

  if (presError || !presentation) {
    return { error: presError?.message || "Presentation not found" };
  }

  // 2. Get current max number
  const { data: lastItem } = await supabase
    .from("presentation_items")
    .select("number")
    .eq("presentation_id", presentationId)
    .order("number", { ascending: false })
    .limit(1)
    .single();

  let currentNumber = lastItem?.number || 0;

  // 3. Prepare items for insert
  const insertData = items.map(input => {
    currentNumber++;
    return {
      presentation_id: presentationId,
      organization_id: presentation.organization_id,
      name: input.name,
      number: input.number ?? currentNumber,
      category: input.category,
      item_type: input.itemType,
      ambiente: input.ambiente || null,
      position: input.position ? (input.position as unknown as Json) : null,
      product: input.product ? (input.product as unknown as Json) : null,
      status: "active",
    };
  });

  // 4. Insert all items
  const { data, error: insertError } = await supabase
    .from("presentation_items")
    .insert(insertData)
    .select();

  if (insertError) {
    return { error: insertError.message };
  }

  return { data: data || [] };
}

/**
 * Update item position on floor plan
 */
export async function updateItemPosition(
  supabase: SupabaseClientType,
  itemId: string,
  position: { x: number; y: number }
): Promise<ServiceResult<PresentationItem>> {
  const { data, error } = await supabase
    .from("presentation_items")
    .update({ position: position as unknown as Json })
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Renumber items in a presentation (fix gaps in numbering)
 */
export async function renumberItems(
  supabase: SupabaseClientType,
  presentationId: string
): Promise<ServiceResult> {
  // Get all items ordered by number
  const { data: items, error: fetchError } = await supabase
    .from("presentation_items")
    .select("id, number")
    .eq("presentation_id", presentationId)
    .order("number");

  if (fetchError) {
    return { error: fetchError.message };
  }

  // Update numbers to be sequential
  const updates = (items || []).map((item, index) =>
    supabase
      .from("presentation_items")
      .update({ number: index + 1 })
      .eq("id", item.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    return { error: errors[0].error?.message || "Failed to renumber items" };
  }

  return { data: undefined };
}
