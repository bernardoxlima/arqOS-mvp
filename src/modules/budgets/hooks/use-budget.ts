"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  BudgetStatus,
  BudgetItem,
  BudgetCalculation,
  BudgetDetails,
  BudgetPaymentTerms,
  AddBudgetItemData,
  UpdateBudgetItemData,
} from "../types";

export interface BudgetDetail {
  id: string;
  code: string;
  status: BudgetStatus;
  serviceType: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  details: BudgetDetails;
  calculation: BudgetCalculation;
  paymentTerms: BudgetPaymentTerms;
  scope: string[];
  notes: string | null;
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UseBudgetReturn {
  budget: BudgetDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refresh: () => void;
  updateStatus: (status: BudgetStatus) => Promise<boolean>;
  addItem: (item: AddBudgetItemData) => Promise<boolean>;
  updateItem: (item: UpdateBudgetItemData) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  updateBudget: (data: Partial<{
    details: Partial<BudgetDetails>;
    calculation: Partial<BudgetCalculation>;
    paymentTerms: Partial<BudgetPaymentTerms>;
    scope: string[];
    notes: string;
  }>) => Promise<boolean>;
}

/**
 * Custom hook for fetching and managing a single budget
 */
export function useBudget(budgetId: string): UseBudgetReturn {
  const [budget, setBudget] = useState<BudgetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!budgetId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/budgets/${budgetId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao carregar orcamento");
      }

      if (data.success && data.data) {
        const b = data.data;
        const details = (b.details || {}) as BudgetDetails;
        const calculation = (b.calculation || {}) as BudgetCalculation;
        const paymentTerms = (b.payment_terms || {}) as BudgetPaymentTerms;
        const client = b.client as { id: string; name: string; contact?: { email?: string; phone?: string } } | null;

        setBudget({
          id: b.id,
          code: b.code,
          status: b.status as BudgetStatus,
          serviceType: b.service_type,
          client: client
            ? {
                id: client.id,
                name: client.name,
                email: (client.contact as { email?: string })?.email,
                phone: (client.contact as { phone?: string })?.phone,
              }
            : null,
          details,
          calculation,
          paymentTerms,
          scope: b.scope || [],
          notes: b.notes,
          items: details.items || [],
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, [budgetId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const updateStatus = useCallback(
    async (status: BudgetStatus): Promise<boolean> => {
      if (!budgetId) return false;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/budgets/${budgetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao atualizar status");
        }

        await fetchBudget();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [budgetId, fetchBudget]
  );

  const addItem = useCallback(
    async (item: AddBudgetItemData): Promise<boolean> => {
      if (!budgetId) return false;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/budgets/${budgetId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao adicionar item");
        }

        await fetchBudget();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [budgetId, fetchBudget]
  );

  const updateItem = useCallback(
    async (item: UpdateBudgetItemData): Promise<boolean> => {
      if (!budgetId) return false;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/budgets/${budgetId}/items`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao atualizar item");
        }

        await fetchBudget();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [budgetId, fetchBudget]
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!budgetId) return false;

      setIsSaving(true);
      try {
        const response = await fetch(
          `/api/budgets/${budgetId}/items?itemId=${itemId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Falha ao remover item");
        }

        await fetchBudget();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [budgetId, fetchBudget]
  );

  const updateBudget = useCallback(
    async (
      data: Partial<{
        details: Partial<BudgetDetails>;
        calculation: Partial<BudgetCalculation>;
        paymentTerms: Partial<BudgetPaymentTerms>;
        scope: string[];
        notes: string;
      }>
    ): Promise<boolean> => {
      if (!budgetId) return false;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/budgets/${budgetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const respData = await response.json();
          throw new Error(respData.error || "Falha ao atualizar orcamento");
        }

        await fetchBudget();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [budgetId, fetchBudget]
  );

  return {
    budget,
    isLoading,
    isSaving,
    error,
    refresh: fetchBudget,
    updateStatus,
    addItem,
    updateItem,
    removeItem,
    updateBudget,
  };
}
