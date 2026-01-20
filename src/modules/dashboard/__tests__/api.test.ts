import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the dashboard service
vi.mock("@/modules/dashboard/services/dashboard.service", () => ({
  getDashboardStats: vi.fn(),
  getRecentProjects: vi.fn(),
  getFinanceSummary: vi.fn(),
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
        data: { id: "profile-123", organization_id: "org-123" },
        error: null,
      }),
    })),
  })),
}));

// Import route handlers after mocking
import { GET as GET_STATS } from "@/app/api/dashboard/stats/route";
import { GET as GET_RECENT_PROJECTS } from "@/app/api/dashboard/projects/recent/route";
import { GET as GET_FINANCE_SUMMARY } from "@/app/api/dashboard/finance/summary/route";

import * as dashboardService from "@/modules/dashboard/services/dashboard.service";

const mockDashboardService = dashboardService as unknown as {
  getDashboardStats: ReturnType<typeof vi.fn>;
  getRecentProjects: ReturnType<typeof vi.fn>;
  getFinanceSummary: ReturnType<typeof vi.fn>;
};

// Sample data for testing
const sampleDashboardStats = {
  projects: {
    total: 15,
    byStatus: { draft: 2, active: 8, paused: 1, completed: 4, cancelled: 0 },
    byServiceType: { decorexpress: 10, producao: 3, projetexpress: 2 },
    activeCount: 8,
    completedThisMonth: 2,
  },
  budgets: {
    total: 20,
    byStatus: { draft: 5, sent: 8, approved: 5, rejected: 2 },
    approvalRate: 0.71,
    avgValue: 15000.5,
    pendingValue: 85000,
  },
  presentations: {
    total: 12,
    byStatus: { draft: 3, in_progress: 5, review: 2, approved: 2, archived: 0 },
    inProgressCount: 5,
  },
  hours: {
    totalThisMonth: 120.5,
    byProject: [
      { projectId: "proj-1", projectCode: "ARQ-25001", hours: 40 },
      { projectId: "proj-2", projectCode: "ARQ-25002", hours: 35.5 },
      { projectId: "proj-3", projectCode: "ARQ-25003", hours: 25 },
    ],
  },
};

const sampleRecentProjects = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    code: "ARQ-25001",
    status: "active",
    stage: "projeto",
    serviceType: "decorexpress",
    client: { id: "client-1", name: "Maria Silva" },
    financials: { value: 15000, hoursUsed: 20 },
    updatedAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    code: "ARQ-25002",
    status: "active",
    stage: "briefing",
    serviceType: "producao",
    client: null,
    financials: null,
    updatedAt: "2026-01-19T15:30:00.000Z",
  },
];

const sampleFinanceSummary = {
  period: {
    start: "2026-01-01",
    end: "2026-01-31",
  },
  income: {
    total: 50000,
    byCategory: { projeto: 30000, producao: 15000, consultoria: 5000 },
    byPaymentStatus: { paid: 35000, pending: 10000, overdue: 5000 },
  },
  expenses: {
    total: 15000,
    byCategory: { materiais: 8000, software: 3000, marketing: 4000 },
  },
  balance: 20000,
  projectsRevenue: [
    { projectId: "proj-1", projectCode: "ARQ-25001", value: 15000 },
    { projectId: "proj-2", projectCode: "ARQ-25002", value: 12000 },
  ],
};

describe("Dashboard API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // GET /api/dashboard/stats
  // ===========================================================================
  describe("GET /api/dashboard/stats", () => {
    it("should return dashboard statistics", async () => {
      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: sampleDashboardStats,
        error: null,
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(sampleDashboardStats);
    });

    it("should return project statistics correctly", async () => {
      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: sampleDashboardStats,
        error: null,
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(data.data.projects.total).toBe(15);
      expect(data.data.projects.activeCount).toBe(8);
      expect(data.data.projects.completedThisMonth).toBe(2);
      expect(data.data.projects.byStatus.active).toBe(8);
    });

    it("should return budget statistics correctly", async () => {
      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: sampleDashboardStats,
        error: null,
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(data.data.budgets.total).toBe(20);
      expect(data.data.budgets.approvalRate).toBe(0.71);
      expect(data.data.budgets.avgValue).toBe(15000.5);
      expect(data.data.budgets.pendingValue).toBe(85000);
    });

    it("should return presentation statistics correctly", async () => {
      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: sampleDashboardStats,
        error: null,
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(data.data.presentations.total).toBe(12);
      expect(data.data.presentations.inProgressCount).toBe(5);
    });

    it("should return hours statistics correctly", async () => {
      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: sampleDashboardStats,
        error: null,
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(data.data.hours.totalThisMonth).toBe(120.5);
      expect(data.data.hours.byProject).toHaveLength(3);
      expect(data.data.hours.byProject[0].projectCode).toBe("ARQ-25001");
    });

    it("should return empty stats when no data", async () => {
      const emptyStats = {
        projects: {
          total: 0,
          byStatus: {},
          byServiceType: {},
          activeCount: 0,
          completedThisMonth: 0,
        },
        budgets: {
          total: 0,
          byStatus: {},
          approvalRate: 0,
          avgValue: 0,
          pendingValue: 0,
        },
        presentations: {
          total: 0,
          byStatus: {},
          inProgressCount: 0,
        },
        hours: {
          totalThisMonth: 0,
          byProject: [],
        },
      };

      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: emptyStats,
        error: null,
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.projects.total).toBe(0);
      expect(data.data.budgets.total).toBe(0);
    });

    it("should return 500 on service error", async () => {
      mockDashboardService.getDashboardStats.mockResolvedValue({
        data: null,
        error: { message: "Database connection failed" },
      });

      const response = await GET_STATS();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database connection failed");
    });
  });

  // ===========================================================================
  // GET /api/dashboard/projects/recent
  // ===========================================================================
  describe("GET /api/dashboard/projects/recent", () => {
    const createRequest = (searchParams: Record<string, string> = {}) => {
      const url = new URL("http://localhost:3000/api/dashboard/projects/recent");
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return new NextRequest(url);
    };

    it("should return recent projects with default limit", async () => {
      mockDashboardService.getRecentProjects.mockResolvedValue({
        data: sampleRecentProjects,
        error: null,
      });

      const response = await GET_RECENT_PROJECTS(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(mockDashboardService.getRecentProjects).toHaveBeenCalledWith(10);
    });

    it("should return recent projects with custom limit", async () => {
      mockDashboardService.getRecentProjects.mockResolvedValue({
        data: sampleRecentProjects.slice(0, 1),
        error: null,
      });

      const response = await GET_RECENT_PROJECTS(createRequest({ limit: "5" }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDashboardService.getRecentProjects).toHaveBeenCalledWith(5);
    });

    it("should return project with client data", async () => {
      mockDashboardService.getRecentProjects.mockResolvedValue({
        data: sampleRecentProjects,
        error: null,
      });

      const response = await GET_RECENT_PROJECTS(createRequest());
      const data = await response.json();

      const projectWithClient = data.data[0];
      expect(projectWithClient.client).toEqual({ id: "client-1", name: "Maria Silva" });
      expect(projectWithClient.financials).toEqual({ value: 15000, hoursUsed: 20 });
    });

    it("should return project without client data", async () => {
      mockDashboardService.getRecentProjects.mockResolvedValue({
        data: sampleRecentProjects,
        error: null,
      });

      const response = await GET_RECENT_PROJECTS(createRequest());
      const data = await response.json();

      const projectWithoutClient = data.data[1];
      expect(projectWithoutClient.client).toBeNull();
      expect(projectWithoutClient.financials).toBeNull();
    });

    it("should return empty array when no projects", async () => {
      mockDashboardService.getRecentProjects.mockResolvedValue({
        data: [],
        error: null,
      });

      const response = await GET_RECENT_PROJECTS(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it("should return 400 for invalid limit (below minimum)", async () => {
      const response = await GET_RECENT_PROJECTS(createRequest({ limit: "0" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parâmetros inválidos");
    });

    it("should return 400 for invalid limit (above maximum)", async () => {
      const response = await GET_RECENT_PROJECTS(createRequest({ limit: "100" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should return 400 for non-numeric limit", async () => {
      const response = await GET_RECENT_PROJECTS(createRequest({ limit: "abc" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should return 500 on service error", async () => {
      mockDashboardService.getRecentProjects.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const response = await GET_RECENT_PROJECTS(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database error");
    });
  });

  // ===========================================================================
  // GET /api/dashboard/finance/summary
  // ===========================================================================
  describe("GET /api/dashboard/finance/summary", () => {
    const createRequest = (searchParams: Record<string, string> = {}) => {
      const url = new URL("http://localhost:3000/api/dashboard/finance/summary");
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return new NextRequest(url);
    };

    it("should return finance summary with default period", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(sampleFinanceSummary);
      expect(mockDashboardService.getFinanceSummary).toHaveBeenCalledWith(undefined, undefined);
    });

    it("should return finance summary with custom date range", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(
        createRequest({ startDate: "2026-01-01", endDate: "2026-01-31" })
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDashboardService.getFinanceSummary).toHaveBeenCalledWith(
        "2026-01-01",
        "2026-01-31"
      );
    });

    it("should return income breakdown correctly", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(data.data.income.total).toBe(50000);
      expect(data.data.income.byCategory.projeto).toBe(30000);
      expect(data.data.income.byPaymentStatus.paid).toBe(35000);
      expect(data.data.income.byPaymentStatus.pending).toBe(10000);
      expect(data.data.income.byPaymentStatus.overdue).toBe(5000);
    });

    it("should return expenses breakdown correctly", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(data.data.expenses.total).toBe(15000);
      expect(data.data.expenses.byCategory.materiais).toBe(8000);
    });

    it("should return balance correctly", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(data.data.balance).toBe(20000);
    });

    it("should return projects revenue correctly", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(data.data.projectsRevenue).toHaveLength(2);
      expect(data.data.projectsRevenue[0].projectCode).toBe("ARQ-25001");
      expect(data.data.projectsRevenue[0].value).toBe(15000);
    });

    it("should return empty summary when no records", async () => {
      const emptySummary = {
        period: { start: "2026-01-01", end: "2026-01-31" },
        income: {
          total: 0,
          byCategory: {},
          byPaymentStatus: { paid: 0, pending: 0, overdue: 0 },
        },
        expenses: { total: 0, byCategory: {} },
        balance: 0,
        projectsRevenue: [],
      };

      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: emptySummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.income.total).toBe(0);
      expect(data.data.expenses.total).toBe(0);
      expect(data.data.balance).toBe(0);
    });

    it("should return 400 for invalid date format", async () => {
      const response = await GET_FINANCE_SUMMARY(createRequest({ startDate: "01-01-2026" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Parâmetros inválidos");
    });

    it("should return 400 for invalid endDate format", async () => {
      const response = await GET_FINANCE_SUMMARY(createRequest({ endDate: "invalid" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should accept startDate only", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest({ startDate: "2026-01-01" }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockDashboardService.getFinanceSummary).toHaveBeenCalledWith("2026-01-01", undefined);
    });

    it("should accept endDate only", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: sampleFinanceSummary,
        error: null,
      });

      const response = await GET_FINANCE_SUMMARY(createRequest({ endDate: "2026-01-31" }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockDashboardService.getFinanceSummary).toHaveBeenCalledWith(undefined, "2026-01-31");
    });

    it("should return 500 on service error", async () => {
      mockDashboardService.getFinanceSummary.mockResolvedValue({
        data: null,
        error: { message: "Finance records query failed" },
      });

      const response = await GET_FINANCE_SUMMARY(createRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Finance records query failed");
    });
  });
});
