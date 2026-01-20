import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/supabase/database.types";
import type {
  ProjectStage,
  TimeEntryInput,
  Workflow,
  ServiceResult,
  ProjectTimeline,
  TimelineEntry,
} from "../types";
import { getStageIndex, isValidStage, getFinalStageId } from "../constants/stages";

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Get project with workflow data
 */
async function getProjectWithWorkflow(
  supabase: SupabaseClientType,
  projectId: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, stage, status, service_type, workflow, organization_id")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || "Project not found" };
  }

  return { data, error: null };
}

/**
 * Move a project to a new stage
 */
export async function moveProjectToStage(
  supabase: SupabaseClientType,
  projectId: string,
  newStage: string
): Promise<ServiceResult<{ stage: string; status: string }>> {
  // 1. Get project with current workflow
  const { data: project, error: fetchError } = await getProjectWithWorkflow(
    supabase,
    projectId
  );

  if (fetchError || !project) {
    return { error: fetchError || "Project not found" };
  }

  // 2. Check project status - can't move if cancelled or already delivered
  if (project.status === "cancelado") {
    return { error: "Cannot move stage of cancelled project" };
  }

  if (project.status === "entregue") {
    return { error: "Cannot move stage of delivered project" };
  }

  // 3. Get workflow stages
  const workflow = project.workflow as Workflow | null;
  if (!workflow || !workflow.stages) {
    return { error: "Project has no workflow configured" };
  }

  // 4. Validate new stage exists in workflow
  if (!isValidStage(workflow.stages, newStage)) {
    return { error: `Invalid stage: ${newStage}` };
  }

  // 5. Get new stage index
  const newStageIndex = getStageIndex(workflow.stages, newStage);

  // 6. Determine new status
  const finalStageId = getFinalStageId(
    workflow.type,
    workflow.modality
  );
  const newStatus = newStage === finalStageId ? "entregue" : project.status;

  // 7. Update project
  const updatedWorkflow = {
    ...workflow,
    current_stage_index: newStageIndex,
  };

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      stage: newStage,
      status: newStatus,
      workflow: updatedWorkflow as unknown as Json,
      completed_at: newStatus === "entregue" ? new Date().toISOString() : null,
    })
    .eq("id", projectId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Note: The activity_log trigger automatically logs this change

  return {
    data: { stage: newStage, status: newStatus },
  };
}

/**
 * Add a time entry to a project
 */
export async function addTimeEntry(
  supabase: SupabaseClientType,
  projectId: string,
  entry: TimeEntryInput,
  profileId: string
): Promise<ServiceResult<{ id: string }>> {
  // 1. Validate hours
  if (entry.hours <= 0 || entry.hours > 24) {
    return { error: "Hours must be between 0 and 24" };
  }

  // 2. Validate date (not in the future)
  const entryDate = new Date(entry.date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (entryDate > today) {
    return { error: "Date cannot be in the future" };
  }

  // 3. Get project to validate stage and get organization_id
  const { data: project, error: fetchError } = await getProjectWithWorkflow(
    supabase,
    projectId
  );

  if (fetchError || !project) {
    return { error: fetchError || "Project not found" };
  }

  // 4. Validate stage exists in workflow
  const workflow = project.workflow as Workflow | null;
  if (workflow && workflow.stages) {
    if (!isValidStage(workflow.stages, entry.stage)) {
      return { error: `Invalid stage: ${entry.stage}` };
    }
  }

  // 5. Insert time entry
  const { data, error: insertError } = await supabase
    .from("time_entries")
    .insert({
      project_id: projectId,
      profile_id: profileId,
      organization_id: project.organization_id,
      stage: entry.stage,
      hours: entry.hours,
      description: entry.description || null,
      date: entry.date,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Note: The update_project_hours trigger automatically updates financials.hours_used

  return { data: { id: data.id } };
}

/**
 * Add a custom stage to a project's workflow
 */
export async function addCustomStage(
  supabase: SupabaseClientType,
  projectId: string,
  stage: ProjectStage,
  position?: number
): Promise<ServiceResult<{ stages: ProjectStage[] }>> {
  // 1. Get project with current workflow
  const { data: project, error: fetchError } = await getProjectWithWorkflow(
    supabase,
    projectId
  );

  if (fetchError || !project) {
    return { error: fetchError || "Project not found" };
  }

  // 2. Get workflow
  const workflow = project.workflow as Workflow | null;
  if (!workflow) {
    return { error: "Project has no workflow configured" };
  }

  // 3. Check if stage ID already exists
  if (isValidStage(workflow.stages, stage.id)) {
    return { error: `Stage with ID "${stage.id}" already exists` };
  }

  // 4. Insert stage at position
  const stages = [...workflow.stages];
  const insertPosition = position !== undefined
    ? Math.min(Math.max(0, position), stages.length)
    : stages.length;

  stages.splice(insertPosition, 0, stage);

  // 5. Adjust current_stage_index if needed
  let newCurrentIndex = workflow.current_stage_index;
  if (insertPosition <= workflow.current_stage_index) {
    newCurrentIndex++;
  }

  // 6. Update project workflow
  const updatedWorkflow = {
    ...workflow,
    stages,
    current_stage_index: newCurrentIndex,
  };

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      workflow: updatedWorkflow as unknown as Json,
    })
    .eq("id", projectId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { data: { stages } };
}

/**
 * Get project workflow stages
 */
export async function getProjectStages(
  supabase: SupabaseClientType,
  projectId: string
): Promise<ServiceResult<{ stages: ProjectStage[]; currentStage: string | null }>> {
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("stage, workflow")
    .eq("id", projectId)
    .single();

  if (fetchError || !project) {
    return { error: fetchError?.message || "Project not found" };
  }

  const workflow = project.workflow as Workflow | null;
  if (!workflow || !workflow.stages) {
    return { error: "Project has no workflow configured" };
  }

  return {
    data: {
      stages: workflow.stages,
      currentStage: project.stage,
    },
  };
}

/**
 * Get project timeline (stage changes and time entries)
 */
export async function getProjectTimeline(
  supabase: SupabaseClientType,
  projectId: string
): Promise<ServiceResult<ProjectTimeline>> {
  // 1. Get stage changes from activity_log
  const { data: activityLogs, error: activityError } = await supabase
    .from("activity_log")
    .select("id, action, changes, created_at, actor_id")
    .eq("entity_type", "project")
    .eq("entity_id", projectId)
    .eq("action", "stage_changed")
    .order("created_at", { ascending: true });

  if (activityError) {
    return { error: activityError.message };
  }

  // 2. Get time entries
  const { data: timeEntries, error: timeError } = await supabase
    .from("time_entries")
    .select(`
      id,
      stage,
      hours,
      description,
      date,
      created_at,
      profile_id
    `)
    .eq("project_id", projectId)
    .order("date", { ascending: true });

  if (timeError) {
    return { error: timeError.message };
  }

  // 3. Get profile names for actors
  const actorIds = new Set<string>();
  activityLogs?.forEach((log) => {
    if (log.actor_id) actorIds.add(log.actor_id);
  });
  timeEntries?.forEach((entry) => {
    if (entry.profile_id) actorIds.add(entry.profile_id);
  });

  const profileMap: Record<string, string> = {};
  if (actorIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(actorIds));

    profiles?.forEach((p) => {
      profileMap[p.id] = p.full_name;
    });
  }

  // 4. Build timeline entries
  const entries: TimelineEntry[] = [];

  // Add stage changes
  activityLogs?.forEach((log) => {
    const changes = log.changes as { old_stage?: string; new_stage?: string } | null;
    entries.push({
      id: log.id,
      type: "stage_change",
      timestamp: log.created_at || "",
      stage: changes?.new_stage,
      previous_stage: changes?.old_stage,
      actor_name: log.actor_id ? profileMap[log.actor_id] : undefined,
    });
  });

  // Add time entries
  timeEntries?.forEach((entry) => {
    entries.push({
      id: entry.id,
      type: "time_entry",
      timestamp: entry.created_at || entry.date,
      stage: entry.stage || undefined,
      hours: entry.hours,
      description: entry.description || undefined,
      actor_name: entry.profile_id ? profileMap[entry.profile_id] : undefined,
    });
  });

  // 5. Sort by timestamp
  entries.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 6. Calculate time by stage
  const timeByStage: Record<string, number> = {};
  timeEntries?.forEach((entry) => {
    const stage = entry.stage || "unknown";
    timeByStage[stage] = (timeByStage[stage] || 0) + entry.hours;
  });

  return {
    data: {
      project_id: projectId,
      entries,
      time_by_stage: timeByStage,
    },
  };
}
