"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  DashboardStats,
  RecentProject,
  FinanceSummary,
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
 * Custom hook for fetching and managing dashboard data
 */
export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentBudgets, setRecentBudgets] = useState<RecentBudget[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getCurrentMonthDates();

      // Fetch all data in parallel
      const [statsRes, projectsRes, budgetsRes, financeRes] = await Promise.allSettled([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/projects/recent?limit=5"),
        fetch("/api/budgets?limit=5&sortBy=created_at&sortOrder=desc"),
        fetch(`/api/dashboard/finance/summary?startDate=${startDate}&endDate=${endDate}`),
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
    isLoading,
    error,
    refresh: fetchDashboardData,
  };
}
