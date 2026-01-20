// Types
export type {
  Project,
  TimeEntry,
  ActivityLog,
  StageColor,
  ProjectStage,
  ServiceType,
  Modality,
  Workflow,
  Financials,
  MoveStageInput,
  TimeEntryInput,
  AddStageInput,
  TimelineEntry,
  ProjectTimeline,
  ServiceResult,
  // CRUD types
  ExtendedServiceType,
  ProjectStatus,
  ProjectFilters,
  CreateProjectData,
  UpdateProjectData,
  ProjectResult,
  ProjectWithClient,
} from "./types";

// Constants
export {
  DECOREXPRESS_PRESENCIAL_STAGES,
  DECOREXPRESS_ONLINE_STAGES,
  PRODUCAO_STAGES,
  PROJETEXPRESS_STAGES,
  getStagesForService,
  getStageById,
  getStageIndex,
  isValidStage,
  getFinalStageId,
} from "./constants/stages";

// Schemas
export {
  createProjectSchema,
  updateProjectSchema,
  projectFiltersSchema,
  uuidParamSchema,
} from "./schemas";
export type {
  CreateProjectSchemaType,
  UpdateProjectSchemaType,
  ProjectFiltersSchemaType,
  UUIDParamSchemaType,
} from "./schemas";

// Services - Kanban
export {
  moveProjectToStage,
  addTimeEntry,
  addCustomStage,
  getProjectStages,
  getProjectTimeline,
} from "./services/kanban";

// Services - CRUD
export {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  countProjects,
} from "./services/projects.service";

// Hooks
export {
  useProjects,
  useProject,
  projectKeys,
  getCurrentStageName,
  getWorkflowProgress,
} from "./hooks";

// Components
export {
  ProjectCard,
  EmptyState,
  ProjectModal,
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  TimeEntryModal,
} from "./components";
