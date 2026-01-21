"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type {
  DashboardStats,
  DashboardResult,
  RecentProject,
  FinanceSummary,
  ProjectStats,
  BudgetStats,
  PresentationStats,
  HoursStats,
  OrganizationData,
  OrganizationSettings,
  OrganizationCosts,
  TeamData,
  TeamMember,
  OfficeTotals,
  ActiveService,
  ProcessFlowCounts,
} from "../types";

// ============================================
// Helper Functions
// ============================================

/**
 * Get first day of current month
 */
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
}

/**
 * Get last day of current month
 */
function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
}

// ============================================
// Dashboard Stats
// ============================================

/**
 * Get project statistics
 */
async function getProjectStats(): Promise<DashboardResult<ProjectStats>> {
  const supabase = await createClient();
  const monthStart = getMonthStart();

  // Get all projects with their statuses
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, status, service_type, completed_at");

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Aggregate stats
  const byStatus: Record<string, number> = {};
  const byServiceType: Record<string, number> = {};
  let activeCount = 0;
  let completedThisMonth = 0;

  for (const project of projects || []) {
    // Count by status
    const status = project.status || "draft";
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Count by service type
    const serviceType = project.service_type || "unknown";
    byServiceType[serviceType] = (byServiceType[serviceType] || 0) + 1;

    // Count active
    if (status === "active") {
      activeCount++;
    }

    // Count completed this month
    if (
      status === "completed" &&
      project.completed_at &&
      project.completed_at >= monthStart
    ) {
      completedThisMonth++;
    }
  }

  return {
    data: {
      total: projects?.length || 0,
      byStatus,
      byServiceType,
      activeCount,
      completedThisMonth,
    },
    error: null,
  };
}

/**
 * Get budget statistics
 */
async function getBudgetStats(): Promise<DashboardResult<BudgetStats>> {
  const supabase = await createClient();

  // Get all budgets with their statuses and calculations
  const { data: budgets, error } = await supabase
    .from("budgets")
    .select("id, status, calculation");

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Aggregate stats
  const byStatus: Record<string, number> = {};
  let approvedCount = 0;
  let rejectedCount = 0;
  let totalValue = 0;
  let valueCount = 0;
  let pendingValue = 0;

  for (const budget of budgets || []) {
    // Count by status
    const status = budget.status || "draft";
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Get final_price from calculation JSONB
    const calculation = budget.calculation as { final_price?: number } | null;
    const finalPrice = calculation?.final_price || 0;

    // Track approval stats
    if (status === "approved") {
      approvedCount++;
    } else if (status === "rejected") {
      rejectedCount++;
    }

    // Track values
    if (finalPrice > 0) {
      totalValue += finalPrice;
      valueCount++;
    }

    // Pending value (draft + sent)
    if ((status === "draft" || status === "sent") && finalPrice > 0) {
      pendingValue += finalPrice;
    }
  }

  // Calculate approval rate
  const totalDecisions = approvedCount + rejectedCount;
  const approvalRate = totalDecisions > 0 ? approvedCount / totalDecisions : 0;

  // Calculate average value
  const avgValue = valueCount > 0 ? totalValue / valueCount : 0;

  return {
    data: {
      total: budgets?.length || 0,
      byStatus,
      approvalRate: Math.round(approvalRate * 100) / 100, // Round to 2 decimals
      avgValue: Math.round(avgValue * 100) / 100,
      pendingValue: Math.round(pendingValue * 100) / 100,
    },
    error: null,
  };
}

/**
 * Get presentation statistics
 */
async function getPresentationStats(): Promise<DashboardResult<PresentationStats>> {
  const supabase = await createClient();

  // Get all presentations with their statuses
  const { data: presentations, error } = await supabase
    .from("presentations")
    .select("id, status");

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Aggregate stats
  const byStatus: Record<string, number> = {};
  let inProgressCount = 0;

  for (const presentation of presentations || []) {
    // Count by status
    const status = presentation.status || "draft";
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Count in progress
    if (status === "in_progress") {
      inProgressCount++;
    }
  }

  return {
    data: {
      total: presentations?.length || 0,
      byStatus,
      inProgressCount,
    },
    error: null,
  };
}

/**
 * Get hours statistics for current month
 */
async function getHoursStats(): Promise<DashboardResult<HoursStats>> {
  const supabase = await createClient();
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  // Get time entries for current month with project info
  const { data: entries, error } = await supabase
    .from("time_entries")
    .select("hours, project_id")
    .gte("date", monthStart)
    .lte("date", monthEnd);

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Get project codes for the referenced projects
  const projectIds = [...new Set((entries || []).map((e) => e.project_id))];

  let projectCodeMap: Record<string, string> = {};
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, code")
      .in("id", projectIds);

    projectCodeMap = (projects || []).reduce(
      (acc, p) => ({ ...acc, [p.id]: p.code }),
      {} as Record<string, string>
    );
  }

  // Aggregate by project
  const hoursByProject: Record<string, number> = {};
  let totalThisMonth = 0;

  for (const entry of entries || []) {
    const hours = entry.hours || 0;
    totalThisMonth += hours;
    hoursByProject[entry.project_id] = (hoursByProject[entry.project_id] || 0) + hours;
  }

  // Convert to array format
  const byProject = Object.entries(hoursByProject)
    .map(([projectId, hours]) => ({
      projectId,
      projectCode: projectCodeMap[projectId] || "Unknown",
      hours: Math.round(hours * 100) / 100,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10); // Top 10 projects

  return {
    data: {
      totalThisMonth: Math.round(totalThisMonth * 100) / 100,
      byProject,
    },
    error: null,
  };
}

/**
 * Get combined dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardResult<DashboardStats>> {
  // Fetch all stats in parallel
  const [projectsResult, budgetsResult, presentationsResult, hoursResult] = await Promise.all([
    getProjectStats(),
    getBudgetStats(),
    getPresentationStats(),
    getHoursStats(),
  ]);

  // Check for errors
  if (projectsResult.error) {
    return { data: null, error: projectsResult.error };
  }
  if (budgetsResult.error) {
    return { data: null, error: budgetsResult.error };
  }
  if (presentationsResult.error) {
    return { data: null, error: presentationsResult.error };
  }
  if (hoursResult.error) {
    return { data: null, error: hoursResult.error };
  }

  return {
    data: {
      projects: projectsResult.data!,
      budgets: budgetsResult.data!,
      presentations: presentationsResult.data!,
      hours: hoursResult.data!,
    },
    error: null,
  };
}

// ============================================
// Recent Projects
// ============================================

/**
 * Get recent projects for dashboard
 */
export async function getRecentProjects(
  limit: number = 10
): Promise<DashboardResult<RecentProject[]>> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      code,
      status,
      stage,
      service_type,
      financials,
      updated_at,
      client:clients(id, name)
    `
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Transform to RecentProject format
  const recentProjects: RecentProject[] = (projects || []).map((project) => {
    const financials = project.financials as {
      value?: number;
      hours_used?: number;
    } | null;

    // Handle client which can be an object, array, or null from Supabase join
    let clientData: { id: string; name: string } | null = null;
    if (project.client) {
      const clientRaw = project.client as unknown;
      if (Array.isArray(clientRaw) && clientRaw.length > 0) {
        clientData = { id: clientRaw[0].id, name: clientRaw[0].name };
      } else if (typeof clientRaw === "object" && clientRaw !== null) {
        const c = clientRaw as { id?: string; name?: string };
        if (c.id && c.name) {
          clientData = { id: c.id, name: c.name };
        }
      }
    }

    return {
      id: project.id,
      code: project.code,
      status: project.status,
      stage: project.stage,
      serviceType: project.service_type,
      client: clientData,
      financials: financials
        ? {
            value: financials.value || 0,
            hoursUsed: financials.hours_used || 0,
          }
        : null,
      updatedAt: project.updated_at || "",
    };
  });

  return { data: recentProjects, error: null };
}

// ============================================
// Finance Summary
// ============================================

/**
 * Get finance summary for a period
 */
export async function getFinanceSummary(
  startDate?: string,
  endDate?: string
): Promise<DashboardResult<FinanceSummary>> {
  const supabase = await createClient();

  // Default to current month
  const start = startDate || getMonthStart();
  const end = endDate || getMonthEnd();

  // Get finance records for the period
  const { data: records, error } = await supabase
    .from("finance_records")
    .select("id, type, category, status, value, project_id, due_date")
    .gte("date", start)
    .lte("date", end);

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Get project codes for the referenced projects
  const projectIds = [...new Set((records || []).filter((r) => r.project_id).map((r) => r.project_id!))];

  let projectCodeMap: Record<string, string> = {};
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, code")
      .in("id", projectIds);

    projectCodeMap = (projects || []).reduce(
      (acc, p) => ({ ...acc, [p.id]: p.code }),
      {} as Record<string, string>
    );
  }

  // Aggregate income
  const incomeByCategory: Record<string, number> = {};
  let incomeTotal = 0;
  let incomePaid = 0;
  let incomePending = 0;
  let incomeOverdue = 0;

  // Aggregate expenses
  const expensesByCategory: Record<string, number> = {};
  let expensesTotal = 0;

  // Aggregate by project
  const revenueByProject: Record<string, number> = {};

  const today = new Date().toISOString().split("T")[0];

  for (const record of records || []) {
    const value = record.value || 0;
    const category = record.category || "other";
    const status = record.status || "pending";
    const type = record.type || "income";
    const isOverdue = record.due_date && record.due_date < today && status === "pending";

    if (type === "income") {
      incomeTotal += value;
      incomeByCategory[category] = (incomeByCategory[category] || 0) + value;

      if (status === "paid") {
        incomePaid += value;
      } else if (isOverdue) {
        incomeOverdue += value;
      } else {
        incomePending += value;
      }

      // Track by project
      if (record.project_id) {
        revenueByProject[record.project_id] = (revenueByProject[record.project_id] || 0) + value;
      }
    } else if (type === "expense") {
      expensesTotal += value;
      expensesByCategory[category] = (expensesByCategory[category] || 0) + value;
    }
  }

  // Convert projects revenue to array
  const projectsRevenue = Object.entries(revenueByProject)
    .map(([projectId, value]) => ({
      projectId,
      projectCode: projectCodeMap[projectId] || "Unknown",
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Calculate balance
  const balance = incomePaid - expensesTotal;

  return {
    data: {
      period: {
        start,
        end,
      },
      income: {
        total: Math.round(incomeTotal * 100) / 100,
        byCategory: Object.fromEntries(
          Object.entries(incomeByCategory).map(([k, v]) => [k, Math.round(v * 100) / 100])
        ),
        byPaymentStatus: {
          paid: Math.round(incomePaid * 100) / 100,
          pending: Math.round(incomePending * 100) / 100,
          overdue: Math.round(incomeOverdue * 100) / 100,
        },
      },
      expenses: {
        total: Math.round(expensesTotal * 100) / 100,
        byCategory: Object.fromEntries(
          Object.entries(expensesByCategory).map(([k, v]) => [k, Math.round(v * 100) / 100])
        ),
      },
      balance: Math.round(balance * 100) / 100,
      projectsRevenue,
    },
    error: null,
  };
}

// ============================================
// Organization Data
// ============================================

/**
 * Default costs structure
 */
const DEFAULT_COSTS: OrganizationCosts = {
  rent: 0,
  utilities: 0,
  software: 0,
  marketing: 0,
  accountant: 0,
  internet: 0,
  others: 0,
};

/**
 * Default settings structure
 */
const DEFAULT_SETTINGS: OrganizationSettings = {
  margin: 30,
  hour_value: 200,
  costs: DEFAULT_COSTS,
};

/**
 * Get organization data for the current user
 */
export async function getOrganizationData(
  organizationId: string
): Promise<DashboardResult<OrganizationData>> {
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, slug, settings")
    .eq("id", organizationId)
    .single();

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  if (!org) {
    return { data: null, error: { message: "Organization not found" } };
  }

  // Parse settings from JSONB with defaults
  const rawSettings = (org.settings || {}) as Partial<OrganizationSettings>;
  const rawCosts = (rawSettings.costs || {}) as Partial<OrganizationCosts>;

  const settings: OrganizationSettings = {
    margin: rawSettings.margin ?? DEFAULT_SETTINGS.margin,
    hour_value: rawSettings.hour_value ?? DEFAULT_SETTINGS.hour_value,
    costs: {
      rent: rawCosts.rent ?? DEFAULT_COSTS.rent,
      utilities: rawCosts.utilities ?? DEFAULT_COSTS.utilities,
      software: rawCosts.software ?? DEFAULT_COSTS.software,
      marketing: rawCosts.marketing ?? DEFAULT_COSTS.marketing,
      accountant: rawCosts.accountant ?? DEFAULT_COSTS.accountant,
      internet: rawCosts.internet ?? DEFAULT_COSTS.internet,
      others: rawCosts.others ?? DEFAULT_COSTS.others,
    },
  };

  return {
    data: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      settings,
    },
    error: null,
  };
}

// ============================================
// Team Data
// ============================================

/**
 * Get team members for an organization
 */
export async function getTeamData(
  organizationId: string
): Promise<DashboardResult<TeamData>> {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, settings, metadata")
    .eq("organization_id", organizationId);

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Map profiles to team members
  const members: TeamMember[] = (profiles || []).map((profile) => {
    const settings = (profile.settings || {}) as { avatar_url?: string | null };
    const metadata = (profile.metadata || {}) as { salary?: number | null; monthly_hours?: number };

    return {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role as TeamMember["role"],
      avatar_url: settings.avatar_url ?? null,
      salary: metadata.salary ?? null,
      monthly_hours: metadata.monthly_hours ?? 160,
    };
  });

  // Calculate totals
  const salaries = members.reduce((sum, m) => sum + (m.salary || 0), 0);
  const hours = members.reduce((sum, m) => sum + m.monthly_hours, 0);
  const hourlyRate = hours > 0 ? salaries / hours : 0;

  return {
    data: {
      members,
      totals: {
        salaries: Math.round(salaries * 100) / 100,
        hours,
        hourly_rate: Math.round(hourlyRate * 100) / 100,
      },
    },
    error: null,
  };
}

// ============================================
// Office Totals
// ============================================

/**
 * Calculate office totals from organization and team data
 * Note: Made async to comply with "use server" file requirements
 */
export async function calculateOfficeTotals(
  org: OrganizationData,
  team: TeamData
): Promise<OfficeTotals> {
  const costs = org.settings.costs;
  const totalCosts =
    costs.rent +
    costs.utilities +
    costs.software +
    costs.marketing +
    costs.accountant +
    costs.internet +
    costs.others;

  const monthly = team.totals.salaries + totalCosts;
  const hourly = team.totals.hours > 0 ? monthly / team.totals.hours : 0;

  return {
    salaries: team.totals.salaries,
    costs: totalCosts,
    monthly: Math.round(monthly * 100) / 100,
    hourly: Math.round(hourly * 100) / 100,
  };
}

// ============================================
// Active Services
// ============================================

/**
 * Get active services from projects
 */
export async function getActiveServices(
  organizationId: string
): Promise<DashboardResult<ActiveService[]>> {
  const supabase = await createClient();

  // Get distinct service types from active/in-progress projects
  const { data: projects, error } = await supabase
    .from("projects")
    .select("service_type")
    .eq("organization_id", organizationId)
    .in("status", ["aguardando", "em_andamento"]);

  if (error) {
    return { data: null, error: { message: error.message, code: error.code } };
  }

  // Count by service type
  const countByType: Record<string, number> = {};
  for (const project of projects || []) {
    const type = project.service_type || "unknown";
    countByType[type] = (countByType[type] || 0) + 1;
  }

  // Convert to array
  const services: ActiveService[] = Object.entries(countByType)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return { data: services, error: null };
}

// ============================================
// Process Flow Counts
// ============================================

/**
 * Get process flow counts for the pipeline visualization
 */
export async function getProcessFlowCounts(
  organizationId: string
): Promise<DashboardResult<ProcessFlowCounts>> {
  const supabase = await createClient();

  // Fetch budgets and projects in parallel
  const [budgetsRes, projectsRes, financeRes] = await Promise.all([
    supabase
      .from("budgets")
      .select("status")
      .eq("organization_id", organizationId),
    supabase
      .from("projects")
      .select("status")
      .eq("organization_id", organizationId),
    supabase
      .from("finance_records")
      .select("status")
      .eq("organization_id", organizationId)
      .eq("type", "income"),
  ]);

  if (budgetsRes.error) {
    return { data: null, error: { message: budgetsRes.error.message, code: budgetsRes.error.code } };
  }
  if (projectsRes.error) {
    return { data: null, error: { message: projectsRes.error.message, code: projectsRes.error.code } };
  }

  const budgets = budgetsRes.data || [];
  const projects = projectsRes.data || [];
  const financeRecords = financeRes.data || [];

  // Count budgets in draft/sent (orcamento stage)
  const orcamento = budgets.filter((b) => b.status === "draft" || b.status === "sent").length;

  // Count budgets waiting approval (sent status)
  const aprovacao = budgets.filter((b) => b.status === "sent").length;

  // Count active projects
  const projeto = projects.filter((p) => p.status === "em_andamento" || p.status === "aguardando").length;

  // Count pending financial records
  const financeiro = financeRecords.filter((f) => f.status === "pending").length;

  return {
    data: {
      orcamento,
      aprovacao,
      projeto,
      financeiro,
    },
    error: null,
  };
}
