"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import type {
  DashboardStats,
  RecentProject,
  FinanceSummary,
  OrganizationData,
  TeamData,
  OfficeTotals,
  ActiveService,
  ProcessFlowCounts,
} from "../types";
import type { BudgetWithClient } from "@/modules/budgets";

interface RecentBudget {
  id: string;
  code: string;
  status: string;
  final_price: number;
  client_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentProjects: RecentProject[];
  recentBudgets: RecentBudget[];
  financeSummary: FinanceSummary | null;
  organization: OrganizationData | null;
  team: TeamData | null;
  officeTotals: OfficeTotals | null;
  services: ActiveService[];
  processFlow: ProcessFlowCounts | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Get start and end dates for the current month
 */
function getCurrentMonthDates(): { startDate: string; endDate: string } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

/**
 * Calculate office totals from organization and team data
 */
function calculateOfficeTotals(
  org: OrganizationData | null,
  team: TeamData | null
): OfficeTotals | null {
  if (!org || !team) return null;

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

/**
 * Custom hook for fetching and managing dashboard data
 */
export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentBudgets, setRecentBudgets] = useState<RecentBudget[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [services, setServices] = useState<ActiveService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate office totals from organization and team
  const officeTotals = useMemo(
    () => calculateOfficeTotals(organization, team),
    [organization, team]
  );

  // Calculate process flow counts from stats
  const processFlow = useMemo<ProcessFlowCounts | null>(() => {
    if (!stats) return null;

    const budgetsDraftOrSent =
      (stats.budgets.byStatus.draft ?? 0) + (stats.budgets.byStatus.sent ?? 0);
    const budgetsSent = stats.budgets.byStatus.sent ?? 0;
    const activeProjects = stats.projects.activeCount ?? 0;
    // For financeiro, use pending income from financeSummary if available
    const pendingFinance = financeSummary?.income.byPaymentStatus.pending ? 1 : 0;

    return {
      orcamento: budgetsDraftOrSent,
      aprovacao: budgetsSent,
      projeto: activeProjects,
      financeiro: pendingFinance > 0 ? budgetsDraftOrSent : 0, // Approximation
    };
  }, [stats, financeSummary]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getCurrentMonthDates();

      // Fetch all data in parallel
      const [
        statsRes,
        projectsRes,
        budgetsRes,
        financeRes,
        orgRes,
        teamRes,
        servicesRes,
      ] = await Promise.allSettled([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/projects/recent?limit=5"),
        fetch("/api/budgets?limit=5&sortBy=created_at&sortOrder=desc"),
        fetch(`/api/dashboard/finance/summary?startDate=${startDate}&endDate=${endDate}`),
        fetch("/api/organization"),
        fetch("/api/organization/team"),
        fetch("/api/organization/services"),
      ]);

      // Process stats response
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const statsData = await statsRes.value.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Process recent projects response
      if (projectsRes.status === "fulfilled" && projectsRes.value.ok) {
        const projectsData = await projectsRes.value.json();
        if (projectsData.success) {
          setRecentProjects(projectsData.data || []);
        }
      }

      // Process budgets response
      if (budgetsRes.status === "fulfilled" && budgetsRes.value.ok) {
        const budgetsData = await budgetsRes.value.json();
        if (budgetsData.success && budgetsData.data) {
          const mapped: RecentBudget[] = budgetsData.data.map((b: BudgetWithClient) => ({
            id: b.id,
            code: b.code,
            status: b.status,
            final_price: (b.calculation as { final_price?: number })?.final_price ?? 0,
            client_name: b.client?.name ?? null,
            created_at: b.created_at,
            updated_at: b.updated_at,
          }));
          setRecentBudgets(mapped);
        }
      }

      // Process finance summary response
      if (financeRes.status === "fulfilled" && financeRes.value.ok) {
        const financeData = await financeRes.value.json();
        if (financeData.success) {
          setFinanceSummary(financeData.data);
        }
      }

      // Process organization response
      if (orgRes.status === "fulfilled" && orgRes.value.ok) {
        const orgData = await orgRes.value.json();
        if (orgData.success) {
          setOrganization(orgData.data);
        }
      }

      // Process team response
      if (teamRes.status === "fulfilled" && teamRes.value.ok) {
        const teamData = await teamRes.value.json();
        if (teamData.success) {
          setTeam(teamData.data);
        }
      }

      // Process services response
      if (servicesRes.status === "fulfilled" && servicesRes.value.ok) {
        const servicesData = await servicesRes.value.json();
        if (servicesData.success) {
          setServices(servicesData.data || []);
        }
      }

      // Check for any errors
      const allFailed =
        statsRes.status === "rejected" &&
        projectsRes.status === "rejected" &&
        budgetsRes.status === "rejected" &&
        financeRes.status === "rejected";

      if (allFailed) {
        setError("Falha ao carregar dados do dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentProjects,
    recentBudgets,
    financeSummary,
    organization,
    team,
    officeTotals,
    services,
    processFlow,
    isLoading,
    error,
    refresh: fetchDashboardData,
  };
}
