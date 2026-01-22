import type { Tables } from "@/shared/lib/supabase/database.types";

// Database types
export type Project = Tables<"projects">;
export type TimeEntry = Tables<"time_entries">;
export type ActivityLog = Tables<"activity_log">;

// Stage colors
export type StageColor =
  | "purple"
  | "blue"
  | "cyan"
  | "green"
  | "yellow"
  | "orange"
  | "pink"
  | "gray"
  | "emerald";

// Project stage definition
export interface ProjectStage {
  id: string;
  name: string;
  color: StageColor;
  description?: string;
}

// Service types
export type ServiceType = "decorexpress" | "producao" | "projetexpress";
export type Modality = "presencial" | "online";

// Workflow structure stored in projects.workflow JSONB
export interface Workflow {
  type: ServiceType;
  modality?: Modality;
  stages: ProjectStage[];
  current_stage_index: number;
}

// Financials structure stored in projects.financials JSONB
export interface Financials {
  value: number;
  estimated_hours: number;
  hours_used: number;
  hour_rate: number;
}

// Input types for API routes
export interface MoveStageInput {
  stage: string;
}

export interface TimeEntryInput {
  stage: string;
  hours: number;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
}

export interface AddStageInput {
  stage: ProjectStage;
  position?: number; // Index where to insert (default: end)
}

// Response types
export interface TimelineEntry {
  id: string;
  type: "stage_change" | "time_entry";
  timestamp: string;
  stage?: string;
  previous_stage?: string;
  hours?: number;
  description?: string;
  actor_name?: string;
}

export interface ProjectTimeline {
  project_id: string;
  entries: TimelineEntry[];
  time_by_stage: Record<string, number>;
}

// Service function response types
export interface ServiceResult<T = void> {
  data?: T;
  error?: string;
}

// CRUD Types

// Extended service types for future expansion
export type ExtendedServiceType = ServiceType | "arquitetonico" | "interiores";

// Project status (matches database CHECK constraint)
export type ProjectStatus = "aguardando" | "em_andamento" | "entregue" | "cancelado";

// Status display labels for UI
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  aguardando: "Aguardando",
  em_andamento: "Em Andamento",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

// Filters for listing projects
export interface ProjectFilters {
  status?: ProjectStatus;
  serviceType?: ServiceType | ExtendedServiceType;
  clientId?: string;
  search?: string;
  stage?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Data for creating a project
export interface CreateProjectData {
  clientId?: string;
  serviceType: ServiceType | ExtendedServiceType;
  modality?: Modality;
  scope?: string[];
  notes?: string;
  schedule?: {
    startDate?: string;
    estimatedEndDate?: string;
    estimatedHours?: number;
  };
  team?: {
    leaderId?: string;
    memberIds?: string[];
  };
}

// Data for updating a project
export interface UpdateProjectData {
  status?: ProjectStatus;
  stage?: string;
  notes?: string;
  scope?: string[];
  schedule?: Record<string, unknown>;
  team?: Record<string, unknown>;
  workflow?: Record<string, unknown>;
  financials?: Record<string, unknown>;
}

// Result wrapper for CRUD operations
export interface ProjectResult<T = void> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

// Project with expanded client data
export interface ProjectWithClient extends Project {
  client?: {
    id: string;
    name: string;
    contact: unknown;
  } | null;
}
