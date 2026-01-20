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
