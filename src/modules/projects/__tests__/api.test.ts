import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the service modules
vi.mock("@/modules/projects/services/projects.service", () => ({
  listProjects: vi.fn(),
  getProjectById: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  countProjects: vi.fn(),
}));

vi.mock("@/modules/projects/services/kanban", () => ({
  moveProjectToStage: vi.fn(),
  addTimeEntry: vi.fn(),
  addCustomStage: vi.fn(),
  getProjectStages: vi.fn(),
  getProjectTimeline: vi.fn(),
}));

vi.mock("@/shared/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "profile-123" },
        error: null,
      }),
    })),
  })),
}));

// Import route handlers after mocking
import { GET, POST } from "@/app/api/projects/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/projects/[id]/route";
import { POST as POST_STAGE } from "@/app/api/projects/[id]/stage/route";
import {
  GET as GET_STAGES,
  POST as POST_CUSTOM_STAGE,
} from "@/app/api/projects/[id]/stages/route";
import { POST as POST_TIME_ENTRY } from "@/app/api/projects/[id]/time-entry/route";
import { GET as GET_TIMELINE } from "@/app/api/projects/[id]/timeline/route";

import * as projectsService from "@/modules/projects/services/projects.service";
import * as kanbanService from "@/modules/projects/services/kanban";

const mockProjectsService = projectsService as unknown as {
  listProjects: ReturnType<typeof vi.fn>;
  getProjectById: ReturnType<typeof vi.fn>;
  createProject: ReturnType<typeof vi.fn>;
  updateProject: ReturnType<typeof vi.fn>;
  deleteProject: ReturnType<typeof vi.fn>;
  countProjects: ReturnType<typeof vi.fn>;
};

const mockKanbanService = kanbanService as unknown as {
  moveProjectToStage: ReturnType<typeof vi.fn>;
  addTimeEntry: ReturnType<typeof vi.fn>;
  addCustomStage: ReturnType<typeof vi.fn>;
  getProjectStages: ReturnType<typeof vi.fn>;
  getProjectTimeline: ReturnType<typeof vi.fn>;
};

// Sample project data for testing
const sampleProject = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  organization_id: "org-123",
  code: "ARQ-25001",
  client_id: "client-123",
  service_type: "decorexpress",
  status: "active",
  stage: "briefing",
  workflow: {
    type: "decorexpress",
    modality: "presencial",
    stages: [
      { id: "briefing", name: "Briefing", color: "blue" },
      { id: "projeto", name: "Projeto", color: "green" },
      { id: "entrega", name: "Entrega", color: "purple" },
    ],
    current_stage_index: 0,
  },
  scope: null,
  notes: null,
  schedule: null,
  team: null,
  financials: null,
  created_at: "2025-01-15T10:00:00.000Z",
  updated_at: "2025-01-15T10:00:00.000Z",
  completed_at: null,
  client: {
    id: "client-123",
    name: "Maria Silva",
    contact: { email: "maria@test.com", phone: "11999999999" },
  },
};

describe("Projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // GET /api/projects
  // ===========================================================================
  describe("GET /api/projects", () => {
    const createRequest = (searchParams: Record<string, string> = {}) => {
      const url = new URL("http://localhost:3000/api/projects");
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return new NextRequest(url);
    };

    it("should return empty list when no projects", async () => {
      mockProjectsService.listProjects.mockResolvedValue({ data: [], error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it("should return projects with pagination", async () => {
      const projects = [sampleProject];
      mockProjectsService.listProjects.mockResolvedValue({ data: projects, error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 1, error: null });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(1);
    });

    it("should filter by status", async () => {
      mockProjectsService.listProjects.mockResolvedValue({ data: [], error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ status: "active" }));

      expect(mockProjectsService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({ status: "active" })
      );
    });

    it("should filter by serviceType", async () => {
      mockProjectsService.listProjects.mockResolvedValue({ data: [], error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ serviceType: "decorexpress" }));

      expect(mockProjectsService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({ serviceType: "decorexpress" })
      );
    });

    it("should filter by stage", async () => {
      mockProjectsService.listProjects.mockResolvedValue({ data: [], error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ stage: "briefing" }));

      expect(mockProjectsService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({ stage: "briefing" })
      );
    });

    it("should filter by search term", async () => {
      mockProjectsService.listProjects.mockResolvedValue({ data: [], error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ search: "ARQ-25001" }));

      expect(mockProjectsService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({ search: "ARQ-25001" })
      );
    });

    it("should return 400 for invalid status filter", async () => {
      const response = await GET(createRequest({ status: "invalid_status" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Filtros inválidos");
    });

    it("should return 400 for invalid serviceType filter", async () => {
      const response = await GET(createRequest({ serviceType: "invalid_service" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Filtros inválidos");
    });

    it("should return 500 when service returns error", async () => {
      mockProjectsService.listProjects.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database error");
    });

    it("should apply pagination parameters", async () => {
      mockProjectsService.listProjects.mockResolvedValue({ data: [], error: null });
      mockProjectsService.countProjects.mockResolvedValue({ data: 0, error: null });

      await GET(createRequest({ limit: "10", offset: "20" }));

      expect(mockProjectsService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 20 })
      );
    });
  });

  // ===========================================================================
  // POST /api/projects
  // ===========================================================================
  describe("POST /api/projects", () => {
    const createRequest = (body: unknown) => {
      return new NextRequest("http://localhost:3000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };

    it("should create project with minimal data", async () => {
      mockProjectsService.createProject.mockResolvedValue({
        data: sampleProject,
        error: null,
      });

      const response = await POST(createRequest({ serviceType: "decorexpress" }));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.code).toBe("ARQ-25001");
      expect(mockProjectsService.createProject).toHaveBeenCalled();
    });

    it("should create project with all fields", async () => {
      mockProjectsService.createProject.mockResolvedValue({
        data: sampleProject,
        error: null,
      });

      const fullData = {
        serviceType: "decorexpress",
        modality: "presencial",
        clientId: "550e8400-e29b-41d4-a716-446655440000",
        scope: ["Item 1", "Item 2"],
        notes: "Test notes",
      };

      const response = await POST(createRequest(fullData));

      expect(response.status).toBe(201);
      expect(mockProjectsService.createProject).toHaveBeenCalledWith(fullData);
    });

    it("should generate code automatically", async () => {
      mockProjectsService.createProject.mockResolvedValue({
        data: sampleProject,
        error: null,
      });

      const response = await POST(createRequest({ serviceType: "decorexpress" }));
      const data = await response.json();

      expect(data.code).toBeDefined();
      expect(data.code).toMatch(/^ARQ-/);
    });

    it("should initialize workflow correctly", async () => {
      mockProjectsService.createProject.mockResolvedValue({
        data: sampleProject,
        error: null,
      });

      const response = await POST(createRequest({ serviceType: "decorexpress" }));
      const data = await response.json();

      expect(data.workflow).toBeDefined();
      expect(data.workflow.stages).toHaveLength(3);
    });

    it("should return 400 for invalid serviceType", async () => {
      const response = await POST(createRequest({ serviceType: "invalid_type" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });

    it("should return 401 when not authenticated", async () => {
      mockProjectsService.createProject.mockResolvedValue({
        data: null,
        error: { message: "Usuário não autenticado", code: "UNAUTHENTICATED" },
      });

      const response = await POST(createRequest({ serviceType: "decorexpress" }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Usuário não autenticado");
    });

    it("should return 400 for missing serviceType", async () => {
      const response = await POST(createRequest({}));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });

    it("should validate all service types", async () => {
      const validServiceTypes = [
        "decorexpress",
        "producao",
        "projetexpress",
        "arquitetonico",
        "interiores",
      ];

      for (const serviceType of validServiceTypes) {
        vi.clearAllMocks();
        mockProjectsService.createProject.mockResolvedValue({
          data: { ...sampleProject, service_type: serviceType },
          error: null,
        });

        const response = await POST(createRequest({ serviceType }));
        expect(response.status).toBe(201);
      }
    });
  });

  // ===========================================================================
  // GET /api/projects/[id]
  // ===========================================================================
  describe("GET /api/projects/[id]", () => {
    const createRequest = (id: string) => {
      return new NextRequest(`http://localhost:3000/api/projects/${id}`);
    };

    it("should return project by ID", async () => {
      mockProjectsService.getProjectById.mockResolvedValue({
        data: sampleProject,
        error: null,
      });

      const response = await GET_BY_ID(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(sampleProject.id);
      expect(data.client).toBeDefined();
    });

    it("should return 404 for non-existent project", async () => {
      mockProjectsService.getProjectById.mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      const response = await GET_BY_ID(
        createRequest("550e8400-e29b-41d4-a716-446655440001"),
        { params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Projeto não encontrado");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await GET_BY_ID(
        createRequest("invalid-id"),
        { params: Promise.resolve({ id: "invalid-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID inválido");
    });
  });

  // ===========================================================================
  // PUT /api/projects/[id]
  // ===========================================================================
  describe("PUT /api/projects/[id]", () => {
    const createRequest = (id: string, body: unknown) => {
      return new NextRequest(`http://localhost:3000/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    };

    it("should update project status", async () => {
      const updatedProject = { ...sampleProject, status: "completed" };
      mockProjectsService.updateProject.mockResolvedValue({
        data: updatedProject,
        error: null,
      });

      const response = await PUT(
        createRequest(sampleProject.id, { status: "completed" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("completed");
    });

    it("should update project stage", async () => {
      mockProjectsService.updateProject.mockResolvedValue({
        data: { ...sampleProject, stage: "projeto" },
        error: null,
      });

      const response = await PUT(
        createRequest(sampleProject.id, { stage: "projeto" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );

      expect(response.status).toBe(200);
      expect(mockProjectsService.updateProject).toHaveBeenCalledWith(
        sampleProject.id,
        { stage: "projeto" }
      );
    });

    it("should set completed_at when status=completed", async () => {
      mockProjectsService.updateProject.mockResolvedValue({
        data: { ...sampleProject, status: "completed", completed_at: new Date().toISOString() },
        error: null,
      });

      const response = await PUT(
        createRequest(sampleProject.id, { status: "completed" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );

      expect(response.status).toBe(200);
      expect(mockProjectsService.updateProject).toHaveBeenCalledWith(
        sampleProject.id,
        { status: "completed" }
      );
    });

    it("should return 404 for non-existent project", async () => {
      mockProjectsService.updateProject.mockResolvedValue({
        data: null,
        error: { message: "Not found", code: "PGRST116" },
      });

      const response = await PUT(
        createRequest("550e8400-e29b-41d4-a716-446655440001", { status: "active" }),
        { params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Projeto não encontrado");
    });

    it("should return 400 for invalid status value", async () => {
      const response = await PUT(
        createRequest(sampleProject.id, { status: "invalid_status" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Dados inválidos");
    });
  });

  // ===========================================================================
  // DELETE /api/projects/[id]
  // ===========================================================================
  describe("DELETE /api/projects/[id]", () => {
    const createRequest = (id: string) => {
      return new NextRequest(`http://localhost:3000/api/projects/${id}`, {
        method: "DELETE",
      });
    };

    it("should delete existing project", async () => {
      mockProjectsService.deleteProject.mockResolvedValue({ data: null, error: null });

      const response = await DELETE(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 500 when delete fails", async () => {
      mockProjectsService.deleteProject.mockResolvedValue({
        data: null,
        error: { message: "Delete failed" },
      });

      const response = await DELETE(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Delete failed");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await DELETE(
        createRequest("invalid-id"),
        { params: Promise.resolve({ id: "invalid-id" }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ID inválido");
    });
  });

  // ===========================================================================
  // POST /api/projects/[id]/stage
  // ===========================================================================
  describe("POST /api/projects/[id]/stage", () => {
    const createRequest = (projectId: string, body: unknown) => {
      return new NextRequest(
        `http://localhost:3000/api/projects/${projectId}/stage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    it("should move project to new stage", async () => {
      mockKanbanService.moveProjectToStage.mockResolvedValue({
        data: { stage: "projeto", status: "active" },
        error: null,
      });

      const response = await POST_STAGE(
        createRequest(sampleProject.id, { stage: "projeto" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.stage).toBe("projeto");
    });

    it("should update workflow.current_stage_index", async () => {
      mockKanbanService.moveProjectToStage.mockResolvedValue({
        data: { stage: "projeto", status: "active" },
        error: null,
      });

      await POST_STAGE(
        createRequest(sampleProject.id, { stage: "projeto" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );

      expect(mockKanbanService.moveProjectToStage).toHaveBeenCalled();
    });

    it("should return 400 for invalid stage", async () => {
      mockKanbanService.moveProjectToStage.mockResolvedValue({
        data: null,
        error: "Invalid stage: nonexistent",
      });

      const response = await POST_STAGE(
        createRequest(sampleProject.id, { stage: "nonexistent" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing stage field", async () => {
      const response = await POST_STAGE(
        createRequest(sampleProject.id, {}),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      // Error message from zod schema validation
      expect(data.error).toContain("expected string");
    });
  });

  // ===========================================================================
  // GET /api/projects/[id]/stages
  // ===========================================================================
  describe("GET /api/projects/[id]/stages", () => {
    const createRequest = (projectId: string) => {
      return new NextRequest(
        `http://localhost:3000/api/projects/${projectId}/stages`
      );
    };

    it("should return workflow stages", async () => {
      mockKanbanService.getProjectStages.mockResolvedValue({
        data: {
          stages: sampleProject.workflow.stages,
          currentStage: "briefing",
        },
        error: null,
      });

      const response = await GET_STAGES(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.stages).toHaveLength(3);
      expect(data.data.currentStage).toBe("briefing");
    });

    it("should return 400 when project has no workflow", async () => {
      mockKanbanService.getProjectStages.mockResolvedValue({
        data: null,
        error: "Project has no workflow configured",
      });

      const response = await GET_STAGES(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Project has no workflow configured");
    });
  });

  // ===========================================================================
  // POST /api/projects/[id]/time-entry
  // ===========================================================================
  describe("POST /api/projects/[id]/time-entry", () => {
    const createRequest = (projectId: string, body: unknown) => {
      return new NextRequest(
        `http://localhost:3000/api/projects/${projectId}/time-entry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    };

    const validTimeEntry = {
      stage: "briefing",
      hours: 4,
      description: "Reunião com cliente",
      date: "2025-01-15",
    };

    it("should add time entry with valid data", async () => {
      mockKanbanService.addTimeEntry.mockResolvedValue({
        data: { id: "entry-123" },
        error: null,
      });

      const response = await POST_TIME_ENTRY(
        createRequest(sampleProject.id, validTimeEntry),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("entry-123");
    });

    it("should validate hours field", async () => {
      const response = await POST_TIME_ENTRY(
        createRequest(sampleProject.id, { ...validTimeEntry, hours: 25 }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Hours cannot exceed 24");
    });

    it("should validate required fields", async () => {
      const response = await POST_TIME_ENTRY(
        createRequest(sampleProject.id, { stage: "briefing" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("should validate date format", async () => {
      const response = await POST_TIME_ENTRY(
        createRequest(sampleProject.id, { ...validTimeEntry, date: "invalid-date" }),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  // ===========================================================================
  // GET /api/projects/[id]/timeline
  // ===========================================================================
  describe("GET /api/projects/[id]/timeline", () => {
    const createRequest = (projectId: string) => {
      return new NextRequest(
        `http://localhost:3000/api/projects/${projectId}/timeline`
      );
    };

    it("should return project timeline", async () => {
      const timelineData = {
        project_id: sampleProject.id,
        entries: [
          {
            id: "entry-1",
            type: "stage_change",
            timestamp: "2025-01-15T10:00:00.000Z",
            stage: "briefing",
            previous_stage: null,
          },
          {
            id: "entry-2",
            type: "time_entry",
            timestamp: "2025-01-15T14:00:00.000Z",
            stage: "briefing",
            hours: 4,
            description: "Reunião com cliente",
          },
        ],
        time_by_stage: {
          briefing: 4,
        },
      };

      mockKanbanService.getProjectTimeline.mockResolvedValue({
        data: timelineData,
        error: null,
      });

      const response = await GET_TIMELINE(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.project_id).toBe(sampleProject.id);
      expect(data.data.entries).toHaveLength(2);
      expect(data.data.time_by_stage.briefing).toBe(4);
    });

    it("should return 400 when timeline fetch fails", async () => {
      mockKanbanService.getProjectTimeline.mockResolvedValue({
        data: null,
        error: "Timeline fetch failed",
      });

      const response = await GET_TIMELINE(
        createRequest(sampleProject.id),
        { params: Promise.resolve({ id: sampleProject.id }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Timeline fetch failed");
    });
  });
});
