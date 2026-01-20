"use client";

import { useCallback, useEffect, useState } from "react";
import type { BudgetStatus, BudgetWithClient, BudgetFilters } from "../types";

export interface BudgetListItem {
  id: string;
  code: string;
  status: BudgetStatus;
  serviceType: string;
  clientName: string | null;
  clientEmail: string | null;
  area: number;
  rooms: number;
  estimatedHours: number;
  finalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStats {
  total: number;
  draft: number;
  sent: number;
  approved: number;
  rejected: number;
  totalValue: number;
  approvedValue: number;
}

export interface UseBudgetsReturn {
  budgets: BudgetListItem[];
  stats: BudgetStats;
  isLoading: boolean;
  error: string | null;
  filters: BudgetFilters;
  setFilters: (filters: Partial<BudgetFilters>) => void;
  refresh: () => void;
}

function mapBudgetToListItem(budget: BudgetWithClient): BudgetListItem {
  const calculation = budget.calculation as {
    final_price?: number;
    estimated_hours?: number;
  } | null;
  const details = budget.details as {
    area?: number;
    rooms?: number;
  } | null;
  const client = budget.client as {
    name?: string;
    contact?: { email?: string };
  } | null;

  return {
    id: budget.id,
    code: budget.code,
    status: budget.status as BudgetStatus,
    serviceType: budget.service_type,
    clientName: client?.name ?? null,
    clientEmail: (client?.contact as { email?: string })?.email ?? null,
    area: details?.area ?? 0,
    rooms: details?.rooms ?? 0,
    estimatedHours: calculation?.estimated_hours ?? 0,
    finalPrice: calculation?.final_price ?? 0,
    createdAt: budget.created_at ?? '',
    updatedAt: budget.updated_at ?? '',
  };
}

/**
 * Custom hook for fetching and managing budgets list
 */
export function useBudgets(): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<BudgetListItem[]>([]);
  const [stats, setStats] = useState<BudgetStats>({
    total: 0,
    draft: 0,
    sent: 0,
    approved: 0,
    rejected: 0,
    totalValue: 0,
    approvedValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<BudgetFilters>({
    limit: 50,
    offset: 0,
  });

  const setFilters = useCallback((newFilters: Partial<BudgetFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.clientId) params.set("clientId", filters.clientId);
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.offset) params.set("offset", String(filters.offset));

      const response = await fetch(`/api/budgets?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar orcamentos");
      }

      if (data.success && data.data) {
        const mapped = data.data.map(mapBudgetToListItem);
        setBudgets(mapped);

        // Calculate stats
        const newStats: BudgetStats = {
          total: mapped.length,
          draft: mapped.filter((b: BudgetListItem) => b.status === "draft").length,
          sent: mapped.filter((b: BudgetListItem) => b.status === "sent").length,
          approved: mapped.filter((b: BudgetListItem) => b.status === "approved").length,
          rejected: mapped.filter((b: BudgetListItem) => b.status === "rejected").length,
          totalValue: mapped.reduce((sum: number, b: BudgetListItem) => sum + b.finalPrice, 0),
          approvedValue: mapped
            .filter((b: BudgetListItem) => b.status === "approved")
            .reduce((sum: number, b: BudgetListItem) => sum + b.finalPrice, 0),
        };
        setStats(newStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchBudgets,
  };
}
