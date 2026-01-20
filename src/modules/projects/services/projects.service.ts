"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type {
  ProjectFilters,
  CreateProjectData,
  UpdateProjectData,
  ProjectResult,
  ProjectWithClient,
  Workflow,
  ServiceType,
  Modality,
} from "../types";
import { getStagesForService } from "../constants/stages";

/**
 * List projects with optional filters
 */
export async function listProjects(
  filters: ProjectFilters = {}
): Promise<ProjectResult<ProjectWithClient[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.serviceType) {
    query = query.eq("service_type", filters.serviceType);
  }
  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }
  if (filters.stage) {
    query = query.eq("stage", filters.stage);
  }
  if (filters.search) {
    query = query.or(
      `code.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  // Apply pagination
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as ProjectWithClient[], error: null };
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  id: string
): Promise<ProjectResult<ProjectWithClient>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data as ProjectWithClient, error: null };
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectData
): Promise<ProjectResult<ProjectWithClient>> {
  const supabase = await createClient();

  // Get current user's profile for organization_id
  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    return {
      data: null,
      error: {
        message: profileError?.message || "Usuário não autenticado",
        code: "UNAUTHENTICATED",
      },
    };
  }

  // Generate project code
  const { data: code, error: codeError } = await supabase.rpc(
    "generate_project_code",
    {
      org_id: profile.organization_id,
      svc_type: data.serviceType,
    }
  );

  if (codeError) {
    return {
      data: null,
      error: { message: codeError.message, code: codeError.code },
    };
  }

  // Get default workflow stages for this service type
  // Map extended types to core types for workflow
  const rawServiceType = data.serviceType;
  const coreServiceType: ServiceType =
    rawServiceType === "arquitetonico" || rawServiceType === "interiores"
      ? "decorexpress"
      : (rawServiceType as ServiceType);
  const modality = data.modality as Modality | undefined;
  const stages = getStagesForService(coreServiceType, modality);

  // Build initial workflow
  const workflow: Workflow = {
    type: coreServiceType,
    modality: modality,
    stages: stages,
    current_stage_index: 0,
  };

  // Prepare insert data
  const insertData = {
    organization_id: profile.organization_id,
    code: code || `PRJ-${Date.now()}`,
    client_id: data.clientId || null,
    service_type: data.serviceType,
    scope: data.scope || null,
    notes: data.notes || null,
    schedule: data.schedule || null,
    team: data.team || null,
    status: "draft",
    stage: stages[0]?.id || null,
    workflow: workflow as unknown as Record<string, unknown>,
  };

  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert(insertData)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (insertError) {
    return {
      data: null,
      error: { message: insertError.message, code: insertError.code },
    };
  }

  return { data: project as ProjectWithClient, error: null };
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: UpdateProjectData
): Promise<ProjectResult<ProjectWithClient>> {
  const supabase = await createClient();

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.stage !== undefined) {
    updateData.stage = data.stage;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }
  if (data.scope !== undefined) {
    updateData.scope = data.scope;
  }
  if (data.schedule !== undefined) {
    updateData.schedule = data.schedule;
  }
  if (data.team !== undefined) {
    updateData.team = data.team;
  }
  if (data.workflow !== undefined) {
    updateData.workflow = data.workflow;
  }
  if (data.financials !== undefined) {
    updateData.financials = data.financials;
  }

  // If completing, set completed_at
  if (data.status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      client:clients(id, name, contact)
    `
    )
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: project as ProjectWithClient, error: null };
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<ProjectResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Count projects (for pagination metadata)
 */
export async function countProjects(
  filters: Omit<ProjectFilters, "limit" | "offset"> = {}
): Promise<ProjectResult<number>> {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  // Apply same filters as listProjects
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.serviceType) {
    query = query.eq("service_type", filters.serviceType);
  }
  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId);
  }
  if (filters.stage) {
    query = query.eq("stage", filters.stage);
  }
  if (filters.search) {
    query = query.or(
      `code.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { count, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: count || 0, error: null };
}
