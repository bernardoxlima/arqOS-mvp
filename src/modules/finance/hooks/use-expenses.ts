'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseListResult,
} from '../types';

interface UseExpensesOptions {
  autoFetch?: boolean;
  initialFilters?: ExpenseFilters;
}

interface UseExpensesReturn {
  // Data
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalValue: number;
  byCategory: Record<ExpenseCategory, number>;

  // Filters
  filters: ExpenseFilters;
  setFilters: (filters: ExpenseFilters) => void;
  filterByCategory: (category: ExpenseCategory | 'all') => void;
  filterByStatus: (status: 'pending' | 'paid' | 'overdue' | 'all') => void;
  filterByDateRange: (startDate: string, endDate: string) => void;

  // CRUD
  addExpense: (data: CreateExpenseData) => Promise<boolean>;
  updateExpense: (id: string, data: UpdateExpenseData) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  // Actions
  refresh: () => Promise<void>;
}

export function useExpenses(options: UseExpensesOptions = {}): UseExpensesReturn {
  const { autoFetch = true, initialFilters = {} } = options;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [byCategory, setByCategory] = useState<Record<ExpenseCategory, number>>({
    fixo: 0,
    variavel: 0,
    salario: 0,
    imposto: 0,
  });
  const [filters, setFiltersState] = useState<ExpenseFilters>(initialFilters);

  // Build query string from filters
  const buildQueryString = useCallback((f: ExpenseFilters): string => {
    const params = new URLSearchParams();
    if (f.category && f.category !== 'all') {
      params.append('category', f.category);
    }
    if (f.status && f.status !== 'all') {
      params.append('status', f.status);
    }
    if (f.startDate) {
      params.append('startDate', f.startDate);
    }
    if (f.endDate) {
      params.append('endDate', f.endDate);
    }
    return params.toString();
  }, []);

  // Fetch expenses from API
  const fetchExpenses = useCallback(async (f: ExpenseFilters = filters) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(f);
      const url = `/api/finance/expenses${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar despesas');
      }

      const data: ExpenseListResult = await response.json();

      setExpenses(data.expenses);
      setTotalCount(data.totalCount);
      setTotalValue(data.totalValue);
      setByCategory(data.byCategory);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, buildQueryString]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchExpenses();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchExpenses(filters);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set filters
  const setFilters = useCallback((newFilters: ExpenseFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Filter by category
  const filterByCategory = useCallback((category: ExpenseCategory | 'all') => {
    setFiltersState((prev) => ({ ...prev, category }));
  }, []);

  // Filter by status
  const filterByStatus = useCallback((status: 'pending' | 'paid' | 'overdue' | 'all') => {
    setFiltersState((prev) => ({ ...prev, status }));
  }, []);

  // Filter by date range
  const filterByDateRange = useCallback((startDate: string, endDate: string) => {
    setFiltersState((prev) => ({ ...prev, startDate, endDate }));
  }, []);

  // Add expense
  const addExpense = useCallback(async (data: CreateExpenseData): Promise<boolean> => {
    try {
      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar despesa');
      }

      // Refresh list after adding
      await fetchExpenses();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar despesa';
      setError(message);
      return false;
    }
  }, [fetchExpenses]);

  // Update expense
  const updateExpense = useCallback(async (id: string, data: UpdateExpenseData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/finance/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar despesa');
      }

      // Refresh list after updating
      await fetchExpenses();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar despesa';
      setError(message);
      return false;
    }
  }, [fetchExpenses]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/finance/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir despesa');
      }

      // Refresh list after deleting
      await fetchExpenses();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir despesa';
      setError(message);
      return false;
    }
  }, [fetchExpenses]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    isLoading,
    error,
    totalCount,
    totalValue,
    byCategory,
    filters,
    setFilters,
    filterByCategory,
    filterByStatus,
    filterByDateRange,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh,
  };
}
